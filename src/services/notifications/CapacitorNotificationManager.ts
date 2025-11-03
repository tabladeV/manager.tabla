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

      // Add listeners for push notification events
      await PushNotifications.addListener('registration', (token: Token) => {
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
          console.log(`[CapacitorNotificationManager] ${platform}: Received notification:`, notification);

          const payload: NotificationPayload = {
            notification: {
              title: notification.title || '',
              body: notification.body || ''
            },
            data: notification.data || {}
          };

          // Platform-specific notification handling
          if (platform === 'ios') {
            // iOS-specific: Log APNs payload structure for debugging
            if (notification.data) {
              console.log('[CapacitorNotificationManager] iOS: APNs data received:', notification.data);

              // Check for sound in APNs payload
              if (notification.data.aps) {
                const aps = notification.data.aps;
                if (aps.sound) {
                  console.log('[CapacitorNotificationManager] iOS: Sound specified in APNs:', aps.sound);
                }
                if (aps.alert) {
                  console.log('[CapacitorNotificationManager] iOS: Alert configuration:', aps.alert);
                }
              }
            }
          } else if (platform === 'android') {
            // Android-specific: Ensure notification uses the proper channel
            console.log('[CapacitorNotificationManager] Android: Processing notification for channel');

            // Log sound and vibration settings
            if (notification.data) {
              if (notification.data.sound) {
                console.log('[CapacitorNotificationManager] Android: Custom sound specified:', notification.data.sound);
              }
              if (notification.data.vibrate) {
                console.log('[CapacitorNotificationManager] Android: Vibration pattern specified:', notification.data.vibrate);
              }
            }
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
      const platform = Capacitor.getPlatform();
      console.log(`[CapacitorNotificationManager] ${platform}: Requesting notification permissions`);

      const permStatus = await PushNotifications.checkPermissions();
      console.log(`[CapacitorNotificationManager] ${platform}: Current permission status:`, permStatus);

      if (permStatus.receive === 'prompt') {
        console.log(`[CapacitorNotificationManager] ${platform}: Prompting user for permissions`);
        const result = await PushNotifications.requestPermissions();
        console.log(`[CapacitorNotificationManager] ${platform}: Permission result:`, result);

        // iOS-specific: Check if permission was denied
        if (platform === 'ios' && result.receive === 'denied') {
          console.warn('[CapacitorNotificationManager] iOS: Notification permission denied by user');
          console.warn('[CapacitorNotificationManager] iOS: Sound and vibration will not work');
        }

        return result.receive === 'granted';
      }

      // iOS-specific: Check for provisional authorization
      if (platform === 'ios' && permStatus.receive === 'denied') {
        console.warn('[CapacitorNotificationManager] iOS: Notifications are disabled in Settings');
        console.warn('[CapacitorNotificationManager] iOS: User must enable notifications in Settings app');
      }

      const isGranted = permStatus.receive === 'granted';
      console.log(`[CapacitorNotificationManager] ${platform}: Final permission status: ${isGranted ? 'granted' : 'denied'}`);
      return isGranted;
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
        return null;
      }

      
      // iOS-specific: Check if running on simulator
      if (platform === 'ios') {
        // Check if we're on a simulator (this will fail on simulator)
        try {
          await PushNotifications.register();
        } catch (registerError: any) {
          if (registerError.message?.includes('simulator')) {
          } else {
            console.error('[CapacitorNotificationManager] iOS: Registration error:', registerError);
          }
          throw registerError;
        }
      } else {
        // Android registration
        await PushNotifications.register();
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
      const platform = Capacitor.getPlatform();
      console.log(`[CapacitorNotificationManager] ${platform}: Registering token with backend`);

      // Check if user is logged in and has restaurant ID
      const isLoggedIn = localStorage.getItem('isLogedIn') === 'true';
      const restaurantId = localStorage.getItem('restaurant_id');

      console.log(`[CapacitorNotificationManager] ${platform}: Auth check - isLoggedIn: ${isLoggedIn}, restaurantId: ${restaurantId}`);

      if (!isLoggedIn || !restaurantId) {
        console.warn(`[CapacitorNotificationManager] ${platform}: Cannot register token - user not authenticated or no restaurant ID`);
        return;
      }

      // Detect platform for device type
      const deviceType = platform === 'ios' ? 'IOS' : 'ANDROID';

      console.log(`[CapacitorNotificationManager] ${platform}: Registering device type: ${deviceType}`);

      const response = await httpClient.post('api/v1/device-tokens/', {
        token,
        device_type: deviceType
      });

      console.log(`[CapacitorNotificationManager] ${platform}: Token registration successful:`, response.status);
    } catch (error: any) {
      const platform = Capacitor.getPlatform();
      console.error(`[CapacitorNotificationManager] ${platform}: Failed to register token:`, error);

      // Log more details for platform-specific issues
      if (platform === 'ios') {
        if (error.response?.status === 400) {
          console.error('[CapacitorNotificationManager] iOS: Bad request - check token format or API payload');
        } else if (error.response?.status === 401) {
          console.error('[CapacitorNotificationManager] iOS: Unauthorized - check authentication token');
        } else if (error.response?.status === 403) {
          console.error('[CapacitorNotificationManager] iOS: Forbidden - check permissions');
        }
      } else if (platform === 'android') {
        if (error.response?.status === 400) {
          console.error('[CapacitorNotificationManager] Android: Bad request - check token format or API payload');
        } else if (error.response?.status === 401) {
          console.error('[CapacitorNotificationManager] Android: Unauthorized - check authentication token');
        }
      }

      // Don't throw the error - just log it and continue
    }
  }
}