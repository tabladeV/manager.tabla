import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Map from '../map/Map';
import { Plus, Trash2 } from 'lucide-react';
import { BaseKey, BaseRecord, useList } from '@refinedev/core';
import loading from '../../assets/loading.png';

interface Restaurant {
  id: BaseKey,
  name: string,
  email: string,
  website: string,
  phone:string,
  location: string,
  address: string,
  is_approved: boolean,
  max_of_guests: number,
  description: string,
  allow_reservation: boolean,
  average_price: string,
  due_cancellation_period: number,
  buffer: string,
  created_at: string,
  edit_at: string,
  country: number,
  city: number,
  category: number,
  manager: number,
  restaurant_type: number,
  categories: [],
  staff: []
}

const General = () => {

  const [restaurantId, setRestaurantId] = useState(1);

  const {data: restaurantData, isLoading, error} = useList({
    resource: `api/v1/bo/restaurants/1/current`,
    // meta: {
    //   headers: {
    //     'id': 1,
    //   },
    // },
  });

  
  const [restaurant, setRestaurant] = useState<Restaurant>();
  console.log(restaurantData);
  
  useEffect(() => {
    if (restaurantData?.data) {
      setRestaurant(restaurantData.data as Restaurant);
    }
  }, [restaurantData]);
  console.log(restaurant);
  
  const {data:cityData, isLoading:isLoadingCity, error:errorCity} = useList({
    resource: `api/v1/api/v1/bo/cities/${restaurant?.city}`,
  });

  const {data:countryData, isLoading:isLoadingCountry, error:errorCountry} = useList({
    resource: `api/v1/api/v1/bo/countries/${restaurant?.country}`,
  });

  console.log('city,',cityData);
  
  const {data : allCities, isLoading:isLoadingAllCities, error:errorAllCities} = useList({
    resource: 'api/v1/api/v1/bo/cities',
  });

  const {data : allCountries, isLoading:isLoadingAllCountries, error:errorAllCountries} = useList({
    resource: 'api/v1/api/v1/bo/countries',
  });

  console.log('all cities',allCountries);


  // State for form data
  const [formData, setFormData] = useState({
    name: restaurant?.name ,
    email: restaurant?.email ,
    city: restaurant?.city ,
    country: restaurant?.country ,
    average_price: restaurant?.average_price ,
    description: restaurant?.description ,
    phone: restaurant?.phone ,
    website: restaurant?.website 
  });

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        email: restaurant.email,
        city: restaurant.city,
        average_price: restaurant.average_price,
        country: restaurant.country,
        description: restaurant.description,
        phone: restaurant.phone,
        website: restaurant.website
      });
    }
  }, [restaurant]);

  // State for countries and cities
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('Morocco');

  // Fetch countries only once on component mount
  useEffect(() => {
    axios.get('https://restcountries.com/v3.1/all')
      .then(response => {
        const countryNames = response.data.map((country: { name: { common: string } }) => country.name.common);
        setCountries(countryNames);
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
      });
  }, []);

  // Fetch cities whenever selectedCountry changes
  useEffect(() => {
    if (selectedCountry) {
      axios.post('https://countriesnow.space/api/v0.1/countries/cities', { country: selectedCountry })
        .then(response => {
          setCities(response.data.data || []);
        })
        .catch(error => {
          console.error('Error fetching cities:', error);
        });
    }
  }, [selectedCountry]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value
    }));
  };
  
  // Separate handler for select elements
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value
    }));
  
    // If it's the country select
    if (id === "country") {
      setSelectedCountry(value);
    }
  };
  
  // Handle country selection

  // Categories
  const [categories, setCategories] = useState(restaurant?.categories || ['']);

  const editCategory = (index: number, value: string) => {
    setCategories((prevCategories) => {
      const newCategories = [...prevCategories];
      newCategories[index] = value;
      return newCategories;
    });
  }

  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);

  const categoryChangeToEdit = (index: number, value: string) => {
    return (
      <input
      type="text"
      className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`}
      value={value}
      onChange={(e) => editCategory(index, e.target.value)}
      onBlur={() => setEditingCategoryIndex(null)} // Save and exit edit mode on blur
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
        setEditingCategoryIndex(null); // Save and exit edit mode on Enter key press
        }
      }}
      autoFocus // Automatically focus the input when editing
      />
    )
  }

  const deleteCategory = (index: number) => {
    setCategories((prevCategories) => {
      const newCategories = [...prevCategories];
      newCategories.splice(index, 1);
      return newCategories;
    });
  }

  const {t}= useTranslation();


  return (
    <div className={`rounded-[10px] p-3 w-full ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'}`}>
      <h2 className="text-center mb-3">{t('settingsPage.general.basicInformationForm.title')}</h2>
      <form className="flex flex-col gap-3">
        <div className="flex flex-row gap-3">
          <input
            type="text"
            id="name"
            placeholder={t('settingsPage.general.basicInformationForm.labels.restaurantName')}
            className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`}
            value={formData.name}
            onChange={handleInputChange}
          />
          <input
            type="text"
            id="email"
            placeholder={t('settingsPage.general.basicInformationForm.labels.email')}
            className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`}
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex flex-row gap-3">
        <select
          id="country"
          className={`inputs w-1/2 ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`}
          value={selectedCountry}
          onChange={handleSelectChange}
        >
          {allCountries?.data.map((country) => (
            <option key={country.id} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
        <select
          id="city"
          className={`inputs w-1/2 ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`}
          value={formData.city}
          onChange={handleSelectChange} // Use the same handler for city
        >
          <option value="">{t('settingsPage.general.basicInformationForm.labels.city')}</option>
          {allCities?.data.map((city) => (
            <option key={city.id} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>

        </div>
        <div className="flex gap-3">
          <textarea
            id="description"
            placeholder={t('settingsPage.general.basicInformationForm.labels.description')}
            className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`}
            value={formData.description}
            onChange={handleInputChange}
          ></textarea>
        </div>
        <div className="flex flex-row gap-3">
          <input
            type="text"
            id="phone"
            placeholder={t('settingsPage.general.basicInformationForm.labels.phone')}
            className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`}
            value={formData.phone}
            onChange={handleInputChange}
          />
          <input
            type="text"
            id="website"
            placeholder={t('settingsPage.general.basicInformationForm.labels.website')}
            className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`}
            value={formData.website}
            onChange={handleInputChange}
          />
        </div>
        <div className='flex flex-col gap-3'>
          <label>{t('settingsPage.general.basicInformationForm.labels.categories')}</label>
          {categories.map((category, index) => (
            <div key={category} className='w-full flex justify-between gap-3'>
              {editingCategoryIndex === index ? (
                categoryChangeToEdit(index, category)
              ) : (
                <div 
                  onClick={() => setEditingCategoryIndex(index)}
                  className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`}
                >
                  {category}
                </div>
              )}
              <button
                onClick={() => deleteCategory(index)}
                className="p-2 rounded bg-softredtheme text-redtheme hover:bg-transparent transition-colors"
                aria-label="Delete item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {categories.length < 3 && 
            <div>
              <div className='flex gap-2 cursor-pointer items-center' 
                onClick={() => setCategories((prevCategories) => [...prevCategories, ''])}
              >
                <Plus className="w-5 h-5" />
                {t('settingsPage.general.basicInformationForm.buttons.addcategory')}
              </div>
            </div>
          }
        </div>
        <div className='relative gap-2 flex flex-col'>
          <label>{t('settingsPage.general.basicInformationForm.labels.avgPrice')}</label>
          <input 
            type="number" 
            placeholder={t('settingsPage.general.basicInformationForm.labels.avgPrice')} 
            id="avgPrice"
            value={formData.average_price}
            onChange={handleInputChange}
            className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`}
          />
          <div className="text-sm absolute mt-[3.2em] right-10">{t('settingsPage.general.basicInformationForm.labels.currency')}</div>
        </div>
        {/* <div>
          <label>{t('settingsPage.general.basicInformationForm.labels.location')}</label>
          <Map />
        </div> */}
        <div className="flex w-full justify-center gap-4">
          <button type="reset" className={`btn ${localStorage.getItem('darkMode')==='true'?'border-white text-white hover:border-redtheme hover:text-redtheme' :''}`}>{t('settingsPage.general.basicInformationForm.buttons.cancel')}</button>
          <button type="submit" className="btn-primary">{t('settingsPage.general.basicInformationForm.buttons.save')}</button>
        </div>
      </form>
    </div>
  );
};

export default General;
