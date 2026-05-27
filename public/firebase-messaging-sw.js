/* eslint-disable no-undef */
// Firebase Cloud Messaging service worker — háttér push üzenetek kezelése.
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAosK2_kMLAeMkwxnoUE-_homeshFU-MWQ",
  authDomain: "family-ops-42931.firebaseapp.com",
  projectId: "family-ops-42931",
  storageBucket: "family-ops-42931.firebasestorage.app",
  messagingSenderId: "102947266229",
  appId: "1:102947266229:web:1bac25c4b894cef4de28fc",
});

const messaging = firebase.messaging();

// Háttérben érkező üzenet → értesítés megjelenítése
messaging.onBackgroundMessage((payload) => {
  const title =
    payload.notification?.title || payload.data?.title || "Családszervező";
  const options = {
    body: payload.notification?.body || payload.data?.body || "",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: { url: payload.fcmOptions?.link || payload.data?.url || "/" },
  };
  self.registration.showNotification(title, options);
});

// Értesítésre kattintva nyissuk meg / hozzuk előtérbe az appot
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
