// New unified NotificationsProvider using the abstraction layer
import React, { useEffect, ReactNode } from 'react';
import { NotificationService } from '../services/notifications/NotificationService';
import { NotificationPayload } from '../services/notifications/types';
import { updateServiceWorker } from './swManager';

const NotificationsProviderV2 = ({ children }: { children: React.ReactNode }) => {
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Initialize the notification service
        await notificationService.initialize();

        // For web platform, update service worker
        if (!NotificationService.isNativePlatform()) {
          try {
            await updateServiceWorker();
          } catch (error) {
            console.warn("[NotificationsProviderV2] Service worker update failed:", error);
            // Don't throw - just continue
          }
        }

        // Check if user is logged in
        const isLoggedIn = localStorage.getItem('isLogedIn') === 'true';
        
        if (isLoggedIn) {
          try {
            // Request permission if needed
            const hasPermission = await notificationService.requestPermission();
            
            if (hasPermission) {
              await notificationService.getToken();
            }
          } catch (error) {
            console.error("[NotificationsProviderV2] Error requesting permission or token:", error);
          }
        }

        // Set up permission change listener for web only
        if (!NotificationService.isNativePlatform() && 
            typeof navigator !== 'undefined' && 
            navigator.permissions && 
            typeof navigator.permissions.query === 'function') {
          try {
            const permissionStatus = await navigator.permissions.query({ name: 'notifications' });
            permissionStatus.onchange = () => {
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

    // Set up foreground message handler
    let unsubscribeForegroundHandler = () => {};
    
    if (localStorage.getItem('isLogedIn') === 'true') {
      unsubscribeForegroundHandler = notificationService.onMessage((payload: NotificationPayload) => {
        
        const { notification, data } = payload;
        
        if (notification && data) {
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
          
          // Show browser notification (for web platform only)
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
          
          // Dispatch event for other components to update
          window.dispatchEvent(new CustomEvent('newNotificationReceived'));
        }
      });
    }

    return () => {
      unsubscribeForegroundHandler();
    };
  }, []);

  // Re-check token on app focus
  useEffect(() => {
    const handleRequestPermission = async () => {
      const isLoggedIn = localStorage.getItem('isLogedIn') === 'true';
      
      if (isLoggedIn && notificationService.isSupported()) {
        try {
          await notificationService.getToken();
        } catch (error) {
          console.error('[NotificationsProviderV2] Error refreshing FCM token:', error);
        }
      }
    };
    
    handleRequestPermission();
  }, []);

  return <>{children}</>;
};

export default NotificationsProviderV2;