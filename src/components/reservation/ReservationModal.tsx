import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReservationProcess from './ReservationProcess';
import { format, formatDate, parseISO } from 'date-fns';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BaseKey, BaseRecord, useCreate, useList } from '@refinedev/core';
import { create } from 'domain';


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
      resource: 'api/v1/bo/customers',
      meta: {
        headers: {
          'X-Restaurant-ID': 1,
        },
      },
    });

    console.log('clients',clientsData?.data)

    const {mutate , isLoading: isCreating, error: createError} = useCreate()


    useEffect(() => {
        createError && console.log(createError)
    }, [createError])


    interface Client {
        full_name: string;
        email: string;
        phone: string;
        comment?: string;
    }

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
        full_name: '',
        email: '',
        phone: '',
        comment:'',
    }); // Holds the form data
    const { t } = useTranslation();

    const handleAddReservation = (event: React.FormEvent, data: Reservation): void => {
        event.preventDefault();
    
        const reservationData: Reservation = {
            id: Date.now().toString(), // Generate a unique ID
            full_name: data.full_name, // Ensure this is coming from the correct source
            email: data.email,
            date: data.reserveDate || '',
            time: data.time,
            source: 'OTHER', // Example value
            number_of_guests: data.guests, // Ensure guests are a string
            status: 'PENDING', // Example value
            comment: data.comment, // Ensure this exists in dataTypes
        };
    
        mutate(
            {
                resource: 'api/v1/bo/reservations',
                values: {
                    full_name: reservationData.full_name,
                    email: reservationData.email,
                    date: reservationData.date ? formatDate(parseISO(reservationData.date), 'yyyy-MM-dd') : '',
                    time: `${reservationData.time}:00`,
                    table_name: "", // Keep empty if no table is assigned
                    source: "BACK_OFFICE",
                    number_of_guests: reservationData.number_of_guests,
                    status: "PENDING",
                },
                meta: {
                    headers: {
                        'X-Restaurant-ID': '1', // Ensure it's a string if required by the API
                    },
                },
            },
            {
                onSuccess: (response) => {
                    console.log("Reservation added:", response);
                    props.onSubmit(reservationData);
                },
                onError: (error) => {
                    console.error("Error adding reservation:", error);
                },
            }
        );
    };
    

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

    const handleAddNewClient = () => {
        if (inputName.trim() && !clients.some((client) => client.full_name.toLowerCase() === inputName.toLowerCase())) {
            const newClient = {
                full_name: inputName,
                email: '',
                phone: '',
                comment: '', // Add comment field
            };
            setClients([...clients, newClient]);
            setSearchResults([...clients, newClient]);
            setFormData(newClient); // Ensure it matches formData structure
            setInputName('');
            setFocusedClient(false);
        }
    };
    const handleSelectClient = (client: { full_name: string; email: string; phone: string }) => {
        setFormData({ ...client, comment: '' }); // Ensure 'comment' field is included
        setInputName(client.full_name);
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
    

    const [data, setData] = useState<dataTypes>({
        reserveDate: '',
        time: '',
        guests: 0
    });

    useEffect(() => {
        console.log(data);
    }, [data]);

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
                    value={inputName} // Bind input value to state
                    type="text"
                    className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                    id="name"
                    required
                />
                {focusedClient && (
                    <div className={`absolute mt-[7em] flex flex-col gap-3  w-[36vw] p-2 shadow-md rounded-md lt-sm:w-[87vw] ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'}`}>
                        <div
                            className="btn-secondary cursor-pointer"
                            onClick={() => {
                                handleAddNewClient();
                                setFindClient(false); // Set findClient to false to move to the next form
                            }}
                        >
                            {t('grid.buttons.addNewClient')}
                        </div>
                        <div className="flex flex-col h-[10em] overflow-y-auto gap-3">
                            {searchResults.map((client, index) => (
                                <div
                                    key={index}
                                    className={`flex btn cursor-pointer flex-row gap-2 ${localStorage.getItem('darkMode') === 'true' ? 'text-white' : 'bg-white'}`}
                                    onClick={() => {
                                        handleSelectClient(client); // Handle client selection
                                        setFindClient(false); // Set findClient to false
                                    }}
                                >
                                    <p>{client.full_name}</p>
                                </div>
                            ))}
                        </div>
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
