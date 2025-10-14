const { google } = require("googleapis");
const admin = require("firebase-admin");

// Firebase Admin inicializálás
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
  try {
    const { code, state } = event.queryStringParameters;
    const { email, service, userId } = JSON.parse(state);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    // Token mentése Firestore-ba
    await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("googleAccounts")
      .doc(email)
      .set({
        email,
        service,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        syncEnabled: true,
      });

    // Sikeres HTML oldal
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Sikeres bejelentkezés</title>
            <meta charset="UTF-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 48px;
                border-radius: 16px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                max-width: 400px;
                animation: slideIn 0.5s ease-out;
              }
              @keyframes slideIn {
                from { transform: translateY(-30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
              .success-icon {
                font-size: 72px;
                margin-bottom: 24px;
                animation: bounce 1s ease;
              }
              @keyframes bounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
              }
              h1 {
                color: #1a202c;
                margin-bottom: 12px;
                font-size: 24px;
              }
              p {
                color: #4a5568;
                margin-bottom: 24px;
                line-height: 1.6;
              }
              .email {
                color: #667eea;
                font-weight: 600;
              }
              .close-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 14px 32px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 600;
                transition: transform 0.2s;
              }
              .close-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
              }
              .countdown {
                color: #718096;
                font-size: 14px;
                margin-top: 16px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="success-icon">✅</div>
              <h1>Sikeres bejelentkezés!</h1>
              <p>
                A <span class="email">${email}</span> fiók sikeresen hozzáadva
                a ${
                  service === "calendar" ? "Google Calendar" : "Gmail"
                } szolgáltatáshoz.
              </p>
              <button class="close-btn" onclick="window.close()">
                Ablak bezárása
              </button>
              <p class="countdown">
                Az ablak automatikusan bezáródik <span id="timer">3</span> másodperc múlva...
              </p>
            </div>
            <script>
              let seconds = 3;
              const timer = document.getElementById('timer');
              
              const countdown = setInterval(() => {
                seconds--;
                timer.textContent = seconds;
                
                if (seconds <= 0) {
                  clearInterval(countdown);
                  window.close();
                }
              }, 1000);
            </script>
          </body>
        </html>
      `,
    };
  } catch (error) {
    console.error("Error in callback:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/html" },
      body: `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Hiba</title>
            <meta charset="UTF-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: linear-gradient(135deg, #f56565 0%, #c53030 100%);
              }
              .container {
                background: white;
                padding: 48px;
                border-radius: 16px;
                text-align: center;
                max-width: 400px;
              }
              .error-icon { font-size: 72px; margin-bottom: 24px; }
              h1 { color: #e53e3e; margin-bottom: 12px; }
              p { color: #4a5568; margin-bottom: 24px; }
              .close-btn {
                background: #e53e3e;
                color: white;
                border: none;
                padding: 14px 32px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 600;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error-icon">❌</div>
              <h1>Hiba történt</h1>
              <p>${error.message}</p>
              <button class="close-btn" onclick="window.close()">Bezárás</button>
            </div>
          </body>
        </html>
      `,
    };
  }
};
