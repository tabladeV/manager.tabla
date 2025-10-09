import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { CanAccess } from '@refinedev/core'
import { DevOnly } from '../DevOnly'
import { 
  Settings, 
  Users, 
  Tag, 
  LayoutPanelLeft, 
  PartyPopper,
  CalendarClock,
  TimerReset,
  ImageIcon,
  MenuIcon,
  Star,
  PcCase,
  DollarSign,
  UserCheck,
  Store,
  Plus,
  Ban,
  ChevronLeft,
  ChevronRight,
  Mail,
  type LucideIcon
} from 'lucide-react'

// Import all settings components
import General from '../settings/General'
import WorkingHours from '../settings/WorkingHours'
import Availability from '../settings/Availability'
import Tags from '../settings/Tags'
import Areas from '../settings/Areas'
import Occasions from '../settings/Occasions'
import Widget from '../settings/Widget'
import ReviewWidget from '../settings/ReviewWidget'
import Billing from '../settings/Billing'
import Roles from '../settings/Roles'
import UsersSettings from '../settings/Users'
import MessagingTemplates from "./MessagingTemplates";
import MessagingTemplatesForm from './MessagingTemplatesForm';

// Import marketplace components
import Gallery from '../marketplace/Gallery'
import MenuPricing from '../marketplace/MenuPricing'
import Offers from '../marketplace/Offers'
import Reviews from '../marketplace/Reviews'
import ExtraServices from '../marketplace/ExtraServices'
import OnlineBookingBlockage from '../marketplace/OnlineBookingBlockage'

interface MenuItem {
  id: string
  title: string
  icon: LucideIcon
  component: React.ComponentType
  hideInMenu?: boolean
  permission?: {
    resource: string
    action: string
  }
}

interface MenuCategory {
  id: string
  title: string
  description: string
  items: MenuItem[]
}

const UnifiedSettings = () => {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState('general')
  const [expanded, setExpanded] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null); // State for the template ID


  useEffect(() => {
    document.title = 'Settings | Tabla'
    if (window.innerWidth < 640) {
      setExpanded(true)
    } else {
      setExpanded(false)
    }
  }, [])

    // --- Navigation Handlers ---
  const handleNewTemplate = () => {
    setEditingTemplateId(null);
    setActiveSection('messagingTemplateForm');
  };

  const handleEditTemplate = (id: number) => {
    setEditingTemplateId(id);
    setActiveSection('messagingTemplateForm');
  };

  const handleFinishEditing = () => {
    setEditingTemplateId(null);
    setActiveSection('messagingTemplates');
  };

  const categories: MenuCategory[] = [
    {
      id: 'restaurant',
      title: t('unifiedSettings.categories.restaurant.title'),
      description: t('unifiedSettings.categories.restaurant.description'),
      items: [
        {
          id: 'general',
          title: t('settingsPage.menuItems.general'),
          icon: Settings,
          component: General
        },
        {
          id: 'availability',
          title: t('settingsPage.menuItems.availability'),
          icon: CalendarClock,
          component: Availability,
          permission: { resource: 'availabilityday', action: 'view' }
        },
        {
          id: 'workinghours',
          title: t('settingsPage.menuItems.workingHours'),
          icon: TimerReset,
          component: WorkingHours,
          permission: { resource: 'availabilityday', action: 'view' }
        }
      ]
    },
    {
      id: 'customer',
      title: t('unifiedSettings.categories.customer.title'),
      description: t('unifiedSettings.categories.customer.description'),
      items: [
        {
          id: 'tags',
          title: t('settingsPage.menuItems.tags'),
          icon: Tag,
          component: Tags,
          permission: { resource: 'tag', action: 'view' }
        },
        {
          id: 'areas',
          title: t('settingsPage.menuItems.areas'),
          icon: LayoutPanelLeft,
          component: Areas,
          permission: { resource: 'area', action: 'view' }
        },
        {
          id: 'occasions',
          title: t('settingsPage.menuItems.occasions'),
          icon: PartyPopper,
          component: Occasions,
          permission: { resource: 'occasion', action: 'view' }
        }
      ]
    },
    {
      id: 'team',
      title: t('unifiedSettings.categories.team.title'),
      description: t('unifiedSettings.categories.team.description'),
      items: [
        {
          id: 'users',
          title: t('settingsPage.menuItems.users'),
          icon: Users,
          component: UsersSettings,
          permission: { resource: 'customuser', action: 'view' }
        },
        {
          id: 'roles',
          title: t('settingsPage.menuItems.roles'),
          icon: UserCheck,
          component: Roles,
          permission: { resource: 'role', action: 'view' }
        }
      ]
    },
    {
      id: 'system',
      title: t('unifiedSettings.categories.system.title'),
      description: t('unifiedSettings.categories.system.description'),
      items: [
        {
          id: 'widget',
          title: t('settingsPage.menuItems.widget'),
          icon: PcCase,
          component: Widget,
          permission: { resource: 'widget', action: 'view' }
        },
        {
          id: 'reviewWidget',
          title: t('settingsPage.menuItems.reviewWidget'),
          icon: Star,
          component: ReviewWidget,
          permission: { resource: 'reviewwidget', action: 'view' }
        },
        {
          id: 'messagingTemplates',
          title: t('settingsPage.menuItems.messagingTemplates'),
          icon: Mail,
          component: MessagingTemplates,
          // permission: { resource: 'messagingtemplate', action: 'view' }
          permission: { resource: 'reviewwidget', action: 'view' }
        },
        {
          id: 'messagingTemplateForm', // ID for the form view
          title: 'Template Form', // Title won't be shown
          icon: Mail, // Icon won't be shown
          component: MessagingTemplatesForm,
          hideInMenu: true, // Hide this from the sidebar
        },
        {
          id: 'billing',
          title: t('settingsPage.menuItems.billing'),
          icon: DollarSign,
          component: Billing,
          permission: { resource: 'billing', action: 'view' }
        }
      ]
    }
  ]

  // Marketplace category - only available in development
  const marketplaceCategory: MenuCategory = {
    id: 'marketplace',
    title: t('unifiedSettings.categories.marketplace.title'),
    description: t('unifiedSettings.categories.marketplace.description'),
    items: [
      {
        id: 'gallery',
        title: t('marketplaceSettings.menuItems.gallery'),
        icon: ImageIcon,
        component: Gallery
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
        icon: Plus,
        component: Offers
      },
      {
        id: 'reviews',
        title: t('marketplaceSettings.menuItems.reviews'),
        icon: Star,
        component: Reviews
      },
      {
        id: 'extraServices',
        title: t('marketplaceSettings.menuItems.extraServices'),
        icon: Store,
        component: ExtraServices
      },
      {
        id: 'bookingRestrictions',
        title: t('marketplaceSettings.menuItems.onlineBookingBlockage'),
        icon: Ban,
        component: OnlineBookingBlockage
      }
    ]
  }

  // Get all categories including marketplace components for development
  const getAllCategories = () => {
    return [...categories, marketplaceCategory]
  }

  const getCurrentComponent = () => {
    // Check all categories including marketplace for dev
    const allCategories = getAllCategories()
    for (const category of allCategories) {
      const item = category.items.find(item => item.id === activeSection)
      if (item) {
        return item.component
      }
    }
    return General // Default fallback
  }

  const getCurrentTitle = () => {
    // Check all categories including marketplace for dev
    const allCategories = getAllCategories()
    for (const category of allCategories) {
      const item = category.items.find(item => item.id === activeSection)
      if (item) {
        return item.title
      }
    }
    return t('settingsPage.menuItems.general')
  }

  const normalMenuClass = "hover:bg-softgreentheme dark:hover:bg-bgdarktheme font-medium text-sm text-blacktheme dark:text-textdarktheme py-2 px-3 rounded-md transition-colors duration-200 cursor-pointer"
  const navigatedMenuClass = "bg-greentheme text-whitetheme font-medium text-sm py-2 px-3 rounded-md shadow-sm"
  const categoryHeaderClass = "text-xs font-semibold text-subblack dark:text-softwhitetheme uppercase tracking-wider mb-2 mt-4 first:mt-0"

  const Component = getCurrentComponent()

  const renderMenuItem = (item: MenuItem) => {

    if (item.hideInMenu) {
      return null;
    }

    const menuItem = (
      <div
        key={item.id}
        onClick={() => setActiveSection(item.id)}
        className={`flex items-center gap-3 ${
          activeSection === item.id ? navigatedMenuClass : normalMenuClass
        }`}
      >
        <item.icon size={18} />
        {expanded && <span>{item.title}</span>}
      </div>
    )

    if (item.permission) {
      return (
        <CanAccess
          key={item.id}
          resource={item.permission.resource}
          action={item.permission.action}
        >
          {menuItem}
        </CanAccess>
      )
    }

    return menuItem
  }

  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme">
          {t("settingsPage.title")}
        </h1>
        <p className="text-subblack dark:text-softwhitetheme mt-1">
          {t("unifiedSettings.subtitle")}
        </p>
      </div>

      <div className="h-[calc(100vh-200px)] no-scrollbar flex gap-6">
        {/* Sidebar */}
        <div
          className={`h-[calc(100vh-200px)] overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col transition-all duration-300 ease-in-out ${
            expanded ? "w-80" : "w-20"
          } rounded-lg px-4 py-4 bg-whitetheme dark:bg-darkthemeitems border border-softgreytheme dark:border-bgdarktheme2 lt-sm:w-full lt-sm:h-auto`}
        >
          {/* Toggle Button */}
          <button
            className="lt-sm:hidden flex items-center justify-center mb-4 p-2 hover:bg-softgreentheme dark:hover:bg-bgdarktheme rounded-md transition-colors"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>

          {/* Menu Categories */}
          <div className="space-y-1">
            {categories.map((category) => (
              <div key={category.id}>
                {expanded && (
                  <div className={categoryHeaderClass}>
                    {category.title}
                  </div>
                )}
                {expanded && !expanded && (
                  <div className="w-full h-px bg-softgreytheme dark:bg-bgdarktheme my-2" />
                )}
                <div className="space-y-1">
                  {category.items.map(renderMenuItem)}
                  <div className="w-full h-px bg-black/40 dark:bg-white/40 my-2" />
                </div>
              </div>
            ))}
            
            {/* Marketplace Category - Development Only */}
            <DevOnly>
              <div key={marketplaceCategory.id}>
                {expanded && (
                  <div className={categoryHeaderClass}>
                    {marketplaceCategory.title}
                  </div>
                )}
                <div className="space-y-1">
                  {marketplaceCategory.items.map(renderMenuItem)}
                  <div className="w-full h-px bg-black/40 dark:bg-white/40 my-2" />
                </div>
              </div>
            </DevOnly>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 h-full overflow-y-auto">
          <div >
            
            
            {/* Component Content */}
              <Component 
                // Pass handlers to the relevant components
                onNew={handleNewTemplate}
                onEdit={handleEditTemplate}
                onCancel={handleFinishEditing}
                onSave={handleFinishEditing}
                templateId={editingTemplateId}
              />
          </div>
        </div>
      </div>
    </div>
  )
}

export default UnifiedSettings
