importScripts('https://www.gstatic.com/firebasejs/8.3.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.3.2/firebase-messaging.js');

// Initialize Aplu
const apluPushConfig = {
    apiKey: "AIzaSyBxaNJ_cyjbdbwwBF4d7KQjBrHEdC0JQz8",
	authDomain: "aplua36-93a34.firebaseapp.com",
	projectId: "aplua36-93a34",
	storageBucket: "aplua36-93a34.firebasestorage.app",
	messagingSenderId: "785424233281",
	appId: "1:785424233281:web:f324c28717d354809ba7c0"
};

try {
    importScripts('https://push.aplu.io/import-aplu-messaging.js');
} catch (err) {
    console.warn("Couldn't load aplu-script, falling back: ", err);
}