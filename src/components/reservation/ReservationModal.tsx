import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReservationProcess from './ReservationProcess';
import { ArrowLeft, User, X, Mail, Copy, LoaderCircle, DollarSign} from 'lucide-react';
import { BaseKey, BaseRecord, useCreate, useList, useNotification} from '@refinedev/core';
import BaseBtn from '../common/BaseBtn';
import { Occasion, OccasionsType } from '../settings/Occasions';
import BaseSelect from '../common/BaseSelect';
import WidgetReservationProcess from './WidgetReservationProcess';
import { useRestaurantConfig } from '../../hooks/useRestaurantConfig';

interface Reservation extends BaseRecord {
  id?: BaseKey;
  email?: string;
  full_name?: string;
  date?: string;
  time?: string;
  internal_note?: string;
  source?: string;
  number_of_guests?: string;
  phone?: string;
  status?: string;
  commenter?: string;
  review?: boolean;
  occasion?: number | null;
}


interface ReservationModalProps {
  onClick: () => void;
  onSubmit: (data: Reservation) => void;
  timeAndDate?: {
    date: string;
    time: string;
  }
}

interface Client extends BaseRecord {
  id: BaseKey;
  full_name: string;
  tags: {name:string,id:number}[];
  email: string;
  phone: string;
  comment?: string;
}

interface dataTypes {
  reserveDate: string;
  time: string;
  guests: number;
}

const ReservationModal = (props: ReservationModalProps) => {
  const darkMode = localStorage.getItem('darkMode') === 'true';
  const restaurantId = localStorage.getItem('restaurant_id');

  const { open } = useNotification();
  
  // Use our custom hook to get restaurant configuration
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
  
  // States for payment link actions
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [isSendingPaymentLink, setIsSendingPaymentLink] = useState(false);
  const [isCopyingPaymentLink, setIsCopyingPaymentLink] = useState(false);
  
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);

  const [searchKeyword, setSearchKeyword] = useState('');

  interface ClientForApi {
    results: Client[];
    count: number;
  }
  const [clientsForAPI, setClientsForAPI] = useState<ClientForApi>()

  const [count, setCount] = useState(0);

  const { data: clientsData, isLoading, error } = useList({
    resource: 'api/v1/bo/customers/',
    filters: [
      {
        field: 'page',
        operator: 'eq',
        value: 1
      },
      {
        field: 'page_size',
        operator: 'eq',
        value: 100
      },
      {
        field: 'search',
        operator: 'eq',
        value: searchKeyword,
      },
    ],
    queryOptions: {
      onSuccess: (data) => {
        setClientsForAPI(data.data as unknown as ClientForApi);
        console.log('clients data', data.data);
      },
    },
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });

  const { mutate, isLoading: loadingCreatReservation } = useCreate({
    resource: 'api/v1/bo/reservations/',

    mutationOptions: {
      onSuccess: (data) => {
        console.log('Reservation added:', data);
      }
    },
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });

  const { mutate: mutateClient } = useCreate({
    resource: 'api/v1/bo/customers/',

    mutationOptions: {
      retry: 3
    },
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });

  const [selectedOccasion, setSelectedOccasion] = useState<number | null>(null);

  const [occasions, setOccasions] = useState<Occasion[]>([])
  const [occasionsAPIInfo, setOccasionsAPIInfo] = useState<OccasionsType>()

  const { isLoading: loadingOccasions, error: occasionsError } = useList({
    resource: 'api/v1/bo/occasions/', // Placeholder API endpoint
    queryOptions: {
      onSuccess(data) {
        setOccasionsAPIInfo(data.data as unknown as OccasionsType)
      }
    }
  })


  useEffect(() => {
    if (occasionsAPIInfo) {
      setOccasions(occasionsAPIInfo.results as Occasion[] || occasionsAPIInfo || [])
    }
  }, [occasionsAPIInfo])

  const [data, setData] = useState<dataTypes>({
    reserveDate: '',
    time: '',
    guests: 0,
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [focusedClient, setFocusedClient] = useState(false);
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [inputName, setInputName] = useState('');
  const [formData, setFormData] = useState({
    id: 0,
    full_name: '',
    email: '',
    source: 'BACK_OFFICE',
    phone: '',
    comment: '',
  });

  const [createUser, setCreatUser] = useState(true);
  const [showProcess, setShowProcess] = useState(false);
  const [newClient, setNewClient] = useState(false);
  const [findClient, setFindClient] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const newTextareaRef = useRef<HTMLTextAreaElement>(null);

  const { t } = useTranslation();


const sources = [
                  { value: 'MARKETPLACE', label: t('overview.charts.reservationsSource.legend.MarketPlace') },
                { value: 'WIDGET', label: t('overview.charts.reservationsSource.legend.Widget') },
                { value: 'WEBSITE', label: t('overview.charts.reservationsSource.legend.ThirdParty') },
                { value: 'WALK_IN', label: t('overview.charts.reservationsSource.legend.WalkIn') },
                { value: 'BACK_OFFICE', label: t('overview.charts.reservationsSource.legend.BackOffice') },
]

  useEffect(() => {
    const canCheckPayment = isPaymentEnabled && data.reserveDate && data.time && data.guests > 0;

    if (!canCheckPayment) {
        setPaymentRequired(false);
        setPaymentAmount(null);
        return;
    }

    if (widgetConfig.payment_mode === 'always') {
        if (data.guests >= widgetConfig.min_guests_for_payment) {
            setPaymentRequired(true);
            setPaymentAmount(data.guests * widgetConfig.deposit_amount_per_guest);
        } else {
            setPaymentRequired(false);
            setPaymentAmount(null);
        }
    } else if (widgetConfig.payment_mode === 'rules') {
        checkPayment(data.reserveDate, data.time, data.guests);
    }
  }, [data, widgetConfig, isPaymentEnabled, checkPayment]);

  useEffect(() => {
    if (widgetConfig.payment_mode === 'rules' && paymentCheckResult) {
        setPaymentRequired(paymentCheckResult.is_payment_enabled);
        setPaymentAmount(paymentCheckResult.is_payment_enabled ? paymentCheckResult.amount : null);
    }
  }, [paymentCheckResult, widgetConfig.payment_mode]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [formData?.comment]);

  useEffect(() => {
    if (clientsForAPI) {
      setClients(clientsForAPI.results as Client[]);
      setSearchResults(clientsForAPI.results as Client[]);
      setCount(clientsForAPI.count);
    }
  }, [clientsForAPI]);

  const searchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);
    // if (!keyword) {
    //   setSearchResults(clients);
    // } else {
    //   setInputName(e.target.value);
    //   const results = clients.filter((client) =>
    //     client.full_name.toLowerCase().includes(keyword)
    //   );
    //   setSearchResults(results);
    // }
  };

  const handleSelectClient = (client: Client) => {
    setFormData({ ...client, id: 0, comment: '', source: 'BACK_OFFICE' });
    setInputName(client.full_name);
    setSelectedClient(client);
    setFocusedClient(false);
    setFindClient(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddReservation = (event: React.FormEvent, dataReceived: Reservation): void => {
    event.preventDefault();

    const reservationData: Reservation = {
      id: Date.now().toString(),
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      internal_note: '',
      date: data.reserveDate || '',
      time: data.time || '',
      source: formData.source || 'BACK_OFFICE',
      number_of_guests: data.guests ? data.guests.toString() : '',
      status: 'PENDING',
      comment: formData.comment,
    };

    console.log('Reservation Data:', reservationData);

    mutate({
      values: {
        occasion: dataReceived?.occasion,
        status: 'PENDING',
        source: reservationData.source,
        tables: [],
        commenter: '',
        internal_note: reservationData.comment,
        number_of_guests: reservationData.number_of_guests,
        date: reservationData.date,
        time: `${reservationData.time}:00`,
        restaurant: 1,
        customer: selectedClient?.id,
      },
    }, {
      onSuccess(data) {
        props.onClick();
        props.onSubmit(reservationData);
      }
    });

    // window.location.reload();
  };

  const [newClientData, setNewClientData] = useState({
    new_first_name: '',
    new_last_name: '',
    new_email: 'user@example.com',
    new_phone: 'string',
  });

  const handleNewClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewClientData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNewClient = (event: React.FormEvent) => {
    event.preventDefault();
    mutateClient({
      values: {
        first_name: newClientData.new_first_name,
        last_name: newClientData.new_last_name,
        email: newClientData.new_email,
        phone: newClientData.new_phone,
      },
    });
    // window.location.reload();
  };
  const { mutate: newCustomerReservation } = useCreate({
    resource: 'api/v1/bo/reservations/with_customer/',

    mutationOptions: {
      retry: 3,
    },
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });

  const [newCustomerData, setNewCustomerData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    source: '',
    note: '',
    title: 'mr',
  });

  useEffect(() => {
    if (newTextareaRef.current) {
      newTextareaRef.current.style.height = 'auto';
      newTextareaRef.current.style.height = `${newTextareaRef.current.scrollHeight}px`;
    }
  }, [newCustomerData?.note]);


  const handleNewReservationNewCustomer = () => {
    
    if(!createUser){
      handleAddReservationWithoutCustomer();
      return;
    }
    
    const reservationData = {
      first_name: newCustomerData.first_name,
      last_name: newCustomerData.last_name,
      number_of_guests: data.guests ? data.guests.toString() : '',
      date: data.reserveDate || '',
      time: data.time || '',
      email: newCustomerData.email,
      source: newCustomerData.source,
      phone: newCustomerData.phone,
      internal_note: newCustomerData.note,
    }


    newCustomerReservation({
      values: {
        occasion: selectedOccasion,
        status: 'PENDING',
        source: reservationData.source,
        commenter: '',
        internal_note: reservationData.internal_note,
        number_of_guests: data.guests ? data.guests.toString() : '',
        date: data.reserveDate || '',
        time: data.time || '',
        restaurant: restaurantId,
        customer: {
          first_name: reservationData.first_name,
          last_name: reservationData.last_name,
          title: newCustomerData.title,
          email: reservationData.email,
          phone: reservationData.phone,
        },
      }
    }, {
      onSuccess() {
        props.onClick();
        props.onSubmit(reservationData as Reservation)
      }
    }
    );
  }

  const handleAddReservationWithoutCustomer = (): void => {
    
    mutate({
      values: {
        first_name: newCustomerData.first_name,
        last_name: newCustomerData.last_name,
        title: newCustomerData.title,
        number_of_guests: data.guests ? data.guests.toString() : '',
        date: data.reserveDate || '',
        time: data.time || '',
        source: newCustomerData.source,
        internal_note: newCustomerData.note,
        occasion: selectedOccasion,
        status: 'PENDING',
        restaurant: 1,
      },
    }, {
      onSuccess(data) {
        props.onClick();
        props.onSubmit(data as Reservation);
      }
    });
  };

  // Function to check if we can send payment link (requires email)
  const canSendPaymentLink = () => {
    return paymentRequired && newCustomerData.email && newCustomerData.email.includes('@');
  };
  
  // Function to send payment link
  const sendPaymentLink = async (seqId: string | number) => {
    setIsSendingPaymentLink(true);
    try {
      await mutate({
        resource: `api/v1/bo/reservations/${seqId}/send_payment_link/`,
        values: {},
      }, {
        onSuccess: () => {
          open?.({
            type: "success",
            message: t("notifications.paymentLink.sent"),
            description: t("notifications.paymentLink.sentDescription"),
          });
          props.onClick();
          props.onSubmit({});
        },
        onError: (error) => {
          open?.({
            type: "error",
            message: t("notifications.paymentLink.sendError"),
            description: error?.message || t("notifications.paymentLink.sendErrorDescription"),
          });
        }
      });
    } catch (error) {
      console.error("Error sending payment link:", error);
    } finally {
      setIsSendingPaymentLink(false);
    }
  };
  
  // Function to copy payment link to clipboard
  const copyPaymentLink = async (seqId: string | number) => {
    setIsCopyingPaymentLink(true);
    try {
      // Generate the payment link using our helper function
      const paymentLink = getPaymentLink(seqId);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(paymentLink);
      
      open?.({
        type: "success",
        message: t("notifications.paymentLink.copied"),
        description: t("notifications.paymentLink.copiedDescription"),
      });
      
      props.onClick();
      props.onSubmit({});
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
  
  // Function to create reservation and send payment link
  const createAndSendPaymentLink = () => {
    setIsCreatingReservation(true);
    
    // First create the reservation
    newCustomerReservation({
      values: {
        occasion: selectedOccasion,
        status: 'PENDING',
        source: newCustomerData.source,
        commenter: '',
        internal_note: newCustomerData.note,
        number_of_guests: data.guests ? data.guests.toString() : '',
        date: data.reserveDate || '',
        time: data.time || '',
        restaurant: restaurantId,
        customer: {
          first_name: newCustomerData.first_name,
          last_name: newCustomerData.last_name,
          title: newCustomerData.title,
          email: newCustomerData.email,
          phone: newCustomerData.phone,
        },
      }
    }, {
      onSuccess: (response) => {
        // Extract seq_id from response
        const seqId = response.data?.id;
        if (seqId) {
          sendPaymentLink(seqId);
        } else {
          open?.({
            type: "error",
            message: t("notifications.paymentLink.error"),
            description: t("notifications.paymentLink.missingSeqId"),
          });
          setIsCreatingReservation(false);
        }
      },
      onError: (error) => {
        open?.({
          type: "error",
          message: t("notifications.reservation.createError"),
          description: error?.message || t("notifications.reservation.createErrorDescription"),
        });
        setIsCreatingReservation(false);
      }
    });
  };
  
  // Function to create reservation and copy payment link
  const createAndCopyPaymentLink = () => {
    setIsCreatingReservation(true);
    
    // First create the reservation
    newCustomerReservation({
      values: {
        occasion: selectedOccasion,
        status: 'PENDING',
        source: newCustomerData.source,
        commenter: '',
        internal_note: newCustomerData.note,
        number_of_guests: data.guests ? data.guests.toString() : '',
        date: data.reserveDate || '',
        time: data.time || '',
        restaurant: restaurantId,
        customer: {
          first_name: newCustomerData.first_name,
          last_name: newCustomerData.last_name,
          title: newCustomerData.title,
          email: newCustomerData.email,
          phone: newCustomerData.phone,
        },
      }
    }, {
      onSuccess: (response) => {
        // Extract seq_id from response
        const seqId = response.data?.id;
        if (seqId) {
          copyPaymentLink(seqId);
        } else {
          open?.({
            type: "error",
            message: t("notifications.paymentLink.error"),
            description: t("notifications.paymentLink.missingSeqId"),
          });
          setIsCreatingReservation(false);
        }
      },
      onError: (error) => {
        open?.({
          type: "error",
          message: t("notifications.reservation.createError"),
          description: error?.message || t("notifications.reservation.createErrorDescription"),
        });
        setIsCreatingReservation(false);
      }
    });
  };

  // Function to create reservation with existing customer and send payment link
const createAndSendPaymentLinkForExistingCustomer = () => {
  // event.preventDefault();
  setIsCreatingReservation(true);
  
  mutate({
    values: {
      occasion: selectedOccasion,
      status: 'PENDING',
      source: formData.source,
      tables: [],
      commenter: '',
      internal_note: formData.comment,
      number_of_guests: data.guests ? data.guests.toString() : '',
      date: data.reserveDate,
      time: `${data.time}:00`,
      restaurant: restaurantId,
      customer: selectedClient?.id,
    },
  }, {
    onSuccess: (response) => {
      // Extract seq_id from response
      const seqId = response.data?.id;
      if (seqId) {
        sendPaymentLink(seqId);
      } else {
        open?.({
          type: "error",
          message: t("notifications.paymentLink.error"),
          description: t("notifications.paymentLink.missingSeqId"),
        });
        setIsCreatingReservation(false);
      }
    },
    onError: (error) => {
      open?.({
        type: "error",
        message: t("notifications.reservation.createError"),
        description: error?.message || t("notifications.reservation.createErrorDescription"),
      });
      setIsCreatingReservation(false);
    }
  });
};

// Function to create reservation with existing customer and copy payment link
const createAndCopyPaymentLinkForExistingCustomer = () => {
  // event.preventDefault();
  setIsCreatingReservation(true);
  
  mutate({
    values: {
      occasion: selectedOccasion,
      status: 'PENDING',
      source: formData.source,
      tables: [],
      commenter: '',
      internal_note: formData.comment,
      number_of_guests: data.guests ? data.guests.toString() : '',
      date: data.reserveDate,
      time: `${data.time}:00`,
      restaurant: restaurantId,
      customer: selectedClient?.id,
    },
  }, {
    onSuccess: (response) => {
      // Extract seq_id from response
      const seqId = response.data?.id;
      if (seqId) {
        copyPaymentLink(seqId);
      } else {
        open?.({
          type: "error",
          message: t("notifications.paymentLink.error"),
          description: t("notifications.paymentLink.missingSeqId"),
        });
        setIsCreatingReservation(false);
      }
    },
    onError: (error) => {
      open?.({
        type: "error",
        message: t("notifications.reservation.createError"),
        description: error?.message || t("notifications.reservation.createErrorDescription"),
      });
      setIsCreatingReservation(false);
    }
  });
};

// Function to check if we can send payment link for existing customer (requires email)
const canSendPaymentLinkForExistingCustomer = () => {
  return paymentRequired && formData.email && formData.email.includes('@');
};

  const [disabledButton, setDisabledButton] = useState(false);
  const [disabledButton2, setDisabledButton2] = useState(false);

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

  return (
    <div>
      <div className="overlay" onClick={props.onClick}></div>
      {showProcess && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#222222] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <ReservationProcess
              onClick={() => setShowProcess(false)}
              resData={data}
              getDateTime={(data: any) => setData(data)}
            />
          </div>
        </div>
      )}
      {findClient ? (
        <form
          className={`sm:sidepopup lt-sm:popup lt-sm:min-h-[70vh] lt-sm:max-h-[90vh] overflow-y-auto no-scrollbar lt-sm:w-full lt-sm:bottom-0 h-full gap-2 ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'
            }`}
        >
          <div className='flex justify-between items-center'>
            <h1 className="text-3xl font-[700]">{t('grid.buttons.addReservation')}</h1>
            <button
              onClick={() => props.onClick?.()}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <input
            placeholder={t('grid.placeHolders.searchClient')}
            onChange={searchFilter}
            onFocus={() => setFocusedClient(true)}
            type="text"
            className={`inputs block ${newClient && 'hidden'} ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'
              }`}
            id="name"
            required
          />
          {(
            !newClient ? (
              <div
                className={`absolute mt-[7em] flex flex-col gap-3 w-[36vw] p-2  rounded-md lt-sm:w-[87vw] ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-[#e1e1e150]'
                  }`}
              >
                <div
                  className="btn-secondary flex gap-2 items-center cursor-pointer"
                  onClick={() => setNewClient(!newClient)}
                >

                  <User size={20} />
                  {t('grid.buttons.newClient')}
                </div>
                <div className="flex flex-col h-[60vh] overflow-y-auto no-scrollbar gap-3">
                  {searchResults.map((client) => (
                    <div
                      key={client.id}
                      className={`flex btn cursor-pointer flex-col items-start gap-0 ${localStorage.getItem('darkMode') === 'true' ? 'text-white' : 'bg-white'
                        }`}
                      onClick={() => handleSelectClient(client)}
                    >
                      <p>{client.full_name}</p>
                      <p className='font-[400] text-[.8rem]'>{client.email} | {client.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className='mt-6 flex flex-col gap-4'>
                  <div className='flex gap-1 items-center'>
                  <label className="flex items-center">
                      <input
                        type="radio"
                        name="title"
                        value="mr"
                        checked={newCustomerData?.title === "mr"}
                        onChange={(e) => setNewCustomerData({ ...newCustomerData, title: e.target.value })}
                        className="radio mr-2"
                      />
                      Mr
                    </label>
                  <label className="flex items-center">
                      <input
                        type="radio"
                        name="title"
                        value="mrs"
                        checked={newCustomerData?.title === "mrs"}
                        onChange={(e) => setNewCustomerData({ ...newCustomerData, title: e.target.value })}
                        className="radio mr-2"
                      />
                      Mrs
                    </label>
                  <label className="flex items-center">
                      <input
                        type="radio"
                        name="title"
                        value="ms"
                        checked={newCustomerData?.title === "ms"}
                        onChange={(e) => setNewCustomerData({ ...newCustomerData, title: e.target.value })}
                        className="radio mr-2"
                      />
                      Ms
                    </label>
                  </div>
                  <input type='text' name='first_name' placeholder={t('grid.placeHolders.firstname')} className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white' onChange={(e) => setNewCustomerData({ ...newCustomerData, first_name: e.target.value })} required />
                  <input type='text' name='last_name' placeholder={t('grid.placeHolders.lastname')} className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white' onChange={(e) => setNewCustomerData({ ...newCustomerData, last_name: e.target.value })} required />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={createUser}
                      onChange={() => setCreatUser(!createUser)}
                      className="checkbox mr-2 form-checkbox h-4 w-4 text-green-600"
                    />
                    <span className="text-sm">{t('reservations.edit.informations.addCustomer')}</span>
                  </label>
                  {createUser && (
                    <>
                      <input type='email' name='email' placeholder={t('grid.placeHolders.email')} className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white' onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })} required />
                      <input type='tel' name='phone' placeholder={t('grid.placeHolders.phone')} className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white' onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })} required />
                    </>
                  )}
                  
                  <textarea ref={newTextareaRef} rows={2} name='note' placeholder={t('grid.placeHolders.internalNote')} 
                  className='w-full resize-none rounded-md p-2 border dark:bg-darkthemeitems dark:text-whitebg-white border-gray-300 dark:border-darkthemeitems' 
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, note: e.target.value })} />
                  
                  <BaseSelect
                    placeholder={t('reservations.occasion')}
                    options={occasions.map(occasion => ({
                      label: occasion.name,
                      value: occasion.id
                    }))}
                    value={selectedOccasion}
                    onChange={(value) => {
                      setSelectedOccasion(value as number)
                    }}
                    variant={darkMode ? "filled" : "outlined"}
                    clearable={true}
                    searchable={true}
                    loading={loadingOccasions}
                  />
                  <label htmlFor='source'>{t('export.reservationSource')}</label>
                  <select name='source' className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white' onChange={(e) => setNewCustomerData({ ...newCustomerData, source: e.target.value })} required>
                    {[sources[3], sources[4]].map((source) => (
                      <option key={source.value} value={source.value}>{source.label}</option>
                    ))}
                  </select>
                  <div
                    onClick={() => setShowProcess(true)}
                    className={`btn flex justify-around cursor-pointer ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'}`}
                  >
                    {data.reserveDate === '' ? <div>Date</div> : <span>{data.reserveDate}</span>}
                    {data.time === '' ? <div>Time</div> : <span>{data.time}</span>}
                    {data.guests === 0 ? <div>Guests</div> : <span>{data.guests}</span>}
                  </div>
                  {renderPaymentInfo()}
                  <button onClick={handleNewReservationNewCustomer} className='w-full py-2 bg-greentheme text-white rounded-lg hover:opacity-90 transition-opacity mt-3' disabled={disabledButton}>{t('reservations.buttons.addReservation')}</button>
                  {isPaymentEnabled && (
            <div className="flex gap-2 mt-2 justify-center flex-wrap">
              <BaseBtn
                variant="secondary"
                onClick={createAndSendPaymentLink}
                loading={isSendingPaymentLink}
                disabled={!canSendPaymentLink() || isCreatingReservation || disabledButton || isCheckingPayment}
                className="w-1/2"
              >
                <Mail size={16} />
                {t('reservations.buttons.createAndSendPaymentLink')}
              </BaseBtn>
              
              <BaseBtn
                variant="secondary"
                onClick={createAndCopyPaymentLink}
                loading={isCopyingPaymentLink}
                disabled={!paymentRequired || isCreatingReservation || disabledButton || isCheckingPayment}
                className="w-1/2"
              >
                <Copy size={16} />
                {t('reservations.buttons.createAndCopyPaymentLink')}
              </BaseBtn>
            </div>
          )}
                </div>
              </div>
            )
          )}
        </form>
      ) : (
        <form
          className={`sm:sidepopup lt-sm:popup lt-sm:min-h-[70vh] lt-sm:max-h-[90vh] overflow-y-auto no-scrollbar  lt-sm:w-full lt-sm:bottom-0 h-full gap-2 ${darkMode ? 'bg-bgdarktheme' : 'bg-white'
            }`}
          onSubmit={(event) => {
            event.preventDefault();
            if (paymentRequired) return;
            const reservationData: Reservation = {
              id: Date.now().toString(),
              phone: formData.phone,
              full_name: formData.full_name,
              email: formData.email,
              date: data.reserveDate || '',
              time: data.time || '',
              source: formData.source || 'OTHER',
              number_of_guests: data.guests ? data.guests.toString() : '',
              status: 'PENDING',
              internal_note: formData.comment,
              occasion: selectedOccasion,
            };
            handleAddReservation(event, reservationData);
          }}
        >
          <ArrowLeft className="cursor-pointer" onClick={() => setFindClient(true)} />
          <div className='flex justify-between items-center'>
            <h1 className="text-3xl font-[700]">{t('grid.buttons.addReservation')}</h1>
            <button
              onClick={() => props.onClick?.()}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-md  font-[500]">Tags</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedClient?.tags?.map((tag:{name:string;id:number}) => (
              <span key={tag.id} className={`text-[12px] font-[500] px-2 py-1 rounded-md mt-2 w-fit bg-softgreentheme text-greentheme`}>
                {tag.name}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <input
              placeholder={t('grid.placeHolders.name')}
              value={inputName}
              type="text"
              className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'
                }`}
              id="name"
              required
            />
            <input
              placeholder={t('grid.placeHolders.email')}
              type="email"
              className={`inputs-unique ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'
                }`}
              id="email"
              value={formData.email}
              onChange={handleFormChange}
              required
            />
            <input
              placeholder={t('grid.placeHolders.phone')}
              type="text"
              className={`inputs-unique ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'
                }`}
              id="phone"
              value={formData.phone}
              onChange={handleFormChange}
              required
            />
            <div>
              <BaseSelect
                placeholder={t('reservations.occasion')}
                options={occasions.map(occasion => ({
                  label: occasion.name,
                  value: occasion.id
                }))}
                value={selectedOccasion}
                onChange={(value) => {
                  setSelectedOccasion(value as number)
                }}
                variant={darkMode ? "filled" : "outlined"}
                clearable={true}
                searchable={true}
                loading={loadingOccasions}
              />
            </div>
            <textarea
              ref={textareaRef}
              rows={2}
              placeholder={t('grid.placeHolders.intern')}
              className={`w-full resize-none rounded-md p-2 border border-gray-300 dark:border-darkthemeitems dark:bg-darkthemeitems dark:text-whitebg-white`}
              id="comment"
              value={formData.comment}
              onChange={handleFormChange}

            />
            <BaseSelect
              placeholder={t('export.reservationSource')}
              options={[sources[3], sources[4]]}
              value={formData.source}
              onChange={(value) => setFormData((prev) => ({ ...prev, source: value as string }))}
              variant={darkMode ? "filled" : "outlined"}
              clearable={false}
            />
          </div>
          <div
            onClick={() => setShowProcess(true)}
            className={`btn flex justify-around cursor-pointer ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'
              }`}
          >
            {data.reserveDate === '' ? <div>Date</div> : <span>{data.reserveDate}</span>}
            {data.time === '' ? <div>Time</div> : <span>{data.time}</span>}
            {data.guests === 0 ? <div>Guests</div> : <span>{data.guests}</span>}
          </div>
          {renderPaymentInfo()}
          <div className="flex flex-col gap-2">
  <BaseBtn type="submit" loading={loadingCreatReservation}>
    {t('grid.buttons.addReservation')}
  </BaseBtn>
  
  {/* Only show payment link buttons if payment is enabled */}
  {isPaymentEnabled && (
    <div className="flex gap-2 mt-2 justify-center flex-wrap">
      <BaseBtn
        variant="secondary"
        onClick={createAndSendPaymentLinkForExistingCustomer}
        loading={isSendingPaymentLink}
        disabled={!canSendPaymentLinkForExistingCustomer() || isCreatingReservation || isCheckingPayment}
      >
        <Mail size={16} />
        {t('reservations.buttons.createAndSendPaymentLink')}
      </BaseBtn>
      
      <BaseBtn
        variant="secondary"
        onClick={createAndCopyPaymentLinkForExistingCustomer}
        loading={isCopyingPaymentLink}
        disabled={!paymentRequired || isCreatingReservation || isCheckingPayment}
      >
        <Copy size={16} />
        {t('reservations.buttons.createAndCopyPaymentLink')}
      </BaseBtn>
    </div>
  )}
</div>
        </form>
      )}
    </div>
  );
};

export default ReservationModal;