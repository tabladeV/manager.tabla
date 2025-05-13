import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import i18n, { t } from 'i18next';
import { Fullscreen, LogOut, Moon, Minimize, Settings, Sun, User, Store, RefreshCw } from 'lucide-react';

// Import assets
import profilepic from '../../assets/profile.png';
import english from '../../assets/english.png';
import arabic from '../../assets/arabic.jpg';
import french from '../../assets/french.png';
import WidgetOnlineToggle from '../common/WidgetOnlineToggle';
import authProvider from '../../providers/authProvider';
import { useDarkContext } from '../../context/DarkContext';
import { useDateContext } from '../../context/DateContext';
import NotificationsDropdown from './notifications/NotificationsDropdown';

const UserBar = () => {
  // State management
  const [showLang, setShowLang] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(!!document.fullscreenElement);

  const { darkMode: isDarkMode, setDarkMode } = useDarkContext();
  const { userData, restaurantData, preferredLanguage, setPreferredLanguage } = useDateContext();
  
  // Refs for click outside detection
  const langMenuRef = useRef<HTMLDivElement>(null);
  const langButtonRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: { target: any; }) => {
      // Close language dropdown if clicked outside
      if (
        showLang &&
        langMenuRef.current && 
        !langMenuRef.current.contains(event.target) &&
        langButtonRef.current &&
        !langButtonRef.current.contains(event.target)
      ) {
        setShowLang(false);
      }
      
      // Close profile dropdown if clicked outside
      if (
        showProfile &&
        profileMenuRef.current && 
        !profileMenuRef.current.contains(event.target) &&
        profileButtonRef.current && 
        !profileButtonRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showLang, showProfile]);

  // Set up dark mode on component mount
  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      localStorage.getItem('darkMode') === 'true'
    );
  }, []);

  // Handle fullscreen changes from browser
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Language selection handler
  const setLanguage = (language: string | undefined) => {
    if (language) {
      setPreferredLanguage(language);
      i18n.changeLanguage(language);
      setShowLang(false);
      // window.location.reload();
    }
  };

  // Dark mode toggle handler
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.documentElement.classList.toggle("dark", newMode);
    // window.location.reload();
  };

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.error(`Error attempting to exit full-screen mode: ${err.message}`);
      });
    }
  };

  // Logout handler
  const handleLogout = () => {
    authProvider.logout({});
  };

  // Determine current language icon
  const getCurrentLanguageIcon = () => {
    if (preferredLanguage === 'fr') return french;
    if (preferredLanguage === 'ar') return arabic;
    return english; // Default to English
  };

  // Background color based on dark mode
  const bgColor = isDarkMode ? 'bg-bgdarktheme' : 'bg-white';
  const buttonBgColor = isDarkMode ? 'bg-bgdarktheme2' : 'bg-[#88AB6115]';
  const hoverBgColor = 'hover:bg-[#88AB6115]';

  // Get user's full name
  const userFullName = userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : 'User';
  
  // Get user's initials for avatar fallback
  const userInitials = userData ? 
    `${userData.first_name?.[0] || ''}${userData.last_name?.[0] || ''}`.toUpperCase() : 'U';


    const [showShortCut,setShowShortCut]=useState<boolean>(false)
  return (
    <div className="relative">
      {/* Language Selector Dropdown */}
      {showLang && (
        <div 
          ref={langMenuRef}
          className={`absolute top-12 right-16 p-3 flex flex-col rounded-md shadow-lg z-20 ${bgColor} min-w-36`}
        >
          <button
            className={`flex items-center gap-2 p-2 rounded hover:bg-opacity-80 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              preferredLanguage === 'en' ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
            onClick={() => setLanguage('en')}
          >
            <img src={english} className="w-6 h-6" alt="English" />
            <span>English</span>
          </button>
          <button
            className={`flex items-center gap-2 p-2 rounded hover:bg-opacity-80 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              preferredLanguage === 'fr' ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
            onClick={() => setLanguage('fr')}
          >
            <img src={french} className="w-6 h-6" alt="French" />
            <span>Français</span>
          </button>
          <button
            className={`flex items-center gap-2 p-2 rounded hover:bg-opacity-80 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              preferredLanguage === 'ar' ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
            onClick={() => setLanguage('ar')}
          >
            <img src={arabic} className="w-6 h-6" alt="Arabic" />
            <span>العربية</span>
          </button>
        </div>
      )}

      {/* Top Bar Controls */}
      <div className="flex items-center gap-2">
        {/* Current Restaurant Display */}
        {restaurantData && (
          <div className="hidden md:flex items-center mr-2 px-2 py-1 rounded-lg bg-greentheme bg-opacity-10">
            <Store size={16} className="mr-1 text-greentheme" />
            <span className="text-sm font-medium truncate max-w-[120px]">{restaurantData.name}</span>
          </div>
        )}
        
        {/* Widget Online Toggle Button */}
        <WidgetOnlineToggle />

        {/* Notifications Dropdown - ADDED HERE */}
        <NotificationsDropdown />

        {/* Language Selector Button */}
        <button
          ref={langButtonRef}
          onClick={() => setShowLang(!showLang)}
          className={`${buttonBgColor} w-10 h-10 flex justify-center items-center rounded-full transition-colors duration-200`}
          aria-label="Change language"
        >
          <img src={getCurrentLanguageIcon()} className="w-6 h-6" alt="Language" />
        </button>
        
        {/* Profile Button */}
        <button 
          ref={profileButtonRef}
          onClick={() => setShowProfile(!showProfile)}
          className={`flex items-center gap-2 ${hoverBgColor} transition-colors duration-200 p-2 rounded-lg`}
          aria-expanded={showProfile}
          aria-haspopup="menu"
        >
          {userData?.bo_profile?.image ? (
            <img 
              className="h-10 w-10 rounded-full object-cover" 
              src={userData.bo_profile.image} 
              alt={userFullName}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-greentheme text-white flex items-center justify-center font-medium">
              {userInitials}
            </div>
          )}
          <div className="hidden md:block text-left">
            <div className="font-medium">{userFullName}</div>
            {/* <div className="text-xs text-gray-500">{userData?.email}</div> */}
          </div>
          <svg 
            width="10" 
            height="6" 
            viewBox="0 0 10 6" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={showProfile ? "transform rotate-180 transition-transform duration-200" : "transition-transform duration-200"}
          >
            <path 
              d="M9 1L5 5L1 1" 
              stroke={isDarkMode ? '#e1e1e1' : '#1e1e1e'} 
              strokeOpacity="0.75" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Profile Dropdown Menu */}
      {showProfile && (
        <div 
          ref={profileMenuRef}
          className={`absolute right-0 mt-2 w-64 rounded-md shadow-lg z-50 ${bgColor} py-1`}
        >
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
            <div className="font-medium">{userFullName}</div>
            <div className="text-sm text-gray-500">{userData?.email}</div>
          </div>
          
          {/* Restaurant Info Section */}
          {restaurantData && (
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center">
                <Store size={16} className="mr-2 text-greentheme" />
                <span className="font-medium">{restaurantData.name}</span>
              </div>
              {restaurantData.address && (
                <div className="text-sm text-gray-500 mt-1 pl-6">{restaurantData.address}</div>
              )}
              <div className='mt-1'>
              <Link to='/change-restaurant' className='btn-primary px-2 py-1'>
                <span className='text-xs'>{t('header.buttons.changeRestaurant')}</span>
              </Link>
              </div>
            </div>
          )}
          
          <Link 
            to="/profile" 
            className="flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <User size={18} className="mr-2" />
            <span>Profile</span>
          </Link>
          
          <Link 
            to="/settings" 
            className="flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 sm:hidden"
          >
            <Settings size={18} className="mr-2" />
            <span>Settings</span>
          </Link>
          
          {/* Added Theme Toggle in Dropdown */}
          <button 
            onClick={toggleDarkMode}
            className="flex w-full items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isDarkMode ? (
              <>
                <Sun size={18} className="mr-2" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={18} className="mr-2" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
          
          {/* Added Fullscreen Toggle in Dropdown */}
          <button 
            onClick={toggleFullscreen}
            onMouseOver={()=>{setShowShortCut(true)}}
            onMouseLeave={()=>{setShowShortCut(false)}}
            className="flex w-full items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isFullScreen ? (
              <>
                <Minimize size={18} className="mr-2" />
                <span>Exit Fullscreen</span>{ showShortCut&& <span className='ml-3 flex items-center gap-1 lt-sm:hidden'><span className='text-[10px]  text-white/80 py-[0px] px-2 btn rounded-md'>Ctrl</span><span className='text-[10px]  text-white/80 py-[0px] px-2 btn rounded-md'>M</span> </span>}
              </>
            ) : (
              <>
                <Fullscreen size={18} className="mr-2" />
                <span>Enter Fullscreen </span>{ showShortCut&& <span className='ml-3 flex items-center gap-1 lt-sm:hidden'><span className='text-[10px]  text-white/80 py-[0px] px-2 btn rounded-md'>Ctrl</span><span className='text-[10px]  text-white/80 py-[0px] px-2 btn rounded-md'>M</span> </span>}
              </>
            )}
          </button>
          
          {/* Widget Online Toggle in Dropdown */}
          <WidgetOnlineToggle showLabel size={18} />
          
          <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
          
          <button 
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LogOut size={18} className="mr-2" />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserBar;