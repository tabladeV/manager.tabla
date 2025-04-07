import { BaseKey, useCustomMutation, useList, useUpdate } from '@refinedev/core';
import { Upload, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import axiosInstance from '../../providers/axiosInstance';

const ReviewWidget = () => {

  
  useEffect(() => {
    document.title = 'Review Widget Settings | Tabla'
  }, [])

  const restaurantId = localStorage.getItem('restaurant_id');

  // const { mutate, isLoading: widgetLoading, data, error: widgetError } = useCustomMutation();
  
  const {data : subdomainData, isLoading: isLoadingSubdomain, error: errorSubdomain} = useList({
    resource: 'api/v1/bo/restaurants/subdomain',
  })
  const [subdomain, setSubdomain] = useState<string>('')
  useEffect(() => {
    if(subdomainData?.data){
      const subdomainApi = subdomainData.data as unknown as {subdomain: string}
      setSubdomain(subdomainApi.subdomain as unknown as string)
    }
  }, [subdomainData])

  const { data: reviewData, isLoading, error } = useList({
    resource: 'api/v1/reviews/widget',
  });

  interface ReviewSettings {
    id: BaseKey;
    title: string;
    description: string;
    logo: string;
    restaurant: number;
  }

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [reviewSettings, setReviewSettings] = useState<ReviewSettings>();
  const [logo, setLogo] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newLogo, setNewLogo] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (reviewData?.data) {
      setReviewSettings(reviewData.data as unknown as ReviewSettings);
    }
  }, [reviewData]);

  useEffect(() => {
    if (reviewSettings) {
      setTitle(reviewSettings.title);
      setDescription(reviewSettings.description);
      setLogo(reviewSettings.logo);
      if (reviewSettings.logo) {
        setNewLogo(false);
      }
    }
  }, [reviewSettings]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);

      // Generate a temporary preview URL
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      setNewLogo(true); // Indicate that a new logo has been selected
    }
  };

  const { mutate: updateWidget } = useUpdate({
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });

  const handleSave = async () => {
    if (!reviewSettings) return;

    const newFormData = new FormData();
    newFormData.append('title', title);
    newFormData.append('description', description);
    if (file) {
      newFormData.append('logo', file); // Append the logo file to FormData
    }
    console.log('formData', newFormData);


    try {
      await axiosInstance.patch('/api/v1/reviews/widget',newFormData)
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Error updating widget:', error);
      alert('Failed to save configuration. Please try again.');
    }
  };

  const darkModeClass =
    localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme text-white' : 'bg-white text-black';
  const { t } = useTranslation();
  const API_HOST = import.meta.env.VITE_API_URL || "https://api.dev.tabla.ma";
  return (
    <div className={`w-full mx-auto p-6 rounded-[10px] ${darkModeClass}`}>
      <h1 className="text-2xl font-bold text-center mb-6">
        {t('settingsPage.widget.title')} for <span className="italic font-[600]"></span>
      </h1>
      <div className="mb-6">
        {logo || previewUrl ? (
          <div className="relative w-full h-40 bg-gray-100 dark:bg-darkthemeitems rounded-lg overflow-hidden">
            <img
              src={!newLogo ? `${API_HOST}${logo ?? ''}` : previewUrl ?? undefined}
              alt="Logo"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => {
                setLogo(null);
                setPreviewUrl(null);
                setNewLogo(true);
              }}
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
      <div className="flex gap-3 lt-md:flex-col">
        <button
          onClick={handleSave}
          className="flex-1 py-2 bg-greentheme text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          {t('settingsPage.widget.buttons.save')}
        </button>
        <Link to={`https://${subdomain}.dev.tabla.ma/make/review/preview`} target="_blank" className="btn-secondary w-1/2 text-center lt-md:w-full">
          {t('settingsPage.widget.buttons.preview')}
        </Link>
      </div>
    </div>
  );
};

export default ReviewWidget;