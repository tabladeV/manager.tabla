import { NotificationManager, NotificationPayload } from './types';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { httpClient } from '../httpClient';
import { Capacitor } from '@capacitor/core';

export class CapacitorNotificationManager implements NotificationManager {
  private messageListeners: Array<(payload: NotificationPayload) => void> = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const platform = Capacitor.getPlatform();
      console.log(`[CapacitorNotificationManager] Initializing for platform: ${platform}`);

      // Add listeners for push notification events
      await PushNotifications.addListener('registration', (token: Token) => {
        console.log(`[CapacitorNotificationManager] Token received for ${platform}:`, token.value);
        // Use setTimeout to avoid blocking the initialization
        setTimeout(() => this.registerTokenWithBackend(token.value), 100);
      });

      await PushNotifications.addListener('registrationError', (error: any) => {
        console.error('[CapacitorNotificationManager] Push registration error:', error);
        
        // iOS-specific error handling
        if (platform === 'ios') {
          if (error.error?.includes('simulator')) {
            console.warn('[CapacitorNotificationManager] Push notifications not supported on iOS Simulator');
          } else if (error.error?.includes('aps-environment')) {
            console.error('[CapacitorNotificationManager] iOS Push capability not configured. Check Xcode project settings.');
          } else if (error.error?.includes('network')) {
            console.error('[CapacitorNotificationManager] Network error. Check device connectivity.');
          }
        }
      });

      // Handle foreground notifications
      await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        try {
          console.log(`[CapacitorNotificationManager] Foreground notification received on ${platform}:`, notification);
          
          const payload: NotificationPayload = {
            notification: {
              title: notification.title || '',
              body: notification.body || ''
            },
            data: notification.data || {}
          };

          // iOS-specific: Check if notification has APNs data
          if (platform === 'ios' && notification.data) {
            console.log('[CapacitorNotificationManager] iOS notification data:', notification.data);
          }

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
          console.log(`[CapacitorNotificationManager] Notification tapped on ${platform}:`, notification);
          
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
      console.log('[CapacitorNotificationManager] Initialization complete');
    } catch (error) {
      console.error('[CapacitorNotificationManager] Failed to initialize:', error);
      // Don't throw the error - just log it and mark as initialized to prevent retries
      this.initialized = true;
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      const platform = Capacitor.getPlatform();
      const permStatus = await PushNotifications.checkPermissions();
      console.log(`[CapacitorNotificationManager] Current permission status on ${platform}:`, permStatus);
      
      if (permStatus.receive === 'prompt') {
        console.log('[CapacitorNotificationManager] Requesting permission...');
        const result = await PushNotifications.requestPermissions();
        console.log('[CapacitorNotificationManager] Permission result:', result);
        
        // iOS-specific: Check if permission was denied
        if (platform === 'ios' && result.receive === 'denied') {
          console.warn('[CapacitorNotificationManager] iOS: User denied notifications. Direct to Settings app to enable.');
        }
        
        return result.receive === 'granted';
      }
      
      // iOS-specific: Check for provisional authorization
      if (platform === 'ios' && permStatus.receive === 'denied') {
        console.warn('[CapacitorNotificationManager] iOS: Notifications denied. User must enable in Settings.');
      }
      
      return permStatus.receive === 'granted';
    } catch (error) {
      console.error('[CapacitorNotificationManager] Permission request failed:', error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const platform = Capacitor.getPlatform();
      const permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive !== 'granted') {
        console.warn(`[CapacitorNotificationManager] Cannot get token on ${platform}: Permission not granted`);
        return null;
      }

      console.log(`[CapacitorNotificationManager] Registering for push on ${platform}...`);
      
      // iOS-specific: Check if running on simulator
      if (platform === 'ios') {
        // Check if we're on a simulator (this will fail on simulator)
        try {
          await PushNotifications.register();
          console.log('[CapacitorNotificationManager] iOS: Registration initiated');
        } catch (registerError: any) {
          if (registerError.message?.includes('simulator')) {
            console.warn('[CapacitorNotificationManager] iOS: Running on simulator - push notifications not available');
          } else {
            console.error('[CapacitorNotificationManager] iOS: Registration error:', registerError);
          }
          throw registerError;
        }
      } else {
        // Android registration
        await PushNotifications.register();
        console.log('[CapacitorNotificationManager] Android: Registration initiated');
      }
      
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
        console.log('[CapacitorNotificationManager] Skipping token registration - user not logged in or no restaurant selected');
        return;
      }

      // Detect platform for device type
      const platform = Capacitor.getPlatform();
      const deviceType = platform === 'ios' ? 'IOS' : 'ANDROID';
      
      console.log(`[CapacitorNotificationManager] Registering ${deviceType} token with backend...`);
      console.log(`[CapacitorNotificationManager] Token (first 20 chars): ${token.substring(0, 20)}...`);
      
      const response = await httpClient.post('api/v1/device-tokens/', {
        token,
        device_type: deviceType
      });
      
      console.log(`[CapacitorNotificationManager] Token registered successfully for ${deviceType}:`, response.data);
    } catch (error: any) {
      console.error('[CapacitorNotificationManager] Failed to register token:', error);
      
      // Log more details for iOS-specific issues
      if (Capacitor.getPlatform() === 'ios') {
        if (error.response?.status === 400) {
          console.error('[CapacitorNotificationManager] iOS: Bad request - check token format');
        } else if (error.response?.status === 401) {
          console.error('[CapacitorNotificationManager] iOS: Unauthorized - check authentication');
        }
      }
      
      // Don't throw the error - just log it and continue
    }
  }
}