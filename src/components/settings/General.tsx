import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Map from '../map/Map';
import { Plus, Trash2, WholeWord, Phone, Mail, Globe, Facebook, Instagram, Twitter, Linkedin, MessageCircle, Link as LinkIcon } from 'lucide-react';
import {
  BaseKey,
  BaseRecord,
  useCustomMutation,
  useList,
  useUpdate,
  CanAccess,
} from '@refinedev/core';
import loading from '../../assets/loading.png';
import BaseBtn from '../common/BaseBtn';

interface ContactDetail {
  type: string;
  name: string;
  link: string;
}

interface Restaurant {
  id: BaseKey;
  name: string;
  preferred_language: "en" | "fr" | "ar" | "es";
  email: string;
  website: string;
  phone: string;
  location: string;
  address: string;
  is_approved: boolean;
  max_of_guests: number;
  description: string;
  allow_reservation: boolean;
  average_price: string;
  due_cancellation_period: number;
  buffer: string;
  created_at: string;
  edit_at: string;
  country: number;
  city: number;
  category: number;
  manager: number;
  restaurant_type: number;
  categories: [];
  staff: [];
  contact_details?: ContactDetail[];
}

const General = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = 'General Settings | Tabla';
  }, []);

  const [restaurantId, setRestaurantId] = useState(localStorage.getItem('restaurant_id'));
  const [subdomain, setSubdomain] = useState<string>('');
  const [restaurant, setRestaurant] = useState<Restaurant | undefined>(undefined);
  const [contactDetails, setContactDetails] = useState<ContactDetail[]>([]);

  const CONTACT_TYPES = [
    { value: 'PHONE', label: 'Phone Number', icon: Phone },
    { value: 'WHATSAPP', label: 'WhatsApp', icon: MessageCircle },
    { value: 'EMAIL', label: 'Email', icon: Mail },
    { value: 'WEBSITE', label: 'Website', icon: Globe },
    { value: 'TWITTER', label: 'Twitter', icon: Twitter },
    { value: 'INSTAGRAM', label: 'Instagram', icon: Instagram },
    { value: 'FACEBOOK', label: 'Facebook', icon: Facebook },
    { value: 'LINKEDIN', label: 'LinkedIn', icon: Linkedin },
    { value: 'TIKTOK', label: 'TikTok', icon: LinkIcon },
    { value: 'TRIP_ADVISOR', label: 'Trip Advisor', icon: LinkIcon },
    { value: 'BOOKING', label: 'Booking.com', icon: LinkIcon },
    { value: 'AIRBNB', label: 'AirBnb', icon: LinkIcon },
  ];

  const { data: restaurantData } = useList({
    resource: `api/v1/bo/restaurants/${restaurantId}/current/`,
  });

  const { data: subdomainData } = useList({
    resource: 'api/v1/bo/restaurants/subdomain',
  });

  useEffect(() => {
    if (subdomainData?.data) {
      const subdomainApi = subdomainData.data as unknown as { subdomain: string };
      setSubdomain(String(subdomainApi.subdomain));
    }
  }, [subdomainData]);

  useEffect(() => {
    if (restaurantData?.data) {
      setRestaurant(restaurantData.data as unknown as Restaurant);
    }
  }, [restaurantData]);

  interface CitiesType {
    results: BaseRecord[];
    count: number;
  }

  const [citiesAPIInfo, setCitiesAPIInfo] = useState<CitiesType>();

  const { data: allCities } = useList({
    resource: 'api/v1/bo/cities/',
    filters: [
      {
        field: 'country',
        operator: 'eq',
        value: 2,
      },
    ],
    queryOptions: {
      onSuccess(data) {
        setCitiesAPIInfo(data.data as unknown as CitiesType);
      },
    },
  });

  interface CountriesType {
    results: BaseRecord[];
    count: number;
  }

  const [countriesAPIInfo, setCountriesAPIInfo] = useState<CountriesType>();

  const { data: allCountries } = useList({
    resource: 'api/v1/bo/countries/',
    queryOptions: {
      onSuccess(data) {
        setCountriesAPIInfo(data.data as unknown as CountriesType);
      },
    },
  });

  const [formData, setFormData] = useState({
    name: restaurant?.name || '',
    email: restaurant?.email || '',
    preferred_language: restaurant?.preferred_language || '',
    address: restaurant?.address || '',
    city: restaurant?.city || '',
    country: restaurant?.country || '',
    average_price: restaurant?.average_price || '',
    description: restaurant?.description || '',
    phone: restaurant?.phone || '',
    website: restaurant?.website || '',
  });

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        email: restaurant.email,
        city: restaurant.city,
        address: restaurant.address,
        preferred_language: restaurant.preferred_language,
        average_price: restaurant.average_price,
        country: restaurant.country,
        description: restaurant.description,
        phone: restaurant.phone,
        website: restaurant.website,
      });
      setContactDetails(restaurant.contact_details || []);
    }
  }, [restaurant]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const [categories, setCategories] = useState(restaurant?.categories || ['']);

  const editCategory = (index: number, value: string) => {
    setCategories((prevCategories) => {
      const newCategories = [...prevCategories];
      newCategories[index] = value;
      return newCategories;
    });
  };

  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);

  const categoryChangeToEdit = (index: number, value: string) => {
    return (
      <input autoComplete="off"
        type="text"
        className={`inputs  dark:bg-darkthemeitems bg-white `}
        value={value}
        onChange={(e) => editCategory(index, e.target.value)}
        onBlur={() => setEditingCategoryIndex(null)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setEditingCategoryIndex(null);
          }
        }}
        autoFocus
      />
    );
  };

  const deleteCategory = (index: number) => {
    setCategories((prevCategories) => {
      const newCategories = [...prevCategories];
      newCategories.splice(index, 1);
      return newCategories;
    });
  };

  // Editable restaurant update
  const { mutate: updateRestaurant } = useUpdate({
    errorNotification(error) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });

  const { mutate, isLoading } = useCustomMutation();

  const handleSubDomainChange = () => {
    mutate({
      url: 'api/v1/bo/restaurants/subdomain',
      method: 'patch',
      values: { subdomain: subdomain },
      successNotification: {
        type: 'success',
        message: t('settingsPage.general.basicInformationForm.notifications.subdomainUpdated'),
      },
      errorNotification: {
        type: 'error',
        message: t('settingsPage.general.basicInformationForm.notifications.subdomainUpdateFailed'),
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData = {
      name: formData.name,
      email: formData.email,
      website: formData.website,
      phone: formData.phone,
      preferred_language: formData.preferred_language,
      address: formData.address || 'N/A',
      description: formData.description,
      country: formData.country,
      city: formData.city,
      contact_details: contactDetails,
    };

    

    updateRestaurant({
      resource: 'api/v1/bo/restaurants',
      values: updatedData,
      id: restaurantId + '/',
    });
  };

  const addContactDetail = () => {
    setContactDetails([...contactDetails, { type: 'WEBSITE', name: '', link: '' }]);
  };

  const removeContactDetail = (index: number) => {
    const newDetails = [...contactDetails];
    newDetails.splice(index, 1);
    setContactDetails(newDetails);
  };

  const updateContactDetail = (index: number, field: keyof ContactDetail, value: string) => {
    const newDetails = [...contactDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setContactDetails(newDetails);
  };

  const ContactDetailsList = () => (
    <div className="flex flex-col gap-3 mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
      <p className="font-medium">{t('settingsPage.general.contactDetails.title', 'Extra Contact & Socials')}</p>
      {contactDetails.map((detail, index) => {
        const selectedType = CONTACT_TYPES.find(t => t.value === detail.type);
        const Icon = selectedType ? selectedType.icon : LinkIcon;

        return (
          <div key={index} className="flex gap-2 items-start flex-wrap sm:flex-nowrap">
            <div className="w-full sm:w-1/4 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
                <Icon size={18} />
              </div>
              <select
                className="inputs w-full pl-10 dark:bg-darkthemeitems bg-white"
                value={detail.type}
                onChange={(e) => updateContactDetail(index, 'type', e.target.value)}
              >
                {CONTACT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-1/4">
              <input
                type="text"
                placeholder={t('settingsPage.general.contactDetails.namePlaceholder', 'Label (e.g. My Website)')}
                className="inputs w-full dark:bg-darkthemeitems bg-white"
                value={detail.name}
                onChange={(e) => updateContactDetail(index, 'name', e.target.value)}
              />
            </div>
            <div className="w-full sm:w-1/2 flex gap-2">
              <input
                type="text"
                placeholder={t('settingsPage.general.contactDetails.linkPlaceholder', 'Link or Number')}
                className="inputs w-full dark:bg-darkthemeitems bg-white"
                value={detail.link}
                onChange={(e) => updateContactDetail(index, 'link', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeContactDetail(index)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={addContactDetail}
        className="btn-secondary w-fit flex items-center gap-2 mt-2"
      >
        <Plus size={16} /> {t('settingsPage.general.contactDetails.add', 'Add Contact')}
      </button>
    </div>
  );

  // Read-only view when the user does not have access to change
  const ReadOnlyView = () => (
    <div className={`rounded-[10px] p-3 w-full  dark:bg-bgdarktheme bg-white `}>
        <h2 className="text-center mb-3">{t('settingsPage.general.basicInformationForm.title')}</h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-row gap-3">
            <input autoComplete="off"
              type="text"
              placeholder={t('settingsPage.general.basicInformationForm.labels.restaurantName')}
              className={`inputs  dark:bg-darkthemeitems bg-white `}
              value={formData.name}
              readOnly aria-readonly
            />
            <input autoComplete="off"
              type="text"
              placeholder={t('settingsPage.general.basicInformationForm.labels.email')}
              className={`inputs  dark:bg-darkthemeitems bg-white `}
              value={formData.email}
              readOnly aria-readonly
            />
          </div>
          <div className="flex flex-row gap-3">
            <select
              className={`inputs w-1/2  dark:bg-darkthemeitems bg-white `}
              value={formData.country}
              aria-readonly
            >
              {allCountries?.data?.map((country: any) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
            <select
              className={`inputs w-1/2  dark:bg-darkthemeitems bg-white `}
              value={formData.city}
              aria-readonly
            >
              {allCities?.data?.map((city: any) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <input autoComplete="off" 
              type="text"
              placeholder={t('settingsPage.general.basicInformationForm.labels.address')}
              className={`inputs  dark:bg-darkthemeitems bg-white `}
              value={restaurant?.address}
              readOnly aria-readonly
            />
          </div>
          <div className="flex gap-3">
            <textarea
              placeholder={t('settingsPage.general.basicInformationForm.labels.description')}
              className={`inputs  dark:bg-darkthemeitems bg-white `}
              value={formData.description}
              readOnly aria-readonly
            ></textarea>
          </div>
          <div className="flex flex-row gap-3">
            <input autoComplete="off"
              type="text"
              placeholder={t('settingsPage.general.basicInformationForm.labels.phone')}
              className={`inputs  dark:bg-darkthemeitems bg-white `}
              value={formData.phone}
              readOnly aria-readonly
            />
            <input autoComplete="off"
              type="text"
              placeholder={t('settingsPage.general.basicInformationForm.labels.website')}
              className={`inputs  dark:bg-darkthemeitems bg-white `}
              value={formData.website}
              readOnly aria-readonly
            />
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <p>{t('settingsPage.general.basicInformationForm.labels.subdomain')}</p>
            <input autoComplete="off"
              type="text"
              placeholder={t('settingsPage.general.basicInformationForm.labels.subdomain')}
              className={`inputs  dark:bg-darkthemeitems bg-white `}
              value={subdomain}
              readOnly aria-readonly
            />
          </div>
        </div>
      </div>
  );

  return (
    <CanAccess
      resource="restaurant"
      action="change"
      fallback={<ReadOnlyView />}
    >
      <div className={`rounded-[10px] p-3 w-full dark:bg-bgdarktheme bg-white `}>
        <h2 className="text-center mb-3">{t('settingsPage.general.basicInformationForm.title')}</h2>
        <div className="flex flex-col gap-2 mb-4">
          <p>{t('settingsPage.general.basicInformationForm.labels.subdomain')}</p>
          <div className="flex gap-3 lt-lg:flex-col items-center">
            <input autoComplete="off"
              type="text"
              placeholder={t('settingsPage.general.basicInformationForm.labels.subdomain')}
              className={`inputs dark:bg-darkthemeitems bg-white `}
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
            />
            <BaseBtn
              variant="primary"
              type="submit"
              loading={isLoading}
              className=" w-1/4 py-[10px] lt-lg:w-full "
              onClick={handleSubDomainChange}
            >
              {t('settingsPage.general.basicInformationForm.buttons.save')} <span className='text-[10px] flex gap-1 items-center'><WholeWord className="ml-0" size={16} />.tabla.ma</span>
            </BaseBtn>
          </div>
        </div>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit} autoComplete="off">
          <p className="">
            {t('settingsPage.general.basicInformationForm.labels.restaurantInformations')}
          </p>
          <div className="flex flex-row gap-3">
            <input autoComplete="off"
              type="text"
              placeholder={t('settingsPage.general.basicInformationForm.labels.restaurantName')}
              className={`inputs dark:bg-darkthemeitems bg-white `}
              value={formData.name}
              onChange={handleInputChange}
            />
            <input autoComplete="off"
              type="text"
              placeholder={t('settingsPage.general.basicInformationForm.labels.email')}
              className={`inputs dark:bg-darkthemeitems bg-white `}
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-row gap-3">
            <select
              className={`inputs w-1/2 dark:bg-darkthemeitems bg-white `}
              value={formData.country}
              onChange={handleSelectChange}
            >
              {allCountries?.data?.map((country: any) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
            <select
              className={`inputs w-1/2 dark:bg-darkthemeitems bg-white `}
              value={formData.city}
              onChange={handleSelectChange}
            >
              {allCities?.data?.map((city: any) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <input autoComplete="off" 
              type="text"
              placeholder={t('settingsPage.general.basicInformationForm.labels.address')}
              className={`inputs  dark:bg-darkthemeitems bg-white `}
              value={formData.address}
              onChange={handleInputChange}
            />
            <select
              className={`inputs w-1/2 dark:bg-darkthemeitems bg-white `}
              value={formData.preferred_language}
              onChange={handleSelectChange}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
              <option value="es">Español</option>
            </select>
          </div>
          <div className="flex gap-3">
            <textarea
              placeholder={t('settingsPage.general.basicInformationForm.labels.description')}
              className={`inputs  dark:bg-darkthemeitems bg-white `}
              value={formData.description}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <div className="flex flex-row gap-3">
            <input autoComplete="off"
              type="text"
              placeholder={t('settingsPage.general.basicInformationForm.labels.phone')}
              className={`inputs  dark:bg-darkthemeitems bg-white `}
              value={formData.phone}
              onChange={handleInputChange}
            />
            <input autoComplete="off"
              type="text"
              placeholder={t('settingsPage.general.basicInformationForm.labels.website')}
              className={`inputs  dark:bg-darkthemeitems bg-white `}
              value={formData.website}
              onChange={handleInputChange}
            />
          </div>
          
          {/* <ContactDetailsList /> */}

          <div className="flex w-full justify-center gap-4">
            <button
              type="reset"
              className={`btn lt-sm:w-1/2 w-[200px] border border-softgreytheme dark:border-darkthemeitems dark:bg-darkthemeitems dark:text-textdarktheme hover:bg-softgreytheme hover:dark:bg-darkthemeitems`}
            >
              {t('settingsPage.general.basicInformationForm.buttons.cancel')}
            </button>
            <button type="submit" className="btn-primary lt-sm:w-1/2 w-[200px]">
              {t('settingsPage.general.basicInformationForm.buttons.save')}
            </button>
          </div>
        </form>
      </div>
    </CanAccess>
  );
};

export default General;
