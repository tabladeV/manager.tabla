import { useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import { useDateContext } from '../../context/DateContext';
import { BaseKey, useCreate, useUpdate } from '@refinedev/core';
import { Trash } from 'lucide-react';

const ItemType = 'BOX';

interface DropTargetProps {
  id: BaseKey;
  name: string;
  type: 'RECTANGLE' | 'CIRCLE';
  floorId: BaseKey | undefined;
  x: number;
  y: number;
  height: number;
  width: number;
  max: number;
  min: number;
  reservedBy: currentResType | null;
  hourChosen: string;
}

interface TableType {
  id: BaseKey;
  name: string;
  type: 'CIRCLE' | 'RECTANGLE';
  x: number;
  floor: number;
  y: number;
  height: number;
  width: number;
  max: number;
  min: number;
  current_reservations: Reservation[];
}

interface currentResType {
  id: BaseKey;
  full_name: string;
  time: string;
  date: string;
  email: string;
  phone: string;
  number_of_guests: number;
}

interface Reservation {
  id: BaseKey;
  full_name: string;
  time: string;
  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'SEATED';
  number_of_guests: number;
  occasion?: string;
  created_at: string;
  tables: TableType[];
}

interface DroppedItem {
  id: BaseKey;
  full_name: string;
  time: string;
  date: string;
  email: string;
  phone: string;
  number_of_guests: number;
  occasion?: string;
  tables?: TableType[];
}

const DropTarget: React.FC<DropTargetProps> = ({
  height,
  name,
  width,
  min,
  max,
  id,
  type,
  x,
  y,
  reservedBy,
  hourChosen,
}) => {
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);

  const { mutate } = useUpdate({
    resource: `api/v1/bo/tables`,

  });


  const { mutate: mutateReservations } = useUpdate({
    resource: `api/v1/bo/tables/${id}/assign-reservation`,

  });

  useEffect(() => {
    if (reservedBy) {
      setDroppedItems([
        {
          id: reservedBy.id,
          full_name: reservedBy.full_name,
          time: hourChosen,
          date: reservedBy.date,
          number_of_guests: reservedBy.number_of_guests,
          occasion: '',
          tables: [],
          email: reservedBy.email,
          phone: reservedBy.phone,
        },
      ]);
    } else {
      setDroppedItems([]);
    }
  }, [reservedBy, hourChosen, id]);

  const [, drop] = useDrop({
    accept: ItemType,
    drop: (item: DroppedItem) => {
      const isTimeAlreadyDropped = droppedItems.some(
        (droppedItem) => droppedItem.time === item.time
      );
      if (
        !isTimeAlreadyDropped &&
        droppedItems.length < 1 &&
        item.number_of_guests <= max &&
        item.number_of_guests >= min
      ) {
        setDroppedItems((prevItems) => [...prevItems, item]);
        // mutate({
        //   id: id + '/',
        //   values: {
        //     reservations: [item.id],
        //   },
        // });
        mutateReservations({
          id: item.id+'/',
          values: {
            reservations: [item.id],
          },
        });
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // console.log(droppedItems[0].number_of_guests);
  const [isClients, setIsClients] = useState(false);

  const removeReservation = () => {
    setDroppedItems([]);
  };

  return (
    <div
      onMouseOver={() => setIsClients(true)}
      onMouseLeave={() => setIsClients(false)}
      ref={drop}
      key={id}
      className={`absolute text-center ${
        droppedItems.length > 0 ? 'text-white' : ''
      } rounded-[10px] flex flex-col justify-center items-center border-[2px] ${
        droppedItems.length > 0 ? 'border-redtheme' : 'border-greentheme'
      }`}
      style={{
        width,
        height,
        backgroundColor:
          droppedItems.length > 0
            ? '#FF4B4B'
            : localStorage.getItem('darkMode') === 'true'
            ? '#042117'
            : '#F6F6F6',
        left: x,
        top: y,
        borderRadius: type === 'RECTANGLE' ? '10px' : '50%',
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
        className={`text-[12px] pa-1 rounded-full h-[20px] min-w-[20px] font-semibold ${
          localStorage.getItem('darkMode') === 'true'
              ? 'bg-bgdarktheme text-white'
              : 'bg-[#dddddd] text-greytheme'
        }`}
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {/* {max} {max > 1?'seats':'seat'} */}
        {max}
      </span>
      {isClients && (
        <div
          className={`absolute z-[100] text-greytheme  right-[-13em] w-[13em] p-2 rounded-[10px] font-medium ${
            localStorage.getItem('darkMode') === 'true'
              ? 'bg-bgdarktheme text-white'
              : 'bg-[#F6F6F6] text-greytheme'
          }`}
        >
          {name} has {droppedItems.length} client
          {droppedItems.slice(0, 3).map((item, index) => (
            <div
              className={`p-1 flex justify-between items-center gap-2 rounded-[5px] mt-1 font-semibold ${
                localStorage.getItem('darkMode') === 'true'
                  ? 'bg-bgdarktheme'
                  : 'bg-softgreytheme'
              }`}
              key={index}
            >
              {item.full_name}
              <Trash
                size={30}
                className="bg-softredtheme text-redtheme p-2 rounded-md cursor-pointer"
                onClick={removeReservation}
              />
            </div>
          ))}
          {droppedItems.length > 3 && (
            <div
              className={`p-1 rounded-[5px] mt-1 font-semibold ${
                localStorage.getItem('darkMode') === 'true'
                  ? 'bg-softgreentheme text-blacktheme'
                  : 'bg-softgreentheme'
              }`}
            >
              +{droppedItems.length - 3} more
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DropTarget;