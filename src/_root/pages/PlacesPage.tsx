import React, {useState} from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableItem from '../../components/places/DraggableItem';
import DropTarget from '../../components/places/DropTarget';
import SearchBar from '../../components/header/SearchBar';


const PlacePage: React.FC = () => {

  const [focusedRoof, setFocusedRoof] = useState<string | null>('Main Room');


  const data = [
    { id: 1, name: 'Caprim Zack', time: '12:00 PM', date: '12 dec 2025', guests: 4, occasion: 'Birthday' },
    { id: 2, name: 'Alfed Destivan', time: '14:00 PM', date: '12 dec 2025', guests: 2, occasion: 'Birthday' },
    { id: 3, name: 'Sam Sulek', time: '17:00 PM', date: '12 dec 2025', guests: 1, occasion: 'none' },
    { id: 4, name: 'Christopher Bums', time: '13:00 PM', date: '12 dec 2025', guests: 5, occasion: 'none' },
  ];

  const tables = [{ number: 1 }, { number: 2 }, { number: 3 }, { number: 4 }];

  const roofs = ['Main Room', 'Outdoor', 'Terrace'];

  const tablesEachRoof = {
    'Main Room': [{ number: 1 }, { number: 2 }, { number: 3 }, { number: 4 }],
    'Outdoor': [{ number: 5 }, { number: 6 }, { number: 7 }, { number: 8 }],
    'Terrace': [{ number: 9 }, { number: 10 }, { number: 11 }, { number: 12 }],
  };


  return (
    <div>
      <div className='flex justify-between mb-2'>
        <h1 className='text-3xl text-blacktheme font-[700]'>Place Management</h1>
        <button className='btn-primary flex gap-2 items-center'>
          Design Your Place
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.71 7.04006C21.1 6.65006 21.1 6.00006 20.71 5.63006L18.37 3.29006C18 2.90006 17.35 2.90006 16.96 3.29006L15.12 5.12006L18.87 8.87006M3 17.2501V21.0001H6.75L17.81 9.93006L14.06 6.18006L3 17.2501Z" fill="white"/>
          </svg>

        </button>
      </div>
      <DndProvider backend={HTML5Backend}>
        <div className="flex gap-[10px]">
          <div className='bg-white w-[25vw] rounded-[10px] p-[1em]'>
            <SearchBar />
            <div className='flex gap-3 font-[500] my-3 justify-between'>
              <button className='btn-primary' >Confirmed</button>
              <button className='btn-secondary'>Canceled</button>
              <button className='btn-secondary '>Waiting</button>
            </div>
            {data.map((item) => (
              <DraggableItem itemData={item} key={item.id} />
            ))}
            {/* <DraggableItem itemData={itemData}/> */}
          </div>
          <div className='w-full flex flex-col gap-3'>
            <div className='flex gap-2 w-full overflow-x-auto '>
              {roofs.map((roof) => (
                <button className={` ${focusedRoof === roof ? 'btn-primary':'btn-secondary'}`} key={roof} onClick={()=>{setFocusedRoof(roof)}}>{roof}</button>
              ))}
              <button className='btn hover:text-greentheme hover:border-greentheme '>+</button>
            </div>
            <div className='grid w-full grid-cols-3 gap-4 '>
              
              {tablesEachRoof['Main Room'].map((table) => (
                <DropTarget table={table} key={table.number} />
              ))}

            </div>
          </div>
        </div>
      </DndProvider>
    </div>
  );
};

export default PlacePage;
