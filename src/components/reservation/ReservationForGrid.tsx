import { BaseKey, BaseRecord, useCreate, useList } from '@refinedev/core';
import { User } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import internal from 'stream';
import { Occasion, OccasionsType } from '../settings/Occasions';
import BaseSelect from '../common/BaseSelect';

interface ReservationType {
    timeAndDate?: {
        time: string,
        date: string
    },
    onClick: () => void
    onSubmit: () => void
}

const ReservationForGrid = (props: ReservationType) => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
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

    const restaurantId = localStorage.getItem('restaurant_id');

    const [searchInput, setSearchInput] = useState<string>('');

    const searchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const keyword = e.target.value.toLowerCase();
        setSearchInput(keyword);
    };

    interface ClientForApi {
        results: BaseRecord[];
        count: number;
    }
    const [clientsForAPI, setClientsForAPI] = useState<ClientForApi>()

    const [count, setCount] = useState(0);


    const { data: clientsData, isLoading, error } = useList({
        resource: 'api/v1/bo/customers/',
        filters: [
            {
                field: 'search',
                operator: 'eq',
                value: searchInput,
            },
            {
                field: 'page',
                operator: 'eq',
                value: 1,
            },
            {
                field: 'page_size',
                operator: 'eq',
                value: 100,
            }
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

    const [customers, setCustomers] = useState<BaseRecord[]>([]);

    useEffect(() => {
        if (clientsForAPI) {
            setCustomers(clientsForAPI.results);
            setCount(clientsForAPI.count);
        }
    }, [clientsForAPI]);



    const { mutate } = useCreate({
        resource: 'api/v1/bo/reservations/',

        mutationOptions: {
            retry: 3,
            onSuccess: (data) => {
                console.log('Reservation added:', data);
                
                props.onSubmit();
                props.onClick
            },
        },
        errorNotification(error, values, resource) {
            return {
                type: 'error',
                message: error?.formattedMessage,
            };
        },
    });

    const { mutate: newCustomerReservation } = useCreate({
        resource: 'api/v1/bo/reservations/with_customer/',

        mutationOptions: {
            retry: 3,
            onSuccess: (data) => {
                console.log('Reservation added:', data);

                props.onClick
                props.onSubmit();
            }
        },
        errorNotification(error, values, resource) {
            return {
                type: 'error',
                message: error?.formattedMessage,
            };
        },
    });



    const [selectedClient, setSelectedClient] = useState<BaseRecord>();
    const [chosenClient, setChosenClient] = useState<BaseRecord | null>();

    const handleNewReservationNewCustomer = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const reservationData = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            source: formData.get('source'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            guests: formData.get('guests'),
            internal_note: formData.get('note'),
        }

        newCustomerReservation({
            values: {
                occasion: selectedOccasion,
                status: 'PENDING',
                source: reservationData.source,
                commenter: '',
                internal_note: reservationData.internal_note,
                number_of_guests: reservationData.guests,
                date: props.timeAndDate?.date,
                time: `${props.timeAndDate?.time}:00`,
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

    const handleNewReservation = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const reservationData = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            source: formData.get('source'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            guests: formData.get('guests'),
            internal_note: formData.get('note'),
        }

        mutate({
            values: {
                occasion: selectedOccasion,
                status: 'PENDING',
                source: reservationData.source,
                tables: [],
                commenter: '',
                internal_note: reservationData.internal_note,
                number_of_guests: reservationData.guests,
                date: props.timeAndDate?.date,
                time: `${props.timeAndDate?.time}:00`,
                restaurant: restaurantId,
                customer: chosenClient?.id,
            },

        });
        props.onClick
    }
    const [newClient, setNewClient] = useState<boolean>(false);
    const [choosingClient, setChoosingClient] = useState<boolean>(true);
    const { t } = useTranslation();
    return (
        <div>
            <div className='overlay glassmorphism z-[300]' onClick={props.onClick} />
            <div className={`side-popup lt-sm:w-full lt-sm:h-[80vh] lt-sm:bottom-0 z-[400] h-full lg:w-[40%] w-[60%] p-5 fixed right-0 sm:top-0  ${darkMode ? 'bg-bgdarktheme text-white' : 'bg-white text-black'}`}>
                {
                    choosingClient ?
                        <div>
                            <h1 className='text-2xl font-bold text-left mt-6'>{t('grid.buttons.selectAClient')}  </h1>
                            <input type="text" onChange={searchFilter} placeholder={t('grid.placeHolders.search')} className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white' />
                            <div className={` flex mt-2 flex-col gap-2 h-[70vh] lt-sm:h-[60vh] overflow-y-scroll p-2 rounded-xl ${darkMode ? 'bg-darkthemeitems text-white' : 'bg-softgreytheme text-black'}`}>
                                <div
                                    onClick={() => { setChoosingClient(false); setNewClient(true) }}
                                    className={`flex btn-secondary cursor-pointer flex-row gap-3 items-center `}
                                >
                                    <User size={20} />
                                    <p>{t('grid.buttons.newClient')}</p>
                                </div>
                                {customers.map((client) => (
                                    <div
                                        key={client.id}
                                        className={`flex flex-col  btn cursor-pointer ${darkMode ? 'text-white' : 'bg-white'
                                            }`}
                                        onClick={() => { setChosenClient(client); setChoosingClient(false); setNewClient(false) }}
                                    >
                                        <p className='font-[600]'>{client.full_name}</p>
                                        <p className='font-[400] text-[.8rem]'>{client.email} | {client.phone}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        :
                        (newClient ?
                            <div>
                                <h1 className='text-2xl font-bold text-left mt-6'>{t('reservations.buttons.addReservation')} </h1>
                                <span className='italic font-[400] text-sm '>{t('reservationForGrid.onAt', { date: props.timeAndDate?.date, time: props.timeAndDate?.time })}</span>
                                <form className='mt-6 flex flex-col gap-4' onSubmit={handleNewReservationNewCustomer}>
                                    <input type='text' name='first_name' placeholder={t('grid.placeHolders.firstname')} className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white' required />
                                    <input type='text' name='last_name' placeholder={t('grid.placeHolders.lastname')} className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white' required />
                                    <input type='email' name='email' placeholder={t('grid.placeHolders.email')} className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white' required />
                                    <input type='tel' name='phone' placeholder={t('grid.placeHolders.phone')} className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white' required />
                                    <input type="number" name='guests' placeholder={t('grid.placeHolders.guests')} className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white' required />
                                    <input type="text" name='note' placeholder={t('grid.placeHolders.internalNote')} className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white' />
                                    <div>
                                        <BaseSelect
                                            placeholder={t('reservations.occasion')}
                                            options={occasions.map(occasion => ({
                                                label: occasion.name,
                                                value: occasion.id
                                            }))}
                                            value={selectedOccasion}
                                            onChange={(value) => {
                                                setSelectedOccasion(value as number);
                                            }}
                                            variant={darkMode?'filled':'outlined'}
                                            clearable={true}
                                            searchable={true}
                                        />
                                    </div>
                                    <select name="source" className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white' required>
                                        <option value="BACK_OFFICE">{t('overview.charts.reservationsSource.legend.BackOffice')}</option>
                                        <option value="WALK_IN">{t('overview.charts.reservationsSource.legend.WalkIn')}</option>
                                    </select>
                                    <button className='w-full py-2 bg-greentheme text-white rounded-lg hover:opacity-90 transition-opacity mt-3'>{t('reservations.buttons.addReservation')}</button>
                                </form>
                            </div>
                            :
                            <div>
                                <h1 className='text-2xl font-bold text-left mt-6'>{t('reservations.buttons.addReservation')} </h1>
                                <span className='italic font-[400] text-sm '>{t('reservationForGrid.onAtFor', { date: props.timeAndDate?.date, time: props.timeAndDate?.time })}</span> <span className='font-[600] text-sm'>{chosenClient?.full_name}</span>
                                <form className='mt-6 flex flex-col gap-4' onSubmit={handleNewReservation}>
                                    <input type="number" name='guests' placeholder={t('grid.placeHolders.guests')} className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white' required />
                                    <input type="text" name='note' placeholder={t('grid.placeHolders.internalNote')} className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white' />
                                    <div>
                                        <BaseSelect
                                            placeholder={t('reservations.occasion')}
                                            options={occasions.map(occasion => ({
                                                label: occasion.name,
                                                value: occasion.id
                                            }))}
                                            value={selectedOccasion}
                                            onChange={(value) => {
                                                setSelectedOccasion(value as number);
                                            }}
                                            variant={darkMode?'filled':'outlined'}
                                            clearable={true}
                                            searchable={true}
                                        />
                                    </div>
                                    <select name="source" className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white' required>
                                        <option value="BACK_OFFICE">{t('overview.charts.reservationsSource.legend.BackOffice')}</option>
                                        <option value="WALK_IN">{t('overview.charts.reservationsSource.legend.WalkIn')}</option>
                                    </select>
                                    <button className='w-full py-2 bg-greentheme text-white rounded-lg hover:opacity-90 transition-opacity mt-3'>{t('reservations.buttons.addReservation')}</button>
                                </form>
                            </div>
                        )
                }
            </div>
        </div>
    )
}

export default ReservationForGrid
