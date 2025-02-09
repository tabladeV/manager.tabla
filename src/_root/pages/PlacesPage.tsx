import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import ZoomControls from '../../components/places/ZoomControls';
import { use } from 'i18next';

interface Reservation {
  id: BaseKey;
  full_name: string;
  time: string;
  date: string;
  status: "PENDING" | "APPROVED" | "SEATED" | "CANCELED";
  number_of_guests: number;
  occasion?: string;
  created_at: string;
  tables: TableType[];
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

interface TableType {
  id: BaseKey;
  name: string;
  type: 'CIRCLE' | 'RECTANGLE';
  floor: number;
  x: number;
  y: number;
  rotation: number;
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

  });

  
  const { chosenDay } = useDateContext(); 

  
  const currentHour = format(new Date(), 'HH:00');
  const [time, setTime] = useState(currentHour);
  
  // Parse the first 5 characters (e.g. "09:00")
  const parsedDate = parse(time.slice(0,5), 'HH:mm', new Date());
  const newDate = addHours(parsedDate, 2);
  const newTimeString = format(newDate, 'HH:mm');

// console.log(newTimeString); // Output: "14:00"
  useEffect(() => {
    setTime(currentHour);
  }, [currentHour]);
  const [chosenHour, setChosenHour] = useState(currentHour);

  function selectedHour(hour: string) {
    setTime(`${hour}`);
  }

  useEffect(() => {
    setChosenHour(currentHour);
  }, [currentHour]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newCurrentHour = `${getHours(new Date())}:00`;
      setChosenHour(newCurrentHour);
    }, 1000);

    return () => clearInterval(interval);
  }, []);




  const { data: tablesData, isLoading: isLoadingTables, error: errorTables, refetch: refreshTables } = useList({
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
        value: newTimeString+':00',
      },
    ],

  });
  
  const { data: reservationsData, isLoading: isLoadingReservations, error: errorReservations, refetch: refetshReservations } = useList<Reservation>({
    resource: "api/v1/bo/reservations/",
    filters: [
      {
        field: "date",
        operator: "null",
        value: format(chosenDay, 'yyyy-MM-dd'),
      },
      {
        field: "time_",
        operator: "gte",
        value: time,
      },
      {
        field: "time_",
        operator: "lte",
        value: newTimeString,
      },
    ],

  });

  

 

  // const TimeUpdate = (time:string) =>{
  //   settime(`${time}:00`);
  // }
  
  const [roofData, setRoofData] = useState<BaseRecord[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<TableType[]>([]);
  const [focusedRoof, setFocusedRoof] = useState<BaseKey | undefined>(undefined);
  const [floorId, setFloorId] = useState<BaseKey | undefined>(0);
  const { t } = useTranslation();


  useEffect(() => {
    if (reservationsData?.data) {
      setReservations([...reservationsData.data]);
    }
    if (data?.data) {
      setRoofData(data.data);
      setFocusedRoof(data.data[0]?.id);
      handleFocusAll();
    }
    if (tablesData?.data) {
      setTables([...tablesData.data] as TableType[]);
    }
  }, [data, tablesData, reservationsData]);

  useEffect(() => {
    if (focusedRoof) {
      const foundFloor = roofData.find((floor) => floor.id === focusedRoof);
      setFloorId(foundFloor?.id);
      handleFocusAll();
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

  const getCurrentHour = () => getHours(new Date()).toString().replace(':00','');

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
  
  const filteredReservations = useMemo(() => {
    return searchResults.filter((item) => item.status === showOnly)
  },[showOnly, searchResults, reservations]);


// ***** Zoom and Pan State and Handlers for the Tables Section *****
  // The scale is clamped between 0.4 (max zoom out) and 0.9 (max zoom in)
  const [scale, setScale] = useState(0.4);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // For mouse-based panning
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPosition, setLastPanPosition] = useState<{ x: number; y: number } | null>(null);

  // For touch pinch-zoom
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [lastTouchCenter, setLastTouchCenter] = useState<{ x: number; y: number } | null>(null);

  // Clamp helper
  const clampScale = (s: number) => Math.min(Math.max(s, 0.3), 0.9);

  // Mouse wheel zooming (zoom around mouse pointer)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const focalPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    // Use a factor to adjust sensitivity (you can tweak 0.001)
    const delta = -e.deltaY * 0.001;
    const newScale = clampScale(scale + delta);
    // Compute a factor for adjusting pan so that the focal point remains fixed
    const scaleFactor = newScale / scale;
    const newTranslateX = focalPoint.x - scaleFactor * (focalPoint.x - translate.x);
    const newTranslateY = focalPoint.y - scaleFactor * (focalPoint.y - translate.y);
    setScale(newScale);
    setTranslate({ x: newTranslateX, y: newTranslateY });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPanning(true);
    setLastPanPosition({ x: e.clientX, y: e.clientY });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !lastPanPosition) return;
    const deltaX = e.clientX - lastPanPosition.x;
    const deltaY = e.clientY - lastPanPosition.y;
    setTranslate(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    setLastPanPosition({ x: e.clientX, y: e.clientY });
  };
  const handleMouseUp = () => {
    setIsPanning(false);
    setLastPanPosition(null);
  };

  // Touch handlers for pan and pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setLastPanPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      setLastTouchDistance(Math.hypot(dx, dy));
      setLastTouchCenter({ x: (touch1.clientX + touch2.clientX) / 2, y: (touch1.clientY + touch2.clientY) / 2 });
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && lastPanPosition) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastPanPosition.x;
      const deltaY = touch.clientY - lastPanPosition.y;
      setTranslate(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastPanPosition({ x: touch.clientX, y: touch.clientY });
    } else if (e.touches.length === 2 && lastTouchDistance && lastTouchCenter) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      const newDistance = Math.hypot(dx, dy);
      const newCenter = { x: (touch1.clientX + touch2.clientX) / 2, y: (touch1.clientY + touch2.clientY) / 2 };
      const newScale = clampScale(scale * (newDistance / lastTouchDistance));
      // Adjust translation so that the content under the touch center remains fixed
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const focalPoint = { x: newCenter.x - rect.left, y: newCenter.y - rect.top };
        const scaleFactor = newScale / scale;
        const newTranslateX = focalPoint.x - scaleFactor * (focalPoint.x - translate.x);
        const newTranslateY = focalPoint.y - scaleFactor * (focalPoint.y - translate.y);
        setTranslate({ x: newTranslateX, y: newTranslateY });
      }
      setScale(newScale);
      setLastTouchDistance(newDistance);
      setLastTouchCenter(newCenter);
    }
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      setLastTouchDistance(null);
      setLastTouchCenter(null);
    }
    if (e.touches.length === 0) {
      setLastPanPosition(null);
    }
  };

  // Zoom control buttons – use the container center as the focal point
  const handleZoomIn = () => {
    const container = containerRef.current;
    if (!container) return;
    const center = { x: container.clientWidth / 2, y: container.clientHeight / 2 };
    const newScale = clampScale(scale + 0.1);
    const scaleFactor = newScale / scale;
    const newTranslateX = center.x - scaleFactor * (center.x - translate.x);
    const newTranslateY = center.y - scaleFactor * (center.y - translate.y);
    setScale(newScale);
    setTranslate({ x: newTranslateX, y: newTranslateY });
  };
  const handleZoomOut = () => {
    const container = containerRef.current;
    if (!container) return;
    const center = { x: container.clientWidth / 2, y: container.clientHeight / 2 };
    const newScale = clampScale(scale - 0.1);
    const scaleFactor = newScale / scale;
    const newTranslateX = center.x - scaleFactor * (center.x - translate.x);
    const newTranslateY = center.y - scaleFactor * (center.y - translate.y);
    setScale(newScale);
    setTranslate({ x: newTranslateX, y: newTranslateY });
  };

  // "Focus on All Tables" resets the view so that all tables on the current floor are visible.
  // It calculates the bounding box of all tables and centers them within the container.
  const handleFocusAll = () => {
    const container = containerRef.current;
    if (!container) return;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const floorTables = tables.filter(table => table.floor === floorId);
    if (floorTables.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    floorTables.forEach(table => {
      minX = Math.min(minX, table.x);
      minY = Math.min(minY, table.y);
      maxX = Math.max(maxX, table.x + table.width);
      maxY = Math.max(maxY, table.y + table.height);
    });
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const newScale = clampScale(Math.min(containerWidth / contentWidth, containerHeight / contentHeight));
    // Center the bounding box inside the container
    const newTranslateX = (containerWidth - contentWidth * newScale) / 2 - minX * newScale;
    const newTranslateY = (containerHeight - contentHeight * newScale) / 2 - minY * newScale;
    setScale(newScale);
    setTranslate({ x: newTranslateX, y: newTranslateY });
  };

  return (

    <div className=''>
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
              <button className={showOnly==='SEATED'? 'btn-primary':'btn-secondary'} onClick={()=>{setShowOnly("SEATED")}}>{t('placeManagement.filters.seated')}</button>
              <button className={showOnly==='APPROVED'? 'btn-primary':'btn-secondary'} onClick={()=>{setShowOnly("APPROVED")}}>{t('placeManagement.filters.confirmed')}</button>
              {/* <button className={showOnly==='CANCELED'? 'btn-primary':'btn-secondary'} onClick={()=>{setShowOnly("CANCELED")}}>{t('placeManagement.filters.canceled')}</button> */}
              <button className={showOnly==='PENDING'? 'btn-primary':'btn-secondary'} onClick={()=>{setShowOnly("PENDING")}}>{t('placeManagement.filters.pending')}</button>
            </div>
            <div className='overflow-y-auto h-[55vh] bar-hide'>
              {filteredReservations.map((item) => (
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
                <select value={time} id='hourChosen' className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'} `} onChange={(e) => { setFilteringHour(e.target.value); selectedHour(e.target.value); }}>
                  {hours.map((hour) => (
                    <option key={hour.id} value={hour.time}>
                      {hour.time}
                    </option>
                  ))} 
                </select>
              </div>
            </div>

            {/* Tables Container with Zoom and Pan */}
            <div
              className={`tables-cont relative mt-1 lt-sm:overflow-x-auto overflow-hidden rounded-xl ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-whitetheme'}`}
              ref={containerRef}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: "none" }}  // disable default gestures
            >
              {/* Zoom Control Buttons */}
            <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onFocusAll={handleFocusAll}/>
              <div
                style={{
                  transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                  transformOrigin: '0 0',
                  width: '100%',
                  height: '100%',
                  position: 'relative'
                }}
              >
                {tables.filter(table => table.floor === floorId).map((table) => (
                  <DropTarget 
                    key={table.id} 
                    id={table.id}
                    name={table.name}
                    type={table.type}
                    floorId={floorId}
                    x={table.x}
                    y={table.y}
                    height={table.height}
                    width={table.width}
                    max={table.max}
                    min={table.min}
                    reservedBy={table.current_reservations[0]}
                    hourChosen={filteringHour}
                    onUpdateReservations={() => {
                      refreshTables();
                      refetshReservations();
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </DndProvider>
    </div>
  );
};

export default PlacePage;
