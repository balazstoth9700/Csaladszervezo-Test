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
