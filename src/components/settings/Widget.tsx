import { useState, useRef, useEffect } from 'react';
import { Upload, Check, X, Download, Navigation, ScreenShareIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BaseKey, useList, useUpdate } from '@refinedev/core';
import { Document, Page } from "react-pdf";


interface Widget {
  id: BaseKey;
  image: string;
  title: string;
  restaurant: string;
  description: string;
  menu_file: string;
  has_menu: boolean;
}

const base64ToBlob = (base64: string, mimeType: string) => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

export default function WidgetConfig() {
  // const [restaurantId, setRestaurantId] = useState(1);

  const restaurantId = localStorage.getItem('restaurant_id');
  const { t } = useTranslation();

  const { data: widgetData, isLoading, error } = useList({
    resource: `api/v1/bo/restaurants/${restaurantId}/widget/`,
  });



  const [widgetInfo, setWidgetInfo] = useState<Widget>();
  const [logo, setLogo] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [hasMenu, setHasMenu] = useState<boolean>();
  const [description, setDescription] = useState('');
  const [menuPdf, setMenuPdf] = useState<string | null>(null);
  const [searchTabs, setSearchTabs] = useState({
    menu: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const filePdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (widgetData?.data) {
      const data = widgetData.data as unknown as Widget;
      setHasMenu(data.has_menu);
      setSearchTabs((prev) => ({ ...prev, menu: data.has_menu }));
      setWidgetInfo(data);
      setTitle(data.title);
      setDescription(data.description);
      setMenuPdf(data.menu_file || null);
      setLogo(data.image || null);
    }
  }, [widgetData]);

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


  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filePDF, setFilePDF] = useState<File | null>(null);
  const [previewUrlPDF, setPreviewUrlPDF] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);

      // Generate a temporary preview URL
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      setLogo(objectUrl);
    }
  };

  const [uploadedPdf, setUploadedPdf] = useState<boolean>(false);

  const handleMenuUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFilePDF(selectedFile);

      // Generate a temporary preview URL
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrlPDF(objectUrl);
      setMenuPdf(objectUrl);
      setUploadedPdf(true);
      console.log('uploadedPdf', uploadedPdf);
    }
  };

  const openPdfInNewTab = () => {
    if (!menuPdf) {
      alert('No menu PDF available to open.');
      return;
    }
    const linkSource = !uploadedPdf ? `https://api.dev.tabla.ma${menuPdf}` : menuPdf;
    window.open(linkSource, '_blank');
  };

  

  const handleSearchTabChange = (tab: keyof typeof searchTabs) => {
    setSearchTabs((prev) => ({ ...prev, [tab]: !prev[tab] }));
  };

  const { mutate: updateWidget } = useUpdate();
  const handleSave = async () => {
    if (!widgetInfo) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('has_menu', searchTabs.menu.toString());

    if(file){
      formData.append('image', file);
    }

    if (filePDF && searchTabs.menu) {
      formData.append('menu_file', filePDF);
    }else {
      formData.append('menu_file', '');
    }

    try {
      await updateWidget({
        id: `${restaurantId}/widget_partial_update/`,
        resource: `api/v1/bo/restaurants`,
        values: formData,
      });
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Error updating widget:', error);
      alert('Failed to save configuration. Please try again.');
    }
  };

  const [newLogo, setNewLogo] = useState<boolean>(false);

  const darkModeClass = localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme text-white' : 'bg-white text-black';

  if (isLoading) return <div className="text-center">Loading...</div>;

  return (
    <div className={`w-full mx-auto p-6 rounded-[10px] ${darkModeClass}`}>
      <h1 className="text-2xl font-bold text-center mb-6">
        {t('settingsPage.widget.title')} for <span className='italic font-[600]'>{widgetInfo?.restaurant}</span>
      </h1>

      <div className="mb-6">
        {logo ? (
          <div className="relative w-full h-40 bg-gray-100 dark:bg-darkthemeitems rounded-lg overflow-hidden">
            <img src={!newLogo ? `https://api.dev.tabla.ma${logo}` : logo} alt="Logo" className="w-full h-full object-contain" />
            <button
              onClick={() => {setLogo(null);setNewLogo(true)}}
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
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

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

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">{t('settingsPage.widget.searchTabs.title')}</h2>
        <div className="flex flex-wrap gap-4">
          {Object.entries(searchTabs).map(([key, value]) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={hasMenu ? value : key === 'menu' && value}
                onChange={() => setHasMenu((prev) => !prev)}
                className="sr-only"
              />
              <span
                className={`flex items-center justify-center w-6 h-6 border rounded-md mr-2 ${
                  hasMenu ? 'bg-greentheme border-greentheme' : 'border-gray-300 dark:border-darkthemeitems'
                }`}
              >
                {hasMenu && <Check size={16} className="text-white" />}
              </span>
              <span className="capitalize">{key}</span>
            </label>
          ))}
        </div>
        {(hasMenu && searchTabs.menu) && (
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
                onClick={openPdfInNewTab}
              >
                <p>Preview your menu</p>
                <ScreenShareIcon size={20} />
              </div>
            ) : (
              'No menu uploaded'
            )}
          </div>
        )}
      </div>

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