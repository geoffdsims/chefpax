// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCZOC4y-9sR2OAkD6w6M4POBXXpVlVl0rg",
  authDomain: "chefpax-a025d.firebaseapp.com",
  projectId: "chefpax-a025d",
  storageBucket: "chefpax-a025d.firebasestorage.app",
  messagingSenderId: "522169187619",
  appId: "1:522169187619:web:ac72527055579fba7d6096",
  measurementId: "G-CB0FTVTGST"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);
  
  const notificationTitle = payload.notification?.title || 'ChefPax Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/logo.png',
    badge: '/logo.png',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  // Navigate to the app when notification is clicked
  event.waitUntil(
    clients.openWindow('https://chefpax.com')
  );
});






