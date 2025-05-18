// src/providers/NotificationsProvider.tsx
import React, { useEffect, ReactNode } from 'react';
import { onForegroundMessageHandler } from './firebase';
import { updateServiceWorker } from './swManager';

const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    console.log("[NotificationsProvider] Mounted.");

    const initializeNotifications = async () => {
      try {
        console.log("[NotificationsProvider] Attempting to update service worker...");
        await updateServiceWorker();
        console.log("[NotificationsProvider] Service worker update process initiated.");

        // Permission change listener
        if (navigator.permissions && typeof navigator.permissions.query === 'function') {
          console.log("[NotificationsProvider] Setting up permission change listener.");
          try {
            const permissionStatus = await navigator.permissions.query({ name: 'notifications' });
            permissionStatus.onchange = () => {
              console.log("[NotificationsProvider] Notification permission changed. Updating service worker.");
              updateServiceWorker();
            };
            console.log("[NotificationsProvider] Permission change listener set up.");
          } catch (permError) {
            console.error("[NotificationsProvider] Error setting up permission query/onchange:", permError);
            // Decide if this is critical. For now, we'll log and continue.
          }
        } else {
          console.warn("[NotificationsProvider] navigator.permissions.query not supported. Skipping permission change listener.");
        }

      } catch (error) {
        console.error("[NotificationsProvider] Error during initial service worker update or permission setup:", error);
        // Depending on the error, you might want to display a message to the user
        // or prevent further notification-related setup.
      }
    };

    initializeNotifications();

    // Foreground message handler setup
    // This part is kept separate as it depends on login state and permission,
    // which might be checked after the initial setup.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    let unsubscribeForegroundHandler = () => {};
    try {
      if (localStorage.getItem('isLogedIn') === 'true' && Notification.permission === 'granted') {
        console.log("[NotificationsProvider] Setting up foreground message handler.");
        unsubscribeForegroundHandler = onForegroundMessageHandler(payload => {
          console.log('[NotificationsProvider] Foreground FCM message received:', payload);
          const { notification, data } = payload;
          if (notification && data) {
            // ... (your existing logic for handling the message and creating a browser notification)
            const newNotificationForStore = {
              notification_id: parseInt(data.notification_id, 10),
              restaurant_id: data.restaurant_id ? parseInt(data.restaurant_id, 10) : null,
              restaurant_name: data.restaurant_name || null,
              notification_type: data.notification_type,
              title: notification.title,
              message: notification.body,
              data: { ...data },
              created_at: data.created_at || new Date().toISOString(),
              is_read: false,
              delivered_to_fcm: true,
              read_at: null,
            };
            console.log("[NotificationsProvider] New notification for store:", newNotificationForStore);
            // addLiveNotification(newNotificationForStore); // If you have a store action

            if (Notification.permission === 'granted') {
              const browserNotification = new Notification(notification.title || "New Message", {
                body: notification.body,
                icon: '/logo.png', // Ensure this icon exists and is accessible
                badge: '/logo.png',
                data: data,
                tag: data?.notification_type || 'default' // Group similar notifications
              });
              browserNotification.onclick = () => {
                console.log("[NotificationsProvider] Browser notification clicked:", data);
                const urlToOpen = data?.reservation_id? `/reservations?reservation_id=${data?.reservation_id}`: '/reservations';
                window.focus(); // Attempt to focus the window
                // Optionally, navigate to a relevant part of the app:
                if (urlToOpen) { window.location.href = urlToOpen; }
              };
              // Dispatch event for other components to update (e.g., notification count)
              window.dispatchEvent(new CustomEvent('newNotificationReceived'));
            }
          }
        });
        console.log("[NotificationsProvider] Foreground message handler set up.");
      } else {
        console.log("[NotificationsProvider] Conditions not met for foreground message handler (Logged In:", localStorage.getItem('isLogedIn'), "Permission:", Notification.permission, ")");
      }
    } catch (fgHandlerError) {
      console.error("[NotificationsProvider] Error setting up foreground message handler:", fgHandlerError);
    }

    return () => {
      console.log("[NotificationsProvider] Cleaning up. Unsubscribing foreground handler.");
      unsubscribeForegroundHandler();
      // If you added other listeners that need cleanup, do it here.
      // For example, if permissionStatus.onchange was set, you might want to clear it,
      // though it's often handled by the browser when the component unmounts.
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount.

  return <>{children}</>;
};

export default NotificationsProvider;