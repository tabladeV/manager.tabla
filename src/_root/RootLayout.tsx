import {  Outlet } from "react-router-dom"
import Logo from "../components/header/Logo"
import SearchBar from "../components/header/SearchBar"
import UserBar from '../components/header/UserBar'
import NavigationMenu from '../components/menu/NavigationMenu'
import SupportMenu from '../components/menu/SupportMenu'
import { useEffect, useState } from "react"
import DateSelection from "../components/header/DateSelection"
import i18n, { loadLanguages, use } from 'i18next';

const RootLayout = () => {

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


const [darkMode, setDarkMode] = useState(false);



  const [shownlang, setShownLang] = useState(localStorage.getItem('preferredLanguage') || 'en')
  useEffect(() => {
    setShownLang(localStorage.getItem('preferredLanguage') || 'en')
  }, [localStorage.getItem('preferredLanguage')])

  
  const [stateOfSideBar, setStateOfSideBar] = useState(false)


  return (
    <div className={`flex ${(shownlang === 'ar') ? "rtl ":''} ${localStorage.getItem('darkMode')=== 'true'? 'bg-subblack':''}`}>
      <div className="sm:hidden">
          <NavigationMenu stateOfSideBar={stateOfSideBar} handleSideBar={()=>{setStateOfSideBar(!stateOfSideBar)}} />

      </div>
      <div className="h-full lt-sm:hidden" >
        <Logo className={stateOfSideBar?'horizontal':''} />
        <NavigationMenu stateOfSideBar={stateOfSideBar} handleSideBar={()=>{setStateOfSideBar(!stateOfSideBar)}} />
      </div>
      
      <div className="w-full ">
        <header className='h-[80px]  items-center flex justify-between px-6 lt-sm:px-2'>
          {/* <SearchBar /> */}
          <div className="sm:hidden"><Logo/></div>
          <button className={` lt-sm:hidden z-10 p-2 rounded-md hover:bg-softgreytheme`} onClick={()=>{setStateOfSideBar(!stateOfSideBar)}}>
            {stateOfSideBar ?
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12L19 19M12 12L5 5M12 12L5 19M12 12L19 5" stroke="#1e1e1e70" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            
            :
            
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H21M3 12H21M3 18H21" stroke="#1e1e1e70" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            
            }

          </button>
          <div className="flex gap-4 lt-sm:hidden">
            <div className="flex items-center gap-2 btn border-softgreentheme cursor-default hover:border-greentheme  text-greentheme">
              <span className="text-[2rem] font-[600]">{20}</span>
              Confirmed 
            </div>
            <div className="flex items-center gap-2 btn border-softredtheme cursor-default hover:border-redtheme  text-redtheme">
              <span className="text-[2rem] font-[600]">{2}</span>
              Cancelled 
            </div>
          </div>
          
          <DateSelection />

          <UserBar />
        </header>
        <section className='flex justify-between  h-[calc(100vh-80px)]'>
          
          
          <div className='bg-[#F6F6F6] p-[1em] w-full h-full  lt-sm:pb-[10em] overflow-x-hidden  overflow-y-scroll'>
            <Outlet />
            <div className="lt-sm:h-[3em]"></div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default RootLayout
