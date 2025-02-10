import { useList } from '@refinedev/core';
import { Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';

const ReviewWidget = () => {

    const {data: widgetData, isLoading, error} = useList({
        resource: 'api/v1/reviews/widget',
    });

    console.log(widgetData)

    const fileInputRef = useRef<HTMLInputElement>(null);

    
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [logo, setLogo] = useState<string | null>(null);
    const [newLogo, setNewLogo] = useState<boolean>(false);
    
    
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
    

    const darkModeClass = localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme text-white' : 'bg-white text-black';
    const {t} = useTranslation();
  return (
    <div className={`w-full mx-auto p-6 rounded-[10px] ${darkModeClass}`}>
      <h1 className="text-2xl font-bold text-center mb-6">
        {t('settingsPage.widget.title')} for <span className='italic font-[600]'></span>
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

    </div>
  )
}

export default ReviewWidget
