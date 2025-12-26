import { NotificationManager, NotificationPayload } from './types';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { httpClient } from '../httpClient';
import { Capacitor } from '@capacitor/core';
import { AUTH_STATE_EVENT, RESTAURANT_STATE_EVENT } from '../../utils/appEvents';

export class CapacitorNotificationManager implements NotificationManager {
  private messageListeners: Array<(payload: NotificationPayload) => void> = [];
  private initialized = false;
  private pendingToken: string | null = null;
  private lastRegisteredToken: string | null = null;
  private lastRegisteredRestaurant: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const retryRegistration = () => {
        if (this.pendingToken) {
          console.log('[CapacitorNotificationManager] pendingToken:retry', JSON.stringify({
            timestamp: new Date().toISOString(),
            tokenPreview: `${this.pendingToken.substring(0, 12)}...`
          }));
          this.registerTokenWithBackend(this.pendingToken);
        }
      };
      window.addEventListener(AUTH_STATE_EVENT, retryRegistration);
      window.addEventListener(RESTAURANT_STATE_EVENT, retryRegistration);
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const platform = Capacitor.getPlatform();
      // Local notifications removed – rely on FCM/OS handling

      // Add listeners for push notification events
      await PushNotifications.addListener('registration', (token: Token) => {
        console.log('[CapacitorNotificationManager] registration:event', JSON.stringify({
          timestamp: new Date().toISOString(),
          platform,
          tokenPreview: token.value ? `${token.value.substring(0, 12)}...` : null,
        }));
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
          console.log(`[CapacitorNotificationManager] ${platform}:pushNotificationReceived`, JSON.stringify({
            timestamp: new Date().toISOString(),
            hasData: !!notification.data,
            title: notification.title,
            reservationId: notification.data?.reservation_id || null
          }));

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
      console.log('[CapacitorNotificationManager] permission:status', JSON.stringify({
        timestamp: new Date().toISOString(),
        platform,
        status: permStatus.receive
      }));

      if (permStatus.receive === 'prompt') {
        console.log(`[CapacitorNotificationManager] ${platform}: Prompting user for permissions`);
        const result = await PushNotifications.requestPermissions();
        console.log('[CapacitorNotificationManager] permission:promptResult', JSON.stringify({
          timestamp: new Date().toISOString(),
          platform,
          status: result.receive
        }));

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
      console.log('[CapacitorNotificationManager] getToken:permissionStatus', JSON.stringify({
        timestamp: new Date().toISOString(),
        platform,
        status: permStatus.receive
      }));
      
      if (permStatus.receive !== 'granted') {
        console.warn('[CapacitorNotificationManager] getToken:permissionNotGranted', JSON.stringify({
          timestamp: new Date().toISOString(),
          platform,
          status: permStatus.receive
        }));
        return null;
      }

      
      // iOS-specific: Check if running on simulator
      if (platform === 'ios') {
        // Check if we're on a simulator (this will fail on simulator)
        try {
          await PushNotifications.register();
          console.log('[CapacitorNotificationManager] pushRegister:init', JSON.stringify({
            timestamp: new Date().toISOString(),
            platform
          }));
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
        console.log('[CapacitorNotificationManager] pushRegister:init', JSON.stringify({
          timestamp: new Date().toISOString(),
          platform
        }));
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
    let restaurantId: string | null = null;
    try {
      const platform = Capacitor.getPlatform();
      console.log(`[CapacitorNotificationManager] ${platform}: Registering token with backend`, JSON.stringify({
        timestamp: new Date().toISOString()
      }));

      // Check if user is logged in and has restaurant ID
      const isLoggedIn = localStorage.getItem('isLogedIn') === 'true';
      restaurantId = localStorage.getItem('restaurant_id');

      console.log(`[CapacitorNotificationManager] ${platform}: Auth check`, JSON.stringify({
        timestamp: new Date().toISOString(),
        isLoggedIn,
        restaurantId
      }));

      if (!isLoggedIn || !restaurantId) {
        this.pendingToken = token;
        console.warn(`[CapacitorNotificationManager] ${platform}: registerTokenWithBackend:aborted`, JSON.stringify({
          timestamp: new Date().toISOString(),
          reason: !isLoggedIn ? 'NOT_LOGGED_IN' : 'MISSING_RESTAURANT_ID'
        }));
        return;
      }

      if (this.lastRegisteredToken === token && this.lastRegisteredRestaurant === restaurantId) {
        console.log(`[CapacitorNotificationManager] ${platform}: Token already registered for current restaurant, skipping duplicate call`);
        this.pendingToken = null;
        return;
      }

      // Detect platform for device type
      const deviceType = platform === 'ios' ? 'IOS' : 'ANDROID';

      console.log(`[CapacitorNotificationManager] ${platform}: Registering device type: ${deviceType}`);

      const response = await httpClient.post('api/v1/device-tokens/', {
        token,
        device_type: deviceType
      });

      console.log(`[CapacitorNotificationManager] ${platform}: Token registration successful`, JSON.stringify({
        timestamp: new Date().toISOString(),
        status: response.status
      }));
      this.pendingToken = null;
      this.lastRegisteredToken = token;
      this.lastRegisteredRestaurant = restaurantId;
    } catch (error: any) {
      const platform = Capacitor.getPlatform();
      console.error(`[CapacitorNotificationManager] ${platform}: Failed to register token:`, this.formatError(error));

      if (error.response?.status === 400 && error.response?.data?.token?.[0]?.includes('already exists')) {
        console.warn('[CapacitorNotificationManager] Token already exists on backend; marking as registered');
        this.lastRegisteredToken = token;
        this.lastRegisteredRestaurant = restaurantId || null;
        this.pendingToken = null;
        return;
      }

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

  private formatError(error: any) {
    if (error?.response) {
      return {
        message: error.message,
        status: error.response.status,
        data: error.response.data
      };
    }
    if (error?.message) {
      return { message: error.message };
    }
    return { error: String(error) };
  }
}
