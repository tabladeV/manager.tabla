import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Upload, Check, X, ScreenShareIcon, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import 'draft-js/dist/Draft.css';
import { BaseKey, useList, useUpdate } from '@refinedev/core';
import TitledQuillEditor from './widgetComp/TitledQuillEditor';
import BaseBtn from '../common/BaseBtn';
import InlineQuillEditor from '../common/InlineQuillEditor';



interface Widget {
  id: BaseKey;
  image: string;
  title: string;
  restaurant: string;
  is_widget_activated: boolean;
  max_of_guests_par_reservation: number;
  disabled_description: string;
  image_2: string;
  disabled_title: string;
  content: string;
  description: string;
  menu_file: string;
  enable_dress_code: boolean;
  enbale_area_selection: boolean;
  dress_code: string;
  has_menu: boolean;
  auto_confirmation: boolean;
  enable_paymant: boolean;
  min_number_of_guests_required_deposite?: number;
  deposite_amount_for_guest?: number;
}





export default function WidgetConfig() {
  const navigate = useNavigate();
  const location = useLocation();

  // Memoize searchParams to prevent unnecessary re-renders
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const restaurantId = localStorage.getItem('restaurant_id');
  const { t } = useTranslation();

  // Update URL when component state changes
  const updateURL = useCallback((section: string) => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set('section', section);
    navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
  }, [location.pathname, location.search, navigate]);

  const { data: subdomainData } = useList({
    resource: 'api/v1/bo/restaurants/subdomain',
  })
  const [subdomain, setSubdomain] = useState<string>('')
  useEffect(() => {
    if (subdomainData?.data) {
      const subdomainApi = subdomainData.data as unknown as { subdomain: string }
      setSubdomain(subdomainApi.subdomain as unknown as string)
    }
  }, [subdomainData])

  const { data: widgetData, isLoading } = useList({
    resource: `api/v1/bo/restaurants/${restaurantId}/widget/`,
  });


  useEffect(() => {
    document.title = 'Booking Widget Settings | Tabla'
    // Update URL to reflect current component if no section is specified
    if (!searchParams.get('section')) {
      updateURL('widget');
    }
  }, [searchParams, updateURL])


  const [widgetInfo, setWidgetInfo] = useState<Widget>();
  const [logo, setLogo] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [hasMenu, setHasMenu] = useState<boolean>();
  const [autoConfirmation, setAutoConfirmation] = useState<boolean>(false);
  const [enableDressCode, setEnableDressCode] = useState<boolean>(false);
  const [enableAreaSelection, setEnableAreaSelection] = useState<boolean>(false);
  const [enablePayment, setEnablePayment] = useState<boolean>(false);
  const [minGuestsForPayment, setMinGuestsForPayment] = useState<number>(1);
  const [depositAmountPerGuest, setDepositAmountPerGuest] = useState<number>(0);


  // Optimized checkbox handlers with useCallback
  const handlePaymentToggle = useCallback(() => {
    setEnablePayment(prev => !prev);
  }, []);

  const handleMenuToggle = useCallback(() => {
    setHasMenu(prev => !prev);
  }, []);

  const handleAutoConfirmationToggle = useCallback(() => {
    setAutoConfirmation(prev => !prev);
  }, []);

  const handleDressCodeToggle = useCallback(() => {
    setEnableDressCode(prev => !prev);
  }, []);

  const handleAreaSelectionToggle = useCallback(() => {
    setEnableAreaSelection(prev => !prev);
  }, []);
  const [description, setDescription] = useState('');
  const [disabledTitle, setDisabledTitle] = useState('');
  const [disabledDescription, setDisabledDescription] = useState('');
  const [dressCode, setDressCode] = useState<string>('');
  const [isWidgetActivated, setIsWidgetActivated] = useState<boolean>(true);
  const [menuPdf, setMenuPdf] = useState<string | null>(null);
  const [searchTabs, setSearchTabs] = useState({
    menu: true,
  });

  const [maxGuestsPerReservation, setMaxGuestsPerReservation] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRefImage = useRef<HTMLInputElement>(null);
  const filePdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (widgetData?.data) {
      const data = widgetData.data as unknown as Widget;
      setHasMenu(data.has_menu);
      setAutoConfirmation(data.auto_confirmation);
      setMaxGuestsPerReservation(data.max_of_guests_par_reservation)
      setSearchTabs((prev) => ({ ...prev, menu: data.has_menu }));
      setWidgetInfo(data);
      setTitle(data.title);
      setDisabledTitle(data.disabled_title);
      setImage(data.image_2);
      setDisabledDescription(data.disabled_description);
      setIsWidgetActivated(data.is_widget_activated);
      setDescription(data.content);
      setMenuPdf(data.menu_file || null);
      setLogo(data.image || null);
      setEnableDressCode(data.enable_dress_code);
      setEnableAreaSelection(data.enbale_area_selection);
      setDressCode(data.dress_code || '');
      setEnablePayment(data.enable_paymant);
      setMinGuestsForPayment(data.min_number_of_guests_required_deposite || 1);
      setDepositAmountPerGuest(data.deposite_amount_for_guest || 0);
      // if(logo === null){
      //   setNewLogo(true);
      // }
    }
  }, [widgetData]);



  const [file, setFile] = useState<File | null>(null);
  const [filePDF, setFilePDF] = useState<File | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setImageFile(selectedFile);

      // Generate a temporary preview URL
      const objectUrl = URL.createObjectURL(selectedFile);
      setImage(objectUrl);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);

      // Generate a temporary preview URL
      const objectUrl = URL.createObjectURL(selectedFile);
      setLogo(objectUrl);
    }
  };

  const handleMenuUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFilePDF(selectedFile);

      // Generate a temporary preview URL
      const objectUrl = URL.createObjectURL(selectedFile);
      setMenuPdf(objectUrl);
    }
  };

  const openPdfInNewTab = () => {
    if (!menuPdf) {
      alert('No menu PDF available to open.');
      return;
    }
    const linkSource = menuPdf;
    window.open(linkSource, '_blank');
  };

  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl.includes('dev') ? `https://${subdomain}.dev.tabla.ma/make/reservation` : currentUrl.includes('localhost') ? `http://italiana.localhost:5173/make/reservation` : `https://${subdomain}.tabla.ma/make/reservation`);
    setShowToast(true)
  };






  const { mutate: updateWidget, isLoading: isLoadingUpdate } = useUpdate({
    errorNotification(error) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });

  const currentUrl = window.location.href

  const handleSave = async () => {
    if (!widgetInfo) return;

    const formData = new FormData();
    formData.append('title', title);
    // formData.append('description', description);
    if (hasMenu) {
      formData.append('has_menu', 'true');
    } else {
      formData.append('has_menu', 'false');
    }
    formData.append('content', JSON.stringify(description) || '');
    formData.append('disabled_title', disabledTitle);
    formData.append('disabled_description', disabledDescription);
    formData.append('max_of_guests_par_reservation', maxGuestsPerReservation?.toString() || '0');

    if (file) {
      formData.append('image', file);
    }
    if (deleteLogo) {
      formData.append('clear_image', 'true');
    }

    if (imageFile) {
      formData.append('image_2', imageFile);
    }
    if (deleteImage) {
      formData.append('clear_image_2', 'true');
    }
    console.log('filePDF', filePDF, searchTabs.menu);
    if (filePDF && searchTabs.menu) {
      console.log('heyo', formData.get('menu_file'));
      formData.append('menu_file', filePDF);
      console.log('heyo so', formData.get('menu_file'));
    }

    formData.append('auto_confirmation', autoConfirmation?.toString() || '0');

    formData.append('enable_dress_code', enableDressCode?.toString() || '0');
    formData.append('enbale_area_selection', enableAreaSelection?.toString() || '0');
    formData.append('dress_code', dressCode || '');
    formData.append('enable_paymant', enablePayment?.toString() || '0');
    formData.append('min_number_of_guests_required_deposite', minGuestsForPayment?.toString() || '1');
    formData.append('deposite_amount_for_guest', depositAmountPerGuest?.toString() || '0');

    try {
      await updateWidget({
        id: `${restaurantId}/widget_partial_update/`,
        resource: `api/v1/bo/restaurants`,
        values: formData,
        successNotification() {
          return {
            type: 'success',
            message: 'Configuration saved successfully!'
          }
        }
      },);
    } catch (error) {
      console.error('Error updating widget:', error);
      alert('Failed to save configuration. Please try again.');
    }
  };

  const [deleteLogo, setDeleteLogo] = useState<boolean>(false);
  const [deleteImage, setDeleteImage] = useState<boolean>(false);

  const darkModeClass = 'dark:bg-bgdarktheme dark:text-white bg-white text-black';

  const isFormValid = () => {
    if (isWidgetActivated) {
      // Validate active widget fields
      if (!title.trim()) {
        console.log("Validation failed: Title is empty");
        return false;
      }
      if (maxGuestsPerReservation <= 0) {
        console.log("Validation failed: Max guests must be positive");
        return false;
      }
      if (enableDressCode && !dressCode.trim()) {
        console.log("Validation failed: Dress code is enabled but empty");
        return false;
      }
      if (hasMenu && !menuPdf && !filePDF) { // Check if menu is enabled but no PDF is set or uploaded
        console.log("Validation failed: Menu is enabled but no PDF is provided");
        return false;
      }
    } else {
      // Validate disabled widget fields
      if (!disabledTitle.trim()) {
        console.log("Validation failed: Disabled title is empty");
        return false;
      }
      if (!disabledDescription.trim()) {
        console.log("Validation failed: Disabled description is empty");
        return false;
      }
    }
    return true;
  };

  if (isLoading) return <div className="text-center">Loading...</div>;



  return (
    <div className={`w-full min-h-[100vh] mx-auto p-6 rounded-[10px] ${darkModeClass}`}>
      <div className="flex lt-sm:flex-col items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          {t('settingsPage.widget.title')} <span className='italic font-[600]'>{widgetInfo?.restaurant}</span>
        </h1>
        <div className="relative group h-[50px] flex items-center justify-center">
          <button
            className="btn  flex items-center justify-center gap-2"
            onClick={handleCopy}
          >
            <span className="">
              {t('settingsPage.widget.copyLink')}
            </span>
            <Copy size={18} className="opacity-70" />
          </button>
          <div className="absolute -bottom-10  transform -translate-x-1/2 bg-blacktheme dark:bg-darkthemeitems text-whitetheme px-3 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-max max-w-[200px] text-center">
            {t('settingsPage.widget.clickToCopy', 'Click to copy the link to your clipboard')}
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-5 justify-between lt-sm:flex-col lt-sm:w-full items-start">
        <div className='flex w-1/2 lt-sm:w-full flex-col gap-2'>
          <h2 className="text-lg font-semibold mb-2">{t('settingsPage.widget.logo')}</h2>
          {logo ? (
            <div className="relative  w-full h-40 bg-gray-100 dark:bg-darkthemeitems rounded-lg overflow-hidden">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
              <button
                onClick={() => { setLogo(null); setDeleteLogo(true) }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { fileInputRef.current?.click(); setDeleteLogo(false) }}
              className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-darkthemeitems rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-darkthemeitems transition-colors"
            >
              <Upload className="mr-2" size={20} />
              {t('settingsPage.widget.uploadLogo')}
            </button>
          )}
        </div>
        <div className='flex w-1/2 lt-sm:w-full flex-col gap-2'>
          <h2 className="text-lg font-semibold mt-2">{t('settingsPage.widget.image')}</h2>
          {image ? (
            <div className="relative w-full h-40 bg-gray-100 dark:bg-darkthemeitems rounded-lg overflow-hidden">
              <img src={image} alt="Image" className="w-full h-full object-contain" />
              <button
                onClick={() => { setImage(null); setDeleteImage(true) }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { fileInputRefImage.current?.click(); setDeleteImage(false) }}
              className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-darkthemeitems rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-darkthemeitems transition-colors"
            >
              <Upload className="mr-2" size={20} />
              {t('settingsPage.widget.uploadImage')}
            </button>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={fileInputRefImage}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {isWidgetActivated && <div className="space-y-2 mb-6">
        <h2 className="text-lg font-semibold mt-2">{t('settingsPage.widget.name')}</h2>

        <input
          type="text"
          placeholder={t('settingsPage.widget.addTitlePlaceholder')}
          className="inputs p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <h2 className="text-lg font-semibold mt-2">{t('settingsPage.widget.description')}</h2>
        <InlineQuillEditor
          value={description}
          onChange={setDescription}
          placeholder={t('settingsPage.widget.addDescriptionPlaceholder')}
        />
      </div>}



      {isWidgetActivated ? (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">{t('settingsPage.widget.searchTabs.title')}</h2>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center w-full">
                <span className='mr-2'>{t('settingsPage.widget.searchTabs.maxGuests')}</span>
                <input
                  type="number"
                  value={maxGuestsPerReservation}
                  onChange={(e) => setMaxGuestsPerReservation(Number(e.target.value))}
                  className="inputs max-w-[300px] p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white"
                />
              </label>
              {Object.entries(searchTabs).map(([key]) => (
                <React.Fragment key={key}>
                  {key === 'menu' && <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasMenu || false}
                      onChange={(e) => {
                        e.preventDefault();
                        handleMenuToggle();
                      }}
                      className="sr-only"
                    />
                    <span
                      className={`flex items-center justify-center w-6 h-6 border rounded-md mr-2 transition-all duration-200 ${hasMenu ? 'bg-greentheme border-greentheme' : 'border-gray-300 dark:border-darkthemeitems'
                        }`}
                    >
                      {hasMenu && <Check size={16} className="text-white" />}
                    </span>
                    <span className="capitalize select-none">{t('settingsPage.widget.searchTabs.menu')}</span>
                  </label>}
                </React.Fragment>
              ))}
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoConfirmation || false}
                  onChange={(e) => {
                    e.preventDefault();
                    handleAutoConfirmationToggle();
                  }}
                  className="sr-only"
                />
                <span
                  className={`flex items-center justify-center w-6 h-6 border rounded-md mr-2 transition-all duration-200 ${autoConfirmation ? 'bg-greentheme border-greentheme' : 'border-gray-300 dark:border-darkthemeitems'
                    }`}
                >
                  {autoConfirmation && <Check size={16} className="text-white" />}
                </span>
                <span className="capitalize select-none">{t('settingsPage.widget.searchTabs.autoConfirmation')}</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableDressCode || false}
                  onChange={(e) => {
                    e.preventDefault();
                    handleDressCodeToggle();
                  }}
                  className="sr-only"
                />
                <span
                  className={`flex items-center justify-center w-6 h-6 border rounded-md mr-2 transition-all duration-200 ${enableDressCode ? 'bg-greentheme border-greentheme' : 'border-gray-300 dark:border-darkthemeitems'
                    }`}
                >
                  {enableDressCode && <Check size={16} className="text-white" />}
                </span>
                <span className="capitalize select-none">{t('settingsPage.widget.searchTabs.enableDressCode')}</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAreaSelection || false}
                  onChange={(e) => {
                    e.preventDefault();
                    handleAreaSelectionToggle();
                  }}
                  className="sr-only"
                />
                <span
                  className={`flex items-center justify-center w-6 h-6 border rounded-md mr-2 transition-all duration-200 ${enableAreaSelection ? 'bg-greentheme border-greentheme' : 'border-gray-300 dark:border-darkthemeitems'
                    }`}
                >
                  {enableAreaSelection && <Check size={16} className="text-white" />}
                </span>
                <span className="capitalize select-none">{t('settingsPage.widget.searchTabs.enableAreaSelection')}</span>
              </label>
            </div>
            {enableDressCode && (
              <div className="space-y-4 my-6">
                <div className="relative">
                  <textarea
                    placeholder={t('settingsPage.widget.dressCodePlaceholder')}
                    className={`w-full inputs p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white lt-sm:w-full h-24 resize-none`}
                    value={dressCode}
                    onChange={(e) => {
                      setDressCode(e.target.value);
                    }}
                  />
                </div>
              </div>
            )}
            <div className="flex flex-col items-start gap-3 mb-6 mt-2">
              <h2 className="text-lg font-semibold mb-2">{t('settingsPage.widget.payment.title')}</h2>
              <div className="px-2 flex flex-col gap-4 py-1">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enablePayment}
                    onChange={(e) => {
                      e.preventDefault();
                      handlePaymentToggle();
                    }}
                    className="sr-only"
                  />
                  <span
                    className={`flex items-center justify-center w-6 h-6 border rounded-md mr-2 transition-all duration-200 ${enablePayment ? 'bg-greentheme border-greentheme' : 'border-gray-300 dark:border-darkthemeitems'
                      }`}
                  >
                    {enablePayment && <Check size={16} className="text-white" />}
                  </span>
                  <span className="capitalize select-none">{t('settingsPage.widget.payment.enable')}</span>
                </label>

                {enablePayment && (
                  <div className="ml-8 flex flex-col gap-4">
                    <label className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('settingsPage.widget.payment.minGuestsForPayment')}:
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={minGuestsForPayment}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setMinGuestsForPayment(val > 0 ? val : 1);
                        }}
                        className="inputs w-20 p-2 border border-gray-300 dark:border-darkthemeitems rounded-md bg-white dark:bg-darkthemeitems text-black dark:text-white"
                      />
                    </label>
                    <label className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('settingsPage.widget.payment.depositAmountPerGuest')}:
                      </span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={depositAmountPerGuest}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setDepositAmountPerGuest(val >= 0 ? val : 0);
                        }}
                        className="inputs w-24 p-2 border border-gray-300 dark:border-darkthemeitems rounded-md bg-white dark:bg-darkthemeitems text-black dark:text-white"
                        placeholder="0.00"
                      />
                    </label>
                  </div>
                )}

                {!enablePayment && (
                  <div className="ml-8 mt-2">
                    <p className="text-sm text-orange-600 dark:text-orange-400 italic">
                      {t('settingsPage.widget.payment.disabledNote')}
                    </p>
                  </div>
                )}
              </div>
            </div>
            {(hasMenu) && (
              <div className="flex justify-around gap-2 items-center">
                <button
                  onClick={() => filePdfInputRef.current?.click()}
                  className="btn-secondary gap-2 flex items-center mt-3"
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
                    {t('settingsPage.widget.openMenu')}
                    <ScreenShareIcon size={20} />
                  </div>
                ) : (
                  <span>{t('settingsPage.widget.noMenu')}</span>
                )}
              </div>
            )}
          </div>
        </>) :
        (
          <div className="space-y-4 mb-6">
            <input
              type="text"
              placeholder={t('settingsPage.widget.addTitlePlaceholder')}
              className="inputs p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white"
              value={disabledTitle}
              onChange={(e) => setDisabledTitle(e.target.value)}
            />
            <textarea
              placeholder={t('settingsPage.widget.addDescriptionPlaceholder')}
              className="w-full inputs p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white lt-sm:w-full h-24 resize-none"
              value={disabledDescription}
              onChange={(e) => setDisabledDescription(e.target.value)}
            />
          </div>
        )
      }

      <div className="flex lt-md:grid gap-3 lt-md:grid-cols-2">
        <BaseBtn
          onClick={handleSave}
          loading={isLoadingUpdate}
          disabled={!isFormValid()}
          className="flex-1 py-2 bg-greentheme text-white rounded-lg hover:opacity-90 transition-opacity lt-sm:w-full lt-md:col-span-2"
        >
          {t('settingsPage.widget.buttons.save')}
        </BaseBtn>
        <Link to={currentUrl.includes('dev') ? `https://${subdomain}.dev.tabla.ma/make/reservation` : currentUrl.includes('localhost') ? `http://italiana.localhost:5173/make/reservation` : `https://${subdomain}.tabla.ma/make/reservation`} target="_blank" className="btn-secondary w-1/4 text-center lt-md:w-full">
          {t('settingsPage.widget.buttons.preview')} {t('settingsPage.widget.reservation')}
        </Link>
        <Link to={currentUrl.includes('dev') ? `https://${subdomain}.dev.tabla.ma/make/modification/preview` : currentUrl.includes('localhost') ? `http://${subdomain}.localhost:5173/make/modification/preview` : `https://${subdomain}.tabla.ma/make/modification/preview`} target="_blank" className="btn-secondary w-1/4 text-center lt-md:w-full">
          {t('settingsPage.widget.buttons.preview')} {t('settingsPage.widget.modification')}
        </Link>
      </div>
      {/* Custom Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-whitetheme dark:bg-bgdarktheme2 border border-softgreytheme dark:border-darkthemeitems shadow-lg rounded-lg p-4 flex items-center gap-3 animate-slideUp z-50">
          <div className="h-8 w-8 bg-softgreentheme dark:bg-softgreentheme rounded-full flex items-center justify-center">
            <Check className="h-4 w-4 text-greentheme dark:text-greentheme" />
          </div>
          <div>
            <h3 className="font-medium text-blacktheme dark:text-textdarktheme">{t('settingsPage.widget.linkCopied')}</h3>
            <p className="text-subblack dark:text-textdarktheme/80 text-sm">
              {currentUrl.includes('dev') ? `https://${subdomain}.dev.tabla.ma/make/reservation` : currentUrl.includes('localhost') ? `http://italiana.localhost:5173/make/reservation` : `https://${subdomain}.tabla.ma/make/reservation`} {t('settingsPage.widget.copied')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}