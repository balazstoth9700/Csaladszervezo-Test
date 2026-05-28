const { google } = require("googleapis");
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

async function getAuthClient(userId, email) {
  const db = admin.firestore();
  const accountDoc = await db
    .collection("users")
    .doc(userId)
    .collection("googleAccounts")
    .doc(email)
    .get();
  if (!accountDoc.exists) {
    throw new Error("Google fiók nem található: " + email);
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
  return oauth2Client;
}

// App esemény -> Google Calendar esemény objektum
function buildGoogleEvent(appEvent) {
  // appEvent fields: title, dueDate (YYYY-MM-DD or full ISO), time, endDate,
  // endTime, allDay, location, description, durationMinutes
  const allDay = appEvent.allDay !== false && !appEvent.time;
  const result = {
    summary: appEvent.title || "(Név nélkül)",
    description: appEvent.description || "",
    location: appEvent.location || "",
  };

  if (allDay) {
    const startDate = (appEvent.dueDate || "").split("T")[0];
    let endDate = appEvent.endDate || startDate;
    // Google all-day events: end date is exclusive — add 1 day
    const end = new Date(endDate + "T00:00:00");
    end.setDate(end.getDate() + 1);
    const endDateStr = end.toISOString().split("T")[0];
    result.start = { date: startDate };
    result.end = { date: endDateStr };
  } else {
    const startDateOnly = (appEvent.dueDate || "").split("T")[0];
    const startTime = appEvent.time || "09:00";
    const startISO = `${startDateOnly}T${startTime}:00`;

    let endISO;
    if (appEvent.endDate || appEvent.endTime) {
      const endDateOnly = appEvent.endDate || startDateOnly;
      const endTime = appEvent.endTime || startTime;
      endISO = `${endDateOnly}T${endTime}:00`;
    } else if (appEvent.durationMinutes) {
      const startDate = new Date(startISO);
      const endDate = new Date(
        startDate.getTime() + parseInt(appEvent.durationMinutes, 10) * 60 * 1000
      );
      endISO = endDate.toISOString().slice(0, 19);
    } else {
      // alap 1 óra
      const startDate = new Date(startISO);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      endISO = endDate.toISOString().slice(0, 19);
    }

    const tz = appEvent.timeZone || "Europe/Budapest";
    result.start = { dateTime: startISO, timeZone: tz };
    result.end = { dateTime: endISO, timeZone: tz };
  }

  // Ismétlődés
  if (appEvent.recurring?.enabled) {
    const freqMap = {
      daily: "DAILY",
      weekly: "WEEKLY",
      monthly: "MONTHLY",
      yearly: "YEARLY",
    };
    const f = freqMap[appEvent.recurring.frequency];
    if (f) {
      const interval = parseInt(appEvent.recurring.interval, 10) || 1;
      let rrule = `RRULE:FREQ=${f};INTERVAL=${interval}`;
      if (appEvent.recurring.endDate) {
        const untilDate = new Date(appEvent.recurring.endDate);
        rrule += `;UNTIL=${untilDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
      }
      result.recurrence = [rrule];
    }
  }

  return result;
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
    const {
      userId,
      email,
      action, // "create" | "update" | "delete"
      appEvent,
      googleEventId,
    } = JSON.parse(event.body);

    if (!userId || !email || !action) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "userId, email, action kötelező" }),
      };
    }

    const oauth2Client = await getAuthClient(userId, email);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    if (action === "create") {
      const requestBody = buildGoogleEvent(appEvent);
      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody,
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          googleEventId: response.data.id,
          htmlLink: response.data.htmlLink,
        }),
      };
    }

    if (action === "update") {
      if (!googleEventId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "googleEventId kötelező update-hez" }),
        };
      }
      const requestBody = buildGoogleEvent(appEvent);
      const response = await calendar.events.update({
        calendarId: "primary",
        eventId: googleEventId,
        requestBody,
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          googleEventId: response.data.id,
        }),
      };
    }

    if (action === "delete") {
      if (!googleEventId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "googleEventId kötelező delete-hez" }),
        };
      }
      try {
        await calendar.events.delete({
          calendarId: "primary",
          eventId: googleEventId,
        });
      } catch (delErr) {
        // 404 / 410 — az esemény már nincs Google oldalon, nem hiba
        if (delErr.code !== 404 && delErr.code !== 410) throw delErr;
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Ismeretlen action: " + action }),
    };
  } catch (error) {
    console.error("push-google-calendar-event hiba:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
