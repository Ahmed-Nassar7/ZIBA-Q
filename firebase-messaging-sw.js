// Firebase Cloud Messaging — بيستقبل الإشعارات لما المتصفح يكون مقفول أو في الخلفية.
// اسم الملف ده لازم يفضل firebase-messaging-sw.js بالظبط وفي نفس مجلد index.html،
// لأن مكتبة Firebase بتدور عليه بالاسم ده تلقائيًا.
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBnoi3UvUK4SZu4YRuB6hZGLL_0YdhlWc8',
  authDomain: 'zeibaq-1c61b.firebaseapp.com',
  projectId: 'zeibaq-1c61b',
  storageBucket: 'zeibaq-1c61b.firebasestorage.app',
  messagingSenderId: '566886838733',
  appId: '1:566886838733:web:059c77660ae64e48b0d484'
});

var messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  var title = (payload.notification && payload.notification.title) || 'ZibaQ';
  var options = {
    body: (payload.notification && payload.notification.body) || '',
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png'
  };
  self.registration.showNotification(title, options);
});
