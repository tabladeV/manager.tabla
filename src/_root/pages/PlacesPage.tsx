import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

import { useTranslation } from 'react-i18next';

import DraggableItem from '../../components/places/DraggableItem';
import DropTarget from '../../components/places/DropTarget';
import SearchBar from '../../components/header/SearchBar';
import { Link } from 'react-router-dom';
import { getHours } from 'date-fns';

import { useDateContext } from '../../context/DateContext'; 
import { BaseKey, BaseRecord, useList } from '@refinedev/core';

function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

const PlacePage: React.FC = () => {
  const { data, isLoading, error } = useList({
    resource: "api/v1/bo/floors",
    meta: {
      headers: {
        "X-Restaurant-ID": 1,
      },
    },
  });

  const { data: tablesData, isLoading: isLoadingTables, error: errorTables } = useList({
    resource: "api/v1/bo/tables",
    meta: {
      headers: {
        "X-Restaurant-ID": 1,
      },
    },
  });

  const { data: reservationsData, isLoading: isLoadingReservations, error: errorReservations } = useList({
    resource: "api/v1/bo/reservations",
    meta: {
      headers: {
        "X-Restaurant-ID": 1,
      },
    },
  });


  const [reservations, setReservations] = useState<BaseRecord[]>([]);
  const [roofData, setRoofData] = useState<BaseRecord[]>([]);
  const [tables, setTables] = useState<BaseRecord[]>([]);
  const [focusedRoof, setFocusedRoof] = useState<BaseKey | undefined>(undefined);
  const [floorId, setFloorId] = useState<BaseKey | undefined>(undefined);
  const { t } = useTranslation();
  const { chosenDay } = useDateContext(); 

  useEffect(() => {
    if (reservationsData?.data) {
      setReservations(reservationsData.data);
    }
    if (data?.data) {
      setRoofData(data.data);
      setFocusedRoof(data.data[0]?.id);
    }
    if (tablesData?.data) {
      setTables(tablesData.data);
    }
  }, [data, tablesData, reservationsData]);

  useEffect(() => {
    if (focusedRoof) {
      const foundFloor = roofData.find((floor) => floor.id === focusedRoof);
      setFloorId(foundFloor?.id);
    }
  }, [focusedRoof, roofData]);

  console.log('reservations', reservations);

  // const reservations = [
  //   { id: 1, name: 'Caprim Zack', time: '12:00 PM', date: '26 jan 2025', guests: 4, occasion: 'Birthday', tableNumber: 1 },
  //   { id: 2, name: 'Alfred Destivan', time: '14:00 PM', date: '26 jan 2025', guests: 2, occasion: 'Birthday', tableNumber: 2 },
  //   { id: 3, name: 'Sam Sulek', time: '17:00 PM', date: '26 jan 2025', guests: 1, occasion: 'none', tableNumber: 3 },
  //   { id: 4, name: 'Christopher Bums', time: '13:00 PM', date: '26 jan 2025', guests: 5, occasion: 'none', tableNumber: 4 },
  //   { id: 5, name: 'Alfred Zack', time: '12:00 PM', date: '26 jan 2025', guests: 4, occasion: 'Birthday', tableNumber: 5 },
  //   { id: 6, name: 'Alfred Zack', time: '12:00 PM', date: '26 jan 2025', guests: 4, occasion: 'Birthday', tableNumber: 7 },
  // ];

  const getCurrentHour = () => getHours(new Date());

  const hours = Array.from({ length: 24 }, (_, i) => ({ id: i.toString(), time: `${i}:00` }));

  const [filteringHour, setFilteringHour] = useState(`${getCurrentHour()}:00`);
  const [searchResults, setSearchResults] = useState(reservations);

  const [showOnly, setShowOnly] = useState('CONFIRMED');

  useEffect(() => {
    setSearchResults(reservations);
  }, [reservations]);

  const searchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value.toLowerCase();
    setSearchResults(reservations.filter((item) => item.full_name.toLowerCase().includes(keyword)));

  };


  return (

    <div>
      <div className='flex justify-between mb-2'>
        <h1 className='text-3xl font-[700]'>{t('placeManagement.title')}</h1>
        <Link to='/places/design' className='btn-primary flex gap-2 items-center lt-sm:hidden'>
          {t('placeManagement.buttons.designPlace')}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.71 7.04006C21.1 6.65006 21.1 6.00006 20.71 5.63006L18.37 3.29006C18 2.90006 17.35 2.90006 16.96 3.29006L15.12 5.12006L18.87 8.87006M3 17.2501V21.0001H6.75L17.81 9.93006L14.06 6.18006L3 17.2501Z" fill="white" />
          </svg>
        </Link>
      </div>

      <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
        <div className="flex gap-[10px]">
          <div className={`lt-sm:hidden rounded-[10px] p-[1em] ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'} `}>
            <SearchBar SearchHandler={searchFilter} />
            <div className='grid grid-flow-col gap-3 font-[500] my-3 justify-between'>
              <button className={showOnly==='CONFIRMED'? 'btn-primary':'btn-secondary'} onClick={()=>{setShowOnly("CONFIRMED")}}>{t('placeManagement.filters.confirmed')}</button>
              <button className={showOnly==='CANCELED'? 'btn-primary':'btn-secondary'} onClick={()=>{setShowOnly("CANCELED")}}>{t('placeManagement.filters.canceled')}</button>
              <button className={showOnly==='PENDING'? 'btn-primary':'btn-secondary'} onClick={()=>{setShowOnly("PENDING")}}>{t('placeManagement.filters.pending')}</button>
            </div>
            <div className='overflow-y-auto h-[55vh] bar-hide'>
              {searchResults.filter(item=>item.status.toUpperCase().includes(showOnly)).map((item) => (
                <DraggableItem itemData={item} key={item.id} />
              ))}
            </div>
          </div>
          

          <div className='w-full sm:overflow-auto'>
            <div className='flex lt-sm:flex-wrap lt-sm:gap-2 justify-between'>
              <div className='flex gap-2 w-full overflow-x-auto'>
                {roofData.map((roof) => (
                  <button
                    className={` ${focusedRoof === roof.id ? 'btn-primary ' : 'btn-secondary'}`}
                    key={roof.id}
                    onClick={() => setFocusedRoof(roof.id)}
                  >
                    {roof.name}
                  </button>
                ))}
              </div>
              <div>
                <select className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'} `} onChange={(e) => setFilteringHour(e.target.value)}>
                  {hours.map((hour) => (
                    <option key={hour.id} value={hour.time}>
                      {hour.time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='relative lt-sm:h-[55vh] lt-sm:overflow-x-auto'>
              {tables.filter(table => table.floor === floorId).map((table) => (
                <DropTarget 
                  key={table.id} 
                  id= {table.name}
                  type= {table.type}
                  x= {table.x}
                  y= {table.y}
                  height= {table.height}
                  width= {table.width}
                  max= {table.max}
                  min= {table.min}
                  reservedBy= {table.reservations}
                  hourChosen= {filteringHour}
                  />
                  
              ))}
            </div>
          </div>
        </div>
      </DndProvider>
    </div>
  );
};

export default PlacePage;
