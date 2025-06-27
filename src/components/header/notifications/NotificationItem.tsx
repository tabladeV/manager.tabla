import React from 'react';
import { NotificationType } from './notificationsData';
import { Calendar, Info, AlertTriangle } from 'lucide-react';

interface NotificationItemProps {
  notification: NotificationType;
  onClick?: (notification:NotificationType) => void; // Added onClick prop
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const getIcon = () => {
    switch (notification.notification_type) {
      case 'RESERVATION':
        return <Calendar size={16} className="text-greentheme" />;
      case 'ALERT':
        return <AlertTriangle size={16} className="text-red-500" />;
      default:
        return <Info size={16} className="text-gray-500" />;
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    }
  };

  return (
    <div 
      className={`relative p-3 border-b border-slate-200 dark:border-slate-700 dark:hover:bg-bgdarktheme2/30 cursor-pointer ${!notification.is_read ? 'bg-greentheme/10 animate-pulse dark:bg-bgdarktheme2' : ''}`}
      onClick={handleClick} // Call handleClick on div click
    >
      {!notification.is_read  && <span className="absolute top-1 right-1 flex size-3 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-1 ring-white dark:ring-bgdarktheme">

      </span>}
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 pt-1">{getIcon()}</div>
        <div>
          <h5 className={`text-sm font-semibold ${!notification.is_read ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
            {notification.title}
          </h5>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {notification.message}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {new Date(notification.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
