import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom'
import { usePowerContext } from '../../context/PowerContext';
import { BaseKey, CanAccess, BaseRecord, useList, useUpdate } from '@refinedev/core';
import { MessagesSquare, Store } from 'lucide-react';
import WidgetOnlineToggle from '../common/WidgetOnlineToggle';
import { useDarkContext } from '../../context/DarkContext'; // Import the dark context hook

interface NavigationMenuProps {
    stateOfSideBar: boolean;
    handleSideBar: () => void;
}

const NavigationMenu = (props: NavigationMenuProps) => {
  // Use the dark context instead of localStorage
  const { darkMode } = useDarkContext();

  const {mutate: widgetActivation} = useUpdate({
    resource: `api/v1/bo/restaurants`,
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });
  
  const id = localStorage.getItem('restaurant_id')
  interface Widget extends BaseRecord{
    id: BaseKey,
    title: string,
    description: string,
    restaurant: string,
    image: string,
    menu_file: string,
    has_menu: boolean,
    is_widget_activated: boolean,
    disabled_title: string,
    disabled_description: string
  }
  const {data, isLoading, error} = useList<{data:Widget}>({
    resource: `api/v1/bo/restaurants/${id}/widget/`,
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    }
  })

  const [widgetData, setWidgetData] = useState<Widget>()

  const { power, setPower } = usePowerContext(); // Get the global date from context

  useEffect(() => {
    if(data?.data){
      setWidgetData(data.data as unknown as Widget)
    }
  }, [data])

  useEffect(() => {
    if(widgetData){
      setPower(widgetData.is_widget_activated)
    }
  }, [widgetData])

    const normalMenuClass = 'flex items-center my-1 hover:bg-[#88AB6115] fill-[#1E1E1E75] text-[#1E1E1E75] dark:text-textdarktheme transition duration-150 rounded-[10px] px-[1em] h-[3em] gap-[1em]';
    const darkMenuClass = 'flex items-center my-1 hover:bg-[#88AB6115] text-whitetheme transition duration-150 rounded-[10px] px-[1em] h-[3em] gap-[1em]';
    const navigatedMenuClass = 'flex items-center my-1 bg-greentheme text-white fill-white hover:bg-[#88AB61] transition duration-150 rounded-[10px] px-[1em] h-[3em] gap-[1em]';

    const {pathname} = useLocation();

    const [showSubMenuPlaces, setShowSubMenuPlaces] = useState(false);

    const stateOfSideBar = props.stateOfSideBar;

    const updateActivation = () => {
      const formData = new FormData();
      const activated = widgetData?.is_widget_activated ? false : true
      formData.append('is_widget_activated', activated.toString())
      widgetActivation({
        id: `${id}/widget_partial_update/`,
        values: formData,
        
      })
      if (widgetData) {
        setWidgetData({
          ...widgetData,
          is_widget_activated: !widgetData.is_widget_activated,
        });
      }
    }

    const {t} = useTranslation();
    
  return (
    <div className={`px-[1.4em] gap-2 flex flex-col justify-between sm:h-[calc(100vh-100px)] overflow-y-auto no-scrollbar lt-sm:fixed lt-sm:z-10 lt-sm:bottom-0 bg-white dark:bg-bgdarktheme dark:text-textdarktheme ${stateOfSideBar && 'w-[18em]'} lt-sm:w-full lt-sm:h-100px`}>
      <div className='lt-sm:flex lt-sm:justify-around lt-sm:p-1'>
        <CanAccess action="view" resource="dashboard">
          <Link to='/' className={`${stateOfSideBar ? 'w-[13em]' : ''} ${pathname === '/' ? navigatedMenuClass : normalMenuClass}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.33333 10.8333H8.33333C8.79167 10.8333 9.16667 10.4583 9.16667 10V3.33333C9.16667 2.875 8.79167 2.5 8.33333 2.5H3.33333C2.875 2.5 2.5 2.875 2.5 3.33333V10C2.5 10.4583 2.875 10.8333 3.33333 10.8333ZM3.33333 17.5H8.33333C8.79167 17.5 9.16667 17.125 9.16667 16.6667V13.3333C9.16667 12.875 8.79167 12.5 8.33333 12.5H3.33333C2.875 12.5 2.5 12.875 2.5 13.3333V16.6667C2.5 17.125 2.875 17.5 3.33333 17.5ZM11.6667 17.5H16.6667C17.125 17.5 17.5 17.125 17.5 16.6667V10C17.5 9.54167 17.125 9.16667 16.6667 9.16667H11.6667C11.2083 9.16667 10.8333 9.54167 10.8333 10V16.6667C10.8333 17.125 11.2083 17.5 11.6667 17.5ZM10.8333 3.33333V6.66667C10.8333 7.125 11.2083 7.5 11.6667 7.5H16.6667C17.125 7.5 17.5 7.125 17.5 6.66667V3.33333C17.5 2.875 17.125 2.5 16.6667 2.5H11.6667C11.2083 2.5 10.8333 2.875 10.8333 3.33333Z" fill={pathname === '/' || darkMode ? 'white' : '#1e1e1e'} fillOpacity={pathname === '/' ? '1' : '0.75'} />
            </svg>

            <h2 className={`font-[500] text-[17px] ${stateOfSideBar ? 'block' : 'hidden'}`}>{t('overview.title')}</h2>
          </Link>
        </CanAccess>

        <CanAccess action="view" resource="reservation">
          <Link to='/reservations' className={`${pathname === '/reservations' ? navigatedMenuClass : normalMenuClass}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.8333 12.5V15.8333H13.3333V17.5H6.66667V15.8333H9.16667V12.5H3.33333C3.11232 12.5 2.90036 12.4122 2.74408 12.2559C2.5878 12.0996 2.5 11.8877 2.5 11.6667V3.33333C2.5 3.11232 2.5878 2.90036 2.74408 2.74408C2.90036 2.5878 3.11232 2.5 3.33333 2.5H16.6667C16.8877 2.5 17.0996 2.5878 17.2559 2.74408C17.4122 2.90036 17.5 3.11232 17.5 3.33333V11.6667C17.5 11.8877 17.4122 12.0996 17.2559 12.2559C17.0996 12.4122 16.8877 12.5 16.6667 12.5H10.8333ZM6.66667 6.66667V8.33333H13.3333V6.66667H6.66667Z" fill={pathname === '/reservations' || darkMode ? 'white' : '#1e1e1e'} fillOpacity={pathname === '/reservations' ? '1' : '0.75'} />
            </svg>

            <h2 className={`font-[500] text-[17px] ${stateOfSideBar ? 'block' : 'hidden'}`}>{t('reservations.title')}</h2>
          </Link>
        </CanAccess>

        <CanAccess resource='floor' action='view'>
        <Link to='/places' onClick={()=>{setShowSubMenuPlaces(true)}} className={`${pathname.includes('/places') || (pathname === '/places/design') ? navigatedMenuClass : normalMenuClass}`}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.99998 1.66667C6.49998 1.66667 3.33331 4.35001 3.33331 8.50001C3.33331 11.15 5.37498 14.2667 9.44998 17.8583C9.76665 18.1333 10.2416 18.1333 10.5583 17.8583C14.625 14.2667 16.6666 11.15 16.6666 8.50001C16.6666 4.35001 13.5 1.66667 9.99998 1.66667ZM9.99998 10C9.08331 10 8.33331 9.25001 8.33331 8.33334C8.33331 7.41667 9.08331 6.66667 9.99998 6.66667C10.9166 6.66667 11.6666 7.41667 11.6666 8.33334C11.6666 9.25001 10.9166 10 9.99998 10Z" fill={(pathname.includes('/places')) || darkMode ? 'white':'#1e1e1e'} fillOpacity={(pathname === '/places') || (pathname === '/places/design') ? '1':'0.75'}/>
          </svg>

          <h2 className={`font-[500] text-[17px] ${stateOfSideBar ? 'block' : 'hidden'}`}>{t('placeManagement.title')}</h2>
        </Link>
        </CanAccess>

        {(pathname.includes('/places')) && 
        <div className='flex lt-sm:hidden items-left flex-col gap-1'>
          <CanAccess resource='floor' action='view'>
          <Link to='/places' className={`hover:bg-[#88AB6115] items-center flex text-[#1E1E1E75] dark:text-textdarktheme transition duration-150 h-[3em] rounded-[10px] px-[1em] py-[.6em]  gap-[1em] ${pathname==='/places' ? 'text-greentheme':''}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 19C2.45 19 1.97933 18.8043 1.588 18.413C1.19667 18.0217 1.00067 17.5507 1 17V7C1 6.45 1.196 5.97933 1.588 5.588C1.98 5.19667 2.45067 5.00067 3 5H13C13.55 5 14.021 5.196 14.413 5.588C14.805 5.98 15.0007 6.45067 15 7V17C15 17.55 14.8043 18.021 14.413 18.413C14.0217 18.805 13.5507 19.0007 13 19H3ZM3 17H13V7H3V17ZM17 19V5H19V19H17ZM21 19V5H23V19H21Z" fill={(pathname === '/places') || darkMode ? '#88AB61':'#1e1e1e'} fillOpacity={(pathname === '/places') ? '1':'0.3'}/>
            </svg>

            <h2 className={`font-[500] text-[17px] ${stateOfSideBar ? 'block' : 'hidden'}`}>{t('overview.title')}</h2>
          </Link>
          </CanAccess>
          <CanAccess resource='floor' action='view'>
          <Link to='/places/design' className={`hover:bg-[#88AB6115] items-center flex text-[#1E1E1E75] dark:text-textdarktheme transition duration-150 rounded-[10px] px-[1em] py-[.6em] h-[3em] gap-[1em] ${pathname.includes('/places/design') ? 'text-greentheme':''}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.00014 17.25V21H6.75014L17.8101 9.93001L14.0601 6.18001L3.00014 17.25ZM22.6101 18.36L18.3601 22.61L13.1601 17.41L14.9301 15.64L15.9301 16.64L18.4001 14.16L19.8201 15.58L18.3601 17L19.4201 18L20.8401 16.6L22.6101 18.36ZM6.61014 10.83L1.39014 5.64001L5.64014 1.39001L7.40014 3.16001L4.93014 5.64001L6.00014 6.70001L8.46014 4.22001L9.88014 5.64001L8.46014 7.05001L9.46014 8.05001L6.61014 10.83ZM20.7101 7.00001C21.1001 6.61001 21.1001 6.00001 20.7101 5.59001L18.3701 3.29001C18.0001 2.90001 17.3501 2.90001 16.9601 3.29001L15.1201 5.12001L18.8701 8.87001L20.7101 7.00001Z" fill={pathname.includes('/places/design') || darkMode ? '#88AB61':'#1e1e1e'} fillOpacity={pathname.includes('/places/design')? '1':'0.3'}/>
            </svg>

            <h2 className={`font-[500] text-[17px] ${stateOfSideBar ? 'block' : 'hidden'}`}>{t('editPlace.title')}</h2>
          </Link>
          </CanAccess>
        </div>
        }
        
        <CanAccess action="view" resource="reservation">
        <Link to='/agenda/grid' className={`${(pathname.includes('/agenda')) ? navigatedMenuClass : normalMenuClass}`}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.45832 2.08334C6.45832 1.91758 6.39247 1.7586 6.27526 1.64139C6.15805 1.52418 5.99908 1.45834 5.83332 1.45834C5.66756 1.45834 5.50858 1.52418 5.39137 1.64139C5.27416 1.7586 5.20832 1.91758 5.20832 2.08334V3.4C4.00832 3.49584 3.22165 3.73084 2.64332 4.31C2.06415 4.88834 1.82915 5.67584 1.73248 6.875H18.2675C18.1708 5.675 17.9358 4.88834 17.3566 4.31C16.7783 3.73084 15.9908 3.49584 14.7916 3.39917V2.08334C14.7916 1.91758 14.7258 1.7586 14.6086 1.64139C14.4914 1.52418 14.3324 1.45834 14.1666 1.45834C14.0009 1.45834 13.8419 1.52418 13.7247 1.64139C13.6075 1.7586 13.5416 1.91758 13.5416 2.08334V3.34417C12.9875 3.33334 12.3658 3.33334 11.6666 3.33334H8.33332C7.63415 3.33334 7.01248 3.33334 6.45832 3.34417V2.08334Z" fill={pathname.includes('/agenda') || darkMode ? 'white':'#1e1e1e'} fillOpacity={pathname.includes('/agenda')? '1':'0.75'}/>
              <path fillRule="evenodd" clipRule="evenodd" d="M1.66669 10C1.66669 9.30083 1.66669 8.67917 1.67752 8.125H18.3225C18.3334 8.67917 18.3334 9.30083 18.3334 10V11.6667C18.3334 14.8092 18.3334 16.3808 17.3567 17.3567C16.3809 18.3333 14.8092 18.3333 11.6667 18.3333H8.33335C5.19085 18.3333 3.61919 18.3333 2.64335 17.3567C1.66669 16.3808 1.66669 14.8092 1.66669 11.6667V10ZM14.1667 11.6667C14.3877 11.6667 14.5997 11.5789 14.7559 11.4226C14.9122 11.2663 15 11.0543 15 10.8333C15 10.6123 14.9122 10.4004 14.7559 10.2441C14.5997 10.0878 14.3877 10 14.1667 10C13.9457 10 13.7337 10.0878 13.5774 10.2441C13.4212 10.4004 13.3334 10.6123 13.3334 10.8333C13.3334 11.0543 13.4212 11.2663 13.5774 11.4226C13.7337 11.5789 13.9457 11.6667 14.1667 11.6667ZM14.1667 15C14.3877 15 14.5997 14.9122 14.7559 14.7559C14.9122 14.5996 15 14.3877 15 14.1667C15 13.9457 14.9122 13.7337 14.7559 13.5774C14.5997 13.4211 14.3877 13.3333 14.1667 13.3333C13.9457 13.3333 13.7337 13.4211 13.5774 13.5774C13.4212 13.7337 13.3334 13.9457 13.3334 14.1667C13.3334 14.3877 13.4212 14.5996 13.5774 14.7559C13.7337 14.9122 13.9457 15 14.1667 15ZM10.8334 10.8333C10.8334 11.0543 10.7456 11.2663 10.5893 11.4226C10.433 11.5789 10.221 11.6667 10 11.6667C9.77901 11.6667 9.56705 11.5789 9.41076 11.4226C9.25448 11.2663 9.16669 11.0543 9.16669 10.8333C9.16669 10.6123 9.25448 10.4004 9.41076 10.2441C9.56705 10.0878 9.77901 10 10 10C10.221 10 10.433 10.0878 10.5893 10.2441C10.7456 10.4004 10.8334 10.6123 10.8334 10.8333ZM10.8334 14.1667C10.8334 14.3877 10.7456 14.5996 10.5893 14.7559C10.433 14.9122 10.221 15 10 15C9.77901 15 9.56705 14.9122 9.41076 14.7559C9.25448 14.5996 9.16669 14.3877 9.16669 14.1667C9.16669 13.9457 9.25448 13.7337 9.41076 13.5774C9.56705 13.4211 9.77901 13.3333 10 13.3333C10.221 13.3333 10.433 13.4211 10.5893 13.5774C10.7456 13.7337 10.8334 13.9457 10.8334 14.1667ZM5.83335 11.6667C6.05437 11.6667 6.26633 11.5789 6.42261 11.4226C6.57889 11.2663 6.66669 11.0543 6.66669 10.8333C6.66669 10.6123 6.57889 10.4004 6.42261 10.2441C6.26633 10.0878 6.05437 10 5.83335 10C5.61234 10 5.40038 10.0878 5.2441 10.2441C5.08782 10.4004 5.00002 10.6123 5.00002 10.8333C5.00002 11.0543 5.08782 11.2663 5.2441 11.4226C5.40038 11.5789 5.61234 11.6667 5.83335 11.6667ZM5.83335 15C6.05437 15 6.26633 14.9122 6.42261 14.7559C6.57889 14.5996 6.66669 14.3877 6.66669 14.1667C6.66669 13.9457 6.57889 13.7337 6.42261 13.5774C6.26633 13.4211 6.05437 13.3333 5.83335 13.3333C5.61234 13.3333 5.40038 13.4211 5.2441 13.5774C5.08782 13.7337 5.00002 13.9457 5.00002 14.1667C5.00002 14.3877 5.08782 14.5996 5.2441 14.7559C5.40038 14.9122 5.61234 15 5.83335 15Z" fill={(pathname.includes('/agenda')) || darkMode ? 'white':'#1e1e1e'} fillOpacity={(pathname.includes('/agenda'))? '1':'0.75'}/>
          </svg>

          <h2 className={`font-[500] text-[17px] ${stateOfSideBar ? 'block' : 'hidden'}`}>{t('grid.title')}</h2>
        </Link>
        </CanAccess>

        <CanAccess action="view" resource="customer">
        <Link to='/clients' className={`${pathname.includes('clients') ? navigatedMenuClass : normalMenuClass}`}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_8_101)">
              <path d="M6.66667 8.96667H6.18334C5.52376 8.94283 4.86632 9.0548 4.25181 9.29563C3.63731 9.53646 3.07886 9.90102 2.61112 10.3667L2.47778 10.5222V15.1222H4.74445V12.5111L5.05001 12.1667L5.18889 12.0056C5.91219 11.2625 6.81266 10.7157 7.80556 10.4167C7.30862 10.0382 6.9166 9.53912 6.66667 8.96667Z" fill={pathname.includes('clients') || darkMode ? 'white':'#1e1e1e'} fillOpacity={pathname.includes('clients')? '1':'0.75'}/>
              <path d="M17.4111 10.35C16.9433 9.88435 16.3849 9.5198 15.7704 9.27897C15.1559 9.03813 14.4984 8.92616 13.8389 8.95C13.6366 8.95108 13.4345 8.96221 13.2333 8.98333C12.9787 9.52038 12.5974 9.9875 12.1222 10.3444C13.1823 10.6374 14.1426 11.2136 14.9 12.0111L15.0389 12.1667L15.3389 12.5111V15.1278H17.5277V10.5056L17.4111 10.35Z" fill={pathname.includes('clients') || darkMode ? 'white':'#1e1e1e'} fillOpacity={pathname.includes('clients')? '1':'0.75'}/>
              <path d="M6.16668 7.88333H6.3389C6.25888 7.19625 6.37944 6.50068 6.68603 5.88061C6.99262 5.26053 7.47213 4.74244 8.06668 4.38889C7.85116 4.05964 7.55382 3.792 7.20379 3.61219C6.85376 3.43238 6.46303 3.34656 6.06986 3.36313C5.6767 3.37969 5.29457 3.49809 4.96091 3.70671C4.62725 3.91533 4.35348 4.20703 4.16643 4.55325C3.97938 4.89946 3.88544 5.28832 3.89383 5.68175C3.90221 6.07518 4.01263 6.45968 4.21426 6.79761C4.4159 7.13554 4.70184 7.41532 5.04409 7.60953C5.38634 7.80375 5.77316 7.90575 6.16668 7.90555V7.88333Z" fill={pathname.includes('clients') || darkMode ? 'white':'#1e1e1e'} fillOpacity={pathname.includes('clients')? '1':'0.75'}/>
              <path d="M13.5722 7.46667C13.5785 7.59437 13.5785 7.7223 13.5722 7.85C13.6788 7.86707 13.7865 7.87636 13.8945 7.87778H14C14.3918 7.85689 14.7715 7.73491 15.1022 7.52371C15.4328 7.31252 15.7031 7.0193 15.8868 6.67262C16.0705 6.32594 16.1613 5.9376 16.1504 5.54541C16.1394 5.15322 16.0271 4.77054 15.8244 4.43464C15.6216 4.09874 15.3354 3.82106 14.9935 3.62863C14.6516 3.4362 14.2657 3.33558 13.8733 3.33656C13.481 3.33755 13.0956 3.44011 12.7546 3.63426C12.4137 3.82841 12.1288 4.10753 11.9278 4.44444C12.4306 4.77274 12.8441 5.22072 13.1311 5.7482C13.4181 6.27569 13.5697 6.86616 13.5722 7.46667Z" fill={pathname.includes('clients') || darkMode ? 'white':'#1e1e1e'} fillOpacity={pathname.includes('clients')? '1':'0.75'}/>
              <path d="M9.92779 9.95556C11.2993 9.95556 12.4111 8.84373 12.4111 7.47222C12.4111 6.10072 11.2993 4.98889 9.92779 4.98889C8.55628 4.98889 7.44446 6.10072 7.44446 7.47222C7.44446 8.84373 8.55628 9.95556 9.92779 9.95556Z" fill={pathname.includes('clients') || darkMode ? 'white':'#1e1e1e'} fillOpacity={pathname.includes('clients')? '1':'0.75'}/>
              <path d="M10.0611 11.2778C9.33562 11.2488 8.61176 11.3667 7.93298 11.6245C7.2542 11.8823 6.63451 12.2745 6.11112 12.7778L5.97223 12.9333V16.45C5.9744 16.5645 5.99911 16.6775 6.04496 16.7825C6.09081 16.8875 6.15689 16.9825 6.23944 17.0619C6.32198 17.1414 6.41937 17.2038 6.52604 17.2456C6.63271 17.2874 6.74657 17.3078 6.86112 17.3056H13.2445C13.359 17.3078 13.4729 17.2874 13.5795 17.2456C13.6862 17.2038 13.7836 17.1414 13.8661 17.0619C13.9487 16.9825 14.0148 16.8875 14.0606 16.7825C14.1065 16.6775 14.1312 16.5645 14.1333 16.45V12.9444L14 12.7778C13.4802 12.2727 12.8627 11.8792 12.1854 11.6212C11.5081 11.3633 10.7852 11.2464 10.0611 11.2778Z" fill={pathname.includes('clients') || darkMode ? 'white':'#1e1e1e'} fillOpacity={pathname.includes('clients')? '1':'0.75'}/>
              </g>
              <defs>
              <clipPath id="clip0_8_101">
              <rect width="20" height="20" fill="white"/>
              </clipPath>
              </defs>
          </svg>
          <h2 className={`font-[500] text-[17px] ${stateOfSideBar ? 'block' : 'hidden'}`}>{t('clients.title')}</h2>
        </Link>
        </CanAccess>

        <CanAccess action="view" resource="review">
        <Link to='/reviews' className={`${pathname.includes('reviews') ? navigatedMenuClass : normalMenuClass}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM6 14V11.53L12.88 4.65C13.08 4.45 13.39 4.45 13.59 4.65L15.36 6.42C15.56 6.62 15.56 6.93 15.36 7.13L8.47 14H6ZM17 14H10.5L12.5 12H17C17.55 12 18 12.45 18 13C18 13.55 17.55 14 17 14Z" fill={pathname === '/reviews' || darkMode ? 'white':'#1e1e1e'} fillOpacity={pathname === '/reviews'? '1':'0.75'}/>
          </svg>

          <h2 className={`font-[500] text-[17px] ${stateOfSideBar ? 'block' : 'hidden'}`}>{t('reviews.title')}</h2>
        </Link>
        </CanAccess>

        <CanAccess action="view" resource="message">
          <Link to='/messages' className={`${pathname.includes('messages') ? navigatedMenuClass : normalMenuClass}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 12V3C17 2.73478 16.8946 2.48043 16.7071 2.29289C16.5196 2.10536 16.2652 2 16 2H3C2.73478 2 2.48043 2.10536 2.29289 2.29289C2.10536 2.48043 2 2.73478 2 3V17L6 13H16C16.2652 13 16.5196 12.8946 16.7071 12.7071C16.8946 12.5196 17 12.2652 17 12ZM21 6H19V15H6V17C6 17.2652 6.10536 17.5196 6.29289 17.7071C6.48043 17.8946 6.73478 18 7 18H18L22 22V7C22 6.73478 21.8946 6.48043 21.7071 6.29289C21.5196 6.10536 21.2652 6 21 6Z" fill={pathname === '/messages' || darkMode ? 'white' : '#1e1e1e'} fillOpacity={pathname === '/messages' ? '1' : '0.75'} />
            </svg>

            <h2 className={`font-[500] text-[17px] ${stateOfSideBar ? 'block' : 'hidden'}`}>{t('messages.title')}</h2>
          </Link>
        </CanAccess>
      </div>

      <div className='lt-sm:hidden'>
        <Link to='/support' className={`${pathname === '/support' ? navigatedMenuClass : normalMenuClass}`}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.15875 13.4775L8.1575 13.4737L7.92 13.3962C6.79045 12.997 5.79944 12.2815 5.065 11.335C4.47111 10.5702 4.06303 9.67791 3.87296 8.72846C3.68289 7.779 3.71602 6.79837 3.96975 5.86391C4.22347 4.92945 4.69085 4.06672 5.33501 3.34378C5.97918 2.62083 6.7825 2.05745 7.68163 1.69806C8.58076 1.33867 9.5511 1.1931 10.5161 1.27285C11.4811 1.3526 12.4144 1.65547 13.2423 2.15758C14.0703 2.65969 14.7702 3.34731 15.287 4.16619C15.8037 4.98507 16.1231 5.91281 16.22 6.87625C16.2537 7.22 15.97 7.5 15.625 7.5C15.28 7.5 15.0038 7.21875 14.9625 6.87625C14.8509 5.99229 14.5052 5.15419 13.9611 4.44868C13.4169 3.74317 12.6941 3.19587 11.8675 2.86342C11.0409 2.53097 10.1405 2.42544 9.25936 2.55774C8.37827 2.69005 7.54853 3.05539 6.85601 3.61596C6.16348 4.17653 5.63332 4.91197 5.32039 5.74618C5.00746 6.58039 4.92312 7.48307 5.0761 8.36081C5.22909 9.23855 5.61383 10.0595 6.19052 10.7386C6.76722 11.4178 7.51491 11.9305 8.35625 12.2237C8.56847 11.8367 8.91045 11.5369 9.32198 11.3772C9.7335 11.2175 10.1882 11.2081 10.6059 11.3507C11.0237 11.4932 11.3778 11.7786 11.6058 12.1566C11.8338 12.5346 11.9212 12.9809 11.8525 13.4169C11.7838 13.853 11.5635 14.2508 11.2303 14.5404C10.8971 14.83 10.4725 14.9927 10.0311 14.9999C9.58972 15.0072 9.15995 14.8584 8.81745 14.5799C8.47496 14.3015 8.2417 13.9111 8.15875 13.4775ZM7.1675 14.4462C5.94326 13.9464 4.87293 13.1318 4.065 12.085C3.85964 12.393 3.75004 12.7548 3.75 13.125V13.75C3.75 16.2137 6.075 18.75 10 18.75C13.925 18.75 16.25 16.2137 16.25 13.75V13.125C16.25 12.6277 16.0525 12.1508 15.7008 11.7992C15.3492 11.4475 14.8723 11.25 14.375 11.25H12.5C12.7622 11.6001 12.9479 12.0014 13.0452 12.4279C13.1425 12.8543 13.1492 13.2965 13.0649 13.7257C12.9805 14.1549 12.807 14.5616 12.5556 14.9195C12.3041 15.2774 11.9803 15.5785 11.6051 15.8034C11.2299 16.0283 10.8117 16.1719 10.3776 16.225C9.94337 16.278 9.50288 16.2393 9.08459 16.1114C8.6663 15.9835 8.27952 15.7692 7.94929 15.4823C7.61905 15.1955 7.35271 14.8425 7.1675 14.4462ZM13.75 7.5C13.75 6.3575 13.2388 5.33375 12.4325 4.64625C12.0388 4.31281 11.5806 4.06418 11.0865 3.91591C10.5924 3.76764 10.073 3.72293 9.56076 3.78456C9.04856 3.84619 8.55458 4.01284 8.10973 4.27409C7.66488 4.53534 7.27871 4.88557 6.97539 5.30288C6.67207 5.72018 6.45811 6.19558 6.34691 6.69935C6.2357 7.20312 6.22964 7.72441 6.32909 8.23063C6.42854 8.73684 6.63138 9.2171 6.92491 9.64135C7.21844 10.0656 7.59635 10.4247 8.035 10.6962C8.59083 10.2456 9.28446 9.99943 10 9.99875C10.7152 9.99872 11.4088 10.244 11.965 10.6937C12.5105 10.3581 12.961 9.88841 13.2734 9.32934C13.5859 8.77026 13.75 8.14047 13.75 7.5Z" fill={pathname === '/support' || darkMode ? 'white':'#1e1e1e'} fillOpacity={pathname === '/support'? '1':'0.75'}/>
          </svg>

          <h2 className={`font-[500] text-[17px] ${stateOfSideBar ? 'block' : 'hidden'}`}>Support</h2>
        </Link>

        <Link to='/change-restaurant' className={`${pathname === '/change-restaurant' ? navigatedMenuClass : normalMenuClass}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.99995 4H19C19.2833 4 19.5209 4.096 19.7129 4.288C19.9049 4.48 20.0006 4.71733 20 5C19.9993 5.28267 19.9033 5.52033 19.712 5.713C19.5206 5.90567 19.2833 6.00133 19 6H4.99995C4.71662 6 4.47928 5.904 4.28795 5.712C4.09662 5.52 4.00062 5.28267 3.99995 5C3.99928 4.71733 4.09528 4.48 4.28795 4.288C4.48062 4.096 4.71795 4 4.99995 4ZM4.99995 20C4.71662 20 4.47928 19.904 4.28795 19.712C4.09662 19.52 4.00062 19.2827 3.99995 19V14H3.82495C3.50828 14 3.24995 13.879 3.04995 13.637C2.84995 13.395 2.78328 13.116 2.84995 12.8L3.84995 7.8C3.89995 7.56667 4.01662 7.375 4.19995 7.225C4.38328 7.075 4.59162 7 4.82495 7H19.1749C19.4083 7 19.6166 7.075 19.7999 7.225C19.9833 7.375 20.1 7.56667 20.15 7.8L21.15 12.8C21.2166 13.1167 21.15 13.3957 20.95 13.637C20.75 13.8783 20.4916 13.9993 20.1749 14H20V19C20 19.2833 19.904 19.521 19.712 19.713C19.52 19.905 19.2826 20.0007 19 20C18.7173 19.9993 18.48 19.9033 18.288 19.712C18.096 19.5207 18 19.2833 18 19V14H14V19C14 19.2833 13.904 19.521 13.712 19.713C13.52 19.905 13.2826 20.0007 13 20H4.99995Z"  fill={pathname === '/change-restaurant' || darkMode ? 'white':'#1e1e1e'} fillOpacity={pathname === '/change-restaurant'? '1':'0.75'}/>
          </svg>
          <h2 className={`font-[500] text-[17px] ${stateOfSideBar ? 'block' : 'hidden'}`}>Restaurants</h2>
        </Link>

        <CanAccess resource="restaurant" action="view">
          <Link to='/settings' className={`${pathname.includes('settings') ? navigatedMenuClass : normalMenuClass}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M7.50002 2.68583C7.49999 2.49709 7.56403 2.31392 7.68166 2.16632C7.79928 2.01872 7.96354 1.91542 8.14752 1.87333C9.3667 1.5957 10.6328 1.59627 11.8517 1.87499C12.0358 1.91692 12.2003 2.02015 12.3181 2.16777C12.4359 2.31539 12.5 2.49864 12.5 2.68749V4.22666C12.5 4.37294 12.5385 4.51664 12.6117 4.64332C12.6848 4.77 12.79 4.8752 12.9167 4.94833C13.0434 5.02147 13.1871 5.05997 13.3334 5.05997C13.4796 5.05997 13.6233 5.02147 13.75 4.94833L15.0842 4.17749C15.2479 4.08301 15.4388 4.04698 15.6257 4.07529C15.8125 4.10361 15.9842 4.1946 16.1125 4.33333C16.9607 5.25099 17.593 6.34657 17.9634 7.54C18.0193 7.72048 18.0122 7.91462 17.9434 8.09056C17.8745 8.26651 17.7478 8.41382 17.5842 8.50833L16.25 9.27833C16.1234 9.35147 16.0182 9.45667 15.945 9.58335C15.8719 9.71002 15.8334 9.85372 15.8334 10C15.8334 10.1463 15.8719 10.29 15.945 10.4166C16.0182 10.5433 16.1234 10.6485 16.25 10.7217L17.5834 11.4908C17.7468 11.5853 17.8733 11.7325 17.9422 11.9082C18.0111 12.084 18.0183 12.278 17.9625 12.4583C17.5947 13.6534 16.9624 14.7503 16.1125 15.6675C15.9841 15.8061 15.8124 15.8969 15.6255 15.9251C15.4387 15.9532 15.2478 15.9171 15.0842 15.8225L13.75 15.0517C13.6233 14.9785 13.4796 14.94 13.3334 14.94C13.1871 14.94 13.0434 14.9785 12.9167 15.0517C12.79 15.1248 12.6848 15.23 12.6117 15.3567C12.5385 15.4833 12.5 15.627 12.5 15.7733V17.315C12.4998 17.5037 12.4356 17.6868 12.3178 17.8342C12.2 17.9817 12.0357 18.0848 11.8517 18.1267C10.6325 18.4043 9.36646 18.4037 8.14752 18.125C7.96354 18.0829 7.79928 17.9796 7.68166 17.832C7.56403 17.6844 7.49999 17.5012 7.50002 17.3125V15.7733C7.50002 15.627 7.46151 15.4833 7.38837 15.3567C7.31523 15.23 7.21003 15.1248 7.08335 15.0517C6.95667 14.9785 6.81296 14.94 6.66669 14.94C6.52041 14.94 6.3767 14.9785 6.25002 15.0517L4.91586 15.8225C4.75218 15.917 4.56125 15.953 4.3744 15.9247C4.18754 15.8964 4.01586 15.8054 3.88752 15.6667C3.46473 15.2094 3.09437 14.7062 2.78336 14.1667C2.47164 13.6274 2.2212 13.0549 2.03669 12.46C1.98075 12.2795 1.9878 12.0854 2.0567 11.9094C2.12559 11.7335 2.25224 11.5862 2.41586 11.4917L3.74919 10.7217C3.87586 10.6485 3.98105 10.5433 4.05419 10.4166C4.12732 10.29 4.16582 10.1463 4.16582 10C4.16582 9.85372 4.12732 9.71002 4.05419 9.58335C3.98105 9.45667 3.87586 9.35147 3.74919 9.27833L2.41752 8.50916C2.25393 8.41482 2.12723 8.2677 2.05819 8.09192C1.98915 7.91614 1.98186 7.72212 2.03752 7.54166C2.40547 6.34688 3.03778 5.2503 3.88752 4.33333C4.01581 4.19479 4.18733 4.10393 4.37401 4.07562C4.56068 4.04731 4.75143 4.08323 4.91502 4.17749L6.25002 4.94833C6.3767 5.02147 6.52041 5.05997 6.66669 5.05997C6.81296 5.05997 6.95667 5.02147 7.08335 4.94833C7.21003 4.8752 7.31523 4.77 7.38837 4.64332C7.46151 4.51664 7.50002 4.37294 7.50002 4.22666V2.68583ZM10 12.5C10.6631 12.5 11.299 12.2366 11.7678 11.7678C12.2366 11.2989 12.5 10.663 12.5 10C12.5 9.33695 12.2366 8.70107 11.7678 8.23223C11.299 7.76339 10.6631 7.5 10 7.5C9.33698 7.5 8.7011 7.76339 8.23226 8.23223C7.76342 8.70107 7.50002 9.33695 7.50002 10C7.50002 10.663 7.76342 11.2989 8.23226 11.7678C8.7011 12.2366 9.33698 12.5 10 12.5Z" fill={pathname.includes('settings') || darkMode ? 'white' : '#1e1e1e'} fillOpacity={pathname.includes('settings') ? '1' : '0.75'} />
            </svg>
            <h2 className={`font-[500] text-[17px] ${stateOfSideBar ? 'block' : 'hidden'}`}>{t('settingsPage.title')}</h2>
          </Link>
        </CanAccess>
      </div>
    </div>
  )
}

export default NavigationMenu