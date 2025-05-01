"use client"

import type { ReactNode } from "react"
import { useEnvironment } from "../hooks/useEnvironment"

type DevOnlyProps = {
  children: ReactNode
  fallback?: ReactNode
  /**
   * Force visibility regardless of environment (useful for testing)
   */
  forceShow?: boolean
}

/**
 * A component that only renders its children in development environments
 */
export function DevOnly({ children, fallback = null, forceShow = false }: DevOnlyProps) {
  const { isDevelopment, isLoaded } = useEnvironment()

  // Don't render anything until environment is detected
  if (!isLoaded) return null

  // Render children if in development or forceShow is true
  if (isDevelopment || forceShow) {
    return <>{children}</>
  }

  // Render fallback in production
  return <>{fallback}</>
}
