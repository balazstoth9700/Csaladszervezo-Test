const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const { familyId, excludeUserId, title, body, url } = JSON.parse(
      event.body
    );

    if (!familyId || !title) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "familyId és title kötelező" }),
      };
    }

    const db = admin.firestore();

    // Család tagjainak lekérése
    const familySnap = await db.collection("families").doc(familyId).get();
    if (!familySnap.exists) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Család nem található" }),
      };
    }

    const familyData = familySnap.data();
    const members = familyData.members || [];

    // Minden tag tokenjeinek összegyűjtése (a küldő kivételével)
    const tokenOwners = []; // { uid, token }
    for (const member of members) {
      if (!member.userId) continue;
      if (excludeUserId && member.userId === excludeUserId) continue;
      try {
        const userSnap = await db.collection("users").doc(member.userId).get();
        if (!userSnap.exists) continue;
        const ud = userSnap.data();
        // Push kikapcsolva az adott felhasználónál?
        if (ud.pushEnabled === false) continue;
        const tokens = Array.isArray(ud.fcmTokens) ? ud.fcmTokens : [];
        tokens.forEach((t) => {
          if (t) tokenOwners.push({ uid: member.userId, token: t });
        });
      } catch (e) {
        console.warn("User token lekérési hiba:", member.userId, e.message);
      }
    }

    if (tokenOwners.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, sent: 0, note: "Nincs címzett token" }),
      };
    }

    const uniqueTokens = [...new Set(tokenOwners.map((t) => t.token))];

    const message = {
      tokens: uniqueTokens,
      notification: { title, body: body || "" },
      webpush: {
        notification: {
          title,
          body: body || "",
          icon: "/favicon.ico",
          badge: "/favicon.ico",
        },
        fcmOptions: {
          link: url || "/",
        },
      },
      data: {
        url: url || "/",
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    // Érvénytelen tokenek kigyűjtése és törlése
    const invalidTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const code = resp.error?.code || "";
        if (
          code === "messaging/registration-token-not-registered" ||
          code === "messaging/invalid-registration-token" ||
          code === "messaging/invalid-argument"
        ) {
          invalidTokens.push(uniqueTokens[idx]);
        }
      }
    });

    // Érvénytelen tokenek eltávolítása a megfelelő user dokumentumokból
    if (invalidTokens.length > 0) {
      const affectedUids = [
        ...new Set(
          tokenOwners
            .filter((t) => invalidTokens.includes(t.token))
            .map((t) => t.uid)
        ),
      ];
      for (const uid of affectedUids) {
        try {
          const userRef = db.collection("users").doc(uid);
          const userSnap = await userRef.get();
          const ud = userSnap.data() || {};
          const cleaned = (ud.fcmTokens || []).filter(
            (t) => !invalidTokens.includes(t)
          );
          await userRef.update({ fcmTokens: cleaned });
        } catch (e) {
          console.warn("Token tisztítási hiba:", uid, e.message);
        }
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        sent: response.successCount,
        failed: response.failureCount,
        cleanedTokens: invalidTokens.length,
      }),
    };
  } catch (error) {
    console.error("send-push hiba:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
