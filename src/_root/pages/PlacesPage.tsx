import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableItem from '../../components/places/DraggableItem';
import DropTarget from '../../components/places/DropTarget';
import SearchBar from '../../components/header/SearchBar';
import { Link } from 'react-router-dom';

type ShapeType = 'circle' | 'square' | 'rectangle';


interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  tableNumber: number;
}


const PlacePage: React.FC = () => {
  const [focusedRoof, setFocusedRoof] = useState<string | null>('Main Room');
  const [roofs, setRoofs] = useState<string[]>(['Main Room', 'Outdoor', 'Terrace']);
  const [showAddPlace, setShowAddPlace] = useState(false);

  const data = [
    { id: 1, name: 'Caprim Zack', time: '12:00 PM', date: '12 dec 2025', guests: 4, occasion: 'Birthday' },
    { id: 2, name: 'Alfed Destivan', time: '14:00 PM', date: '12 dec 2025', guests: 2, occasion: 'Birthday' },
    { id: 3, name: 'Sam Sulek', time: '17:00 PM', date: '12 dec 2025', guests: 1, occasion: 'none' },
    { id: 4, name: 'Christopher Bums', time: '13:00 PM', date: '12 dec 2025', guests: 5, occasion: 'none' },
  ];

  const tablesEachRoof = {
    'Main Room': [{ number: 1 }, { number: 2 }, { number: 3 }, { number: 4 }],
    'Outdoor': [{ number: 5 }, { number: 6 }, { number: 7 }, { number: 8 }],
    'Terrace': [{ number: 9 }, { number: 10 }, { number: 11 }, { number: 12 }],
  };
  

  const [shapes, setShapes] = useState<Shape[]>(
    [
      {
          "id": "circle-1724365960078",
          "type": "circle",
          "x": 86,
          "y": 33,
          "tableNumber": 1
      },
      {
          "id": "rectangle-1724365961225",
          "type": "rectangle",
          "x": 746,
          "y": 9,
          "tableNumber": 3
      },
      {
          "id": "circle-1724365961773",
          "type": "circle",
          "x": 470,
          "y": 194,
          "tableNumber": 4
      },
      {
          "id": "square-1724365983447",
          "type": "square",
          "x": 361,
          "y": 10,
          "tableNumber": 4
      },
      {
          "id": "square-1724365989809",
          "type": "square",
          "x": 826,
          "y": 192,
          "tableNumber": 5
      },
      {
          "id": "square-1724365990934",
          "type": "square",
          "x": 193,
          "y": 191,
          "tableNumber": 6
      }
  ]
  );

  const handlePlaceAdded = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputPlace = document.getElementById('inputPlace') as HTMLInputElement;
    const place = inputPlace.value.trim();

    if (place && !roofs.includes(place)) {
      setRoofs((prevRoofs) => [...prevRoofs, place]);
    }

    setShowAddPlace(false);
  };

  

  return (
    <div>
      {showAddPlace && (
        <div>
          <div className='overlay' onClick={() => setShowAddPlace(false)}></div>
          <form className='popup gap-5' onSubmit={handlePlaceAdded}>
            <h1 className='text-3xl text-blacktheme font-[700]'>Add Place</h1>
            <input
              type="text"
              id='inputPlace'
              placeholder='Place Alias'
              className='border border-[black] text-subblack font-[500] py-2 px-4 rounded-[10px]'
            />
            <button className='btn-primary w-full'>Add Place</button>
          </form>
        </div>
      )}
      <div className='flex justify-between mb-2'>
        <h1 className='text-3xl text-blacktheme font-[700]'>Place Management</h1>
        <Link to='/places/design' className='btn-primary flex gap-2 items-center'>
          Design Your Place
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.71 7.04006C21.1 6.65006 21.1 6.00006 20.71 5.63006L18.37 3.29006C18 2.90006 17.35 2.90006 16.96 3.29006L15.12 5.12006L18.87 8.87006M3 17.2501V21.0001H6.75L17.81 9.93006L14.06 6.18006L3 17.2501Z" fill="white" />
          </svg>
        </Link>
      </div>
      <DndProvider backend={HTML5Backend}>
        <div className="flex gap-[10px]">
          <div className='bg-white w-[25vw] rounded-[10px] p-[1em]'>
            <SearchBar />
            <div className='flex gap-3 font-[500] my-3 justify-between'>
              <button className='btn-primary'>Confirmed</button>
              <button className='btn-secondary'>Canceled</button>
              <button className='btn-secondary'>Waiting</button>
            </div>
            {data.map((item) => (
              <DraggableItem itemData={item} key={item.id} />
            ))}
          </div>
          <div className='w-full'>
            <div className='flex gap-2 w-full overflow-x-auto '>
              {roofs.map((roof) => (
                <button
                  className={` ${focusedRoof === roof ? 'btn-primary ' : 'btn-secondary'}`}
                  key={roof}
                  onClick={() => setFocusedRoof(roof)}
                >
                  {roof}
                </button>
              ))}
              <button
                className='btn hover:text-greentheme hover:border-greentheme'
                onClick={() => setShowAddPlace(true)}
              >
                +
              </button>
            </div>
            <div className='relative '>
              {shapes.map(( {id, type, x, y, tableNumber} ) => (
                <DropTarget type={type} x={x} y={y} tableNumber={tableNumber} key={id} />
              ))}

              
            </div>
          </div>
        </div>
      </DndProvider>
    </div>
  );
};

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

export default PlacePage;
