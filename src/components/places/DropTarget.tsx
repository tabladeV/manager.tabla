import { useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import { useDateContext } from '../../context/DateContext';

const ItemType = 'BOX';

interface DropTargetProps {
  id: string;
  type: 'rectangle' | 'circle';
  x: number;
  y: number;
  height: number;
  width: number;
  max: number;
  min: number;
  reservedBy: reservedType;
  hourChosen: string;
}

type reservedType = {
  name?: string;
  time?: string;
  date?: string;
  guests?: number;
  occasion?: string;
  tableNumber?: number;
};

interface DroppedItem {
  name: string;
  time: string;
  date: string;
  guests: number;
  occasion: string;
  tableNumber: number;
}

const DropTarget: React.FC<DropTargetProps> = ({ height, width,min, max,id, type, x, y, reservedBy, hourChosen }) => {
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]); // Store multiple items




  useEffect(() => {
    if (reservedBy.name && reservedBy.time === hourChosen && reservedBy.date && reservedBy.guests && reservedBy.occasion && reservedBy.tableNumber) {
      setDroppedItems([{name:reservedBy.name, time:reservedBy.time, date:reservedBy.date, guests:reservedBy.guests, occasion:reservedBy.occasion, tableNumber: reservedBy.tableNumber}]);
    }
    if (reservedBy.name && reservedBy.time !== hourChosen) {
      setDroppedItems([]);
    }
  }
  ,[reservedBy, hourChosen]);

  const [{ isOver }, drop] = useDrop({
    accept: ItemType,
    drop: (item: DroppedItem) => {
      const isTimeAlreadyDropped = droppedItems.some((droppedItem) => droppedItem.time === item.time);
      if (!isTimeAlreadyDropped && droppedItems.length < 1 && item.guests <= max && item.guests >= min) {
        setDroppedItems((prevItems) => [...prevItems, item]); // Add new item to array
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  const [isClients, setIsClients] = useState(false);

  const showItems = () => {
    console.log(droppedItems); // Show all dropped items
    setIsClients(true);
  };

  return (
    <div  onMouseOver={()=>{setIsClients(true)}} onMouseLeave={()=>{setIsClients(false)}}  ref={drop} key={id}
      className={`absolute  ${droppedItems.length > 0 ? 'text-[white]':''} rounded-[10px]  flex flex-col justify-center items-center border-[2px] ${droppedItems.length > 0 ? ' border-redtheme' : 'border-greentheme'}`}
      style={{
        width,
        height,
        backgroundColor: droppedItems.length > 0 ? '#FF4B4B' : localStorage.getItem('darkMode')==='true'?'#031911':'#F6F6F6',
        left: x,
        top: y,
        borderRadius: type === 'rectangle' ? '10px' : '50%',
      }}
    >
      <h2 className='text-[14px] font-semibold'>{id}</h2>
      <p className='text-[13px]  p-1 bg-[#1e1e1e10]  rounded-[5px]'>{max} seats</p>
      {isClients && <div className={`absolute  z-[100] text-greytheme right-[-13.4em] w-[13em] p-2 rounded-[10px] font-medium ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme text-white':'bg-white text-greytheme'}`}>{id} has {droppedItems.length} clients
        {droppedItems.slice(0,3).map((item, index) => (
          <div className={` p-1 rounded-[5px] mt-1 font-semibold ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-softgreytheme'}`} key={index}>{item.name}</div>
        ))
        }
        {droppedItems.length > 3 && <div className={` p-1 rounded-[5px] mt-1 font-semibold ${localStorage.getItem('darkMode')==='true'?'bg-softgreentheme text-blacktheme':'bg-softgreentheme'}`}>+{droppedItems.length - 3} more</div>}
        </div>}
    </div>
  );
};

export default DropTarget;
