"use client"
import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Logo from "../../components/header/Logo"
import { LoaderCircle, ScreenShareIcon, ChevronDown } from "lucide-react"
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
          <div className="absolute right-0 bottom-full mt-2 bg-white dark:bg-darkthemeitems rounded-lg shadow-lg border border-[#dddddd] dark:border-[#444444] z-50 min-w-[160px]">
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
      setStep(4)
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

  const [serverError, setServerError] = useState<string>()
  const [chosenTitle, setChosenTitle] = useState<"mr" | "mrs" | "ms">()

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
        },
      },
      {
        onSuccess: () => {
          setIsLoading(false)
          setStep(5)
        },
        onError: (error) => {
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

  const [checkedConditions, setCheckedConditions] = useState<boolean>(false)
  const [checkedDressCode, setCheckedDressCode] = useState<boolean>(false)
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


  return (
    <div className={`overflow-y-auto min-h-screen max-h-screen bg-white dark:bg-bgdarktheme2 text-black dark:text-white ${preferredLanguage === "ar" ? "rtl" : ""}`}>

      {/* Hero Section with Background Image and Logo */}
      <div className="fixed w-full h-[80vh] min-h-[500px] overflow-hidden">
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
      <div className="relative pt-[350px]">
        {/* White Card Container */}
        <div className="w-full max-w-[800px] lg:max-w-[800px] md:max-w-[600px] mx-auto px-0">
          <div className="bg-white dark:bg-darkthemeitems rounded-t-3xl shadow-2xl overflow-hidden">

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

              {/* Step 4 - Confirmation */}
              {step === 4 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">{t("reservationWidget.confirmation.title")}</h2>
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium font-[600] dark:text-greentheme text-greentheme">
                          {t("reservationWidget.confirmation.name")}
                        </h3>
                        <p className="text-base">
                          {chosenTitle ? chosenTitle + ". " : ""}
                          {userInformation.firstname} {userInformation.lastname}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium font-[600] dark:text-greentheme text-greentheme">
                          {t("reservationWidget.confirmation.email")}
                        </h3>
                        <p className="text-base">{userInformation.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium font-[600] dark:text-greentheme text-greentheme">
                          {t("reservationWidget.confirmation.phone")}
                        </h3>
                        <p className="text-base">{userInformation.phone}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium font-[600] dark:text-greentheme text-greentheme">
                          {t("reservationWidget.confirmation.dateTime")}
                        </h3>
                        <p className="text-base">
                          {format(data.reserveDate, "MMMM d, yyyy")} {t("reservationWidget.confirmation.at")} {data.time}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium font-[600] dark:text-greentheme text-greentheme">
                          {t("reservationWidget.confirmation.guests")}
                        </h3>
                        <p className="text-base">
                          {data.guests}{" "}
                          {data.guests === 1
                            ? t("reservationWidget.confirmation.person")
                            : t("reservationWidget.confirmation.people")}
                        </p>
                      </div>
                      {userInformation.occasion && (
                        <div>
                          <h3 className="text-sm font-medium font-[600] dark:text-greentheme text-greentheme">
                            {t("reservationWidget.confirmation.occasion")}
                          </h3>
                          <p className="text-base">
                            {
                              occasions?.find((occasion: BaseRecord) => occasion.id === Number(userInformation.occasion))
                                ?.name
                            }
                          </p>
                        </div>
                      )}
                    </div>
                    {userInformation.allergies && (
                      <div>
                        <h3 className="text-sm font-medium font-[600] dark:text-greentheme text-greentheme">
                          {t("reservationWidget.confirmation.allergies")}
                        </h3>
                        <p className="text-base">{userInformation.allergies}</p>
                      </div>
                    )}
                    {userInformation.preferences && (
                      <div>
                        <h3 className="text-sm font-[600] dark:text-greentheme text-greentheme">
                          {t("reservationWidget.confirmation.preferences")}
                        </h3>
                        <p className="text-base">{userInformation.preferences}</p>
                      </div>
                    )}
                  </div>
                  {serverError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-md mb-4">
                      {serverError}
                    </div>
                  )}
                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 px-4 rounded-md font-medium border border-[#dddddd] dark:border-[#444444] hover:bg-[#f5f5f5] dark:hover:bg-bgdarktheme2 transition-colors"
                    >
                      {t("reservationWidget.confirmation.editDetails")}
                    </button>
                    <button
                      onClick={handleConfirmation}
                      disabled={isLoading}
                      className="flex-1 py-3 px-4 rounded-md font-medium bg-[#88AB61] hover:bg-[#769c4f] text-white transition-colors flex justify-center items-center"
                    >
                      {isLoading ? (
                        <>
                          <LoaderCircle className="animate-spin mr-2" size={18} />
                          {t("reservationWidget.confirmation.processing")}
                        </>
                      ) : (
                        t("reservationWidget.confirmation.confirm")
                      )}
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
                    onClick={() => window.location.reload()}
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

            {/* Language and Theme Switch Section (Green section from image) */}
            <div className="bg-[#88AB61]/10 dark:bg-[#88AB61]/20 px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleDarkMode}
                  aria-label={t("reservationWidget.common.toggleDarkMode")}
                  className="p-2 rounded-lg hover:bg-[#88AB61]/20 dark:hover:bg-[#88AB61]/30 transition-colors"
                >
                  <SunIcon size={20} className="dark:hidden text-[#88AB61]" />
                  <MoonIcon size={20} className="hidden dark:block text-[#88AB61]" />
                </button>
                <div className="flex items-center gap-4">
                  <LanguageSelector />
                </div>
              </div>
            </div>

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
              getDateTime={(data: any) => setData(data)}
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
