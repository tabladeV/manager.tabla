// New unified NotificationsProvider using the abstraction layer
import React, { useEffect, ReactNode, useState } from 'react';
import { NotificationService } from '../services/notifications/NotificationService';
import { NotificationPayload } from '../services/notifications/types';
import { updateServiceWorker } from './swManager';
import { AUTH_STATE_EVENT, RESTAURANT_STATE_EVENT } from '../utils/appEvents';

const NotificationsProviderV2 = ({ children }: { children: React.ReactNode }) => {
  const notificationService = NotificationService.getInstance();
  const readAuthSnapshot = () => ({
    isLoggedIn: typeof window !== 'undefined' && localStorage.getItem('isLogedIn') === 'true',
    restaurantId: typeof window !== 'undefined' ? localStorage.getItem('restaurant_id') : null,
  });
  const [authSnapshot, setAuthSnapshot] = useState(readAuthSnapshot);

  useEffect(() => {
    const sync = () => setAuthSnapshot(readAuthSnapshot());
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', sync);
      window.addEventListener(AUTH_STATE_EVENT, sync);
      window.addEventListener(RESTAURANT_STATE_EVENT, sync);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', sync);
        window.removeEventListener(AUTH_STATE_EVENT, sync);
        window.removeEventListener(RESTAURANT_STATE_EVENT, sync);
      }
    };
  }, []);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        console.log("[NotificationsProviderV2] initialize:start", JSON.stringify({
          timestamp: new Date().toISOString(),
          platform: NotificationService.isNativePlatform() ? NotificationService.getPlatform() : 'web',
          isLoggedIn: localStorage.getItem('isLogedIn') === 'true',
          permission: typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
        }));
        // Initialize the notification service
        await notificationService.initialize();

        // For web platform, update service worker
        if (!NotificationService.isNativePlatform()) {
          try {
            await updateServiceWorker();
            console.log("[NotificationsProviderV2] sw:updateServiceWorker:success", JSON.stringify({ timestamp: new Date().toISOString() }));
          } catch (error) {
            console.warn("[NotificationsProviderV2] Service worker update failed:", error);
            // Don't throw - just continue
          }
        }

        // Set up permission change listener for web only
        if (!NotificationService.isNativePlatform() && 
            typeof navigator !== 'undefined' && 
            navigator.permissions && 
            typeof navigator.permissions.query === 'function') {
          try {
            const permissionStatus = await navigator.permissions.query({ name: 'notifications' });
            console.log("[NotificationsProviderV2] navigator.permissions.subscribe", JSON.stringify({
              timestamp: new Date().toISOString(),
              state: permissionStatus.state
            }));
            permissionStatus.onchange = () => {
              console.log("[NotificationsProviderV2] navigator.permissions.onchange", JSON.stringify({
                timestamp: new Date().toISOString(),
                state: permissionStatus.state
              }));
              if (!NotificationService.isNativePlatform()) {
                updateServiceWorker().catch(error => {
                  console.warn("[NotificationsProviderV2] Service worker update failed on permission change:", error);
                });
              }
            };
          } catch (error) {
            console.warn("[NotificationsProviderV2] Permission query not supported:", error);
          }
        }
      } catch (error) {
        console.error("[NotificationsProviderV2] Error during initialization:", error);
        // Don't throw the error - just log it and continue
      }
    };

    initializeNotifications();
  }, []);

  useEffect(() => {
    let unsubscribeForegroundHandler = () => {};
    const prepareNotifications = async () => {
      console.log("[NotificationsProviderV2] login:status", JSON.stringify({
        timestamp: new Date().toISOString(),
        isLoggedIn: authSnapshot.isLoggedIn
      }));
      if (!authSnapshot.isLoggedIn) {
        console.log("[NotificationsProviderV2] login:skippedPermissionFlow", JSON.stringify({
          timestamp: new Date().toISOString(),
          reason: "User not logged in when effect triggered"
        }));
        return;
      }

      try {
        console.log("[NotificationsProviderV2] permission:request:start", JSON.stringify({
          timestamp: new Date().toISOString()
        }));
        const hasPermission = await notificationService.requestPermission();
        console.log("[NotificationsProviderV2] permission:request:result", JSON.stringify({
          timestamp: new Date().toISOString(),
          hasPermission
        }));
        if (hasPermission) {
          const token = await notificationService.getToken();
          console.log("[NotificationsProviderV2] token:retrieved", JSON.stringify({
            timestamp: new Date().toISOString(),
            tokenPreview: token ? `${token.substring(0, 12)}...` : null
          }));
        } else {
          console.warn("[NotificationsProviderV2] permission:request:denied", JSON.stringify({
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error("[NotificationsProviderV2] Error requesting permission or token:", error);
      }

      unsubscribeForegroundHandler = notificationService.onMessage((payload: NotificationPayload) => {
        const { notification, data } = payload;
        if (notification && data) {
          console.log("[NotificationsProviderV2] onMessage:received", JSON.stringify({
            timestamp: new Date().toISOString(),
            notificationTitle: notification.title,
            notificationType: data.notification_type,
            reservationId: data.reservation_id || null
          }));
          // Create notification data for store
          const newNotificationForStore = {
            notification_id: parseInt(data.notification_id, 10),
            restaurant_id: data.restaurant_id ? parseInt(data.restaurant_id, 10) : null,
            restaurant_name: data.restaurant_name || null,
            notification_type: data.notification_type,
            title: 'FOR|' + notification.title,
            message: notification.body,
            data: { ...data },
            created_at: data.created_at || new Date().toISOString(),
            is_read: false,
            delivered_to_fcm: true,
            read_at: null,
          };

          if (!NotificationService.isNativePlatform() && 
              typeof window !== 'undefined' && 
              typeof Notification !== 'undefined' && 
              Notification.permission === 'granted') {
            try {
              const browserNotification = new Notification(notification.title || "New Message", {
                body: notification.body,
                icon: '/logo.png',
                badge: '/logo.png',
                data: data,
                tag: data?.notification_type || 'default'
              });
              
              browserNotification.onclick = () => {
                const urlToOpen = data?.reservation_id ? `/reservations?reservation_id=${data?.reservation_id}` : '/reservations';
                window.focus();
                if (urlToOpen) {
                  window.location.href = urlToOpen;
                }
              };
            } catch (error) {
              console.warn("[NotificationsProviderV2] Failed to show browser notification:", error);
            }
          }
          
          window.dispatchEvent(new CustomEvent('newNotificationReceived'));
        }
      });
    };

    prepareNotifications();

    return () => {
      unsubscribeForegroundHandler();
    };
  }, [authSnapshot.isLoggedIn]);

  useEffect(() => {
    const reRegisterToken = async () => {
      if (!authSnapshot.isLoggedIn || !authSnapshot.restaurantId) {
        return;
      }
      try {
        const refreshedToken = await notificationService.getToken();
        console.log("[NotificationsProviderV2] restaurant:tokenRefresh", JSON.stringify({
          timestamp: new Date().toISOString(),
          restaurantId: authSnapshot.restaurantId,
          tokenPreview: refreshedToken ? `${refreshedToken.substring(0, 12)}...` : null
        }));
      } catch (error) {
        console.error("[NotificationsProviderV2] Error refreshing token after restaurant change:", error);
      }
    };
    reRegisterToken();
  }, [authSnapshot.isLoggedIn, authSnapshot.restaurantId]);

  // Re-check token on app focus
  useEffect(() => {
    const handleRequestPermission = async () => {
      const isLoggedIn = authSnapshot.isLoggedIn;
      console.log("[NotificationsProviderV2] refreshToken:onFocus", JSON.stringify({
        timestamp: new Date().toISOString(),
        isLoggedIn,
        isSupported: notificationService.isSupported()
      }));
      if (isLoggedIn && notificationService.isSupported()) {
        try {
          const refreshedToken = await notificationService.getToken();
          console.log("[NotificationsProviderV2] refreshToken:result", JSON.stringify({
            timestamp: new Date().toISOString(),
            tokenPreview: refreshedToken ? `${refreshedToken.substring(0, 12)}...` : null
          }));
        } catch (error) {
          console.error('[NotificationsProviderV2] Error refreshing FCM token:', error);
        }
      }
    };
    
    handleRequestPermission();
  }, [authSnapshot.isLoggedIn]);

  return <>{children}</>;
};

export default NotificationsProviderV2;
