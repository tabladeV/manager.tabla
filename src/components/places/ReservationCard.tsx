import React, { useEffect, useRef, useState } from 'react';
import { BaseKey, CanAccess, useCreate, useUpdate } from '@refinedev/core';
import { CalendarCheck, DollarSign, EllipsisVertical, Mail, Phone, SquarePen, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DraggableItemSkeleton from './DraggableItemSkeleton';
import { ReservationStatus } from '../common/types/Reservation';
import { Occasion } from '../settings/Occasions';
import { useDarkContext } from '../../context/DarkContext';
import { format } from 'date-fns';
import { getTextColor } from '../../utils/helpers';
import IndeterminateProgress from '../common/IderminateProgress';
import { ReservationStatusLabel } from '../../_root/pages/ReservationsPage';

interface tablesType {
    id: BaseKey;
    name: string;
}

interface ReservationCardProps {
    itemData: {
        id: BaseKey;
        full_name: string;
        email: string;
        phone: string;
        time: string;
        date: string;
        status: ReservationStatus;
        number_of_guests: number;
        occasion?: Occasion;
        created_at: string;
        tables: tablesType[];
        onEdit: (id: BaseKey) => void;
        onUpdate: () => void;
        loading: boolean;
        is_payed?: boolean;
        amount?: string;
    };
    handleStatus: (status: string) => void;
    showStatusModification: (id: BaseKey) => void;
}

const ReservationCard = (props: ReservationCardProps) => {
    const { t } = useTranslation();
    const { darkMode } = useDarkContext();

    // Data to pass on drop
    const { itemData, handleStatus, showStatusModification } = props;
    const [showReservationOptions, setShowReservationOptions] = useState(false);
    const reservationOptionsMenuRef = useRef<HTMLDivElement>(null);
    const reservationOptionsBtnRef = useRef<HTMLDivElement>(null);
    // Mutations
    const { mutate: updateReservation, isLoading: loadingUpdateReservation } = useUpdate({
        resource: `api/v1/bo/reservations`,
        errorNotification(error, values, resource) {
            return {
                type: 'error',
                message: error?.formattedMessage,
            };
        }
    });

    const { mutate: createReview, isLoading: loadingReview } = useCreate({
        resource: `api/v1/bo/reservations/${itemData?.id}/send_review_link/`,
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

    // Handle click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: { target: any; }) => {
            if (
                !loadingUpdateReservation && !loadingReview &&
                showReservationOptions &&
                reservationOptionsMenuRef.current &&
                !reservationOptionsMenuRef.current.contains(event.target) &&
                reservationOptionsBtnRef.current &&
                !reservationOptionsBtnRef.current.contains(event.target)
            ) {
                setShowReservationOptions(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [loadingReview, loadingUpdateReservation, showReservationOptions]);

    const formatDate = (date: string) => {
        try {
            const jsDate = new Date(date);
            return format(jsDate, 'MM-dd-yy');
        } catch (e) {
            return '-- -- --'
        }
    }

    const sendReview = (): void => {
        if (loadingUpdateReservation || loadingReview) return;
        createReview({
            values: {
                reservations: [itemData],
            },
        }, {
            onSuccess() {
                itemData.onUpdate();
                setShowReservationOptions(false);
            }
        });
    };

    const statusHandler = (status: string): void => {
        handleStatus(status);
        setShowReservationOptions(false);
    };

    // const statusHandler = (status: string): void => {
    //     if (loadingUpdateReservation || loadingReview) return;

    //     updateReservation({
    //         id: `${itemData.id}/`,
    //         values: {
    //             status: status
    //         }
    //     }, {
    //         onSuccess() {
    //             // itemData.onUpdate();
    //             setCurrentStatus(status);
    //             setShowReservationOptions(false);
    //         }
    //     });
    // };

    if (itemData.loading) {
        return <DraggableItemSkeleton count={1} isDarkMode={darkMode} />;
    }

    return (
        <div className='relative'>
            <div
                className="overflow-hidden relative select-none mx-1 p-2 flex flex-col rounded-[10px] my-1 dark:bg-bgdarktheme2 dark:text-[#e2e2e290] bg-softgreytheme text-subblack"
                data-testid="reservation-card"
            >
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 justify-start items-start'>
                        <div className='flex items-center'>
                            <div className={`min-w-[50px] flex flex-col text-center items-center ${darkMode ? 'text-[#e2e2e290]' : ''}`}>
                                <h5 className='font-[700]'>{itemData.time?.replace(':00', '')}</h5>
                                <p className='font-[600] text-[12px]'>{formatDate(itemData.date)}</p>
                            </div>
                            <div className='border border-[#00000010] mx-2 border-solid h-full'></div>
                            <div>
                                <h5 className={`font-[600] ${darkMode ? 'text-whitetheme' : 'text-blacktheme'}`}>
                                    {itemData.full_name}
                                </h5>
                                <div className='flex flex-wrap gap-1'>
                                    <div className='flex gap-1 items-center'>
                                        <Users size={14} />
                                        <p className='font-[600] text-[13px] flex flex-row w-[5em]'>
                                            {itemData.number_of_guests} {t('placeManagement.reservations.guests')}
                                        </p>
                                    </div>
                                    {(itemData.email || itemData.phone) && <div className="flex flex-col mt-1 gap-x-4 gap-y-1 text-sm lt-md:flex-col">
                                        {itemData.email &&  <div className="flex items-center gap-1 text-gray-500">
                                            <Mail size={14} className={'dark:text-gray-400 text-gray-500'} />
                                            <span>{itemData.email}</span>
                                        </div>}

                                        {itemData.phone &&  <div className="flex items-center gap-1 text-gray-500">
                                            <Phone size={14} className={'dark:text-gray-400 text-gray-500'} />
                                            <span>{itemData.phone || 'N/A'}</span>
                                        </div>}
                                    </div>}
                                    {itemData.occasion &&
                                        <div className={`flex gap-1 items-center py-1 px-2 rounded-xl ${itemData.occasion?.color ? '' : ''}`} style={{
                                            backgroundColor: itemData.occasion?.color || 'transparent',
                                            color: itemData?.occasion?.color ? getTextColor(itemData?.occasion?.color || '#0f0f0f') : ''
                                        }}>
                                            <CalendarCheck size={16} />
                                            <p className='font-[600] text-[13px]'>
                                                {!itemData.occasion ? t('placeManagement.reservations.none') : itemData.occasion?.name}
                                            </p>
                                        </div>
                                    }
                                    {itemData.is_payed && (
                                        <div className="flex gap-1 my-1 text-sm bg-softyellowtheme items-center text-yellowtheme w-fit px-2 py-1 rounded">
                                            <DollarSign size={14} className={`dark:text-yellowtheme text-yellowtheme`} />
                                            <span>{t('reservations.tableHeaders.paid')}{itemData.amount && `: ${itemData.amount} DH`}</span>
                                        </div>
                                    )}
                                </div>
                                <div className='flex flex-wrap mt-1'>
                                    <CanAccess resource='reservation' action='change' fallback={
                                        <ReservationStatusLabel status={itemData.status} loading={itemData.loading} />
                                    }>
                                        <div ref={reservationOptionsBtnRef} onClick={() => {
                                            showStatusModification(itemData.id);
                                            setShowReservationOptions(prev => !prev)
                                        }}>
                                        <ReservationStatusLabel status={itemData.status} loading={itemData.loading}/>
                                        </div>
                                    </CanAccess>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1 w-full mt-1">
                            {itemData.tables.map(table => (
                                <div
                                    key={String(table.id)}
                                    className="bg-softgreentheme text-greentheme dark:text-textdarktheme dark:bg-greentheme rounded-full px-1 py-1 text-xs flex items-center"
                                >
                                    <span className="mr-1">{table?.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={`flex flex-col gap-1 items-end justify-center`}>
                        <button
                            onClick={() => itemData.onEdit(itemData.id)}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors"
                        >
                            <SquarePen color='#88AB61' />
                        </button>
                    </div>
                </div>
            </div>
            {showReservationOptions &&
                <div
                    ref={reservationOptionsMenuRef}
                    className={`absolute right-0 top-[5px] w-64 rounded-lg shadow-lg z-50 dark:bg-bgdarktheme overflow-hidden bg-white`}
                >
                    {(loadingUpdateReservation || loadingReview) && <IndeterminateProgress />}
                    <ul className={`p-2 rounded-md shadow-md dark:text-white dark:bg-darkthemeitems bg-white text-subblack ${loadingUpdateReservation || loadingReview ? 'opacity-50' : ''}`}>
                        {itemData.status !== 'APPROVED' &&  <li className="transition-colors duration-300 ease-in-out py-1 px-2 text-greentheme hover:bg-greentheme hover:bg-opacity-20 rounded-md cursor-pointer" onClick={() => statusHandler('APPROVED')}>
                            {t('reservations.statusLabels.confirmed')}
                        </li>}
                        {itemData.status !== 'SEATED' &&  <li className="transition-colors duration-300 ease-in-out py-1 px-2 text-orangetheme hover:bg-orangetheme hover:bg-opacity-20 rounded-md cursor-pointer" onClick={() => statusHandler('SEATED')}>
                            {t('reservations.statusLabels.seated')}
                        </li>}
                        {itemData.status !== 'PENDING' &&  <li className={`transition-colors duration-300 ease-in-out py-1 px-2 text-bluetheme hover:bg-bluetheme hover:bg-opacity-20 rounded-md cursor-pointer`} onClick={() => statusHandler('PENDING')}>
                            {t('reservations.statusLabels.pending')}
                        </li>}
                        {itemData.status === 'SEATED' && <li className="transition-colors duration-300 ease-in-out py-1 px-2 text-greentheme hover:bg-greentheme hover:bg-opacity-20 rounded-md cursor-pointer" onClick={() => sendReview()}>
                            {'Request review'}
                        </li>}
                        {itemData.status !== 'CANCELED' &&  <li className="transition-colors duration-300 ease-in-out py-1 px-2 text-redtheme hover:bg-redtheme hover:bg-opacity-20 rounded-md cursor-pointer" onClick={() => statusHandler('CANCELED')}>
                            {t('reservations.statusLabels.cancelled')}
                        </li>}
                        {(itemData.status !== 'SEATED' && itemData.status !== 'NO_SHOW') && <li className="transition-colors duration-300 ease-in-out py-1 px-2 text-blushtheme hover:bg-blushtheme hover:bg-opacity-20 rounded-md cursor-pointer" onClick={() => statusHandler('NO_SHOW')}>
                            {t('reservations.statusLabels.noShow')}
                        </li>}
                    </ul>
                </div>
            }
        </div>
    );
};

export default ReservationCard;
