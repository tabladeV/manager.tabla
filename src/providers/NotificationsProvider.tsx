// src/providers/NotificationsProvider.tsx
import React, { useEffect, ReactNode } from 'react';
import { registerServiceWorker, onForegroundMessageHandler } from './firebase';
import { updateServiceWorker } from './swManager'

const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    console.log("NotificationsProvider mounted.");
    // run at mount and whenever permission or login might change
    updateServiceWorker()

    // permission can flip from 'default'→'granted' after user clicks “allow”
    const handlePermChange = () => {
      updateServiceWorker()
    }
    // listen for permission changes (some browsers fire this event)
    navigator.permissions?.query({ name: 'notifications' }).then((perm) => {
      perm.onchange = handlePermChange
    })

    // set up foreground handler only when logged in & granted
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    let unsubscribe = () => {}
    if (localStorage.getItem('isLogedIn') === 'true' && Notification.permission === 'granted') {
      unsubscribe = onForegroundMessageHandler(payload => {
                console.log('Zustand: Foreground FCM message in Provider:', payload);
                const { notification, data } = payload;
                if (notification && data) {
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
                        // user_notification_id might not be available from FCM payload, backend serializer adds it
                    };
                    // addLiveNotification(newNotificationForStore);
                    console.log("Zustand: New notification for store:", newNotificationForStore);

                    if (Notification.permission === 'granted') {
                        const browserNotification = new Notification(notification.title, {
                            body: notification.body,
                            icon: '/vite.svg', // your icon
                            data: data
                        });
                        browserNotification.onclick = () => {
                            console.log("Browser notification clicked:", data);
                            window.focus();
                        };
                    }
                }
            });
        } else {
            console.log("Zustand: User not authenticated, foreground message handler not active.");
        }
        return () => {
            console.log("Zustand: Cleaning up NotificationProvider, unsubscribing.");
            unsubscribe();
        };
    }, []);

    return <>{children}</>;
};

export default NotificationsProvider;