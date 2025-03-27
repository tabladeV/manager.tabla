import { useEffect, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { BaseKey, useDelete, useUpdate } from '@refinedev/core';
import { Clock, GripVertical, LayoutGrid, Loader2, Trash, User2, Users2 } from 'lucide-react';
import DraggableTableReservation from './DraggableTableReservation';
import { Occasion } from '../settings/Occasions';
import { getTextColor } from '../../utils/helpers';
import { useDarkContext } from '../../context/DarkContext';
import ActionPopup from '../popup/ActionPopup';
import { isTouchDevice } from '../../utils/isTouchDevice';

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
  reservedBy: currentResType;
  reservations: currentResType[];
  onUpdateReservations: () => void;
  onShowOptions: (status: boolean) => void;
}

export interface currentResType {
  id: BaseKey;
  full_name: string;
  time: string;
  date: string;
  email: string;
  phone: string;
  occasion: Occasion;
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
  reservations,
  onUpdateReservations,
  onShowOptions
}) => {
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [draggedReservation, setDraggedReservation] = useState<DroppedItem | null>(null);
  const [targetReservation, setTargetReservation] = useState<currentResType | null>(null);
  
  const optionsRef = useRef<HTMLDivElement>(null);
  const clientsMenuRef = useRef<HTMLDivElement>(null);

  const { mutate: mutateReservations, isLoading: loadingMutateReservations } = useUpdate({
    resource: `api/v1/bo/tables/${id}/assign-reservation`,
    mutationOptions: {
      onSuccess: (data, variables) => {
        onUpdateReservations();
      },
    },
    errorNotification(error, values, resource) {
        return {
          type: 'error',
          message: error?.formattedMessage,
        };
    },
    
  });
  
  const { mutate: moveReservation, isLoading: loadingMoveReservation } = useUpdate({
    mutationOptions: {
      onSuccess: (data, variables) => {
        onUpdateReservations();
      },
    },
    errorNotification(error, values, resource) {
        return {
          type: 'error',
          message: error?.formattedMessage,
        };
    },
  });
  
  const { mutate: deleteReservation, isLoading: loadingDeleteReservation } = useDelete();
  
  // Combined loading state
  const isLoading = loadingMutateReservations || loadingMoveReservation || loadingDeleteReservation;
  
  useEffect(() => {
    if (reservedBy) {
      setDroppedItems([
        {
          id: reservedBy.id,
          full_name: reservedBy.full_name,
          time: reservedBy?.time,
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
  }, [reservedBy, id]);

  // Handle drops from the sidebar (regular reservations)
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [ItemType, TableReservationType],
    canDrop: () => !isLoading, // Prevent dropping if loading
    drop: (item: DroppedItem) => {
      console.log(item)
      if (isLoading) return; // Extra check to prevent drops during loading
      
      if(item?.id && reservations?.length && reservations?.findIndex((res) => res.id === item.id) !== -1)
        return;

      // Handle table-to-table reservation drag
      if (item.fromTableId && item.fromTableId !== id) {
        setDraggedReservation(item);
        setShowOptions(true);
        return;
      }
      
      // Handle sidebar-to-table drag (original logic)
      
      const isTimeAlreadyDropped = reservations.some(
        (droppedItem) => {
          console.log(droppedItem?.time === item.time, droppedItem.time, item.time)
          return droppedItem.time === item.time
        }
      );
      console.log(isTimeAlreadyDropped);
      if (
        !isTimeAlreadyDropped
      ) {
        mutateReservations({
          id: item.id+'/',
          values: {
            reservations: [item.id],
          },
        },{
          onSuccess(){
            onUpdateReservations();
          }
        });
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  // Handle option selection (move or link)
  const handleOptionClick = (option: 'move' | 'link') => {
    if (!draggedReservation || isLoading) return;
    console.log(draggedReservation);
    switch (option) {
      case 'move': 
        moveReservation({
          resource: `api/v1/bo/tables/${draggedReservation?.fromTableId}/move-reservation/${id}`,
          id: draggedReservation.id+'/',
          values: {
            target_id: id,
            reservation_id: draggedReservation.id,
          },
        },{
          onSuccess(){
            onUpdateReservations();
          }
        });
        break;
      case 'link':
        mutateReservations({
          id: draggedReservation.id+'/',
          values: {
            reservations: [id],
          },
        },{
          onSuccess(){
            onUpdateReservations();
          }
        });
        break;
    }
    
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

      if(clientsMenuRef.current && !clientsMenuRef.current.contains(event.target as Node)) {
        setIsClients(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [isClients, setIsClients] = useState(false);

  const removeReservation = () => {
    if (isLoading || !targetReservation) return; // Prevent action if already loading

    deleteReservation({
        resource: `api/v1/bo/tables/${id}/delete-reservation`,
        id: targetReservation?.id+'/',
        values: {
          reservations: [],
        }
      },
      {
        onSuccess: () => {
          setTargetReservation(null);
          onUpdateReservations();
        },
      }
    );
  };

  const { darkMode } = useDarkContext();
  return (
    <>
      <ActionPopup
        action={'delete'}
        secondAction={() => setShowConfirmPopup(false)}
        secondActionText={'Cancel'}
        message={
          <>
          <h6>Are you sure you want to Delete this Reservation assignment?</h6>
          <div
            className={`cursor-grab p-1 flex justify-between items-center gap-2 rounded-[5px] w-full mt-1 font-semibold`}
          >
            <div className='flex flex-col items-start '>
              <div className='flex items-center justify-between'>
                <div className='flex mr-1 items-center'><Clock size={16} className='mr-1' /> <span> {targetReservation?.time?.replace(':00', '')}</span></div>
                <div className='flex items-center'><Users2 size={16} className='mr-1' /> <span> {targetReservation?.number_of_guests}</span></div>
              </div>
              <div className='flex items-center'><User2 size={16} className='mr-1' /> <span>{targetReservation?.full_name}</span></div>
            </div>
          </div>
          </>
        }
        actionFunction={() => removeReservation()}
        showPopup={showConfirmPopup}
        setShowPopup={setShowConfirmPopup}
      />
    <div
      onMouseOver={() =>{
        if(!showOptions) {
          setIsClients(true);
        }
      }}
      onMouseLeave={() => {
        if(isTouchDevice())
          return;
        setIsClients(false)
      }}
      ref={drop}
      key={id}
      className={`absolute text-center ${
        droppedItems.length > 0 ? 'text-white' : ''
      } rounded-[10px] flex flex-col justify-center items-center border-[2px] ${
        isLoading 
          ? 'border-blue-400' 
          : isOver && canDrop 
              ? 'border-yellow-400' 
              : (!reservedBy?'border-greentheme':'')
      } ${isOver && canDrop ? 'ring-2 ring-yellow-300' : ''}`}
      style={{
        width,
        height,
        backgroundColor:
          isLoading 
            ? (darkMode ? '#1e3a8a' : '#dbeafe')  // Blue loading background
            : reservedBy
              ? (reservedBy?.occasion?.color || '#FF4B4B')
              : darkMode
                ? '#042117'
                : '#F6F6F6',
        left: x,
        top: y,
        borderRadius: type === 'RECTANGLE' ? '10px' : '50%',
        position: 'absolute',
        color: getTextColor(reservedBy ? (reservedBy?.occasion?.color || '#FF4B4B'): darkMode? '#042117': '#F6F6F6')
      }}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-20"
          style={{
            borderRadius: type === 'RECTANGLE' ? '10px' : '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          }}
        >
          <Loader2 
            className="animate-spin" 
            size={width > 50 ? 24 : 16} 
            color={darkMode ? 'white' : '#3b82f6'} 
          />
        </div>
      )}
      
      {/* Make the reservation draggable if the table has one */}
      {reservedBy ? (
        <div className="absolute inset-0 z-10" >
          {!isLoading && (
            <DraggableTableReservation
              type={type}
              x={x}
              y={y}
              width={width}
              height={height}
              id={id}
              name={name}
              max={max}
              reservation={reservedBy}
              fromTableId={id}
            />
          )}
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-white">
              <div className="text-xs font-semibold truncate w-full px-1 text-center">{name}</div>
              <div className="text-xs truncate w-full px-1 text-center opacity-75">{droppedItems[0]?.full_name}</div>
            </div>
          )}
        </div>
      ) : (
        <>
          <h6 
            className={"text-[14px] px-1 w-full text-center font-semibold"}
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
              darkMode
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
        </>
      )}
      
      {/* Options tooltip when dragging between tables */}
      {showOptions && !isLoading && (
        <>
        <div 
          ref={optionsRef}
          className="absolute z-[200] bg-[#F6F6F6] dark:bg-bgdarktheme2 shadow-md rounded-md overflow-hidden dark:text-white"
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
      
      {isClients && !isLoading && (
        <div
          ref={clientsMenuRef}
          className={`absolute select-none z-[1000] text-greytheme right-[-13em] p-2 rounded-[10px] font-medium ${
            darkMode
              ? 'bg-bgdarktheme2 text-white'
              : 'bg-[#F6F6F6] text-greytheme'
          }`}
        >
          {name} has {reservations?.length} {reservations?.length > 1 ? 'reservations' : 'reservation'}
          {reservations?.map((item, index) => (
            <div
              className={`cursor-grab p-1 flex justify-between items-center gap-2 rounded-[5px] mt-1 font-semibold ${
                darkMode
                  ? 'bg-bgdarktheme'
                  : 'bg-softgreytheme'
              }`}
              key={index}
            >
              <GripVertical/>
              <div className='flex flex-col items-start '>
                <div className='flex items-center justify-between'>
                  <div className='flex mr-1 items-center'><Clock size={16} className='mr-1'/> <span> {item.time?.replace(':00', '')}</span></div>
                  <div className='flex items-center'><Users2 size={16} className='mr-1'/> <span> {item.number_of_guests}</span></div>
                </div>
                <div className='flex items-center'><User2 size={16} className='mr-1'/> <span>{item.full_name}</span></div>
              </div>
              <Trash
                size={30}
                className="bg-softredtheme text-redtheme p-2 rounded-md cursor-pointer"
                onClick={()=>{
                  setTargetReservation(item)
                  setShowConfirmPopup(true)
                }}
              />
            </div>
          ))}
          {droppedItems.length > 3 && (
            <div
              className={`p-1 rounded-[5px] mt-1 font-semibold ${
                darkMode
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