const admin = require("firebase-admin");

function getFirebasePrivateKey() {
  const raw = process.env.FIREBASE_PRIVATE_KEY || "";
  if (!raw) return "";
  if (raw.includes("BEGIN PRIVATE KEY")) return raw.replace(/\\n/g, "\n");
  return `-----BEGIN PRIVATE KEY-----\n${raw.replace(/\s/g, "")}\n-----END PRIVATE KEY-----\n`;
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
    "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const { email, userId } = JSON.parse(event.body);

    await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("googleAccounts")
      .doc(email)
      .delete();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("Error removing account:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
