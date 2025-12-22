import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BaseKey, CanAccess, useCreate, useUpdate } from '@refinedev/core';
import { CalendarCheck, DollarSign, EllipsisVertical, Mail, Phone, Settings2, SquarePen, Users, X } from 'lucide-react';
import { useDrag } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import DraggableItemSkeleton from './DraggableItemSkeleton';
import { ReservationStatus } from '../common/types/Reservation';
import { Occasion } from '../settings/Occasions';
import { useDarkContext } from '../../context/DarkContext';
import { format } from 'date-fns';
import { getTextColor } from '../../utils/helpers';
import IndeterminateProgress from '../common/IderminateProgress';

interface tablesType {
  id: BaseKey;
  name: string;
}

interface DraggableItemProps {
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
    event?: any;
  };
  canChangeRes: boolean;
}

const ItemType = 'BOX';

const DraggableItem = (props: DraggableItemProps) => {
  const { t } = useTranslation();
  const { darkMode } = useDarkContext();

  // Data to pass on drop
  const { itemData } = props;
  const [showReservationOptions, setShowReservationOptions] = useState(false);
  const reservationOptionsMenuRef = useRef<HTMLDivElement>(null);
  const reservationOptionsBtnRef = useRef<HTMLButtonElement>(null);

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
    console.log(showReservationOptions);
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
  }, [showReservationOptions]);

  const canDrag = useCallback(() => {
    return itemData.status === 'APPROVED' && !showReservationOptions && props.canChangeRes;
  }, [itemData, showReservationOptions, props.canChangeRes]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: {
      id: itemData.id,
      full_name: itemData.full_name,
      time: itemData.time,
      date: itemData.date,
      status: itemData.status,
      number_of_guests: itemData.number_of_guests,
      occasion: itemData.occasion,
      created_at: itemData.created_at,
      tables: itemData.tables
    },
    canDrag: canDrag,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

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
    if (loadingUpdateReservation || loadingReview) return;

    updateReservation({
      id: `${itemData.id}/`,
      values: {
        status: status
      }
    }, {
      onSuccess() {
        itemData.onUpdate();
        setShowReservationOptions(false);
      }
    });
  };

  if (itemData.loading) {
    return <DraggableItemSkeleton count={1} isDarkMode={darkMode} />;
  }

  return (
    <div className='relative'>
      <div
        ref={drag}
        className={`overflow-hidden relative select-none mx-1 ${canDrag() ? 'cursor-grab' : ''} p-2 flex flex-col rounded-[10px] my-1 dark:bg-bgdarktheme2 dark:text-[#e2e2e290] bg-softgreytheme text-subblack ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        data-testid="draggable-reservation"
      >
        <div className='absolute top-[4px] right-[4px]'>
          <CanAccess resource='reservation' action='change'>
            <button
              ref={reservationOptionsBtnRef}
              className="btn-secondary px-0 py-1 z-10  transform transition-all duration-300 ease-in-out"
              onClick={() => {
                if (loadingUpdateReservation || loadingReview) return;

                setShowReservationOptions(prev => !prev)
              }}
            >
              <EllipsisVertical size={16} />
            </button>
          </CanAccess>
        </div>
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
                  {itemData.occasion &&
                    <div className={`flex gap-1 items-center py-1 px-2 rounded-xl ${itemData?.occasion?.color ? 'text-[' + getTextColor(itemData?.occasion?.color || '#e5e7eb') + ']' : ''} ${itemData.occasion?.color ? '' : ''}`} style={{
                      backgroundColor: itemData.occasion?.color || 'transparent',
                    }}>
                      <CalendarCheck size={16} />
                      <p className='font-[600] text-[13px]'>
                        {!itemData.occasion ? t('placeManagement.reservations.none') : itemData.occasion?.name}
                      </p>
                    </div>
                  }
                  {itemData.event && (
                    <div className="flex gap-1 items-center py-1 px-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      <CalendarCheck size={16} />
                      <p className='font-[600] text-[13px]'>
                        {itemData.event.title}
                      </p>
                    </div>
                  )}
                  {(itemData.email || itemData.phone) && <div className="flex flex-col mt-1 gap-x-4 gap-y-1 text-sm lt-md:flex-col">
                    {itemData.email && <div className="flex items-center gap-1 text-gray-500">
                      <Mail size={14} className={'dark:text-gray-400 text-gray-500'} />
                      <span>{itemData.email}</span>
                    </div>}

                    {itemData.phone && <div className="flex items-center gap-1 text-gray-500">
                      <Phone size={14} className={'dark:text-gray-400 text-gray-500'} />
                      <span>{itemData.phone || 'N/A'}</span>
                    </div>}
                  </div>}
                </div>
                  {itemData.is_payed && (
                    <div className="flex gap-1 my-1 text-sm bg-softyellowtheme items-center text-yellowtheme w-fit px-2 py-1 rounded">
                      <DollarSign size={14} className={`dark:text-yellowtheme text-yellowtheme`} />
                      <span>{t('reservations.tableHeaders.paid')}{itemData.amount && `: ${itemData.amount} DH`}</span>
                    </div>
                  )}
              </div>
            </div>
            <div className="flex flex-wrap gap-1 w-full mt-1">
              {itemData.tables.map(table => (
                <div
                  key={String(table.id)}
                  className="bg-softgreentheme text-greentheme dark:text-textdarktheme dark:bg-greentheme rounded-full px-1 py-1 text-xs flex items-center"
                >
                  <span className="mr-1">{table?.name}</span>
                  {/* <X
                    size={14}
                    className="cursor-pointer"
                    onClick={(e) => {
                      
                    }}
                  /> */}
                </div>
              ))}
            </div>
          </div>
          <div className={`flex flex-col gap-1 items-end ${itemData.tables?.length?'justify-center':'justify-end'}`}>
            <CanAccess resource='reservation' action='change'>
              <button
                onClick={() => itemData.onEdit(itemData.id)}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors"
              >
                <SquarePen color='#88AB61' />
              </button>
            </CanAccess>
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
            {itemData.status === 'APPROVED' &&
              <>
                <li className="transition-colors duration-300 ease-in-out py-1 px-2 text-orangetheme hover:bg-orangetheme hover:bg-opacity-20 rounded-md cursor-pointer" onClick={() => statusHandler('SEATED')}>
                  {t('reservations.statusLabels.seated')}
                </li>
                <li className={`transition-colors duration-300 ease-in-out py-1 px-2 text-bluetheme hover:bg-bluetheme hover:bg-opacity-20 rounded-md cursor-pointer`} onClick={() => statusHandler('PENDING')}>
                  {t('reservations.statusLabels.pending')}
                </li>
                <li className="transition-colors duration-300 ease-in-out py-1 px-2 text-blushtheme hover:bg-blushtheme hover:bg-opacity-20 rounded-md cursor-pointer" onClick={() => statusHandler('NO_SHOW')}>
                  {t('reservations.statusLabels.noShow')}
                </li>
              </>
            }
            {itemData.status === 'PENDING' &&
              <>
                <li className="transition-colors duration-300 ease-in-out py-1 px-2 text-greentheme hover:bg-greentheme hover:bg-opacity-20 rounded-md cursor-pointer" onClick={() => statusHandler('APPROVED')}>
                  {t('reservations.statusLabels.confirmed')}
                </li>
                <li className="transition-colors duration-300 ease-in-out py-1 px-2 text-redtheme hover:bg-redtheme hover:bg-opacity-20 rounded-md cursor-pointer" onClick={() => statusHandler('CANCELED')}>
                  {t('reservations.statusLabels.cancelled')}
                </li>
              </>
            }
            {itemData.status === 'SEATED' &&
              <>
                <li className="transition-colors duration-300 ease-in-out py-1 px-2 text-greentheme hover:bg-greentheme hover:bg-opacity-20 rounded-md cursor-pointer" onClick={() => sendReview()}>
                  {'Request review'}
                </li>
                <li className="transition-colors duration-300 ease-in-out py-1 px-2 text-greentheme hover:bg-greentheme hover:bg-opacity-20 rounded-md cursor-pointer" onClick={() => statusHandler('APPROVED')}>
                  {t('reservations.statusLabels.confirmed')}
                </li>
                <li className={`transition-colors duration-300 ease-in-out py-1 px-2 text-bluetheme hover:bg-bluetheme hover:bg-opacity-20 rounded-md cursor-pointer`} onClick={() => statusHandler('PENDING')}>
                  {t('reservations.statusLabels.pending')}
                </li>
              </>
            }

          </ul>
        </div>
      }
    </div>
  );
};

export default DraggableItem;
