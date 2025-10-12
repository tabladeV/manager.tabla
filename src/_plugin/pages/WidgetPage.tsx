"use client"
import type React from "react"
import { useCallback, useEffect, useState, memo } from "react"
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Logo from "../../components/header/Logo"
import { LoaderCircle, ScreenShareIcon, ChevronDown, Facebook, Instagram, Twitter, Phone, Mail, MessageCircle, BadgeInfo, Globe } from "lucide-react"
import { SunIcon, MoonIcon, CheckIcon } from "../../components/icons"
import { type BaseKey, type BaseRecord, useCreate, useList, useOne } from "@refinedev/core"
import { format } from "date-fns"
import { getSubdomain } from "../../utils/getSubdomain"
import spanish from "../../assets/spanish.png"
import arabic from "../../assets/arabic.jpg"
import english from "../../assets/english.png"
import french from "../../assets/french.png"
import visaLogo from "../../assets/VISA.jpg"
import masterCardLogo from "../../assets/MasterCard.jpg"
import cmiLogo from "../../assets/CMI.jpg"
import { PhoneInput } from 'react-international-phone'
import WidgetReservationProcess from "../../components/reservation/WidgetReservationProcess"
import { useDateContext } from "../../context/DateContext"
import 'react-international-phone/style.css'
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback"
import { useNavigate } from "react-router-dom";
import { SharedWidgetFooter } from "../../components/reservation/SharedWidgetFooter"
// #region Child Components

interface QuillPreviewProps {
  content: string
  className?: string
}

const QuillPreview = memo(({ content, className = "" }: QuillPreviewProps) => {
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
})

const LanguageSelector = memo(() => {
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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg bg-[#f5f5f5] dark:bg-[#333333] bg-opacity-80 hover:bg-[#f5f5f5] dark:hover:bg-[#444444] transition-colors"
        aria-label="Select language"
      >
        <img src={currentLanguage.icon} alt={currentLanguage.name} className="w-6 h-6 rounded-full object-cover" />
        <span className="text-sm font-medium hidden sm:block">{currentLanguage.name}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 bg-white dark:bg-darkthemeitems rounded-lg shadow-lg border border-[#dddddd] dark:border-[#444444] z-50 min-w-[160px]">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f5f5f5] dark:hover:bg-bgdarktheme2 transition-colors first:rounded-t-lg last:rounded-b-lg ${currentLanguage.code === language.code ? "bg-[#f0f7e6] dark:bg-bgdarktheme2" : ""}`}
              >
                <img src={language.icon} alt={language.name} className="w-5 h-5 rounded-sm object-cover" />
                <span className="text-sm font-medium">{language.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
})

const WidgetHeader = memo(({ widgetInfo, onThemeToggle }: { widgetInfo: BaseRecord | undefined, onThemeToggle: () => void }) => {
  const { t } = useTranslation()
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="w-full max-w-[800px] mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={onThemeToggle}
              aria-label={t("reservationWidget.common.toggleDarkMode")}
              className="p-2 rounded-lg bg-[#f5f5f5] dark:bg-[#333333] bg-opacity-80 hover:bg-[#f5f5f5] dark:hover:bg-[#444444]"
            >
              <SunIcon size={20} className="dark:hidden text-white drop-shadow-lg" />
              <MoonIcon size={20} className="hidden dark:block text-white drop-shadow-lg" />
            </button>
            <LanguageSelector />
          </div>
        </div>
      </div>
      <div className="fixed w-full h-[80vh] min-h-[500px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[3px] scale-[1.1]"
          style={{ backgroundImage: `url(${widgetInfo?.image_2 || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2070&q=80'})` }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {widgetInfo?.image ? (
            <img src={widgetInfo.image} alt={t("reservationWidget.common.restaurant")} className="h-20 w-auto object-contain mt-[-150px]" />
          ) : (
            <Logo className="h-16 mt-[-150px]" nolink={true} />
          )}
        </div>
      </div>
    </>
  )
})

const ReservationPickerStep = memo(({ data, onShowProcess, onNextStep, widgetInfo }: { data: any, onShowProcess: () => void, onNextStep: () => void, widgetInfo: BaseRecord | undefined }) => {
  const { t } = useTranslation()
  const formatedDate = data.reserveDate ? format(new Date(data.reserveDate), "MMM-dd") : "----/--/--";
  const isButtonDisabled = !data.reserveDate || !data.time || !data.guests;

  return (
    <>
      <div className="mb-6">
        <div
          onClick={onShowProcess}
          className="grid grid-cols-3 gap-4 p-4 bg-[#f9f9f9] dark:bg-darkthemeitems rounded-lg cursor-pointer hover:bg-[#f0f0f0] dark:hover:bg-bgdarktheme2 transition-colors"
        >
          <div className="text-center">
            <span className="block text-sm font-[600] text-greentheme dark:text-greentheme">{t("reservationWidget.reservation.date")}</span>
            <span className="block text-sm font-medium mt-1">{formatedDate}</span>
          </div>
          <div className="text-center">
            <span className="block text-sm font-[600] text-greentheme dark:text-greentheme">{t("reservationWidget.reservation.time")}</span>
            <span className="block text-sm font-medium mt-1">{data.time || "--:--"}</span>
          </div>
          <div className="text-center">
            <span className="block text-sm font-[600] text-greentheme dark:text-greentheme">{t("reservationWidget.reservation.guests")}</span>
            <span className="block text-sm font-medium mt-1">{data.guests || "--"}</span>
          </div>
        </div>
      </div>
      <button
        onClick={onNextStep}
        disabled={isButtonDisabled}
        className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${isButtonDisabled ? "bg-[#88AB61] opacity-50 cursor-not-allowed" : "bg-[#88AB61] hover:bg-[#769c4f] text-white"}`}
      >
        {t("reservationWidget.reservation.bookNow")}
      </button>
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
  )
})

const UserInfoFormStep = memo(({
  userInformation,
  formErrors,
  chosenTitle,
  checkedConditions,
  checkedDressCode,
  widgetInfo,
  occasions,
  areas,
  areaSelected,
  onUserInformationChange,
  onChosenTitleChange,
  onCheckedConditionsChange,
  onCheckedDressCodeChange,
  onAreaSelectedChange,
  onSubmit,
  onBack,
  onDressCodePopupOpen
}: any) => {
  const { t } = useTranslation()

  const handleNameInput = (value: string, field: 'firstname' | 'lastname') => {
    const sanitized = value.replace(/[^a-zA-Z\s]/g, '')
    const spacesCleaned = sanitized.replace(/\s+/g, ' ')
    const limited = spacesCleaned.slice(0, 50)
    onUserInformationChange({ ...userInformation, [field]: limited })
  }

  const handleEmailInput = (value: string) => {
    const sanitized = value.replace(/[^a-zA-Z0-9._%+-@]/g, '').toLowerCase()
    const limited = sanitized.slice(0, 100)
    onUserInformationChange({ ...userInformation, email: limited })
  }

  const handlePhoneInput = (value: string) => {
    onUserInformationChange({ ...userInformation, phone: value })
  }

  const handleTextAreaInput = (value: string, field: 'preferences' | 'allergies') => {
    const sanitized = value.replace(/[<>"/\\&]/g, '')
    const limited = sanitized.slice(0, 500)
    onUserInformationChange({ ...userInformation, [field]: limited })
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{t("reservationWidget.form.yourInformation")}</h2>
      <form onSubmit={onSubmit} className="space-y-1">
        <div className="flex items-center gap-2 mb-4">
          <p className="text-sm font-bold text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.form.title")}</p>
          {(["mr", "mrs", "ms"] as const).map(title => (
            <label key={title} htmlFor={title} className="text-sm font-medium text-[#555555] dark:text-[#cccccc]">
              {t(`reservationWidget.form.${title}`)}
              <input
                type="checkbox"
                id={title}
                className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61] ml-1"
                checked={chosenTitle === title}
                onChange={() => onChosenTitleChange(title)}
              />
            </label>
          ))}
        </div>

        <div>
          <label htmlFor="firstname" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">{t("reservationWidget.form.firstName")} *</label>
          <input id="firstname" type="text" placeholder={t("reservationWidget.form.firstNamePlaceholder")} value={userInformation.firstname} onChange={(e) => handleNameInput(e.target.value, 'firstname')} maxLength={50} className={`w-full p-3 rounded-md border ${formErrors.firstname ? "border-red-500" : "border-[#dddddd] dark:border-[#444444]"} bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]`} />
          {formErrors.firstname && <p className="mt-1 text-sm text-red-500">{formErrors.firstname}</p>}
        </div>

        <div>
          <label htmlFor="lastname" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">{t("reservationWidget.form.lastName")} *</label>
          <input id="lastname" type="text" placeholder={t("reservationWidget.form.lastNamePlaceholder")} value={userInformation.lastname} onChange={(e) => handleNameInput(e.target.value, 'lastname')} maxLength={50} className={`w-full p-3 rounded-md border ${formErrors.lastname ? "border-red-500" : "border-[#dddddd] dark:border-[#444444]"} bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]`} />
          {formErrors.lastname && <p className="mt-1 text-sm text-red-500">{formErrors.lastname}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">{t("reservationWidget.form.email")} *</label>
          <input id="email" type="email" placeholder={t("reservationWidget.form.emailPlaceholder")} value={userInformation.email} onChange={(e) => handleEmailInput(e.target.value)} maxLength={100} className={`w-full p-3 rounded-md border ${formErrors.email ? "border-red-500" : "border-[#dddddd] dark:border-[#444444]"} bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]`} />
          {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">{t("reservationWidget.form.phone")} *</label>
          <PhoneInput defaultCountry="ma" placeholder={t("reservationWidget.form.phonePlaceholder")} value={userInformation.phone} onChange={handlePhoneInput}
            className={`${formErrors.phone ? "border-red-500" : "border-[#dddddd] dark:border-[#444444]"} bg-white dark:!bg-darkthemeitems !text-black dark:!text-white !h-[50px] focus:!outline-none focus:!ring-2 focus:!ring-[#88AB61]`}
            countrySelectorStyleProps={{
              className: "!border-[#dddddd] dark:!border-[#444444] !bg-white dark:!bg-darkthemeitems",
              buttonClassName: "!border-[#dddddd] dark:!border-[#444444] !bg-white dark:!bg-darkthemeitems !text-black dark:!text-white !h-[50px]",
              dropdownStyleProps: { className: "!bg-white dark:!bg-darkthemeitems !text-black dark:!text-white", listItemClassName: "hover:!bg-[#f0f0f0] dark:hover:!bg-bgdarktheme2" }
            }}
            dialCodePreviewStyleProps={{ className: "!border-r-[#dddddd] dark:!border-r-[#444444] !bg-white dark:!bg-darkthemeitems !text-black dark:!text-white !h-[50px]" }}
            inputClassName={`w-full !p-3 rounded-md border ${formErrors.phone ? "!border-red-500" : "!border-[#dddddd] !dark:border-[#444444]"} bg-white dark:!bg-darkthemeitems !text-black dark:!text-white !h-[50px] focus:!outline-none focus:!ring-2 focus:!ring-[#88AB61]`} />
          {formErrors.phone && <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>}
        </div>

        <div>
          <label htmlFor="allergies" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">{t("reservationWidget.form.allergies")}</label>
          <textarea id="allergies" placeholder={t("reservationWidget.form.allergiesPlaceholder")} value={userInformation.allergies} onChange={(e) => handleTextAreaInput(e.target.value, 'allergies')} maxLength={500} className="w-full p-3 rounded-md border border-[#dddddd] dark:border-[#444444] bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]" rows={2} />
          <div className="flex justify-end mt-1"><span className="text-xs text-gray-500 dark:text-gray-400">{userInformation.allergies.length}/500</span></div>
        </div>

        <div>
          <label htmlFor="preferences" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">{t("reservationWidget.form.preferences")}</label>
          <textarea id="preferences" placeholder={t("reservationWidget.form.preferencesPlaceholder")} value={userInformation.preferences} onChange={(e) => handleTextAreaInput(e.target.value, 'preferences')} maxLength={500} className="w-full p-3 rounded-md border border-[#dddddd] dark:border-[#444444] bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]" rows={2} />
          <div className="flex justify-end mt-1"><span className="text-xs text-gray-500 dark:text-gray-400">{userInformation.preferences.length}/500</span></div>
        </div>

        <div>
          <label htmlFor="occasion" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">{t("reservationWidget.form.occasion")}</label>
          <select id="occasion" value={userInformation.occasion} onChange={(e) => onUserInformationChange({ ...userInformation, occasion: e.target.value })} className="w-full p-3 rounded-md border border-[#dddddd] dark:border-[#444444] bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]">
            <option value="0">{t("reservationWidget.form.occasionPlaceholder")}</option>
            {(occasions ?? []).map((occasion: BaseRecord) => (<option key={occasion.id} value={occasion.id}>{occasion.name}</option>))}
          </select>
        </div>

        {widgetInfo?.enbale_area_selection && (
          <div>
            <label htmlFor="floors" className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">{t("reservationWidget.form.areas")}</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {areas.map((floor: any) => (
                <label key={floor.id} className="inline-flex items-center bg-softgreentheme text-greentheme p-2 rounded-md cursor-pointer">
                  <input type="checkbox" value={floor.id} checked={areaSelected === floor.id} onChange={() => onAreaSelectedChange(floor.id)} className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61]" />
                  <span className="ml-2 text-sm">{floor.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-start pt-2 border-t border-[#dddddd] dark:border-[#444444]">
          <input type="checkbox" id="terms" checked={checkedConditions} onChange={() => onCheckedConditionsChange(!checkedConditions)} className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61]" />
          <label htmlFor="terms" className="ml-2 block text-sm text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.form.agreeToTerms")}{" "}<Link to="/terms-and-conditions" className="underline font-medium text-[#88AB61]" target="_blank">{t("reservationWidget.form.termsAndConditions")}</Link></label>
        </div>

        {widgetInfo?.enable_dress_code && (
          <div className="flex items-start pt-2">
            <input type="checkbox" id="DressCode" checked={checkedDressCode} onChange={() => onCheckedDressCodeChange(!checkedDressCode)} className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61]" />
            <label htmlFor="DressCode" className="ml-2 block text-sm text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.form.agreeToDressCode")} ({widgetInfo?.dress_code && widgetInfo.dress_code.length > 100 ? `${widgetInfo.dress_code.substring(0, 100)}... ` : widgetInfo?.dress_code || t("reservationWidget.form.noDressCode")}{widgetInfo?.dress_code && widgetInfo.dress_code.length > 100 && (<button type="button" onClick={onDressCodePopupOpen} className="underline font-medium text-[#88AB61]">{t("reservationWidget.common.readMore")}</button>)})</label>
          </div>
        )}

        <div className="flex gap-4 pt-2">
          <button type="button" onClick={onBack} className="flex-1 py-3 px-4 rounded-md font-medium border border-[#dddddd] dark:border-[#444444] hover:bg-[#f5f5f5] dark:hover:bg-bgdarktheme2 transition-colors">{t("reservationWidget.common.back")}</button>
          <button type="submit" disabled={!checkedConditions || (widgetInfo?.enable_dress_code ? !checkedDressCode : false)} className={`bg-[#88AB61] flex-1 py-3 px-4 rounded-md font-medium transition-colors ${!checkedConditions || (widgetInfo?.enable_dress_code ? !checkedDressCode : false) ? "bg-[#88AB61] opacity-50 cursor-not-allowed" : "hover:bg-[#769c4f] text-white"}`}>{t("reservationWidget.common.continue")}</button>
        </div>
      </form>
    </div>
  )
})

const ConfirmationStep = memo(({ data, userInformation, chosenTitle, occasions, areas, areaSelected, onConfirm, onBack, isLoading, isPaymentRequired, totalAmount, paymentError }: any) => {
  const { t } = useTranslation()
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{t("reservationWidget.payment.reservationSummary")}</h2>
      <div className="space-y-4 mb-6">
        <div className="bg-[#f9f9f9] dark:bg-darkthemeitems rounded-lg p-4">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.name")}: </span><span className="font-medium">{chosenTitle ? chosenTitle + ". " : ""}{userInformation.firstname} {userInformation.lastname}</span></div>
              <div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.email")}: </span><span>{userInformation.email}</span></div>
              <div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.phone")}: </span><span>{userInformation.phone}</span></div>
            </div>
            <div className="border-t border-[#dddddd] dark:border-[#444444] pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.dateTime")}: </span><span className="font-medium">{format(new Date(data.reserveDate), "MMMM d, yyyy")} {t("reservationWidget.confirmation.at")} {data.time}</span></div>
                <div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.guests")}: </span><span className="font-medium">{data.guests} {data.guests === 1 ? t("reservationWidget.confirmation.person") : t("reservationWidget.confirmation.people")}</span></div>
              </div>
            </div>
            {(userInformation.occasion || areaSelected || userInformation.allergies || userInformation.preferences) && (
              <div className="border-t border-[#dddddd] dark:border-[#444444] pt-3">
                <div className="space-y-2 text-sm">
                  {userInformation.occasion && userInformation.occasion !== "0" && (<div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.occasion")}: </span><span>{occasions?.find((o: BaseRecord) => o.id === Number(userInformation.occasion))?.name}</span></div>)}
                  {areaSelected && (<div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.form.areas")}: </span><span>{areas.find((a: any) => a.id === areaSelected)?.name}</span></div>)}
                  {userInformation.allergies && (<div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.allergies")}: </span><span className="text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2 py-1 rounded">{userInformation.allergies}</span></div>)}
                  {userInformation.preferences && (<div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.preferences")}: </span><span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">{userInformation.preferences}</span></div>)}
                </div>
              </div>
            )}
            {isPaymentRequired && (
              <div className="border-t border-[#dddddd] dark:border-[#444444] pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.payment.amountToPay")}</span>
                  <span className="font-bold text-[#88AB61] text-lg">{totalAmount}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        {paymentError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-md">
            <p className="font-medium">{t("reservationWidget.payment.errorTitle")}:</p><p className="text-sm mt-1">{paymentError}</p>
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <button onClick={onBack} disabled={isLoading} className="flex-1 py-3 px-4 rounded-md font-medium border border-[#dddddd] dark:border-[#444444] hover:bg-[#f5f5f5] dark:hover:bg-bgdarktheme2 transition-colors disabled:opacity-50">{t("reservationWidget.common.back")}</button>
        <button onClick={onConfirm} disabled={isLoading} className="flex-1 py-3 px-4 rounded-md font-medium bg-[#88AB61] hover:bg-[#769c4f] text-white transition-colors disabled:opacity-50 flex justify-center items-center">
          {isLoading ? (<><LoaderCircle className="animate-spin mr-2" size={18} />{t("reservationWidget.confirmation.processing")}</>) : (isPaymentRequired ? t("reservationWidget.payment.proceedToPayment") : t("reservationWidget.payment.proceedToConfirmation"))}
        </button>
      </div>
    </div>
  )
})

const SuccessStep = memo(({ widgetInfo, onReset }: { widgetInfo: any, onReset: () => void }) => {
  const { t } = useTranslation()
  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-[#f0f7e6] dark:bg-bgdarktheme2 rounded-full flex items-center justify-center mx-auto mb-4"><CheckIcon size={32} /></div>
      <h2 className="text-2xl font-semibold mb-2">{widgetInfo?.auto_confirmation ? t("reservationWidget.success.confirmed") : t("reservationWidget.success.completed")}</h2>
      <p className="font-[600] text-greentheme dark:text-greentheme mb-6">{t("reservationWidget.success.message")}</p>
      <button onClick={onReset} className="py-3 px-6 rounded-md font-medium bg-[#88AB61] hover:bg-[#769c4f] text-white transition-colors">{t("reservationWidget.success.makeAnother")}</button>
    </div>
  )
})

const UnavailableStep = memo(({ widgetInfo }: { widgetInfo: any }) => {
  const { t } = useTranslation()
  return (
    <div className="text-center py-4">
      <h2 className="text-2xl font-semibold mb-4">{widgetInfo?.disabled_title || t("reservationWidget.unavailable.title")}</h2>
      <p className="font-[600] text-greentheme dark:text-greentheme">{widgetInfo?.disabled_description || t("reservationWidget.unavailable.description")}</p>
    </div>
  )
})
// #endregion

// #region Main Component
const WidgetPage = () => {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()
  const { restaurant } = useParams()
  const [searchParams, setSearchParams] = useSearchParams();
  const step = parseInt(searchParams.get("step") || "1", 10);

  const { preferredLanguage } = useDateContext()

  const PAYMENT_ENABLED = true
  const FORM_DATA_KEY = 'tabla_widget_form_data'
  const RESERVATION_DATA_KEY = 'tabla_widget_reservation_data'

  // API Data Fetching
  const { data: widgetData } = useOne({ resource: `api/v1/bo/subdomains/public/cutomer/reservations`, id: "" })
  const { data: occasionsData } = useList({ resource: `api/v1/bo/restaurants/subdomain/occasions` })
  const { mutate: createReservation } = useCreate()
  const { mutate: createPaymentInitiation } = useCreate()

  // Component State
  const [widgetInfo, setWidgetInfo] = useState<BaseRecord>()
  const [restaurantID, setRestaurantID] = useState<BaseKey>()
  const [occasions, setOccasions] = useState<BaseRecord[]>()
  const [areas, setAreas] = useState<any[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string>()
  const [showProcess, setShowProcess] = useState(false)
  const [dressCodePopupOpen, setDressCodePopupOpen] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true);


  // Form State
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(FORM_DATA_KEY);
    return saved ? JSON.parse(saved).data : { reserveDate: "", time: "", guests: 0 };
  });
  const [userInformation, setUserInformation] = useState(() => {
    const saved = localStorage.getItem(FORM_DATA_KEY);
    return saved ? JSON.parse(saved).userInformation : { firstname: "", lastname: "", email: "", phone: "", preferences: "", allergies: "", occasion: "" };
  });
  const [formErrors, setFormErrors] = useState({ firstname: "", lastname: "", email: "", phone: "" })
  const [chosenTitle, setChosenTitle] = useState(() => {
    const saved = localStorage.getItem(FORM_DATA_KEY);
    return saved ? JSON.parse(saved).chosenTitle : undefined;
  });
  const [checkedConditions, setCheckedConditions] = useState(() => {
    const saved = localStorage.getItem(FORM_DATA_KEY);
    return saved ? JSON.parse(saved).checkedConditions : false;
  });
  const [checkedDressCode, setCheckedDressCode] = useState(() => {
    const saved = localStorage.getItem(FORM_DATA_KEY);
    return saved ? JSON.parse(saved).checkedDressCode : false;
  });
  const [areaSelected, setAreaSelected] = useState(() => {
    const saved = localStorage.getItem(FORM_DATA_KEY);
    return saved ? JSON.parse(saved).areaSelected : undefined;
  });

  // Payment State
  const [paymentData, setPaymentData] = useState<any | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [reservationId, setReservationId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Browser Info
  const [browserInfo, setBrowserInfo] = useState({ userAgent: "", screenHeight: 0, screenWidth: 0, colorDepth: 0 })

  // Effects
  useEffect(() => { document.title = t("reservationWidget.page.title") }, [pathname, t])


  useEffect(() => {
    const storedLang = localStorage.getItem("preferredLanguage");
    const browserLang = navigator.language.split('-')[0];
    const supportedLanguages = ['en', 'es', 'fr', 'ar'];
    const defaultLang = supportedLanguages.includes(browserLang) ? browserLang : 'en';
    const langToSet = storedLang || defaultLang;
    if (!storedLang) localStorage.setItem("preferredLanguage", langToSet);
    i18n.changeLanguage(langToSet);
  }, [i18n]);

  useEffect(() => {
    if (widgetData) {
      const info = widgetData.data;
      setWidgetInfo(info);
      setRestaurantID(info.restaurant);
      setAreas(info.areas || []);

      // Perform step validation and redirection logic here, once data is loaded
      const isStep1DataMissing = !data.reserveDate || !data.time || !data.guests;
      const isStep2DataMissing = !userInformation.firstname || !userInformation.lastname || !userInformation.email || !userInformation.phone;

      if (!info.is_widget_activated) {
        setSearchParams({ step: "6" }, { replace: true });
      } else if (step > 1 && step < 5 && isStep1DataMissing) {
        setSearchParams({ step: "1" }, { replace: true });
      } else if (step > 2 && step < 5 && isStep2DataMissing) {
        setSearchParams({ step: "2" }, { replace: true });
      } else if (!searchParams.has("step")) {
        setSearchParams({ step: "1" }, { replace: true });
      }
      
      setIsInitialLoading(false); // Mark initial loading as complete
    }
  }, [widgetData, data, userInformation, step, setSearchParams]);

  useEffect(() => { if (occasionsData) setOccasions(occasionsData.data as unknown as BaseRecord[]) }, [occasionsData]);

  useEffect(() => {
    const formData = { data, userInformation, chosenTitle, checkedConditions, checkedDressCode, areaSelected };
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
  }, [data, userInformation, chosenTitle, checkedConditions, checkedDressCode, areaSelected]);


  useEffect(() => {
    if (typeof window !== "undefined") {
      setBrowserInfo({ userAgent: navigator.userAgent, screenHeight: window.screen.height, screenWidth: window.screen.width, colorDepth: window.screen.colorDepth });
      const isDarkMode = localStorage.getItem("darkMode") === "true";
      if (isDarkMode) document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    setIsAnimating(true);
  }, [step]);

  // Validation
  const validateForm = useCallback(() => {
    const errors = { firstname: "", lastname: "", email: "", phone: "" };
    let isValid = true;
    const nameRegex = /^[a-zA-Z\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!userInformation.firstname.trim() || userInformation.firstname.trim().length < 2 || !nameRegex.test(userInformation.firstname)) {
      errors.firstname = t("reservationWidget.validation.firstNameInvalid");
      isValid = false;
    }
    if (!userInformation.lastname.trim() || userInformation.lastname.trim().length < 2 || !nameRegex.test(userInformation.lastname)) {
      errors.lastname = t("reservationWidget.validation.lastNameInvalid");
      isValid = false;
    }
    if (!userInformation.email.trim() || !emailRegex.test(userInformation.email)) {
      errors.email = t("reservationWidget.validation.emailInvalid");
      isValid = false;
    }
    if (!userInformation.phone.trim() || userInformation.phone.replace(/[^\d]/g, '').length < 8) {
      errors.phone = t("reservationWidget.validation.phoneInvalid");
      isValid = false;
    }
    setFormErrors(errors);
    return isValid;
  }, [userInformation, t]);

  // Re-validate form on user input to provide reactive feedback
  useEffect(() => {
    // Don't run validation on initial mount or if there are no errors to clear
    const hasErrors = Object.values(formErrors).some(error => error !== "");
    if (hasErrors) {
      validateForm();
    }
  }, [userInformation, formErrors, validateForm]);

  // Handlers
  const changeStep = useCallback((newStep: number) => {
    setIsAnimating(false);
    setPaymentError(null);
    setTimeout(() => {
      setSearchParams({ step: newStep.toString() });
    }, 300); // Match this with your transition duration
  }, [setSearchParams]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      changeStep(3);
    }
  };

  const handleConfirmation = () => {
    setIsLoading(true);
    setServerError("");
    setPaymentError(null);

    createReservation({
      resource: `api/v1/bo/subdomains/public/cutomer/reservations/`,
      values: {
        customer: { title: chosenTitle, email: userInformation.email, first_name: userInformation.firstname, last_name: userInformation.lastname, phone: userInformation.phone },
        restaurant: restaurantID as number,
        occasion: Number(userInformation.occasion) || null,
        source: "WIDGET",
        status: "PENDING",
        allergies: userInformation.allergies,
        preferences: userInformation.preferences,
        area: areaSelected,
        date: format(new Date(data.reserveDate), "yyyy-MM-dd"),
        time: data.time + ":00",
        number_of_guests: data.guests,
      },
    }, {
      onSuccess: (responseData) => {
        const reservation = responseData?.data?.reservation;
        if (reservation?.id) {
          const numericId = Number(reservation.id);
          setReservationId(numericId);
          
          localStorage.setItem(RESERVATION_DATA_KEY, JSON.stringify({ reservationId: numericId, timestamp: Date.now() }));
          if (isPaymentRequired(data.guests)) {
            initiatePayment(numericId);
          } else {
            setIsLoading(false);
            changeStep(5); // Success step
          }
        } else {
          // This case might indicate a server issue where reservation is created but ID is not returned
          setIsLoading(false);
          setServerError(t("reservationWidget.errors.serverError"));
        }
      },
      onError: (error) => {
        setIsLoading(false);
        setServerError(error?.response?.data?.non_field_errors?.join(", ") || error?.message || t("reservationWidget.errors.serverError"));
      },
    });
  };

  const initiatePayment = (resId: number) => {
    setPaymentError(null);
    createPaymentInitiation({
      resource: 'api/v1/bo/payments/initiate/',
      values: { reservation_id: resId, BROWSER_JAVA_ENABLED: navigator.javaEnabled?.() ? "true" : "false", BROWSER_COLOR_DEPTH: browserInfo.colorDepth, BROWSER_SCREEN_HEIGHT: browserInfo.screenHeight, BROWSER_SCREEN_WIDTH: browserInfo.screenWidth, USER_AGENT: browserInfo.userAgent, LANGUAGE: i18n.language }
    }, {
      onSuccess: (response) => {
        setPaymentData(response.data);
        // Automatically submit the payment form upon successful initiation
        submitPaymentForm(response.data);
      },
      onError: (error) => {
        console.log('heyy')
        console.log({...error})
        setIsLoading(false);
        setPaymentError(error?.response?.data?.non_field_errors?.join(", ") || error?.message || t("reservationWidget.errors.paymentInitiationFailed"));
      }
    });
  };

  const submitPaymentForm = (paymentPayload: any) => {
    if (!paymentPayload?.pay_url || !paymentPayload?.form_data) {
      setIsLoading(false);
      setPaymentError(t("reservationWidget.errors.paymentDetailsError"));
      return;
    }
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentPayload.pay_url;
    for (const key in paymentPayload.form_data) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(paymentPayload.form_data[key]);
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
    // No need to set isLoading to false here, as the page will redirect
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("darkMode", document.documentElement.classList.contains("dark") ? "true" : "false");
  };

  const handleDescriptionToggle = useDebouncedCallback(() => setShowFullDescription(prev => !prev), 300);

  const calculateTotalAmount = () => {
    if (widgetInfo?.enable_paymant && widgetInfo?.deposite_amount_for_guest) {
      return (Number(widgetInfo.deposite_amount_for_guest) * data.guests).toFixed(2) + " " + (widgetInfo?.currency || "MAD");
    }
    return "0.00";
  };

  const isPaymentRequired = (guestCount: number) => {
    if (!widgetInfo?.enable_paymant) return false;
    const minGuestsForPayment = widgetInfo?.min_number_of_guests_without_deposite || 1;
    return guestCount >= minGuestsForPayment;
  };

  const handleNewReservation = () => {
    localStorage.removeItem(FORM_DATA_KEY);
    localStorage.removeItem(RESERVATION_DATA_KEY);
    navigate('/make/reservation');
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <ReservationPickerStep data={data} onShowProcess={() => setShowProcess(true)} onNextStep={() => changeStep(2)} widgetInfo={widgetInfo} />;
      case 2: return <UserInfoFormStep userInformation={userInformation} formErrors={formErrors} chosenTitle={chosenTitle} checkedConditions={checkedConditions} checkedDressCode={checkedDressCode} widgetInfo={widgetInfo} occasions={occasions} areas={areas} areaSelected={areaSelected} onUserInformationChange={setUserInformation} onChosenTitleChange={setChosenTitle} onCheckedConditionsChange={setCheckedConditions} onCheckedDressCodeChange={setCheckedDressCode} onAreaSelectedChange={setAreaSelected} onSubmit={handleSubmit} onBack={() => changeStep(1)} onDressCodePopupOpen={() => setDressCodePopupOpen(true)} />;
      case 3: return <ConfirmationStep data={data} userInformation={userInformation} chosenTitle={chosenTitle} occasions={occasions} areas={areas} areaSelected={areaSelected} onConfirm={handleConfirmation} onBack={() => changeStep(2)} isLoading={isLoading} isPaymentRequired={isPaymentRequired(data.guests)} totalAmount={calculateTotalAmount()} paymentError={paymentError || serverError} />;
      case 5: return <SuccessStep widgetInfo={widgetInfo} onReset={() => handleNewReservation()} />;
      case 6: return <UnavailableStep widgetInfo={widgetInfo} />;
      default: return null;
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-bgdarktheme2">
        <LoaderCircle className="animate-spin text-[#88AB61]" size={48} />
      </div>
    );
  }

  return (
    <div className={`overflow-y-auto min-h-screen max-h-screen bg-white dark:bg-bgdarktheme2 text-black dark:text-white ${preferredLanguage === "ar" ? "rtl" : ""}`}>
      <WidgetHeader widgetInfo={widgetInfo} onThemeToggle={toggleDarkMode} />
      <div className="relative pt-[370px]">
        <div className="w-full max-w-[800px] mx-auto px-0">
          <div className="bg-white dark:bg-darkthemeitems rounded-t-3xl shadow-2xl overflow-hidden">
            {isPaymentRequired(data.guests) && (
              <div className="bg-softbluetheme mx-4 mt-4 rounded-xl flex justify-between text-bluetheme p-2">
                <div className="flex gap-2 justify-start items-center" role="alert">
                  <BadgeInfo className="inline-block mx-2" />
                  <div>
                    <p className="font-bold">{t("reservationWidget.payment.paymentNoticeTitle")}</p>
                    <p className="text-sm">{t("reservationWidget.payment.paymentNoticeDescription")}</p>
                  </div>
                </div>
                <div className="flex-1 font-[900] p-2 rounded-lg flex items-center justify-center w-fit h-fit text-bluetheme">
                  {calculateTotalAmount()}
                </div>
              </div>
            )}
            <div className={`p-6 transition-all duration-300 ease-in-out ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              {renderStep()}
            </div>
            <SharedWidgetFooter widgetInfo={widgetInfo} isPaymentRequired={isPaymentRequired(data.guests)} showDescription={step === 1} />
          </div>
        </div>
      </div>

      {showProcess && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkthemeitems rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <WidgetReservationProcess onClick={() => setShowProcess(false)} maxGuests={widgetInfo?.max_of_guests_par_reservation} resData={data} getDateTime={setData} />
          </div>
        </div>
      )}

      {dressCodePopupOpen && (
        <div onClick={() => setDressCodePopupOpen(false)} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkthemeitems rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">{t("reservationWidget.form.dressCode")}</h3>
            <p className="mb-4">{widgetInfo?.dress_code}</p>
            <div className="flex justify-end">
              <button type="button" onClick={() => setDressCodePopupOpen(false)} className="py-2 px-4 bg-[#88AB61] text-white rounded-lg hover:bg-[#769c4f]">{t("reservationWidget.common.close")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WidgetPage;