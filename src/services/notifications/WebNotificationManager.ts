import { NotificationManager, NotificationPayload } from './types';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { getSWRegistration } from '../../providers/swManager';
import { httpClient } from '../httpClient';

const firebaseConfig = {
  apiKey: "AIzaSyASiN6DhFjj2kPJbke_MIXmLdRD0A7A1IU",
  authDomain: "tabla-d9fdb.firebaseapp.com",
  projectId: "tabla-d9fdb",
  storageBucket: "tabla-d9fdb.firebasestorage.app",
  messagingSenderId: "511226021492",
  appId: "1:511226021492:web:cd57bf0b58f828368fb321",
  measurementId: "G-C2G4FJ6HGL"
};

export class WebNotificationManager implements NotificationManager {
  private app: any;
  private messaging: any;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Only initialize on web platforms with service worker support
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      this.initialized = true;
      return;
    }
    
    try {
      this.app = initializeApp(firebaseConfig);
      this.messaging = getMessaging(this.app);
      this.initialized = true;
    } catch (error) {
      console.error('[WebNotificationManager] Failed to initialize:', error);
      throw error;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || typeof Notification === 'undefined' || !('Notification' in window)) {
      console.warn('[WebNotificationManager] Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('[WebNotificationManager] Permission request failed:', error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    if (!this.messaging) {
      console.error('[WebNotificationManager] Messaging not initialized');
      return null;
    }

    try {
      const registration = await getSWRegistration();
      if (!registration) {
        console.error('[WebNotificationManager] Service Worker registration not found');
        return null;
      }

      const currentToken = await getToken(this.messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || "BPO3O19QxBcc-j1k4wIZsrgxaFkqi8svWVMriCMltjFr1E1e58FcnAw-2Ogyttiryb7508I4O45fwDWnKpOf6FA",
        serviceWorkerRegistration: registration
      });

      if (currentToken) {
        await this.registerTokenWithBackend(currentToken);
        return currentToken;
      }
      
      return null;
    } catch (error) {
      console.error('[WebNotificationManager] Failed to get token:', error);
      return null;
    }
  }

  onMessage(callback: (payload: NotificationPayload) => void): () => void {
    if (!this.messaging) {
      console.error('[WebNotificationManager] Messaging not initialized');
      return () => {};
    }

    return onMessage(this.messaging, (payload: MessagePayload) => {
      console.log('[WebNotificationManager] Foreground message received:', payload);
      callback(payload as NotificationPayload);
    });
  }

  onBackgroundMessage(_callback: (payload: NotificationPayload) => void): void {
    // Background messages are handled by the service worker
  }

  isSupported(): boolean {
    return typeof Notification !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  private async registerTokenWithBackend(token: string): Promise<void> {
    try {
      console.log('[WebNotificationManager] Registering token with backend');
      await httpClient.post('api/v1/device-tokens/', {
        token,
        device_type: 'WEB'
      });
      console.log('[WebNotificationManager] Token registered successfully');
    } catch (error) {
      console.error('[WebNotificationManager] Failed to register token:', error);
    }
  }
}