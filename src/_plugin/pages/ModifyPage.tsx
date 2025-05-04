"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import Logo from "../../components/header/Logo"
import { ArrowLeft, Edit, Edit2, Expand, MessageCircle, MessageCircleOff, Send, SendHorizonalIcon, X, XCircle } from "lucide-react"
import { BaseKey, type BaseRecord, useCreate, useCustom, useCustomMutation, useOne } from "@refinedev/core"
import { useLocation, useParams, useSearchParams } from "react-router-dom"
import { format } from "date-fns"
import { getSubdomain } from "../../utils/getSubdomain"
import { useRef } from "react"
import { useClickAway } from "react-use"
import BaseBtn from "../../components/common/BaseBtn"
import WidgetReservationProcess from "../../components/reservation/WidgetReservationProcess"
import ActionPopup from "../../components/popup/ActionPopup"

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


const Modify = () => {
  interface LoadingRowProps {
    isDarkMode: boolean
  }
  const LoadingComponent: React.FC<LoadingRowProps> = ({ isDarkMode }) => {
    return (
      <tr>
        <td className="py-3">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <div
                className={`h-[2.4em] w-[10em] lt-sm:w-[20vw] rounded-md dark:bg-bgdarktheme bg-softgreytheme animate-pulse`}
              ></div>
            </div>
            <div className="space-y-1">
              <div
                className={`h-[2.4em] w-[25em] lt-sm:w-[60vw] rounded-md dark:bg-bgdarktheme bg-softgreytheme  animate-pulse`}
              ></div>
            </div>
          </div>
        </td>
      </tr>
    )
  }

  const { token } = useParams()
  const [widgetInfo, setWidgetInfo] = useState<BaseRecord>()
  const [reservationInfo, setReservationInfo] = useState<BaseRecord>()
  const { mutate, isLoading: widgetLoading, error: widgetError } = useCustomMutation()
  const [updateInfo, setUpdateInfo] = useState<BaseRecord>()
  const [errorPage, setErrorPage] = useState(false)

  const {
    data: reservation,
    isLoading: reservationLoading,
    error: reservationError,
  } = useOne({
    resource: `api/v1/bo/subdomains/public/cutomer/reservations`,
    id: token + "",
    queryOptions: {
      retry: 1,
      onSuccess: (data) => {
        setUpdateInfo(data.data)
      },
      onError: (error) => {
        console.log(error.message, "error")
        if (token !== "preview") {
          setErrorPage(true)
        }
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
    mutate: cancelReservation,
    isLoading: cancelLoading,
    error: cancelError,
  } = useCreate({
    errorNotification(error, values, resource) {
      return {
        type: "error",
        message: error?.formattedMessage,
      }
    },
  })

  const handleCancel = () => {
    setShowConfirmPopup(true)
  }

  useEffect(() => {
    console.log("updateInfo", updateInfo)
  }, [updateInfo])

  const modifyReservation = () => {
    console.log("updateInfo", updateInfo?.occasion)
    mutate({
      url: `api/v1/bo/subdomains/public/cutomer/reservations/${token}`,
      method: "patch",
      values: {
        customer: {
          email: updateInfo?.customer?.email,
          first_name: updateInfo?.customer?.first_name,
          last_name: updateInfo?.customer?.last_name,
          phone: updateInfo?.customer?.phone,
        },
        status: updateInfo?.status,
        source: updateInfo?.source,
        commenter: updateInfo?.commenter,
        internal_note: updateInfo?.internal_note,
        date: data.reserveDate !== "" ? format(data.reserveDate, "yyyy-MM-dd") : updateInfo?.date,
        time: data.time !== "" ? data.time + ":00" : updateInfo?.time,
        number_of_guests: data.guests !== 0 ? data.guests : updateInfo?.number_of_guests,
        allergies: updateInfo?.allergies,
        preferences: updateInfo?.preferences,
        restaurant: updateInfo?.restaurant,
        offer: 0,
        occasion: updateInfo?.occasion,
      },
    })
  }

  useEffect(() => {
    if (reservation) {
      setReservationInfo(reservation.data)
    }
  }, [reservation])

  const subdomain = getSubdomain()

  const [occasions, setOccasions] = useState<BaseRecord[]>()

  const { data: posts } = useCustom({
    url: `api/v1/bo/restaurants/subdomain/occasions`,
    method: "get",
  })

  const {
    data: messageAccess,
    isLoading: messageLoading,
    error: messageError,
  } = useOne({
    resource: `api/v1/bo/subdomains/public/cutomer/reservations`,
    id: `${token}/message`,
    queryOptions: {
      retry: 1,
      onError: (error) => {
        setMessageSent(true)
      },
    },
  })

  useEffect(() => {
    if (posts) {
      setOccasions(posts.data as unknown as BaseRecord[])
    }
  }, [posts])

  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "preview"

  const [tab, setTab] = useState("preview")
  const [pathname] = useLocation().pathname.split("?")
  useEffect(() => {
    if (tab === "preview") {
      document.title = "Tabla | Taste Morocco's best"
    } else if (tab === "modify") {
      document.title = "Modify Your Reservation | Tabla"
    } else if (tab === "contact") {
      document.title = "Contact Us | Tabla"
    } else if (tab === "error") {
      document.title = "Error | Tabla"
    }
  }, [tab, pathname])

  useEffect(() => {
    if (errorPage) {
      setTab("error")
    }
  }, [errorPage, tab])

  const {
    data: widgetData,
    isLoading,
    error,
  } = useOne({
    resource: `api/v1/bo/subdomains/public/cutomer/reservations`,
    id: "",
  })

  useEffect(() => {
    setTab(activeTab)
  }, [activeTab])

  const [restaurantID, setRestaurantID] = useState<string>()

  useEffect(() => {
    console.log(" widgetData ", widgetData)
    if (widgetData) {
      setWidgetInfo(widgetData.data)
      setRestaurantID(widgetData.data.restaurant)
    }
  }, [widgetData])

  const [isDarkMode, setIsDarkMode] = useState(false)
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev)
    document.documentElement.classList.toggle("dark")
    localStorage.setItem("darkMode", document.documentElement.classList.contains("dark") ? "true" : "false")
  }

  const [showProcess, setShowProcess] = useState(false)
  interface dataTypes {
    reserveDate: string
    time: string
    guests: number
  }

  const [data, setData] = useState<dataTypes>({
    reserveDate: "",
    time: "",
    guests: 0,
  })

  const [message, setMessage] = useState("")

  const {
    mutate: sendMessage,
    isLoading: loadingMessage,
    error: cancelMessage,
  } = useCreate({
    errorNotification(error, values, resource) {
      return {
        type: "error",
        message: error?.formattedMessage,
      }
    },
  })

  const [messageSent, setMessageSent] = useState(false)

  const handleSendMessage = () => {
    sendMessage({
      resource: `api/v1/bo/subdomains/public/cutomer/reservations/${token}/message`,
      values: {
        text: message,
      },
    })
    setMessageSent(true)
  }

  const occasionRef = useRef(null)

  useClickAway(occasionRef, () => {
    setShowOccasions(false)
  })

  const selectedOccasion = useMemo(() => {
    return occasions?.find((occasion) => occasion.id === updateInfo?.occasion)?.name
  }, [occasions, updateInfo])

  const [showOccasions, setShowOccasions] = useState(false)

    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    
    const confirmCancel = () => {
      cancelReservation({
        resource: `api/v1/bo/subdomains/public/cutomer/reservations/${token}/cancel`,
        values: {},
      })
      setErrorPage(true)
      setShowConfirmPopup(false)
    }

  return (
    <div className="min-h-screen bg-white  dark:bg-bgdarktheme2 text-black dark:text-white">
      {<ActionPopup
        action="cancel"
        secondActionText="No, keep reservation"
        message="Are you sure you want to cancel this reservation? This action cannot be undone."
        actionFunction={confirmCancel}
        showPopup={showConfirmPopup}
        setShowPopup={setShowConfirmPopup}
      />

      }
      {/* Header */}
      <header className="h-16 z-[300] w-full fixed flex items-center justify-between px-4 sm:px-10 shadow-md bg-white dark:bg-bgdarktheme">
        <Logo className="horizontal" nolink={true} />
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
      <div className="h-16 w-full opacity-0"></div>

      <div className="h-[90vh] items-start xl:max-w-[1200px] no-scrollbar mx-auto  overflow-y-auto w-full flex  p-5 gap-8 px-10 justify-center">
        <div className="w-full sm:w-3/5">
          {widgetInfo?.image && (
            <img
              src={widgetInfo.image || "/placeholder.svg"}
              alt="Restaurant"
              className="w-full h-[7em] object-scale-down "
            />
          ) }
          <h1 className={`text-4xl text-center font-bold dark:text-white mb-2`}>{widgetInfo?.title}</h1>

          <div>
            {/* <p className={`text-md mt-1 dark:text-[#ffffff85] text-subblack`}>{widgetInfo?.description}</p> */}
            <QuillPreview content={widgetInfo?.content} className="mt-2" />
          </div>
          {reservationLoading ? (
            <div>
              {Array.from({ length: 5 }, (_, index) => (
                <LoadingComponent key={index} isDarkMode={isDarkMode} />
              ))}
            </div>
          ) : errorPage ? (
            <div className="flex flex-col gap-3 cursor-default bg-softredtheme p-5 text-center mt-4 items-center rounded-lg shadow-sm">
              <h1 className="text-2xl font-bold text-redtheme">You can't modify your reservation</h1>
              <p className="text-md text-blacktheme dark:text-textdarktheme">
                Something went wrong, you might have already fulfilled a modification or canceled your reservation
              </p>
            </div>
          ) : (
            <div>
              {tab === "preview" && (
                <div>
                  <div className="flex flex-col gap-2">
                    <h3 className={`text-xl font-bold mt-6 mb-3 dark:text-white`}>Your reservation details</h3>
                    <div className="space-y-3 mb-1">
                      <p
                        className={`text-md inputs gap-3 dark:text-[#ffffffd5] dark:bg-darkthemeitems rounded-lg shadow-sm transition-all hover:shadow-md`}
                      >
                        <span className="font-bold mx-4">Special Request</span>
                        {reservationInfo?.commenter}
                      </p>
                      <p
                        className={`text-md inputs gap-3 dark:text-[#ffffffd5] dark:bg-darkthemeitems rounded-lg shadow-sm transition-all hover:shadow-md`}
                      >
                        <span className="font-bold mx-4">Allergies</span>
                        {reservationInfo?.allergies}
                      </p>
                      {selectedOccasion ? (
                        <p
                          className={`text-md inputs gap-3 dark:text-[#ffffffd5] dark:bg-darkthemeitems rounded-lg shadow-sm transition-all hover:shadow-md`}
                        >
                          <span className="font-bold mx-4">Occasion</span>
                          {selectedOccasion}
                        </p>
                      ) : (
                        <></>
                      )}
                    </div>
                    <p
                      className={`text-md flex justify-around  inputs gap-3 dark:text-[#ffffffd5] dark:bg-darkthemeitems rounded-lg shadow-sm p-4`}
                    >
                      <div className={`text-md flex  gap-2 items-center  dark:text-[#ffffffd5]`}>
                        <span className="font-bold text-greentheme dark:text-greentheme">Date</span>
                        <span className="text-lg">{reservationInfo?.date}</span>
                      </div>
                      <div className={`text-md flex  gap-2 items-center  dark:text-[#ffffffd5]`}>
                        <span className="font-bold text-greentheme dark:text-greentheme">Time</span>
                        <span className="text-lg">{reservationInfo?.time.slice(0, 5)}</span>
                      </div>
                      <div className={`text-md flex  gap-2 items-center  dark:text-[#ffffffd5]`}>
                        <span className="font-bold text-greentheme dark:text-greentheme">Guests</span>
                        <span className="text-lg">{reservationInfo?.number_of_guests}</span>
                      </div>
                    </p>
                  </div>
                  <div className="w-full">
                    <div className="flex w-full gap-3 mt-5">
                      <button
                        className={`btn-secondary w-full py-3 rounded-lg transition-all hover:shadow-md flex items-center justify-center gap-2`}
                        onClick={() => setSearchParams("tab=modify")}
                      >
                        <Edit size={18} /> Modify
                      </button>
                      <BaseBtn
                        variant="secondary"
                        className="w-full  bg-softredtheme hover:bg-redtheme text-redtheme hover:text-white py-3 rounded-lg transition-all hover:shadow-md flex items-center justify-center gap-2"
                        loading={cancelLoading}
                        onClick={handleCancel}
                      >
                        <XCircle size={18}/> Cancel
                      </BaseBtn>
                    </div>
                    <div className="mt-3">
                      <button
                        className={`btn-secondary w-full bg-softorangetheme hover:bg-orangetheme text-orangetheme hover:text-white py-3 rounded-lg transition-all hover:shadow-md flex items-center justify-center gap-2`}
                        onClick={() => {
                          setSearchParams("tab=contact")
                        }}
                      >
                        {messageSent?<MessageCircleOff size={18}/> :<MessageCircle size={18} />} Send a message {messageSent? <span className="text-xs font-light">{'(you already sent a message)'}</span>:''}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {tab === "modify" && (
                <div className="flex flex-col gap-2">
                  <h3 className={`text-xl font-bold mt-5 dark:text-white`}>Modify your reservation</h3>
                  <input
                    type="text"
                    defaultValue={reservationInfo?.commenter}
                    name="Special request"
                    className={`text-md inputs gap-3 dark:text-[#ffffffd5] dark:bg-darkthemeitems rounded-lg shadow-sm focus:shadow-md focus:outline-none focus:ring-1 focus:ring-greentheme transition-all`}
                    placeholder="Special request"
                    onChange={(e) => {
                      setUpdateInfo({ ...updateInfo, commenter: e.target.value })
                    }}
                  />
                  <input
                    type="text"
                    defaultValue={reservationInfo?.allergies}
                    name="Allergies"
                    className={`text-md inputs gap-3 dark:text-[#ffffffd5] dark:bg-darkthemeitems rounded-lg shadow-sm focus:shadow-md focus:outline-none focus:ring-1 focus:ring-greentheme transition-all`}
                    placeholder="Allergies"
                    onChange={(e) => {
                      setUpdateInfo({ ...updateInfo, allergies: e.target.value })
                    }}
                  />
                  {occasions?.length || updateInfo?.occasion ? (
                    <>
                      <div
                        className={`text-md cursor-pointer gap-3 inputs dark:text-[#ffffffd5] dark:bg-darkthemeitems rounded-lg shadow-sm hover:shadow-md transition-all`}
                      >
                        <div
                          className="flex justify-between items-center p-3"
                          onClick={() => {
                            setShowOccasions(!showOccasions)
                          }}
                        >
                          <span>
                            {occasions?.find((occasion) => occasion.id === updateInfo?.occasion)?.name ||
                              "Select an occasion"}
                          </span>
                          {!showOccasions ? (
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.40755 13.4643L4.69338 8.75011L5.87171 7.57178L9.99672 11.6968L14.1217 7.57178L15.3 8.75011L10.5859 13.4643C10.4296 13.6205 10.2177 13.7083 9.99672 13.7083C9.77574 13.7083 9.56382 13.6205 9.40755 13.4643Z"
                                fill="currentColor"
                              />
                            </svg>
                          ) : (
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M13.4748 8.61491L19.1318 14.2719L17.7178 15.6859L12.7678 10.7359L7.81781 15.6859L6.40381 14.2719L12.0608 8.61491C12.2483 8.42744 12.5026 8.32213 12.7678 8.32213C13.033 8.32213 13.2873 8.42744 13.4748 8.61491Z"
                                fill="currentColor"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <div
                          ref={occasionRef}
                          className={`flex w-full z-[400] p-4 flex-col absolute gap-2 ${showOccasions ? "block" : "hidden"} dark:bg-darkthemeitems dark:text-textdarktheme bg-white text-blacktheme border-[1px] rounded-[10px] shadow-lg`}
                        >
                          {showOccasions &&
                            occasions?.map((occasion: BaseRecord) => (
                              <button
                                key={occasion.id}
                                className="text-left p-2 hover:bg-softgreentheme hover:text-greentheme rounded-md transition-colors"
                                onClick={() => {
                                  setUpdateInfo({ ...updateInfo, occasion: occasion.id })
                                  setShowOccasions(false)
                                }}
                              >
                                {occasion.name}
                              </button>
                            ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    ""
                  )}
                  <div
                    className={`bg-[#f9f9f9] dark:bg-darkthemeitems rounded-lg mb-2 shadow-sm`}
                  >
                    <div
                      onClick={() => {
                        setShowProcess(true)
                      }}
                      className="flex justify-between items-center cursor-pointer p-6 hover:border-softgreentheme border-2 border-[#00000000] hover:bg-[#f0f0f0] dark:hover:bg-bgdarktheme2 rounded-md transition-colors"
                    >
                      <div className="flex gap-2 items-center ">
                        <div
                          onClick={() => {
                            setShowProcess(true)
                          }}
                          className={`font-[600] dark:text-greentheme text-greentheme`}
                        >
                          Date{" "}
                        </div>
                        {data.reserveDate === "" ? (
                          <span
                            onClick={() => {
                              setShowProcess(true)
                            }}
                          >
                            {reservationInfo?.date}
                          </span>
                        ) : (
                          <span
                            onClick={() => {
                              setShowProcess(true)
                            }}
                          >
                            {data.reserveDate}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 items-center ">
                        <div
                          onClick={() => {
                            setShowProcess(true)
                          }}
                          className={`font-[600] dark:text-greentheme text-greentheme`}
                        >
                          Time{" "}
                        </div>
                        {data.time === "" ? (
                          <span
                            onClick={() => {
                              setShowProcess(true)
                            }}
                          >
                            {reservationInfo?.time.slice(0, 5)}
                          </span>
                        ) : (
                          <span
                            onClick={() => {
                              setShowProcess(true)
                            }}
                          >
                            {data.time}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 items-center ">
                        <div
                          onClick={() => {
                            setShowProcess(true)
                          }}
                          className={`font-[600] dark:text-greentheme text-greentheme`}
                        >
                          Guests{" "}
                        </div>
                        {data.guests === 0 ? (
                          <span
                            onClick={() => {
                              setShowProcess(true)
                            }}
                          >
                            {reservationInfo?.number_of_guests}
                          </span>
                        ) : (
                          <span
                            onClick={() => {
                              setShowProcess(true)
                            }}
                          >
                            {data.guests}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <BaseBtn variant="primary" className="" loading={widgetLoading} onClick={modifyReservation}>
                    Confirm
                  </BaseBtn>
                  <button className={`btn dark:text-white`} onClick={() => setSearchParams("tab=preview")}>
                    Back
                  </button>
                </div>
              )}
              {tab === "contact" && (
                <div>
                  {messageLoading ? (
                    <div>
                      {Array.from({ length: 5 }, (_, index) => (
                        <LoadingComponent key={index} isDarkMode={isDarkMode} />
                      ))}
                    </div>
                  ) : !messageSent ? (
                    <div className="flex flex-col gap-2">
                      <h3 className={`text-xl font-bold mt-5 dark:text-white`}>Send a message</h3>
                      <textarea
                        name="Message"
                        className={`text-md inputs gap-3 dark:text-[#ffffffd5] dark:bg-darkthemeitems rounded-lg shadow-sm focus:shadow-md focus:outline-none focus:ring-1 focus:ring-greentheme transition-all min-h-[150px] p-4`}
                        placeholder="Type your message here..."
                        onChange={(e) => {
                          setMessage(e.target.value)
                        }}
                      />
                      <BaseBtn variant="primary" className="" loading={loadingMessage} onClick={handleSendMessage}>
                        Send
                      </BaseBtn>
                      <button
                        className={`btn dark:text-white`}
                        onClick={() => {
                          setTab("preview")
                          setSearchParams("tab=preview")
                        }}
                      >
                        Back
                      </button>
                    </div>
                  ) : (
                    <div className={`flex flex-col gap-4 items-center p-6 rounded-xl mt-4 bg-softgreentheme shadow-sm`}>
                      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12.1565 16.4058L12.1564 16.4057L10.8298 13.4212L12.6505 11.6001L12.6567 11.5939L12.6627 11.5874C12.819 11.4198 12.904 11.198 12.9 10.9688C12.8959 10.7396 12.8031 10.521 12.641 10.3589C12.479 10.1968 12.2603 10.104 12.0311 10.0999C11.802 10.0959 11.5802 10.181 11.4125 10.3372L11.4061 10.3432L11.3998 10.3494L9.57867 12.1701L6.59433 10.8436C6.5943 10.8436 6.59427 10.8436 6.59424 10.8436C6.46315 10.7851 6.47041 10.596 6.60631 10.5482C6.60633 10.5482 6.60636 10.5482 6.60638 10.5482L15.2873 7.51018C15.4131 7.46623 15.5338 7.58694 15.4898 7.71266L12.4517 16.3936C12.4517 16.3936 12.4517 16.3936 12.4517 16.3937C12.4039 16.5298 12.2146 16.5367 12.1565 16.4058Z"
                          fill="#88AB61"
                          stroke="#88AB61"
                        />
                        <circle cx="11.5" cy="11.5" r="9.5" stroke="#88AB61" strokeWidth="2" />
                      </svg>
                      <h3 className={`text-2xl font-bold text-greentheme mb-2`}>Message Sent Successfully</h3>
                      <p className="text-center text-subblack dark:text-[#ffffff85] mb-2">
                        We've received your message and will get back to you shortly.
                      </p>
                      <button
                        className={`btn-secondary flex gap-2 items-center py-3 px-5 rounded-lg transition-all hover:shadow-md`}
                        onClick={() => {
                          setTab("preview")
                          setSearchParams("tab=preview")
                        }}
                      >
                        <ArrowLeft size={15} /> <span>Back to Reservation</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {widgetInfo?.image_2 && <div className="hidden sm:block w-2/5 sticky top-0 h-[83vh]">
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
        </div>}
      </div>
      {showProcess && (
        <div className="">
          <WidgetReservationProcess
            maxGuests={widgetInfo?.max_of_guests_par_reservation}
            resData={{
              reserveDate: data.reserveDate || reservationInfo?.date || "",
              time: data.time || reservationInfo?.time.slice(0, 5) || "",
              guests: data.guests || reservationInfo?.number_of_guests || "",
            }}
            onClick={() => {
              setShowProcess(false)
            }}
            getDateTime={(data: dataTypes) => {
              setData(data)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default Modify
