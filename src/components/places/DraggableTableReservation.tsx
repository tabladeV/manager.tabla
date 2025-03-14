// DraggableTableReservation.tsx
import { BaseKey } from '@refinedev/core';
import { useDrag } from 'react-dnd';
import { Occasion } from '../settings/Occasions';
import { currentResType } from './DropTarget';
import { getTextColor } from '../../utils/helpers';

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
}

const ItemType = 'TABLE_RESERVATION';

const DraggableTableReservation: React.FC<DraggableTableReservationProps> = ({ reservation, fromTableId, name, id, max,
  type,
  x,
  y,
  height,
  width }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: { 
      ...reservation,
      fromTableId
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      key={id}
      className={`text-center text-white rounded-[10px] flex flex-col justify-center items-center`}
      style={{
        opacity: isDragging ? 0.5 : 1,
        width,
        height,
        backgroundColor: reservation?.occasion?.color || '#FF4B4B',
        // transform: `translate(${x}px, ${y}px)`,
        // transform: `translate(${x}px, ${y}px)`,
        borderRadius: type === 'RECTANGLE' ? '10px' : '50%',
        color: getTextColor((reservation?.occasion?.color || '#FF4B4B'))
      }}
    >
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
  );
};

export default DraggableTableReservation;