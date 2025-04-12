import React from 'react';
import { BaseKey } from '@refinedev/core';
import { useDrag } from 'react-dnd';
import { getTextColor } from '../../utils/helpers';
import { currentResType } from './DropTarget';

interface DraggableTableReservationProps {
  reservation: currentResType | null;
  fromTableId: BaseKey;
  id: BaseKey;
  name: string;
  type: 'RECTANGLE' | 'CIRCLE';
  floorId?: BaseKey | undefined;
  x: number;
  y: number;
  height: number;
  width: number;
  max: number;
  min?: number;
  hourChosen?: string;
  canChangeRes: boolean;
}

const ItemType = 'TABLE_RESERVATION';

const DraggableTableReservation: React.FC<DraggableTableReservationProps> = ({ 
  reservation, 
  fromTableId, 
  name, 
  id, 
  max,
  type,
  x,
  y,
  height,
  width,
  canChangeRes
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: { 
      ...reservation,
      fromTableId,
      // Include dimension and appearance properties for the preview
      type,
      x,
      y,
      height,
      width,
      max,
      name
    },
    canDrag: () => canChangeRes,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      key={id}
      className={`cursor-grab border-none m-0`}
      style={{
        opacity: isDragging ? 0.5 : 1,
        width:width,
        height:height,
        backgroundColor: reservation?.occasion?.color || '#FF4B4B',
        borderRadius: type === 'RECTANGLE' ? '10px' : '50%',
        color: getTextColor((reservation?.occasion?.color || '#FF4B4B'))
      }}
    >
      <div className='flex flex-col justify-center items-center text-center h-full w-full'>
      <h6 
        className="text-[14px] px-1 w-full text-center font-semibold"
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {name}
      </h6>
      <span 
        className={`text-[12px] pa-1 rounded-full h-[20px] min-w-[20px] font-semibold dark:bg-bgdarktheme dark:text-white bg-[#dddddd] text-greytheme`}
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {max}
      </span>
      </div>
    </div>
  );
};

export default DraggableTableReservation;