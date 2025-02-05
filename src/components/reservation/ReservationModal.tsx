import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReservationProcess from './ReservationProcess';
import { format, formatDate, parseISO } from 'date-fns';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BaseKey, BaseRecord, useCreate, useList } from '@refinedev/core';
import { create } from 'domain';
import { id } from 'date-fns/locale';


interface Reservation extends BaseRecord {
    id: BaseKey;
    email: string;
    full_name: string;
    date: string;
    time: string;
    source: string;
    number_of_guests: string;
    status: string;
    comment?: string;
    review?: boolean;
  }

  
  interface reservationInfo {
      reserveDate: string;
      time: string;
      guests: number;
    }
    interface ReservationModalProps {
        onClick: () => void;
        // onSubmit: () => void;
        onSubmit: (data:Reservation) => void;
    }

const ReservationModal = (props: ReservationModalProps) => {
    const {data: clientsData , isLoading, error} = useList({
      resource: 'api/v1/bo/customers/',
      meta: {
        headers: {
          'X-Restaurant-ID': 1,
        },
      },
    });

    console.log('clients',clientsData?.data)

    const { mutate } = useCreate({
        resource: "api/v1/bo/reservations/", // Updated endpoint
        meta: {
            headers: {
            "X-Restaurant-ID": 1,
            },
        },
        mutationOptions: {
            retry: 3,
            onSuccess: (data) => {
            console.log("Floor added:", data);
            },
            onError: (error) => {
            console.log("Error adding floor:", error);
            },
        },
    });
    
    const { mutate: mutateClient } = useCreate({
        resource: "api/v1/bo/customers/", // Updated endpoint
        meta: {
            headers: {
            "X-Restaurant-ID": 1,
            },
        },
        mutationOptions: {
            retry: 3,
            onSuccess: (data) => {
            console.log("client added:", data);
            },
            onError: (error) => {
            console.log("Error adding client:", error);
            },
        },
    });



    interface Client {
        id: BaseKey;
        full_name: string;
        email: string;
        phone: string;
        comment?: string;
    }

    const [data, setData] = useState<dataTypes>({
        reserveDate: '',
        time: '',
        guests: 0
    });

    useEffect(() => {
        console.log(data);
    }, [data]);
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        if (clientsData?.data) {
            setClients(clientsData.data as Client[]);
        }
    }, [clientsData]);

    const [focusedClient, setFocusedClient] = useState(false);
    const [searchResults, setSearchResults] = useState(clients);
    const [inputName, setInputName] = useState(''); // Holds the current input value
    const [formData, setFormData] = useState({
        id: 0,
        full_name: '',
        email: '',
        phone: '',
        comment:'',
    }); // Holds the form data
    const { t } = useTranslation();

    const [dateTimeGuests,setDateTimeGuests]= useState<dataTypes>()

    useEffect(()=>{
        setDateTimeGuests(data)
    },[data])

    const handleAddReservation = (event: React.FormEvent, data: Reservation): void => {
        event.preventDefault();
    
        const reservationData: Reservation = {
            id: 1, // Generate a unique ID
            full_name: data.full_name, // Ensure this is coming from the correct source
            email: data.email,
            date: data.reserveDate || '',
            time: data.time,
            source: 'OTHER', // Example value
            number_of_guests: data.guests, // Ensure guests are a string
            status: 'PENDING', // Example value
            comment: data.comment, // Ensure this exists in dataTypes
        };

        console.log("Formatted date:", data.reserveDate );
        console.log("Reservation Data:", reservationData);

    
        mutate({
            values: {
                "occasion": "none",
                "status": "PENDING",
                "source": "BACK_OFFICE",
                "commenter": reservationData.comment,
                "internal_note": reservationData.comment,
                "number_of_guests": dateTimeGuests?.guests,
                "date": dateTimeGuests?.reserveDate,
                "time": `${dateTimeGuests?.time}:00`,
                "restaurant": 1,
                "customer": selectedClient?.id 
            },
          });

        props.onClick();
        // window.location.reload();
        
    };
    
    useEffect(()=>{
        setSearchResults(clients)
    },[clients])

    const searchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const keyword = e.target.value.toLowerCase();
        if (!keyword) {
            setSearchResults(clients);
        }
        else{
            setInputName(e.target.value); // Update the input value state
            const results = clients.filter((client) =>
                client.full_name.toLowerCase().includes(keyword)
            );
            setSearchResults(results);
        }
    };

    const [clientId, setClientId] = useState<BaseKey>(0);
    const handleSelectClient = (client: {id:BaseKey; full_name: string; email: string; phone: string }) => {
        setFormData({ ...client, id: 0, comment: '' }); // Ensure 'comment' field is included
        setInputName(client.full_name);
        setClientId(client.id);
        setFocusedClient(false);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value } as Pick<typeof formData, keyof typeof formData>)); // Update form field
    };

    const [showProcess, setShowProcess] = useState(false);
    interface dataTypes {  
        reserveDate: string | null;
        time: string;
        guests: number;
    }

    interface Client {
        first_name:string,
        last_name: string,
        email:string,
        phone:string
    }

    const [selectedClient, setSelectedClient]= useState<Client>()

    const [newClientData, setNewClientData] = useState({
        new_first_name: '',
        new_last_name: '',
        new_email: 'user@aesaxample.com',
        new_phone: 'string',
    });


    const handleNewClientChange  = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setNewClientData((prev) => ({ ...prev, [id]: value } as Pick<typeof newClientData, keyof typeof newClientData>)); // Update form field
    };

    const handleNewClient = (event: React.FormEvent) => {
        event.preventDefault();
        console.log('this is new client',newClientData)
        
        mutateClient({
            values: {
                "first_name": newClientData.new_first_name,
                "last_name": newClientData.new_last_name,
                "email": newClientData.new_email,
                "phone": newClientData.new_phone
            },
        });
        window.location.reload()

    };
    

    const [newClient, setNewClient] = useState(false)

    const [findClient, setFindClient] = useState(true);

    return (
        <div>

            <div className="overlay" onClick={props.onClick}></div>
            {showProcess && <div className=''><ReservationProcess onClick={()=>{setShowProcess(false)}} getDateTime={(data:dataTypes)=>{setData(data)}}/></div>}
            {findClient ? 
            <form 
                className={`sm:sidepopup lt-sm:popup lt-sm:h-[70vh] lt-sm:w-full lt-sm:bottom-0 h-full gap-5 ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'}`}
            >
                <h1 className="text-3xl font-[700]">
                    {t('grid.buttons.addReservation')}
                </h1>
                <input
                    placeholder={t('grid.placeHolders.searchClient')}
                    onChange={searchFilter}
                    onFocus={() => setFocusedClient(true)}
                    // value={inputName} 
                    type="text"
                    className={`inputs block ${newClient && 'hidden'} ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                    id="name"
                    required
                />
                {focusedClient && (
                    !newClient ?<div className={`absolute mt-[7em] flex flex-col gap-3  w-[36vw] p-2 shadow-md rounded-md lt-sm:w-[87vw] ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'}`}>
                        <div
                            className="btn-secondary cursor-pointer"
                            onClick={() => {
                                setNewClient(!newClient);
                                 // Set findClient to false to move to the next form
                            }}
                        >
                            {t('grid.buttons.addNewClient')}
                        </div>
                        <div className="flex flex-col h-[10em] overflow-y-auto gap-3">
                            {searchResults.map((client) => (
                                <div
                                    key={client.id}
                                    className={`flex btn cursor-pointer flex-row gap-2 ${localStorage.getItem('darkMode') === 'true' ? 'text-white' : 'bg-white'}`}
                                    onClick={() => {
                                        setSelectedClient(client)
                                        handleSelectClient(client); // Handle client selection
                                        setFindClient(false); // Set findClient to false
                                    }}
                                >
                                    <p>{client.full_name}</p>
                                </div>
                            ))}
                        </div>
                    </div>:
                    <div className='flex flex-col gap-3 '  >
                        {/* {
                            "first_name": "string",
                            "last_name": "sajs",
                            "email": "user@aesaxample.com",
                            "phone": "string",
                            "internal_note": "string",
                            "created_at": "2025-02-04T00:27:58.885Z"
                        } */}
                        <input onChange={handleNewClientChange} type="text" placeholder="First Name" id='new_first_name' className={`inputs-unique ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'}`} />
                        <input onChange={handleNewClientChange} type='text' placeholder='Last Name' id='new_last_name' className={`inputs-unique ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'}`}/>
                        <input onChange={handleNewClientChange} type='text' placeholder='Phone Number' id='new_phone' className={`inputs-unique ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'}`}/>
                        <input onChange={handleNewClientChange} type='text' placeholder='Email' id='new_email' className={`inputs-unique ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'}`}/>
                        <button onClick={handleNewClient} className='btn-primary' type='submit'>
                            Save client
                        </button>
                    </div>
                )}
            </form>
            : 
            
            <form
                className={`sm:sidepopup lt-sm:popup lt-sm:h-[70vh] lt-sm:w-full lt-sm:bottom-0 h-full gap-5 ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'}`}
                onSubmit={(event) => {
                    const reservationData: Reservation = {
                        id: Date.now().toString(),
                        full_name: formData.full_name,
                        email: formData.email,
                        date: data.reserveDate || '',
                        time: data.time,
                        source: 'OTHER',
                        number_of_guests: data.guests.toString(),
                        status: 'PENDING',
                        comment: formData.comment,
                    };
                    handleAddReservation(event, reservationData);
                }}
            >
                <ArrowLeft className="cursor-pointer" onClick={() => setFindClient(true)} />
                <h1 className="text-3xl font-[700]">
                    {t('grid.buttons.addReservation')}
                </h1>
                

                <div className="flex flex-col gap-2">
                    <div className="flex flex-row w-full gap-2">
                        <input
                            placeholder={t('grid.placeHolders.name')}
                            value={inputName} // Bind input value to state
                            type="text"
                            className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                            id="name"
                            required
                        />
                        
                    </div>
                    <input
                        placeholder={t('grid.placeHolders.email')}
                        type="email"
                        className={`inputs-unique ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'}`}
                        id="email"
                        value={formData.email} // Autofill email
                        onChange={handleFormChange} // Handle email change
                        required
                    />
                    <input
                        placeholder={t('grid.placeHolders.phone')}
                        type="text"
                        className={`inputs-unique ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'}`}
                        id="phone"
                        value={formData.phone} // Autofill phone
                        onChange={handleFormChange} // Handle phone change
                        required
                    />
                    <input
                        placeholder={t('grid.placeHolders.intern')}
                        type="text"
                        className={`inputs-unique ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'}`}
                        id="comment"
                        value={formData.comment} // Autofill phone
                        onChange={handleFormChange} // Handle phone change
                        required
                    />
                    {/* <select name="places" id="places" 
                        className={`inputs-unique ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'}`}
                    >
                        <option value="Places" disabled>
                            Places
                        </option>
                        <option value="Pending">Main Room</option>
                        <option value="Confirmed">Outdoor</option>
                        <option value="Canceled">Terrace</option>
                    </select>
                    <select name="table" id="table" 
                        className={`inputs-unique ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'}`}
                    >
                        <option value="table" disabled>
                            Table
                        </option>
                        <option value="Pending">T-01</option>
                        <option value="Confirmed">Outdoor</option>
                        <option value="Canceled">Terrace</option>
                    </select> */}
                </div>
                
                <div onClick={()=>{setShowProcess(true)}} className={`btn flex justify-around cursor-pointer ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'}`}>
                    {(data.reserveDate === '') ?<div>date </div>:<span>{data.reserveDate}</span>}
                    {(data.time === '') ? <div>Time </div>:<span>{data.time}</span>} 
                    {(data.guests===0) ? <div>Guests </div>:<span>{data.guests}</span>}
                    
                    

                </div>
                <button type="submit" className="btn-primary">
                    {t('grid.buttons.addReservation')}
                </button>
            </form>
               
            }
        </div>
    );
};

export default ReservationModal;
