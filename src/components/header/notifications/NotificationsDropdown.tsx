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
  count: number; // Total count of notifications matching filters for the current tab
}

interface NotificationCount {
  read: number;
  total: number;
  unread: number;
}

const PAGE_SIZE = 20; // Define page size for notifications
type ActiveTab = 'unread' | 'read';

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState<NotificationCount | null | undefined>();
  const [permissionStatus, setPermissionStatus] = useState('default');

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('unread');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);

  const { darkMode: isDarkMode } = useDarkContext();
  const navigate = useNavigate();
  
  const fetchGlobalCounts = useCallback(async () => {
    try {
      const countResponse = await axiosInstance.get<NotificationCount>('api/v1/notifications/count/');
      const countData = countResponse.data || { read: 0, total: 0, unread: 0 };
      setNotificationCount(countData);
    } catch (err) {
      console.error('Failed to fetch global notification counts:', err);
      // Optionally set an error state for counts or use stale data
    }
  }, []);

  const fetchData = useCallback(async (page: number, tab: ActiveTab) => {
    if (permissionStatus !== 'granted') {
      setNotifications([]);
      // setNotificationCount({ read: 0, total: 0, unread: 0 }); // Global counts fetched separately
      setHasMore(false);
      setCurrentPage(1);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const params = { page_size: PAGE_SIZE, page, read: tab === 'read' };
      const response = await axiosInstance.get<NotificationsApiResponse>('api/v1/notifications/', { params });
      
      const apiResults = response.data.results || [];
      const totalItemsForCurrentTab = response.data.count || 0;
      
      if (page === 1) {
        setNotifications(apiResults);
      } else {
        setNotifications(prevNotifications => [...prevNotifications, ...apiResults]);
      }
      
      setHasMore(page * PAGE_SIZE < totalItemsForCurrentTab);
      setCurrentPage(page);
      // Fetch global counts separately if needed or rely on periodic updates
      fetchGlobalCounts();

    } catch (err: unknown) {
      let errorMsg = 'Failed to fetch notifications';
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.detail || err.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      console.error(`Error fetching ${tab} notifications:`, errorMsg, err);
      setError(errorMsg);
      if (page === 1) {
        setNotifications([]);
      }
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [permissionStatus, fetchGlobalCounts]);

  useEffect(() => {
    if (isOpen && permissionStatus === 'granted') {
      fetchData(1, activeTab); 
    } else if (permissionStatus !== 'granted') {
      setNotifications([]);
      setNotificationCount({ read: 0, total: 0, unread: 0 });
      setHasMore(false);
      setCurrentPage(1);
    }
  }, [isOpen, permissionStatus, activeTab, fetchData]);

  useEffect(() => {
    if (!('Notification' in window)) return;

    const checkPermission = () => {
      const currentBrowserPermission = Notification.permission;
      if (currentBrowserPermission !== permissionStatus) {
        setPermissionStatus(currentBrowserPermission);
      }
    };

    checkPermission();
    const intervalId = setInterval(checkPermission, 1000);
    
    return () => clearInterval(intervalId);
  }, [permissionStatus]);


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
    // Optimistic update for the current list (if it's unread tab)
    if (activeTab === 'unread' && !notification.is_read) {
        setNotifications(prev => prev.filter(n => n.user_notification_id !== notification.user_notification_id));
    }


    try {
      await axiosInstance.post(`api/v1/notifications/${notification.user_notification_id}/mark-read/`);
      await fetchGlobalCounts(); // Refresh global counts
      // Refresh current tab's first page to ensure consistency
      // If on unread tab, item should disappear. If on read tab, it should appear/update.
      fetchData(1, activeTab); 

      if (notification.notification_type === 'RESERVATION') {
        if (notification.data && notification.data.reservation_id) {
          setIsOpen(false);
          navigate(`/reservations?reservation_id=${notification.data.reservation_id}`);
        }
      }
    } catch (err: unknown) {
      setNotifications(originalNotifications); // Revert optimistic update on error
      await fetchGlobalCounts(); // Still try to refresh counts
      let errorMsg = 'Error marking notification as read';
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.detail || err.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      console.error(errorMsg, err);
      setError(errorMsg); // Show error related to this action

      if (notification.notification_type === 'RESERVATION') {
        if (notification.data && notification.data.reservation_id) {
          setIsOpen(false);
          navigate(`/reservations?reservation_id=${notification.data.reservation_id}`);
        }
      }
    }
  };
  
  const toggleDropdown = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen && permissionStatus === 'granted') {
      // fetchData(1, activeTab) will be called by useEffect based on isOpen change
      fetchGlobalCounts(); // Ensure counts are fresh when opening
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && permissionStatus === 'granted') {
        console.log("[NotificationsDropdown] Tab focused. Fetching global counts.");
        fetchGlobalCounts();
        if (isOpen) {
          console.log("[NotificationsDropdown] Dropdown open on tab focus. Fetching current tab data.");
          fetchData(1, activeTab);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [permissionStatus, isOpen, activeTab, fetchData, fetchGlobalCounts]);

  useEffect(() => {
    const handleNewNotification = () => {
      console.log("[NotificationsDropdown] 'newNotificationReceived' event caught. Updating counts.");
      fetchGlobalCounts();
      if (isOpen && activeTab === 'unread') {
        console.log("[NotificationsDropdown] Dropdown open on 'unread' tab. Refreshing list.");
        fetchData(1, 'unread');
      }
    };

    window.addEventListener('newNotificationReceived', handleNewNotification);
    return () => {
      window.removeEventListener('newNotificationReceived', handleNewNotification);
    };
  }, [fetchGlobalCounts, fetchData, isOpen, activeTab]);

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchData(currentPage + 1, activeTab);
    }
  };

  const handleClearAll = async () => {
    if (isLoading || (notificationCount?.total || 0) === 0) return;
    setIsLoading(true);
    try {
      await axiosInstance.delete('api/v1/notifications/clear-all/');
      await fetchGlobalCounts();
      fetchData(1, activeTab); // Refresh current tab
    } catch (err) {
      let errorMsg = 'Failed to clear notifications';
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.detail || err.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      console.error(errorMsg, err);
      setError(errorMsg);
      setIsLoading(false); 
    }
  };

  const handleMarkAllAsRead = async () => {
    if (isLoading || (notificationCount?.unread || 0) === 0) return;
    setIsLoading(true);
    try {
      await axiosInstance.post('api/v1/notifications/mark-all-read/');
      await fetchGlobalCounts();
      setActiveTab('unread'); // Switch to unread tab as it should be empty or updated
      fetchData(1, 'unread'); 
    } catch (err) {
      let errorMsg = 'Failed to mark all notifications as read';
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.detail || err.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      console.error(errorMsg, err);
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    // fetchData(1, tab) will be called by the useEffect watching activeTab
  };

  useEffect(()=>{
    if (Notification.permission === 'granted') {
      fetchGlobalCounts();
    }
  },[]);

  const bgColor = isDarkMode ? 'bg-bgdarktheme' : 'bg-white';
  const hasUnreadGlobalNotifications = (notificationCount?.unread || 0) > 0;

  return (
    <div className="relative">
      <NotificationIcon ref={iconRef} unreadCount={notificationCount?.unread || 0} hasUnread={hasUnreadGlobalNotifications} onClick={toggleDropdown} />

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute top-12 gt-sm:right-0 -right-[120px] mt-2 w-80 max-h-96 rounded-md shadow-lg z-20 ${bgColor} border border-slate-200 dark:border-slate-700 flex flex-col`}
        >
          <div className="p-3 pb-0 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-inherit z-10">
            <div className="flex justify-between items-center mb-2">
              <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notifications</h5>
            </div>
            {permissionStatus === 'granted' && (
              <div className="flex space-x-2 border-b border-slate-300 dark:border-slate-600">
              <button
                onClick={() => handleTabChange('unread')}
                className={`pb-1 text-sm ${activeTab === 'unread' ? 'border-b-2 border-blue-500 text-blue-500 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                Unread ({notificationCount?.unread || 0})
              </button>
              <button
                onClick={() => handleTabChange('read')}
                className={`pb-1 text-sm ${activeTab === 'read' ? 'border-b-2 border-blue-500 text-blue-500 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                Read ({notificationCount?.read || 0})
              </button>
            </div>
            )}
          </div>

          <div className="flex-grow overflow-y-auto pt-2"> {/* Added pt-2 for spacing after tabs */}
            {permissionStatus !== 'granted' ? (
              <div className="p-2">
                <DeviceRegistration />
              </div>
            ) : isLoading && notifications.length === 0 ? (
              <p className="p-4 text-sm text-slate-500 dark:text-slate-400 text-center">Loading...</p>
            ) : error && notifications.length === 0 ? (
              <p className="p-4 text-sm text-red-500 dark:text-red-400 text-center">{error}</p>
            ) : notifications.length > 0 ? (
              <>
                {notifications.map((notif: NotificationType) => (
                  <NotificationItem
                    key={notif.user_notification_id}
                    notification={notif}
                    onClick={(notification) => handleMarkAsRead(notification)}
                  />
                ))}
                {hasMore && !isLoading && (
                  <div className="p-2 text-center">
                    <button
                      onClick={handleLoadMore}
                      className="text-sm underline cursor-pointer text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      disabled={isLoading}
                    >
                      Load more
                    </button>
                  </div>
                )}
                {isLoading && notifications.length > 0 && (
                   <p className="p-4 text-sm text-slate-500 dark:text-slate-400 text-center">Loading more...</p>
                )}
              </>
            ) : (
              <p className="p-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                {activeTab === 'unread' ? 'No unread notifications.' : 'No read notifications.'}
              </p>
            )}
          </div>
          
          {permissionStatus === 'granted' && (notificationCount?.total || 0) > 0 && (
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center sticky bottom-0 bg-inherit z-10">
              <button
                onClick={handleMarkAllAsRead}
                disabled={isLoading || (notificationCount?.unread || 0) === 0}
                className="text-xs underline cursor-pointer text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark all as read ({notificationCount?.unread || 0})
              </button>
              <button
                onClick={handleClearAll}
                disabled={isLoading || (notificationCount?.total || 0) === 0}
                className="text-xs underline cursor-pointer text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear all ({notificationCount?.total || 0})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
