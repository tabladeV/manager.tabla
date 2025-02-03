import {  Outlet } from "react-router-dom"
import Logo from "../components/header/Logo"
import SearchBar from "../components/header/SearchBar"
import UserBar from '../components/header/UserBar'
import NavigationMenu from '../components/menu/NavigationMenu'
import SupportMenu from '../components/menu/SupportMenu'
import { useEffect, useState } from "react"
import DateSelection from "../components/header/DateSelection"
import i18n, { loadLanguages, use } from 'i18next';
import { useDarkContext } from "../context/DarkContext"
import { Fullscreen } from "lucide-react"

import confirm from '../assets/confirm-icon.png'
import cancel from '../assets/Cancel-icon.png'
import pending from '../assets/pending-icon.png'
import confirmDark from '../assets/confirm-icon-dark.png'
import cancelDark from '../assets/Cancel-icon-dark.png'
import pendingDark from '../assets/pending-icon-dark.png'

import { Helmet } from "react-helmet-async";


const RootLayout = () => {

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'f') {
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

  window.onload = function() {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    const darkMode = localStorage.getItem('darkMode');
    if(darkMode === 'true'){
      document.documentElement.classList.add('dark')
    }else {
      document.documentElement.classList.remove('dark')
    }
    
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);

        // loadLanguages(savedLanguage);
    } else {
        // Set default language if none is saved
      i18n.changeLanguage('en');

    }
};









  const [shownlang, setShownLang] = useState(localStorage.getItem('preferredLanguage') || 'en')
  useEffect(() => {
    setShownLang(localStorage.getItem('preferredLanguage') || 'en')
  }, [localStorage.getItem('preferredLanguage')])

  
  const [stateOfSideBar, setStateOfSideBar] = useState(false)

  


  return (
    <div className={`flex overflow-hidden ${(shownlang === 'ar') ? "rtl ":''} ${localStorage.getItem('darkMode')=== 'true'? 'bg-bgdarktheme text-textdarktheme':''}`}>
      {/* <Helmet>
        <title>Your Custom Title</title> 
      </Helmet> */}
      <div className="sm:hidden">
          <NavigationMenu stateOfSideBar={stateOfSideBar} handleSideBar={()=>{setStateOfSideBar(!stateOfSideBar)}} />

      </div>
      <div className="h-full lt-sm:hidden" >
        <Logo className={stateOfSideBar?'horizontal':''} />
        <NavigationMenu stateOfSideBar={stateOfSideBar} handleSideBar={()=>{setStateOfSideBar(!stateOfSideBar)}} />
      </div>
      
      <div className="w-full ">
        <header className='h-[80px]   items-center flex justify-between px-6 lt-sm:px-2'>
          {/* <SearchBar /> */}
          <div className="sm:hidden"><Logo/></div>
          <button className={` lt-sm:hidden z-10 p-2 rounded-md  ${localStorage.getItem('darkMode')=== 'true' ?'hover:bg-subblack':'hover:bg-softgreytheme'}`} onClick={()=>{setStateOfSideBar(!stateOfSideBar)}}>
            {stateOfSideBar ?
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12L19 19M12 12L5 5M12 12L5 19M12 12L19 5" stroke={localStorage.getItem('darkMode')=== 'true' ?'#ffffff70':'#1e1e1e70'} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            
            :
            
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H21M3 12H21M3 18H21" stroke={localStorage.getItem('darkMode')=== 'true' ?'#ffffff70':'#1e1e1e70'} stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            
            }

          </button>
          <div className="flex gap-4 lt-sm:hidden">
            <div className="flex items-center gap-2 btn border-softbluetheme cursor-default hover:border-bluetheme  text-bluetheme">
              {localStorage.getItem('darkMode')==='true'?
                <img src={pendingDark} alt="pending" className="w-6 h-6" />
                :
                <img src={pending} alt="pending" className="w-6 h-6" />
              }
              <span className="text-[1.6rem] font-[600]">{10}</span>
            </div>
            <div className="flex items-center gap-2 btn border-softgreentheme cursor-default hover:border-greentheme  text-greentheme">
              {localStorage.getItem('darkMode')==='true'?
                <img src={confirmDark} alt="confirm" className="w-6 h-6" />
                :
                <img src={confirm} alt="confirm" className="w-6 h-6" />
              }
              
              <span className="text-[1.6rem] font-[600]">{20}</span>
            </div>
          <div className="flex items-center  gap-2 btn border-softredtheme cursor-default hover:border-redtheme  text-redtheme">
              {localStorage.getItem('darkMode')==='true'?
                <img src={cancelDark} alt="cancel" className="w-6 h-6" />
                :
                <img src={cancel} alt="cancel" className="w-6 h-6" />
              }
              <span className="text-[1.6rem] font-[600]">{2}</span>
            </div>
          </div>
          
          <DateSelection />

          <UserBar />

        </header>
        <section className='flex justify-between  h-[calc(100vh-80px)]'>
          
          
          <div className={` p-[1em] w-full h-full  lt-sm:pb-[10em] overflow-x-hidden  overflow-y-scroll ${localStorage.getItem('darkMode')=== 'true'? 'bg-bgdarktheme2 text-textdarktheme':'bg-[#F6F6F6]'} `}>
            <Outlet />
            <div className="lt-sm:h-[4em]"></div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default RootLayout
