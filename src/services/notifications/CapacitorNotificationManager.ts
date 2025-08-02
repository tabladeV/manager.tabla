import { NotificationManager, NotificationPayload } from './types';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import axiosInstance from '../../providers/axiosInstance';

export class CapacitorNotificationManager implements NotificationManager {
  private messageListeners: Array<(payload: NotificationPayload) => void> = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Add listeners for push notification events
      await PushNotifications.addListener('registration', (token: Token) => {
        // Use setTimeout to avoid blocking the initialization
        setTimeout(() => this.registerTokenWithBackend(token.value), 100);
      });

      await PushNotifications.addListener('registrationError', (error: any) => {
        console.error('[CapacitorNotificationManager] Push registration error:', error);
      });

      // Handle foreground notifications
      await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        try {
          const payload: NotificationPayload = {
            notification: {
              title: notification.title || '',
              body: notification.body || ''
            },
            data: notification.data || {}
          };

          // Notify all listeners safely
          this.messageListeners.forEach(listener => {
            try {
              listener(payload);
            } catch (error) {
              console.error('[CapacitorNotificationManager] Error in message listener:', error);
            }
          });
        } catch (error) {
          console.error('[CapacitorNotificationManager] Error processing notification:', error);
        }
      });

      // Handle notification tap
      await PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        try {
          const data = notification.notification.data;
          if (data?.reservation_id) {
            // Navigate to reservation - this will be handled by the app
            window.location.href = `/reservations?reservation_id=${data.reservation_id}`;
          }
        } catch (error) {
          console.error('[CapacitorNotificationManager] Error handling notification action:', error);
        }
      });

      this.initialized = true;
    } catch (error) {
      console.error('[CapacitorNotificationManager] Failed to initialize:', error);
      // Don't throw the error - just log it and mark as initialized to prevent retries
      this.initialized = true;
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      const permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        const result = await PushNotifications.requestPermissions();
        return result.receive === 'granted';
      }
      
      return permStatus.receive === 'granted';
    } catch (error) {
      console.error('[CapacitorNotificationManager] Permission request failed:', error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive !== 'granted') {
        return null;
      }

      // Register with APNS/FCM to get a token
      await PushNotifications.register();
      
      // Token will be received in the 'registration' listener
      // For now, we'll return null as the token is handled asynchronously
      return null;
    } catch (error) {
      console.error('[CapacitorNotificationManager] Failed to get token:', error);
      return null;
    }
  }

  onMessage(callback: (payload: NotificationPayload) => void): () => void {
    this.messageListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.messageListeners.indexOf(callback);
      if (index > -1) {
        this.messageListeners.splice(index, 1);
      }
    };
  }

  onBackgroundMessage(_callback: (payload: NotificationPayload) => void): void {
    // Background notifications are handled automatically by the OS
    // and delivered through the 'pushNotificationReceived' listener when app comes to foreground
  }

  isSupported(): boolean {
    // Capacitor Push Notifications are supported on native platforms
    return true;
  }

  private async registerTokenWithBackend(token: string): Promise<void> {
    try {
      // Check if user is logged in and has restaurant ID
      const isLoggedIn = localStorage.getItem('isLogedIn') === 'true';
      const restaurantId = localStorage.getItem('restaurant_id');
      
      if (!isLoggedIn || !restaurantId) {
        return;
      }

      await axiosInstance.post('api/v1/device-tokens/', {
        token,
        device_type: 'ANDROID' // Will need to detect iOS later
      });
    } catch (error) {
      console.error('[CapacitorNotificationManager] Failed to register token:', error);
      // Don't throw the error - just log it and continue
    }
  }
}