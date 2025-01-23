import { Link } from 'react-router-dom';
import profilepic from '../../assets/ProfilePic.png';
import i18n from 'i18next';
import { useState, useEffect } from 'react';
import english from '../../assets/english.png';
import arabic from '../../assets/arabic.jpg';
import french from '../../assets/french.png';
import { useDarkContext } from '../../context/DarkContext';
import { AppWindowIcon, Fullscreen, FullscreenIcon, Minimize } from 'lucide-react';

const UserBar = () => {
  const { setDarkMode } = useDarkContext();
  const [showLang, setShowLang] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );

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
        <button className={`bg-[#88AB6115]  w-[40px] h-[40px] flex justify-center items-center rounded-[100%] lt-sm:hidden ${localStorage.getItem('darkMode')=== 'true'? 'bg-bgdarktheme2':''}`} onClick={toggleFullscreen}>
          {!fullScreen?<Fullscreen size={40} className={`lt-sm:hidden z-10 p-2 rounded-md  ${localStorage.getItem('darkMode')=== 'true' ?'hover:bg-subblack':'hover:bg-softgreytheme'}`}  />
          :<Minimize size={40} className={`lt-sm:hidden z-10 p-2 rounded-md  ${localStorage.getItem('darkMode')=== 'true' ?'hover:bg-subblack':'hover:bg-softgreytheme'}`}  />}
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
          className={`bg-[#88AB6115] w-[40px] h-[40px] flex justify-center items-center rounded-[100%] lt-sm:hidden ${localStorage.getItem('darkMode')=== 'true'? 'bg-bgdarktheme2':''}`}
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
        <Link to='settings' className='flex items-center gap-2 sm:hidden p-[.6em] rounded-[10px]'>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M7.50002 2.68583C7.49999 2.49709 7.56403 2.31392 7.68166 2.16632C7.79928 2.01872 7.96354 1.91542 8.14752 1.87333C9.3667 1.5957 10.6328 1.59627 11.8517 1.87499C12.0358 1.91692 12.2003 2.02015 12.3181 2.16777C12.4359 2.31539 12.5 2.49864 12.5 2.68749V4.22666C12.5 4.37294 12.5385 4.51664 12.6117 4.64332C12.6848 4.77 12.79 4.8752 12.9167 4.94833C13.0434 5.02147 13.1871 5.05997 13.3334 5.05997C13.4796 5.05997 13.6233 5.02147 13.75 4.94833L15.0842 4.17749C15.2479 4.08301 15.4388 4.04698 15.6257 4.07529C15.8125 4.10361 15.9842 4.1946 16.1125 4.33333C16.9607 5.25099 17.593 6.34657 17.9634 7.54C18.0193 7.72048 18.0122 7.91462 17.9434 8.09056C17.8745 8.26651 17.7478 8.41382 17.5842 8.50833L16.25 9.27833C16.1234 9.35147 16.0182 9.45667 15.945 9.58335C15.8719 9.71002 15.8334 9.85372 15.8334 10C15.8334 10.1463 15.8719 10.29 15.945 10.4166C16.0182 10.5433 16.1234 10.6485 16.25 10.7217L17.5834 11.4908C17.7468 11.5853 17.8733 11.7325 17.9422 11.9082C18.0111 12.084 18.0183 12.278 17.9625 12.4583C17.5947 13.6534 16.9624 14.7503 16.1125 15.6675C15.9841 15.8061 15.8124 15.8969 15.6255 15.9251C15.4387 15.9532 15.2478 15.9171 15.0842 15.8225L13.75 15.0517C13.6233 14.9785 13.4796 14.94 13.3334 14.94C13.1871 14.94 13.0434 14.9785 12.9167 15.0517C12.79 15.1248 12.6848 15.23 12.6117 15.3567C12.5385 15.4833 12.5 15.627 12.5 15.7733V17.315C12.4998 17.5037 12.4356 17.6868 12.3178 17.8342C12.2 17.9817 12.0357 18.0848 11.8517 18.1267C10.6325 18.4043 9.36646 18.4037 8.14752 18.125C7.96354 18.0829 7.79928 17.9796 7.68166 17.832C7.56403 17.6844 7.49999 17.5012 7.50002 17.3125V15.7733C7.50002 15.627 7.46151 15.4833 7.38837 15.3567C7.31523 15.23 7.21003 15.1248 7.08335 15.0517C6.95667 14.9785 6.81296 14.94 6.66669 14.94C6.52041 14.94 6.3767 14.9785 6.25002 15.0517L4.91586 15.8225C4.75218 15.917 4.56125 15.953 4.3744 15.9247C4.18754 15.8964 4.01586 15.8054 3.88752 15.6667C3.46473 15.2094 3.09437 14.7062 2.78336 14.1667C2.47164 13.6274 2.2212 13.0549 2.03669 12.46C1.98075 12.2795 1.9878 12.0854 2.0567 11.9094C2.12559 11.7335 2.25224 11.5862 2.41586 11.4917L3.74919 10.7217C3.87586 10.6485 3.98105 10.5433 4.05419 10.4166C4.12732 10.29 4.16582 10.1463 4.16582 10C4.16582 9.85372 4.12732 9.71002 4.05419 9.58335C3.98105 9.45667 3.87586 9.35147 3.74919 9.27833L2.41752 8.50916C2.25393 8.41482 2.12723 8.2677 2.05819 8.09192C1.98915 7.91614 1.98186 7.72212 2.03752 7.54166C2.40547 6.34688 3.03778 5.2503 3.88752 4.33333C4.01581 4.19479 4.18733 4.10393 4.37401 4.07562C4.56068 4.04731 4.75143 4.08323 4.91502 4.17749L6.25002 4.94833C6.3767 5.02147 6.52041 5.05997 6.66669 5.05997C6.81296 5.05997 6.95667 5.02147 7.08335 4.94833C7.21003 4.8752 7.31523 4.77 7.38837 4.64332C7.46151 4.51664 7.50002 4.37294 7.50002 4.22666V2.68583ZM10 12.5C10.6631 12.5 11.299 12.2366 11.7678 11.7678C12.2366 11.2989 12.5 10.663 12.5 10C12.5 9.33695 12.2366 8.70107 11.7678 8.23223C11.299 7.76339 10.6631 7.5 10 7.5C9.33698 7.5 8.7011 7.76339 8.23226 8.23223C7.76342 8.70107 7.50002 9.33695 7.50002 10C7.50002 10.663 7.76342 11.2989 8.23226 11.7678C8.7011 12.2366 9.33698 12.5 10 12.5Z" fill='#1e1e1e' fill-opacity='1'/>
          </svg>

        </Link> 
        <button className='flex items-center gap-2 hover:bg-[#88AB6115] transition duration-200 p-[.6em] rounded-[10px]'>
          <img className='h-[40px] w-[40px] rounded-[100%]' src={profilepic} alt="user"/>
          <h5 className=' font-semibold lt-sm:hidden'>Alfred Distivano</h5>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 1L5 5L1 1" stroke={localStorage.getItem('darkMode')==='true'?'#e1e1e1':'#1e1e1e'} stroke-opacity="0.75" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default UserBar;
