// src/firebase/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, MessagePayload, onMessage } from 'firebase/messaging';
import axiosInstance from './axiosInstance';

const firebaseConfig = {
    apiKey: "AIzaSyASiN6DhFjj2kPJbke_MIXmLdRD0A7A1IU",
    authDomain: "tabla-d9fdb.firebaseapp.com",
    projectId: "tabla-d9fdb",
    storageBucket: "tabla-d9fdb.firebasestorage.app",
    messagingSenderId: "511226021492",
    appId: "1:511226021492:web:cd57bf0b58f828368fb321",
    measurementId: "G-C2G4FJ6HGL"
};


const app = initializeApp(firebaseConfig);
let messagingInstance = null;
try {
    messagingInstance = getMessaging(app);
} catch (error) {
    console.error("Failed to initialize Firebase Messaging, possibly due to unsupported environment (e.g., non-browser).", error);
}


export const registerServiceWorker = () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.register('/firebase-messaging-sw.js') // Vite serves from public dir
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            }).catch((err) => {
                console.error('Service Worker registration failed:', err);
            });
    } else {
        console.warn('Push messaging is not supported or service workers are not available.');
    }
};

const registerTokenWithBackend = async (fcmToken: string) => {
    try {
        console.log('Registering FCM token with backend:', fcmToken);
        await axiosInstance.post('api/v1/device-tokens/', { // Assumes your Django API for device tokens
            token: fcmToken,
            device_type: 'WEB'
        });
        console.log('FCM Token registered with backend successfully.');
    } catch (error: unknown) {
        if (error instanceof Error) {
            const axiosError = error as any;
            console.error('Error registering FCM token with backend:', axiosError.response?.data || error.message);
        } else {
            console.error('Error registering FCM token with backend:', String(error));
        }
    }
};

export const requestNotificationPermissionAndToken = async () => {
    if (!('Notification' in window)) {
        alert('This browser does not support desktop notification');
        return null;
    }
    if (!messagingInstance) { // Use the initialized instance
        console.error("Firebase Messaging not available.");
        return null;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            const currentToken = await getToken(messagingInstance, { // Use the initialized instance
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || "BPO3O19QxBcc-j1k4wIZsrgxaFkqi8svWVMriCMltjFr1E1e58FcnAw-2Ogyttiryb7508I4O45fwDWnKpOf6FA",
            });
            if (currentToken) {
                console.log('FCM Token:', currentToken);
                await registerTokenWithBackend(currentToken);
                return currentToken;
            } else {
                console.log('No registration token available.');
                return null;
            }
        } else {
            console.log('Unable to get permission to notify.');
            return null;
        }
    } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
        return null;
    }
};

export const onForegroundMessageHandler = (callback: { (payload: { notification: any; data: any; }): void; (arg0: MessagePayload): void; }) => {
    if (!messagingInstance) { // Use the initialized instance
        console.error("Firebase Messaging not available for foreground handler.");
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => { }; // Return an empty unsubscribe function
    }
    return onMessage(messagingInstance, (payload) => { // Use the initialized instance
        console.log('Foreground Message received: ', payload);
        callback(payload);
    });
};