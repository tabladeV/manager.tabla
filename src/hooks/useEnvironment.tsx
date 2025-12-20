"use client"

import { Capacitor } from "@capacitor/core"
import { useState, useEffect } from "react"

type Environment = "development" | "production" | "unknown"
type EnvironmentOptions = {
  /**
   * Custom development URL patterns to check (in addition to defaults)
   */
  devPatterns?: (string | RegExp)[]
  /**
   * Whether to check for Vercel preview deployments as development
   * @default true
   */
  considerVercelPreviewAsDev?: boolean
  /**
   * Initial environment before client-side detection
   * @default "unknown"
   */
  initialEnvironment?: Environment
}

/**
 * Hook to detect whether the application is running in development or production
 * based on the current URL.
 */
export function useEnvironment(options: EnvironmentOptions = {}) {
  const { devPatterns = [], considerVercelPreviewAsDev = true, initialEnvironment = "unknown" } = options

  const [environment, setEnvironment] = useState<Environment>(initialEnvironment)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Default development patterns
    const defaultDevPatterns: (string | RegExp)[] = [
      "localhost",
      "127.0.0.1",
      ".local",
      ".test",
      ".dev.",
      /:5173$/, // Specific dev port 5173
    ]

    // Add Vercel preview deployments if enabled
    if (considerVercelPreviewAsDev) {
      defaultDevPatterns.push(/vercel\.app$/i)
      defaultDevPatterns.push(/\.preview\.app$/i)
    }

    // Combine default and custom patterns
    const allDevPatterns = [...defaultDevPatterns, ...devPatterns]

    try {
      const currentUrl = window.location.href.toLowerCase()
      const hostname = window.location.hostname.toLowerCase()

      // Check if URL matches any development pattern
      const isDev = allDevPatterns.some((pattern) => {
        if (typeof pattern === "string") {
          return hostname.includes(pattern) || currentUrl.includes(pattern)
        } else {
          return pattern.test(hostname) || pattern.test(currentUrl)
        }
      })

      const isNative = Capacitor.isNativePlatform();

      setEnvironment(isDev && !isNative? "development" : "production")
    } catch (error) {
      console.error("Error detecting environment:", error)
      setEnvironment("unknown")
    }

    setIsLoaded(true)
  }, [devPatterns, considerVercelPreviewAsDev])

  return {
    environment,
    isDevelopment: environment === "development",
    isProduction: environment === "production",
    isUnknown: environment === "unknown",
    isLoaded,
  }
}
