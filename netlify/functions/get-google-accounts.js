const admin = require("firebase-admin");

function getFirebasePrivateKey() {
  const raw = (process.env.FIREBASE_PRIVATE_KEY || "").trim();
  if (!raw) return "";
  const cleaned = raw
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\\n/g, "")
    .replace(/\s/g, "");
  if (!cleaned) return "";
  const lines = [];
  for (let i = 0; i < cleaned.length; i += 64) {
    lines.push(cleaned.substring(i, i + 64));
  }
  return `-----BEGIN PRIVATE KEY-----\n${lines.join("\n")}\n-----END PRIVATE KEY-----\n`;
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: getFirebasePrivateKey(),
    }),
  });
}

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const { userId } = JSON.parse(event.body);

    const snapshot = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("googleAccounts")
      .get();

    const accounts = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      accounts.push({
        id: doc.id,
        email: data.email,
        service: data.service,
        syncEnabled: data.syncEnabled,
        lastSync: data.lastSync?.toDate().toISOString(),
        connected: true,
      });
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, accounts }),
    };
  } catch (error) {
    console.error("Error getting accounts:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
