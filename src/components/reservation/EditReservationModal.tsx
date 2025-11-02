import { useState, useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { BaseKey, CanAccess, useList, useNotification, useCreate } from "@refinedev/core";
import BaseSelect from "../common/BaseSelect";
import { ReservationSource, ReservationStatus } from "../common/types/Reservation";
import { TableType as OriginalTableType } from "../../_root/pages/PlacesPage";
import ActionPopup from "../popup/ActionPopup";
import { Clock, User2, Users2, Calendar, XCircle, Mail, Copy, DollarSign, LoaderCircle } from "lucide-react";
import BaseBtn from "../common/BaseBtn";
import { useRestaurantConfig } from "../../hooks/useRestaurantConfig";

interface TableType extends OriginalTableType {
  id: number;
}
import { Occasion, OccasionsType } from "../settings/Occasions";
import { ReceivedTables, Reservation } from "../../_root/pages/ReservationsPage";
import { DevOnly } from "../DevOnly";

interface DataTypes {
  reserveDate: string;
  time: string;
  guests: number;
}

interface EditReservationModalProps {
  showModal: boolean;
  reservation: Reservation | null;
  setShowModal: (show: boolean) => void;
  setShowProcess: (show: boolean) => void;
  reservationProgressData: DataTypes;
  statusHandler: (status: ReservationStatus) => void;
  upDateHandler: (reservation: Reservation) => void;
  hasTable: boolean;
  setHasTable: (hasTable: boolean) => void;
  isDarkMode: boolean;
}

const EditReservationModal = ({
  showModal,
  reservation,
  setShowModal,
  setShowProcess,
  reservationProgressData,
  statusHandler,
  upDateHandler,
  hasTable,
  setHasTable,
  isDarkMode
}: EditReservationModalProps) => {
  const { t } = useTranslation();
  const [availableTables, setAvailableTables] = useState<TableType[]>([]);
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [selectedClient, setSelectedClient] = useState<Reservation | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<number | null>(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [occasions, setOccasions] = useState<Occasion[]>([])
  const [occasionsAPIInfo, setOccasionsAPIInfo] = useState<OccasionsType>()

  const sources = [
                  { value: 'MARKETPLACE', label: t('overview.charts.reservationsSource.legend.MarketPlace') },
                { value: 'WIDGET', label: t('overview.charts.reservationsSource.legend.Widget') },
                { value: 'WEBSITE', label: t('overview.charts.reservationsSource.legend.ThirdParty') },
                { value: 'WALK_IN', label: t('overview.charts.reservationsSource.legend.WalkIn') },
                { value: 'BACK_OFFICE', label: t('overview.charts.reservationsSource.legend.BackOffice') },
]

const { open } = useNotification();
  
  // Get restaurant configuration using our custom hook
  const { 
    widgetConfig, 
    getPaymentLink, 
    checkPayment,
    paymentCheckResult,
    isCheckingPayment,
    isLoading: isLoadingConfig 
  } = useRestaurantConfig();
  
  // Extract payment configuration
  const isPaymentEnabled = widgetConfig.enable_payment;
  
  // State for payment link actions
  const [isSendingPaymentLink, setIsSendingPaymentLink] = useState(false);
  const [isCopyingPaymentLink, setIsCopyingPaymentLink] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  

  const { isLoading: loadingOccasions, error: occasionsError } = useList({
    resource: 'api/v1/bo/occasions/', // Placeholder API endpoint
    queryOptions: {
      onSuccess(data) {
        setOccasionsAPIInfo(data.data as unknown as OccasionsType)
      }
    }
  })
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [selectedClient?.internal_note]);
  
  useEffect(() => {
    if (occasionsAPIInfo) {
      setOccasions(occasionsAPIInfo.results as Occasion[] || occasionsAPIInfo || [])
    }
  }, [occasionsAPIInfo])
  // Fetch available tables
  const { data: availableTablesData, isLoading: isLoadingTables } = useList({
    resource: "api/v1/bo/tables/available_tables/",
    filters: [
      { field: "date", operator: "eq", value: selectedClient ? reservationProgressData.reserveDate : '' },
      { field: "number_of_guests", operator: "eq", value: selectedClient ? reservationProgressData.guests : 0 },
      { field: "time", operator: "eq", value: selectedClient ? reservationProgressData.time + ':00' : '' }
    ],
    queryOptions: {
      enabled: !!selectedClient && showModal,
      keepPreviousData: false,
    },
  });

  // Update available tables when data changes
  useEffect(() => {
    if (availableTablesData?.data) {
      setAvailableTables(availableTablesData.data as TableType[]);
      setAvailableTables((prev)=>[...prev, ...(selectedClient?.tables || []) as TableType[]])
    }
  }, [availableTablesData]);
  
  useEffect(()=>{
    setSelectedClient(reservation);
    setSelectedOccasion(reservation?.occasion?.id as number);
    setSelectedTables(reservation?.tables?.map(t=>t.id) as number[])
  },[reservation])

  useEffect(() => {
    const canCheckPayment = isPaymentEnabled && reservationProgressData.reserveDate && reservationProgressData.time && reservationProgressData.guests > 0;

    if (!canCheckPayment) {
        setPaymentRequired(false);
        setPaymentAmount(null);
        return;
    }

    if (widgetConfig.payment_mode === 'always') {
        if (reservationProgressData.guests >= widgetConfig.min_guests_for_payment) {
            setPaymentRequired(true);
            setPaymentAmount(reservationProgressData.guests * widgetConfig.deposit_amount_per_guest);
        } else {
            setPaymentRequired(false);
            setPaymentAmount(null);
        }
    } else if (widgetConfig.payment_mode === 'rules') {
        checkPayment(reservationProgressData.reserveDate, reservationProgressData.time, reservationProgressData.guests);
    }
  }, [reservationProgressData, widgetConfig, isPaymentEnabled, checkPayment]);

  useEffect(() => {
    if (widgetConfig.payment_mode === 'rules' && paymentCheckResult) {
        setPaymentRequired(paymentCheckResult.is_payment_enabled);
        setPaymentAmount(paymentCheckResult.is_payment_enabled ? paymentCheckResult.amount : null);
    }
  }, [paymentCheckResult, widgetConfig.payment_mode]);

  const handleSave = () => {
    setShowConfirmPopup(true);
  };


  const confirmUpdate = () => {
    if (selectedClient) {
      upDateHandler(selectedClient);
    }
    setShowConfirmPopup(false);
    setShowModal(false);
  };
  
  const getStatusLabel = (status: ReservationStatus) => {
    switch (status) {
      case 'APPROVED':
        return t('reservations.statusLabels.confirmed');
      case 'SEATED':
        return t('reservations.statusLabels.seated');
      case 'PENDING':
        return t('reservations.statusLabels.pending');
      case 'FULFILLED':
        return t('reservations.statusLabels.fulfilled');
      case 'NO_SHOW':
        return t('reservations.statusLabels.noShow');
      default:
        return t('reservations.statusLabels.cancelled');
    }
  }

  // Add the API hook for sending payment link
  const { mutate: sendPaymentLinkMutate } = useCreate({
    errorNotification(error) {
      return {
        type: 'error',
        message: error?.message || t('notifications.paymentLink.sendErrorDescription'),
      };
    },
  });
  
  // Function to check if we can send payment link (requires email and payment is required)
  const canSendPaymentLink = () => {
    return paymentRequired && selectedClient?.email && selectedClient.email.includes('@');
  };
  
  // Function to send payment link
  const handleSendPaymentLink = async () => {
    if (!selectedClient?.id) {
      open?.({
        type: "error",
        message: t("notifications.paymentLink.error"),
        description: t("notifications.paymentLink.missingSeqId"),
      });
      return;
    }
    
    setIsSendingPaymentLink(true);
    try {
      sendPaymentLinkMutate({
        resource: `api/v1/bo/reservations/${selectedClient.id}/send_payment_link/`,
        values: {},
        successNotification: ()=> ({
          type: "success",
          message: t("notifications.paymentLink.sent")
        }),
        errorNotification: (error)=> ({
          type: "error",
          message: t("notifications.paymentLink.sendError")
        })
      });
    } catch (error) {
      console.error("Error sending payment link:", error);
    } finally {
      setIsSendingPaymentLink(false);
    }
  };
  
  // Function to copy payment link
  const handleCopyPaymentLink = async () => {
    if (!selectedClient?.id) {
      open?.({
        type: "error",
        message: t("notifications.paymentLink.error"),
        description: t("notifications.paymentLink.missingSeqId"),
      });
      return;
    }
    
    setIsCopyingPaymentLink(true);
    try {
      // Generate the payment link using our helper function
      const paymentLink = getPaymentLink(selectedClient.id as string);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(paymentLink);
      
      open?.({
        type: "success",
        message: t("notifications.paymentLink.copied"),
        description: t("notifications.paymentLink.copiedDescription"),
      });
    } catch (error) {
      console.error("Error copying payment link:", error);
      open?.({
        type: "error",
        message: t("notifications.paymentLink.copyError"),
        description: t("notifications.paymentLink.copyErrorDescription"),
      });
    } finally {
      setIsCopyingPaymentLink(false);
    }
  };

  const renderPaymentInfo = () => {
    if (isCheckingPayment) {
        return (
            <div className="flex gap-1 my-1 text-sm items-center w-fit px-2 py-1 rounded">
                <LoaderCircle size={14} className="animate-spin" />
                <span>{t('reservationWidget.payment.checking')}</span>
            </div>
        );
    }

    if (paymentRequired && paymentAmount !== null) {
        return (
            <div className="flex gap-1 my-1 text-sm bg-softyellowtheme items-center text-yellowtheme w-fit px-2 py-1 rounded">
                <DollarSign size={14} className={`dark:text-yellowtheme text-yellowtheme`} />
                <span>{t('reservationWidget.payment.amountToPay')}{paymentAmount > 0 && `: ${paymentAmount} ${widgetConfig.currency}`}</span>
            </div>
        );
    }

    return null;
  };

  if (!showModal || !selectedClient) return null;

  return (
    <div>
      <div className="overlay z-[100]" onClick={() => setShowModal(false)}></div>
      <div className={`sidepopup w-[40%] overflow-y-auto lt-sm:min-h-[70vh] lt-sm:max-h-[90vh] lt-sm:w-full lt-sm:bottom-0 lt-sm:overflow-y-auto h-full ${isDarkMode ? 'bg-bgdarktheme text-white' : 'bg-white'} `}>
        <CanAccess resource="reservation" action="change" fallback={
           // Read-only view for users without edit permissions
      <div className="p-4">
      <h1 className="text-2xl font-[600] mb-4">
        <span className={`font-[800] `}>{selectedClient.full_name} </span>
      </h1>

      
      <p className="text-md mb-[-.4em] font-[500]">tags</p>
      {selectedClient.tags.map((tag: string) => (
        <span className={`text-[12px] font-[500] px-2 py-1 rounded-md mt-2 bg-softgreentheme text-greentheme`}>
          {tag}
        </span>
      ))}
      
      {/* Client preferences - read only */}
      <div className={`flex flex-col p-2 mb-2 rounded-xl gap-3 cursor-default ${isDarkMode ? 'bg-darkthemeitems text-whitetheme' : ' border-2 text-darkthemeitems'}`}>
        
        <p className="text-md mb-[-.4em] font-[500]">{selectedClient.full_name}'s preferences</p>
        <div className="">
          <p className="text-sm font-[400]">Allergies</p>
          <div className={`flex items-center btn text-sm font-[400] ${isDarkMode ? 'text-white' : ''}`}>
            {selectedClient.allergies || '--'}
          </div>
        </div>
        <div className="">
          <p className="text-sm font-[400]">Area</p>
          <div className={`flex items-center btn text-sm font-[400] ${isDarkMode ? 'text-white' : ''}`}>
            {selectedClient.area ? selectedClient.area.name : '--'}
          </div>
        </div>
        <div className="">
          <p className="text-sm font-[400]">Occasion</p>
          <div className={`flex items-center btn text-sm font-[400] ${isDarkMode ? 'text-white' : ''}`}>
            {selectedClient.occasion?.name || '--'}
          </div>
        </div>
        <div className="">
          <p className="text-sm font-[400]">Comment</p>
          <div className={`flex items-center btn text-sm font-[400] ${isDarkMode ? 'text-white' : ''}`}>
            {selectedClient.commenter || '--'}
          </div>
        </div>
      </div>
      
      {/* Read-only reservation information */}
      <div className="space-y-2">
        {selectedClient.status === 'CANCELED' &&
          <div className="flex items-center text-redtheme bg-redtheme/10 p-2 rounded-md">
            <XCircle size={16} className="mr-2" />
            <p className="text-sm font-medium">Cancelled</p>
            
            <span className="text-xs text-redtheme/70 ml-2">{selectedClient.cancellation_note}|</span>
          </div>
        } 
        <div>
          <p className="text-sm font-medium">{t('reservations.edit.informations.madeBy')}</p>
          <div className={`w-full rounded-md p-2 ${isDarkMode ? 'bg-darkthemeitems text-whitetheme' : 'bg-softgreytheme text-subblack'}`}>
            {selectedClient.source}
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium">{t('reservations.edit.informations.internalNote')}</p>
          <div className={`w-full rounded-md p-2 ${isDarkMode ? 'bg-darkthemeitems text-whitetheme' : 'bg-softgreytheme text-subblack'}`}>
            {selectedClient.internal_note || 'No internal notes'}
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium">{t('reservations.edit.informations.status')}</p>
          <div className={`w-full rounded-md p-2 ${isDarkMode ? 'bg-darkthemeitems text-whitetheme' : 'bg-softgreytheme text-subblack'}`}>
            {getStatusLabel(selectedClient.status)}
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium">{t('reservations.occasion')}</p>
          <div className={`w-full rounded-md p-2 ${isDarkMode ? 'bg-darkthemeitems text-whitetheme' : 'bg-softgreytheme text-subblack'}`}>
            {selectedClient.occasion?.name || 'No occasion'}
          </div>
        </div>
        
        {/* Display tables if available */}
        <div>
          <p className="text-sm font-medium">{t('reservations.edit.informations.table')}</p>
          <div className={`w-full rounded-md p-2 ${isDarkMode ? 'bg-darkthemeitems text-whitetheme' : 'bg-softgreytheme text-subblack'}`}>
            {selectedClient.tables?.map(t => t.name).join(', ') || 'No tables assigned'}
          </div>
        </div>

        {/* Display reservation date/time/guests */}
        <div className={`p-3 flex justify-around ${isDarkMode ? 'bg-darkthemeitems text-white' : 'bg-softgreytheme'} rounded-md`}>
          <div className="flex items-center">
            <Calendar size={16} className="mr-2" />
            <span>{reservationProgressData.reserveDate || 'No date'}</span>
          </div>
          <div className="flex items-center">
            <Clock size={16} className="mr-2" />
            <span>{reservationProgressData.time || 'No time'}</span>
          </div>
          <div className="flex items-center">
            <Users2 size={16} className="mr-2" />
            <span>{reservationProgressData.guests || 0} guests</span>
          </div>
        </div>

        {/* Close button for read-only view */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setShowModal(false)}
            className="btn-primary"
          >
            {t('reservations.edit.buttons.close')}
          </button>
        </div>
      </div>
    </div>
        }>
          <h1 className="text-2xl font-[600] mb-2">
            {t('reservations.edit.title')} by <span className={`font-[800] `}>{selectedClient.full_name} </span>
            <span className={`text-sm font-[400] ${isDarkMode ? 'text-[#e1e1e1]' : 'text-subblack'}`}>
              {`(Reservation id: ${selectedClient.seq_id})`}
            </span>
          </h1>
          <p className="text-md  font-[500]">Tags</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedClient.tags.map((tag: string) => (
              <span className={`text-[12px] font-[500] px-2 py-1 rounded-md mt-2 w-fit bg-softgreentheme text-greentheme`}>
                {tag}
              </span>
            ))}
          </div>

          <div className={`flex flex-col p-2 mb-2 rounded-xl gap-3 cursor-default ${isDarkMode ? 'bg-darkthemeitems text-whitetheme' : ' border-2 text-darkthemeitems'}`}>
            <p className="text-md mb-[-.4em] font-[500]">{selectedClient.full_name}'s preferences</p>
            {(selectedClient.status === 'CANCELED' && (selectedClient.cancellation_note)) ?
                <div className="flex flex-col gap-1 bg-redtheme/10 border border-redtheme/30 rounded-md p-3 mb-2">
                <div className="flex items-center mb-1">
                  <XCircle size={18} className="mr-2 text-redtheme" />
                  <span className="text-sm font-semibold text-redtheme">{t('reservations.statusLabels.cancelled')}</span>
                </div>
                {selectedClient.cancellation_note && (
                  <div className="flex items-center mt-1">
                  <span className="text-xs font-medium text-redtheme/80 mr-2">{t('reservations.edit.informations.cancellationNote') || 'Cancellation Note'}:</span>
                  <span className="text-xs text-redtheme/70">{selectedClient.cancellation_note}</span>
                  </div>
                )}
                </div>
            :(selectedClient.status === 'CANCELED' && (selectedClient.cancellation_reason)) &&
                <div className="flex flex-col gap-1 bg-redtheme/10 border border-redtheme/30 rounded-md p-3 mb-2">
                <div className="flex items-center mb-1">
                  <XCircle size={18} className="mr-2 text-redtheme" />
                  <span className="text-sm font-semibold text-redtheme">{t('reservations.statusLabels.cancelled')}</span>
                </div>
                {selectedClient.cancellation_reason && (
                  <div className="flex items-center mt-1">
                  <span className="text-xs font-medium text-redtheme/80 mr-2">{t('reservations.edit.informations.cancellationNote') || 'Cancellation Note'}:</span>
                  <span className="text-xs text-redtheme/70">{selectedClient.cancellation_reason.name}</span>
                  </div>
                )}
                </div>
            } 
            <div className="">
              <p className="text-sm font-[400]">Allergies</p>
              <div className={`flex items-center btn text-sm font-[400] ${isDarkMode ? 'text-white' : ''}`}>
                {selectedClient.allergies || '--'}
              </div>
            </div>
            <div className="">
              <p className="text-sm font-[400]">Area</p>
              <div className={`flex items-center btn text-sm font-[400] ${isDarkMode ? 'text-white' : ''}`}>
                {selectedClient.area ? selectedClient.area.name : '--'}
              </div>
            </div>
            <div className="">
              <p className="text-sm font-[400]">Occasion</p>
              <div className={`flex items-center btn text-sm font-[400] ${isDarkMode ? 'text-white' : ''}`}>
                {selectedClient.occasion?.name|| '--'}
              </div>
            </div>
            <div className="">
              <p className="text-sm font-[400]">Comment</p>
              <div className={`flex items-center btn text-sm font-[400] ${isDarkMode ? 'text-white' : ''}`}>
                {selectedClient.commenter || '--'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <BaseSelect
                label={t('reservations.edit.informations.madeBy')}
                options={sources}
                value={selectedClient.source}
                onChange={(value) => setSelectedClient({ ...selectedClient, source: value as ReservationSource })}
                variant={isDarkMode ? "filled" : "outlined"}
                clearable={false}
              />
            </div>

            <div>
              <label className="block text-sm font-medium ">{t('reservations.edit.informations.internalNote')}</label>
              <textarea
                ref={textareaRef}
                name="internal_note"
                rows={2}
                value={selectedClient.internal_note}
                onChange={(e) => setSelectedClient({ ...selectedClient, internal_note: e.target.value })}
                className={`w-full resize-none rounded-md p-2 dark:bg-darkthemeitems dark:text-whitetheme bg-softgreytheme text-subblack`}
              />
            </div>

            <div className="">
              <label className="block text-sm font-medium ">{t('reservations.edit.informations.status')}</label>
              <select
                name="status"
                value={selectedClient.status}
                onChange={(e) => {
                  setSelectedClient({ ...selectedClient, status: e.target.value as ReservationStatus });
                }}
                className={`w-full rounded-md p-2 dark:bg-darkthemeitems dark:text-whitetheme bg-softgreytheme text-subblack`}
              >
                <option value="PENDING">{t('reservations.statusLabels.pending')}</option>
                <option value="APPROVED">{t('reservations.statusLabels.confirmed')}</option>
                <option value="CANCELED">{t('reservations.statusLabels.cancelled')}</option>
                <option value="SEATED">{t('reservations.statusLabels.seated')}</option>
                <option value="NO_SHOW">{t('reservations.statusLabels.noShow')}</option>
                {/* <option value="RESCHEDULED">{t('reservations.statusLabels.rescheduled')}</option> */}
              </select>
            </div>
            <div>
              <BaseSelect
                label={t('reservations.occasion')}
                options={occasions.map(occasion => ({
                  label: occasion.name,
                  value: occasion.id
                }))}
                value={selectedOccasion}
                onChange={(value) => {
                  console.log('change occais', value);
                  setSelectedOccasion(value as number);
                  const selectedOccasionObj = occasions.find(occasion => occasion.id === value) || null;
                  setSelectedClient({ ...selectedClient, occasion: (selectedOccasionObj as any) })
                  console.log('selectedOccasionObj', selectedOccasionObj)
                }}
                variant="filled"
                clearable={true}
                searchable={true}
              />
            </div>
            {(selectedClient.status === ('APPROVED') || selectedClient.status === ('SEATED')) && (
              <BaseSelect
                label={t('reservations.edit.informations.table')}
                placeholder={t('reservations.tableHeaders.tables')}
                multiple
                chips={true}
                options={[
                  ...(availableTables?.map(table => ({
                    label: `${table.name} (${table.floor_name})`,
                    value: table.id
                  })) || [])
                ]}
                value={selectedTables || []}
                onChange={(value) => {
                  const tableValue = value as number[];
                  (tableValue?.length) ? setHasTable(true) : setHasTable(false);
                  setSelectedTables(tableValue);
                  setSelectedClient({
                    ...selectedClient,
                    tables: tableValue.map(id => availableTables.find(table => table.id === id) as ReceivedTables)
                  })
                }}
                searchable={true}
                clearable={true}
                variant="filled"
                loading={isLoadingTables}
                hint={isLoadingTables ? "Loading available tables..." : ""}
                persistentHint={isLoadingTables}
                error={false}
              />
            )}

            <div
              onClick={() => { setShowProcess(true) }}
              className={`btn flex justify-around cursor-pointer ${isDarkMode ? 'bg-darkthemeitems text-white' : 'bg-white'}`}
            >
              {(reservationProgressData.reserveDate === '') ? <div>date </div> : <span>{reservationProgressData.reserveDate}</span>}
              {(reservationProgressData.time === '') ? <div>Time </div> : <span>{reservationProgressData.time}</span>}
              {(reservationProgressData.guests === 0) ? <div>Guests </div> : <span>{reservationProgressData.guests}</span>}
            </div>
            
            {renderPaymentInfo()}

            {/* Add payment link buttons */}
      {isPaymentEnabled && (
        <div className="flex gap-2 mt-4 mb-2 justify-center flex-wrap">
          <BaseBtn
            variant="secondary"
            onClick={handleSendPaymentLink}
            loading={isSendingPaymentLink}
            disabled={!canSendPaymentLink() || isCheckingPayment}
          >
            <Mail size={16} />
            {t('reservations.buttons.sendPaymentLink')}
          </BaseBtn>
          
          <BaseBtn
            variant="secondary"
            onClick={handleCopyPaymentLink}
            loading={isCopyingPaymentLink}
            disabled={!paymentRequired || isCheckingPayment}
          >
            <Copy size={16} />
            {t('reservations.buttons.copyPaymentLink')}
          </BaseBtn>
        </div>
      )}

            <div className="h-10 sm:hidden"></div>
            <div className="flex justify-center lt-sm:fixed lt-sm:bottom-0 lt-sm: lt-sm:p-3 lt-sm:w-full space-x-2">
              <button
                onClick={() => {
                  setShowModal(false)
                }}
                className="btn-secondary hover:bg-[#88AB6150] hover:text-greentheme transition-colors"
              >
                {t('reservations.edit.buttons.cancel')}
              </button>
              <CanAccess action="change" resource="reservation">
                <button onClick={handleSave} className="btn-primary">
                  {t('reservations.edit.buttons.save')}
                </button>
              </CanAccess>
            </div>
            

            {/* Enhanced Confirmation Popup */}
            <ActionPopup
              action="update"
              message={
                <>
                  <h6 className="mb-3">{t('reservations.edit.confirmationMessage')}</h6>

                  {/* Reservation Details Card - Based on DraggableReservationItem */}
                  <div className={`p-3 flex flex-col gap-2 rounded-[5px] w-full mb-4 font-medium ${isDarkMode ? 'bg-bgdarktheme' : 'bg-softgreytheme'}`}>
                    {/* Reservation ID and Name */}
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <User2 size={18} className="mr-2" />
                        <span className="font-semibold">{selectedClient?.full_name}</span>
                      </div>
                      <div className="text-xs dark:bg-darkthemeitems bg-white py-1 px-2 rounded-md">
                        #{selectedClient?.seq_id || selectedClient?.id}
                      </div>
                    </div>

                    {/* Date, Time, and Guests */}
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        <span>{reservationProgressData.reserveDate}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        <span>{reservationProgressData.time}</span>
                      </div>
                      <div className="flex items-center">
                        <Users2 size={16} className="mr-1" />
                        <span>{reservationProgressData.guests}</span>
                      </div>
                    </div>

                    {/* Tables */}
                    {selectedTables && selectedTables.length > 0 && (
                      <div className="mt-1 text-sm">
                        <span className="opacity-75">Tables: </span>
                        {selectedClient?.tables?.map(t => t.name).join(', ')}
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm opacity-75">Status: </span>
                      <div className={`text-sm ${selectedClient?.status === 'APPROVED' ? 'text-greentheme' :
                          selectedClient?.status === 'SEATED' ? 'text-orangetheme' :
                            selectedClient?.status === 'PENDING' ? 'text-bluetheme' :
                              selectedClient?.status === 'FULFILLED' ? 'text-purpletheme' :
                                selectedClient?.status === 'NO_SHOW' ? 'text-blushtheme' :
                                  'text-redtheme'
                        }`}>
                        {selectedClient?.status === 'APPROVED' ? t('reservations.statusLabels.confirmed') :
                          selectedClient?.status === 'SEATED' ? t('reservations.statusLabels.seated') :
                            selectedClient?.status === 'PENDING' ? t('reservations.statusLabels.pending') :
                              selectedClient?.status === 'FULFILLED' ? t('reservations.statusLabels.fulfilled') :
                                selectedClient?.status === 'NO_SHOW' ? t('reservations.statusLabels.noShow') :
                                  t('reservations.statusLabels.cancelled')}
                      </div>
                    </div>
                  </div>
                </>
              }
              actionFunction={confirmUpdate}
              showPopup={showConfirmPopup}
              setShowPopup={setShowConfirmPopup}
              secondActionText={t('reservations.edit.buttons.cancel')}
            />
          </div>
        </CanAccess>
      </div>
    </div>
  );
};

export default EditReservationModal;