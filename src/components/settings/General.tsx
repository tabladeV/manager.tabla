import axios from 'axios';
import { useEffect, useState } from 'react';

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
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('Morocco');

  // Fetch countries only once on component mount
  useEffect(() => {
    axios.get('https://restcountries.com/v3.1/all')
      .then(response => {
        const countryNames = response.data.map((country) => country.name.common);
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value
    }));
  };

  // Handle country selection
  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
    setFormData((prevData) => ({
      ...prevData,
      country: e.target.value
    }));
  };

  return (
    <div className="bg-white rounded-[10px] p-3 w-full">
      <h2 className="text-center mb-3">Basic Information</h2>
      <form className="flex flex-col gap-3">
        <div className="flex flex-row gap-3">
          <input
            type="text"
            id="name"
            placeholder="Restaurant Name"
            className="inputs"
            value={formData.name}
            onChange={handleInputChange}
          />
          <input
            type="text"
            id="email"
            placeholder="Email"
            className="inputs"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex flex-row gap-3">
          <select
            className="inputs w-1/2"
            value={selectedCountry}
            onChange={handleCountryChange}
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <select
            className="inputs w-1/2"
            id="city"
            value={formData.city}
            onChange={handleInputChange}
          >
            <option value="">Select City</option>
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
            placeholder="Restaurant Description"
            className="inputs w-full"
            value={formData.description}
            onChange={handleInputChange}
          ></textarea>
        </div>
        <div className="flex flex-row gap-3">
          <input
            type="text"
            id="phone"
            placeholder="Phone"
            className="inputs"
            value={formData.phone}
            onChange={handleInputChange}
          />
          <input
            type="text"
            id="website"
            placeholder="Website"
            className="inputs"
            value={formData.website}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex w-full justify-center gap-4">
          <button type="reset" className="btn">Cancel</button>
          <button type="submit" className="btn-primary">Save</button>
        </div>
      </form>
    </div>
  );
};

export default General;
