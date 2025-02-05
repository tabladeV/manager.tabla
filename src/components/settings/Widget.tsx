import { useState, useRef, useEffect } from 'react';
import { Upload, Check, X, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BaseKey, useList, useUpdate } from '@refinedev/core';

interface Widget {
  id: BaseKey;
  image: string;
  title: string;
  restaurant: string;
  description: string;
  menu_file: string;
}

export default function WidgetConfig() {
  const [restaurantId, setRestaurantId] = useState(1);
  const { t } = useTranslation();

  // Fetch widget data
  const { data: widgetData, isLoading, error } = useList({
    resource: `api/v1/bo/restaurants/${restaurantId}/widget/`,
  });

  // State for widget information
  const [widgetInfo, setWidgetInfo] = useState<Widget>();
  const [logo, setLogo] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [menuPdf, setMenuPdf] = useState<string | null>(null);
  const [searchTabs, setSearchTabs] = useState({
    menu: true,
  });

  // Refs for file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filePdfInputRef = useRef<HTMLInputElement>(null);

  // Initialize widget data
  useEffect(() => {
    if (widgetData?.data) {
      const data = widgetData.data as unknown as Widget;
      setWidgetInfo(data);
      setTitle(data.title);
      setDescription(data.description);
      setMenuPdf(data.menu_file || null);
      setLogo(data.image || null);
    }
  }, [widgetData]);

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setLogo(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Handle menu PDF upload
  const handleMenuUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setMenuPdf(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Download menu PDF
  const downloadPdf = () => {
    if (!menuPdf) {
      alert('No menu PDF available to download.');
      return;
    }
    const linkSource = menuPdf;
    const downloadLink = document.createElement('a');
    const fileName = 'menu.pdf';
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  };

  // Toggle search tabs
  const handleSearchTabChange = (tab: keyof typeof searchTabs) => {
    setSearchTabs((prev) => ({ ...prev, [tab]: !prev[tab] }));
  };

  // Save widget configuration
  const { mutate: updateWidget } = useUpdate();
  const handleSave = () => {
    if (!widgetInfo) return;

    const updatedData = {
      title,
      description,
      image: logo,
      menu_file: menuPdf,
      has_menu: searchTabs.menu,
    };

    console.log('Updated Data:', updatedData);

    // Use the `useUpdate` hook to send a PATCH request
    updateWidget(
      {
        resource: `api/v1/bo/restaurants/${restaurantId}/widget_partial_update/`,
        values: updatedData,
      },
      {
        onError: (error) => {
          console.error('Error updating widget:', error);
          alert('Failed to save configuration. Please try again.');
        },
        onSuccess: () => {
          alert('Configuration saved successfully!');
        },
      }
    );
  };

  // Dark mode class
  const darkModeClass = localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme text-white' : 'bg-white text-black';

  if (isLoading) return <div className="text-center">Loading...</div>;

  return (
    <div className={`w-full mx-auto p-6 rounded-[10px] ${darkModeClass}`}>
      <h1 className="text-2xl font-bold text-center mb-6">
        {t('settingsPage.widget.title')} for {widgetInfo?.restaurant}
      </h1>

      {/* Logo Upload Section */}
      <div className="mb-6">
        {logo ? (
          <div className="relative w-full h-40 bg-gray-100 dark:bg-darkthemeitems rounded-lg overflow-hidden">
            <img src={logo} alt="Uploaded logo" className="w-full h-full object-contain" />
            <button
              onClick={() => setLogo(null)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-darkthemeitems rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-darkthemeitems transition-colors"
          >
            <Upload className="mr-2" size={20} />
            {t('settingsPage.widget.uploadLogo')}
          </button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleLogoUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Title and Description Section */}
      <div className="space-y-4 mb-6">
        <input
          type="text"
          placeholder={t('settingsPage.widget.addTitlePlaceholder')}
          className="inputs p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder={t('settingsPage.widget.addDescriptionPlaceholder')}
          className="w-full inputs p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white lt-sm:w-full h-24 resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Search Tabs Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">{t('settingsPage.widget.searchTabs.title')}</h2>
        <div className="flex flex-wrap gap-4">
          {Object.entries(searchTabs).map(([key, value]) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={value}
                onChange={() => handleSearchTabChange(key as keyof typeof searchTabs)}
                className="sr-only"
              />
              <span
                className={`flex items-center justify-center w-6 h-6 border rounded-md mr-2 ${
                  value ? 'bg-greentheme border-greentheme' : 'border-gray-300 dark:border-darkthemeitems'
                }`}
              >
                {value && <Check size={16} className="text-white" />}
              </span>
              <span className="capitalize">{key}</span>
            </label>
          ))}
        </div>
        {searchTabs.menu && (
          <div className="flex justify-around items-center">
            <button
              onClick={() => filePdfInputRef.current?.click()}
              className="btn-secondary gap-2 flex mt-3"
            >
              <Upload className="mr-2" size={20} />
              {t('settingsPage.widget.uploadMenu')}
            </button>
            <input
              type="file"
              ref={filePdfInputRef}
              onChange={handleMenuUpload}
              accept="application/pdf"
              className="hidden"
            />
            {menuPdf ? (
              <div
                className="btn-secondary flex gap-4 items-center mt-3 justify-center cursor-pointer"
                onClick={downloadPdf}
              >
                <p>Download Our Menu</p>
                <Download size={20} />
              </div>
            ) : (
              'No menu uploaded'
            )}
          </div>
        )}
      </div>

      {/* Save and Preview Buttons */}
      <div className="flex gap-3 space-x-4">
        <button
          onClick={handleSave}
          className="flex-1 py-2 bg-greentheme text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          {t('settingsPage.widget.buttons.save')}
        </button>
        <Link to={`/widget/r/${restaurantId}`} target="_blank" className="btn-secondary w-1/2 text-center">
          {t('settingsPage.widget.buttons.preview')}
        </Link>
      </div>
    </div>
  );
}