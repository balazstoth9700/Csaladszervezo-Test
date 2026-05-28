const { google } = require('googleapis');
const admin = require('firebase-admin');

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

// Firebase Admin inicializálás
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: getFirebasePrivateKey(),
      }),
    });
  } catch (error) {
    console.error('Firebase init error:', error);
  }
}

const db = admin.firestore();

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // DEBUG: Logoljuk az összes bejövő adatot
    console.log('📥 Event httpMethod:', event.httpMethod);
    console.log('📥 Event queryStringParameters:', JSON.stringify(event.queryStringParameters));
    console.log('📥 Event headers:', JSON.stringify(event.headers));
    console.log('📥 Event path:', event.path);

    // Query paraméterek biztonságos kiolvasása
    const queryParams = event.queryStringParameters || {};
    const { code, state, error: oauthError } = queryParams;

    console.log('🔍 Code:', code ? 'Present' : 'Missing');
    console.log('🔍 State:', state ? state : 'Missing');
    console.log('🔍 OAuth Error:', oauthError);

    // Ha a felhasználó elutasította
    if (oauthError) {
      console.error('❌ OAuth error:', oauthError);
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'text/html',
        },
        body: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Hitelesítés megszakítva</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                margin: 0;
                background: #f7fafc;
              }
              .container { 
                text-align: center; 
                padding: 40px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                max-width: 400px;
              }
              h1 { color: #e53e3e; margin-bottom: 20px; }
              p { color: #4a5568; margin-bottom: 30px; }
              button {
                background: #3182ce;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
              }
              button:hover { background: #2c5aa0; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ Hitelesítés megszakítva</h1>
              <p>A Google bejelentkezés megszakadt. Bezárhatod ezt az ablakot.</p>
              <button onclick="window.close()">Ablak bezárása</button>
            </div>
            <script>
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
          </html>
        `,
      };
    }

    // Paraméterek ellenőrzése
    if (!code) {
      throw new Error('Hiányzó authorization code');
    }

    if (!state) {
      throw new Error('Hiányzó state paraméter - a Google nem küldte vissza');
    }

    // State dekódolás BIZTONSÁGOSAN
    let parsedState;
    try {
      parsedState = JSON.parse(state);
      console.log('✅ State parsed:', parsedState);
    } catch (parseError) {
      console.error('❌ State parse error:', parseError);
      throw new Error(`Nem sikerült dekódolni a state paramétert: ${state}`);
    }

    const { email, service, userId } = parsedState;

    if (!email || !service || !userId) {
      throw new Error(`Hiányzó adatok a state-ben: email=${email}, service=${service}, userId=${userId}`);
    }

    console.log('✅ Callback fogadva:', { email, service, userId });

    // Environment variables ellenőrzése
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Hiányzó Google OAuth credentials environment variables');
    }

    // OAuth2 kliens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    console.log('🔐 OAuth client created');

    // Token csere
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log('🔑 Tokens megszerzve:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiryDate: tokens.expiry_date
    });

    // Firebase ellenőrzés
    if (!process.env.FIREBASE_PROJECT_ID) {
      throw new Error('Hiányzó Firebase credentials');
    }

    // Tokens mentése Firestore-ba
    await db
      .collection('users')
      .doc(userId)
      .collection('googleAccounts')
      .doc(email)
      .set({
        email,
        service,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
        connected: true,
        syncEnabled: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastSync: null,
      });

    console.log('💾 Tokens elmentve Firestore-ba:', email);

    // Sikeres válasz HTML
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/html',
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Sikeres hitelesítés</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0;
              background: #f7fafc;
            }
            .container { 
              text-align: center; 
              padding: 40px;
              background: white;
              border-radius: 12px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              max-width: 400px;
            }
            h1 { color: #38a169; margin-bottom: 20px; }
            p { color: #4a5568; margin-bottom: 30px; }
            .spinner {
              border: 3px solid #e2e8f0;
              border-top: 3px solid #3182ce;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 20px auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Sikeres hitelesítés!</h1>
            <p>A Google fiók (${email}) sikeresen hozzáadva. Ez az ablak hamarosan bezáródik...</p>
            <div class="spinner"></div>
          </div>
          <script>
            setTimeout(() => {
              window.close();
            }, 2000);
          </script>
        </body>
        </html>
      `,
    };
  } catch (error) {
    console.error('❌ Callback error:', error);
    console.error('Stack trace:', error.stack);
    
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'text/html',
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Hiba történt</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0;
              background: #f7fafc;
            }
            .container { 
              text-align: center; 
              padding: 40px;
              background: white;
              border-radius: 12px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              max-width: 500px;
            }
            h1 { color: #e53e3e; margin-bottom: 20px; }
            p { color: #4a5568; margin-bottom: 20px; }
            .error { 
              background: #fed7d7; 
              color: #c53030; 
              padding: 12px; 
              border-radius: 6px;
              font-size: 14px;
              margin-top: 20px;
              word-break: break-word;
            }
            button {
              background: #3182ce;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 16px;
              margin-top: 20px;
            }
            button:hover { background: #2c5aa0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Hiba történt</h1>
            <p>Nem sikerült hozzáadni a Google fiókot.</p>
            <div class="error">${error.message}</div>
            <button onclick="window.close()">Ablak bezárása</button>
          </div>
        </body>
        </html>
      `,
    };
  }
};
