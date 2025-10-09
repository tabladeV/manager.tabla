"use client"
import type React from "react"
import { useCallback, useEffect, useState } from "react"
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

import WidgetReservationProcess from "../../components/reservation/WidgetReservationProcess"
import { useDateContext } from "../../context/DateContext"

interface QuillPreviewProps {
  content: string
  className?: string
}

export function QuillPreview({ content, className = "" }: QuillPreviewProps) {
  // Import Quill styles on the client side for proper rendering
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
}

// Language Selector Component
const LanguageSelector = () => {
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
    <div className={`relative `}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-sm hover:bg-[#f5f5f5] dark:hover:bg-[#333333] transition-colors"
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
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
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
}

const PaymentSuccessPage = () => {
  const { t } = useTranslation()
  const { pathname, search } = useLocation()

  const FORM_DATA_KEY = 'tabla_widget_form_data'

  // Extract oid from query parameters
  const queryParams = new URLSearchParams(search)
  const oid = queryParams.get('oid')
  const lang = queryParams.get('lang') || 'en'


  interface ReservationData {
  reservation: {
    id: number;
    full_name: string;
    email: string | null;
    phone: string | null;
    number_of_guests: number;
    date: string; // Format: "YYYY-MM-DD"
    time: string; // Format: "HH:MM:SS"
    status: "APPROVED" | "PENDING" | "CANCELLED" | "REJECTED"; // Add other possible statuses as needed
    source: "WIDGET" | string; // Add other possible sources as needed
    restaurant_name: string;
    allergies: string;
    preferences: string;
    occasion: number;
    commenter: string;
  };
  payment: {
    order_id: string;
    formatted_amount: string;
    currency_code: string;
    status: "pending" | "completed" | "failed" | string; // Add other possible payment statuses
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

    const [reservationData, setReservationData] = useState<ReservationData>()

  // Fetch reservation data using oid
  const { data: reservation, isLoading: isLoadingReservation, error: reservationError } = useList({
    resource: `api/v1/bo/subdomains/public/customer/payment/${oid}`,
    queryOptions:{
      onSuccess: (data) => {
        if(data?.data){
          setReservationData(data.data as unknown as ReservationData)
        }
      }
    }
  })

  useEffect(() => {
    document.title = t("reservationWidget.page.title")
  }, [pathname, t])

  useEffect(() => {
    document.title = t("reservationWidget.page.title")
  }, [pathname, t])

  const { i18n } = useTranslation()



  // Detect browser language and set as default
  useEffect(() => {
    
    const storedLang = localStorage.getItem("preferredLanguage");
    if (!storedLang) {
      // Get browser language
      const browserLang = navigator.language.split('-')[0]; // Get language code only (e.g., 'en' from 'en-US')
      const supportedLanguages = ['en', 'es', 'fr', 'ar'];
      const defaultLang = supportedLanguages.includes(browserLang) ? browserLang : 'en';

      localStorage.setItem("preferredLanguage", defaultLang);
      i18n.changeLanguage(defaultLang);
    } else {
      i18n.changeLanguage(storedLang);
    }
  }, [i18n]);

  useEffect(() => {
    if(lang){
      i18n.changeLanguage(lang)
    }
  }, [lang]);

  const [widgetInfo] = useState<BaseRecord>()




  const [step, setStep] = useState(1)
  const [showProcess, setShowProcess] = useState(false)



  const [data, setData] = useState({ reserveDate: "", time: "", guests: 0 })
  const [userInformation, setUserInformation] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    preferences: "",
    allergies: "",
    occasion: "",
  })


  const [chosenTitle, setChosenTitle] = useState<"mr" | "mrs" | "ms">()
  const [checkedConditions, setCheckedConditions] = useState<boolean>(false)
  const [checkedDressCode, setCheckedDressCode] = useState<boolean>(false)

  // Credit card form state
  // const [cardInfo, setCardInfo] = useState({
  //   cardNumber: "",
  //   expiryDate: "",
  //   cvv: "",
  //   cardholderName: ""
  // })

  // const [cardErrors, setCardErrors] = useState({
  //   cardNumber: "",
  //   expiryDate: "",
  //   cvv: "",
  //   cardholderName: ""
  // })

  // Billing address form state
  const [billingInfo, setBillingInfo] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "", // Optional
    zipCode: "", // Optional
    country: ""
  })



  // Browser/Device detection fields
  const [browserInfo, setBrowserInfo] = useState({
    userAgent: "",
    screenHeight: 0,
    screenWidth: 0,
    colorDepth: 0
  })

  // Save form data to localStorage
  const saveFormDataToCache = useCallback(() => {
    const formData = {
      data,
      userInformation,
      chosenTitle,
      checkedConditions,
      checkedDressCode,
      billingInfo,
      browserInfo,
      step,
      timestamp: Date.now()
    }
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData))
  }, [data, userInformation, chosenTitle, checkedConditions, checkedDressCode, billingInfo, browserInfo, step])

  // Load form data from localStorage
  const loadFormDataFromCache = useCallback(() => {
    try {
      const cachedData = localStorage.getItem(FORM_DATA_KEY)
      if (cachedData) {
        const parsedData = JSON.parse(cachedData)
        // Check if data is not older than 24 hours
        const isDataFresh = Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000
        if (isDataFresh) {
          setData(parsedData.data || { reserveDate: "", time: "", guests: 0 })
          setUserInformation(parsedData.userInformation || {
            firstname: "",
            lastname: "",
            email: "",
            phone: "",
            preferences: "",
            allergies: "",
            occasion: "",
          })
          setChosenTitle(parsedData.chosenTitle)
          setCheckedConditions(parsedData.checkedConditions || false)
          setCheckedDressCode(parsedData.checkedDressCode || false)
          setBillingInfo(parsedData.billingInfo || {
            firstName: "",
            lastName: "",
            address: "",
            city: "",
            zipCode: "",
            country: ""
          })
          setBrowserInfo(parsedData.browserInfo || {
            userAgent: "",
            screenHeight: 0,
            screenWidth: 0,
            colorDepth: 0
          })
          if (parsedData.step && parsedData.step > 1) {
            setStep(parsedData.step)
          }
        } else {
          // Clear old data
          localStorage.removeItem(FORM_DATA_KEY)
        }
      }
    } catch (error) {
      console.error('Error loading cached form data:', error)
      localStorage.removeItem(FORM_DATA_KEY)
    }
  }, [])

  const [dressCodePopupOpen, setDressCodePopupOpen] = useState(false)

  // Load cached data on component mount
  useEffect(() => {
    loadFormDataFromCache()
  }, [loadFormDataFromCache])

  // Detect browser info on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBrowserInfo({
        userAgent: navigator.userAgent,
        screenHeight: window.screen.height,
        screenWidth: window.screen.width,
        colorDepth: window.screen.colorDepth
      })
    }
  }, [])

  // Save form data whenever relevant state changes
  useEffect(() => {
    if (step > 1) {
      saveFormDataToCache()
    }
  }, [data, userInformation, chosenTitle, checkedConditions, checkedDressCode, billingInfo, browserInfo, step, saveFormDataToCache])









  // Helper function to truncate HTML content
  const truncateHtmlContent = (htmlContent: string, maxLength = 150) => {
    // Strip HTML tags and get plain text
    const plainText = htmlContent.replace(/<[^>]*>/g, '').trim()

    if (plainText.length <= maxLength) {
      return htmlContent
    }

    // Truncate plain text and add ellipsis
    const truncatedText = plainText.substring(0, maxLength).trim() + '...'
    return truncatedText
  }


  const [showFullDescription, setShowFullDescription] = useState<boolean>(false)
  const [descriptionToggleDebounce, setDescriptionToggleDebounce] = useState<boolean>(false)

  const handleDescriptionToggle = () => {
    if (descriptionToggleDebounce) return

    setDescriptionToggleDebounce(true)
    setShowFullDescription(!showFullDescription)

    setTimeout(() => {
      setDescriptionToggleDebounce(false)
    }, 300)
  }

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark")
    localStorage.setItem("darkMode", document.documentElement.classList.contains("dark") ? "true" : "false")
  }

  // Initialize dark mode from localStorage
  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true"
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const formatedDate = useCallback(() => {
    if (data.reserveDate) {
      return format(new Date(data.reserveDate), "MMM-dd")
    }
    return ""
  }, [data.reserveDate])

  const { preferredLanguage } = useDateContext()

  const calculateTotalAmount = () => {
    if (widgetInfo?.enable_paymant && widgetInfo?.deposite_amount_for_guest) {
      return (Number(widgetInfo.deposite_amount_for_guest) * data.guests).toFixed(2) + " " + (widgetInfo?.currency || "MAD")
    }
    return "0.00"
  }


  return (
    <div className={`overflow-y-auto min-h-screen max-h-screen bg-white dark:bg-bgdarktheme2 text-black dark:text-white ${preferredLanguage === "ar" ? "rtl" : ""}`}>

      {/* Top Header with Language and Theme Controls */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="w-full max-w-[800px] lg:max-w-[800px] md:max-w-[600px] mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={toggleDarkMode}
              aria-label={t("reservationWidget.common.toggleDarkMode")}
              className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-black/20 transition-colors"
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

      {/* Hero Section with Background Image and Logo */}
      <div className="fixed w-full h-[80vh] min-h-[500px] overflow-hidden ">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[3px] scale-[1.1]"
          style={{
            backgroundImage: `url(${widgetInfo?.image_2 || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'})`,
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />

        {/* Logo positioned and vertically centered */}
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

      {/* Main Content Container */}
      <div className="relative pt-[370px]">
        {/* White Card Container */}
        <div className="w-full max-w-[800px] lg:max-w-[800px] md:max-w-[600px] mx-auto px-0">
          <div className="bg-white dark:bg-darkthemeitems rounded-t-3xl shadow-2xl overflow-hidden">

           
            {/* Reservation Form Section */}
            <div className="p-6">
              {(
                <>
                  {/* Success Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-softgreentheme dark:bg-softgreentheme rounded-full flex items-center justify-center">
                      <CheckIcon size={32} className="text-greentheme" />
                    </div>
                  </div>

                  {/* Success Message */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme mb-2">
                      Payment Successful!
                    </h2>
                    <p className="text-subblack dark:text-textdarktheme/70">
                      Your payment has been processed successfully and your reservation has been confirmed.
                    </p>
                  </div>

                  {/* Reservation Information */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-center mb-6 text-blacktheme dark:text-textdarktheme">
                      Reservation Details
                    </h3>
                    {isLoadingReservation ? (
                      <div className="p-6 bg-softgreytheme dark:bg-darkthemeitems rounded-xl text-center shadow-sm">
                        <div className="animate-pulse flex justify-center mb-2">
                          <div className="w-6 h-6 bg-softgreytheme dark:bg-greytheme rounded-full"></div>
                        </div>
                        <span className="text-sm text-subblack dark:text-textdarktheme/70">Loading reservation details...</span>
                      </div>
                    ) : reservationError ? (
                      <div className="p-6 bg-softredtheme dark:bg-softredtheme rounded-xl text-center border border-redtheme/30 dark:border-redtheme/50 shadow-sm">
                        <span className="text-sm text-redtheme">Unable to load reservation details</span>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Primary Information - Highlighted */}
                        <div className="bg-gradient-to-r from-softgreentheme to-softgreentheme p-6 rounded-xl border border-greentheme/30 dark:border-greentheme/50 shadow-sm">
                          <h4 className="text-lg font-semibold text-greentheme dark:text-greentheme mb-4 text-center">
                            Primary Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center bg-whitetheme/60 dark:bg-darkthemeitems p-4 rounded-lg">
                              <span className="block text-sm font-bold text-greentheme uppercase tracking-wide mb-2">
                                {t("reservationWidget.reservation.date")}
                              </span>
                              <span className="block text-lg font-semibold text-blacktheme dark:text-textdarktheme">
                                {reservationData?.reservation.date ? 
                                  format(new Date(reservationData.reservation.date), "MMM-dd") : 
                                  formatedDate() || "Nov-15"
                                }
                              </span>
                            </div>
                            <div className="text-center bg-whitetheme/60 dark:bg-darkthemeitems p-4 rounded-lg">
                              <span className="block text-sm font-bold text-greentheme uppercase tracking-wide mb-2">
                                {t("reservationWidget.reservation.time")}
                              </span>
                              <span className="block text-lg font-semibold text-blacktheme dark:text-textdarktheme">
                                {reservationData?.reservation.time || "19:30"}
                              </span>
                            </div>
                            <div className="text-center bg-whitetheme/60 dark:bg-darkthemeitems p-4 rounded-lg">
                              <span className="block text-sm font-bold text-greentheme uppercase tracking-wide mb-2">
                                {t("reservationWidget.reservation.guests")}
                              </span>
                              <span className="block text-lg font-semibold text-blacktheme dark:text-textdarktheme">
                                {reservationData?.reservation.number_of_guests || "4"} {reservationData?.reservation.number_of_guests === 1 ? 'Guest' : 'Guests'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Customer Information */}
                        <div className="bg-softgreytheme dark:bg-darkthemeitems p-6 rounded-xl shadow-sm">
                          <h4 className="text-lg font-semibold text-blacktheme dark:text-textdarktheme mb-4 text-center">
                            Customer Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-whitetheme dark:bg-bgdarktheme2 p-4 rounded-lg border border-softgreytheme dark:border-greytheme">
                              <span className="block text-xs font-bold text-greentheme uppercase tracking-wider mb-1">
                                {t("reservationWidget.reservation.name")}
                              </span>
                              <span className="block text-sm font-medium text-blacktheme dark:text-textdarktheme truncate">
                                {reservationData?.reservation.full_name || "John Doe"}
                              </span>
                            </div>
                            <div className="bg-whitetheme dark:bg-bgdarktheme2 p-4 rounded-lg border border-softgreytheme dark:border-greytheme">
                              <span className="block text-xs font-bold text-greentheme uppercase tracking-wider mb-1">
                                {t("reservationWidget.reservation.email")}
                              </span>
                              <span className="block text-sm font-medium text-blacktheme dark:text-textdarktheme truncate">
                                {reservationData?.reservation.email || "-"}
                              </span>
                            </div>
                            <div className="bg-whitetheme dark:bg-bgdarktheme2 p-4 rounded-lg border border-softgreytheme dark:border-greytheme">
                              <span className="block text-xs font-bold text-greentheme uppercase tracking-wider mb-1">
                                {t("reservationWidget.reservation.phone")}
                              </span>
                              <span className="block text-sm font-medium text-blacktheme dark:text-textdarktheme">
                                {reservationData?.reservation.phone || "-"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Restaurant & Status Information */}
                        <div className="bg-softgreytheme dark:bg-darkthemeitems p-6 rounded-xl shadow-sm">
                          <h4 className="text-lg font-semibold text-blacktheme dark:text-textdarktheme mb-4 text-center">
                            Reservation Status
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-whitetheme dark:bg-bgdarktheme2 p-4 rounded-lg border border-softgreytheme dark:border-greytheme">
                              <span className="block text-xs font-bold text-greentheme uppercase tracking-wider mb-1">
                                {t("reservationWidget.reservation.restaurant")}
                              </span>
                              <span className="block text-sm font-medium text-blacktheme dark:text-textdarktheme">
                                {reservationData?.reservation.restaurant_name || "-"}
                              </span>
                            </div>
                            <div className="bg-whitetheme dark:bg-bgdarktheme2 p-4 rounded-lg border border-softgreytheme dark:border-greytheme">
                              <span className="block text-xs font-bold text-greentheme uppercase tracking-wider mb-1">
                                {t("reservationWidget.reservation.status")}
                              </span>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                                reservationData?.reservation.status?.toLowerCase() === 'approved' ? 'bg-softgreentheme dark:bg-softgreentheme text-greentheme dark:text-greentheme' :
                                reservationData?.reservation.status?.toLowerCase() === 'pending' ? 'bg-softyellowtheme dark:bg-softyellowtheme text-yellowtheme dark:text-yellowtheme' :
                                reservationData?.reservation.status?.toLowerCase() === 'cancelled' ? 'bg-softredtheme dark:bg-softredtheme text-redtheme dark:text-redtheme' :
                                'bg-softgreytheme dark:bg-greytheme text-blacktheme dark:text-textdarktheme'
                              }`}>
                                {reservationData?.reservation.status?.toLowerCase() || "-"}
                              </span>
                            </div>
                            <div className="bg-whitetheme dark:bg-bgdarktheme2 p-4 rounded-lg border border-softgreytheme dark:border-greytheme">
                              <span className="block text-xs font-bold text-greentheme uppercase tracking-wider mb-1">
                                {t("reservationWidget.reservation.source")}
                              </span>
                              <span className="block text-sm font-medium text-blacktheme dark:text-textdarktheme uppercase">
                                {reservationData?.reservation.source || "-"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Special Requirements */}
                        {(reservationData?.reservation.allergies || reservationData?.reservation.preferences || reservationData?.reservation.occasion || reservationData?.reservation.commenter) && (
                          <div className="bg-softbluetheme dark:bg-softbluetheme p-6 rounded-xl border border-bluetheme/30 dark:border-bluetheme/50 shadow-sm">
                            <h4 className="text-lg font-semibold text-bluetheme dark:text-bluetheme mb-4 text-center">
                              Special Requirements & Notes
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {reservationData?.reservation.allergies && reservationData.reservation.allergies !== "-" && (
                                <div className="bg-whitetheme/60 dark:bg-darkthemeitems p-4 rounded-lg">
                                  <span className="block text-xs font-bold text-bluetheme uppercase tracking-wider mb-1">
                                    {t("reservationWidget.reservation.allergies")}
                                  </span>
                                  <span className="block text-sm font-medium text-blacktheme dark:text-textdarktheme">
                                    {reservationData.reservation.allergies}
                                  </span>
                                </div>
                              )}
                              {reservationData?.reservation.preferences && reservationData.reservation.preferences !== "-" && (
                                <div className="bg-whitetheme/60 dark:bg-darkthemeitems p-4 rounded-lg">
                                  <span className="block text-xs font-bold text-bluetheme uppercase tracking-wider mb-1">
                                    {t("reservationWidget.reservation.preferences")}
                                  </span>
                                  <span className="block text-sm font-medium text-blacktheme dark:text-textdarktheme">
                                    {reservationData.reservation.preferences}
                                  </span>
                                </div>
                              )}
                              {reservationData?.reservation.occasion != null && reservationData.reservation.occasion !== 0 && (
                                <div className="bg-whitetheme/60 dark:bg-darkthemeitems p-4 rounded-lg">
                                  <span className="block text-xs font-bold text-bluetheme uppercase tracking-wider mb-1">
                                    {t("reservationWidget.reservation.occasion")}
                                  </span>
                                  <span className="block text-sm font-medium text-blacktheme dark:text-textdarktheme">
                                    {reservationData.reservation.occasion}
                                  </span>
                                </div>
                              )}
                              {reservationData?.reservation.commenter && reservationData.reservation.commenter !== "-" && (
                                <div className="bg-whitetheme/60 dark:bg-darkthemeitems p-4 rounded-lg">
                                  <span className="block text-xs font-bold text-bluetheme uppercase tracking-wider mb-1">
                                    {t("reservationWidget.reservation.commenter")}
                                  </span>
                                  <span className="block text-sm font-medium text-blacktheme dark:text-textdarktheme">
                                    {reservationData.reservation.commenter}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Payment Information */}
                  <div className="mb-6 p-4 bg-softgreentheme dark:bg-softgreentheme rounded-lg border border-greentheme/30 dark:border-greentheme/50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-greentheme">
                        Payment Amount:
                      </span>
                      <span className="text-sm font-bold text-greentheme">
                        {reservationData?.payment?.formatted_amount || calculateTotalAmount()}
                      </span>

                    </div>
                  </div>

                  {/* Return Home Button */}
                  <Link
                    to="/make/reservation"
                    className="w-full py-3 px-4 rounded-md font-medium bg-[#88AB61] hover:bg-[#769c4f] text-white transition-colors flex items-center justify-center"
                  >
                    Make another reservation
                  </Link>
                  
                </>
              )}

              
            </div>

            {/* Description Section */}
            { widgetInfo?.content && (
              <div className="px-6 pb-6">
                <div className="text-[#333333] dark:text-[#e1e1e1]">
                  {showFullDescription ? (
                    <QuillPreview content={widgetInfo.content} />
                  ) : (
                    <p className="text-sm">{truncateHtmlContent(widgetInfo.content, 100)}</p>
                  )}
                </div>
                <button
                  onClick={handleDescriptionToggle}
                  className="mt-2 text-[#88AB61] text-sm font-medium hover:underline"
                >
                  {showFullDescription ? t("reservationWidget.common.showLess") : t("reservationWidget.common.readMore")}
                </button>
              </div>
            )}

            {/* Social Media & Contact Links */}
            { (
              <div className="px-6 pb-6">
                <div className="border-t border-[#dddddd] dark:border-[#444444] pt-4">
                  <h3 className="text-lg font-medium mb-4 text-center text-[#333333] dark:text-[#e1e1e1]">
                    {t("reservationWidget.contact.followUs")}
                  </h3>
                  <div className="flex justify-center items-center gap-4 flex-wrap">
                    {/* Phone */}
                    <a 
                      href="tel:+1234567890" 
                      className="flex items-center gap-2 p-3 rounded-lg bg-[#f9f9f9] dark:bg-darkthemeitems hover:bg-[#88AB61]/10 dark:hover:bg-[#88AB61]/20 transition-colors group"
                      aria-label="Call us"
                    >
                      <Phone size={20} className="text-[#88AB61] group-hover:text-[#769c4f] transition-colors" />
                      <span className="text-sm font-medium text-[#555555] dark:text-[#cccccc] group-hover:text-[#88AB61] transition-colors">
                        {t("reservationWidget.contact.phone")}
                      </span>
                    </a>

                    {/* Email */}
                    <a 
                      href="mailto:contact@restaurant.com" 
                      className="flex items-center gap-2 p-3 rounded-lg bg-[#f9f9f9] dark:bg-darkthemeitems hover:bg-[#88AB61]/10 dark:hover:bg-[#88AB61]/20 transition-colors group"
                      aria-label="Email us"
                    >
                      <Mail size={20} className="text-[#88AB61] group-hover:text-[#769c4f] transition-colors" />
                      <span className="text-sm font-medium text-[#555555] dark:text-[#cccccc] group-hover:text-[#88AB61] transition-colors">
                        {t("reservationWidget.contact.email")}
                      </span>
                    </a>

                    {/* WhatsApp */}
                    <a 
                      href="https://wa.me/1234567890" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-lg bg-[#f9f9f9] dark:bg-darkthemeitems hover:bg-[#25D366]/10 dark:hover:bg-[#25D366]/20 transition-colors group"
                      aria-label="WhatsApp"
                    >
                      <MessageCircle size={20} className="text-[#25D366] group-hover:text-[#1DA851] transition-colors" />
                      <span className="text-sm font-medium text-[#555555] dark:text-[#cccccc] group-hover:text-[#25D366] transition-colors">
                        WhatsApp
                      </span>
                    </a>
                  </div>
                  
                  <div className="flex justify-center items-center gap-3 mt-4">
                    {/* Facebook */}
                    <a 
                      href="https://facebook.com/restaurant" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-[#f9f9f9] dark:bg-darkthemeitems hover:bg-[#1877F2]/10 dark:hover:bg-[#1877F2]/20 transition-colors group"
                      aria-label="Facebook"
                    >
                      <Facebook size={20} className="text-[#1877F2] group-hover:text-[#166fe5] transition-colors" />
                    </a>

                    {/* Instagram */}
                    <a 
                      href="https://instagram.com/restaurant" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-[#f9f9f9] dark:bg-darkthemeitems hover:bg-[#E4405F]/10 dark:hover:bg-[#E4405F]/20 transition-colors group"
                      aria-label="Instagram"
                    >
                      <Instagram size={20} className="text-[#E4405F] group-hover:text-[#d63384] transition-colors" />
                    </a>

                    {/* Twitter */}
                    <a 
                      href="https://twitter.com/restaurant" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-[#f9f9f9] dark:bg-darkthemeitems hover:bg-[#1DA1F2]/10 dark:hover:bg-[#1DA1F2]/20 transition-colors group"
                      aria-label="Twitter"
                    >
                      <Twitter size={20} className="text-[#1DA1F2] group-hover:text-[#0d8bd9] transition-colors" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="bg-gray-100 dark:bg-[#88AB61]/20 px-6 py-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("reservationWidget.footer.copyright", { year: new Date().getFullYear() })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals and Popups */}
      {showProcess && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkthemeitems rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <WidgetReservationProcess
              onClick={() => setShowProcess(false)}
              maxGuests={widgetInfo?.max_of_guests_par_reservation}
              resData={data}
              getDateTime={(data) => setData(data)}
            />
          </div>
        </div>
      )}

      {dressCodePopupOpen && (
        <div
          onClick={() => setDressCodePopupOpen(false)}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-darkthemeitems rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">{t("reservationWidget.form.dressCode")}</h3>
            <p className="mb-4">{widgetInfo?.dress_code}</p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setDressCodePopupOpen(false)}
                className="py-2 px-4 bg-[#88AB61] text-white rounded-lg hover:bg-[#769c4f]"
              >
                {t("reservationWidget.common.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentSuccessPage
