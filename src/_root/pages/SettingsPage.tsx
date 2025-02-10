import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useLocation} from "react-router-dom"

const SettingsPage = () => {
  const {t} = useTranslation();

  const {pathname} = useLocation();
  return (
    <div>
      <div>
        <h1>{t('settingsPage.title')} </h1>
      </div>
      <div className="flex gap-4">
        <div className={`h-[calc(100vh-160px)] overflow-y-auto flex  font-[500] text-[17px] text-left  flex-col w-1/5  rounded-[10px] px-6 py-4 gap-4 lt-sm:w-full lt-sm:h-fit ${localStorage.getItem('preferredLanguage')=== 'ar'? 'text-right':''} ${pathname === '/settings'? '':'lt-sm:hidden'} ${localStorage.getItem('darkMode')==='true'?'text-white bg-bgdarktheme':'text-[#1E1E1E99] bg-white'} `}>
          <Link to='/settings/general' className={`hover:underline ${pathname === '/settings/general' ? 'text-greentheme underline':''}`}>{t('settingsPage.menuItems.general')}</Link>
          <Link to='/settings/availability' className={`hover:underline ${pathname === '/settings/availability' ? 'text-greentheme underline':''}`}>{t('settingsPage.menuItems.availability')}</Link>
          
          {/* to be restored after */}
          {/* <Link to='/settings/tags' className={`hover:underline ${pathname === '/settings/tags' ? 'text-greentheme underline':''}`}>{t('settingsPage.menuItems.tags')}</Link>
          <Link to='/settings/menu' className={`hover:underline ${pathname === '/settings/menu' ? 'text-greentheme underline':''}`}>{t('settingsPage.menuItems.menu')}</Link>
          <Link to='/settings/photos' className={`hover:underline ${pathname === '/settings/photos' ? 'text-greentheme underline':''}`}>{t('settingsPage.menuItems.photos')}</Link>
          <Link to='/settings/messaging' className={`hover:underline ${pathname === '/settings/messaging' ? 'text-greentheme underline':''}`}>{t('settingsPage.menuItems.messaging')}</Link>
          <Link to='/settings/features' className={`hover:underline ${pathname === '/settings/features' ? 'text-greentheme underline':''}`}>{t('settingsPage.menuItems.features')}</Link> */}
          
          <Link to='/settings/users' className={`hover:underline ${pathname === '/settings/users' ? 'text-greentheme underline':''}`}>{t('settingsPage.menuItems.users')}</Link>
          {/* <Link to='/settings/billing' className={`hover:underline ${pathname === '/settings/billing' ? 'text-greentheme underline':''}`}>{t('settingsPage.menuItems.billing')}</Link> */}
          <Link to='/settings/widget/reservation' className={`hover:underline ${pathname === '/settings/widget/reservation' ? 'text-greentheme underline':''}`}>{t('settingsPage.menuItems.widget')}</Link>
          <Link to='/settings/widget/review' className={`hover:underline ${pathname === '/settings/widget/review' ? 'text-greentheme underline':''}`}>{t('settingsPage.menuItems.reviewWidget')}</Link>
          {/* <Link to='/settings/permissions' className={`hover:underline ${pathname === '/settings/permissions' ? 'text-greentheme underline':''}`}>{t('settingsPage.menuItems.permissions')}</Link> */}
          <Link to='/settings/roles' className={`hover:underline ${pathname === '/settings/roles' ? 'text-greentheme underline':''}`}>{t('settingsPage.menuItems.roles')}</Link>
          {/* <Link to='/settings/services' className={`hover:underline ${pathname === '/settings/services' ? 'text-greentheme underline':''}`}>{t('settingsPage.menuItems.services')}</Link> */}
        </div>
        <div className={`w-full overflow-y-scroll ${pathname === '/settings' ? 'lt-sm:hidden': ''}`}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
