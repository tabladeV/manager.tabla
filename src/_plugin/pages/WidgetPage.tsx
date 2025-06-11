"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import Logo from "../../components/header/Logo"
import { LoaderCircle, ScreenShareIcon } from "lucide-react"
import { type BaseKey, type BaseRecord, useCreate, useList, useOne } from "@refinedev/core"
import { format } from "date-fns"
import { getSubdomain } from "../../utils/getSubdomain"
import WidgetReservationProcess from "../../components/reservation/WidgetReservationProcess"

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

const WidgetPage = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    document.title = "Tabla | Taste Morocco's best "
  }, [pathname])

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

  useEffect(() => {
    if (posts) {
      setOccasions(posts.data as unknown as BaseRecord[])
    }
  }, [posts])

  const { mutate: createReservation } = useCreate()
  const [widgetInfo, setWidgetInfo] = useState<BaseRecord>()

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
      errors.firstname = "First name is required"
      isValid = false
    }

    if (!formData.lastname.trim()) {
      errors.lastname = "Last name is required"
      isValid = false
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid"
      isValid = false
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = {
      firstname: form.firstname.value,
      lastname: form.lastname.value,
      email: form.email.value,
      phone: form.phone.value,
      preferences: form.preferences.value,
      allergies: form.allergies.value,
      occasion: form.occasion?.value !== "0" ? form.occasion?.value : null,
    }

    if (validateForm(formData)) {
      setUserInformation(formData)
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

  const [chosenTitle, setChosenTitle] = useState<'mr' | 'mrs' | 'ms'>()

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
          setServerError("Something went wrong. Please try again or contact the restaurant directly.")
        },
      },
    )
  }

  const [checkedConditions, setCheckedConditions] = useState<boolean>(false)
  const [checkedDressCode, setCheckedDressCode] = useState<boolean>(false)

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

  return (
    <div className="min-h-screen h-[100vh] overflow-y-auto  bg-white dark:bg-bgdarktheme2 text-black dark:text-white">
      {/* Header */}
      <header className="h-16 z-[10] w-full fixed flex items-center justify-between px-4 sm:px-10 shadow-md bg-white dark:bg-bgdarktheme">
        {widgetInfo?.image ? (
          <img
            src={widgetInfo.image || "/placeholder.svg"}
            alt="Restaurant"
            className="h-16 object-scale-down horizontal pa-1"
          />
        ) : <Logo className="horizontal" nolink={true} />}
        <button
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
          className="p-2 rounded-full hover:bg-[#f5f5f5] dark:hover:bg-[#333333] transition-colors"
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
            className="hidden dark:block"
          >
            <path
              d="M12.0581 20C9.83544 20 7.94644 19.2223 6.39111 17.667C4.83577 16.1117 4.05811 14.2227 4.05811 12C4.05811 9.97401 4.71811 8.21734 6.03811 6.73001C7.35811 5.24267 8.99277 4.36467 10.9421 4.09601C10.9961 4.09601 11.0491 4.09801 11.1011 4.10201C11.1531 4.10601 11.2041 4.11167 11.2541 4.11901C10.9168 4.58967 10.6498 5.11301 10.4531 5.68901C10.2564 6.26501 10.1581 6.86867 10.1581 7.50001C10.1581 9.27801 10.7801 10.789 12.0241 12.033C13.2681 13.277 14.7794 13.8993 16.5581 13.9C17.1921 13.9 17.7964 13.8017 18.3711 13.605C18.9458 13.4083 19.4618 13.1413 19.9191 12.804C19.9271 12.854 19.9328 12.905 19.9361 12.957C19.9394 13.009 19.9414 13.062 19.9421 13.116C19.6861 15.0647 18.8144 16.699 17.3271 18.019C15.8398 19.339 14.0841 19.9993 12.0581 20Z"
              fill="#88AB61"
            />
          </svg>
        </button>
      </header>
      <div className="h-16 w-full z-[0] opacity-0"></div>
      {/* {widgetInfo?.image_2 && <div className="w-full" style={{ height: "300px", backgroundImage: `url(${widgetInfo.image_2})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        
      </div>} */}
      {widgetInfo?.image_2 ? (
        // <div className="w-[98%] rounded-lg mx-auto mt-2 relative overflow-hidden h-[250px] lg:h-[300px]">
        <div className="w-full relative overflow-hidden h-[250px] lg:h-[350px]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${widgetInfo.image_2})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed", // This creates the parallax effect
              transform: "translateZ(0)", // Hardware acceleration
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <h1 className="text-4xl text-white font-bold px-4 text-center drop-shadow-lg">
              {widgetInfo?.title || "Make a Reservation"}
            </h1>
          </div>
        </div>
      ) : (
        <div className="w-full relative overflow-hidden h-[250px] lg:h-[350px]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `black`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed", // This creates the parallax effect
              transform: "translateZ(0)", // Hardware acceleration
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <h1 className="text-4xl text-white font-bold px-4 text-center drop-shadow-lg">
              {widgetInfo?.title || "Make a Reservation"}
            </h1>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex justify-center flex-col sm:flex-row gap-8">
        {/* Left Column - Form */}
        <div className="w-full sm:w-4/5 mx-auto">
          {/* {step !== 6 && (
            <h1 className="text-3xl sm:text-4xl text-center font-bold mb-4 text-black dark:text-white">
              {widgetInfo?.title || "Make a Reservation"}
            </h1>
          )} */}

          {step === 1 && (
            <>
              {/* <p className="text-lg mb-6 text-[#333333] dark:text-[#e1e1e1]">
                {widgetInfo?.description || "Reserve your table at our restaurant."}
              </p> */}
              <div className="bg-[#f9f9f9]  dark:bg-darkthemeitems rounded-lg  mb-6 shadow-sm">
                <div
                  onClick={() => setShowProcess(true)}
                  className="flex justify-between items-center cursor-pointer px-3 py-4 hover:border-softgreentheme border-2 border-[#00000000] hover:bg-[#f0f0f0] dark:hover:bg-bgdarktheme2 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-[600] dark:text-greentheme text-greentheme">Date</span>
                    <span className="font-medium">{formatedDate() || "----/--/--"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-[600] dark:text-greentheme text-greentheme">Time</span>
                    <span className="font-medium">{data.time || "--:--"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-[600] dark:text-greentheme text-greentheme">Guests</span>
                    <span className="font-medium">{data.guests || "--"}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!data.reserveDate || !data.time || !data.guests}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${!data.reserveDate || !data.time || !data.guests
                  ? "bg-[#88AB61] opacity-50 cursor-not-allowed"
                  : "bg-[#88AB61] hover:bg-[#769c4f] text-white"
                  }`}
              >
                Book Now
              </button>

              {widgetInfo?.menu_file && (
                <button
                  onClick={() => window.open(widgetInfo.menu_file, "_blank")}
                  className="w-full mt-4 py-3 px-4 rounded-md font-medium border border-[#88AB61] text-[#88AB61] hover:bg-[#f0f7e6] dark:hover:bg-darkthemeitems transition-colors flex items-center justify-center gap-2"
                >
                  <span>Preview our menu</span>
                  <ScreenShareIcon size={18} />
                </button>
              )}

              <QuillPreview
                content={widgetInfo?.content || ""}
                className="my-6 text-[#333333] dark:text-[#e1e1e1]"
              />
            </>
          )}

          {step === 2 && (
            <div className="bg-white dark:bg-darkthemeitems rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Your Information</h2>

              <form onSubmit={handleSubmit} className="space-y-1">
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-sm font-bold text-[#555555] dark:text-[#cccccc]">
                    Title
                  </p>
                  <label htmlFor="Mr" className="text-sm font-medium text-[#555555] dark:text-[#cccccc]">
                    Mr.
                  </label>
                  <input type="checkbox" id="Mr" className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61]" checked={chosenTitle === "mr"} onChange={() => setChosenTitle("mr")} />
                  <label htmlFor="Mrs" className="text-sm font-medium text-[#555555] dark:text-[#cccccc]">
                    Mrs.
                  </label>
                  <input type="checkbox" id="Mrs" className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61]" checked={chosenTitle === "mrs"} onChange={() => setChosenTitle("mrs")} />
                  <label htmlFor="Ms" className="text-sm font-medium text-[#555555] dark:text-[#cccccc]">
                    Ms.
                  </label>
                  <input type="checkbox" id="Ms" className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61]" checked={chosenTitle === "ms"} onChange={() => setChosenTitle("ms")} />
                </div>
                <div>
                  <label
                    htmlFor="firstname"
                    className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1"
                  >
                    First Name *
                  </label>
                  <input
                    id="firstname"
                    type="text"
                    placeholder="Enter your first name"
                    className={`w-full p-3 rounded-md border ${formErrors.firstname ? "border-red-500" : "border-[#dddddd] dark:border-[#444444]"} bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]`}
                  />
                  {formErrors.firstname && <p className="mt-1 text-sm text-red-500">{formErrors.firstname}</p>}
                </div>

                <div>
                  <label
                    htmlFor="lastname"
                    className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1"
                  >
                    Last Name *
                  </label>
                  <input
                    id="lastname"
                    type="text"
                    placeholder="Enter your last name"
                    className={`w-full p-3 rounded-md border ${formErrors.lastname ? "border-red-500" : "border-[#dddddd] dark:border-[#444444]"} bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]`}
                  />
                  {formErrors.lastname && <p className="mt-1 text-sm text-red-500">{formErrors.lastname}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className={`w-full p-3 rounded-md border ${formErrors.email ? "border-red-500" : "border-[#dddddd] dark:border-[#444444]"} bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]`}
                  />
                  {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">
                    Phone *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className={`w-full p-3 rounded-md border ${formErrors.phone ? "border-red-500" : "border-[#dddddd] dark:border-[#444444]"} bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]`}
                  />
                  {formErrors.phone && <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>}
                </div>

                <div>
                  <label
                    htmlFor="allergies"
                    className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1"
                  >
                    Allergies
                  </label>
                  <textarea
                    id="allergies"
                    placeholder="Please list any allergies"
                    className="w-full p-3 rounded-md border border-[#dddddd] dark:border-[#444444] bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]"
                    rows={2}
                  />
                </div>

                <div>
                  <label
                    htmlFor="preferences"
                    className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1"
                  >
                    Preferences
                  </label>
                  <textarea
                    id="preferences"
                    placeholder="Any special requests or preferences"
                    className="w-full p-3 rounded-md border border-[#dddddd] dark:border-[#444444] bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]"
                    rows={2}
                  />
                </div>

                {(
                  <div>
                    <label
                      htmlFor="occasion"
                      className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1"
                    >
                      Occasion
                    </label>
                    <select
                      id="occasion"
                      className="w-full p-3 rounded-md border border-[#dddddd] dark:border-[#444444] bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]"
                    >
                      <option value="0">Select an occasion (optional)</option>
                      {(occasions ?? []).map((occasion: BaseRecord) => (
                        <option key={occasion.id} value={occasion.id}>
                          {occasion.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-start pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={checkedConditions}
                    onChange={() => setCheckedConditions(!checkedConditions)}
                    className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61]"
                  />

                  <label htmlFor="terms" className="ml-2  block text-sm text-[#555555] dark:text-[#cccccc]">
                    I agree to{" "}
                    <Link to="/terms-and-conditions" className="underline font-medium text-[#88AB61]" target="_blank">
                      the terms and conditions
                    </Link>
                  </label>

                </div>
                {widgetInfo?.enable_dress_code && (<div className="flex items-start pt-2">
                  <input
                    type="checkbox"
                    id="DressCode"
                    checked={checkedDressCode}
                    onChange={() => setCheckedDressCode(!checkedDressCode)}
                    className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61]"
                  />
                  <div className="ml-2">
                    <label htmlFor="DressCode" className="block text-sm text-[#555555] dark:text-[#cccccc]">
                      I agree to the dress code ({widgetInfo?.dress_code && widgetInfo.dress_code.length > 100
                        ? `${widgetInfo.dress_code.substring(0, 100)}... `
                        : widgetInfo?.dress_code || "No specific dress code"}
                      {widgetInfo?.dress_code && widgetInfo.dress_code.length > 100 && (
                        <button type="button" onClick={() => setDressCodePopupOpen(true)} className="underline font-medium text-[#88AB61]">
                          read more
                        </button>
                      )})
                    </label>
                  </div>
                </div>)}

                {/* Dress Code Popup */}
                {dressCodePopupOpen && (
                  <div onClick={() => setDressCodePopupOpen(false)} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-darkthemeitems rounded-lg p-6 max-w-md w-full">
                      <h3 className="text-lg font-semibold mb-2">Dress Code</h3>
                      <p className="mb-4">{widgetInfo?.dress_code}</p>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setDressCodePopupOpen(false)}
                          className="py-2 px-4 bg-[#88AB61] text-white rounded-md hover:bg-[#769c4f]"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 px-4 rounded-md font-medium border border-[#dddddd] dark:border-[#444444] hover:bg-[#f5f5f5] dark:hover:bg-bgdarktheme2 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={!checkedConditions || (widgetInfo?.enable_dress_code ? !checkedDressCode : false)}
                    className={`bg-[#88AB61] flex-1 py-3 px-4 rounded-md font-medium transition-colors ${!checkedConditions || (widgetInfo?.enable_dress_code ? !checkedDressCode : false) ? "bg-[#88AB61] opacity-50 cursor-not-allowed"
                      : "hover:bg-[#769c4f] text-white"}
                    }`}
                  >
                    Continue
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 4 && (
            <div className="bg-white dark:bg-darkthemeitems rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Confirm Your Informations</h2>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium font-[600] dark:text-greentheme text-greentheme">Name</h3>
                    <p className="text-base">
                      {chosenTitle ? chosenTitle + '. ' : ''}{userInformation.firstname} {userInformation.lastname}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium font-[600] dark:text-greentheme text-greentheme">Email</h3>
                    <p className="text-base">{userInformation.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium font-[600] dark:text-greentheme text-greentheme">Phone</h3>
                    <p className="text-base">{userInformation.phone}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium font-[600] dark:text-greentheme text-greentheme">Date & Time</h3>
                    <p className="text-base">
                      {format(data.reserveDate, "MMMM d, yyyy")} at {data.time}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium font-[600] dark:text-greentheme text-greentheme">Guests</h3>
                    <p className="text-base">
                      {data.guests} {data.guests === 1 ? "person" : "people"}
                    </p>
                  </div>
                  {userInformation.occasion && (
                    <div>
                      <h3 className="text-sm font-medium font-[600] dark:text-greentheme text-greentheme">Occasion</h3>
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
                    <h3 className="text-sm font-medium font-[600] dark:text-greentheme text-greentheme">Allergies</h3>
                    <p className="text-base">{userInformation.allergies}</p>
                  </div>
                )}

                {userInformation.preferences && (
                  <div>
                    <h3 className="text-sm  font-[600] dark:text-greentheme text-greentheme">Preferences</h3>
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
                  Edit Details
                </button>
                <button
                  onClick={handleConfirmation}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 rounded-md font-medium bg-[#88AB61] hover:bg-[#769c4f] text-white transition-colors flex justify-center items-center"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="animate-spin mr-2" size={18} />
                      Processing...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="bg-white dark:bg-darkthemeitems rounded-lg p-6 shadow-sm text-center">
              <div className="w-16 h-16 bg-[#f0f7e6] dark:bg-bgdarktheme2 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#88AB61" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2">{widgetInfo?.auto_confirmation ? 'Reservation Confirmed!' : 'Reservation Completed!'}</h2>
              <p className="font-[600] dark:text-greentheme text-greentheme mb-6">
                Your reservation has been successfully made. You will receive a confirmation email shortly.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="py-3 px-6 rounded-md font-medium bg-[#88AB61] hover:bg-[#769c4f] text-white transition-colors"
              >
                Make Another Reservation
              </button>
            </div>
          )}

          {step === 6 && (
            <div className="bg-white dark:bg-[#222222] rounded-lg p-6 shadow-sm text-center">
              <h2 className="text-2xl font-semibold mb-4">
                {widgetInfo?.disabled_title || "Reservations Unavailable"}
              </h2>
              <p className="font-[600] dark:text-greentheme text-greentheme">
                {widgetInfo?.disabled_description ||
                  "Online reservations are currently unavailable. Please contact the restaurant directly."}
              </p>
            </div>
          )}

          {showProcess && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#222222] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
                <WidgetReservationProcess
                  onClick={() => setShowProcess(false)}
                  maxGuests={widgetInfo?.max_of_guests_par_reservation}
                  resData={data}
                  getDateTime={(data: any) => setData(data)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Image */}
        {/* {widgetInfo?.image_2 && <div className="hidden sm:block w-2/5 sticky top-20 h-[80vh]">
          {widgetInfo?.image_2 ? (
            <img
              src={widgetInfo.image_2 || "/placeholder.svg"}
              alt="Restaurant"
              className="w-full h-full object-cover rounded-lg shadow-md"
            />
          ) : (
            <div className="w-full h-full bg-[#f5f5f5] dark:bg-[#2a2a2a] rounded-lg flex items-center justify-center">
              <p className="text-[#888888] dark:text-[#666666]">Restaurant image</p>
            </div>
          )}
        </div>} */}
        {/* Footer */}
        <div className="mt-8 text-center text-subblack dark:text-textdarktheme text-sm">
          <p>© {new Date().getFullYear()} Tabla. Tous droits réservés.</p>
        </div>
      </main>
    </div>
  )
}

export default WidgetPage
