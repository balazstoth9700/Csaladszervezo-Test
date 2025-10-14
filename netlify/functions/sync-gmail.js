const { google } = require("googleapis");
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
    const { email, userId } = JSON.parse(event.body);

    const accountDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("googleAccounts")
      .doc(email)
      .get();

    if (!accountDoc.exists) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Fiók nem található" }),
      };
    }

    const accountData = accountDoc.data();

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accountData.accessToken,
      refresh_token: accountData.refreshToken,
      expiry_date: accountData.expiryDate,
    });

    if (Date.now() >= accountData.expiryDate) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      await accountDoc.ref.update({
        accessToken: credentials.access_token,
        expiryDate: credentials.expiry_date,
      });
      oauth2Client.setCredentials(credentials);
    }

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 100,
      q: "in:inbox is:unread",
    });

    await accountDoc.ref.update({
      lastSync: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        messages: response.data.messages || [],
        count: response.data.messages?.length || 0,
      }),
    };
  } catch (error) {
    console.error("Error syncing Gmail:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
