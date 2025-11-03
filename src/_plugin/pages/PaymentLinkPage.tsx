"use client"
import { useEffect, useState, memo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Logo from "../../components/header/Logo"
import { LoaderCircle, AlertOctagon, ChevronDown } from "lucide-react"
import { SunIcon, MoonIcon } from "../../components/icons"
import { useCreate } from "@refinedev/core"
import { useDateContext } from "../../context/DateContext"
import { SharedWidgetFooter } from "../../components/reservation/SharedWidgetFooter"
import { useWidgetData } from "../../hooks/useWidgetData"
import spanish from "../../assets/spanish.png"
import arabic from "../../assets/arabic.jpg"
import english from "../../assets/english.png"
import french from "../../assets/french.png"

// Language selector component
const LanguageSelector = memo(() => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: "en", name: "English", icon: english },
    { code: "es", name: "Español", icon: spanish },
    { code: "fr", name: "Français", icon: french },
    { code: "ar", name: "العربية", icon: arabic },
  ]

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0]

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode)
    localStorage.setItem("preferredLanguage", languageCode);
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg bg-[#f5f5f5] dark:bg-[#333333] bg-opacity-80 hover:bg-[#f5f5f5] dark:hover:bg-[#444444] transition-colors"
        aria-label="Select language"
      >
        <img src={currentLanguage.icon} alt={currentLanguage.name} className="w-6 h-6 rounded-full object-cover" />
        <span className="text-sm font-medium hidden sm:block">{currentLanguage.name}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 bg-white dark:bg-darkthemeitems rounded-lg shadow-lg border border-[#dddddd] dark:border-[#444444] z-50 min-w-[160px]">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f5f5f5] dark:hover:bg-bgdarktheme2 transition-colors first:rounded-t-lg last:rounded-b-lg ${currentLanguage.code === language.code ? "bg-[#f0f7e6] dark:bg-bgdarktheme2" : ""}`}
              >
                <img src={language.icon} alt={language.name} className="w-5 h-5 rounded-sm object-cover" />
                <span className="text-sm font-medium">{language.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
})

// Header component with theme toggle and language selector
const PaymentHeader = memo(({ onThemeToggle }: { onThemeToggle: () => void }) => {
  const { t } = useTranslation()
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="w-full max-w-[800px] mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <button
            onClick={onThemeToggle}
            aria-label={t("reservationWidget.common.toggleDarkMode")}
            className="p-2 rounded-lg bg-[#f5f5f5] dark:bg-[#333333] bg-opacity-80 hover:bg-[#f5f5f5] dark:hover:bg-[#444444]"
          >
            <SunIcon size={20} className="dark:hidden text-white drop-shadow-lg" />
            <MoonIcon size={20} className="hidden dark:block text-white drop-shadow-lg" />
          </button>
          <LanguageSelector />
        </div>
      </div>
    </div>
  )
})

// Hero section with restaurant image
const PaymentHero = memo(({ widgetInfo }: { widgetInfo: any }) => {
  return (
    <div className="fixed w-full h-[80vh] min-h-[500px] overflow-hidden ">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[3px] scale-[1.1]"
        style={{ backgroundImage: `url(${widgetInfo?.image_2 || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'})` }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {widgetInfo?.image ? (
          <img
            src={widgetInfo.image}
            alt="Restaurant"
            className="h-20 w-auto object-contain mt-[-150px]"
          />
        ) : (
          <Logo className="h-16 mt-[-150px]" nolink={true} />
        )}
      </div>
    </div>
  )
})

// Main component
const PaymentLinkPage = () => {
  const { t, i18n } = useTranslation()
  const { id } = useParams() // Get reservation ID from URL
  const { preferredLanguage } = useDateContext()
  const navigate = useNavigate()
  
  // State
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [browserInfo, setBrowserInfo] = useState({ 
    userAgent: "", 
    screenHeight: 0, 
    screenWidth: 0, 
    colorDepth: 0 
  })

  // Use the widget data hook instead of direct useOne
  const { widgetInfo, isLoading: isLoadingWidget, error: widgetError } = useWidgetData()

  // API hooks
  const { mutate: createPaymentInitiation } = useCreate()

  // Set up language preferences
  useEffect(() => {
    const storedLang = localStorage.getItem("preferredLanguage");
    if (storedLang) {
      i18n.changeLanguage(storedLang);
    } else {
      const browserLang = navigator.language.split('-')[0];
      const supportedLanguages = ['en', 'es', 'fr', 'ar'];
      const defaultLang = supportedLanguages.includes(browserLang) ? browserLang : 'en';
      localStorage.setItem("preferredLanguage", defaultLang);
      i18n.changeLanguage(defaultLang);
    }
  }, [i18n]);

  // Effect to handle validation and payment initiation after widget data loads
  useEffect(() => {
    if (!isLoadingWidget && widgetInfo) {
      if (!id) {
        setError(t("paymentLink.errors.missingReservationId"))
        setIsLoading(false)
        return
      }

      // Check if payment is enabled for this restaurant
      if (!widgetInfo.enable_paymant) {
        setError(t("paymentLink.errors.paymentDisabled"))
        setIsLoading(false)
        return
      }
      
      // If we get here, payment is enabled and we have a reservation ID
      initiatePayment()
    } else if (widgetError) {
      setError(t("common.errors.restaurantNotFoundMessage"))
      setIsLoading(false)
    }
  }, [widgetInfo, isLoadingWidget, widgetError, id])

  // Set up browser info on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBrowserInfo({ 
        userAgent: navigator.userAgent, 
        screenHeight: window.screen.height, 
        screenWidth: window.screen.width, 
        colorDepth: window.screen.colorDepth 
      })
      
      // Initialize dark mode from localStorage
      const isDarkMode = localStorage.getItem("darkMode") === "true"
      if (isDarkMode) document.documentElement.classList.add("dark")
      
      // Set page title
      document.title = t("paymentLink.page.title")
    }
  }, [t])

  // Helper function for submitting the payment form
  const submitPaymentForm = (paymentPayload: any) => {
    if (!paymentPayload?.pay_url || !paymentPayload?.form_data) {
      setIsLoading(false)
      setError(t("paymentLink.errors.paymentDetailsError"))
      return
    }
    
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = paymentPayload.pay_url
    
    for (const key in paymentPayload.form_data) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = String(paymentPayload.form_data[key])
      form.appendChild(input)
    }
    
    document.body.appendChild(form)
    form.submit()
  }

  // Function to initiate payment
  const initiatePayment = () => {
    if (!id) {
      setError(t("paymentLink.errors.missingReservationId"))
      setIsLoading(false)
      return
    }

    createPaymentInitiation({
      resource: 'api/v1/bo/payments/initiate/',
      values: { 
        reservation_id: id,
        BROWSER_JAVA_ENABLED: navigator.javaEnabled?.() ? "true" : "false",
        BROWSER_COLOR_DEPTH: browserInfo.colorDepth,
        BROWSER_SCREEN_HEIGHT: browserInfo.screenHeight,
        BROWSER_SCREEN_WIDTH: browserInfo.screenWidth,
        USER_AGENT: browserInfo.userAgent,
        LANGUAGE: i18n.language
      }
    }, {
      onSuccess: (response) => {
        // Automatically submit the payment form
        submitPaymentForm(response.data)
      },
      onError: (error: any) => {
        setIsLoading(false)
        
        // Check specifically for 404 error which indicates reservation not found
        if (error?.response?.status === 404) {
          setError(t("paymentLink.errors.reservationNotFound"))
        } else {
          setError(error?.response?.data?.non_field_errors?.join(", ") || 
                  error?.message || 
                  t("paymentLink.errors.paymentInitiationFailed"))
        }
      }
    })
  }

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle("dark")
    localStorage.setItem("darkMode", isDark ? "true" : "false")
  }

  // If we're still loading widget data, show a full page loader
  if (isLoadingWidget) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-bgdarktheme2">
        <LoaderCircle className="animate-spin text-greentheme" size={48} />
      </div>
    )
  }

  return (
    <div className={`overflow-y-auto min-h-screen max-h-screen bg-white dark:bg-bgdarktheme2 text-black dark:text-white ${preferredLanguage === "ar" ? "rtl" : ""}`}>
      <PaymentHeader onThemeToggle={toggleDarkMode} />
      <PaymentHero widgetInfo={widgetInfo} />

      <div className="relative pt-[370px]">
        <div className="w-full max-w-[800px] lg:max-w-[800px] md:max-w-[600px] mx-auto px-0">
          <div className="bg-white dark:bg-darkthemeitems rounded-t-3xl shadow-2xl overflow-hidden">
            <div className="p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <LoaderCircle className="animate-spin mb-4 text-greentheme" size={48} />
                  <p className="text-center text-[#555555] dark:text-[#cccccc]">
                    {t("paymentLink.processing")}
                  </p>
                </div>
              ) : error ? (
                <div className="p-6 bg-softredtheme dark:bg-softredtheme rounded-xl text-center border border-redtheme/30 dark:border-redtheme/50 shadow-sm">
                  <div className="flex justify-center mb-4">
                    <AlertOctagon className="text-redtheme" size={48} />
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-redtheme">
                    {t("paymentLink.errors.title")}
                  </h2>
                  <p className="text-sm text-redtheme mb-6">
                    {error}
                  </p>
                  <a 
                    href="/make/reservation" 
                    className="py-3 px-6 rounded-md font-medium bg-[#88AB61] hover:bg-[#769c4f] text-white transition-colors inline-block"
                  >
                    {t("paymentLink.makeReservation")}
                  </a>
                </div>
              ) : null}
            </div>
            <SharedWidgetFooter widgetInfo={widgetInfo} isPaymentRequired={true} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentLinkPage