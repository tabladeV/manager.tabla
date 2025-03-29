import React from 'react';
import { BaseKey } from '@refinedev/core';
import { CalendarCheck, SquarePen, Users, X } from 'lucide-react';
import { useDrag } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import DraggableItemSkeleton from './DraggableItemSkeleton';
import { ReservationStatus } from '../common/types/Reservation';
import { Occasion } from '../settings/Occasions';
import { useDarkContext } from '../../context/DarkContext';
import { format } from 'date-fns';
import { getTextColor } from '../../utils/helpers';

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
    occasion?: Occasion;
    created_at: string;
    tables: tablesType[];
    onEdit: (id: BaseKey) => void;
    loading: boolean;
    selected: boolean;
  };
}

const ItemType = 'BOX';

const DraggableItem = (props: DraggableItemProps) => {
  const { t } = useTranslation();
  const { darkMode } = useDarkContext();
  // Data to pass on drop
  const { itemData } = props;
  
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
    canDrag: itemData.status === 'APPROVED',
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const formatDate = (date:string)=>{
    try{
      const jsDate = new Date(date);
      return format(jsDate, 'MM-dd-yy');
    }catch(e){
      return '-- -- --'
    }
  }

  if (itemData.loading) {
    return <DraggableItemSkeleton count={1} isDarkMode={darkMode} />;
  }

  return (
    <div
      ref={drag}
      className={`overflow-hidden relative select-none mx-1 cursor-grab p-2 flex flex-col rounded-[10px] my-1 dark:bg-bgdarktheme2 dark:text-[#e2e2e290] bg-softgreytheme text-subblack ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      data-testid="draggable-reservation"
    >
      <input
        type="checkbox"
        name="blocked"
        defaultChecked={itemData.selected}
        className="absolute right-[5px] top-[5px] checkbox form-checkbox h-4 w-4 text-green-600"
      />
      <div className='flex justify-between'>
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
                <div className={`flex gap-1 items-center py-1 px-2 rounded-xl ${itemData?.occasion?.color?'text-['+getTextColor(itemData?.occasion?.color || '#e5e7eb')+']':''} ${itemData.occasion?.color?'':''}`} style={{
                  backgroundColor: itemData.occasion?.color || 'transparent',
                }}>
                  <CalendarCheck size={16} />
                  <p className='font-[600] text-[13px]'>
                    {!itemData.occasion ? t('placeManagement.reservations.none') : itemData.occasion?.name}
                  </p>
                </div>
              }
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-2 justify-end items-end'>
          <button
            onClick={() => itemData.onEdit(itemData.id)}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors"
          >
            <SquarePen color='#88AB61' />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 max-w-full mt-1">
        {itemData.tables.map(table => (
          <div
            key={String(table.id)}
            className="bg-softgreentheme text-greentheme dark:text-textdarktheme dark:bg-greentheme rounded-full px-2 py-1 text-xs flex items-center"
          >
            <span className="mr-1">{table?.name}</span>
            <X
              size={14}
              className="cursor-pointer"
              onClick={(e) => {
                console.log(table, itemData);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DraggableItem;