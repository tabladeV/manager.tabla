"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { type BaseRecord, useCreate, useList, useOne } from "@refinedev/core"
import { useTranslation } from "react-i18next"
import { ChevronDown } from "lucide-react"
import Logo from "../../components/header/Logo"
import spanish from "../../assets/spanish.png"
import arabic from "../../assets/arabic.jpg"
import english from "../../assets/english.png"
import french from "../../assets/french.png"
import { useDateContext } from "../../context/DateContext"

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
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-[#f5f5f5] dark:hover:bg-[#333333] transition-colors"
        aria-label="Select language"
      >
        <img
          src={currentLanguage.icon || "/placeholder.svg"}
          alt={currentLanguage.name}
          className="w-6 h-6 rounded-sm object-cover"
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
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f5f5f5] dark:hover:bg-bgdarktheme2 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  currentLanguage.code === language.code ? "bg-[#f0f7e6] dark:bg-bgdarktheme2" : ""
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

const ReviewPage = () => {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const { restaurant } = useParams()
  const { token } = useParams()

  // Set page title
  useEffect(() => {
    document.title = t("reviewPage.page.title")
  }, [t])

  const { mutate: createReview } = useCreate({
    errorNotification(error, values, resource) {
      return {
        type: "error",
        message: error?.formattedMessage,
      }
    },
  })

  const [errorMessage, setErrorMessage] = useState("")

  const {
    data: reviewAccess,
    isLoading: loading,
    error: err,
  } = useList({
    resource: `api/v1/bo/subdomains/public/cutomer/reviews/${token}`,
    queryOptions: {
      retry: 1,
      onSuccess: (data) => {
        console.log(data, "data")
      },
      onError: (error) => {
        setErrorMessage(error?.formattedMessage)
      },
    },
    errorNotification(error, values, resource) {
      return {
        type: "error",
        message: error?.formattedMessage,
      }
    },
  })

  const {
    data: res,
    isLoading,
    error,
  } = useOne({
    resource: `api/v1/bo/subdomains/public/cutomer/reviews`,
    id: "",
    queryOptions: {
      onSuccess: (data) => {
        console.log(data, "data")
      },
    },
    errorNotification(error, values, resource) {
      return {
        type: "error",
        message: error?.formattedMessage,
      }
    },
  })

  const [restaurantData, setRestaurantData] = useState<BaseRecord>()

  useEffect(() => {
    if (res?.data) {
      setRestaurantData(res.data)
    }
  }, [res])

  const [brightService, setBrightService] = useState(0)
  const [brightAmbiance, setBrightAmbiance] = useState(0)
  const [brightFood, setBrightFood] = useState(0)
  const [brightValueForMoney, setBrightValueForMoney] = useState(0)
  const [email, setEmail] = useState("")
  const [reviewText, setReviewText] = useState("")

  const renderStars = (count: number, activeCount: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="cursor-pointer" onClick={() => setStep(i + 1)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 ${i < activeCount ? "text-yellow-500" : "text-gray-300"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </span>
    ))
  }

  const handleBrightness = (num: number, category: "ambiance" | "service" | "food" | "valueForMoney") => {
    category === "ambiance" && setBrightAmbiance(num)
    category === "service" && setBrightService(num)
    category === "food" && setBrightFood(num)
    category === "valueForMoney" && setBrightValueForMoney(num)
  }

  const [reviewData, setReviewData] = useState({
    email: "",
    service: 0,
    ambiance: 0,
    food: 0,
    valueForMoney: 0,
    reviewText: "",
  })

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setReviewData({
      ...reviewData,
      email,
      service: brightService,
      ambiance: brightAmbiance,
      food: brightFood,
      valueForMoney: brightValueForMoney,
      reviewText,
    })
    createReview({
      resource: `api/v1/bo/reservations/review/${token}`,
      values: {
        service_rating: brightService,
        ambience_rating: brightAmbiance,
        food_rating: brightFood,
        value_for_money: brightValueForMoney,
        description: reviewText,
      },
    })
    setStep(2)
  }

    const { preferredLanguage } = useDateContext()
  

  return (
    <div className={`h-[100vh] ${
        preferredLanguage === "ar" ? "rtl" : ""
      } dark:bg-bgdarktheme2 dark:text-white bg-white`}>
      <div className="h-[10vh] w-full flex items-center justify-between px-10 shadow-md border-b border-softgreytheme dark:border-darkthemeitems dark:bg-bgdarktheme bg-whitetheme">
        <Logo className="horizontal" nolink={true} />
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <LanguageSelector />
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label={t("reviewPage.common.toggleDarkMode")}
            className="hover:bg-softgreentheme transition-colors duration-200 my-[1em] p-1 w-[40px] h-[40px] flex justify-center items-center rounded-full"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="dark:hidden"
            >
              <path
                d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM11 1V5H13V1H11ZM11 19V23H13V19H11ZM23 11H19V13H23V11ZM5 11H1V13H5V11ZM16.24 17.66L18.71 20.13L20.12 18.72L17.65 16.25L16.24 17.66ZM3.87 5.28L6.34 7.75L7.75 6.34L5.28 3.87L3.87 5.28ZM6.34 16.24L3.87 18.71L5.28 20.12L7.75 17.65L6.34 16.24ZM18.72 3.87L16.25 6.34L17.66 7.75L20.13 5.28L18.72 3.87Z"
                fill="#88AB61"
              />
            </svg>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="hidden dark:block "
            >
              <path
                d="M12.0581 20C9.83544 20 7.94644 19.2223 6.39111 17.667C4.83577 16.1117 4.05811 14.2227 4.05811 12C4.05811 9.97401 4.71811 8.21734 6.03811 6.73001C7.35811 5.24267 8.99277 4.36467 10.9421 4.09601C10.9961 4.09601 11.0491 4.09801 11.1011 4.10201C11.1531 4.10601 11.2041 4.11167 11.2541 4.11901C10.9168 4.58967 10.6498 5.11301 10.4531 5.68901C10.2564 6.26501 10.1581 6.86867 10.1581 7.50001C10.1581 9.27801 10.7801 10.789 12.0241 12.033C13.2681 13.277 14.7794 13.8993 16.5581 13.9C17.1921 13.9 17.7964 13.8017 18.3711 13.605C18.9458 13.4083 19.4618 13.1413 19.9191 12.804C19.9271 12.854 19.9328 12.905 19.9361 12.957C19.9394 13.009 19.9414 13.062 19.9421 13.116C19.6861 15.0647 18.8144 16.699 17.3271 18.019C15.8398 19.339 14.0841 19.9993 12.0581 20Z"
                fill="#88AB61"
              />
            </svg>
          </button>
        </div>
      </div>
      {loading ? (
        <div className="w-full flex justify-center gap-6 p-6">
          <div className="md:w-[40%] items-center w-full pl-10 lt-md:pl-0 lt-md:p-0 mx-auto mt-10 flex flex-col gap-5 justify-center">
            <div className="animate-pulse flex items-center justify-center w-[300px] h-[40px] rounded-lg dark:bg-bgdarktheme bg-softgreytheme"></div>
            <div className="animate-pulse flex items-center justify-center w-[400px] h-[30px] rounded-lg dark:bg-bgdarktheme bg-softgreytheme"></div>
            <div className="animate-pulse flex items-center justify-center w-full h-[200px] rounded-lg dark:bg-bgdarktheme bg-softgreytheme"></div>
            <div className="flex gap-3 w-full">
              <div className="animate-pulse flex items-center justify-center w-1/2 h-[50px] rounded-lg dark:bg-bgdarktheme bg-softgreytheme"></div>
              <div className="animate-pulse flex items-center justify-center w-1/2 h-[50px] rounded-lg dark:bg-bgdarktheme bg-softgreytheme"></div>
            </div>
          </div>
          <div className="w-[40%] lt-md:hidden mx-auto mt-10 flex items-center justify-center">
            <div className="animate-pulse mx-auto flex items-center justify-center w-[300px] h-[300px] rounded-lg dark:bg-bgdarktheme bg-softgreytheme"></div>
          </div>
        </div>
      ) : token !== "preview" && err ? (
        <div className="flex bg-softredtheme p-4 rounded-lg text-redtheme flex-col gap-3 w-[60%] mx-auto text-center mt-[10vw]">
          <h2 className="text-2xl font-bold">{t("reviewPage.error.title")}</h2>
          <p>{errorMessage}</p>
        </div>
      ) : (
        <div className="h-[90vh] items-center  xl:max-w-[1200px] no-scrollbar mx-auto pb-[5em] overflow-y-auto w-full flex p-5 px-10 justify-center">
          <div
            className={`w-[60%] lt-sm:w-full lt-sm:flex lt-sm:flex-col lt-sm:items-center lt-sm:text-center ${
              restaurantData?.logo ? "" : "flex flex-col items-center text-center "
            }`}
          >
            <h1
              className={`text-3xl font-bold mt-3 ${
                step === 1 ? "block" : "hidden"
              } dark:text-textdarktheme text-blacktheme`}
            >
              {restaurantData?.title} <br />
            </h1>
            <p
              className={`w-[70%] lt-sm:w-[90%] mt-3 ${
                step === 1 ? "block" : "hidden"
              } dark:text-softwhitetheme text-subblack`}
            >
              {restaurantData?.description}
            </p>
            {step === 1 && (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 items-center lg:w-[60%] sm:w-[90%] w-[100%] mt-6"
              >
                <div className="grid grid-cols-2 gap-4 justify-between w-full p-5 rounded-lg shadow-sm border border-softgreytheme dark:border-darkthemeitems dark:bg-darkthemeitems bg-whitetheme">
                  <div className="flex font-medium gap-3 items-center">{t("reviewPage.ratings.service")}</div>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={`service-${star}`}
                        className="cursor-pointer transition-transform hover:scale-110"
                        onClick={() => handleBrightness(star, "service")}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M9.44341 17.4783L5.11528 19.8562C4.53065 20.1774 3.80756 19.9425 3.5002 19.3316C3.37781 19.0883 3.33558 18.8096 3.38004 18.5387L4.20664 13.5023C4.27317 13.0969 4.14455 12.6833 3.86269 12.3961L0.361159 8.82936C-0.111814 8.34758 -0.121491 7.55634 0.339542 7.06208C0.523129 6.86526 0.763681 6.73717 1.02396 6.69765L5.86296 5.96285C6.25249 5.9037 6.58922 5.64804 6.76342 5.27918L8.92749 0.69694C9.2198 0.0779898 9.93691 -0.176136 10.5292 0.129334C10.7651 0.250974 10.956 0.450471 11.0724 0.69694L13.2364 5.27918C13.4106 5.64804 13.7474 5.9037 14.1369 5.96285L18.9759 6.69765C19.6295 6.7969 20.0824 7.43109 19.9874 8.11414C19.9496 8.38613 19.827 8.63751 19.6387 8.82936L16.1372 12.3961C15.8553 12.6833 15.7267 13.0969 15.7932 13.5023L16.6198 18.5387C16.7315 19.219 16.2942 19.8651 15.6433 19.9818C15.384 20.0282 15.1174 19.9841 14.8846 19.8562L10.5564 17.4783C10.208 17.2869 9.79181 17.2869 9.44341 17.4783Z"
                            fill={brightService >= star ? "var(--color-yellowtheme)" : "var(--color-softgreytheme)"}
                          />
                        </svg>
                      </div>
                    ))}
                  </div>
                  <div className="flex font-medium gap-3 items-center">{t("reviewPage.ratings.ambiance")}</div>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={`ambiance-${star}`}
                        className="cursor-pointer transition-transform hover:scale-110"
                        onClick={() => handleBrightness(star, "ambiance")}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M9.44341 17.4783L5.11528 19.8562C4.53065 20.1774 3.80756 19.9425 3.5002 19.3316C3.37781 19.0883 3.33558 18.8096 3.38004 18.5387L4.20664 13.5023C4.27317 13.0969 4.14455 12.6833 3.86269 12.3961L0.361159 8.82936C-0.111814 8.34758 -0.121491 7.55634 0.339542 7.06208C0.523129 6.86526 0.763681 6.73717 1.02396 6.69765L5.86296 5.96285C6.25249 5.9037 6.58922 5.64804 6.76342 5.27918L8.92749 0.69694C9.2198 0.0779898 9.93691 -0.176136 10.5292 0.129334C10.7651 0.250974 10.956 0.450471 11.0724 0.69694L13.2364 5.27918C13.4106 5.64804 13.7474 5.9037 14.1369 5.96285L18.9759 6.69765C19.6295 6.7969 20.0824 7.43109 19.9874 8.11414C19.9496 8.38613 19.827 8.63751 19.6387 8.82936L16.1372 12.3961C15.8553 12.6833 15.7267 13.0969 15.7932 13.5023L16.6198 18.5387C16.7315 19.219 16.2942 19.8651 15.6433 19.9818C15.384 20.0282 15.1174 19.9841 14.8846 19.8562L10.5564 17.4783C10.208 17.2869 9.79181 17.2869 9.44341 17.4783Z"
                            fill={brightAmbiance >= star ? "var(--color-yellowtheme)" : "var(--color-softgreytheme)"}
                          />
                        </svg>
                      </div>
                    ))}
                  </div>
                  <div className="flex font-medium gap-3 items-center">{t("reviewPage.ratings.food")}</div>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={`food-${star}`}
                        className="cursor-pointer transition-transform hover:scale-110"
                        onClick={() => handleBrightness(star, "food")}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M9.44341 17.4783L5.11528 19.8562C4.53065 20.1774 3.80756 19.9425 3.5002 19.3316C3.37781 19.0883 3.33558 18.8096 3.38004 18.5387L4.20664 13.5023C4.27317 13.0969 4.14455 12.6833 3.86269 12.3961L0.361159 8.82936C-0.111814 8.34758 -0.121491 7.55634 0.339542 7.06208C0.523129 6.86526 0.763681 6.73717 1.02396 6.69765L5.86296 5.96285C6.25249 5.9037 6.58922 5.64804 6.76342 5.27918L8.92749 0.69694C9.2198 0.0779898 9.93691 -0.176136 10.5292 0.129334C10.7651 0.250974 10.956 0.450471 11.0724 0.69694L13.2364 5.27918C13.4106 5.64804 13.7474 5.9037 14.1369 5.96285L18.9759 6.69765C19.6295 6.7969 20.0824 7.43109 19.9874 8.11414C19.9496 8.38613 19.827 8.63751 19.6387 8.82936L16.1372 12.3961C15.8553 12.6833 15.7267 13.0969 15.7932 13.5023L16.6198 18.5387C16.7315 19.219 16.2942 19.8651 15.6433 19.9818C15.384 20.0282 15.1174 19.9841 14.8846 19.8562L10.5564 17.4783C10.208 17.2869 9.79181 17.2869 9.44341 17.4783Z"
                            fill={brightFood >= star ? "var(--color-yellowtheme)" : "var(--color-softgreytheme)"}
                          />
                        </svg>
                      </div>
                    ))}
                  </div>
                  <div className="flex font-medium gap-3 items-center">{t("reviewPage.ratings.valueForMoney")}</div>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={`value-${star}`}
                        className="cursor-pointer transition-transform hover:scale-110"
                        onClick={() => handleBrightness(star, "valueForMoney")}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M9.44341 17.4783L5.11528 19.8562C4.53065 20.1774 3.80756 19.9425 3.5002 19.3316C3.37781 19.0883 3.33558 18.8096 3.38004 18.5387L4.20664 13.5023C4.27317 13.0969 4.14455 12.6833 3.86269 12.3961L0.361159 8.82936C-0.111814 8.34758 -0.121491 7.55634 0.339542 7.06208C0.523129 6.86526 0.763681 6.73717 1.02396 6.69765L5.86296 5.96285C6.25249 5.9037 6.58922 5.64804 6.76342 5.27918L8.92749 0.69694C9.2198 0.0779898 9.93691 -0.176136 10.5292 0.129334C10.7651 0.250974 10.956 0.450471 11.0724 0.69694L13.2364 5.27918C13.4106 5.64804 13.7474 5.9037 14.1369 5.96285L18.9759 6.69765C19.6295 6.7969 20.0824 7.43109 19.9874 8.11414C19.9496 8.38613 19.827 8.63751 19.6387 8.82936L16.1372 12.3961C15.8553 12.6833 15.7267 13.0969 15.7932 13.5023L16.6198 18.5387C16.7315 19.219 16.2942 19.8651 15.6433 19.9818C15.384 20.0282 15.1174 19.9841 14.8846 19.8562L10.5564 17.4783C10.208 17.2869 9.79181 17.2869 9.44341 17.4783Z"
                            fill={
                              brightValueForMoney >= star ? "var(--color-yellowtheme)" : "var(--color-softgreytheme)"
                            }
                          />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="p-4 rounded-lg border border-softgreytheme shadow-sm w-full lt-sm:w-[90%] h-[8em] focus:outline-none focus:ring-2 focus:ring-greentheme dark:bg-darkthemeitems bg-whitetheme"
                  placeholder={t("reviewPage.form.reviewPlaceholder")}
                />
                <button
                  type="submit"
                  className="bg-greentheme hover:bg-opacity-90 transition-colors text-whitetheme font-medium py-3 px-6 rounded-lg mt-4"
                >
                  {t("reviewPage.form.submitButton")}
                </button>
              </form>
            )}
            {step === 2 && (
              <div className="flex flex-col gap-4 items-left mt-8 p-6 rounded-lg border border-softgreytheme dark:border-darkthemeitems shadow-sm dark:bg-darkthemeitems bg-whitetheme">
                <div className="flex items-center gap-3">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z"
                      fill="var(--color-greentheme)"
                    />
                  </svg>
                  <h2 className="text-2xl font-bold dark:text-textdarktheme text-blacktheme">
                    {t("reviewPage.success.title")}
                  </h2>
                </div>
                <p className="dark:text-softwhitetheme text-subblack pl-10">{t("reviewPage.success.message")}</p>
              </div>
            )}
          </div>
          {restaurantData?.logo && (
            <div className="w-[40%] lt-sm:hidden flex justify-center items-start pt-10">
              <div className="rounded-lg overflow-hidden shadow-md border border-softgreytheme dark:border-darkthemeitems">
                <img
                  src={restaurantData?.logo || "/placeholder.svg"}
                  alt={t("reviewPage.common.restaurantAlt")}
                  className="h-[300px] w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ReviewPage
