import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { addHours, format, parse } from 'date-fns';
import { useDateContext } from '../../context/DateContext';
import { BaseKey, BaseRecord, CanAccess, useList } from '@refinedev/core';
import axios from 'axios';
import DraggableItem from '../../components/places/DraggableItem';
import DropTarget from '../../components/places/DropTarget';
import SearchBar from '../../components/header/SearchBar';
import ZoomControls from '../../components/places/ZoomControls';
import Pagination from '../../components/reservation/Pagination';

interface ReservationType {
    
  results: Reservation[]
  count: number
  
}

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
  const { t } = useTranslation();
  const darkMode = localStorage.getItem('darkMode') === 'true';

  // Manage current time (updates every minute)
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);
  const currentHour = useMemo(() => format(currentTime, 'HH:00'), [currentTime]);

  // Time state – this can be updated when user selects a different hour.
  const [time, setTime] = useState(currentHour);
  useEffect(() => {
    // Reset to currentHour when it changes
    setTime(currentHour);
  }, [currentHour]);

  // Derived time value for filtering (add 2 hours to current chosen time)
  const newTimeString = useMemo(() => {
    const parsed = parse(time.slice(0, 5), 'HH:mm', new Date());
    return format(addHours(parsed, 2), 'HH:mm');
  }, [time]);

  const { chosenDay } = useDateContext();

  // Data fetching with useList
  const { data, isLoading, error } = useList({
    resource: "api/v1/bo/floors/",
  });

  const { data: tablesData, isLoading: isLoadingTables, error: errorTables, refetch: refreshTables } = useList({
    resource: "api/v1/bo/tables/tables_reservations/",
    filters: [
      { field: "reservations__date", operator: "eq", value: format(chosenDay, 'yyyy-MM-dd') },
      { field: "reservations__time_", operator: "gte", value: time },
      { field: "reservations__time_", operator: "lte", value: newTimeString + ':00' },
    ],
  });

  const [page, setPage] = useState(1);
  const { data: reservationsData, isLoading: isLoadingReservations, error: errorReservations, refetch: refetchReservations } = useList({
    resource: "api/v1/bo/reservations/",
    filters: [
      { field: "page", operator: "eq", value: page },
      { field: "date", operator: "null", value: format(chosenDay, 'yyyy-MM-dd') },
      { field: "time_", operator: "gte", value: time },
      { field: "time_", operator: "lte", value: newTimeString },
    ],
  });

  // Local state for data
  const [roofData, setRoofData] = useState<BaseRecord[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<TableType[]>([]);
  const [focusedRoof, setFocusedRoof] = useState<BaseKey | undefined>(undefined);
  const [floorId, setFloorId] = useState<BaseKey | undefined>(0);
  const [reservationAPIInfo, setReservationAPIInfo] =useState<ReservationType>()

  // When fetched data changes, update local state
  useEffect(() => {
    setReservations(reservationAPIInfo?.results as Reservation[] || [])
  },[reservationAPIInfo])
  useEffect(() => {
    if (reservationsData?.data) {
      setReservationAPIInfo(reservationsData.data as unknown as ReservationType);
    }
    if (data?.data) {
      setRoofData(data.data);
      if (!focusedRoof) {
        setFocusedRoof(data.data[0]?.id);
      }
    }
    if (tablesData?.data) {
      setTables(tablesData.data as TableType[]);
    }
  }, [data, tablesData, reservationsData]);

  // Update floorId when focusedRoof changes
  useEffect(() => {
    if (focusedRoof) {
      const foundFloor = roofData.find((floor) => floor.id === focusedRoof);
      setFloorId(foundFloor?.id);
      handleFocusAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedRoof, roofData]);


  useEffect(()=>{
    handleFocusAll();
  },[floorId])

  // Reservation search and filtering
  const [searchResults, setSearchResults] = useState<Reservation[]>(reservations);
  const [showOnly, setShowOnly] = useState('APPROVED');

  useEffect(() => {
    setSearchResults(reservations);
  }, [reservations]);

  const searchFilter = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value.toLowerCase();
    setSearchResults(keyword === '' ? reservations : reservations.filter(item => item.full_name.toLowerCase().includes(keyword)));
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    return searchResults.filter(item => item.status === showOnly);
  }, [showOnly, searchResults]);

  // Zoom and Pan states
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPosition, setLastPanPosition] = useState<{ x: number; y: number } | null>(null);
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [lastTouchCenter, setLastTouchCenter] = useState<{ x: number; y: number } | null>(null);

  const clampScale = useCallback((s: number) => Math.min(Math.max(s, 0.3), 0.9), []);

  // Mouse wheel zooming (zoom around mouse pointer)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const focalPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const delta = -e.deltaY * 0.001;
    const newScale = clampScale(scale + delta);
    const scaleFactor = newScale / scale;
    const newTranslateX = focalPoint.x - scaleFactor * (focalPoint.x - translate.x);
    const newTranslateY = focalPoint.y - scaleFactor * (focalPoint.y - translate.y);
    setScale(newScale);
    setTranslate({ x: newTranslateX, y: newTranslateY });
  }, [scale, translate, clampScale]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsPanning(true);
    setLastPanPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning || !lastPanPosition) return;
    const deltaX = e.clientX - lastPanPosition.x;
    const deltaY = e.clientY - lastPanPosition.y;
    setTranslate(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    setLastPanPosition({ x: e.clientX, y: e.clientY });
  }, [isPanning, lastPanPosition]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setLastPanPosition(null);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setLastPanPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      const [touch1, touch2] = [e.touches[0], e.touches[1]];
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      setLastTouchDistance(Math.hypot(dx, dy));
      setLastTouchCenter({ x: (touch1.clientX + touch2.clientX) / 2, y: (touch1.clientY + touch2.clientY) / 2 });
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && lastPanPosition) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastPanPosition.x;
      const deltaY = touch.clientY - lastPanPosition.y;
      setTranslate(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastPanPosition({ x: touch.clientX, y: touch.clientY });
    } else if (e.touches.length === 2 && lastTouchDistance && lastTouchCenter) {
      const [touch1, touch2] = [e.touches[0], e.touches[1]];
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      const newDistance = Math.hypot(dx, dy);
      const newCenter = { x: (touch1.clientX + touch2.clientX) / 2, y: (touch1.clientY + touch2.clientY) / 2 };
      const newScale = clampScale(scale * (newDistance / lastTouchDistance));
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
  }, [lastPanPosition, lastTouchDistance, lastTouchCenter, scale, translate, clampScale]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      setLastTouchDistance(null);
      setLastTouchCenter(null);
    }
    if (e.touches.length === 0) {
      setLastPanPosition(null);
    }
  }, []);

  // Zoom control buttons – using container center as focal point
  const handleZoomIn = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const center = { x: container.clientWidth / 2, y: container.clientHeight / 2 };
    const newScale = clampScale(scale + 0.1);
    const scaleFactor = newScale / scale;
    const newTranslateX = center.x - scaleFactor * (center.x - translate.x);
    const newTranslateY = center.y - scaleFactor * (center.y - translate.y);
    setScale(newScale);
    setTranslate({ x: newTranslateX, y: newTranslateY });
  }, [scale, translate, clampScale]);

  const handleZoomOut = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const center = { x: container.clientWidth / 2, y: container.clientHeight / 2 };
    const newScale = clampScale(scale - 0.1);
    const scaleFactor = newScale / scale;
    const newTranslateX = center.x - scaleFactor * (center.x - translate.x);
    const newTranslateY = center.y - scaleFactor * (center.y - translate.y);
    setScale(newScale);
    setTranslate({ x: newTranslateX, y: newTranslateY });
  }, [scale, translate, clampScale]);

  // "Focus on All Tables": centers all tables of the current floor
  const handleFocusAll = useCallback(() => {
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
    const newTranslateX = (containerWidth - contentWidth * newScale) / 2 - minX * newScale;
    const newTranslateY = (containerHeight - contentHeight * newScale) / 2 - minY * newScale;
    setScale(newScale);
    setTranslate({ x: newTranslateX, y: newTranslateY });
  }, [tables, floorId, clampScale]);

  // Hours list memoized to prevent re-creation on every render
  const hours = useMemo(() => ([
    { id: 1, time: '00:00' }, { id: 2, time: '01:00' }, { id: 3, time: '02:00' },
    { id: 4, time: '03:00' }, { id: 5, time: '04:00' }, { id: 6, time: '05:00' },
    { id: 7, time: '06:00' }, { id: 8, time: '07:00' }, { id: 9, time: '08:00' },
    { id: 10, time: '09:00' }, { id: 11, time: '10:00' }, { id: 12, time: '11:00' },
    { id: 13, time: '12:00' }, { id: 14, time: '13:00' }, { id: 15, time: '14:00' },
    { id: 16, time: '15:00' }, { id: 17, time: '16:00' }, { id: 18, time: '17:00' },
    { id: 19, time: '18:00' }, { id: 20, time: '19:00' }, { id: 21, time: '20:00' },
    { id: 22, time: '21:00' }, { id: 23, time: '22:00' }, { id: 24, time: '23:00' }
  ]), []);

  return (
    <div className=''>
      <div className='flex w-full justify-between mb-2'>
        <h1 className='text-3xl font-[700]'>{t('placeManagement.title')}</h1>
        <CanAccess 
          resource="floor"
          action="change">
          <Link to='/places/design' className='btn-primary flex gap-2 items-center lt-sm:hidden'>
            {t('placeManagement.buttons.designPlace')}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M20.71 7.04c.39-.39.39-1.03 0-1.42l-2.34-2.34c-.39-.39-1.03-.39-1.42 0l-1.84 1.84 3.75 3.75zM3 17.25v3.75h3.75l11.06-11.06-3.75-3.75L3 17.25z" fill="white" />
            </svg>
          </Link>
        </CanAccess>
      </div>

      <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
        <div className="flex gap-[10px]">
          <div className={`lt-sm:hidden rounded-[10px] p-[1em] ${darkMode ? 'bg-bgdarktheme' : 'bg-white'}`}>
            <SearchBar SearchHandler={searchFilter} />
            <div className='grid grid-flow-col gap-3 font-[500] my-3 justify-between'>
              <button className={showOnly === 'SEATED' ? 'btn-primary' : 'btn-secondary'} onClick={() => setShowOnly("SEATED")}>
                {t('placeManagement.filters.seated')}
              </button>
              <button className={showOnly === 'APPROVED' ? 'btn-primary' : 'btn-secondary'} onClick={() => setShowOnly("APPROVED")}>
                {t('placeManagement.filters.confirmed')}
              </button>
              <button className={showOnly === 'PENDING' ? 'btn-primary' : 'btn-secondary'} onClick={() => setShowOnly("PENDING")}>
                {t('placeManagement.filters.pending')}
              </button>
            </div>
            <div className='overflow-y-auto h-[55vh] bar-hide'>
              {filteredReservations.map(item => (
                <DraggableItem itemData={item} key={item.id} />
              ))}
            </div>
            <Pagination setPage={(p: number) => setPage(p)} size={20} count={0} />
          </div>

          <div className='w-full sm:overflow-auto'>
            <div className='flex lt-sm:flex-wrap lt-sm:gap-2 justify-between'>
              <div className='flex gap-2 w-[90%] overflow-x-scroll no-scrollbar'>
                {roofData.map(roof => (
                  <button
                    key={roof.id}
                    className={`flex items-center ${focusedRoof === roof.id ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFocusedRoof(roof.id)}
                  >
                    {roof.name}
                  </button>
                ))}
              </div>
              <div>
                <select
                  value={time}
                  id='hourChosen'
                  className={`inputs ${darkMode ? 'bg-darkthemeitems' : 'bg-white'}`}
                  onChange={e => setTime(e.target.value)}
                >
                  {hours.map(hour => (
                    <option key={hour.id} value={hour.time}>
                      {hour.time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tables Container with Zoom and Pan */}
            <div
              className={`tables-cont relative mt-1 lt-sm:overflow-x-auto overflow-hidden rounded-xl ${darkMode ? 'bg-bgdarktheme' : 'bg-whitetheme'}`}
              ref={containerRef}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: "none" }}
            >
              <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onFocusAll={handleFocusAll} />
              <div
                style={{
                  transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                  transformOrigin: '0 0',
                  width: '100%',
                  height: '100%',
                  position: 'relative'
                }}
              >
                {tables.filter(table => table.floor === floorId).map(table => (
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
                    hourChosen={time}
                    onUpdateReservations={() => {
                      refreshTables();
                      refetchReservations();
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
