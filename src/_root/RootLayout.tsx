"use client"

import { Outlet } from "react-router-dom"
import Logo from "../components/header/Logo"
import UserBar from "../components/header/UserBar"
import NavigationMenu from "../components/menu/NavigationMenu"
import { useEffect, useState } from "react"
import DateSelection from "../components/header/DateSelection"
import i18n from "i18next"
import { useDarkContext } from "../context/DarkContext"
import confirm from "../assets/confirmedNew.png"
import cancel from "../assets/canceledNew.png"
import pending from "../assets/pendingNew.png"
import seated from "../assets/seatedNew.png"
import seatedDark from "../assets/seatedNewDark.png"
import confirmDark from "../assets/confirmedNewDark.png"
import cancelDark from "../assets/canceledNewDARK.png"
import pendingDark from "../assets/pendingNewDark.png"
import { useList } from "@refinedev/core"
import { useDateContext } from "../context/DateContext"
import { format } from "date-fns"

const RootLayout = () => {
  const { darkMode } = useDarkContext()
  const { chosenDay, preferredLanguage } = useDateContext()

  const {
    data: reservationsActionsData,
    isLoading,
    error,
  } = useList({
    resource: "api/v1/dashboard/top-actions",
    filters: [
      {
        field: "start_date",
        operator: "eq",
        value: format(chosenDay, "yyyy-MM-dd"),
      },
      {
        field: "end_date",
        operator: "eq",
        value: format(chosenDay, "yyyy-MM-dd"),
      },
    ],
    queryOptions: {
      onSuccess: (data) => {
        console.log("Data fetched successfully:", data)
      },
    },
  })

  interface ReservationAction {
    action: string
    count: number
  }

  const [actions, setActions] = useState<ReservationAction[]>([
    {
      action: "pending",
      count: 0,
    },
    {
      action: "confirmed",
      count: 0,
    },
    {
      action: "cancelled",
      count: 0,
    },
    {
      action: "fulfilled",
      count: 0,
    },
    {
      action: "seated",
      count: 0,
    },
  ])

  useEffect(() => {
    if (reservationsActionsData?.data) {
      setActions(reservationsActionsData.data as ReservationAction[])
    }
  }, [reservationsActionsData])

  // Fullscreen keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "m") {
        toggleFullscreen()
      }
    }

    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`)
        })
      } else {
        document.exitFullscreen().catch((err) => {
          console.error(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`)
        })
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => {
      document.removeEventListener("keydown", handleKeyPress)
    }
  }, [])

  // Language persistence - FIXED: Use the preferredLanguage from context
  useEffect(() => {
    // Only change i18n language if it's different from current
    if (preferredLanguage && i18n.language !== preferredLanguage) {
      i18n.changeLanguage(preferredLanguage)
    }
  }, [preferredLanguage])

  // Initialize language on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage")
    const supportedLanguages = ["en", "fr", "ar", "es"]

    if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
      // Language will be set by DateContext, just ensure i18n is in sync
      if (i18n.language !== savedLanguage) {
        i18n.changeLanguage(savedLanguage)
      }
    } else {
      // Set default language if none saved or invalid
      localStorage.setItem("preferredLanguage", "en")
      i18n.changeLanguage("en")
    }
  }, [])

  const [stateOfSideBar, setStateOfSideBar] = useState(false)
  const strokeColor = "stroke-[#1e1e1e70] dark:stroke-[#ffffff70]"

  return (
    <div
      className={`flex overflow-hidden ${
        preferredLanguage === "ar" ? "rtl" : ""
      } bg-white dark:bg-bgdarktheme dark:text-textdarktheme`}
    >
      <div className="sm:hidden">
        <NavigationMenu
          stateOfSideBar={stateOfSideBar}
          handleSideBar={() => {
            setStateOfSideBar(!stateOfSideBar)
          }}
        />
      </div>
      <div
        className={`h-full lt-sm:hidden transition-all duration-300 ease-in-out ${
          stateOfSideBar ? "w-[300px]" : "w-[100px]"
        }`}
      >
        <div className="transition-all duration-300 ease-in-out">
          <Logo className={stateOfSideBar ? "horizontal" : ""} />
        </div>
        <NavigationMenu
          stateOfSideBar={stateOfSideBar}
          handleSideBar={() => {
            setStateOfSideBar(!stateOfSideBar)
          }}
        />
      </div>
      <div
        className={`transition-all duration-300 ease-in-out lt-sm:w-full ${
          stateOfSideBar ? "gt-sm:w-[calc(100%-300px)]" : "gt-sm:w-[calc(100%-100px)]"
        } pt-[env(safe-area-inset-top)]`}
      >
        <header className="h-[80px] items-center flex justify-between gap-1 px-6 lt-sm:px-2 pt-[env(safe-area-inset-top)]">
          <div className="sm:hidden">
            <Logo />
          </div>
          <button
            className={`
                lt-sm:hidden flex items-center justify-center
                transition-all duration-500 ease-in-out
                group
              `}
            onClick={() => {
              setStateOfSideBar(!stateOfSideBar)
            }}
            aria-label={stateOfSideBar ? "Collapse sidebar" : "Expand sidebar"}
          >
            {/* Animated hamburger/arrow button */}
            <div className="relative w-5 h-5">
              {/* Top line */}
              <span
                className={`
                    absolute top-0 left-0 rounded w-4 h-[0.17em] bg-greentheme
                     transform transition-all duration-500 ease-in-out
                    ${
                      stateOfSideBar
                        ? "rotate-45 translate-y-[.78em] w-[.8em] -translate-x-[1.8px] bottom-0 bg-redtheme"
                        : ""
                    }
                  `}
              ></span>

              {/* Middle line */}
              <span
                className={`
                    absolute top-2 left-0 w-5 rounded h-[0.17em] bg-greentheme
                     transition-all duration-500 ease-in-out
                    ${stateOfSideBar ? " bg-redtheme" : "opacity-100 w-3"}
                  `}
              ></span>

              {/* Bottom line */}
              <span
                className={`
                    absolute top-4 left-0 w-3 rounded h-[0.17em] bg-greentheme
                     transform transition-all duration-500 ease-in-out
                    ${stateOfSideBar ? "-rotate-45 -translate-y-3 w-[.8em] -translate-x-[2px] bg-redtheme" : ""}
                  `}
              ></span>
            </div>
          </button>
          <div className="flex gap-1 gt-md:gap-2 lt-sm:hidden">
            <div className="flex items-center gap-2 btn border-softbluetheme cursor-default hover:border-bluetheme text-bluetheme">
              <img
                src={pending || "/placeholder.svg"}
                alt="pending"
                className="size-4 lt-lg:size-3 block dark:hidden"
              />
              <img
                src={pendingDark || "/placeholder.svg"}
                alt="pending"
                className="size-4 lt-lg:size-3 hidden dark:block"
              />
              <span className="text-[1.2rem] lt-lg:text-[1rem] font-[600]">{actions[0].count}</span>
            </div>
            <div className="flex items-center gap-2 btn border-softgreentheme cursor-default hover:border-greentheme text-greentheme">
              <img
                src={confirm || "/placeholder.svg"}
                alt="confirm"
                className="size-4 lt-lg:size-3 block dark:hidden"
              />
              <img
                src={confirmDark || "/placeholder.svg"}
                alt="confirm"
                className="size-4 lt-lg:size-3 hidden dark:block"
              />
              <span className="text-[1.2rem] lt-lg:text-[1rem] font-[600]">{actions[1].count}</span>
            </div>
            <div className="flex items-center gap-2 btn border-softredtheme cursor-default hover:border-redtheme text-redtheme">
              <img src={cancel || "/placeholder.svg"} alt="cancel" className="size-4 lt-lg:size-3 block dark:hidden" />
              <img
                src={cancelDark || "/placeholder.svg"}
                alt="cancel"
                className="size-4 lt-lg:size-3 hidden dark:block"
              />
              <span className="text-[1.2rem] lt-lg:text-[1rem] font-[600]">{actions[2].count}</span>
            </div>
            <div className="flex items-center gap-2 btn border-softyellowtheme cursor-default hover:border-yellowtheme text-yellowtheme">
              <img src={seated || "/placeholder.svg"} alt="seated" className="size-4 lt-lg:size-3 block dark:hidden" />
              <img
                src={seatedDark || "/placeholder.svg"}
                alt="seated"
                className="size-4 lt-lg:size-3 hidden dark:block"
              />
              <span className="text-[1.2rem] lt-lg:text-[1rem] font-[600]">{actions[4].count}</span>
            </div>
          </div>
          <DateSelection />
          <UserBar />
        </header>
        <section className="flex justify-between h-[calc(100vh-80px-env(safe-area-inset-top))]">
          <div
            className={`p-[1em] w-full h-full lt-sm:pb-[10em] overflow-x-hidden overflow-y-scroll bg-[#F6F6F6] dark:bg-bgdarktheme2 dark:text-textdarktheme`}
          >
            <Outlet />
            <div className="lt-sm:h-[4em]"></div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default RootLayout
