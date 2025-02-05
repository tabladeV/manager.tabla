import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

import { useTranslation } from 'react-i18next';

import DraggableItem from '../../components/places/DraggableItem';
import DropTarget from '../../components/places/DropTarget';
import SearchBar from '../../components/header/SearchBar';
import { Link } from 'react-router-dom';
import { addHours, getHours, getMinutes, getSeconds, parse, set } from 'date-fns';

import { useDateContext } from '../../context/DateContext'; 
import { BaseKey, BaseRecord, useList } from '@refinedev/core';
import {format} from 'date-fns';
import axios from 'axios';

interface Reservation {
  id: BaseKey;
  full_name: string;
  time: string;
  date: string;
  status: "PENDING" | "APPROVED" | "CANCELED";
  number_of_guests: number;
  occasion?: string;
  created_at: string;
  tables: TableType[];
}

interface currentResType{
  id:BaseKey;
  full_name: string;
  time: string;
  date: string;
  email: string;
  phone: string;
  number_of_guests: number;
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
  current_reservations: currentResType[];
}


function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

const PlacePage: React.FC = () => {
  const { data, isLoading, error } = useList({
    resource: "api/v1/bo/floors/",
    meta: {
      headers: {
        "X-Restaurant-ID": 1,
      },
    },
  });

  
  const { chosenDay } = useDateContext(); 

  
  const currentHour = `${getHours(new Date())}:00:00`;
  const [time, setTime] = useState(currentHour);
  useEffect(() => {
    setTime(currentHour);
  }, [currentHour]);

  console.log(time.slice(0,5), 'currentHour');
  const [chosenHour, setChosenHour] = useState(currentHour);

  function selectedHour(hour: string) {
    setTime(`${hour}:00`);
  }

  useEffect(() => {
    setChosenHour(currentHour);
  }, [currentHour]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newCurrentHour = `${getHours(new Date())}:00:00`;
      setChosenHour(newCurrentHour);
    }, 1000);

    return () => clearInterval(interval);
  }, []);




  const { data: tablesData, isLoading: isLoadingTables, error: errorTables } = useList({
    resource: "api/v1/bo/tables/tables_reservations/",
    filters: [
      {
        field: "reservations__date",
        operator: "eq",
        value: format(chosenDay, 'yyyy-MM-dd'),
      },
      {
        field: "reservations__time__gte",
        operator: "gte",
        value: time,
      },
      {
        field: "reservations__time__lte",
        operator: "lte",
        value: '23:59:59',
      },
    ],
    meta: {
      headers: {
        "X-Restaurant-ID": 1,
      },
    },
  });

  console.log(tablesData?.data);
  
  const { data: reservationsData, isLoading: isLoadingReservations, error: errorReservations } = useList<Reservation>({
    resource: "api/v1/bo/reservations/",
    filters: [
      {
        field: "date",
        operator: "eq",
        value: format(chosenDay, 'yyyy-MM-dd'),
      },
      // {
      //   field: "time",
      //   operator: "eq",
      //   value: time+':00',
      // },
      // {
      //   field: "time__lte",
      //   operator: "lte",
      //   value: '23:59:59',
      // },
    ],
    meta: {
      headers: {
        "X-Restaurant-ID": 1,
      },
    },
  });
  console.log(reservationsData?.data);

  

 

  // const TimeUpdate = (time:string) =>{
  //   settime(`${time}:00`);
  // }

  console.log(time);

  
  
  const [roofData, setRoofData] = useState<BaseRecord[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<TableType[]>([]);
  const [focusedRoof, setFocusedRoof] = useState<BaseKey | undefined>(undefined);
  const [floorId, setFloorId] = useState<BaseKey | undefined>(0);
  const { t } = useTranslation();

  console.log(tablesData?.data);


  useEffect(() => {
    if (reservationsData?.data) {
      setReservations(reservationsData.data);
    }
    if (data?.data) {
      setRoofData(data.data);
      setFocusedRoof(data.data[0]?.id);
    }
    if (tablesData?.data) {
      setTables(tablesData.data as TableType[]);
    }
  }, [data, tablesData, reservationsData]);

  useEffect(() => {
    if (focusedRoof) {
      const foundFloor = roofData.find((floor) => floor.id === focusedRoof);
      setFloorId(foundFloor?.id);
    }
  }, [focusedRoof, roofData]);


  // const reservations = [
  //   { id: 1, name: 'Caprim Zack', time: '12:00 PM', date: '26 jan 2025', guests: 4, occasion: 'Birthday', tableNumber: 1 },
  //   { id: 2, name: 'Alfred Destivan', time: '14:00 PM', date: '26 jan 2025', guests: 2, occasion: 'Birthday', tableNumber: 2 },
  //   { id: 3, name: 'Sam Sulek', time: '17:00 PM', date: '26 jan 2025', guests: 1, occasion: 'none', tableNumber: 3 },
  //   { id: 4, name: 'Christopher Bums', time: '13:00 PM', date: '26 jan 2025', guests: 5, occasion: 'none', tableNumber: 4 },
  //   { id: 5, name: 'Alfred Zack', time: '12:00 PM', date: '26 jan 2025', guests: 4, occasion: 'Birthday', tableNumber: 5 },
  //   { id: 6, name: 'Alfred Zack', time: '12:00 PM', date: '26 jan 2025', guests: 4, occasion: 'Birthday', tableNumber: 7 },
  // ];

  const getCurrentHour = () => getHours(new Date());

  const hours = [
    { id: 1, time: '00:00' },
    { id: 2, time: '01:00' },
    { id: 3, time: '02:00' },
    { id: 4, time: '03:00' },
    { id: 5, time: '04:00' },
    { id: 6, time: '05:00' },
    { id: 7, time: '06:00' },
    { id: 8, time: '07:00' },
    { id: 9, time: '08:00' },
    { id: 10, time: '09:00' },
    { id: 11, time: '10:00' },
    { id: 12, time: '11:00' },
    { id: 13, time: '12:00' },
    { id: 14, time: '13:00' },
    { id: 15, time: '14:00' },
    { id: 16, time: '15:00' },
    { id: 17, time: '16:00' },
    { id: 18, time: '17:00' },
    { id: 19, time: '18:00' },
    { id: 20, time: '19:00' },
    { id: 21, time: '20:00' },
    { id: 22, time: '21:00' },
    { id: 23, time: '22:00' },
    { id: 24, time: '23:00' }
  ]

  const [filteringHour, setFilteringHour] = useState(`${getCurrentHour()}:00`);
  const [searchResults, setSearchResults] = useState(reservations);

  const [showOnly, setShowOnly] = useState('APPROVED');

  useEffect(() => {
    setSearchResults(reservations);
  }, [reservations]);

  const searchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value.toLowerCase();

    if(keyword === '') setSearchResults(reservations);
    else setSearchResults(reservations.filter((item) => item.full_name.toLowerCase().includes(keyword)));
  };
  

  


  return (

    <div className='w-[86em]'>
      <div className='flex w-full justify-between mb-2'>
        <h1 className='text-3xl font-[700]'>{t('placeManagement.title')}</h1>
        <Link to='/places/design' className='btn-primary flex gap-2 items-center lt-sm:hidden'>
          {t('placeManagement.buttons.designPlace')}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.71 7.04006C21.1 6.65006 21.1 6.00006 20.71 5.63006L18.37 3.29006C18 2.90006 17.35 2.90006 16.96 3.29006L15.12 5.12006L18.87 8.87006M3 17.2501V21.0001H6.75L17.81 9.93006L14.06 6.18006L3 17.2501Z" fill="white" />
          </svg>
        </Link>
      </div>

      <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
        <div className="flex  gap-[10px]">
          <div className={`lt-sm:hidden rounded-[10px] p-[1em] ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'} `}>
            <SearchBar SearchHandler={searchFilter} />
            <div className='grid grid-flow-col gap-3 font-[500] my-3 justify-between'>
              <button className={showOnly==='APPROVED'? 'btn-primary':'btn-secondary'} onClick={()=>{setShowOnly("APPROVED")}}>{t('placeManagement.filters.confirmed')}</button>
              <button className={showOnly==='CANCELED'? 'btn-primary':'btn-secondary'} onClick={()=>{setShowOnly("CANCELED")}}>{t('placeManagement.filters.canceled')}</button>
              <button className={showOnly==='PENDING'? 'btn-primary':'btn-secondary'} onClick={()=>{setShowOnly("PENDING")}}>{t('placeManagement.filters.pending')}</button>
            </div>
            <div className='overflow-y-auto h-[55vh] bar-hide'>
              {searchResults.filter(item => item.status === showOnly).map((item) => (
                <DraggableItem itemData={item} key={item.id} />
              ))}

            </div>
          </div>
          

          <div className='w-full sm:overflow-auto'>
            <div className='flex lt-sm:flex-wrap lt-sm:gap-2 justify-between'>
              <div className='flex gap-2 w-[90%] overflow-x-scroll no-scrollbar'>
                {roofData.map((roof) => (
                  <button
                    className={` flex items-center ${focusedRoof === roof.id ? 'btn-primary ' : 'btn-secondary'}`}
                    key={roof.id}
                    onClick={() => setFocusedRoof(roof.id)}
                  >
                    {roof.name}
                  </button>
                ))}
              </div>
              <div>
                <select defaultValue={time} id='hourChosen' className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'} `} onChange={(e) => { setFilteringHour(e.target.value); selectedHour(e.target.value); }}>
                  {hours.map((hour) => (
                    <option key={hour.id} selected={hour.time === time} value={hour.time}>
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
                  id= {table.id}
                  name={table.name}
                  type= {table.type}
                  floorId= {floorId}
                  x= {table.x}
                  y= {table.y}
                  height= {table.height}
                  width= {table.width}
                  max= {table.max}
                  min= {table.min}
                  reservedBy= {table.current_reservations[0]}
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
