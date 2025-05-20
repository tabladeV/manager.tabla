import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationIconProps {
  hasUnread: boolean;
  unreadCount: number;
  onClick: () => void;
}

const NotificationIcon = React.forwardRef<HTMLButtonElement, NotificationIconProps>(({ hasUnread, unreadCount, onClick }, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      className="relative w-10 h-10 flex justify-center items-center rounded-full transition-colors duration-200 bg-[#88AB6115] hover:bg-[#88AB6130] dark:bg-bgdarktheme2 dark:hover:bg-opacity-80"
      aria-label="Toggle notifications"
    >
      <Bell className="text-gray-600 dark:text-gray-300" size={20} />
      {hasUnread && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white dark:ring-bgdarktheme">
          {unreadCount > 0 ? (unreadCount>99?"99+":unreadCount) : null}
          {unreadCount === 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>} {/* Blinking dot if count is 0 but hasUnread is true */}
        </span>
      )}
    </button>
  );
});

NotificationIcon.displayName = 'NotificationIcon';

export default NotificationIcon;
