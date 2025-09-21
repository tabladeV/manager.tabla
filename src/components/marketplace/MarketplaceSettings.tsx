import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  ImageIcon, 
  Info, 
  MenuIcon, 
  Tag, 
  Star, 
  Clock, 
  Plus, 
  Ban 
} from 'lucide-react'

// Import existing components that we'll reuse
import General from '../settings/General'
import WorkingHours from '../settings/WorkingHours'

// Import marketplace-specific components
import Gallery from './Gallery'
import MenuPricing from './MenuPricing'
import Offers from './Offers'
import Reviews from './Reviews'
import ExtraServices from './ExtraServices'
import OnlineBookingBlockage from './OnlineBookingBlockage'

const MarketplaceSettings = () => {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState('gallery')

  const menuItems = [
    {
      id: 'gallery',
      title: t('marketplaceSettings.menuItems.gallery'),
      icon: ImageIcon,
      component: Gallery
    },
    {
      id: 'basicInfo',
      title: t('marketplaceSettings.menuItems.basicInfo'),
      icon: Info,
      component: General
    },
    {
      id: 'menu',
      title: t('marketplaceSettings.menuItems.menu'),
      icon: MenuIcon,
      component: MenuPricing
    },
    {
      id: 'offers',
      title: t('marketplaceSettings.menuItems.offers'),
      icon: Tag,
      component: Offers
    },
    {
      id: 'reviews',
      title: t('marketplaceSettings.menuItems.reviews'),
      icon: Star,
      component: Reviews
    },
    {
      id: 'workingHours',
      title: t('marketplaceSettings.menuItems.workingHours'),
      icon: Clock,
      component: WorkingHours
    },
    {
      id: 'extraServices',
      title: t('marketplaceSettings.menuItems.extraServices'),
      icon: Plus,
      component: ExtraServices
    },
    {
      id: 'onlineBookingBlockage',
      title: t('marketplaceSettings.menuItems.onlineBookingBlockage'),
      icon: Ban,
      component: OnlineBookingBlockage
    }
  ]

  const ActiveComponent = menuItems.find(item => item.id === activeSection)?.component || Gallery

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      {/* Settings Menu */}
      <div className="lg:w-1/3 xl:w-1/4">
        <div className="rounded-[10px] p-4 bg-white dark:bg-bgdarktheme">
          <h1 className="text-2xl font-bold mb-6 text-blacktheme dark:text-textdarktheme">
            {t('marketplaceSettings.title')}
          </h1>
          <p className="text-sm text-subblack dark:text-softwhitetheme mb-6">
            {t('marketplaceSettings.chooseSettingPrompt')}
          </p>
          
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-primarytheme text-white'
                      : 'hover:bg-softgreytheme dark:hover:bg-darkthemeitems text-blacktheme dark:text-textdarktheme'
                  }`}
                >
                  <IconComponent size={20} />
                  <span className="text-sm font-medium">{item.title}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1">
        <ActiveComponent />
      </div>
    </div>
  )
}

export default MarketplaceSettings
