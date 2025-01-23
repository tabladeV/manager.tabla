import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Map from '../map/Map';
import { Plus, Trash2 } from 'lucide-react';

const General = () => {
  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    country: '',
    description: '',
    phone: '',
    website: ''
  });

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
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setSelectedCountry(selectedValue);
    setFormData((prevData) => ({
      ...prevData,
      country: selectedValue
    }));
  };

  // Handle city selection
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      city: selectedCity
    }));
  };

  // Categories
  const [categories, setCategories] = useState([
    'Fast Food',
    'Restaurant',
  ]);

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
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
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
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
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
            className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`}
          />
          <div className="text-sm absolute mt-[3.2em] right-10">{t('settingsPage.general.basicInformationForm.labels.currency')}</div>
        </div>
        <div>
          <label>{t('settingsPage.general.basicInformationForm.labels.location')}</label>
          <Map />
        </div>
        <div className="flex w-full justify-center gap-4">
          <button type="reset" className={`btn ${localStorage.getItem('darkMode')==='true'?'border-white text-white hover:border-redtheme hover:text-redtheme' :''}`}>{t('settingsPage.general.basicInformationForm.buttons.cancel')}</button>
          <button type="submit" className="btn-primary">{t('settingsPage.general.basicInformationForm.buttons.save')}</button>
        </div>
      </form>
    </div>
  );
};

export default General;
