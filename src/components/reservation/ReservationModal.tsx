import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReservationProcess from './ReservationProcess';
import { ArrowLeft, User } from 'lucide-react';
import { BaseKey, BaseRecord, useCreate, useList } from '@refinedev/core';

interface Reservation extends BaseRecord {
    id: BaseKey;
    email: string;
    full_name: string;
    date: string;
    time: string;
    internal_note: string;
    source: string;
    number_of_guests: string;
    phone: string;
    status: string;
    commenter?: string;
    review?: boolean;
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

  const restaurantId = localStorage.getItem('restaurant_id');

  const [searchKeyword, setSearchKeyword] = useState('');

  interface ClientForApi {
    results: Client[];
    count: number;
  }
  const [clientsForAPI, setClientsForAPI] = useState<ClientForApi>()

  const [count,setCount] = useState(0);

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
      },
      onError: (error) => {
        console.log('Error:', error);
      },
    },

  });

  const { mutate } = useCreate({
    resource: 'api/v1/bo/reservations/',

    mutationOptions: {
      retry: 3,
      onSuccess: (data) => {
        console.log('Reservation added:', data);
      },
      onError: (error) => {
        console.log('Error adding reservation:', error);
      },
    },
  });

  const { mutate: mutateClient } = useCreate({
    resource: 'api/v1/bo/customers/',

    mutationOptions: {
      retry: 3,
      onSuccess: (data) => {
        console.log('Client added:', data);
      },
      onError: (error) => {
        console.log('Error adding client:', error);
      },
    },
  });

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
    source: '',
    phone: '',
    comment: '',
  });

  const [showProcess, setShowProcess] = useState(false);
  const [newClient, setNewClient] = useState(false);
  const [findClient, setFindClient] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { t } = useTranslation();

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
    setFormData({ ...client, id: 0, comment: '', source: '' });
    setInputName(client.full_name);
    setSelectedClient(client);
    setFocusedClient(false);
    setFindClient(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      number_of_guests: data.guests ? data.guests.toString() : '' ,
      status: 'PENDING',
      comment: formData.comment,
    };

    console.log('Reservation Data:', reservationData);

    mutate({
      values: {
        occasion: 'none',
        status: 'PENDING',
        source: reservationData.source,
        tables:[],
        commenter: '',
        internal_note: reservationData.comment,
        number_of_guests: reservationData.number_of_guests,
        date: reservationData.date,
        time: `${reservationData.time}:00`,
        restaurant: 1,
        customer: selectedClient?.id,
      },
    });

    props.onClick();
    window.location.reload();
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
            onSuccess: (data) => {
              console.log('Reservation added:', data);
              window.location.reload();
            },
            onError: (error) => {
              console.log('Error adding reservation:', error);
            },
          },
      });

      const [newCustomerData, setNewCustomerData] = useState({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          source: '',
          note: '',
      });
  

   const handleNewReservationNewCustomer = () => {

          const reservationData = {
              first_name: newCustomerData.first_name,
              last_name: newCustomerData.last_name,
              number_of_guests: data.guests ? data.guests.toString() : '' ,
              date: data.reserveDate || '',
              time: data.time || '',
              email: newCustomerData.email,
              source: newCustomerData.source,
              phone: newCustomerData.phone,
              internal_note: newCustomerData.note,
          }
          console.log('Reservation Data:', reservationData);
  
          newCustomerReservation({
              values: {
                occasion: 'none',
                status: 'PENDING',
                source: reservationData.source,
                commenter: '',
                internal_note: reservationData.internal_note,
                number_of_guests: data.guests ? data.guests.toString() : '' ,
                date: data.reserveDate || '',
                time: data.time || '',
                restaurant: restaurantId,
                customer: {
                    first_name: reservationData.first_name,
                    last_name: reservationData.last_name,
                    email: reservationData.email,
                    phone: reservationData.phone,
                },
              },
              
          });
      }

  return (
    <div>
      <div className="overlay" onClick={props.onClick}></div>
      {showProcess && (
        <ReservationProcess
          onClick={() => setShowProcess(false)}
          getDateTime={(data: dataTypes) => setData(data)}
        />
      )}
      {findClient ? (
        <form
          className={`sm:sidepopup lt-sm:popup lt-sm:h-[70vh] lt-sm:w-full lt-sm:bottom-0 h-full gap-5 ${
            localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'
          }`}
        >
          <h1 className="text-3xl font-[700]">{t('grid.buttons.addReservation')}</h1>
          <input
            placeholder={t('grid.placeHolders.searchClient')}
            onChange={searchFilter}
            onFocus={() => setFocusedClient(true)}
            type="text"
            className={`inputs block ${newClient && 'hidden'} ${
              localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'
            }`}
            id="name"
            required
          />
          {(
            !newClient ? (
              <div
                className={`absolute mt-[7em] flex flex-col gap-3 w-[36vw] p-2  rounded-md lt-sm:w-[87vw] ${
                  localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-[#e1e1e150]'
                }`}
              >
                <div
                  className="btn-secondary flex gap-2 items-center cursor-pointer"
                  onClick={() => setNewClient(!newClient)}
                >

                  <User size={20}/>
                  {t('grid.buttons.newClient')}
                </div>
                <div className="flex flex-col h-[60vh] overflow-y-auto no-scrollbar gap-3">
                  {searchResults.map((client) => (
                    <div
                      key={client.id}
                      className={`flex btn cursor-pointer flex-col items-start gap-0 ${
                        localStorage.getItem('darkMode') === 'true' ? 'text-white' : 'bg-white'
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
                    <input type='text' name='first_name' placeholder={t('grid.placeHolders.firstname')} className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white'  onChange={(e) => setNewCustomerData({...newCustomerData, first_name: e.target.value})} required/>
                    <input type='text' name='last_name' placeholder={t('grid.placeHolders.lastname')} className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white'  onChange={(e) => setNewCustomerData({...newCustomerData, last_name: e.target.value})} required/>
                    <input type='email' name='email' placeholder={t('grid.placeHolders.email')} className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white' onChange={(e) => setNewCustomerData({...newCustomerData, email: e.target.value})} required/>
                    <input type='tel' name='phone' placeholder={t('grid.placeHolders.phone')} className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white' onChange={(e) => setNewCustomerData({...newCustomerData, phone: e.target.value})} required/>
                    <input type="text" name='note' placeholder={t('grid.placeHolders.internalNote')} className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white' onChange={(e) => setNewCustomerData({...newCustomerData, note: e.target.value})} />
                    <select name='source' className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white' onChange={(e) => setNewCustomerData({...newCustomerData, source: e.target.value})} required>
                      <option value='BACK_OFFICE'>Back Office</option>
                      <option value='WALK_IN'>Walk In</option>
                    </select>
                    <div
                      onClick={() => setShowProcess(true)}
                      className={`btn flex justify-around cursor-pointer ${
                        localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'
                      }`}
                    >
                      {data.reserveDate === '' ? <div>Date</div> : <span>{data.reserveDate}</span>}
                      {data.time === '' ? <div>Time</div> : <span>{data.time}</span>}
                      {data.guests === 0 ? <div>Guests</div> : <span>{data.guests}</span>}
                    </div>
                    <button onClick={handleNewReservationNewCustomer} className='w-full py-2 bg-greentheme text-white rounded-lg hover:opacity-90 transition-opacity mt-3'>{t('reservations.buttons.addReservation')}</button>
                </div>
              </div>
            )
          )}
        </form>
      ) : (
        <form
          className={`sm:sidepopup lt-sm:popup lt-sm:h-[70vh] lt-sm:w-full lt-sm:bottom-0 h-full gap-5 ${
            localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'
          }`}
          onSubmit={(event) => {
            const reservationData: Reservation = {
              id: Date.now().toString(),
              phone: formData.phone,
              full_name: formData.full_name,
              email: formData.email,
              date: data.reserveDate || '',
              time: data.time || '',
              source: formData.source || 'OTHER',
              number_of_guests: data.guests? data.guests.toString():'',
              status: 'PENDING',
              internal_note: formData.comment,
            };
            handleAddReservation(event, reservationData);
          }}
        >
          <ArrowLeft className="cursor-pointer" onClick={() => setFindClient(true)} />
          <h1 className="text-3xl font-[700]">{t('grid.buttons.addReservation')}</h1>
          <div className="flex flex-col gap-2">
            <input
              placeholder={t('grid.placeHolders.name')}
              value={inputName}
              type="text"
              className={`inputs ${
                localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'
              }`}
              id="name"
              required
            />
            <input
              placeholder={t('grid.placeHolders.email')}
              type="email"
              className={`inputs-unique ${
                localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'
              }`}
              id="email"
              value={formData.email}
              onChange={handleFormChange}
              required
            />
            <input
              placeholder={t('grid.placeHolders.phone')}
              type="text"
              className={`inputs-unique ${
                localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'
              }`}
              id="phone"
              value={formData.phone}
              onChange={handleFormChange}
              required
            />
            <input
              placeholder={t('grid.placeHolders.intern')}
              type="text"
              className={`inputs-unique ${
                localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'
              }`}
              id="comment"
              value={formData.comment}
              onChange={handleFormChange}
              
            />
            <select name='source' className='inputs-unique' onChange={(e) => setFormData((prev) => ({ ...prev, source: e.target.value }))} required>
              <option value='BACK_OFFICE'>Back Office</option>
              <option value='WALK_IN'>Walk In</option>
            </select>
          </div>
          <div
            onClick={() => setShowProcess(true)}
            className={`btn flex justify-around cursor-pointer ${
              localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'
            }`}
          >
            {data.reserveDate === '' ? <div>Date</div> : <span>{data.reserveDate}</span>}
            {data.time === '' ? <div>Time</div> : <span>{data.time}</span>}
            {data.guests === 0 ? <div>Guests</div> : <span>{data.guests}</span>}
          </div>
          <button type="submit" className="btn-primary">
            {t('grid.buttons.addReservation')}
          </button>
        </form>
      )}
    </div>
  );
};

export default ReservationModal;