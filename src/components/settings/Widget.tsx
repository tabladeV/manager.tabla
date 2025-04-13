import React, { useState, useRef, useEffect } from 'react';
import { Upload, Check, X, Download, Navigation, ScreenShareIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import 'draft-js/dist/Draft.css';
import { Editor, EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { BaseKey, useList, useUpdate } from '@refinedev/core';



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
  has_menu: boolean;
}


interface QuillEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
  modules?: Record<string, any>
}

export function QuillEditor({
  value,
  onChange,
  placeholder = "Write something...",
  className = "",
  readOnly = false,
  modules = {},
  ...props
}: QuillEditorProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [quill, setQuill] = useState<any>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  // Initialize Quill on the client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Dynamically import Quill
      import("quill").then((Quill) => {
        if (!quill && editorRef.current && toolbarRef.current) {
          const editor = new Quill.default(editorRef.current, {
            modules: {
              toolbar: toolbarRef.current,
              ...modules,
            },
            placeholder,
            readOnly,
            theme: "snow",
          })

          // Set initial content
          if (value) {
            editor.clipboard.dangerouslyPasteHTML(value)
          }

          // Handle content changes
          editor.on("text-change", () => {
            const html = editorRef.current?.querySelector(".ql-editor")?.innerHTML
            if (html) {
              onChange(html)
            }
          })

          setQuill(editor)
        }
      })
    }
    setIsMounted(true)
  }, [])

  // Update content when value prop changes
  useEffect(() => {
    if (quill && value !== quill.root.innerHTML) {
      quill.clipboard.dangerouslyPasteHTML(value)
    }
  }, [quill, value])

  // Import Quill styles on the client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("quill/dist/quill.snow.css")
    }
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className={`quill-editor ${className}`} {...props}>
      <div ref={toolbarRef}>
        <span className="ql-formats">
          <select className="ql-font"></select>
          <select className="ql-size"></select>
        </span>
        <span className="ql-formats">
          <button className="ql-bold"></button>
          <button className="ql-italic"></button>
          <button className="ql-underline"></button>
          <button className="ql-strike"></button>
        </span>
        <span className="ql-formats">
          <select className="ql-color"></select>
          <select className="ql-background"></select>
        </span>
        <span className="ql-formats">
          <button className="ql-script" value="sub"></button>
          <button className="ql-script" value="super"></button>
        </span>
        <span className="ql-formats">
          <button className="ql-header" value="1"></button>
          <button className="ql-header" value="2"></button>
          <button className="ql-blockquote"></button>
          <button className="ql-code-block"></button>
        </span>
        <span className="ql-formats">
          <button className="ql-list" value="ordered"></button>
          <button className="ql-list" value="bullet"></button>
          <button className="ql-indent" value="-1"></button>
          <button className="ql-indent" value="+1"></button>
        </span>
        <span className="ql-formats">
          <button className="ql-direction" value="rtl"></button>
          <select className="ql-align"></select>
        </span>
        <span className="ql-formats">
          <button className="ql-link"></button>
          <button className="ql-image"></button>
          <button className="ql-video"></button>
        </span>
        <span className="ql-formats">
          <button className="ql-clean"></button>
        </span>
      </div>
      <div ref={editorRef} className="min-h-[200px]" />
    </div>
  )
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

  const { data: widgetData, isLoading, error } = useList({
    resource: `api/v1/bo/restaurants/${restaurantId}/widget/`,
  });

  
  useEffect(() => {
    document.title = 'Booking Widget Settigns | Tabla'
  }, [])


  const [widgetInfo, setWidgetInfo] = useState<Widget>();
  const [logo, setLogo] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [hasMenu, setHasMenu] = useState<boolean>();
  const [description, setDescription] = useState('');
  const [disabledTitle, setDisabledTitle] = useState('');
  const [disabledDescription, setDisabledDescription] = useState('');
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
      setMaxGuestsPerReservation(data.max_of_guests_par_reservation)
      setSearchTabs((prev) => ({ ...prev, menu: data.has_menu}));
      setWidgetInfo(data);
      setTitle(data.title);
      setDisabledTitle(data.disabled_title);
      setImage(data.image_2);
      setDisabledDescription(data.disabled_description);
      setIsWidgetActivated(data.is_widget_activated);
      setDescription(data.content);
      setMenuPdf(data.menu_file || null);
      setLogo(data.image || null);
      // if(logo === null){
      //   setNewLogo(true);
      // }
    }
  }, [widgetData]);

  

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filePDF, setFilePDF] = useState<File | null>(null);
  const [previewUrlPDF, setPreviewUrlPDF] = useState<string | null>(null);

  const [previewImage, setPreviewImage] = useState<string |null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setImageFile(selectedFile);

      // Generate a temporary preview URL
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewImage(objectUrl);
      setImage(objectUrl);
    }
  };
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

  const API_HOST = import.meta.env.VITE_API_URL || "https://api.dev.tabla.ma";

  const openPdfInNewTab = () => {
    if (!menuPdf) {
      alert('No menu PDF available to open.');
      return;
    }
    const linkSource = menuPdf;
    window.open(linkSource, '_blank');
  };

  

  const handleSearchTabChange = (tab: keyof typeof searchTabs) => {
    setSearchTabs((prev) => ({ ...prev, [tab]: !prev[tab] }));
  };

  const { mutate: updateWidget } = useUpdate({
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });

  
  const currentUrl = window.location.href
  console.log('Current URL:', currentUrl)

  const handleSave = async () => {
    if (!widgetInfo) return;

    const formData = new FormData();
    formData.append('title', title);
    // formData.append('description', description);
    if(hasMenu){
      formData.append('has_menu', 'true');
    }else{
      formData.append('has_menu', 'false');
    }
    formData.append('content', JSON.stringify(description));
    formData.append('disabled_title', disabledTitle);
    formData.append('disabled_description', disabledDescription);
    formData.append('max_of_guests_par_reservation', maxGuestsPerReservation?.toString() || '0');

    if(file){
      formData.append('image', file);
    }

    if (imageFile) {
      formData.append('image_2', imageFile);
    }

    if (filePDF && searchTabs.menu) {
      formData.append('menu_file', filePDF);
    }

    try {
      await updateWidget({
        id: `${restaurantId}/widget_partial_update/`,
        resource: `api/v1/bo/restaurants`,
        values: formData,
        successNotification(){
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

  const [newLogo, setNewLogo] = useState<boolean>(false);

  const darkModeClass = 'dark:bg-bgdarktheme dark:text-white bg-white text-black';

  if (isLoading) return <div className="text-center">Loading...</div>;

  return (
    <div className={`w-full mx-auto p-6 rounded-[10px] ${darkModeClass}`}>
      <h1 className="text-2xl font-bold text-center mb-6">
        {t('settingsPage.widget.title')} for <span className='italic font-[600]'>{widgetInfo?.restaurant}</span>
      </h1>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">{t('settingsPage.widget.logo')}</h2>
        {logo ? (
          <div className="relative w-full h-40 bg-gray-100 dark:bg-darkthemeitems rounded-lg overflow-hidden">
            <img src={ logo} alt="Logo" className="w-full h-full object-contain" />
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
        <h2 className="text-lg font-semibold mt-2">{t('settingsPage.widget.image')}</h2>
        {image ? (
          <div className="relative w-full h-40 bg-gray-100 dark:bg-darkthemeitems rounded-lg overflow-hidden">
            <img src={image} alt="Image" className="w-full h-full object-contain" />
            <button
              onClick={() => {setImage(null);setNewLogo(true)}}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRefImage.current?.click()}
            className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-darkthemeitems rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-darkthemeitems transition-colors"
          >
            <Upload className="mr-2" size={20} />
            {t('settingsPage.widget.uploadImage')}
          </button>
        )}
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
      {isWidgetActivated ? (
          <div>
            <div className="space-y-2 mb-6">
              <h2 className="text-lg font-semibold mt-2">{t('settingsPage.widget.name')}</h2>

              <input
                type="text"
                placeholder={t('settingsPage.widget.addTitlePlaceholder')}
                className="inputs p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <h2 className="text-lg font-semibold mt-2">{t('settingsPage.widget.description')}</h2>
              <QuillEditor
                value={description}
                onChange={setDescription}
                placeholder={t('settingsPage.widget.addDescriptionPlaceholder')}
                
              />
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">{t('settingsPage.widget.searchTabs.title')}</h2>
              <div className="flex flex-wrap gap-4">
              <label className="flex items-center w-full">
              <span className='mr-2'>max guests per reservation</span>
              <input
                type="number"
                value={maxGuestsPerReservation}
                onChange={(e) => setMaxGuestsPerReservation(Number(e.target.value))}
                className="inputs max-w-[300px] p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white"
              />
              </label>
                {Object.entries(searchTabs).map(([key, value]) => (
                  <React.Fragment key={key}>
                  {key === 'menu' && <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(hasMenu ? value : key === 'menu' && value) as boolean}
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
                  </label>}
                  </React.Fragment>
                ))}
              </div>
              {(hasMenu) && (
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
          </div>):
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
        <button
          onClick={handleSave}
          className="flex-1 py-2 bg-greentheme text-white rounded-lg hover:opacity-90 transition-opacity lt-sm:w-full lt-md:col-span-2"
        >
          {t('settingsPage.widget.buttons.save')}
        </button>
        <Link to={currentUrl.includes('dev')?`https://${subdomain}.dev.tabla.ma/make/reservation`:`https://${subdomain}.tabla.ma/make/reservation`} target="_blank" className="btn-secondary w-1/4 text-center lt-md:w-full">
          {t('settingsPage.widget.buttons.preview')} Reservation
        </Link>
        <Link to={currentUrl.includes('dev')?`https://${subdomain}.dev.tabla.ma/make/modification/preview`:`https://${subdomain}.tabla.ma/make/modification/preview`} target="_blank" className="btn-secondary w-1/4 text-center lt-md:w-full">
          {t('settingsPage.widget.buttons.preview')} Modification
        </Link>
      </div>
    </div>
  );
}