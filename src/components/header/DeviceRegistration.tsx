// src/components/DeviceRegistration.jsx
import React, { useState, useEffect } from 'react';
import { requestNotificationPermissionAndToken } from '../../providers/firebase';


const DeviceRegistration = () => {
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [permissionStatus, setPermissionStatus] = useState('default');

    useEffect(() => {
        if ('Notification' in window) setPermissionStatus(Notification.permission);
        const interval = setInterval(() => {
            if ('Notification' in window && Notification.permission !== permissionStatus) {
                setPermissionStatus(Notification.permission);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [permissionStatus]);

    const handleRequestPermission = async () => {
        const token = await requestNotificationPermissionAndToken();
        if (token) {
            setFcmToken(token);
            alert('Device registration process initiated! Check console for FCM token and backend response. You may need to refresh the page for some permission changes to fully reflect.');
        } else {
            alert('Failed to get FCM token. Check browser console, ensure notifications are not blocked for this site, and that your VAPID key is correct.');
        }
        if ('Notification' in window) setPermissionStatus(Notification.permission);
    };

    return (
        <div className="mt-8 p-6 border border-slate-200 rounded-xl bg-white shadow-lg dark:bg-bgdarktheme">
            <h4 className="text-xl font-semibold text-slate-700 mb-3">Device Push Notifications</h4>
            <p className="text-sm text-slate-600 mb-1">
                Browser Permission:
                <strong className={`ml-2 capitalize px-2 py-0.5 rounded-full text-xs font-medium ${permissionStatus === 'granted' ? 'bg-green-100 text-green-700' :
                    permissionStatus === 'denied' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                    {permissionStatus}
                </strong>
            </p>

            {permissionStatus === 'denied' && (
                <p className="text-xs text-red-600 mt-1">
                    Notifications are blocked. You may need to reset this site's permissions in your browser settings.
                </p>
            )}

            {permissionStatus !== 'granted' && (
                <button
                    onClick={handleRequestPermission}
                    className="mt-4 btn btn-primary text-sm"
                >
                    Request Permission & Register Device
                </button>
            )}
            {permissionStatus === 'granted' && !fcmToken && (
                <button
                    onClick={handleRequestPermission}
                    className="mt-4 btn btn-secondary text-sm" // Changed to secondary for re-registration
                >
                    Re-Register Device / Get Token
                </button>
            )}
            {fcmToken && (
                <p className="mt-3 text-sm text-green-600 flex items-center">
                    <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    Device registration attempted (FCM Token sent to backend).
                </p>
            )}
        </div>
    );
};
export default DeviceRegistration;