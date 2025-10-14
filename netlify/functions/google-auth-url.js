const { google } = require("googleapis");

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  // OPTIONS request kezelése (CORS preflight)
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const { email, service, userId } = event.queryStringParameters;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const scopes =
      service === "calendar"
        ? [
            "https://www.googleapis.com/auth/calendar.readonly",
            "https://www.googleapis.com/auth/calendar.events",
          ]
        : ["https://www.googleapis.com/auth/gmail.readonly"];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      login_hint: email,
      prompt: "consent",
      state: JSON.stringify({ email, service, userId }),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ authUrl }),
    };
  } catch (error) {
    console.error("Error generating auth URL:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
