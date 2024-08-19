import {  Outlet } from "react-router-dom"
import Logo from "../components/header/Logo"
import SearchBar from "../components/header/SearchBar"
import UserBar from '../components/header/UserBar'
import NavigationMenu from '../components/menu/NavigationMenu'
import SupportMenu from '../components/menu/SupportMenu'


const RootLayout = () => {
  return (
    <div>
      <header className='h-[80px] items-center flex justify-between px-10'>
        <Logo className='horizontal'/>
        <SearchBar />
        <UserBar />
      </header>
      <section className='flex justify-between h-[calc(100vh-80px)]'>
        <div className='bg-white px-[1.4em] gap-10 flex flex-col justify-between max-h-[calc(100vh-80px)]'>
          <NavigationMenu />
          <SupportMenu />
        </div>
        <div className='bg-[#F3F3F3] p-[1em] w-full h-full overflow-y-scroll'>
          <Outlet />
        </div>
      </section>
    </div>
  )
}

export default RootLayout
