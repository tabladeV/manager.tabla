import { useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import { useDateContext } from '../../context/DateContext';
import { BaseKey, useUpdate } from '@refinedev/core';
import { Trash } from 'lucide-react';

const ItemType = 'BOX';

interface DropTargetProps {
  id: BaseKey;
  name:string;
  type: 'RECTANGLE' | 'CIRCLE';
  floorId: BaseKey| undefined;
  x: number;
  y: number;
  height: number;
  width: number;
  max: number;
  min: number;
  reservedBy: currentResType | null; // Changed to Reservation type
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

interface currentResType{
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
  status: "PENDING" | "CONFIRMED" | "CANCELED";
  number_of_guests: number;
  occasion?: string;
  created_at: string;
  tables: TableType[];
}

interface DroppedItem {
  id:BaseKey;
  full_name: string;
  time: string;
  date: string;
  email: string;
  phone: string;
  number_of_guests: number;
  occasion?: string;        // Added missing properties
  tables?: TableType[];     // Added missing properties
}

const DropTarget: React.FC<DropTargetProps> = ({ height,name , width, min, max, id, type, x, y, reservedBy, hourChosen }) => {
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]); // Initialize empty array

  const { mutate} = useUpdate({
    resource: `api/v1/bo/tables`,
    meta:{
      headers: {
        "X-Restaurant-ID": 1,
      },
    },
  });
  useEffect(() => {
    if (reservedBy) {
      
        setDroppedItems([{
          id: reservedBy.id,
          full_name: reservedBy.full_name,
          time: reservedBy.time,
          date: reservedBy.date,
          number_of_guests: reservedBy.number_of_guests,
          occasion: '',
          tables: [],
          email: reservedBy.email,       // Add default values for DroppedItem properties
          phone: reservedBy.phone,       // Add default values for DroppedItem properties
        }]);
      
    } else {
      setDroppedItems([]);
    }
  }, [reservedBy, hourChosen, id]);

  const [, drop] = useDrop({
    accept: ItemType,
    drop: (item: DroppedItem) => {
      const isTimeAlreadyDropped = droppedItems.some((droppedItem) => droppedItem.time === item.time);
      if (!isTimeAlreadyDropped && droppedItems.length < 1 && item.number_of_guests <= max && item.number_of_guests >= min) {
        setDroppedItems((prevItems) => [...prevItems, item]);
        mutate({
          id: id+'/',
          values: {
            // "name": name,
            // "type": type,
            // "width": width,
            // "height": height,
            // "x": x,
            // "y": y,
            // "max": max,
            // "min": min,
            // "floor": floorId,
            "reservations": [
              item.id
            ]
          },
        });
        // console.log({
        //   "name": name,
        //     "type": type,
        //     "width": width,
        //     "height": height,
        //     "x": x,
        //     "y": y,
        //     "max": max,
        //     "min": min,
        //     "floor": floorId,
        //     "reservations": [
        //       item.id
        //     ]
        // })
        
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const [isClients, setIsClients] = useState(false);

  const removeReservation = ()=>{
    setDroppedItems([])
  }

  return (
    <div
      onMouseOver={() => setIsClients(true)}
      onMouseLeave={() => setIsClients(false)}
      ref={drop}
      key={id}
      className={`absolute ${droppedItems.length > 0 ? 'text-white' : ''} rounded-[10px] flex flex-col justify-center items-center border-[2px] ${
        droppedItems.length > 0 ? 'border-redtheme' : 'border-greentheme'
      }`}
      style={{
        width,
        height,
        backgroundColor: droppedItems.length > 0 ? '#FF4B4B' : localStorage.getItem('darkMode') === 'true' ? '#031911' : '#F6F6F6',
        left: x,
        top: y,
        borderRadius: type === 'RECTANGLE' ? '10px' : '50%',
      }}
    >
      <h2 className="text-[14px] font-semibold">{name}</h2>
      <p className="text-[13px] p-1 bg-[#1e1e1e10] rounded-[5px]">{max} seats</p>
      {isClients && (
        <div
          className={`absolute z-[100] text-greytheme right-[-13.4em] w-[13em] p-2 rounded-[10px] font-medium ${
            localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme text-white' : 'bg-white text-greytheme'
          }`}
        >
          {name} has {droppedItems.length} client
          {droppedItems.slice(0, 3).map((item, index) => (
            <div
              className={`p-1 flex justify-between items-center gap-2 rounded-[5px] mt-1 font-semibold ${
                localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-softgreytheme'
              }`}
              key={index}
            >
              {item.full_name}
              <Trash size={30} className='bg-softredtheme text-redtheme p-2 rounded-md cursor-pointer' onClick={removeReservation}/>
            </div>
          ))}
          {droppedItems.length > 3 && (
            <div
              className={`p-1 rounded-[5px] mt-1 font-semibold ${
                localStorage.getItem('darkMode') === 'true' ? 'bg-softgreentheme text-blacktheme' : 'bg-softgreentheme'
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