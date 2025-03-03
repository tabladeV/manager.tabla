import { useEffect, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { BaseKey, useDelete, useUpdate } from '@refinedev/core';
import { Trash } from 'lucide-react';
import DraggableTableReservation from './DraggableTableReservation';

// Original item type for reservations from the sidebar
const ItemType = 'BOX';
// New item type for reservations being moved between tables
const TableReservationType = 'TABLE_RESERVATION';

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
  onUpdateReservations: () => void;
  onShowOptions: (status: boolean) => void;
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

interface DroppedItem {
  id: BaseKey;
  full_name: string;
  time: string;
  date: string;
  email: string;
  phone: string;
  number_of_guests: number;
  occasion?: string;
  tables?: any[];
  fromTableId?: BaseKey;
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
  onUpdateReservations,
  onShowOptions
}) => {
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [draggedReservation, setDraggedReservation] = useState<DroppedItem | null>(null);
  
  const optionsRef = useRef<HTMLDivElement>(null);

  const { mutate: mutateReservations } = useUpdate({
    resource: `api/v1/bo/tables/${id}/assign-reservation`,
    mutationOptions: {
      onSuccess: (data, variables) => {
        onUpdateReservations();
      },
    },
  });
  
  const { mutate: deleteReservation } = useDelete();
  
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

  // Handle drops from the sidebar (regular reservations)
  const [{ isOver }, drop] = useDrop({
    accept: [ItemType, TableReservationType],
    drop: (item: DroppedItem) => {
      // Handle table-to-table reservation drag
      if (item.fromTableId && item.fromTableId !== id) {
        setDraggedReservation(item);
        setShowOptions(true);
        return;
      }
      
      // Handle sidebar-to-table drag (original logic)
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

  // Handle option selection (move or link)
  const handleOptionClick = (option: 'move' | 'link') => {
    if (!draggedReservation) return;
    
    console.log(`Option selected: ${option}`);
    console.log(`Move reservation ${draggedReservation.id} from table ${draggedReservation.fromTableId} to table ${id}`);
    
    // Later you'll implement the actual logic here
    // For now just logging the selection

    setShowOptions(false);
    setDraggedReservation(null);
  };

  useEffect(() => {
    if (onShowOptions) onShowOptions(showOptions);
  },[showOptions]);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
        setDraggedReservation(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [isClients, setIsClients] = useState(false);

  const removeReservation = () => {
    deleteReservation({
        resource: `api/v1/bo/tables/${id}/delete-reservation`,
        id: droppedItems[0]?.id+'/',
        values: {
          reservations: [],
        }
      },
      {
        onSuccess: () => {
          setDroppedItems([]);
          onUpdateReservations();
        },
      }
    );
  };

  return (
    <>
    <div
      onMouseOver={() => !showOptions && setIsClients(true)}
      onMouseLeave={() => !showOptions && setIsClients(false)}
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
        // transform: `translate(${x}px, ${y}px)`,
        // transform: `translate(${x}px, ${y}px)`,
        borderRadius: type === 'RECTANGLE' ? '10px' : '50%',
      }}
    >
      
      
      {/* Make the reservation draggable if the table has one */}
      {droppedItems.length > 0 ? (
        <div className="absolute inset-0 z-10">
          <DraggableTableReservation
            type={type}
            x={x}
            y={y}
            width={width}
            height={height}
            id={id}
            name={name}
            max={max}
            reservation={droppedItems[0]}
            fromTableId={id}
          />
        </div>
      ):(<>
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
        {max}
      </span>
      </>)}
      
      {/* Options tooltip when dragging between tables */}
      {showOptions && droppedItems.length < 1 && (
        <>
        <div 
          ref={optionsRef}
          className="absolute z-[150] bg-[#F6F6F6] dark:bg-bgdarktheme2 shadow-md rounded-md overflow-hidden"
          style={{ 
            top: '50%', 
            left: '105%', 
            transform: 'translateY(-50%)' 
          }}
        >
          <div 
            className="px-4 py-2 hover:bg-[#88ab61] hover:text-white cursor-pointer flex items-center"
            onClick={() => handleOptionClick('move')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M8 7l4-4 4 4M12 3v14M4 17l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Move guest
          </div>
          <div 
            className="px-4 py-2 hover:bg-[#88ab61] hover:text-white cursor-pointer flex items-center"
            onClick={() => handleOptionClick('link')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Link tables
          </div>
        </div>
        </>
      )}
      
      {isClients && (
        <div
          className={`absolute z-[1000] text-greytheme right-[-13em] w-[13em] p-2 rounded-[10px] font-medium ${
            localStorage.getItem('darkMode') === 'true'
              ? 'bg-bgdarktheme2 text-white'
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
    </>
  );
};

export default DropTarget;