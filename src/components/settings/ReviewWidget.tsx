"use client"

import { type BaseKey, useList } from "@refinedev/core"
import { Upload, X, Check, AlertCircle } from "lucide-react"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { httpClient } from "../../services/httpClient"

interface ReviewSettings {
  id: BaseKey
  title: string
  description: string
  logo: string
  restaurant: number
  auto_send_review: boolean
  review_delay_hours: number
}

interface ToastProps {
  type: "success" | "error"
  message: string
}

const ReviewWidget = () => {
  const { t } = useTranslation()
  const restaurantId = localStorage.getItem("restaurant_id")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<ToastProps | null>(null)

  // Set page title
  useEffect(() => {
    document.title = "Review Widget Settings | Tabla"
  }, [])

  // Get subdomain data
  const { data: subdomainData } = useList({
    resource: "api/v1/bo/restaurants/subdomain",
  })

  const [subdomain, setSubdomain] = useState<string>("")
  useEffect(() => {
    if (subdomainData?.data) {
      const subdomainApi = subdomainData.data as unknown as { subdomain: string }
      setSubdomain(subdomainApi.subdomain)
    }
  }, [subdomainData])

  // Get review widget data
  const {
    data: reviewData,
    isLoading,
    refetch,
  } = useList({
    resource: "api/v1/reviews/widget",
  })

  // State for form fields
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [reviewSettings, setReviewSettings] = useState<ReviewSettings>()
  const [logo, setLogo] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [deleteLogo, setDeleteLogo] = useState<boolean>(false)
  const [formChanged, setFormChanged] = useState<boolean>(false)
  const [autoSendReview, setAutoSendReview] = useState<boolean>(false)
  const [reviewDelay, setReviewDelay] = useState<number>(0)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize form with data from API
  useEffect(() => {
    if (reviewData?.data) {
      console.log("Review data:", reviewData.data)
      const data = reviewData.data as unknown as ReviewSettings
      setReviewSettings(data)
      setTitle(data.title || "")
      setDescription(data.description || "")
      setLogo(data.logo || null)
      setAutoSendReview(data.auto_send_review || false)
      setReviewDelay(data.review_delay_hours || 0)
      setDeleteLogo(false)
      setFormChanged(false)
    }
  }, [reviewData])

  // Track form changes
  useEffect(() => {
    if (reviewSettings) {
      const hasChanges =
        title !== reviewSettings.title ||
        description !== reviewSettings.description ||
        file !== null ||
        deleteLogo ||
        autoSendReview !== reviewSettings.auto_send_review ||
        reviewDelay !== reviewSettings.review_delay_hours
      setFormChanged(hasChanges)
    }
  }, [title, description, file, deleteLogo, reviewSettings, autoSendReview, reviewDelay])

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0]
      setFile(selectedFile)
      setDeleteLogo(false)

      // Generate a temporary preview URL
      const objectUrl = URL.createObjectURL(selectedFile)
      setPreviewUrl(objectUrl)
    }
  }

  // Handle logo deletion
  const handleDeleteLogo = () => {
    setLogo(null)
    setPreviewUrl(null)
    setFile(null)
    setDeleteLogo(true)
  }

  // Show toast message
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message })
    setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  // Save widget settings
  const handleSave = async () => {
    if (!reviewSettings && !formChanged) return

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("auto_send_review", autoSendReview.toString())
      formData.append("review_delay_hours", reviewDelay.toString())

      if (file) {
        formData.append("logo", file)
        formData.append("clear_logo", "false")
      }

      if (deleteLogo) {
        formData.append("clear_logo", "true")
      }

      // Let the unified HTTP client handle FormData automatically
      await httpClient.patch("/api/v1/reviews/widget", formData)
      showToast("success", "Configuration saved successfully!")
      refetch() // Refresh data after successful update
      setFormChanged(false)
    } catch (error) {
      console.error("Error updating widget:", error)
      showToast("error", "Failed to save configuration. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const darkModeClass =
    localStorage.getItem("darkMode") === "true" ? "bg-bgdarktheme text-white" : "bg-white text-black"
  const API_HOST = import.meta.env.VITE_API_URL || "https://api.dev.tabla.ma"
  const currentUrl = window.location.href

  // Generate preview URL based on environment
  const getPreviewUrl = () => {
    if (currentUrl.includes("dev")) {
      return `https://${subdomain}.dev.tabla.ma/make/review/preview`
    } else if (currentUrl.includes("localhost")) {
      return `http://${subdomain}.localhost:5173/make/review/preview`
    } else {
      return `https://${subdomain}.tabla.ma/make/review/preview`
    }
  }

  if (isLoading) {
    return (
      <div className={`w-full mx-auto p-6 rounded-[10px] ${darkModeClass}`}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-greentheme"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full mx-auto p-6 rounded-[10px] ${darkModeClass} relative`}>
      <h1 className="text-2xl font-bold text-center mb-6">
        {t("settingsPage.widget.title")} for <span className="italic font-[600]">Reviews</span>
      </h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">{t('settingsPage.reviewWidget.labels.logo')}</label>
        {logo || previewUrl ? (
          <div className="relative w-full h-40 bg-gray-100 dark:bg-darkthemeitems rounded-lg overflow-hidden border border-gray-200 dark:border-darkthemeitems">
            <img
              src={previewUrl || (logo ? `${logo}` : "")}
              alt="Logo"
              className="w-full h-full object-contain"
            />
            <button
              onClick={handleDeleteLogo}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              aria-label="Delete logo"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-darkthemeitems rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-darkthemeitems transition-colors"
          >
            <Upload className="mr-2" size={20} />
            {t("settingsPage.widget.uploadLogo")}
          </button>
        )}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            {t("settingsPage.reviewWidget.labels.title")}
          </label>
          <input
            id="title"
            type="text"
            placeholder={t("settingsPage.widget.addTitlePlaceholder")}
            className="w-full inputs p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            {t("settingsPage.reviewWidget.labels.description")}
          </label>
          <textarea
            id="description"
            placeholder={t("settingsPage.widget.addDescriptionPlaceholder")}
            className="w-full inputs p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white lt-sm:w-full h-24 resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <label className="flex cursor-pointer">
          <input
            type="checkbox"
            checked={autoSendReview}
            onChange={() => setAutoSendReview((prev) => !prev)}
            className="sr-only"
          />
          <span
            className={`flex items-center justify-center w-6 h-6 border rounded-md mr-2 ${
              autoSendReview ? "bg-greentheme border-greentheme" : "border-gray-300 dark:border-darkthemeitems"
            }`}
          >
            {autoSendReview && <Check size={16} className="text-white" />}
          </span>
          <span className="text-sm font-medium">{t("settingsPage.reviewWidget.labels.enableAutoSend")}</span>
        </label>

        {autoSendReview && (
          <div>
            <label htmlFor="reviewDelay" className="block text-sm font-medium mb-2">
              {t("settingsPage.reviewWidget.labels.reviewDelay")}
            </label>
            <input
              id="reviewDelay"
              type="number"
              min="0"
              value={reviewDelay}
              onChange={(e) => setReviewDelay(Number(e.target.value))}
              className="w-full inputs p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 lt-md:flex-col">
        <button
          onClick={handleSave}
          disabled={isSubmitting || !formChanged}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center ${
            formChanged
              ? "bg-greentheme text-white hover:opacity-90"
              : "bg-gray-300 dark:bg-darkthemeitems text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              {t("settingsPage.widget.buttons.saving")}
            </>
          ) : (
            t("settingsPage.widget.buttons.save")
          )}
        </button>
        <Link
          to={getPreviewUrl()}
          target="_blank"
          className="btn-secondary w-1/2 text-center lt-md:w-full flex items-center justify-center"
        >
          {t("settingsPage.widget.buttons.preview")}
        </Link>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-white shadow-lg rounded-md overflow-hidden z-50 animate-slideDown max-w-md w-full">
          <div className="flex items-center p-4 pr-10 relative">
            <div className={`flex-shrink-0 mr-3 ${toast.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {toast.type === "success" ? (
                <div className="bg-green-100 rounded-full p-1">
                  <Check size={18} className="text-green-600" />
                </div>
              ) : (
                <div className="bg-red-100 rounded-full p-1">
                  <AlertCircle size={18} className="text-red-600" />
                </div>
              )}
            </div>
            <p className="text-gray-700 font-medium">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <div className={`h-1 ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`} />
        </div>
      )}
    </div>
  )
}

export default ReviewWidget