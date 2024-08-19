import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableItem from '../../components/places/DraggableItem';
import DropTarget from '../../components/places/DropTarget';
import SearchBar from '../../components/header/SearchBar';

const PlacePage: React.FC = () => {


  const data = [
    { id: 1, name: 'Caprim Zack', time: '12:00 PM', date: '12 dec 2025', guests: 4, occasion: 'Birthday' },
    { id: 2, name: 'Alfed Destivan', time: '14:00 PM', date: '12 dec 2025', guests: 2, occasion: 'Birthday' },
    { id: 3, name: 'Sam Sulek', time: '17:00 PM', date: '12 dec 2025', guests: 1, occasion: 'none' },
    { id: 4, name: 'Christopher Bums', time: '13:00 PM', date: '12 dec 2025', guests: 5, occasion: 'none' },
  ];

  const tables = [{ number: 1 }, { number: 2 }, { number: 3 }, { number: 4 }];


  return (
    <div>
      <div className='flex justify-between mb-2'>
        <h1 className='text-3xl text-blacktheme font-[700]'>Place Management</h1>
        <button className='btn-primary'>Add Place</button>
      </div>
      <DndProvider backend={HTML5Backend}>
        <div className="flex gap-[10px]">
          <div className='bg-white w-[25vw] rounded-[10px] p-[1em]'>
            <SearchBar />
            <div className='flex gap-3 font-[500] my-3 justify-between'>
              <button className='btn-primary'>Confirmed</button>
              <button className='btn-secondary'>Canceled</button>
              <button className='btn-secondary '>Waiting</button>
            </div>
            {data.map((item) => (
              <DraggableItem itemData={item} key={item.id} />
            ))}
            {/* <DraggableItem itemData={itemData}/> */}
          </div>
          <div className='grid w-full grid-cols-3 gap-4 '>
            {tables.map((table) => (
              <DropTarget table={table} key={table.number} />
            ))}

          </div>
        </div>
      </DndProvider>
    </div>
  );
};

export default PlacePage;
