import React, { useState, useEffect, useRef, useCallback } from 'react';
import NotificationIcon from './NotificationIcon';
import NotificationItem from './NotificationItem';
import { NotificationType } from './notificationsData'; // Corrected import to NotificationType
import DeviceRegistration from '../DeviceRegistration';
import { useDarkContext } from '../../../context/DarkContext';
import axiosInstance from '../../../providers/axiosInstance';
import axios from 'axios'; // Import axios to use isAxiosError
import { useNavigate } from 'react-router-dom';

// Define a more specific type for the API response if known, e.g.:
interface NotificationsApiResponse {
  results: NotificationType[];
  count?: number;
  unread_count?: number;
  // Add other fields if your API returns them
}

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState('default');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);

  const { darkMode: isDarkMode } = useDarkContext();
  const navigate = useNavigate();
  
  const fetchNotifications = useCallback(async () => {
    if (permissionStatus !== 'granted') {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const params = { limit: 20, offset: 0 };
      console.log('Fetching notifications with params:', params);
      const response = await axiosInstance.get<NotificationsApiResponse>('api/v1/notifications/', { params });
      
      const results = response.data.results || (Array.isArray(response.data) ? response.data as NotificationType[] : []);
      setNotifications(results);
      setUnreadCount(results.filter(n => !n.is_read).length);

    } catch (err: unknown) { // Changed to unknown for better type safety
      let errorMsg = 'Failed to fetch notifications';
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.detail || err.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      console.error('Error fetching notifications:', errorMsg, err);
      setError(errorMsg);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [permissionStatus]);

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
    const interval = setInterval(() => {
      if ('Notification' in window && Notification.permission !== permissionStatus) {
        const newPermissionStatus = Notification.permission;
        setPermissionStatus(newPermissionStatus);
        if (newPermissionStatus === 'granted' && isOpen) {
            fetchNotifications();
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [permissionStatus, isOpen, fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  },[fetchNotifications])

  useEffect(() => {
    if (isOpen && permissionStatus === 'granted') {
      fetchNotifications();
    }
  }, [isOpen, permissionStatus, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        iconRef.current && 
        !iconRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (notification: NotificationType) => {
    const originalNotifications = [...notifications];
    const itemIndex = notifications.findIndex(item => item.notification_id === notification.notification_id);

    if (itemIndex !== -1 && !notifications[itemIndex].is_read) {
      const updatedNotifications = notifications.map(item =>
        item.notification_id === notification.notification_id ? { ...item, is_read: true, read_at: new Date().toISOString() } : item
      );
      setNotifications(updatedNotifications);
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      console.log('Marking notification as read:', notification.notification_id);
      await axiosInstance.post(`api/v1/notifications/${notification.notification_id}/mark-read/`);
      // After successful API call, redirect if this is a RESERVATION notification
      if (notification.notification_type === 'RESERVATION') {
        // Check if reservation_id exists in the data
        if (notification.data && notification.data.reservation_id) {
          // Close the dropdown before navigation
          setIsOpen(false);

          // Navigate to the reservations page with the reservation_id as a query parameter
          navigate(`/reservations?reservation_id=${notification.data.reservation_id}`);
        }
      }
    } catch (err: unknown) { // Changed to unknown
      if (notification.notification_type === 'RESERVATION') {
        // Check if reservation_id exists in the data
        if (notification.data && notification.data.reservation_id) {
          // Close the dropdown before navigation
          setIsOpen(false);

          // Navigate to the reservations page with the reservation_id as a query parameter
          navigate(`/reservations?reservation_id=${notification.data.reservation_id}`);
        }
      }
      let errorMsg = 'Error marking notification as read';
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.detail || err.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      console.error(errorMsg, err);
      setNotifications(originalNotifications);
      setUnreadCount(originalNotifications.filter(n => !n.is_read).length);
    }
  };
  
  const toggleDropdown = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
  };

  const bgColor = isDarkMode ? 'bg-bgdarktheme' : 'bg-white';
  const hasUnreadNotifications = unreadCount > 0;

  return (
    <div className="relative">
      <NotificationIcon ref={iconRef} unreadCount={unreadCount} hasUnread={hasUnreadNotifications} onClick={toggleDropdown} />

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute top-12 right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-md shadow-lg z-20 ${bgColor} border border-slate-200 dark:border-slate-700`}
        >
          <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notifications</h5>
          </div>

          {permissionStatus !== 'granted' ? (
            <div className="p-2">
              <DeviceRegistration />
            </div>
          ) : isLoading ? (
            <p className="p-4 text-sm text-slate-500 dark:text-slate-400 text-center">Loading...</p>
          ) : error ? (
            <p className="p-4 text-sm text-red-500 dark:text-red-400 text-center">{error}</p>
          ) : notifications.length > 0 ? (
            notifications.map((notif: NotificationType) => (
              <NotificationItem
                key={notif.user_notification_id}
                notification={notif}
                onClick={(notification) => handleMarkAsRead(notification)} // Added onClick to mark as read
              />
            ))
          ) : (
            <p className="p-4 text-sm text-slate-500 dark:text-slate-400 text-center">No new notifications.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
