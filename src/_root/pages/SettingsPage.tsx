import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import General from '../../components/settings/General';
import Availability from '../../components/settings/Availability';
import WorkingHours from '../../components/settings/WorkingHours';
import Tags from '../../components/settings/Tags';
import Areas from '../../components/settings/Areas';
import Occasions from '../../components/settings/Occasions';
import Widget from '../../components/settings/Widget';
import ReviewWidget from '../../components/settings/ReviewWidget';
import Billing from '../../components/settings/Billing';
import Roles from '../../components/settings/Roles';
import UsersSettings from '../../components/settings/Users';
import MessagingTemplates from "../../components/settings/MessagingTemplates";
import MessagingTemplatesForm from '../../components/settings/MessagingTemplatesForm';
import Gallery from '../../components/marketplace/Gallery';
import MenuPricing from '../../components/marketplace/MenuPricing';
import Offers from '../../components/marketplace/Offers';
import Reviews from '../../components/marketplace/Reviews';
import ExtraServices from '../../components/marketplace/ExtraServices';
import OnlineBookingBlockage from '../../components/marketplace/OnlineBookingBlockage';
import PaymentSettings from '../../components/settings/PaymentSettings';
import Alerts from '../../components/settings/Alerts';

const componentMap: { [key: string]: React.ComponentType<any> } = {
  general: General,
  availability: Availability,
  workinghours: WorkingHours,
  tags: Tags,
  areas: Areas,
  occasions: Occasions,
  users: UsersSettings,
  roles: Roles,
  widget: Widget,
  reviewWidget: ReviewWidget,
  'messaging-templates': MessagingTemplates,
  'messaging-templates/new': MessagingTemplatesForm,
  'messaging-templates/edit': MessagingTemplatesForm,
  billing: Billing,
  gallery: Gallery,
  payment: PaymentSettings,
  menu: MenuPricing,
  offers: Offers,
  reviews: Reviews,
  extraServices: ExtraServices,
  bookingRestrictions: OnlineBookingBlockage,
  alerts: Alerts,
};

const SettingsPage: React.FC = () => {
  const { section } = useParams<{ section?: string }>();
  const location = useLocation();
  
  let componentKey = section || 'general';

  const path = location.pathname;
  if (path.startsWith('/settings/messaging-templates')) {
    if (path.endsWith('/new')) {
      componentKey = 'messaging-templates/new';
    } else if (path.includes('/edit/')) {
      componentKey = 'messaging-templates/edit';
    } else {
      componentKey = 'messaging-templates';
    }
  }

  const Component = componentMap[componentKey] || General;

  return (
    <div key={componentKey} className="animate-fadeIn">
        <Component />
    </div>
  );
};

export default SettingsPage;