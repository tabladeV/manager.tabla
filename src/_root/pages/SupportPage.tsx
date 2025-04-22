"use client"

import { FileQuestion, Mail, Copy, Check } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

export default function SupportPage() {
  const [showMail, setShowMail] = useState(false)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    document.title = "Support Page"
  }, [])

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText("contact@tabla.ma")
    setShowToast(true)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl ">
      <div className="text-center space-y-4 mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-blacktheme dark:text-textdarktheme">Support Center</h1>
        <p className="text-xl text-subblack dark:text-textdarktheme/80">How can we help you today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <Link to="/faq" className="block h-full no-underline">
          <div className="h-full border   border-softgreytheme rounded-lg shadow-sm transition-all hover:shadow-md hover:border-greentheme dark:border-darkthemeitems dark:hover:border-greentheme bg-white dark:bg-bgdarktheme">
            <div className="flex flex-col items-center justify-center p-8 h-full text-center space-y-4 ">
              <div className="h-16 w-16 rounded-full bg-softgreytheme dark:bg-darkthemeitems flex items-center justify-center">
                <FileQuestion className="h-8 w-8 text-blacktheme dark:text-textdarktheme" />
              </div>
              <h2 className="text-2xl font-semibold text-blacktheme dark:text-textdarktheme">
                Frequently Asked Questions
              </h2>
              <p className="text-subblack dark:text-textdarktheme/80">
                Find answers to common questions about our services
              </p>
            </div>
          </div>
        </Link>

        <div className="h-full border border-softgreytheme rounded-lg shadow-sm transition-all hover:shadow-md hover:border-greentheme dark:border-darkthemeitems dark:hover:border-greentheme bg-white dark:bg-bgdarktheme">
          <button
            className="w-full h-full p-8 flex flex-col items-center justify-center space-y-4 bg-transparent border-0 cursor-pointer"
            onClick={() => setShowMail(!showMail)}
          >
            <div className="h-16 w-16 rounded-full bg-softgreytheme dark:bg-darkthemeitems flex items-center justify-center">
              <Mail className="h-8 w-8 text-blacktheme dark:text-textdarktheme" />
            </div>
            <h2 className="text-2xl font-semibold text-blacktheme dark:text-textdarktheme">Contact Tabla</h2>
            <p className="text-subblack dark:text-textdarktheme/80">Reach out to our support team for assistance</p>
          </button>
        </div>
      </div>

      {showMail && (
        <div className="mt-12 flex flex-col items-center justify-center space-y-4 animate-fadeIn">
          <div className="bg-whitetheme dark:bg-bgdarktheme p-6 rounded-lg shadow-sm border border-softgreytheme dark:border-darkthemeitems w-full max-w-md">
            <p className="text-center font-medium mb-4 text-blacktheme dark:text-textdarktheme">Contact us at:</p>
              <div className="flex items-center justify-between gap-3">

              <a href="mailto:contact@tabla.ma" className="btn-secondary flex gap-3 w-full items-center justify-center h-[50px]">
                  <Mail size={20} />
                  contact@tabla.ma
              </a>
              <div className="relative group h-[50px] flex items-center justify-center">
                <button
                  className="btn h-[50px] w-[50px] "
                  onClick={copyEmailToClipboard}
                >
                  <Copy size={18} className="opacity-70" />
                </button>
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-blacktheme dark:bg-darkthemeitems text-whitetheme px-3 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-max max-w-[200px] text-center">
                  Click to copy email address
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-whitetheme dark:bg-bgdarktheme2 border border-softgreytheme dark:border-darkthemeitems shadow-lg rounded-lg p-4 flex items-center gap-3 animate-slideUp z-50">
          <div className="h-8 w-8 bg-softgreentheme dark:bg-softgreentheme rounded-full flex items-center justify-center">
            <Check className="h-4 w-4 text-greentheme dark:text-greentheme" />
          </div>
          <div>
            <h3 className="font-medium text-blacktheme dark:text-textdarktheme">Email copied!</h3>
            <p className="text-subblack dark:text-textdarktheme/80 text-sm">
              Email address has been copied to clipboard
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
