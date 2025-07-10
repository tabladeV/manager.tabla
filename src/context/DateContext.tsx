"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import { startOfToday } from "date-fns"

// Define types for user and restaurant data
interface UserData {
  [key: string]: any
}

interface RestaurantData {
  [key: string]: any
}

// Define the context type
interface DateContextType {
  chosenDay: Date
  setChosenDay: (date: Date) => void
  userData: UserData | null
  setUserData: (data: UserData | null) => void
  restaurantData: RestaurantData | null
  setRestaurantData: (data: RestaurantData | null) => void
  preferredLanguage: string
  setPreferredLanguage: (language: string) => void
}

// Create the context with proper typing
const DateContext = createContext<DateContextType | null>(null)

// Define the types for the provider props
interface DateProviderProps {
  children: ReactNode
}

// Provider component
export const DateProvider: React.FC<DateProviderProps> = ({ children }) => {
  const today = startOfToday()
  const [chosenDay, setChosenDay] = useState<Date>(today)

  // Add state for user and restaurant data
  const [userData, setUserData] = useState<UserData | null>(null)
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null)

  // Updated to include Spanish as default option alongside English, French, and Arabic
  const [preferredLanguage, setPreferredLanguage] = useState<string>(localStorage.getItem("preferredLanguage") || "en")

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const storedUserData = localStorage.getItem("user_data")
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData))
      }

      const storedRestaurantData = localStorage.getItem("restaurant_data")
      if (storedRestaurantData) {
        setRestaurantData(JSON.parse(storedRestaurantData))
      }

      const storedLanguage = localStorage.getItem("preferredLanguage")
      if (storedLanguage) {
        // Validate that the stored language is one of the supported languages
        const supportedLanguages = ["en", "fr", "ar", "es"]
        if (supportedLanguages.includes(storedLanguage)) {
          setPreferredLanguage(storedLanguage)
        } else {
          // Fallback to English if stored language is not supported
          setPreferredLanguage("en")
          localStorage.setItem("preferredLanguage", "en")
        }
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
    }
  }, [])

  // Update localStorage when data changes
  useEffect(() => {
    if (userData) {
      localStorage.setItem("user_data", JSON.stringify(userData))
    }
  }, [userData])

  useEffect(() => {
    if (restaurantData) {
      localStorage.setItem("restaurant_data", JSON.stringify(restaurantData))
    }
  }, [restaurantData])

  useEffect(() => {
    // Validate language before storing
    const supportedLanguages = ["en", "fr", "ar", "es"]
    if (supportedLanguages.includes(preferredLanguage)) {
      localStorage.setItem("preferredLanguage", preferredLanguage)
    }
  }, [preferredLanguage])

  return (
    <DateContext.Provider
      value={{
        chosenDay,
        setChosenDay,
        userData,
        setUserData,
        restaurantData,
        setRestaurantData,
        preferredLanguage,
        setPreferredLanguage,
      }}
    >
      {children}
    </DateContext.Provider>
  )
}

// Custom hook to access the context
export const useDateContext = () => {
  const context = useContext(DateContext)
  if (!context) {
    throw new Error("useDateContext must be used within a DateProvider")
  }
  return context
}

// Helper function to get supported languages
export const getSupportedLanguages = () => {
  return [
    { code: "en", name: "English", nativeName: "English" },
    { code: "fr", name: "French", nativeName: "Français" },
    { code: "ar", name: "Arabic", nativeName: "العربية" },
    { code: "es", name: "Spanish", nativeName: "Español" },
  ]
}

// Helper function to get language display name
export const getLanguageDisplayName = (languageCode: string): string => {
  const languages = getSupportedLanguages()
  const language = languages.find((lang) => lang.code === languageCode)
  return language ? language.nativeName : "English"
}
