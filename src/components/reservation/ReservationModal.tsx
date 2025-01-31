import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReservationProcess from './ReservationProcess';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface reservationInfo {
    reserveDate: string;
    time: string;
    guests: number;
}
interface ReservationModalProps {
    onClick: () => void;
    // onSubmit: () => void;
    onSubmit: (data:{name:string; email:string; number: string;comment:string ;reservationInfo: reservationInfo}) => void;
}

const ReservationModal = (props: ReservationModalProps) => {
    const [clients, setClients] = useState([
        { name: 'John Doe', email: 'john@gmail.com', phone: '1234567890' },
        { name: 'Jane Doe', email: 'jane@gmail.com', phone: '0987654321' },
        { name: 'Chris Diaz', email: 'chris@gmail.com', phone: '1122334455' },
    ]);

    const [focusedClient, setFocusedClient] = useState(false);
    const [searchResults, setSearchResults] = useState(clients);
    const [inputName, setInputName] = useState(''); // Holds the current input value
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        comment:'',
    }); // Holds the form data
    const { t } = useTranslation();

    const handleAddReservation = (event: React.FormEvent): void => {
        event.preventDefault();
        const reservationData = {
            name: formData.name,
            email: formData.email,
            number: formData.phone,
            comment: formData.comment,
            reservationInfo: data
        };
        props.onSubmit(reservationData);
        // Add your reservation handling logic here
    };

    const searchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const keyword = e.target.value.toLowerCase();
        setInputName(e.target.value); // Update the input value state
        const results = clients.filter((client) =>
            client.name.toLowerCase().includes(keyword)
        );
        setSearchResults(results);
    };

    const handleAddNewClient = () => {
        if (
            inputName.trim() &&
            !clients.some((client) => client.name.toLowerCase() === inputName.toLowerCase())
        ) {
            const newClient = {
                name: inputName,
                email: '',
                phone: '',
            };
            setClients([...clients, newClient]); // Add new client to the list
            setSearchResults([...clients, newClient]); // Update search results
            setFormData({ name: inputName, email: '', phone: '' }); // Autofill name in form
            setInputName(''); // Clear input field
            setFocusedClient(false); // Close the dropdown
        }
    };

    const handleSelectClient = (client: { name: string; email: string; phone: string }) => {
        setFormData(client); // Autofill the form with client data
        setInputName(client.name); // Update the input field
        setFocusedClient(false); // Close the dropdown
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value })); // Update form field
    };

    const [showProcess, setShowProcess] = useState(false);
    interface dataTypes {  
        reserveDate: string,
        time: string,
        guests: number
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
                                    <p>{client.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </form>
            : 
            
            <form
                className={`sm:sidepopup lt-sm:popup lt-sm:h-[70vh] lt-sm:w-full lt-sm:bottom-0 h-full gap-5 ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'}`}
                onSubmit={handleAddReservation}
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
                        id="phone"
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
