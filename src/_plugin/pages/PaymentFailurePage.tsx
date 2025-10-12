"use client"
import type React from "react"
import { useCallback, useEffect, useState, memo } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Logo from "../../components/header/Logo"
import { ChevronDown, Facebook, Instagram, Twitter, Phone, Mail, MessageCircle, XCircle, LoaderCircle } from "lucide-react"
import { SunIcon, MoonIcon } from "../../components/icons"
import { type BaseRecord, useOne, useCreate } from "@refinedev/core"
import spanish from "../../assets/spanish.png"
import arabic from "../../assets/arabic.jpg"
import english from "../../assets/english.png"
import french from "../../assets/french.png"
import { useDateContext } from "../../context/DateContext"
import { SharedWidgetFooter } from "../../components/reservation/SharedWidgetFooter"

// #region Types
interface WidgetInfo {
  image: string;
  image_2: string;
  content: string;
  max_of_guests_par_reservation?: number;
  dress_code?: string;
  deposite_amount_for_guest?: number;
  enable_paymant?: boolean;
  currency?: string;
  [key: string]: any;
}

interface ReservationData {
  reservationId: number | null;
  timestamp: number;
}

interface QuillPreviewProps {
  content: string
  className?: string
}
// #endregion

// #region Child Components

const QuillPreview = memo(({ content, className = "" }: QuillPreviewProps) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("quill/dist/quill.core.css")
    }
  }, [])

  return (
    <div className={`quill-preview ${className}`}>
      <div className="prose max-w-none overflow-auto" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
})

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
        <img
          src={currentLanguage.icon || "/placeholder.svg"}
          alt={currentLanguage.name}
          className="w-6 h-6 rounded-full object-cover"
        />
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
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f5f5f5] dark:hover:bg-bgdarktheme2 transition-colors first:rounded-t-lg last:rounded-b-lg ${currentLanguage.code === language.code ? "bg-[#f0f7e6] dark:bg-bgdarktheme2" : ""
                  }`}
              >
                <img
                  src={language.icon || "/placeholder.svg"}
                  alt={language.name}
                  className="w-5 h-5 rounded-sm object-cover"
                />
                <span className="text-sm font-medium">{language.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
})

const FailureHeader = memo(({ onThemeToggle }: { onThemeToggle: () => void }) => {
  const { t } = useTranslation()
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="w-full max-w-[800px] lg:max-w-[800px] md:max-w-[600px] mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <button
            onClick={onThemeToggle}
            aria-label={t("reservationWidget.common.toggleDarkMode")}
            className="p-2 rounded-lg bg-[#f5f5f5] dark:bg-[#333333] bg-opacity-80 hover:bg-[#f5f5f5] dark:hover:bg-[#444444]"
          >
            <SunIcon size={20} className="dark:hidden text-white drop-shadow-lg" />
            <MoonIcon size={20} className="hidden dark:block text-white drop-shadow-lg" />
          </button>
          <div className="flex items-center gap-4">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </div>
  )
})

const FailureHero = memo(({ widgetInfo }: { widgetInfo: WidgetInfo | undefined }) => {
  const { t } = useTranslation()
  return (
    <div className="fixed w-full h-[80vh] min-h-[500px] overflow-hidden ">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[3px] scale-[1.1]"
        style={{
          backgroundImage: `url(${widgetInfo?.image_2 || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'})`,
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {widgetInfo?.image ? (
          <img
            src={widgetInfo.image}
            alt={t("reservationWidget.common.restaurant")}
            className="h-20 w-auto object-contain mt-[-150px]"
          />
        ) : (
          <Logo className="h-16 mt-[-150px]" nolink={true} />
        )}
      </div>
    </div>
  )
})

const FailureContent = memo(({ calculateTotalAmount, onRetry, onNewReservation, isLoading }: { calculateTotalAmount: () => string, onRetry: () => void, onNewReservation: () => void, isLoading: boolean }) => {
  const { t } = useTranslation()
  return (
    <>
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <XCircle size={32} className="text-red-600 dark:text-red-400" />
        </div>
      </div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme mb-2">
          {t("paymentFailure.title")}
        </h2>
        <p className="text-subblack dark:text-textdarktheme/70">
          {t("paymentFailure.description")}
        </p>
      </div>
      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-red-800 dark:text-red-300">
            {t("paymentFailure.failedAmount")}
          </span>
          <span className="text-sm font-bold text-red-800 dark:text-red-300">
            {calculateTotalAmount()}
          </span>
        </div>
      </div>
      <div className="space-y-3">
        <button
          onClick={onRetry}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-md font-medium bg-[#88AB61] hover:bg-[#769c4f] text-white transition-colors flex items-center justify-center disabled:opacity-50"
        >
          {isLoading ? <LoaderCircle className="animate-spin mr-2" size={18} /> : t("paymentFailure.tryAgain")}
        </button>
        <button
          onClick={onNewReservation}
          className="w-full py-3 px-4 rounded-md font-medium border border-[#dddddd] dark:border-[#444444] hover:bg-[#f5f5f5] dark:hover:bg-bgdarktheme2 transition-colors"
        >
          {t("paymentFailure.newReservation")}
        </button>
      </div>
    </>
  )
})

// #endregion

const PaymentFailurePage = () => {
  const { t, i18n } = useTranslation()
  const { preferredLanguage } = useDateContext()
  const navigate = useNavigate();
  const FORM_DATA_KEY = 'tabla_widget_form_data'
  const RESERVATION_DATA_KEY = 'tabla_widget_reservation_data'

  const [widgetInfo, setWidgetInfo] = useState<WidgetInfo>()
  const [data, setData] = useState({ reserveDate: "", time: "", guests: 0 })
  const [reservationData, setReservationData] = useState<ReservationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [browserInfo, setBrowserInfo] = useState({ userAgent: "", screenHeight: 0, screenWidth: 0, colorDepth: 0 });
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const { mutate: createPaymentInitiation } = useCreate();

  // Fetch general widget data
  useOne({
    resource: `api/v1/bo/subdomains/public/cutomer/reservations`,
    id: "",
    queryOptions: {
      enabled: true,
      onSuccess: (data) => {
        if (data?.data) {
          setWidgetInfo(data.data as WidgetInfo);
        }
      }
    }
  });

  // Load form data from localStorage
  useEffect(() => {
    const cachedFormData = localStorage.getItem(FORM_DATA_KEY);
    const cachedReservationData = localStorage.getItem(RESERVATION_DATA_KEY);

    if (cachedFormData && cachedReservationData) {
      try {
        const parsedFormData = JSON.parse(cachedFormData);
        const parsedReservationData = JSON.parse(cachedReservationData);
        setData(parsedFormData.data || { reserveDate: "", time: "", guests: 0 });
        setReservationData(parsedReservationData || null);
      } catch (error) {
        console.error(t("paymentFailure.error.parsingData"), error);
        localStorage.removeItem(FORM_DATA_KEY);
        localStorage.removeItem(RESERVATION_DATA_KEY);
        navigate('/make/reservation');
      }
    } else {
      // If essential data is missing, redirect to the main reservation page
      navigate('/make/reservation');
    }
    setIsDataLoaded(true);
  }, [FORM_DATA_KEY, RESERVATION_DATA_KEY, navigate]);



  // Set language from local storage or browser settings
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

  // Set page title
  useEffect(() => {
    document.title = t("reservationWidget.page.title")
  }, [t])

  // Get browser info and initialize dark mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBrowserInfo({ userAgent: navigator.userAgent, screenHeight: window.screen.height, screenWidth: window.screen.width, colorDepth: window.screen.colorDepth });
      const isDarkMode = localStorage.getItem("darkMode") === "true"
      if (isDarkMode) {
        document.documentElement.classList.add("dark")
      }
    }
  }, [])

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle("dark")
    localStorage.setItem("darkMode", isDark ? "true" : "false")
  }

  const calculateTotalAmount = useCallback(() => {
    if (widgetInfo?.enable_paymant && widgetInfo?.deposite_amount_for_guest && data.guests > 0) {
      return (Number(widgetInfo.deposite_amount_for_guest) * data.guests).toFixed(2) + " " + (widgetInfo?.currency || "MAD")
    }
    return "0.00 " + (widgetInfo?.currency || "MAD")
  }, [widgetInfo, data.guests])

  const submitPaymentForm = (paymentPayload: any) => {
    if (!paymentPayload?.pay_url || !paymentPayload?.form_data) {
      setIsLoading(false);
      setPaymentError(t("paymentFailure.error.paymentDetails"));
      return;
    }
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentPayload.pay_url;
    for (const key in paymentPayload.form_data) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(paymentPayload.form_data[key]);
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  };

  const handleRetryPayment = () => {
    if (!reservationData?.reservationId) {
      setPaymentError(t("paymentFailure.error.detailsNotFound"));
      return;
    }
    setIsLoading(true);
    setPaymentError(null);
    createPaymentInitiation({
      resource: 'api/v1/bo/payments/initiate/',
      values: { reservation_id: reservationData.reservationId, BROWSER_JAVA_ENABLED: navigator.javaEnabled?.() ? "true" : "false", BROWSER_COLOR_DEPTH: browserInfo.colorDepth, BROWSER_SCREEN_HEIGHT: browserInfo.screenHeight, BROWSER_SCREEN_WIDTH: browserInfo.screenWidth, USER_AGENT: browserInfo.userAgent, LANGUAGE: i18n.language }
    }, {
      onSuccess: (response) => {
        submitPaymentForm(response.data);
      },
      onError: (error: any) => {
        setIsLoading(false);
        setPaymentError(error?.message || t("paymentFailure.error.initiationFailed"));
      }
    });
  };

  const handleNewReservation = () => {
    localStorage.removeItem(FORM_DATA_KEY);
    localStorage.removeItem(RESERVATION_DATA_KEY);
    navigate('/make/reservation');
  };

  if (!isDataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-bgdarktheme2">
        <LoaderCircle className="animate-spin text-[#88AB61]" size={48} />
      </div>
    );
  }

  return (
    <div className={`overflow-y-auto min-h-screen max-h-screen bg-white dark:bg-bgdarktheme2 text-black dark:text-white ${preferredLanguage === "ar" ? "rtl" : ""}`}>
      <FailureHeader onThemeToggle={toggleDarkMode} />
      <FailureHero widgetInfo={widgetInfo} />

      <div className="relative pt-[370px]">
        <div className="w-full max-w-[800px] lg:max-w-[800px] md:max-w-[600px] mx-auto px-0">
          <div className="bg-white dark:bg-darkthemeitems rounded-t-3xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <FailureContent calculateTotalAmount={calculateTotalAmount} onRetry={handleRetryPayment} onNewReservation={handleNewReservation} isLoading={isLoading} />
              {paymentError && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-center text-sm text-red-700 dark:text-red-300">
                  {paymentError}
                </div>
              )}
            </div>
            <SharedWidgetFooter widgetInfo={widgetInfo} isPaymentRequired={true} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentFailurePage