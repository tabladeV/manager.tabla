import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CanAccess } from '@refinedev/core'
import { DevOnly } from '../DevOnly'
import { Link, Outlet, useParams } from 'react-router-dom'
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
  BadgeDollarSign,
  Megaphone,
  UserCheck,
  Store,
  Plus,
  Ban,
  ChevronLeft,
  ChevronRight,
  Mail,
  type LucideIcon,
  FileText
} from 'lucide-react'

// Import components for type definitions
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
import Gallery from '../marketplace/Gallery'
import MenuPricing from '../marketplace/MenuPricing'
import Offers from '../marketplace/Offers'
import Reviews from '../marketplace/Reviews'
import ExtraServices from '../marketplace/ExtraServices'
import OnlineBookingBlockage from '../marketplace/OnlineBookingBlockage'
import PaymentSettings from './PaymentSettings'
import Alerts from '../../components/settings/Alerts';
import MenusSettings from './MenusSettings';

interface MenuItem {
  id: string
  title: string
  icon: LucideIcon
  component: React.ComponentType<any>
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
  const { section } = useParams<{ section?: string }>();
  const activeSection = window.location.pathname.startsWith('/settings/messaging-templates') 
    ? 'messaging-templates' 
    : section || 'general';

  const [expanded, setExpanded] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Settings | Tabla'
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setExpanded(true);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [])

  useEffect(() => {
    const allCategories = getAllCategories();
    const category = allCategories.find(cat => cat.items.some(item => item.id === activeSection));
    if (category) {
      setActiveCategoryId(category.id);
      if (isMobile && !openCategories.includes(category.id)) {
        setOpenCategories(prev => [...prev, category.id]);
      }
    }
  }, [activeSection, isMobile]);

  const handleToggleCategory = (categoryId: string) => {
    setOpenCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const categories: MenuCategory[] = [
    {
      id: 'restaurant',
      title: t('unifiedSettings.categories.restaurant.title'),
      description: t('unifiedSettings.categories.restaurant.description'),
      items: [
        { id: 'general', title: t('settingsPage.menuItems.general'), icon: Settings, component: General },
        { id: 'availability', title: t('settingsPage.menuItems.availability'), icon: CalendarClock, component: Availability, permission: { resource: 'availabilityday', action: 'view' } },
        { id: 'workinghours', title: t('settingsPage.menuItems.workingHours'), icon: TimerReset, component: WorkingHours, permission: { resource: 'availabilityday', action: 'view' } }
      ]
    },
    {
      id: 'customer',
      title: t('unifiedSettings.categories.customer.title'),
      description: t('unifiedSettings.categories.customer.description'),
      items: [
        { id: 'tags', title: t('settingsPage.menuItems.tags'), icon: Tag, component: Tags, permission: { resource: 'tag', action: 'view' } },
        { id: 'areas', title: t('settingsPage.menuItems.areas'), icon: LayoutPanelLeft, component: Areas, permission: { resource: 'area', action: 'view' } },
        { id: 'occasions', title: t('settingsPage.menuItems.occasions'), icon: PartyPopper, component: Occasions, permission: { resource: 'occasion', action: 'view' } }
      ]
    },
    {
      id: 'team',
      title: t('unifiedSettings.categories.team.title'),
      description: t('unifiedSettings.categories.team.description'),
      items: [
        { id: 'users', title: t('settingsPage.menuItems.users'), icon: Users, component: UsersSettings, permission: { resource: 'customuser', action: 'view' } },
        { id: 'roles', title: t('settingsPage.menuItems.roles'), icon: UserCheck, component: Roles, permission: { resource: 'role', action: 'view' } }
      ]
    },
    {
      id: 'system',
      title: t('unifiedSettings.categories.system.title'),
      description: t('unifiedSettings.categories.system.description'),
      items: [
        { id: 'widget', title: t('settingsPage.menuItems.widget'), icon: PcCase, component: Widget, permission: { resource: 'widget', action: 'view' } },
        { id: 'reviewWidget', title: t('settingsPage.menuItems.reviewWidget'), icon: Star, component: ReviewWidget, permission: { resource: 'reviewwidget', action: 'view' } },
        { id: 'alerts', title: t('settingsPage.menuItems.alerts'), icon: Megaphone, component: Alerts, permission: { resource: 'widget', action: 'view' }},
        { id: 'menus', title: t('settingsPage.menuItems.menus'), icon: FileText, component: MenusSettings, permission: { resource: 'widget', action: 'view' } },
        { id: 'messaging-templates', title: t('settingsPage.menuItems.messagingTemplates'), icon: Mail, component: MessagingTemplates, permission: { resource: 'widget', action: 'view' } },
        { id: 'messaging-templates/new', title: t('settingsPage.menuItems.messagingTemplatesNew'), icon: Plus, component: MessagingTemplatesForm, hideInMenu: true, permission: { resource: 'widget', action: 'view' } },
        { id: 'messaging-templates/edit', title: t('settingsPage.menuItems.messagingTemplatesEdit'), icon: Plus, component: MessagingTemplatesForm, hideInMenu: true, permission: { resource: 'widget', action: 'view' } },
        { id: 'payment', title: t('settingsPage.widget.payment.title'), icon: BadgeDollarSign, component: PaymentSettings, permission: { resource: 'widget', action: 'view' } },
        { id: 'billing', title: t('settingsPage.menuItems.billing'), icon: DollarSign, component: Billing, permission: { resource: 'billing', action: 'view' } }
      ]
    }
  ];

  const marketplaceCategory: MenuCategory = {
    id: 'marketplace',
    title: t('unifiedSettings.categories.marketplace.title'),
    description: t('unifiedSettings.categories.marketplace.description'),
    items: [
      { id: 'gallery', title: t('marketplaceSettings.menuItems.gallery'), icon: ImageIcon, component: Gallery },
      { id: 'menu', title: t('marketplaceSettings.menuItems.menu'), icon: MenuIcon, component: MenuPricing },
      { id: 'offers', title: t('marketplaceSettings.menuItems.offers'), icon: Plus, component: Offers },
      { id: 'reviews', title: t('marketplaceSettings.menuItems.reviews'), icon: Star, component: Reviews },
      { id: 'extraServices', title: t('marketplaceSettings.menuItems.extraServices'), icon: Store, component: ExtraServices },
      { id: 'bookingRestrictions', title: t('marketplaceSettings.menuItems.onlineBookingBlockage'), icon: Ban, component: OnlineBookingBlockage }
    ]
  };

  const getAllCategories = () => [...categories, marketplaceCategory];

  const normalMenuClass = "hover:bg-softgreentheme dark:hover:bg-bgdarktheme font-medium text-sm text-blacktheme dark:text-textdarktheme py-2 px-3 rounded-md transition-colors duration-200 cursor-pointer";
  const navigatedMenuClass = "bg-greentheme text-whitetheme font-medium text-sm py-2 px-3 rounded-md shadow-sm";
  const categoryHeaderClass = "text-xs font-semibold text-subblack dark:text-softwhitetheme uppercase tracking-wider mb-2 mt-4 first:mt-0";

  const renderMenuItem = (item: MenuItem) => {
    if (item.hideInMenu) return null;

    const menuItemContent = (
      <Link
        to={`/settings/${item.id}`}
        className={`flex items-center ${activeSection === item.id ? navigatedMenuClass : normalMenuClass}`}
      >
        <item.icon size={18} />
        <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${expanded ? 'ml-3' : 'w-0'}`}>
          {item.title}
        </span>
      </Link>
    );

    if (item.permission) {
      return (
        <CanAccess key={item.id} resource={item.permission.resource} action={item.permission.action}>
          {menuItemContent}
        </CanAccess>
      );
    }
    return <div key={item.id}>{menuItemContent}</div>;
  };

  return (
    <div className="">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme">{t("settingsPage.title")}</h1>
        <p className="text-subblack dark:text-softwhitetheme mt-1">{t("unifiedSettings.subtitle")}</p>
      </div>
      <div className="h-auto lg:h-[calc(100vh-200px)] no-scrollbar flex lg:flex-row flex-col xl:gap-6 lg:gap-6 gap-4">
        <div className={`h-auto lg:h-[calc(100vh-200px)] overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col transition-all duration-300 ease-in-out ${expanded ? "lg:w-80 w-full" : "w-20"} rounded-lg px-4 py-4 bg-whitetheme dark:bg-darkthemeitems border border-softgreytheme dark:border-bgdarktheme2`}>
          <button className="hidden lg:flex items-center justify-center mb-4 p-2 hover:bg-softgreentheme dark:hover:bg-bgdarktheme rounded-md transition-colors" onClick={() => setExpanded(!expanded)} aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}>
            {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
          <div className="space-y-1">
            {categories.map((category) => (
              <div key={category.id}>
                {expanded && (
                  <div className={`${categoryHeaderClass} ${isMobile ? 'cursor-pointer flex justify-between items-center' : ''}`} onClick={() => isMobile && handleToggleCategory(category.id)}>
                    <div className="flex items-center gap-2">
                      {category.title}
                      {isMobile && activeCategoryId === category.id && !openCategories.includes(category.id) && (<span className="w-2 h-2 bg-greentheme rounded-full"></span>)}
                    </div>
                    {isMobile && (<ChevronRight size={16} className={`transform transition-transform ${openCategories.includes(category.id) ? 'rotate-90' : ''}`} />)}
                  </div>
                )}
                {!expanded && <div className="w-full h-px bg-softgreytheme dark:bg-bgdarktheme my-2" />}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${!isMobile || openCategories.includes(category.id) ? 'max-h-[500px]' : 'max-h-0'}`}>
                  <div className="space-y-1 pt-1">{category.items.map(renderMenuItem)}</div>
                  <div className="w-full h-px bg-black/40 dark:bg-white/40 my-2" />
                </div>
              </div>
            ))}
            <DevOnly>
              <div key={marketplaceCategory.id}>
                {expanded && (
                  <div className={`${categoryHeaderClass} ${isMobile ? 'cursor-pointer flex justify-between items-center' : ''}`} onClick={() => isMobile && handleToggleCategory(marketplaceCategory.id)}>
                    <div className="flex items-center gap-2">
                      {marketplaceCategory.title}
                      {isMobile && activeCategoryId === marketplaceCategory.id && !openCategories.includes(marketplaceCategory.id) && (<span className="w-2 h-2 bg-greentheme rounded-full"></span>)}
                    </div>
                    {isMobile && (<ChevronRight size={16} className={`transform transition-transform ${openCategories.includes(marketplaceCategory.id) ? 'rotate-90' : ''}`} />)}
                  </div>
                )}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${!isMobile || openCategories.includes(marketplaceCategory.id) ? 'max-h-[500px]' : 'max-h-0'}`}>
                  <div className="space-y-1 pt-1">{marketplaceCategory.items.map(renderMenuItem)}</div>
                  <div className="w-full h-px bg-black/40 dark:bg-white/40 my-2" />
                </div>
              </div>
            </DevOnly>
          </div>
        </div>
        <div className="flex-1 h-full overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default UnifiedSettings