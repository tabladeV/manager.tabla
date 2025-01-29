import { Link } from 'react-router-dom';
import profilepic from '../../assets/ProfilePic.png';
import i18n from 'i18next';
import { useState, useEffect, useRef } from 'react';
import english from '../../assets/english.png';
import arabic from '../../assets/arabic.jpg';
import french from '../../assets/french.png';
import { useDarkContext } from '../../context/DarkContext';
import Cookies from "js-cookie";

import { Fullscreen,  LogOut, Minimize, Settings, User } from 'lucide-react';

const UserBar = () => {
  const { setDarkMode } = useDarkContext();
  const [showLang, setShowLang] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isLogged, setIsLogged] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );


  const divRef = useRef<HTMLDivElement>(null); // Reference for the target div
  const triggerRef = useRef<HTMLButtonElement>(null); // Reference for the trigger button

  const handleClickOutside = (event: MouseEvent) => {
    if (
      divRef.current &&
      !divRef.current.contains(event.target as Node) && // Check if click is outside the target div
      triggerRef.current &&
      !triggerRef.current.contains(event.target as Node) // Check if click is outside the trigger
    ) {
      setShowProfile(false); // Hide the target div
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside); // Cleanup on unmount
    };
  }, []);

  useEffect(() => {
    setDarkMode(isDarkMode);
  }, [isDarkMode, setDarkMode]);

  const setLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('preferredLanguage', language);
    window.location.reload();
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem('darkMode', newMode.toString());
      return newMode;
    });
    window.location.reload();
  };

  const handleLogout = () => {
    Cookies.remove('token');
    document.location.href = '/sign-in';
    setIsLogged(false);
  };

  const [fullScreen, setFullScreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      setFullScreen(true);
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      
      setFullScreen(false);
      document.exitFullscreen().catch(err => {
        console.error(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`);
      });
    }
  }

  return (
    <div>
      {showLang && (
        <div>
          <div
            className='absolute left-0 top-0 w-[100vw] h-[100vh]'
            onClick={() => setShowLang(false)}
          ></div>
          <div className={`absolute top-[50px]  p-2 flex flex-col rounded-md shadow-md z-10 mt-3 ${localStorage.getItem('darkMode')=== 'true'? 'bg-bgdarktheme ':'bg-white'}`}>
            <button
              className=' items-center p-1 flex gap-2 justify-start'
              onClick={() => {
                setLanguage('en');
                setShowLang(false);
              }}
            >
              <img src={english} className='w-6' />
              English
            </button>
            <button
              className=' items-center p-1 flex gap-2 justify-start'
              onClick={() => {
                setLanguage('fr');
                setShowLang(false);
              }}
            >
              <img src={french} className='w-6' />
              Français
            </button>
            <button
              className=' items-center p-1 flex gap-2 justify-start'
              onClick={() => {
                setLanguage('ar');
                setShowLang(false);
              }}
            >
              <img src={arabic} className='w-6' />
              العربية
            </button>
          </div>
        </div>
      )}

      <div className='flex gap-3 items-center'>
        <button className={`bg-[#88AB6115]  w-[40px] h-[40px] flex justify-center items-center rounded-[100%]  lt-sm:hidden ${localStorage.getItem('darkMode')=== 'true'? 'bg-bgdarktheme2':''}`} onClick={toggleFullscreen}>
          {!fullScreen?<Fullscreen size={40} className={`lt-sm:hidden z-10 p-2 rounded-md  `}  />
          :<Minimize size={40} className={`lt-sm:hidden z-10 p-2 rounded-md  `}  />}
        </button>

        <button
          onClick={() => setShowLang(true)}
          className={`bg-[#88AB6115] w-[40px] h-[40px] flex justify-center items-center rounded-[100%] lt-sm:flex ${localStorage.getItem('darkMode')=== 'true'? 'bg-bgdarktheme2':''}`}
        >
          {localStorage.getItem('preferredLanguage') === 'en' && (
            <img src={english} className='w-6' />
          )}
          {localStorage.getItem('preferredLanguage') === 'fr' && (
            <img src={french} className='w-6' />
          )}
          {localStorage.getItem('preferredLanguage') === 'ar' && (
            <img src={arabic} className='w-6' />
          )}
        </button>

        <button
          onClick={toggleDarkMode}
          className={`bg-[#88AB6115] w-[40px] h-[40px] flex justify-center items-center rounded-[100%] ${localStorage.getItem('darkMode')=== 'true'? 'bg-bgdarktheme2':''}`}
        >
          {!isDarkMode ? (
            
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM11 1V5H13V1H11ZM11 19V23H13V19H11ZM23 11H19V13H23V11ZM5 11H1V13H5V11ZM16.24 17.66L18.71 20.13L20.12 18.72L17.65 16.25L16.24 17.66ZM3.87 5.28L6.34 7.75L7.75 6.34L5.28 3.87L3.87 5.28ZM6.34 16.24L3.87 18.71L5.28 20.12L7.75 17.65L6.34 16.24ZM18.72 3.87L16.25 6.34L17.66 7.75L20.13 5.28L18.72 3.87Z" fill="black"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.0581 20C9.83544 20 7.94644 19.2223 6.39111 17.667C4.83577 16.1117 4.05811 14.2227 4.05811 12C4.05811 9.97401 4.71811 8.21734 6.03811 6.73001C7.35811 5.24267 8.99277 4.36467 10.9421 4.09601C10.9961 4.09601 11.0491 4.09801 11.1011 4.10201C11.1531 4.10601 11.2041 4.11167 11.2541 4.11901C10.9168 4.58967 10.6498 5.11301 10.4531 5.68901C10.2564 6.26501 10.1581 6.86867 10.1581 7.50001C10.1581 9.27801 10.7801 10.789 12.0241 12.033C13.2681 13.277 14.7794 13.8993 16.5581 13.9C17.1921 13.9 17.7964 13.8017 18.3711 13.605C18.9458 13.4083 19.4618 13.1413 19.9191 12.804C19.9271 12.854 19.9328 12.905 19.9361 12.957C19.9394 13.009 19.9414 13.062 19.9421 13.116C19.6861 15.0647 18.8144 16.699 17.3271 18.019C15.8398 19.339 14.0841 19.9993 12.0581 20Z" fill="white"/>
            </svg>

          )}
        </button>
        
        <button 
          ref={triggerRef}
          onClick={() => setShowProfile((prev) => !prev)}
          className='flex items-center gap-2 hover:bg-[#88AB6115] transition duration-200 p-[.6em] rounded-[10px]'
        >
          <img className='h-[40px] w-[40px] rounded-[100%]' src={profilepic} alt="user"/>
          {/* <h5 className=' font-semibold lt-sm:hidden'>Alfred Distivano</h5> */}
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 1L5 5L1 1" stroke={localStorage.getItem('darkMode')==='true'?'#e1e1e1':'#1e1e1e'} stroke-opacity="0.75" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {showProfile && 
          <div ref={divRef} className={`absolute mt-[11em] ml-[-4em] flex  flex-col shadow-xl shadow-[#00000005] gap-2 items-start p-2 rounded-md z-[50] ${localStorage.getItem('darkMode')=== 'true'? 'bg-bgdarktheme ':'bg-white'}`}>
            <Link to='/profile' className='flex w-full items-center justify-start gap-2 hover:bg-[#88AB6115] transition duration-200 p-[.6em] rounded-[10px]'>
              <User size={20} />
              <h5 className=' font-semibold'>Profile</h5>
            </Link>
            <Link to='/settings' className='flex sm:hidden w-full items-center justify-start gap-2 hover:bg-[#88AB6115] transition duration-200 p-[.6em] rounded-[10px]'>
              <Settings size={20} />
              <h5 className=' font-semibold'>Settings</h5>
            </Link>
            
            <button onClick={handleLogout} className='flex w-full items-center justify-start gap-2 hover:bg-[#88AB6115] transition duration-200 p-[.6em] rounded-[10px]'>
              <LogOut size={20} />
              <h5 className=' font-semibold'>Log Out</h5>
            </button>
          </div>
        }
        </button>
      </div>
    </div>
  );
};

export default UserBar;
