"use client"
import type React from "react"
import { useCallback, useEffect, useState, memo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Logo from "../../components/header/Logo"
import { LoaderCircle, AlertOctagon, XCircle } from "lucide-react"
import { SunIcon, MoonIcon } from "../../components/icons"
import { useCreate, useList } from "@refinedev/core"
import { useDateContext } from "../../context/DateContext"
import { SharedWidgetFooter } from "../../components/reservation/SharedWidgetFooter"
import LanguageSelector from "./LanguageSelector"
import { useWidgetData } from "../../hooks/useWidgetData"

// #region Types
interface ReservationData {
  reservation: {
    id: number;
    full_name: string;
    email: string | null;
    phone: string | null;
    number_of_guests: number;
    date: string; // Format: "YYYY-MM-DD"
    time: string; // Format: "HH:MM:SS"
    status: string;
    amount: string;
  };
  payment: {
    order_id: string;
    formatted_amount: string;
    currency_code: string;
    status: string;
  };
}

interface QuillPreviewProps {
  content: string
  className?: string
}
// #endregion

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

const FailureHero = memo(({ widgetInfo }: { widgetInfo: any }) => {
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

const FailureContent = memo(({ 
  calculateTotalAmount, 
  onRetry, 
  onNewReservation, 
  isLoading,
  reservationData 
}: { 
  calculateTotalAmount: () => string, 
  onRetry: () => void, 
  onNewReservation: () => void, 
  isLoading: boolean,
  reservationData?: ReservationData 
}) => {
  const { t } = useTranslation()
  
  // Use the actual amount from reservation data if available
  const displayAmount = reservationData?.payment?.formatted_amount || calculateTotalAmount();
  
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
            {displayAmount}
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
  const { search } = useLocation();

  // Get query parameters
  const queryParams = new URLSearchParams(search);
  const oid = queryParams.get('oid'); // Order ID from CMI/payment gateway
  const lang = queryParams.get('lang');

  const [isLoading, setIsLoading] = useState(false);
  const [reservationData, setReservationData] = useState<ReservationData>();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [browserInfo, setBrowserInfo] = useState({ 
    userAgent: "", 
    screenHeight: 0, 
    screenWidth: 0, 
    colorDepth: 0 
  });

  // Use the useWidgetData hook
  const { widgetInfo, isLoading: isLoadingWidget, error: widgetError } = useWidgetData();
  
  const { mutate: createPaymentInitiation } = useCreate();

  // Fetch reservation data using oid
  const { isLoading: isLoadingReservation, error: reservationError } = useList({
    resource: `api/v1/bo/subdomains/public/customer/payment/${oid}`,
    queryOptions: {
      enabled: !!oid,
      onSuccess: (data) => {
        if (data?.data) {
          setReservationData(data.data as unknown as ReservationData);
        }
      }
    }
  });

  // Set language from URL or local storage
  useEffect(() => {
    if (lang) {
      i18n.changeLanguage(lang)
      localStorage.setItem("preferredLanguage", lang);
    } else {
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
    }
  }, [i18n, lang]);

  // Set page title
  useEffect(() => {
    document.title = t("paymentFailure.page.title")
  }, [t]);

  // Get browser info and initialize dark mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBrowserInfo({ 
        userAgent: navigator.userAgent, 
        screenHeight: window.screen.height, 
        screenWidth: window.screen.width, 
        colorDepth: window.screen.colorDepth 
      });
      
      const isDarkMode = localStorage.getItem("darkMode") === "true"
      if (isDarkMode) {
        document.documentElement.classList.add("dark")
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle("dark")
    localStorage.setItem("darkMode", isDark ? "true" : "false")
  };

  const calculateTotalAmount = () => {
    if (widgetInfo?.enable_paymant && widgetInfo?.deposite_amount_for_guest && reservationData?.reservation?.number_of_guests) {
      return (Number(widgetInfo.deposite_amount_for_guest) * reservationData.reservation.number_of_guests).toFixed(2) + " " + (widgetInfo?.currency || "MAD");
    }
    return "0.00 " + (widgetInfo?.currency || "MAD");
  };

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
    if (!reservationData?.reservation?.id) {
      setPaymentError(t("paymentFailure.error.detailsNotFound"));
      return;
    }
    
    setIsLoading(true);
    setPaymentError(null);
    
    createPaymentInitiation({
      resource: 'api/v1/bo/payments/initiate/',
      values: { 
        reservation_id: reservationData.reservation.id, 
        BROWSER_JAVA_ENABLED: navigator.javaEnabled?.() ? "true" : "false", 
        BROWSER_COLOR_DEPTH: browserInfo.colorDepth, 
        BROWSER_SCREEN_HEIGHT: browserInfo.screenHeight, 
        BROWSER_SCREEN_WIDTH: browserInfo.screenWidth, 
        USER_AGENT: browserInfo.userAgent, 
        LANGUAGE: i18n.language 
      }
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
    navigate('/make/reservation');
  };

  // If we're still loading widget data, show a full page loader
  if (isLoadingWidget) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-bgdarktheme2">
        <LoaderCircle className="animate-spin text-greentheme" size={48} />
      </div>
    );
  }

  // If there was an error loading the widget data, show an error message
  if (widgetError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-bgdarktheme2 p-4 text-center">
        <div className="p-6 bg-softredtheme dark:bg-softredtheme rounded-xl text-center border border-redtheme/30 dark:border-redtheme/50 shadow-sm max-w-md">
          <AlertOctagon className="h-12 w-12 mx-auto mb-4 text-redtheme" />
          <h2 className="text-xl font-semibold mb-2 text-redtheme">
            {t("common.errors.restaurantNotFoundTitle")}
          </h2>
          <p className="text-sm text-redtheme">
            {t("common.errors.restaurantNotFoundMessage")}
          </p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className={`overflow-y-auto min-h-screen max-h-screen bg-white dark:bg-bgdarktheme2 text-black dark:text-white ${preferredLanguage === "ar" ? "rtl" : ""}`}>
      <FailureHeader onThemeToggle={toggleDarkMode} />
      <FailureHero widgetInfo={widgetInfo} />

      <div className="relative pt-[370px]">
        <div className="w-full max-w-[800px] lg:max-w-[800px] md:max-w-[600px] mx-auto px-0">
          <div className="bg-white dark:bg-darkthemeitems rounded-t-3xl shadow-2xl overflow-hidden">
            <div className="p-6">
              {isLoadingReservation ? (
                <div className="p-6 text-center">
                  <div className="animate-pulse flex justify-center mb-2">
                    <div className="w-12 h-12 bg-softgreytheme dark:bg-greytheme rounded-full"></div>
                  </div>
                  <span className="text-sm text-subblack dark:text-textdarktheme/70">{t("paymentFailure.loading")}</span>
                </div>
              ) : reservationError ? (
                <div className="p-6 bg-softredtheme dark:bg-softredtheme rounded-xl text-center border border-redtheme/30 dark:border-redtheme/50 shadow-sm">
                  <span className="text-sm text-redtheme">{t("paymentFailure.error")}</span>
                </div>
              ) : (
                <>
                  <FailureContent 
                    calculateTotalAmount={calculateTotalAmount} 
                    onRetry={handleRetryPayment} 
                    onNewReservation={handleNewReservation} 
                    isLoading={isLoading}
                    reservationData={reservationData}
                  />
                  {paymentError && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-center text-sm text-red-700 dark:text-red-300">
                      {paymentError}
                    </div>
                  )}
                </>
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