import { Link, Outlet, useLocation} from "react-router-dom"

const SettingsPage = () => {
  const {pathname} = useLocation();
  return (
    <div>
      <div>
        <h1>Settings </h1>
      </div>
      <div className="flex gap-4">
        <div className={`h-[calc(100vh-160px)] flex text-[#1E1E1E99] font-[500] text-[17px] text-left  flex-col w-1/5 bg-white rounded-[10px] px-6 py-4 gap-4 lt-sm:w-full lt-sm:h-fit ${pathname === '/settings'? '':'lt-sm:hidden'}`}>
          <Link to='/settings/general' className={`hover:underline ${pathname === '/settings/general' ? 'text-greentheme underline':''}`}>General</Link>
          <Link to='/settings/availability' className={`hover:underline ${pathname === '/settings/availability' ? 'text-greentheme underline':''}`}>Availability</Link>
          <Link to='/settings/tags' className={`hover:underline ${pathname === '/settings/tags' ? 'text-greentheme underline':''}`}>Tags</Link>
          <Link to='/settings/menu' className={`hover:underline ${pathname === '/settings/menu' ? 'text-greentheme underline':''}`}>Menu</Link>
          <Link to='/settings/photos' className={`hover:underline ${pathname === '/settings/photos' ? 'text-greentheme underline':''}`}>Photos</Link>
          <Link to='/settings/messaging' className={`hover:underline ${pathname === '/settings/messaging' ? 'text-greentheme underline':''}`}>Messaging</Link>
          <Link to='/settings/features' className={`hover:underline ${pathname === '/settings/features' ? 'text-greentheme underline':''}`}>Features</Link>
          <Link to='/settings/users' className={`hover:underline ${pathname === '/settings/users' ? 'text-greentheme underline':''}`}>Users</Link>
          <Link to='/settings/billing' className={`hover:underline ${pathname === '/settings/billing' ? 'text-greentheme underline':''}`}>Billing</Link>
          <Link to='/settings/widget' className={`hover:underline ${pathname === '/settings/widget' ? 'text-greentheme underline':''}`}>Widget</Link>
          <Link to='/settings/permissions' className={`hover:underline ${pathname === '/settings/permissions' ? 'text-greentheme underline':''}`}>Permissions</Link>
          <Link to='/settings/services' className={`hover:underline ${pathname === '/settings/services' ? 'text-greentheme underline':''}`}>Services</Link>
        </div>
        <div className={`w-full overflow-y-scroll ${pathname === '/settings' ? 'lt-sm:hidden': ''}`}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
