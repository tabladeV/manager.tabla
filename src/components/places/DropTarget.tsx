import { useState } from 'react';
import { useDrop } from 'react-dnd';

const ItemType = 'BOX';

interface DropTargetProps {
  table: { number: number };
}

interface DroppedItem {
  name: string;
}

const DropTarget = ({ table }: DropTargetProps) => {
  const [droppedItem, setDroppedItem] = useState<DroppedItem | null>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemType,
    drop: (item: DroppedItem) => {
      setDroppedItem(item); // Handle the dropped data here
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`bg-white p-4 rounded-[50px] flex justify-center items-center w-full ${isOver ? 'bg-gray-200' : ''}`}
    >
      {droppedItem ? (
        <p className='bg-greentheme text-white p-2 rounded-[30px] text-center w-full'>
          Table {table.number} is reserved By: <span className='font-[600]'>{droppedItem.name}</span>
        </p>
      ) : (
        <p className='bg-greentheme text-white p-2 rounded-[30px] text-center w-full'>
          Table {table.number}
        </p>
      )}
    </div>
  );
};

export default DropTarget;
