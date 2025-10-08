"use client"
import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { Link, Navigate, useLocation, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Logo from "../../components/header/Logo"
import { LoaderCircle, ScreenShareIcon, ChevronDown, Facebook, Instagram, Twitter, Phone, Mail, MessageCircle, Info, BadgeInfo } from "lucide-react"
import { SunIcon, MoonIcon, CheckIcon } from "../../components/icons"
import { type BaseKey, type BaseRecord, useCreate, useList, useOne } from "@refinedev/core"
import { format } from "date-fns"
import { getSubdomain } from "../../utils/getSubdomain"
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

const WidgetPage = () => {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  // Static payment enablement - will be replaced with API endpoint later
  const PAYMENT_ENABLED = true
  const FORM_DATA_KEY = 'tabla_widget_form_data'

  // Payment initiation types
  interface PaymentInitiationRequest {
    reservation_id: number;
    BROWSER_JAVA_ENABLED: string;
    BROWSER_COLOR_DEPTH: number;
    BROWSER_SCREEN_HEIGHT: number;
    BROWSER_SCREEN_WIDTH: number;
    USER_AGENT: string;
    LANGUAGE: string;
  }

  interface PaymentInitiationResponse {
    order_id: string;
    provider: string;
    amount: string;
    currency: string;
    status: string;
    pay_url: string;
    form_data: {
      clientid: string;
      storetype: string;
      trantype: string;
      amount: number;
      currency: string;
      oid: string;
      okUrl: string;
      failUrl: string;
      lang: string;
      email: string;
      BillToName: string;
      rnd: string;
      hashAlgorithm: string;
      encoding: string;
      CallbackResponse: string;
      CallbackURL: string;
      AutoRedirect: string;
      sessiontimeout: string;
      hash: string;
    };
    redirect_method: string;

  }

  // Payment state
  const [paymentData, setPaymentData] = useState<PaymentInitiationResponse | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [reservationId, setReservationId] = useState<number | null>(null)
  const RESERVATION_DATA_KEY = 'tabla_widget_reservation_data'

  useEffect(() => {
    document.title = t("reservationWidget.page.title")
  }, [pathname, t])

  const { restaurant } = useParams()
  const [restaurantID, setRestaurantID] = useState<BaseKey>()

  const { data: widgetData } = useOne({
    resource: `api/v1/bo/subdomains/public/cutomer/reservations`,
    id: "",
  })

  const subdomain = getSubdomain()
  const [occasions, setOccasions] = useState<BaseRecord[]>()

  const { data: posts } = useList({
    resource: `api/v1/bo/restaurants/subdomain/occasions`,
  })

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
    if (posts) {
      setOccasions(posts.data as unknown as BaseRecord[])
    }
  }, [posts])

  const { mutate: createReservation } = useCreate()
  const { mutate: createPaymentInitiation } = useCreate()
  const [widgetInfo, setWidgetInfo] = useState<BaseRecord>()

  interface Area {
    id: BaseKey
    seq_id: BaseKey
    name: string
    restaurant: BaseKey
  }

  const [areas, setAreas] = useState<Area[]>([])
  const [areaSelected, setAreaSelected] = useState<BaseKey>()

  const {
    data: areasList,
    isLoading: areasListLoading,
    error: areasEroor,
  } = useList({
    resource: `api/v1/bo/areas/`,
    queryOptions: {
      onSuccess: (data) => {
        setAreas(data.data as Area[])
      },
    },
  })

  useEffect(() => {
    if (widgetData) {
      setWidgetInfo(widgetData.data)
      setRestaurantID(widgetData.data.restaurant)
      console.log("widgetData", widgetData.data)
    }
  }, [widgetData])

  const [step, setStep] = useState(1)
  const [showProcess, setShowProcess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  interface InfoType {
    customer: {
      email: string
      first_name: string
      last_name: string
      phone: string
    }
    occasion?: string
    internal_note?: string
    restaurant: number
    review_link?: string
    tableId?: BaseKey
    date?: string
    source?: string
    status?: string
    allergies: string
    preferences: string
    time: string
    number_of_guests: number
    commenter?: string
    user?: number
    offer?: number
  }

  const [allInformations, setAllInformations] = useState<InfoType>()
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

  const [formErrors, setFormErrors] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
  })

  const [serverError, setServerError] = useState<string>()
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

  const [billingErrors, setBillingErrors] = useState({
    firstName: "",
    lastName: "",
    address: "",
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
      areaSelected,
      chosenTitle,
      checkedConditions,
      checkedDressCode,
      // cardInfo,
      billingInfo,
      browserInfo,
      step,
      timestamp: Date.now()
    }
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData))
  }, [data, userInformation, areaSelected, chosenTitle, checkedConditions, checkedDressCode, /* cardInfo, */ billingInfo, browserInfo, step])

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
          setAreaSelected(parsedData.areaSelected)
          setChosenTitle(parsedData.chosenTitle)
          setCheckedConditions(parsedData.checkedConditions || false)
          setCheckedDressCode(parsedData.checkedDressCode || false)
          // setCardInfo(parsedData.cardInfo || {
          //   cardNumber: "",
          //   expiryDate: "",
          //   cvv: "",
          //   cardholderName: ""
          // })
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

  // Clear form data from localStorage
  const clearFormDataCache = useCallback(() => {
    localStorage.removeItem(FORM_DATA_KEY)
    localStorage.removeItem(RESERVATION_DATA_KEY)
  }, [])



  const validateForm = (formData: any) => {
    const errors = {
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
    }
    let isValid = true

    if (!formData.firstname.trim()) {
      errors.firstname = t("reservationWidget.validation.firstNameRequired")
      isValid = false
    }

    if (!formData.lastname.trim()) {
      errors.lastname = t("reservationWidget.validation.lastNameRequired")
      isValid = false
    }

    if (!formData.email.trim()) {
      errors.email = t("reservationWidget.validation.emailRequired")
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t("reservationWidget.validation.emailInvalid")
      isValid = false
    }

    if (!formData.phone.trim()) {
      errors.phone = t("reservationWidget.validation.phoneRequired")
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = {
      firstname: userInformation.firstname,
      lastname: userInformation.lastname,
      email: userInformation.email,
      phone: userInformation.phone,
      preferences: userInformation.preferences,
      area: areaSelected,
      allergies: userInformation.allergies,
      occasion: userInformation.occasion !== "0" ? userInformation.occasion : null,
    }

    if (validateForm(formData)) {
      // Go to payment step if enabled, otherwise go to confirmation
      if (PAYMENT_ENABLED) {
        setStep(3) // Payment step
      } else {
        setStep(4) // Confirmation step
      }
    }
  }

  const [isWidgetActivated, setIsWidgetActivated] = useState(true)
  const [dressCodePopupOpen, setDressCodePopupOpen] = useState(false)

  useEffect(() => {
    if (widgetInfo) {
      setIsWidgetActivated(widgetInfo?.is_widget_activated)
    }
  }, [widgetInfo])

  useEffect(() => {
    if (isWidgetActivated) {
      setStep(1)
    } else {
      setStep(6)
    }
  }, [isWidgetActivated])

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
  }, [data, userInformation, areaSelected, chosenTitle, checkedConditions, checkedDressCode, /* cardInfo, */ billingInfo, browserInfo, step, saveFormDataToCache])

  // Credit card validation
  // const validateCardInfo = () => {
  //   const errors = {
  //     cardNumber: "",
  //     expiryDate: "",
  //     cvv: "",
  //     cardholderName: ""
  //   }
  //   let isValid = true

  //   // Card number validation (basic length check)
  //   if (!cardInfo.cardNumber.replace(/\s/g, '')) {
  //     errors.cardNumber = t("reservationWidget.payment.cardNumberRequired")
  //     isValid = false
  //   } else if (cardInfo.cardNumber.replace(/\s/g, '').length < 16) {
  //     errors.cardNumber = t("reservationWidget.payment.cardNumberInvalid")
  //     isValid = false
  //   }

  //   // Expiry date validation
  //   if (!cardInfo.expiryDate) {
  //     errors.expiryDate = t("reservationWidget.payment.expiryRequired")
  //     isValid = false
  //   } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardInfo.expiryDate)) {
  //     errors.expiryDate = t("reservationWidget.payment.expiryInvalid")
  //     isValid = false
  //   }

  //   // CVV validation
  //   if (!cardInfo.cvv) {
  //     errors.cvv = t("reservationWidget.payment.cvvRequired")
  //     isValid = false
  //   } else if (!/^\d{3,4}$/.test(cardInfo.cvv)) {
  //     errors.cvv = t("reservationWidget.payment.cvvInvalid")
  //     isValid = false
  //   }

  //   // Cardholder name validation
  //   if (!cardInfo.cardholderName.trim()) {
  //     errors.cardholderName = t("reservationWidget.payment.cardholderRequired")
  //     isValid = false
  //   }

  //   setCardErrors(errors)
  //   return isValid
  // }

  // Billing address validation
  const validateBillingInfo = () => {
    const errors = {
      firstName: "",
      lastName: "",
      address: "",
      country: ""
    }
    let isValid = true

    if (!billingInfo.firstName.trim()) {
      errors.firstName = t("reservationWidget.payment.firstNameRequired")
      isValid = false
    }

    if (!billingInfo.lastName.trim()) {
      errors.lastName = t("reservationWidget.payment.lastNameRequired")
      isValid = false
    }

    if (!billingInfo.address.trim()) {
      errors.address = t("reservationWidget.payment.addressRequired")
      isValid = false
    }

    if (!billingInfo.country.trim()) {
      errors.country = t("reservationWidget.payment.countryRequired")
      isValid = false
    }

    setBillingErrors(errors)
    return isValid
  }

  // Helper function to check if payment is required
  const isPaymentRequired = (guestCount: number) => {
    if (!widgetInfo?.enable_paymant) return false
    const minGuestsForPayment = widgetInfo?.min_number_of_guests_without_deposite || 1
    return guestCount >= minGuestsForPayment
  }

  const [paymentURL, setPaymentURL] = useState<string | null>(null)

  // Payment initiation function
  const initiatePayment = (reservationId: number) => {
    setPaymentError(null)
    
    const paymentRequest: PaymentInitiationRequest = {
      reservation_id: reservationId,
      BROWSER_JAVA_ENABLED: navigator.javaEnabled ? navigator.javaEnabled().toString() : "false",
      BROWSER_COLOR_DEPTH: browserInfo.colorDepth,
      BROWSER_SCREEN_HEIGHT: browserInfo.screenHeight,
      BROWSER_SCREEN_WIDTH: browserInfo.screenWidth,
      USER_AGENT: browserInfo.userAgent,
      LANGUAGE: i18n.language
    }

    createPaymentInitiation(
      {
        resource: 'api/v1/bo/payments/initiate/',
        values: paymentRequest
      },
      {
        onSuccess: (response) => {
          setPaymentData(response.data as PaymentInitiationResponse)
          setIsLoading(false) // Stop loading, let user proceed to payment manually
          console.log('Payment initiated successfully:', response.data)
          setPaymentURL(response.data.pay_url || null)
          // Don't redirect here, let the user click the payment button in step 4
        },
        onError: (error) => {
          console.error('Payment initiation error:', error)
          setIsLoading(false)
          setPaymentError(error?.message || 'Payment initiation failed')
        }
      }
    )
  }



  function submitFormPost(url: string | undefined, data: Record<string, string | number  > | undefined) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = url ?? "";
      
      for (const key in data) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(data[key]);
          form.appendChild(input);
      }
      
      document.body.appendChild(form);
      form.submit();
  }

  const handleConfirmation = () => {
    setIsLoading(true)
    setServerError("")
    createReservation(
      {
        resource: `api/v1/bo/subdomains/public/cutomer/reservations/`,
        values: {
          customer: {
            title: chosenTitle,
            email: userInformation.email,
            first_name: userInformation.firstname,
            last_name: userInformation.lastname,
            phone: userInformation.phone,
          },
          review_link: "",
          restaurant: restaurantID as number,
          internal_note: "",
          occasion: Number(userInformation.occasion) || null,
          source: "WIDGET",
          status: "PENDING",
          allergies: userInformation.allergies,
          preferences: userInformation.preferences,
          area: areaSelected,
          commenter: userInformation.preferences,
          date: format(data.reserveDate, "yyyy-MM-dd"),
          time: data.time + ":00",
          number_of_guests: data.guests,
          // Payment and billing information (if payment is enabled)
          ...(PAYMENT_ENABLED && {
            // payment_info: {
            //   card_number: cardInfo.cardNumber.replace(/\s/g, ''), // Remove spaces
            //   cardholder_name: cardInfo.cardholderName,
            //   expiry_date: cardInfo.expiryDate,
            //   cvv: cardInfo.cvv
            // },
            billing_address: {
              first_name: billingInfo.firstName,
              last_name: billingInfo.lastName,
              address: billingInfo.address,
              city: billingInfo.city,
              zip_code: billingInfo.zipCode,
              country: billingInfo.country
            },
            browser_info: {
              user_agent: browserInfo.userAgent,
              screen_height: browserInfo.screenHeight,
              screen_width: browserInfo.screenWidth,
              browser_color_depth: browserInfo.colorDepth
            }
          })
        },
      },
      {
        onSuccess: (responseData) => {
          const createdReservation = responseData?.data
          const reservationId = createdReservation?.reservation.id
          
          if (reservationId) {
            const numericReservationId = Number(reservationId)
            setReservationId(numericReservationId)
            
            // Check if payment is required based on conditions
            const currentGuestCount = data.guests
            const shouldRequirePayment = isPaymentRequired(currentGuestCount)
            
            if (shouldRequirePayment) {
              // Payment is required, initiate payment and go to step 4
              initiatePayment(numericReservationId)
              setStep(4) // Move to payment step
            } else {
              // No payment required, go directly to success step
              setIsLoading(false)
              clearFormDataCache()
              setStep(5)
            }
          } else {
            setIsLoading(false)
            clearFormDataCache()
            setStep(5)
          }
        },
        onError: () => {
          setIsLoading(false)
          setServerError(t("reservationWidget.errors.serverError"))
        },
      },
    )
  }

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

            {/* Check and showing a warning message */}
            {isPaymentRequired(data.guests) && (
              <div className="bg-softbluetheme mx-4 mt-4 rounded-xl flex justify-between  text-bluetheme p-2">
                <div className="flex gap-2 justify-start items-center" role="alert">
                  <BadgeInfo className="inline-block mx-2" />
                  <div>
                    <p className="font-bold">{t("reservationWidget.payment.paymentNoticeTitle","Prepayment is required ")}</p>
                    <p className="text-sm">{t("reservationWidget.payment.paymentNoticeDescription", "The establishment offers a prepayment for this reservation.")}</p>
                  </div>
                  
                </div>
                <div className="" >
                  <div className="flex-1 font-[900] p-2  rounded-lg flex items-center justify-center w-fit h-fit text-bluetheme">

                    {calculateTotalAmount()}
                  </div>
                </div>
              </div>
            )}  
            {/* Reservation Form Section */}
            <div className="p-6">
              {step === 1 && (
                <>
                  {/* Date/Time/Guests Selection */}
                  <div className="mb-6">
                    <div
                      onClick={() => setShowProcess(true)}
                      className="grid grid-cols-3 gap-4 p-4 bg-[#f9f9f9] dark:bg-darkthemeitems rounded-lg cursor-pointer hover:bg-[#f0f0f0] dark:hover:bg-bgdarktheme2 transition-colors"
                    >
                      <div className="text-center">
                        <span className="block text-sm font-[600] dark:text-greentheme text-greentheme">
                          {t("reservationWidget.reservation.date")}
                        </span>
                        <span className="block text-sm font-medium mt-1">
                          {formatedDate() || "----/--/--"}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="block text-sm font-[600] dark:text-greentheme text-greentheme">
                          {t("reservationWidget.reservation.time")}
                        </span>
                        <span className="block text-sm font-medium mt-1">
                          {data.time || "--:--"}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="block text-sm font-[600] dark:text-greentheme text-greentheme">
                          {t("reservationWidget.reservation.guests")}
                        </span>
                        <span className="block text-sm font-medium mt-1">
                          {data.guests || "--"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Book Now Button */}
                  <button
                    onClick={() => setStep(2)}
                    disabled={!data.reserveDate || !data.time || !data.guests}
                    className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${!data.reserveDate || !data.time || !data.guests
                      ? "bg-[#88AB61] opacity-50 cursor-not-allowed"
                      : "bg-[#88AB61] hover:bg-[#769c4f] text-white"
                      }`}
                  >
                    {t("reservationWidget.reservation.bookNow")}
                  </button>

                  {/* Menu Preview Button */}
                  {widgetInfo?.menu_file && (
                    <button
                      onClick={() => window.open(widgetInfo.menu_file, "_blank")}
                      className="w-full mt-4 py-3 px-4 rounded-md font-medium border border-[#88AB61] text-[#88AB61] hover:bg-[#f0f7e6] dark:hover:bg-darkthemeitems transition-colors flex items-center justify-center gap-2"
                    >
                      <span>{t("reservationWidget.reservation.previewMenu")}</span>
                      <ScreenShareIcon size={18} />
                    </button>
                  )}
                  
                </>
              )}

              {/* Step 2 - Form */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">{t("reservationWidget.form.yourInformation")}</h2>
                  <form onSubmit={handleSubmit} className="space-y-1">
                    {/* ...existing form content... */}
                    <div className="flex items-center gap-2 mb-4">
                      <p className="text-sm font-bold text-[#555555] dark:text-[#cccccc]">
                        {t("reservationWidget.form.title")}
                      </p>
                      <label htmlFor="Mr" className="text-sm font-medium text-[#555555] dark:text-[#cccccc]">
                        {t("reservationWidget.form.mr")}
                      </label>
                      <input
                        type="checkbox"
                        id="Mr"
                        className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61]"
                        checked={chosenTitle === "mr"}
                        onChange={() => setChosenTitle("mr")}
                      />
                      <label htmlFor="Mrs" className="text-sm font-medium text-[#555555] dark:text-[#cccccc]">
                        {t("reservationWidget.form.mrs")}
                      </label>
                      <input
                        type="checkbox"
                        id="Mrs"
                        className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61]"
                        checked={chosenTitle === "mrs"}
                        onChange={() => setChosenTitle("mrs")}
                      />
                      <label htmlFor="Ms" className="text-sm font-medium text-[#555555] dark:text-[#cccccc]">
                        {t("reservationWidget.form.ms")}
                      </label>
                      <input
                        type="checkbox"
                        id="Ms"
                        className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61]"
                        checked={chosenTitle === "ms"}
                        onChange={() => setChosenTitle("ms")}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="firstname"
                        className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1"
                      >
                        {t("reservationWidget.form.firstName")} *
                      </label>
                      <input
                        id="firstname"
                        type="text"
                        placeholder={t("reservationWidget.form.firstNamePlaceholder")}
                        value={userInformation.firstname}
                        onChange={(e) => setUserInformation(prev => ({ ...prev, firstname: e.target.value }))}
                        className={`w-full p-3 rounded-md border ${formErrors.firstname ? "border-red-500" : "border-[#dddddd] dark:border-[#444444]"} bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]`}
                      />
                      {formErrors.firstname && <p className="mt-1 text-sm text-red-500">{formErrors.firstname}</p>}
                    </div>
                    <div>
                      <label
                        htmlFor="lastname"
                        className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1"
                      >
                        {t("reservationWidget.form.lastName")} *
                      </label>
                      <input
                        id="lastname"
                        type="text"
                        placeholder={t("reservationWidget.form.lastNamePlaceholder")}
                        value={userInformation.lastname}
                        onChange={(e) => setUserInformation(prev => ({ ...prev, lastname: e.target.value }))}
                        className={`w-full p-3 rounded-md border ${formErrors.lastname ? "border-red-500" : "border-[#dddddd] dark:border-[#444444]"} bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]`}
                      />
                      {formErrors.lastname && <p className="mt-1 text-sm text-red-500">{formErrors.lastname}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">
                        {t("reservationWidget.form.email")} *
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder={t("reservationWidget.form.emailPlaceholder")}
                        value={userInformation.email}
                        onChange={(e) => setUserInformation(prev => ({ ...prev, email: e.target.value }))}
                        className={`w-full p-3 rounded-md border ${formErrors.email ? "border-red-500" : "border-[#dddddd] dark:border-[#444444]"} bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]`}
                      />
                      {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">
                        {t("reservationWidget.form.phone")} *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder={t("reservationWidget.form.phonePlaceholder")}
                        value={userInformation.phone}
                        onChange={(e) => setUserInformation(prev => ({ ...prev, phone: e.target.value }))}
                        className={`w-full p-3 rounded-md border ${formErrors.phone ? "border-red-500" : "border-[#dddddd] dark:border-[#444444]"} bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]`}
                      />
                      {formErrors.phone && <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>}
                    </div>
                    <div>
                      <label
                        htmlFor="allergies"
                        className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1"
                      >
                        {t("reservationWidget.form.allergies")}
                      </label>
                      <textarea
                        id="allergies"
                        placeholder={t("reservationWidget.form.allergiesPlaceholder")}
                        value={userInformation.allergies}
                        onChange={(e) => setUserInformation(prev => ({ ...prev, allergies: e.target.value }))}
                        className="w-full p-3 rounded-md border border-[#dddddd] dark:border-[#444444] bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="preferences"
                        className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1"
                      >
                        {t("reservationWidget.form.preferences")}
                      </label>
                      <textarea
                        id="preferences"
                        placeholder={t("reservationWidget.form.preferencesPlaceholder")}
                        value={userInformation.preferences}
                        onChange={(e) => setUserInformation(prev => ({ ...prev, preferences: e.target.value }))}
                        className="w-full p-3 rounded-md border border-[#dddddd] dark:border-[#444444] bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="occasion"
                        className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1"
                      >
                        {t("reservationWidget.form.occasion")}
                      </label>
                      <select
                        id="occasion"
                        value={userInformation.occasion}
                        onChange={(e) => setUserInformation(prev => ({ ...prev, occasion: e.target.value }))}
                        className="w-full p-3 rounded-md border border-[#dddddd] dark:border-[#444444] bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]"
                      >
                        <option value="0">{t("reservationWidget.form.occasionPlaceholder")}</option>
                        {(occasions ?? []).map((occasion: BaseRecord) => (
                          <option key={occasion.id} value={occasion.id}>
                            {occasion.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {widgetInfo?.enbale_area_selection && (
                      <div>
                        <label
                          htmlFor="floors"
                          className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1"
                        >
                          {t("reservationWidget.form.areas")}
                        </label>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {areas.map((floor: Area, index: number) => (
                            <label
                              key={index}
                              className="inline-flex items-center bg-softgreentheme text-greentheme p-2 rounded-md cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                value={floor.id}
                                checked={areaSelected === floor.id}
                                onChange={() => setAreaSelected(floor.id)}
                                className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61]"
                              />
                              <span className="ml-2 text-sm">{floor.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-start pt-2 border-t border-[#dddddd] dark:border-[#444444]">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={checkedConditions}
                        onChange={() => setCheckedConditions(!checkedConditions)}
                        className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61]"
                      />
                      <label htmlFor="terms" className="ml-2 block text-sm text-[#555555] dark:text-[#cccccc]">
                        {t("reservationWidget.form.agreeToTerms")}{" "}
                        <Link to="/terms-and-conditions" className="underline font-medium text-[#88AB61]" target="_blank">
                          {t("reservationWidget.form.termsAndConditions")}
                        </Link>
                      </label>
                    </div>
                    {widgetInfo?.enable_dress_code && (
                      <div className="flex items-start pt-2">
                        <input
                          type="checkbox"
                          id="DressCode"
                          checked={checkedDressCode}
                          onChange={() => setCheckedDressCode(!checkedDressCode)}
                          className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61]"
                        />
                        <label htmlFor="DressCode" className="ml-2 block text-sm text-[#555555] dark:text-[#cccccc]">
                          {t("reservationWidget.form.agreeToDressCode")} (
                          {widgetInfo?.dress_code && widgetInfo.dress_code.length > 100
                            ? `${widgetInfo.dress_code.substring(0, 100)}... `
                            : widgetInfo?.dress_code || t("reservationWidget.form.noDressCode")}
                          {widgetInfo?.dress_code && widgetInfo.dress_code.length > 100 && (
                            <button
                              type="button"
                              onClick={() => setDressCodePopupOpen(true)}
                              className="underline font-medium text-[#88AB61]"
                            >
                              {t("reservationWidget.common.readMore")}
                            </button>
                          )}
                          )
                        </label>
                      </div>
                    )}
                    <div className="flex gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-3 px-4 rounded-md font-medium border border-[#dddddd] dark:border-[#444444] hover:bg-[#f5f5f5] dark:hover:bg-bgdarktheme2 transition-colors"
                      >
                        {t("reservationWidget.common.back")}
                      </button>
                      <button
                        type="submit"
                        disabled={!checkedConditions || (widgetInfo?.enable_dress_code ? !checkedDressCode : false)}
                        className={`bg-[#88AB61] flex-1 py-3 px-4 rounded-md font-medium transition-colors ${!checkedConditions || (widgetInfo?.enable_dress_code ? !checkedDressCode : false)
                          ? "bg-[#88AB61] opacity-50 cursor-not-allowed"
                          : "hover:bg-[#769c4f] text-white"
                          }`}
                      >
                        {t("reservationWidget.common.continue")}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 3 - confirmation */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">{t("reservationWidget.payment.reservationSummary")}</h2>
                  <div className="space-y-4 mb-6">
                    <div className="bg-[#f9f9f9] dark:bg-darkthemeitems rounded-lg p-4">
                      {/* <h3 className="text-lg font-medium mb-4">{t("reservationWidget.payment.reservationSummary")}</h3> */}
                      <div className="space-y-3">
                        {/* Personal Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.name")}: </span>
                            <span className="font-medium">{chosenTitle ? chosenTitle + ". " : ""}{userInformation.firstname} {userInformation.lastname}</span>
                          </div>
                          <div>
                            <span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.email")}: </span>
                            <span>{userInformation.email}</span>
                          </div>
                          <div>
                            <span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.phone")}: </span>
                            <span>{userInformation.phone}</span>
                          </div>
                        </div>
                        
                        {/* Reservation Details */}
                        <div className="border-t border-[#dddddd] dark:border-[#444444] pt-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.dateTime")}: </span>
                              <span className="font-medium">{format(data.reserveDate, "MMMM d, yyyy")} {t("reservationWidget.confirmation.at")} {data.time}</span>
                            </div>
                            <div>
                              <span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.guests")}: </span>
                              <span className="font-medium">{data.guests} {data.guests === 1 ? t("reservationWidget.confirmation.person") : t("reservationWidget.confirmation.people")}</span>
                            </div>
                          </div>
                        </div>

                        {/* Optional Information */}
                        {(userInformation.occasion || areaSelected || userInformation.allergies || userInformation.preferences) && (
                          <div className="border-t border-[#dddddd] dark:border-[#444444] pt-3">
                            <div className="space-y-2 text-sm">
                              {userInformation.occasion && userInformation.occasion !== "0" && (
                                <div>
                                  <span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.occasion")}: </span>
                                  <span>{occasions?.find((occasion: BaseRecord) => occasion.id === Number(userInformation.occasion))?.name}</span>
                                </div>
                              )}
                              {areaSelected && (
                                <div>
                                  <span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.form.areas")}: </span>
                                  <span>{areas.find((area: Area) => area.id === areaSelected)?.name}</span>
                                </div>
                              )}
                              {userInformation.allergies && (
                                <div>
                                  <span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.allergies")}: </span>
                                  <span className="text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2 py-1 rounded">{userInformation.allergies}</span>
                                </div>
                              )}
                              {userInformation.preferences && (
                                <div>
                                  <span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.preferences")}: </span>
                                  <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">{userInformation.preferences}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    
                    
                    {/* Credit Card Information Section - COMMENTED OUT */}
                    {/* <div className="space-y-3">
                      <h3 className="text-lg font-medium">{t("reservationWidget.payment.creditCardInfo")}</h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="cardholderName" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">
                            {t("reservationWidget.payment.cardholderName")} *
                          </label>
                          <input
                            id="cardholderName"
                            type="text"
                            placeholder={t("reservationWidget.payment.cardholderNamePlaceholder")}
                            value={cardInfo.cardholderName}
                            onChange={(e) => setCardInfo(prev => ({ ...prev, cardholderName: e.target.value }))}
                            className={`w-full p-3 rounded-md border ${cardErrors.cardholderName ? "border-red-500" : "border-[#dddddd] dark:border-[#444444]"} bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]`}
                          />
                          {cardErrors.cardholderName && <p className="mt-1 text-sm text-red-500">{cardErrors.cardholderName}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="cardNumber" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">
                            {t("reservationWidget.payment.cardNumber")} *
                          </label>
                          <input
                            id="cardNumber"
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={cardInfo.cardNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim()
                              if (value.replace(/\s/g, '').length <= 16) {
                                setCardInfo(prev => ({ ...prev, cardNumber: value }))
                              }
                            }}
                            className={`w-full p-3 rounded-md border ${cardErrors.cardNumber ? "border-red-500" : "border-[#dddddd] dark:border-[#444444]"} bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]`}
                          />
                          {cardErrors.cardNumber && <p className="mt-1 text-sm text-red-500">{cardErrors.cardNumber}</p>}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">
                              {t("reservationWidget.payment.expiryDate")} *
                            </label>
                            <input
                              id="expiryDate"
                              type="text"
                              placeholder="MM/YY"
                              value={cardInfo.expiryDate}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '')
                                if (value.length >= 2) {
                                  value = value.substring(0, 2) + '/' + value.substring(2, 4)
                                }
                                if (value.length <= 5) {
                                  setCardInfo(prev => ({ ...prev, expiryDate: value }))
                                }
                              }}
                              className={`w-full p-3 rounded-md border ${cardErrors.expiryDate ? "border-red-500" : "border-[#dddddd] dark:border-[#444444]"} bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]`}
                            />
                            {cardErrors.expiryDate && <p className="mt-1 text-sm text-red-500">{cardErrors.expiryDate}</p>}
                          </div>
                          
                          <div>
                            <label htmlFor="cvv" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">
                              {t("reservationWidget.payment.cvv")} *
                            </label>
                            <input
                              id="cvv"
                              type="text"
                              placeholder="123"
                              value={cardInfo.cvv}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '')
                                if (value.length <= 4) {
                                  setCardInfo(prev => ({ ...prev, cvv: value }))
                                }
                              }}
                              className={`w-full p-3 rounded-md border ${cardErrors.cvv ? "border-red-500" : "border-[#dddddd] dark:border-[#444444]"} bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]`}
                            />
                            {cardErrors.cvv && <p className="mt-1 text-sm text-red-500">{cardErrors.cvv}</p>}
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                {t("reservationWidget.payment.securePayment")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div> */}
                    
                    {/* Billing Address Section */}
                    {/* <div className="space-y-3">
                      <h3 className="text-lg font-medium">{t("reservationWidget.payment.billingAddress")}</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="billingFirstName" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">
                              {t("reservationWidget.payment.firstName")} *
                            </label>
                            <input
                              id="billingFirstName"
                              type="text"
                              placeholder={t("reservationWidget.payment.firstNamePlaceholder")}
                              value={billingInfo.firstName}
                              onChange={(e) => setBillingInfo(prev => ({ ...prev, firstName: e.target.value }))}
                              className={`w-full p-3 rounded-md border ${billingErrors.firstName ? "border-red-500" : "border-[#dddddd] dark:border-[#444444]"} bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]`}
                            />
                            {billingErrors.firstName && <p className="mt-1 text-sm text-red-500">{billingErrors.firstName}</p>}
                          </div>
                          
                          <div>
                            <label htmlFor="billingLastName" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">
                              {t("reservationWidget.payment.lastName")} *
                            </label>
                            <input
                              id="billingLastName"
                              type="text"
                              placeholder={t("reservationWidget.payment.lastNamePlaceholder")}
                              value={billingInfo.lastName}
                              onChange={(e) => setBillingInfo(prev => ({ ...prev, lastName: e.target.value }))}
                              className={`w-full p-3 rounded-md border ${billingErrors.lastName ? "border-red-500" : "border-[#dddddd] dark:border-[#444444]"} bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]`}
                            />
                            {billingErrors.lastName && <p className="mt-1 text-sm text-red-500">{billingErrors.lastName}</p>}
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="billingAddress" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">
                            {t("reservationWidget.payment.address")} *
                          </label>
                          <input
                            id="billingAddress"
                            type="text"
                            placeholder={t("reservationWidget.payment.addressPlaceholder")}
                            value={billingInfo.address}
                            onChange={(e) => setBillingInfo(prev => ({ ...prev, address: e.target.value }))}
                            className={`w-full p-3 rounded-md border ${billingErrors.address ? "border-red-500" : "border-[#dddddd] dark:border-[#444444]"} bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]`}
                          />
                          {billingErrors.address && <p className="mt-1 text-sm text-red-500">{billingErrors.address}</p>}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="billingCity" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">
                              {t("reservationWidget.payment.city")}
                            </label>
                            <input
                              id="billingCity"
                              type="text"
                              placeholder={t("reservationWidget.payment.cityPlaceholder")}
                              value={billingInfo.city}
                              onChange={(e) => setBillingInfo(prev => ({ ...prev, city: e.target.value }))}
                              className="w-full p-3 rounded-md border border-[#dddddd] dark:border-[#444444] bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="billingZipCode" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">
                              {t("reservationWidget.payment.zipCode")}
                            </label>
                            <input
                              id="billingZipCode"
                              type="text"
                              placeholder={t("reservationWidget.payment.zipCodePlaceholder")}
                              value={billingInfo.zipCode}
                              onChange={(e) => setBillingInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                              className="w-full p-3 rounded-md border border-[#dddddd] dark:border-[#444444] bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="billingCountry" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">
                            {t("reservationWidget.payment.country")} *
                          </label>
                          <input
                            id="billingCountry"
                            type="text"
                            placeholder={t("reservationWidget.payment.countryPlaceholder")}
                            value={billingInfo.country}
                            onChange={(e) => setBillingInfo(prev => ({ ...prev, country: e.target.value }))}
                            className={`w-full p-3 rounded-md border ${billingErrors.country ? "border-red-500" : "border-[#dddddd] dark:border-[#444444]"} bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]`}
                          />
                          {billingErrors.country && <p className="mt-1 text-sm text-red-500">{billingErrors.country}</p>}
                        </div>
                      </div>
                    </div> */}
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 px-4 rounded-md font-medium border border-[#dddddd] dark:border-[#444444] hover:bg-[#f5f5f5] dark:hover:bg-bgdarktheme2 transition-colors"
                    >
                      {t("reservationWidget.common.back")}
                    </button>
                    <button
                      onClick={handleConfirmation}
                      disabled={isLoading}
                      className="flex-1 py-3 px-4 rounded-md font-medium bg-[#88AB61] hover:bg-[#769c4f] text-white transition-colors disabled:opacity-50 flex justify-center items-center"
                    >
                      {isLoading ? (
                        <>
                          <LoaderCircle className="animate-spin mr-2" size={18} />
                          {t("reservationWidget.confirmation.processing")}
                        </>
                      ) : (
                        t("reservationWidget.payment.proceedToConfirmation")
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4 - Payment  */}
              {step === 4 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 text-center">{t("reservationWidget.payment.title")}</h2>
                  
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#f0f7e6] dark:bg-bgdarktheme2 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckIcon size={32} />
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-[#88AB61]">{t("reservationWidget.payment.reservationCreated")}</h3>
                    <p className="text-sm text-[#555555] dark:text-[#cccccc] mb-4">
                      {t("reservationWidget.payment.paymentRequired")}
                    </p>
                  </div>

                  <div className="space-y-4 mb-6">
                    {paymentData && (
                      <div className="bg-[#f0f7e6] dark:bg-bgdarktheme2 rounded-lg p-4">
                        <div className="bg-white dark:bg-darkthemeitems rounded-lg p-4 border border-[#dddddd] dark:border-[#444444]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{t("reservationWidget.payment.amountToPay")}</span>
                            <span className="font-bold text-[#88AB61] text-lg">
                              {paymentData.amount || '50.00'} MAD
                            </span>
                          </div>
                          {reservationId && (
                            <div className="text-xs text-[#555555] dark:text-[#cccccc] mt-2">
                              {t("reservationWidget.payment.reservationNumber")}: #{reservationId}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {!paymentData && isLoading && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-center justify-center">
                          <LoaderCircle className="animate-spin mr-2" size={18} />
                          <span className="text-sm">{t("reservationWidget.payment.preparingPayment")}</span>
                        </div>
                      </div>
                    )}
                    
                    {paymentError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-md">
                        <p className="font-medium">{t("reservationWidget.payment.errorTitle")}:</p>
                        <p className="text-sm mt-1">{paymentError}</p>
                      </div>
                    )}
                    
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            {t("reservationWidget.payment.paymentNotice")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        // Cancel reservation and go to success page
                        setStep(5)
                      }}
                      className="flex-1 py-3 px-4 rounded-md font-medium border border-[#dddddd] dark:border-[#444444] hover:bg-[#f5f5f5] dark:hover:bg-bgdarktheme2 transition-colors"
                    >
                      {t("reservationWidget.payment.cancelPayment")}
                    </button>
                    <button
                      onClick={() => submitFormPost(paymentData?.pay_url, paymentData?.form_data)}
                      disabled={isLoading}
                      className="flex-1 py-3 px-4 rounded-md font-medium bg-[#88AB61] hover:bg-[#769c4f] text-white transition-colors flex justify-center items-center disabled:opacity-50"
                    >
                      {t("reservationWidget.payment.proceedToPayment")}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5 - Success */}
              {step === 5 && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-[#f0f7e6] dark:bg-bgdarktheme2 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckIcon size={32} />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">
                    {widgetInfo?.auto_confirmation
                      ? t("reservationWidget.success.confirmed")
                      : t("reservationWidget.success.completed")}
                  </h2>
                  <p className="font-[600] dark:text-greentheme text-greentheme mb-6">
                    {t("reservationWidget.success.message")}
                  </p>
                  <button
                    onClick={() => {
                      clearFormDataCache() // Clear cache when starting new reservation
                      window.location.reload()
                    }}
                    className="py-3 px-6 rounded-md font-medium bg-[#88AB61] hover:bg-[#769c4f] text-white transition-colors"
                  >
                    {t("reservationWidget.success.makeAnother")}
                  </button>
                </div>
              )}

              {/* Step 6 - Unavailable */}
              {step === 6 && (
                <div className="text-center py-4">
                  <h2 className="text-2xl font-semibold mb-4">
                    {widgetInfo?.disabled_title || t("reservationWidget.unavailable.title")}
                  </h2>
                  <p className="font-[600] dark:text-greentheme text-greentheme">
                    {widgetInfo?.disabled_description || t("reservationWidget.unavailable.description")}
                  </p>
                </div>
              )}
            </div>

            {/* Description Section */}
            {step === 1 && widgetInfo?.content && (
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
            {step === 1 && (
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

export default WidgetPage
