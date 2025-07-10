import { useTranslation } from "react-i18next";
import { Link, Outlet, useLocation } from "react-router-dom";
import { CanAccess } from "@refinedev/core";
import { useEffect, useState } from "react";
import { useDarkContext } from "../../context/DarkContext";
import { Book, BookImageIcon, CalendarClock, ChevronLeft, ChevronRight, Clock, Computer, DollarSign, ExternalLink, Laptop, Layout, LayoutGrid, LayoutPanelLeft, PartyPopper, PcCase, Settings, Square, Star, Tag, TimerReset, UserCheck, Users } from "lucide-react";
import { DevOnly } from "../../components/DevOnly";

const SettingsPage = () => {
  const { darkMode } = useDarkContext();
  
  useEffect(() => {
    document.title = 'Settings | Tabla'
  }, [])
  const { t } = useTranslation();
  const { pathname } = useLocation();
  
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if(window.innerWidth < 640) {
      setExpanded(true); 
    }else{
      setExpanded(false); 
    }
  }, [window.innerWidth]);

  // Base CSS classes (unchanged)
  const normalMenuClass =
    "hover:underline font-[500] text-[17px] text-left py-2 transition duration-150";
  const navigatedMenuClass =
    "text-greentheme underline font-[500] text-[17px] py-2 transition duration-150";

    
  return (
    <div className="">
      <div>
        <h1>{t("settingsPage.title")}</h1>
      </div>
      <div className="h-[calc(100vh-160px)]  no-scrollbar flex gap-4">
        <div
          className={`h-[calc(100vh-160px)] overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col transition-all duration-500 ease-in-out ${
            expanded ? "w-64 sm:w-1/4" : "w-16"
          } rounded-[10px] px-6 py-4 gap-4 lt-sm:w-full lt-sm:h-fit ${
            localStorage.getItem("preferredLanguage") === "ar" ? "text-right" : ""
          } ${pathname === "/settings" ? "" : "lt-sm:hidden"} ${
            !expanded ? "items-center" : ""
          } text-[#1E1E1E99] bg-white dark:text-white dark:bg-bgdarktheme`}
        >
          <button
              className={`
                lt-sm:hidden flex items-center justify-center
                transition-all duration-500 ease-in-out
                group
              `}
              onClick={() => {
                setExpanded(!expanded)
              }}
              aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              {/* Animated hamburger/arrow button */}
              <div className="relative w-5 h-5">
                {/* Top line */}
                <span
                  className={`
                    absolute top-0 left-0 rounded w-4 h-[0.17em] bg-orangetheme 
                    transform transition-all duration-500 ease-in-out
                    ${expanded ? "rotate-45 translate-y-[.78em] w-[.8em] -translate-x-[1.8px] bottom-0 bg-redtheme" : ""}
                  `}
                ></span>
                
                {/* Middle line */}
                <span
                  className={`
                    absolute top-2 left-0 w-5 rounded h-[0.17em] bg-orangetheme 
                    transition-all duration-500 ease-in-out
                    ${expanded ? " bg-redtheme" : "opacity-100 w-3"}
                  `}
                ></span>
                
                {/* Bottom line */}
                <span
                  className={`
                    absolute top-4 left-0 w-3 rounded h-[0.17em] bg-orangetheme 
                    transform transition-all duration-500 ease-in-out
                    ${expanded ? "-rotate-45 -translate-y-3 w-[.8em] -translate-x-[2px] bg-redtheme" : ""}
                  `}
                ></span>
              </div>
            </button>
          {/* General - no permission yet, so left open */}
          <Link
            to="/settings/general"
            className={` flex items-center gap-3 ${pathname === "/settings/general"
                ? navigatedMenuClass
                : normalMenuClass
              }`}
          >
            <Settings size={22}/>
            {expanded && t("settingsPage.menuItems.general")}
          </Link>

          {/* Availability - check for view_availabilityday */}
          <CanAccess
            resource="availabilityday"
            action="view"
          >
            <Link
              to="/settings/availability"
              className={` flex items-center gap-3 ${pathname === "/settings/availability"
                ? navigatedMenuClass
                : normalMenuClass
              }`}
            >
              <CalendarClock size={22}/>
              {expanded && t("settingsPage.menuItems.availability")}
            </Link>
          </CanAccess>
          <CanAccess
            resource="availabilityday"
            action="view"
          >
            <Link 
            
              to="/settings/workinghours"
              className={` flex items-center gap-3 ${pathname === "/settings/workinghours"
                ? navigatedMenuClass
                : normalMenuClass
              }`}
            >
              <TimerReset size={22}/>
              {expanded && t("settingsPage.menuItems.workingHours")}
            </Link>
          </CanAccess>


          {/* Widget - not restricted */}
          <CanAccess
            resource="occasion"
            action="view"
          >
            <Link to='/settings/occasions' className={`hover:underline flex items-center gap-3 ${pathname === '/settings/occasions' ? navigatedMenuClass : normalMenuClass}`}>
              <PartyPopper size={22}/>
              {expanded && t('settingsPage.menuItems.occasions')}
            </Link>
          </CanAccess>

          <CanAccess
            resource="widget"
            action="view"
          >
            <Link to='/settings/widget/reservation' className={`hover:underline flex items-center gap-3 ${pathname === '/settings/widget/reservation' ? navigatedMenuClass : normalMenuClass}`}>
              <PcCase size={22}/>
              {expanded && t('settingsPage.menuItems.widget')}
            </Link>
          </CanAccess>
          <CanAccess
            resource="reviewwidget"
            action="view"
          >
            <Link to='/settings/widget/review' className={`hover:underline flex items-center gap-3 ${pathname === '/settings/widget/review' ? navigatedMenuClass : normalMenuClass}`}>
              <Star size={22}/>
              {expanded && t('settingsPage.menuItems.reviewWidget')}
            </Link>
          </CanAccess>

          {/* <DevOnly> */}
            <CanAccess
              resource="billing"
              action="view"
            >
              <Link to='/settings/billing' className={`hover:underline flex items-center gap-3 ${pathname === '/settings/billing' ? navigatedMenuClass : normalMenuClass}`}>
                <DollarSign size={22}/>
                {expanded && t('settingsPage.menuItems.billing')}
              </Link>
            </CanAccess>
          {/* </DevOnly> */}

          {/* Roles - check for view_role */}
          <CanAccess
            resource="role"
            action="view"
          >
            <Link
              to="/settings/roles"
              className={` flex items-center gap-3 ${pathname === "/settings/roles"
                  ? navigatedMenuClass
                  : normalMenuClass
                }`}
            >
              <UserCheck size={22}/>
              {expanded &&  t("settingsPage.menuItems.roles")}
            </Link>
          </CanAccess>

          {/* General - no permission yet, so left open*/}
          <CanAccess
            resource="customuser"
            action="view"
          >
            <Link
              to="/settings/users"
              className={` flex items-center gap-3 ${pathname === "/settings/users"
                ? navigatedMenuClass
                : normalMenuClass
                }`}
            >
              <Users size={22}/>
              {expanded && t("settingsPage.menuItems.users")}
            </Link>
          </CanAccess>

          {/* <DevOnly> */}
            <CanAccess 
              resource="tags"
              action="view"
              >
                <Link to='/settings/tags' 
                className={`flex items-center gap-3 ${pathname === "/settings/tags"
                  ? navigatedMenuClass
                  : normalMenuClass
                }`}>
                  <Tag size={22}/>
                  {expanded && t('settingsPage.menuItems.tags')}
                </Link>
            </CanAccess>
            <CanAccess 
              resource="areas"
              action="view"
              >
                <Link to='/settings/areas' 
                className={`flex items-center gap-3 ${pathname === "/settings/areas"
                  ? navigatedMenuClass
                  : normalMenuClass
                }`}>
                  <LayoutPanelLeft size={22}/>
                  {expanded && t('settingsPage.menuItems.areas')}
                </Link>
            </CanAccess>
          {/* </DevOnly> */}
          {/* to be restored after */}
          {/* 
          <Link to='/settings/menu' className={`hover:underline ${pathname === '/settings/menu' ? 'text-greentheme underline':''}`}>{t('settingsPage.menuItems.menu')}</Link>
          <Link to='/settings/photos' className={`hover:underline ${pathname === '/settings/photos' ? 'text-greentheme underline':''}`}>{t('settingsPage.menuItems.photos')}</Link>
          <Link to='/settings/messaging' className={`hover:underline ${pathname === '/settings/messaging' ? 'text-greentheme underline':''}`}>{t('settingsPage.menuItems.messaging')}</Link>
          <Link to='/settings/features' className={`hover:underline ${pathname === '/settings/features' ? 'text-greentheme underline':''}`}>{t('settingsPage.menuItems.features')}</Link> */}

          {/* <Link to='/settings/permissions' className={`hover:underline ${pathname === '/settings/permissions' ? 'text-greentheme underline':''}`}>{t('settingsPage.menuItems.permissions')}</Link> */}
          {/* <Link to='/settings/services' className={`hover:underline ${pathname === '/settings/services' ? 'text-greentheme underline':''}`}>{t('settingsPage.menuItems.services')}</Link> */}
        </div>
        <div className={`w-full h-full  overflow-y-auto ${pathname === '/settings' ? 'lt-sm:hidden' : ''}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
