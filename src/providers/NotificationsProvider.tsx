import React, { useEffect, ReactNode } from 'react';
import { registerServiceWorker, onForegroundMessageHandler } from './firebase';

const NotificationsProvider = ({ children }: { children: ReactNode }) => {
    
    useEffect(() => {
        registerServiceWorker();

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        let unsubscribeFromForegroundMessages = () => { };

        if (localStorage.getItem("isLogedIn") === "true") {
            console.log("Zustand: User authenticated, setting up foreground message handler.");
            unsubscribeFromForegroundMessages = onForegroundMessageHandler((payload: { notification: any; data: any; }) => {
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
            unsubscribeFromForegroundMessages();
        };
    }, []);

    return <>{children}</>;
};

export default NotificationsProvider;