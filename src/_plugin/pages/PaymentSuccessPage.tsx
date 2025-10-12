"use client"
import type React from "react"
import { useEffect, useState, memo } from "react"
import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Logo from "../../components/header/Logo"
import { ChevronDown, Facebook, Instagram, Twitter, Phone, Mail, MessageCircle } from "lucide-react"
import { SunIcon, MoonIcon, CheckIcon } from "../../components/icons"
import { type BaseRecord, useList, useOne } from "@refinedev/core"
import { format } from "date-fns"
import spanish from "../../assets/spanish.png"
import arabic from "../../assets/arabic.jpg"
import english from "../../assets/english.png"
import french from "../../assets/french.png"
import { useDateContext } from "../../context/DateContext"
import { SharedWidgetFooter } from "../../components/reservation/SharedWidgetFooter"

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
    status: "APPROVED" | "PENDING" | "CANCELLED" | "REJECTED";
    source: "WIDGET" | string;
    restaurant_name: string;
    allergies: string;
    preferences: string;
    occasion: number;
    commenter: string;
    occasion_name?: string;
    area_name?: string;
  };
  payment: {
    order_id: string;
    formatted_amount: string;
    currency_code: string;
    status: "pending" | "completed" | "failed" | string;
    is_success: boolean;
    reference_id: string;
    transaction_id: string;
    auth_code: string;
    error_code: string;
    error_message: string;
    md_status: string;
    created_at: string; // ISO 8601 format
  };
}

interface WidgetInfo {
  image: string;
  image_2: string;
  content: string;
  [key: string]: any;
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

const SuccessHeader = memo(({ onThemeToggle }: { onThemeToggle: () => void }) => {
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

const SuccessHero = memo(({ widgetInfo }: { widgetInfo: WidgetInfo | undefined }) => {
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

const SuccessMessage = memo(() => {
  const { t } = useTranslation()
  return (
    <>
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-softgreentheme dark:bg-softgreentheme rounded-full flex items-center justify-center">
          <CheckIcon size={32} className="text-greentheme" />
        </div>
      </div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme mb-2">
          {t("paymentSuccess.title")}
        </h2>
        <p className="text-subblack dark:text-textdarktheme/70">
          {t("paymentSuccess.description")}
        </p>
      </div>
    </>
  )
})

const ReservationDetails = memo(({ reservation }: { reservation: ReservationData['reservation'] | undefined }) => {
  const { t } = useTranslation()
  if (!reservation) return null

  const hasSpecialInfo = reservation.occasion_name || reservation.area_name || reservation.allergies || reservation.preferences;

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-center mb-6 text-blacktheme dark:text-textdarktheme">
        {t("paymentSuccess.reservationDetails")}
      </h3>
      <div className="bg-[#f9f9f9] dark:bg-darkthemeitems rounded-lg p-4">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.name")}: </span><span className="font-medium">{reservation.full_name}</span></div>
            <div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.email")}: </span><span>{reservation.email || '-'}</span></div>
            <div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.phone")}: </span><span>{reservation.phone || '-'}</span></div>
          </div>
          <div className="border-t border-[#dddddd] dark:border-[#444444] pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.dateTime")}: </span><span className="font-medium">{format(new Date(reservation.date), "MMMM d, yyyy")} {t("reservationWidget.confirmation.at")} {format(new Date(`1970-01-01T${reservation.time}`), "HH:mm")}</span></div>
              <div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.guests")}: </span><span className="font-medium">{reservation.number_of_guests} {reservation.number_of_guests === 1 ? t("reservationWidget.confirmation.person") : t("reservationWidget.confirmation.people")}</span></div>
            </div>
          </div>
          {hasSpecialInfo && (
            <div className="border-t border-[#dddddd] dark:border-[#444444] pt-3">
              <div className="space-y-2 text-sm">
                {reservation.occasion_name && (<div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.occasion")}: </span><span>{reservation.occasion_name}</span></div>)}
                {reservation.area_name && (<div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.form.areas")}: </span><span>{reservation.area_name}</span></div>)}
                {reservation.allergies && (<div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.allergies")}: </span><span className="text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2 py-1 rounded">{reservation.allergies}</span></div>)}
                {reservation.preferences && (<div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.preferences")}: </span><span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">{reservation.preferences}</span></div>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

const PaymentDetails = memo(({ payment }: { payment: ReservationData['payment'] | undefined }) => {
  const { t } = useTranslation()
  if (!payment) return null;
  return (
    <div className="mb-6 p-4 bg-softgreentheme dark:bg-softgreentheme rounded-lg border border-greentheme/30 dark:border-greentheme/50">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-greentheme">
          {t("paymentSuccess.paidAmount")}
        </span>
        <span className="text-sm font-bold text-greentheme">
          {payment.formatted_amount}
        </span>
      </div>
    </div>
  )
})


// #endregion

const PaymentSuccessPage = () => {
  const { t, i18n } = useTranslation()
  const { search } = useLocation()
  const { preferredLanguage } = useDateContext()

  const [reservationData, setReservationData] = useState<ReservationData>()
  const [widgetInfo, setWidgetInfo] = useState<WidgetInfo>()

  const queryParams = new URLSearchParams(search)
  const oid = queryParams.get('oid')
  const lang = queryParams.get('lang')

  // Clear form data from widget on successful payment
  useEffect(() => {
    localStorage.removeItem('tabla_widget_form_data');
  }, []);

  // Fetch general widget data
  const { data: mainWidgetData } = useOne({
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

  // Fetch reservation data using oid
  const { isLoading: isLoadingReservation, error: reservationError } = useList({
    resource: `api/v1/bo/subdomains/public/customer/payment/${oid}`,
    queryOptions: {
      enabled: !!oid,
      onSuccess: (data) => {
        if (data?.data) {
          setReservationData(data.data as unknown as ReservationData)
        }
      }
    }
  })

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
    document.title = t("reservationWidget.page.title")
  }, [t])

  // Initialize dark mode from localStorage
  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true"
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle("dark")
    localStorage.setItem("darkMode", isDark ? "true" : "false")
  }

  const renderContent = () => {
    if (isLoadingReservation) {
      return (
        <div className="p-6 text-center">
          <div className="animate-pulse flex justify-center mb-2">
            <div className="w-12 h-12 bg-softgreytheme dark:bg-greytheme rounded-full"></div>
          </div>
          <span className="text-sm text-subblack dark:text-textdarktheme/70">{t("paymentSuccess.loading")}</span>
        </div>
      )
    }

    if (reservationError) {
      return (
        <div className="p-6 bg-softredtheme dark:bg-softredtheme rounded-xl text-center border border-redtheme/30 dark:border-redtheme/50 shadow-sm">
          <span className="text-sm text-redtheme">{t("paymentSuccess.error")}</span>
        </div>
      )
    }

    return (
      <>
        <SuccessMessage />
        <ReservationDetails reservation={reservationData?.reservation} />
        <PaymentDetails payment={reservationData?.payment} />
        <Link
          to="/make/reservation"
          className="w-full py-3 px-4 rounded-md font-medium bg-[#88AB61] hover:bg-[#769c4f] text-white transition-colors flex items-center justify-center"
        >
          {t("paymentSuccess.newReservation")}
        </Link>
      </>
    )
  }

  return (
    <div className={`overflow-y-auto min-h-screen max-h-screen bg-white dark:bg-bgdarktheme2 text-black dark:text-white ${preferredLanguage === "ar" ? "rtl" : ""}`}>
      <SuccessHeader onThemeToggle={toggleDarkMode} />
      <SuccessHero widgetInfo={widgetInfo} />

      <div className="relative pt-[370px]">
        <div className="w-full max-w-[800px] lg:max-w-[800px] md:max-w-[600px] mx-auto px-0">
          <div className="bg-white dark:bg-darkthemeitems rounded-t-3xl shadow-2xl overflow-hidden">
            <div className="p-6">
              {renderContent()}
            </div>
            <SharedWidgetFooter widgetInfo={widgetInfo} isPaymentRequired={true} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage