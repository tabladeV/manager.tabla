import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Map from '../map/Map';
import { Plus, Trash2 } from 'lucide-react';
import {
  BaseKey,
  BaseRecord,
  useCustomMutation,
  useList,
  useUpdate,
  CanAccess,
} from '@refinedev/core';
import loading from '../../assets/loading.png';

interface Restaurant {
  id: BaseKey;
  name: string;
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
}

const General = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = 'General Settings | Tabla';
  }, []);

  const [restaurantId, setRestaurantId] = useState(localStorage.getItem('restaurant_id'));
  const [subdomain, setSubdomain] = useState<string>('');
  const [restaurant, setRestaurant] = useState<Restaurant | undefined>(undefined);

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
        average_price: restaurant.average_price,
        country: restaurant.country,
        description: restaurant.description,
        phone: restaurant.phone,
        website: restaurant.website,
      });
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
      <input
        type="text"
        className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
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

  const { mutate } = useCustomMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData = {
      name: formData.name,
      email: formData.email,
      website: formData.website,
      phone: formData.phone,
      address: formData.address || 'N/A',
      description: formData.description,
      country: formData.country,
      city: formData.city,
    };

    if (subdomain) {
      mutate({
        url: 'https://api.dev.tabla.ma/api/v1/bo/restaurants/subdomain',
        method: 'patch',
        values: { subdomain: subdomain },
      });
    }

    updateRestaurant({
      resource: 'api/v1/bo/restaurants',
      values: updatedData,
      id: restaurantId + '/',
    });
  };

  // Read-only view when the user does not have access to change
  const ReadOnlyView = () => (
    <div className={`rounded-[10px] p-3 w-full ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'}`}>
        <h2 className="text-center mb-3">{t('settingsPage.general.basicInformationForm.title')}</h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-row gap-3">
            <input
              type="text"
              id="name"
              placeholder={t('settingsPage.general.basicInformationForm.labels.restaurantName')}
              className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
              value={formData.name}
              readOnly aria-readonly
            />
            <input
              type="text"
              id="email"
              placeholder={t('settingsPage.general.basicInformationForm.labels.email')}
              className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
              value={formData.email}
              readOnly aria-readonly
            />
          </div>
          <div className="flex flex-row gap-3">
            <select
              id="country"
              className={`inputs w-1/2 ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
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
              id="city"
              className={`inputs w-1/2 ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
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
            <input 
              type="text"
              id="address"
              placeholder={t('settingsPage.general.basicInformationForm.labels.address')}
              className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
              value={restaurant?.address}
              readOnly aria-readonly
            />
          </div>
          <div className="flex gap-3">
            <textarea
              id="description"
              placeholder={t('settingsPage.general.basicInformationForm.labels.description')}
              className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
              value={formData.description}
              readOnly aria-readonly
            ></textarea>
          </div>
          <div className="flex flex-row gap-3">
            <input
              type="text"
              id="phone"
              placeholder={t('settingsPage.general.basicInformationForm.labels.phone')}
              className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
              value={formData.phone}
              readOnly aria-readonly
            />
            <input
              type="text"
              id="website"
              placeholder={t('settingsPage.general.basicInformationForm.labels.website')}
              className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
              value={formData.website}
              readOnly aria-readonly
            />
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <p>{t('settingsPage.general.basicInformationForm.labels.subdomain')}</p>
            <input
              type="text"
              id="subdomain"
              placeholder={t('settingsPage.general.basicInformationForm.labels.subdomain')}
              className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
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
      <div className={`rounded-[10px] p-3 w-full ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'}`}>
        <h2 className="text-center mb-3">{t('settingsPage.general.basicInformationForm.title')}</h2>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="flex flex-row gap-3">
            <input
              type="text"
              id="name"
              placeholder={t('settingsPage.general.basicInformationForm.labels.restaurantName')}
              className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
              value={formData.name}
              onChange={handleInputChange}
            />
            <input
              type="text"
              id="email"
              placeholder={t('settingsPage.general.basicInformationForm.labels.email')}
              className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-row gap-3">
            <select
              id="country"
              className={`inputs w-1/2 ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
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
              id="city"
              className={`inputs w-1/2 ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
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
            <input 
              type="text"
              id="address"
              placeholder={t('settingsPage.general.basicInformationForm.labels.address')}
              className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex gap-3">
            <textarea
              id="description"
              placeholder={t('settingsPage.general.basicInformationForm.labels.description')}
              className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
              value={formData.description}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <div className="flex flex-row gap-3">
            <input
              type="text"
              id="phone"
              placeholder={t('settingsPage.general.basicInformationForm.labels.phone')}
              className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
              value={formData.phone}
              onChange={handleInputChange}
            />
            <input
              type="text"
              id="website"
              placeholder={t('settingsPage.general.basicInformationForm.labels.website')}
              className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
              value={formData.website}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <p>{t('settingsPage.general.basicInformationForm.labels.subdomain')}</p>
            <input
              type="text"
              id="subdomain"
              placeholder={t('settingsPage.general.basicInformationForm.labels.subdomain')}
              className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
            />
          </div>
          <div className="flex w-full justify-center gap-4">
            <button
              type="reset"
              className={`btn ${localStorage.getItem('darkMode') === 'true' ? 'border-white text-white hover:border-redtheme hover:text-redtheme' : ''}`}
            >
              {t('settingsPage.general.basicInformationForm.buttons.cancel')}
            </button>
            <button type="submit" className="btn-primary">
              {t('settingsPage.general.basicInformationForm.buttons.save')}
            </button>
          </div>
        </form>
      </div>
    </CanAccess>
  );
};

export default General;
