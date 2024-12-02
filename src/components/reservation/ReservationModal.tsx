import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ReservationModalProps {
    onClick: () => void;
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
    }); // Holds the form data
    const { t } = useTranslation();

    const handleAddReservation = (event: React.FormEvent) => {
        event.preventDefault();
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

    return (
        <div>
            <div className="overlay" onClick={props.onClick}></div>
            <form
                className="sm:sidepopup lt-sm:popup lt-sm:h-[70vh] lt-sm:w-full lt-sm:bottom-0 h-full gap-5"
                onSubmit={handleAddReservation}
            >
                <h1 className="text-3xl text-blacktheme font-[700]">
                    {t('grid.buttons.addReservation')}
                </h1>

                <div className="flex flex-col gap-2">
                    <div className="flex flex-row w-full gap-2">
                        <input
                            placeholder={t('grid.placeHolders.name')}
                            // onBlur={() => setFocusedClient(false)}
                            onChange={searchFilter}
                            onFocus={() => setFocusedClient(true)}
                            value={inputName} // Bind input value to state
                            type="text"
                            className="inputs"
                            id="name"
                            required
                        />
                        {focusedClient && (
                            <div className="absolute mt-[3em] flex flex-col gap-3 bg-white w-[36vw] p-2 shadow-md rounded-md">
                                <div
                                    className="btn-secondary cursor-pointer"
                                    onClick={handleAddNewClient}
                                >
                                    {t('grid.buttons.addThisClient')}
                                </div>
                                <div className="flex flex-col h-[10em] overflow-y-auto gap-3">
                                    {searchResults.map((client, index) => (
                                        <div
                                            key={index}
                                            className="flex btn cursor-pointer flex-row gap-2"
                                            onClick={() => handleSelectClient(client)} // Handle client selection
                                        >
                                            <p>{client.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <input
                        placeholder={t('grid.placeHolders.email')}
                        type="email"
                        className="inputs-unique"
                        id="email"
                        value={formData.email} // Autofill email
                        onChange={handleFormChange} // Handle email change
                        required
                    />
                    <input
                        placeholder={t('grid.placeHolders.phone')}
                        type="text"
                        className="inputs-unique"
                        id="phone"
                        value={formData.phone} // Autofill phone
                        onChange={handleFormChange} // Handle phone change
                        required
                    />
                    <select name="places" id="places" className="inputs-unique">
                        <option value="Places" disabled>
                            Places
                        </option>
                        <option value="Pending">Main Room</option>
                        <option value="Confirmed">Outdoor</option>
                        <option value="Canceled">Terrace</option>
                    </select>
                    <select name="table" id="table" className="inputs-unique">
                        <option value="table" disabled>
                            Table
                        </option>
                        <option value="Pending">T-01</option>
                        <option value="Confirmed">Outdoor</option>
                        <option value="Canceled">Terrace</option>
                    </select>
                </div>
                <button type="submit" className="btn-primary">
                    {t('grid.buttons.addReservation')}
                </button>
            </form>
        </div>
    );
};

export default ReservationModal;
