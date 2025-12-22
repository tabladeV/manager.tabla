"use client"
import type React from "react"
import { useCallback, useEffect, useState, memo, useMemo, useRef } from "react"
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Logo from "../../components/header/Logo"
import { LoaderCircle, ScreenShareIcon, ChevronDown, Facebook, Instagram, Twitter, Phone, Mail, MessageCircle, BadgeInfo, Globe, X, AlertOctagon, Bell, Layers, Upload, File as FileIcon, Trash2 } from "lucide-react"
import { SunIcon, MoonIcon, CheckIcon } from "../../components/icons"
import { type BaseKey, type BaseRecord, useCreate, useList, useCustom } from "@refinedev/core"
import { format, compareAsc, parse, startOfDay } from "date-fns"
import { PhoneInput } from 'react-international-phone'
import WidgetReservationProcess from "../../components/reservation/WidgetReservationProcess"
import { useDateContext } from "../../context/DateContext"
import 'react-international-phone/style.css'
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback"
import { useNavigate } from "react-router-dom";
import { SharedWidgetFooter } from "../../components/reservation/SharedWidgetFooter"
import LanguageSelector from "./LanguageSelector"
import { useWidgetData } from "../../hooks/useWidgetData"
import AlertDisplay, { Alert } from "../../components/reservation/EventAlerts"
import QuillPreview from '../../components/common/QuillPreview';

// --- Alert Configuration ---
const alertDisplayMode: 'popup' | 'inline' | 'modal' | 'none' = 'inline'; // Change this to 'inline' or 'none'

const WidgetHeader = memo(({ widgetInfo, onThemeToggle }: { widgetInfo: BaseRecord | undefined, onThemeToggle: () => void }) => {
  const { t } = useTranslation()
  return (
    <>
      <div className="z-50 bg-transparent">
        <div className="w-full max-w-[800px] mx-auto px-4">
          <div className="flex items-center justify-between pb-2">
            <div className="w-1/3">
              <button
                onClick={onThemeToggle}
                aria-label={t("reservationWidget.common.toggleDarkMode")}
                className="p-2 rounded-lg bg-[#f5f5f5] dark:bg-[#333333] bg-opacity-80 hover:bg-[#f5f5f5] dark:hover:bg-[#444444]"
              >
                <SunIcon size={20} className="dark:hidden text-white drop-shadow-lg" />
                <MoonIcon size={20} className="hidden dark:block text-white drop-shadow-lg" />
              </button>
            </div>
            <div className="h-14 flex items-center justify-center w-1/3">
              {widgetInfo?.image ? (
                <img src={widgetInfo.image} alt={t("reservationWidget.common.restaurant")} className="h-14 w-auto object-contain" />
              ) : (
                <Logo className="h-14" nolink={true} />
              )}
            </div>
            <LanguageSelector />
          </div>
        </div>
      </div>
    </>
  )
})

const ReservationPickerStep = memo(({ data, onShowProcess, onNextStep, handleEventBookNow, widgetInfo, isCheckingPayment }: { data: any, onShowProcess: () => void, onNextStep: () => void, handleEventBookNow: (event: any) => void, widgetInfo: BaseRecord | undefined, isCheckingPayment: boolean }) => {
  const { t } = useTranslation()
  const formatedDate = data.reserveDate ? format(new Date(data.reserveDate), "MMM-dd") : "----/--/--";
  const isDataComplete = data.reserveDate && data.time && data.guests > 0;
  const isButtonDisabled = !isDataComplete || isCheckingPayment;

  const alerts = useMemo(() => {
    return widgetInfo?.events || []
  }, [widgetInfo]);

  return (
    <div>
      <div className="mb-6">
          <AlertDisplay
            alerts={alerts}
            mode={alertDisplayMode} // popup || modal
            widgetLogoUrl={widgetInfo?.image}
            onBookNow={handleEventBookNow}
          />
        <div
          onClick={onShowProcess}
          className="relative grid grid-cols-3 gap-4 overflow-hidden p-4 bg-[#f9f9f9] dark:bg-darkthemeitems rounded-lg cursor-pointer hover:bg-[#f0f0f0] dark:hover:bg-bgdarktheme2 transition-colors"
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
          <div className="hidden dark:block absolute inset-0 h-full w-full bg-black/20"></div>
        </div>
      </div>
      <button
        onClick={onNextStep}
        disabled={isButtonDisabled}
        className={`w-full py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center ${isButtonDisabled ? "bg-[#88AB61] opacity-50 cursor-not-allowed" : "bg-[#88AB61] hover:bg-[#769c4f] text-white"}`}
      >
        {isCheckingPayment && <LoaderCircle className="animate-spin mr-2" size={18} />}
        {isCheckingPayment ? t("reservationWidget.payment.checking") : t("reservationWidget.reservation.bookNow")}
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
    </div>
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
  attachment,
  attachmentError,
  isAttachmentFeatureEnabled,
  onUserInformationChange,
  onChosenTitleChange,
  onCheckedConditionsChange,
  onCheckedDressCodeChange,
  onAreaSelectedChange,
  onAttachmentChange,
  onRemoveAttachment,
  onSubmit,
  onBack,
  onDressCodePopupOpen
}: any) => {
  const { t } = useTranslation()
  const [isDragging, setIsDragging] = useState(false);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragIn = (e: React.DragEvent) => {
    handleDrag(e);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };
  const handleDragOut = (e: React.DragEvent) => {
    handleDrag(e);
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    handleDrag(e);
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAttachmentChange({ target: { files: e.dataTransfer.files } });
      e.dataTransfer.clearData();
    }
  };

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

        {isAttachmentFeatureEnabled && (
          <div>
            <label className="block text-sm font-medium text-[#555555] dark:text-[#cccccc] mb-1">{t("reservationWidget.form.attachment", "Attachment (Optional)")}</label>
            {attachment ? (
              <div className="p-3 bg-[#f0f7e6] dark:bg-darkthemeitems/50 border border-[#88AB61] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 ">
                  <FileIcon className="h-5 w-5 text-[#88AB61]" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{attachment.name}</span>
                </div>
                <button
                  type="button"
                  onClick={onRemoveAttachment}
                  className="p-1 text-red-500 hover:text-red-700 rounded-full"
                  aria-label={t("reservationWidget.form.removeFile", "Remove file")}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-[#88AB61] bg-[#f0f7e6] dark:bg-darkthemeitems/50' : 'border-[#dddddd] dark:border-[#444444] hover:bg-[#f9f9f9] dark:hover:bg-darkthemeitems/50'}`}
              >
                <label htmlFor="attachment" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">{t("reservationWidget.form.clickToUpload")}</span> {t("reservationWidget.form.orDragAndDrop")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("reservationWidget.form.attachmentHint", "Max 10MB. Allowed types: PDF")}</p>
                  </div>
                  <input
                    id="attachment"
                    ref={attachmentInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={onAttachmentChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
            {attachmentError && <p className="mt-1 text-sm text-red-500">{attachmentError}</p>}
          </div>
        )}

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

const ConfirmationStep = memo(({ data, userInformation, chosenTitle, occasions, areas, areaSelected, attachment, onConfirm, onBack, isLoading, isPaymentRequired, totalAmount, paymentError, currency, selectedEvent }: any) => {
  const { t } = useTranslation()
  const formattedTotalAmount = `${totalAmount.toFixed(2)} ${currency || 'MAD'}`;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{t("reservationWidget.payment.reservationSummary")}</h2>
      <div className="space-y-4 mb-6">
        <div className="bg-[#f9f9f9] dark:bg-darkthemeitems rounded-lg p-4">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.name")}: </span><span className="font-medium capitalize">{chosenTitle ? chosenTitle + ". " : ""}{userInformation.firstname} {userInformation.lastname}</span></div>
              <div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.email")}: </span><span>{userInformation.email}</span></div>
              <div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.phone")}: </span><span>{userInformation.phone}</span></div>
            </div>
            <div className="border-t border-[#dddddd] dark:border-[#444444] pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.dateTime")}: </span><span className="font-medium">{format(new Date(data.reserveDate), "MMMM d, yyyy")} {t("reservationWidget.confirmation.at")} {data.time}</span></div>
                <div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.guests")}: </span><span className="font-medium">{data.guests} {data.guests === 1 ? t("reservationWidget.confirmation.person") : t("reservationWidget.confirmation.people")}</span></div>
              </div>
            </div>
            {(userInformation.occasion || areaSelected || userInformation.allergies || userInformation.preferences || attachment || selectedEvent) && (
              <div className="border-t border-[#dddddd] dark:border-[#444444] pt-3">
                <div className="space-y-2 text-sm">
                  {selectedEvent && (<div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.event", "Event")}: </span><span className="text-sm bg-[#88AB61]/20 dark:bg-[#88AB61]/20  px-2 py-1 rounded">{selectedEvent.title}</span></div>)}
                  {userInformation.occasion && userInformation.occasion !== "0" && (<div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.occasion")}: </span><span>{occasions?.find((o: BaseRecord) => o.id === Number(userInformation.occasion))?.name}</span></div>)}
                  {areaSelected && (<div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.form.areas")}: </span><span>{areas.find((a: any) => a.id === areaSelected)?.name}</span></div>)}
                  {userInformation.allergies && (<div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.allergies")}: </span><span className="text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2 py-1 rounded">{userInformation.allergies}</span></div>)}
                  {userInformation.preferences && (<div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.confirmation.preferences")}: </span><span className="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">{userInformation.preferences}</span></div>)}
                  {attachment && (<div><span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.form.attachment", "Attachment")}: </span><span>{attachment.name}</span></div>)}
                </div>
              </div>
            )}
            {isPaymentRequired && (
              <div className="border-t border-[#dddddd] dark:border-[#444444] pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#555555] dark:text-[#cccccc]">{t("reservationWidget.payment.amountToPay")}</span>
                  <span className="font-bold text-[#88AB61] text-lg">{formattedTotalAmount}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        {paymentError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-md">
            <p className="font-medium">{isPaymentRequired ? t("reservationWidget.payment.errorTitle") : t('common.errors.anErrorOccurred')}</p><p className="text-sm mt-1">{paymentError}</p>
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
  const [searchParams, setSearchParams] = useSearchParams();
  const step = parseInt(searchParams.get("step") || "1", 10);

  const { preferredLanguage } = useDateContext();

  const FORM_DATA_KEY = 'tabla_widget_form_data'
  const RESERVATION_DATA_KEY = 'tabla_widget_reservation_data'

  // API Data Fetching
  const { widgetInfo, isLoading: isWidgetLoading, error: widgetError } = useWidgetData();
  const { data: occasionsData } = useList({ resource: `api/v1/bo/restaurants/subdomain/occasions` })
  const { mutate: createReservation } = useCreate()
  const { mutate: createPaymentInitiation } = useCreate()
  const currentMonth = format(new Date(), 'yyyy-MM');
  const { data: availabilityData } = useList({
    resource: `api/v1/bo/subdomains/availability/${currentMonth}/`,
    queryOptions: {
      enabled: !localStorage.getItem(FORM_DATA_KEY)
    }
  });

  // Component State
  const [restaurantID, setRestaurantID] = useState<BaseKey>()
  const [occasions, setOccasions] = useState<BaseRecord[]>()
  const [areas, setAreas] = useState<any[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string>()
  const [showProcess, setShowProcess] = useState(false)
  const [dressCodePopupOpen, setDressCodePopupOpen] = useState(false)

  // Event Filter State
  const [eventFilter, setEventFilter] = useState<{
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
  } | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<BaseKey | null>(() => {
    const saved = localStorage.getItem(FORM_DATA_KEY);
    return saved ? JSON.parse(saved).selectedEventId : null;
  });
  const [tempEventId, setTempEventId] = useState<BaseKey | null>(null);

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

  // Attachment State
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // Payment State
  const [paymentData, setPaymentData] = useState<any | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [reservationId, setReservationId] = useState<number | null>(null);
  const [isPaymentNeeded, setIsPaymentNeeded] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const navigate = useNavigate();

  // Browser Info
  const [browserInfo, setBrowserInfo] = useState({ userAgent: "", screenHeight: 0, screenWidth: 0, colorDepth: 0 })

  const isAttachmentFeatureEnabled = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const hostname = window.location.hostname;
    const enabledDomains = ["the5th.tabla.ma", "azar.tabla.ma", "italiana.tabla.ma"];
    const isDev = process.env.NODE_ENV === 'development' || hostname.includes('localhost') || hostname.includes('.dev.tabla.ma');
    return enabledDomains.includes(hostname) || isDev;
  }, []);

  const { refetch: checkPayment } = useCustom<any>({
    url: 'api/v1/bo/subdomains/public/customer/payment/check/',
    method: 'get',
    config: {
      query: {
        date: data.reserveDate,
        time: data.time,
        number_of_guests: data.guests,
      },
    },
    queryOptions: {
      enabled: false, // Manually trigger this
      onSuccess: (response) => {
        setIsPaymentNeeded(response.data.is_payment_enabled);
        setTotalAmount(response.data.amount || 0);
      },
      onError: () => {
        setIsPaymentNeeded(false); // Default to false on error
        setTotalAmount(0);
      },
      onSettled: () => {
        setIsCheckingPayment(false);
      }
    },
  });

  // Handle "Book Now" from Alert
  const handleEventBookNow = useCallback((alert: Alert) => {
    setEventFilter({
      startDate: alert.event_start_date,
      endDate: alert.event_end_date,
      startTime: alert.event_start_time,
      endTime: alert.event_end_time
    });
    setTempEventId(alert.id);
    setShowProcess(true);
  }, []);

  const handleProcessClose = useCallback(() => {
    setShowProcess(false);
    setEventFilter(null); // Reset filter when closing
    setTempEventId(null);
  }, []);

  const handleOpenRegularPicker = useCallback(() => {
    setSelectedEventId(null);
    setTempEventId(null);
    setEventFilter(null);
    setShowProcess(true);
  }, []);

  const handleDateTimeSelect = useCallback((newData: any) => {
    setData(newData);
    setSelectedEventId(tempEventId);
    changeStep(2);
  }, [tempEventId]);

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
    if (widgetInfo) {
      setRestaurantID(widgetInfo.restaurant?.id);
      setAreas(widgetInfo.areas || []);

      const isStep1DataMissing = !data.reserveDate || !data.time || !data.guests;
      const isStep2DataMissing = !userInformation.firstname || !userInformation.lastname || !userInformation.email || !userInformation.phone;

      if (!widgetInfo.is_widget_activated) {
        setSearchParams({ step: "6" }, { replace: true });
      } else if (step > 1 && step < 5 && isStep1DataMissing) {
        setSearchParams({ step: "1" }, { replace: true });
      } else if (step > 2 && step < 5 && isStep2DataMissing) {
        setSearchParams({ step: "2" }, { replace: true });
      } else if (!searchParams.has("step")) {
        setSearchParams({ step: "1" }, { replace: true });
      }
    }
  }, [widgetInfo, data, userInformation, step, setSearchParams]);

  useEffect(() => { if (occasionsData) setOccasions(occasionsData.data as unknown as BaseRecord[]) }, [occasionsData]);

  // Combined effect for saving form data and checking payment
  useEffect(() => {
    const formData = { data, userInformation, chosenTitle, checkedConditions, checkedDressCode, areaSelected, selectedEventId };
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));

    // --- Payment Check Logic ---
    if (!widgetInfo || !data.reserveDate || !data.time || !data.guests) {
      setIsPaymentNeeded(false);
      setTotalAmount(0);
      return;
    }

    if (!widgetInfo.enable_paymant) {
      setIsPaymentNeeded(false);
      setTotalAmount(0);
      return;
    }

    if (widgetInfo.payment_mode === 'always') {
      const minGuests = widgetInfo.min_guests_for_payment || 1;
      if (data.guests >= minGuests) {
        setIsPaymentNeeded(true);
        const amountPerGuest = widgetInfo.deposit_amount_par_guest || 0;
        setTotalAmount(data.guests * parseFloat(amountPerGuest));
      } else {
        setIsPaymentNeeded(false);
        setTotalAmount(0);
      }
    } else if (widgetInfo.payment_mode === 'rules') {
      setIsCheckingPayment(true);
      checkPayment();
    } else {
      setIsPaymentNeeded(false);
      setTotalAmount(0);
    }
  }, [data, widgetInfo, checkPayment, userInformation, chosenTitle, checkedConditions, checkedDressCode, areaSelected]);


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

  useEffect(() => {
    const savedDataString = localStorage.getItem(FORM_DATA_KEY);
    let shouldAutoSelect = true;
    let isCacheInvalid = false;

    if (savedDataString) {
      const savedData = JSON.parse(savedDataString).data;

      if (savedData?.reserveDate) {
        const now = new Date();
        const reservationDate = new Date(savedData.reserveDate);

        // Check if date is in the past (strictly before today)
        if (compareAsc(startOfDay(reservationDate), startOfDay(now)) < 0) {
          isCacheInvalid = true;
        } else if (savedData.time) {
          shouldAutoSelect = false;

          // If date is today, check if time is passed
          if (compareAsc(startOfDay(reservationDate), startOfDay(now)) === 0) {
            const reservationDateTime = parse(`${savedData.reserveDate} ${savedData.time}`, 'yyyy-MM-dd HH:mm', new Date());
            if (compareAsc(reservationDateTime, now) < 0) {
              isCacheInvalid = true;
              shouldAutoSelect = true;
            }
          }
        }
      }
    }

    if (isCacheInvalid) {
      const theme = localStorage.getItem("darkMode");
      const lang = localStorage.getItem("preferredLanguage");
      localStorage.clear();
      if (theme) localStorage.setItem("darkMode", theme);
      if (lang) localStorage.setItem("preferredLanguage", lang);

      setData({ reserveDate: "", time: "", guests: 0 });
      setUserInformation({ firstname: "", lastname: "", email: "", phone: "", preferences: "", allergies: "", occasion: "" });
      setChosenTitle(undefined);
      setCheckedConditions(false);
      setCheckedDressCode(false);
      setAreaSelected(undefined);
      setAttachment(null);
      setAttachmentError(null);
      shouldAutoSelect = true;
    }

    if (shouldAutoSelect && availabilityData?.data) {
      const availability = availabilityData.data as { day: number; isAvailable: boolean }[];
      const today = new Date();
      const todayDay = today.getDate();

      let dateToSelect: Date | null = null;
      const todayIsAvailable = availability.find(d => d.day === todayDay)?.isAvailable;

      if (todayIsAvailable) {
        dateToSelect = today;
      } else {
        const firstAvailable = availability.find(d => d.isAvailable && d.day > todayDay);
        if (firstAvailable) {
          dateToSelect = parse(`${firstAvailable.day}`, 'd', new Date(currentMonth));
        }
      }

      if (dateToSelect) {
        setData({
          reserveDate: format(dateToSelect, 'yyyy-MM-dd'),
          guests: 2,
          time: ''
        });
      }
    }
  }, [availabilityData, currentMonth]);

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

  useEffect(() => {
    const hasErrors = Object.values(formErrors).some(error => error !== "");
    if (hasErrors) {
      validateForm();
    }
  }, [userInformation, formErrors, validateForm]);

  const changeStep = useCallback((newStep: number, replace = false) => {
    setIsAnimating(false);
    setPaymentError(null);
    setTimeout(() => {
      setSearchParams({ step: newStep.toString() }, { replace });
    }, 300);
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

    const formData = new FormData();
    const values = {
      customer: { title: chosenTitle, email: userInformation.email, first_name: userInformation.firstname, last_name: userInformation.lastname, phone: userInformation.phone, preferred_language: preferredLanguage },
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
      event_id: selectedEventId,
      event: selectedEventId,
    };

    // Append JSON data and other fields. Complex objects are stringified.
    Object.keys(values).forEach(key => {
      const value = (values as any)[key];
      if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    if (attachment) {
      formData.append('attachment', attachment);
    }

    createReservation({
      resource: `api/v1/bo/subdomains/public/cutomer/reservations/`,
      values: formData,
      meta: {
        headers: {
          // The browser will set the correct Content-Type with boundary for multipart/form-data
          // So we don't set it manually here to avoid issues.
        },
      },
    }, {
      onSuccess: (responseData) => {
        const reservation = responseData?.data?.reservation;
        if (reservation?.id) {
          const numericId = Number(reservation.id);
          setReservationId(numericId);

          localStorage.setItem(RESERVATION_DATA_KEY, JSON.stringify({ reservationId: numericId, timestamp: Date.now() }));
          if (isPaymentNeeded) {
            initiatePayment(numericId);
          } else {
            setIsLoading(false);
            changeStep(5, true);
          }
        } else {
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
        submitPaymentForm(response.data);
      },
      onError: (error) => {
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
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("darkMode", document.documentElement.classList.contains("dark") ? "true" : "false");
  };

  const formattedTotalAmount = useMemo(() => {
    return `${totalAmount.toFixed(2)} ${widgetInfo?.currency || "MAD"}`;
  }, [totalAmount, widgetInfo?.currency]);

  const handleNewReservation = () => {
    localStorage.removeItem(FORM_DATA_KEY);
    localStorage.removeItem(RESERVATION_DATA_KEY);
    setData({ reserveDate: "", time: "", guests: 0 });
    setUserInformation({ firstname: "", lastname: "", email: "", phone: "", preferences: "", allergies: "", occasion: "" });
    setChosenTitle(undefined);
    setCheckedConditions(false);
    setCheckedDressCode(false);
    setAreaSelected(undefined);
    setAttachment(null);
    setAttachmentError(null);
    setSelectedEventId(null);
    changeStep(1);
    navigate('/make/reservation');
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setAttachmentError(t("reservationWidget.validation.attachmentInvalidType", "Invalid file type. Please upload a PDF file."));
        setAttachment(null);
        if (attachmentInputRef.current) attachmentInputRef.current.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setAttachmentError(t("reservationWidget.validation.attachmentTooLarge", "File is too large. Maximum size is 10MB."));
        setAttachment(null);
        if (attachmentInputRef.current) attachmentInputRef.current.value = '';
        return;
      }
      setAttachment(file);
      setAttachmentError(null);
    } else {
      setAttachment(null);
      setAttachmentError(null);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setAttachmentError(null);
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = '';
    }
  };

  const renderStep = () => {
    const isStep1DataMissing = !data.reserveDate || !data.time || !data.guests;
    const isStep2DataMissing = !userInformation.firstname || !userInformation.lastname || !userInformation.email || !userInformation.phone;

    if (step > 1 && step < 5 && isStep1DataMissing) return null;
    if (step > 2 && step < 5 && isStep2DataMissing) return null;

    switch (step) {
      case 1: return <ReservationPickerStep data={data} onShowProcess={handleOpenRegularPicker} handleEventBookNow={handleEventBookNow} onNextStep={() => changeStep(2)} widgetInfo={widgetInfo} isCheckingPayment={isCheckingPayment} />;
      case 2: return <UserInfoFormStep userInformation={userInformation} formErrors={formErrors} chosenTitle={chosenTitle} checkedConditions={checkedConditions} checkedDressCode={checkedDressCode} widgetInfo={widgetInfo} occasions={occasions} areas={areas} areaSelected={areaSelected} attachment={attachment} attachmentError={attachmentError} isAttachmentFeatureEnabled={isAttachmentFeatureEnabled} onUserInformationChange={setUserInformation} onChosenTitleChange={setChosenTitle} onCheckedConditionsChange={setCheckedConditions} onCheckedDressCodeChange={setCheckedDressCode} onAreaSelectedChange={setAreaSelected} onAttachmentChange={handleAttachmentChange} onRemoveAttachment={handleRemoveAttachment} onSubmit={handleSubmit} onBack={() => changeStep(1)} onDressCodePopupOpen={() => setDressCodePopupOpen(true)} />;
      case 3: return <ConfirmationStep data={data} userInformation={userInformation} chosenTitle={chosenTitle} occasions={occasions} areas={areas} areaSelected={areaSelected} attachment={attachment} onConfirm={handleConfirmation} onBack={() => changeStep(2)} isLoading={isLoading} isPaymentRequired={isPaymentNeeded} totalAmount={totalAmount} currency={widgetInfo?.currency} paymentError={paymentError || serverError} selectedEvent={widgetInfo?.events?.find((e: any) => e.id === selectedEventId)} />;
      case 5: return <SuccessStep widgetInfo={widgetInfo} onReset={() => handleNewReservation()} />;
      case 6: return <UnavailableStep widgetInfo={widgetInfo} />;
      default: return null;
    }
  };

  if (isWidgetLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-bgdarktheme2">
        <LoaderCircle className="animate-spin text-[#88AB61]" size={48} />
      </div>
    );
  }

  if (widgetError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-bgdarktheme2 p-4 text-center">
        <div className="p-6 bg-softredtheme dark:bg-softredtheme rounded-xl text-center border border-redtheme/30 dark:border-redtheme/50 shadow-sm max-w-md">
          <AlertOctagon className="h-12 w-12 mx-auto mb-4 text-redtheme" />
          <h2 className="text-xl font-semibold mb-2 text-redtheme">
            {t("common.errors.restaurantNotFoundTitle")}
          </h2>
          <p className="text-sm text-redtheme">
            {t("common.errors.restaurantNotFoundMessage")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed w-full h-[100vh] min-h-[500px] ">
        <div
          className="lt-md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat scale-[1.1] blur-[2px]"
          style={{ backgroundImage: `url(${widgetInfo?.image_2 || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2070&q=80'})` }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>
      <div className={`overflow-y-auto min-h-screen max-h-screen bg-white dark:bg-bgdarktheme2 text-black dark:text-white ${preferredLanguage === "ar" ? "rtl" : ""}`}>
        <div className="relative">
          <div className="w-full max-w-[800px] mx-auto px-0 rounded-t-3xl min-h-[calc(100vh-200px)] bg-white dark:bg-bgdarktheme2 text-black dark:text-white flex flex-col">
            <div className="bg-white dark:bg-darkthemeitems rounded-3xl min-h-[calc(100vh-200px)] shadow-2xl flex flex-col">
              {isPaymentNeeded && step < 3 && (
                <div className="bg-softbluetheme mx-4 mt-4 rounded-xl flex justify-between text-bluetheme p-2">
                  <div className="flex gap-2 justify-start items-center" role="alert">
                    <BadgeInfo className="inline-block mx-2" />
                    <div>
                      <p className="font-bold">{t("reservationWidget.payment.paymentNoticeTitle")}</p>
                      <p className="text-sm">{t("reservationWidget.payment.paymentNoticeDescription")}</p>
                    </div>
                  </div>
                  <div className="flex-1 font-[900] p-2 rounded-lg flex items-center justify-center w-fit h-fit text-bluetheme">
                    {formattedTotalAmount}
                  </div>
                </div>
              )}
              <div className={`p-6 px-2 pt-2 transition-all duration-300 ease-in-out ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                <WidgetHeader widgetInfo={widgetInfo} onThemeToggle={toggleDarkMode} />
                {renderStep()}
              </div>
              {(widgetInfo?.content && step === 1) && (
                <div className="w-full flex flex-col flex-grow-1">
                <div className="px-2 pb-6">
                    <div className="text-[#333333] dark:text-[#e1e1e1]">
                        <QuillPreview content={widgetInfo.content} />
                    </div>
                </div>
                </div>
              )}
            </div>
            <SharedWidgetFooter widgetInfo={widgetInfo} isPaymentRequired={isPaymentNeeded} showDescription={false} />
          </div>
        </div>

        {showProcess && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-darkthemeitems rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
              <WidgetReservationProcess
                onClick={handleProcessClose}
                maxGuests={widgetInfo?.max_of_guests_par_reservation}
                resData={data}
                getDateTime={handleDateTimeSelect}
                filter={eventFilter}
              />
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
    </>
  )
}

export default WidgetPage;