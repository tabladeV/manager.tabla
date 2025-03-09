import React from 'react';
import { BaseKey } from '@refinedev/core';
import { CalendarCheck, SquarePen, Users, X } from 'lucide-react';
import { useDrag } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import DraggableItemSkeleton from './DraggableItemSkeleton';
import { ReservationStatus } from '../common/types/Reservation';

interface tablesType {
  id: BaseKey;
  name: string;
}

interface DraggableItemProps {
  itemData: {
    id: BaseKey;
    full_name: string;
    time: string;
    date: string;
    status: ReservationStatus;
    number_of_guests: number;
    occasion?: string;
    created_at: string;
    tables: tablesType[];
    onEdit: (id: BaseKey) => void;
    loading: boolean;
  };
}

const ItemType = 'BOX';

const DraggableItem = (props: DraggableItemProps) => {
  const { t } = useTranslation();
  const darkMode = localStorage.getItem('darkMode') === 'true';
  // Data to pass on drop
  const { itemData } = props;
  const [, drag] = useDrag(() => ({
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
    }, // This is the data being passed
    canDrag: itemData.status === 'APPROVED',
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  if(itemData.loading)
    return (
      <DraggableItemSkeleton count={1} isDarkMode={darkMode} />
    )


  return (
    <>
      <div
        ref={drag}
        className={`cursor-grab p-3 flex flex-col rounded-[10px] mb-3 ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme2 text-[#e2e2e290]' : ' bg-softgreytheme text-subblack'}`}
      >
        <div className='flex justify-between'>
          <div className='flex items-center'>
            <div className={`w-[5vw]  flex  flex-col text-center items-center ${localStorage.getItem('darkMode') === 'true' ? 'text-[#e2e2e290]' : ''}`}>
              <h4 className='font-[700] text-[17px]'>{itemData.time?.replace(':00', '')}</h4>
              <p className='font-[600] text-[12px]'>{itemData.date}</p>
            </div>
            <div className='border border-[#00000010] mx-2 border-solid h-full'></div>
            <div>
              <h3 className={` font-[600] ${localStorage.getItem('darkMode') === 'true' ? 'text-whitetheme' : 'text-blacktheme'}`}>
                {itemData.full_name}
              </h3>
              <div className='flex gap-3'>

                <div className='flex gap-1 items-center'>
                  <Users size={14} />
                  <p className='font-[600] text-[13px] flex flex-row  w-[5em]'>{itemData.number_of_guests} {t('placeManagement.reservations.guests')}</p>
                </div>

                <div className='flex gap-1 items-center'>
                  <CalendarCheck size={16} />
                  <p className='font-[600] text-[13px]'>{itemData.occasion === "none" ? t('placeManagement.reservations.none') : itemData.occasion}</p>
                </div>

              </div>
            </div>
          </div>
          <button 
            onClick={() => itemData.onEdit(itemData.id)}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors"
          >
            <SquarePen color='#88AB61' />
          </button>
        </div>
        <div className="flex flex-wrap gap-1 max-w-full mt-1">
          {itemData.tables.map(table => {
            return (
              <div
                key={String(table.id)}
                className="bg-softgreentheme text-greentheme dark:text-textdarktheme dark:bg-greentheme rounded-full px-2 py-1 text-xs flex items-center"
              >
                <span className="mr-1">{table?.name}</span>
                <X
                  size={14}
                  className="cursor-pointer"
                  onClick={(e) => {
                    console.log(table, itemData)
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default DraggableItem;