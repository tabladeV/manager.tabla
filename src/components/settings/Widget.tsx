import { useState, useRef } from 'react'
import { Upload, Check, X, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function WidgetConfig() {
  const [logo, setLogo] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [searchTabs, setSearchTabs] = useState({
    menu: true,
    // reviews: true,
    // features: true,
    // location: true
  })
  const [payment, setPayment] = useState('enable')
  const [guestThreshold, setGuestThreshold] = useState(4)
  const [token, setToken] = useState('your-unique-token-here')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const filePdfInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setLogo(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }
  const handleMenuUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setMenuPdf(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const downloadPdf = () => {
    if(menuPdf){
      const linkSource = menuPdf;
      const downloadLink = document.createElement("a");
      const fileName = "menu.pdf";
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
    }
  };

  const handleSearchTabChange = (tab: keyof typeof searchTabs) => {
    setSearchTabs(prev => ({ ...prev, [tab]: !prev[tab] }))
  }

  const handleSave = () => {
    console.log({
      logo,
      title,
      description,
      searchTabs,
      payment,
      guestThreshold
    })
    alert('Configuration saved!')
  }

  const [menuPdf, setMenuPdf] = useState<string | null>(null)

  

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token)
    
    alert('Token copied to clipboard!')
  }

  const {t} = useTranslation();

  return (
    <div className={`w-full mx-auto p-6 rounded-[10px] ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme text-white':'bg-white text-black'}`}>
      <h1 className="text-2xl font-bold text-center mb-6">{t('settingsPage.widget.title')}</h1>
      
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
                checked={value}
                onChange={() => handleSearchTabChange(key as keyof typeof searchTabs)}
                className="sr-only"
              />
              <span className={`flex items-center justify-center w-6 h-6 border rounded-md mr-2 ${value ? 'bg-greentheme border-greentheme' : 'border-gray-300 dark:border-darkthemeitems'}`}>
                {value && <Check size={16} className="text-white" />}
              </span>
              <span className="capitalize">{key}</span>
            </label>
          ))}
        </div>
        {searchTabs.menu && <div className="flex justify-around  items-center">
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
          {menuPdf?
            <div className='btn-secondary flex gap-4 items-center mt-3 justify-center cursor-pointer'>
              <p className='' onClick={downloadPdf}>Download Our Menu </p>
              <Download size={20} />
            </div>
          :'No menu uploaded'}
        </div>}
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">{t('settingsPage.widget.payment.title')}</h2>
        <div className="flex items-center flex-wrap gap-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="payment"
              value="enable"
              checked={payment === 'enable'}
              onChange={() => setPayment('enable')}
              className="sr-only"
            />
            <span className={`flex items-center justify-center w-6 h-6 border rounded-full mr-2 ${payment === 'enable' ? 'bg-greentheme border-greentheme' : 'border-gray-300 dark:border-darkthemeitems'}`}>
              {payment === 'enable' && <div className="w-3 h-3 bg-white rounded-full" />}
            </span>
            {t('settingsPage.widget.payment.enable')}
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="payment"
              value="disable"
              checked={payment === 'disable'}
              onChange={() => setPayment('disable')}
              className="sr-only"
            />
            <span className={`flex items-center justify-center w-6 h-6 border rounded-full mr-2 ${payment === 'disable' ? 'bg-greentheme border-greentheme' : 'border-gray-300 dark:border-darkthemeitems'}`}>
              {payment === 'disable' && <div className="w-3 h-3 bg-white rounded-full" />}
            </span>
            {t('settingsPage.widget.payment.disable')}
          </label>
          <div className='flex gap-3 items-center'>
            <label className="flex items-center">
              <input
                type="radio"
                name="payment"
                value="enableWhenOver"
                checked={payment === 'enableWhenOver'}
                onChange={() => setPayment('enableWhenOver')}
                className="sr-only "
              />
              <span className={`flex items-center justify-center w-6 h-6 border rounded-full mr-2 ${payment === 'enableWhenOver' ? 'bg-greentheme border-greentheme' : 'border-gray-300 dark:border-darkthemeitems'}`}>
                {payment === 'enableWhenOver' && <div className="w-3 h-3 bg-white rounded-full" />}
              </span>
              {t('settingsPage.widget.payment.enableWhenGuestOver')}
            </label>
            <input
              type="number"
              value={guestThreshold}
              onChange={(e) => setGuestThreshold(parseInt(e.target.value))}
              className="w-16 p-1 border border-gray-300 dark:border-darkthemeitems rounded-md text-center bg-white dark:bg-darkthemeitems text-black dark:text-white"
              disabled={payment !== 'enableWhenOver'}
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 space-x-4">
        <button 
          onClick={handleSave}
          className="flex-1 py-2 bg-greentheme text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          {t('settingsPage.widget.buttons.save')}
        </button>
        <Link 
          to="/widget/r/1"
          target="_blank"
          className="btn-secondary w-1/2  text-center"
        >
          {t('settingsPage.widget.buttons.preview')}
        </Link>
      </div>
    </div>
  )
}