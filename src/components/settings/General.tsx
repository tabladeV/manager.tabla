import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Map from '../map/Map';

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

  const {t}= useTranslation();

  return (
    <div className="bg-white rounded-[10px] p-3 w-full">
      <h2 className="text-center mb-3">{t('settingsPage.general.basicInformationForm.title')}</h2>
      <form className="flex flex-col gap-3">
        <div className="flex flex-row gap-3">
          <input
            type="text"
            id="name"
            placeholder={t('settingsPage.general.basicInformationForm.labels.restaurantName')}
            className="inputs"
            value={formData.name}
            onChange={handleInputChange}
          />
          <input
            type="text"
            id="email"
            placeholder={t('settingsPage.general.basicInformationForm.labels.email')}
            className="inputs"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex flex-row gap-3">
        <select
          id="country"
          className="inputs w-1/2"
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
          className="inputs w-1/2"
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
            className="inputs w-full"
            value={formData.description}
            onChange={handleInputChange}
          ></textarea>
        </div>
        <div className="flex flex-row gap-3">
          <input
            type="text"
            id="phone"
            placeholder={t('settingsPage.general.basicInformationForm.labels.phone')}
            className="inputs"
            value={formData.phone}
            onChange={handleInputChange}
          />
          <input
            type="text"
            id="website"
            placeholder={t('settingsPage.general.basicInformationForm.labels.website')}
            className="inputs"
            value={formData.website}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>{t('settingsPage.general.basicInformationForm.labels.location')}</label>
          <Map />
        </div>
        <div className="flex w-full justify-center gap-4">
          <button type="reset" className="btn">{t('settingsPage.general.basicInformationForm.buttons.cancel')}</button>
          <button type="submit" className="btn-primary">{t('settingsPage.general.basicInformationForm.buttons.save')}</button>
        </div>
      </form>
    </div>
  );
};

export default General;
