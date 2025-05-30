import { Outlet } from "react-router-dom";
import Logo from "../components/header/Logo";
import SearchBar from "../components/header/SearchBar";
import UserBar from '../components/header/UserBar';
import NavigationMenu from '../components/menu/NavigationMenu';
import SupportMenu from '../components/menu/SupportMenu';
import { useEffect, useState } from "react";
import DateSelection from "../components/header/DateSelection";
import i18n from 'i18next';
import { useDarkContext } from "../context/DarkContext";
import { Fullscreen } from "lucide-react";

import confirm from '../assets/confirmedNew.png';
import cancel from '../assets/canceledNew.png';
import pending from '../assets/pendingNew.png';
import seated from '../assets/seatedNew.png';
import seatedDark from '../assets/seatedNewDark.png';
import confirmDark from '../assets/confirmedNewDark.png';
import cancelDark from '../assets/canceledNewDARK.png';
import pendingDark from '../assets/pendingNewDark.png';

import { Helmet } from "react-helmet-async";
import { useList } from "@refinedev/core";
import { useDateContext } from "../context/DateContext";
import { format } from "date-fns";

const RootLayout = () => {
  const { darkMode } = useDarkContext();
  const { chosenDay } = useDateContext();

  const { data: reservationsActionsData, isLoading, error } = useList({
    resource: 'api/v1/dashboard/top-actions',
    filters: [
      {
        field: "start_date",
        operator: "eq",
        value: (format(chosenDay, 'yyyy-MM-dd')),
      },
      {
        field: "end_date",
        operator: "eq",
        value: (format(chosenDay, 'yyyy-MM-dd')),
      },
    ],
    queryOptions:{
      onSuccess: (data) => {
        console.log('Data fetched successfully:', data);
      }
    }
  });

  interface ReservationAction {
    action: string;
    count: number;
  }

  const [actions, setActions] = useState<ReservationAction[]>([
    {
      action: "pending",
      count: 0,
    },
    {
      action: "confirmed",
      count: 0,
    },
    {
      action: "cancelled",
      count: 0,
    },
    {
      action: "fulfilled",
      count: 0
    },
    {
      action: "seated",
      count: 0
    }
  ]);

  useEffect(() => {
    if (reservationsActionsData?.data) {
      setActions(reservationsActionsData.data as ReservationAction[]);
    }
  }, [reservationsActionsData]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'm') {
        toggleFullscreen();
      }
    };

    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      } else {
        document.exitFullscreen().catch(err => {
          console.error(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`);
        });
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  localStorage.setItem('preferredLanguage', 'en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    } else {
      i18n.changeLanguage('en');
    }
  }, []);

  const { preferredLanguage: shownlang} = useDateContext();
  const [stateOfSideBar, setStateOfSideBar] = useState(false);

  const strokeColor = "stroke-[#1e1e1e70] dark:stroke-[#ffffff70]";

  return (
    <div className={`flex overflow-hidden ${(shownlang === 'ar') ? "rtl" : ''} bg-white dark:bg-bgdarktheme dark:text-textdarktheme`}>
      <div className="sm:hidden">
        <NavigationMenu stateOfSideBar={stateOfSideBar} handleSideBar={() => { setStateOfSideBar(!stateOfSideBar) }} />
      </div>
      <div className={`h-full lt-sm:hidden transition-all duration-300 ease-in-out ${stateOfSideBar ? 'w-[300px]' : 'w-[100px]'}`}>
        <div className="transition-all duration-300 ease-in-out">
          <Logo className={stateOfSideBar ? 'horizontal' : ''} />
        </div>
        <NavigationMenu stateOfSideBar={stateOfSideBar} handleSideBar={() => { setStateOfSideBar(!stateOfSideBar) }} />
      </div>

      <div className={`transition-all duration-300 ease-in-out lt-sm:w-full ${stateOfSideBar ? 'gt-sm:w-[calc(100%-300px)]' : 'gt-sm:w-[calc(100%-100px)]'}`}>
        <header className='h-[80px] items-center flex justify-between gap-1 px-6 lt-sm:px-2'>
          <div className="sm:hidden"><Logo /></div>
          <button
              className={`
                lt-sm:hidden flex items-center justify-center
                transition-all duration-500 ease-in-out
                group
              `}
              onClick={() => {
                setStateOfSideBar(!stateOfSideBar)
              }}
              aria-label={stateOfSideBar ? "Collapse sidebar" : "Expand sidebar"}
            >
              {/* Animated hamburger/arrow button */}
              <div className="relative w-5 h-5">
                {/* Top line */}
                <span
                  className={`
                    absolute top-0 left-0 rounded w-4 h-[0.17em] bg-greentheme 
                    transform transition-all duration-500 ease-in-out
                    ${stateOfSideBar ? "rotate-45 translate-y-[.78em] w-[.8em] -translate-x-[1.8px] bottom-0 bg-redtheme" : ""}
                  `}
                ></span>
                
                {/* Middle line */}
                <span
                  className={`
                    absolute top-2 left-0 w-5 rounded h-[0.17em] bg-greentheme 
                    transition-all duration-500 ease-in-out
                    ${stateOfSideBar ? " bg-redtheme" : "opacity-100 w-3"}
                  `}
                ></span>
                
                {/* Bottom line */}
                <span
                  className={`
                    absolute top-4 left-0 w-3 rounded h-[0.17em] bg-greentheme 
                    transform transition-all duration-500 ease-in-out
                    ${stateOfSideBar ? "-rotate-45 -translate-y-3 w-[.8em] -translate-x-[2px] bg-redtheme" : ""}
                  `}
                ></span>
              </div>
            </button>
          {/* <button className={`lt-sm:hidden z-10 p-2 rounded-md hover:bg-softgreytheme dark:hover:bg-subblack`} onClick={() => { setStateOfSideBar(!stateOfSideBar) }}>
            {stateOfSideBar ?
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={strokeColor}>
                <path d="M12 12L19 19M12 12L5 5M12 12L5 19M12 12L19 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              :
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={strokeColor}>
                <path d="M3 6H21M3 12H21M3 18H21" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          </button> */}
          <div className="flex gap-1 gt-md:gap-2 lt-sm:hidden">
            <div className="flex items-center gap-2 btn border-softbluetheme cursor-default hover:border-bluetheme text-bluetheme">
              <img src={pending} alt="pending" className="size-4 lt-lg:size-3 block dark:hidden" />
              <img src={pendingDark} alt="pending" className="size-4 lt-lg:size-3 hidden dark:block" />
              <span className="text-[1.2rem] lt-lg:text-[1rem] font-[600]">{actions[0].count}</span>
            </div>
            <div className="flex items-center gap-2 btn border-softgreentheme cursor-default hover:border-greentheme text-greentheme">
              <img src={confirm} alt="confirm" className="size-4 lt-lg:size-3 block dark:hidden" />
              <img src={confirmDark} alt="confirm" className="size-4 lt-lg:size-3 hidden dark:block" />
              <span className="text-[1.2rem] lt-lg:text-[1rem] font-[600]">{actions[1].count}</span>
            </div>
            <div className="flex items-center gap-2 btn border-softredtheme cursor-default hover:border-redtheme text-redtheme">
              <img src={cancel} alt="cancel" className="size-4 lt-lg:size-3 block dark:hidden" />
              <img src={cancelDark} alt="cancel" className="size-4 lt-lg:size-3 hidden dark:block" />
              <span className="text-[1.2rem] lt-lg:text-[1rem] font-[600]">{actions[2].count}</span>
            </div>
            <div className="flex items-center gap-2 btn border-softyellowtheme cursor-default hover:border-yellowtheme text-yellowtheme">
              <img src={seated} alt="cancel" className="size-4 lt-lg:size-3 block dark:hidden" />
              <img src={seatedDark} alt="cancel" className="size-4 lt-lg:size-3 hidden dark:block" />
              <span className="text-[1.2rem] lt-lg:text-[1rem] font-[600]">{actions[4].count}</span>
            </div>
          </div>

          <DateSelection />

          <UserBar />

        </header>
        <section className='flex justify-between h-[calc(100vh-80px)]'>
          <div className={`p-[1em] w-full h-full lt-sm:pb-[10em] overflow-x-hidden overflow-y-scroll bg-[#F6F6F6] dark:bg-bgdarktheme2 dark:text-textdarktheme`}>
            <Outlet />
            <div className="lt-sm:h-[4em]"></div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RootLayout;