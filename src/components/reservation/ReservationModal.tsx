import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReservationProcess from './ReservationProcess';
import { ArrowLeft } from 'lucide-react';
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
  const { data: clientsData, isLoading, error } = useList({
    resource: 'api/v1/bo/customers/',

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
    phone: '',
    comment: '',
  });

  const [showProcess, setShowProcess] = useState(false);
  const [newClient, setNewClient] = useState(false);
  const [findClient, setFindClient] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { t } = useTranslation();

  useEffect(() => {
    if (clientsData?.data) {
      setClients(clientsData.data as Client[]);
      setSearchResults(clientsData.data as Client[]);
    }
  }, [clientsData]);

  const searchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value.toLowerCase();
    if (!keyword) {
      setSearchResults(clients);
    } else {
      setInputName(e.target.value);
      const results = clients.filter((client) =>
        client.full_name.toLowerCase().includes(keyword)
      );
      setSearchResults(results);
    }
  };

  const handleSelectClient = (client: Client) => {
    setFormData({ ...client, id: 0, comment: '' });
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
      source: 'OTHER',
      number_of_guests: data.guests ? data.guests.toString() : '' ,
      status: 'PENDING',
      comment: formData.comment,
    };

    console.log('Reservation Data:', reservationData);

    mutate({
      values: {
        occasion: 'none',
        status: 'PENDING',
        source: 'BACK_OFFICE',
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
          {focusedClient && (
            !newClient ? (
              <div
                className={`absolute mt-[7em] flex flex-col gap-3 w-[36vw] p-2 shadow-md rounded-md lt-sm:w-[87vw] ${
                  localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'
                }`}
              >
                <div
                  className="btn-secondary cursor-pointer"
                  onClick={() => setNewClient(!newClient)}
                >
                  {t('grid.buttons.addNewClient')}
                </div>
                <div className="flex flex-col h-[10em] overflow-y-auto gap-3">
                  {searchResults.map((client) => (
                    <div
                      key={client.id}
                      className={`flex btn cursor-pointer flex-row gap-2 ${
                        localStorage.getItem('darkMode') === 'true' ? 'text-white' : 'bg-white'
                      }`}
                      onClick={() => handleSelectClient(client)}
                    >
                      <p>{client.full_name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  onChange={handleNewClientChange}
                  type="text"
                  placeholder="First Name"
                  id="new_first_name"
                  className={`inputs-unique ${
                    localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'
                  }`}
                />
                <input
                  onChange={handleNewClientChange}
                  type="text"
                  placeholder="Last Name"
                  id="new_last_name"
                  className={`inputs-unique ${
                    localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'
                  }`}
                />
                <input
                  onChange={handleNewClientChange}
                  type="text"
                  placeholder="Phone Number"
                  id="new_phone"
                  className={`inputs-unique ${
                    localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'
                  }`}
                />
                <input
                  onChange={handleNewClientChange}
                  type="text"
                  placeholder="Email"
                  id="new_email"
                  className={`inputs-unique ${
                    localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'
                  }`}
                />
                <button onClick={handleNewClient} className="btn-primary" type="submit">
                  Save client
                </button>
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
              source: 'OTHER',
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