import { useState } from 'react';
import { useDrop } from 'react-dnd';

const ItemType = 'BOX';
type ShapeType = 'circle' | 'square' | 'rectangle';


interface DropTargetProps {
  tableNumber: number;
  type: 'circle' | 'square' | 'rectangle';
  x: number;
  y: number;
}

interface DroppedItem {
  name: string;
}

const DropTarget: React.FC<DropTargetProps> = ({ tableNumber, type, x, y }) => {
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

  const getShapeStyle = (type: ShapeType) => {
    switch (type) {
      case 'circle':
        return 'w-[100px] h-[100px] rounded-full bg-white shadow-[0px 10px 13px rgba(0,0,0,0.1)]';
      case 'square':
        return 'w-[100px] h-[100px] rounded-[10px] bg-white shadow-[0px 10px 13px rgba(0,0,0,0.1)]';
      case 'rectangle':
        return 'w-[200px] h-[100px] rounded-[10px] bg-white shadow-[0px 10px 13px rgba(0,0,0,0.1)]';
      default:
        return '';
    }
  };

  return (
    <div
      ref={drop}
      style={{ top: y, left: x, position: 'absolute' }} // Positions the shape on the canvas
      className={`flex justify-center items-center font-[700] border ${getShapeStyle(type)} ${isOver ? 'bg-softgreentheme ' : 'bg-white'}`}
    >
      {droppedItem ? (
        <p className='flex text-center flex-col'>
          T-{tableNumber} <span className=' font-[600] text-greentheme'>{droppedItem.name}</span>
        </p>
      ) : (
        <p className=''>
          T-{tableNumber}
        </p>
      )}
    </div>
  );
};

export default DropTarget;
