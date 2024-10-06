import {  Outlet } from "react-router-dom"
import Logo from "../components/header/Logo"
import SearchBar from "../components/header/SearchBar"
import UserBar from '../components/header/UserBar'
import NavigationMenu from '../components/menu/NavigationMenu'
import SupportMenu from '../components/menu/SupportMenu'
import { useState } from "react"
import DateSelection from "../components/header/DateSelection"


const RootLayout = () => {


  
  const [stateOfSideBar, setStateOfSideBar] = useState(false)

  return (
    <div className="flex">
      <div className="sm:hidden">
          <NavigationMenu stateOfSideBar={stateOfSideBar} handleSideBar={()=>{setStateOfSideBar(!stateOfSideBar)}} />

      </div>
      <div className="h-[100vh] lt-sm:hidden" >
        <Logo className={stateOfSideBar?'horizontal':''} />
        <NavigationMenu stateOfSideBar={stateOfSideBar} handleSideBar={()=>{setStateOfSideBar(!stateOfSideBar)}} />
      </div>
      
      <div className="w-full">
        <header className='h-[80px]  items-center flex justify-between px-6 lt-sm:px-2'>
          {/* <SearchBar /> */}
          <div className="sm:hidden"><Logo/></div>
          
          <DateSelection />
          <UserBar />
        </header>
        <section className='flex justify-between h-[calc(100vh-97px)]'>
          
          
          <div className='bg-[#F3F3F3] p-[1em] w-full h-full   overflow-y-scroll'>
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  )
}

export default RootLayout
