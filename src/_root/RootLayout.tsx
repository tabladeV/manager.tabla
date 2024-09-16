import {  Outlet } from "react-router-dom"
import Logo from "../components/header/Logo"
import SearchBar from "../components/header/SearchBar"
import UserBar from '../components/header/UserBar'
import NavigationMenu from '../components/menu/NavigationMenu'
import SupportMenu from '../components/menu/SupportMenu'
import { useState } from "react"


const RootLayout = () => {


  
  const [stateOfSideBar, setStateOfSideBar] = useState(false)

  return (
    <div className="flex">
      <div className="h-[100vh]" >
        <Logo className={stateOfSideBar?'horizontal':''} />
        <NavigationMenu stateOfSideBar={stateOfSideBar} handleSideBar={()=>{setStateOfSideBar(!stateOfSideBar)}} />
      </div>
      <div className="w-full overflow-x-scroll">
        <header className='h-[80px] items-center flex justify-end px-6'>
          {/* <SearchBar /> */}
          <UserBar />
        </header>
        <section className='flex justify-between h-[calc(100vh-97px)]'>
          
          
          <div className='bg-[#F3F3F3] p-[1em] w-full h-full  overflow-y-scroll'>
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  )
}

export default RootLayout
