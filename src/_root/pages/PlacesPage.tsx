import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { Preview } from 'react-dnd-preview';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { addHours, format, parse } from 'date-fns';
import { useDateContext } from '../../context/DateContext';
import { useDarkContext } from '../../context/DarkContext';
import { BaseKey, BaseRecord, CanAccess, useList, useUpdate } from '@refinedev/core';
import DraggableItem from '../../components/places/DraggableItem';
import DropTarget from '../../components/places/DropTarget';
import SearchBar from '../../components/header/SearchBar';
import ZoomControls from '../../components/places/ZoomControls';
import Pagination from '../../components/reservation/Pagination';
import BlockReservationModal from '../../components/places/BlockReservationModal';
import EditReservationModal from '../../components/reservation/EditReservationModal';
import ReservationProcess from '../../components/reservation/ReservationProcess';
import { Ban } from 'lucide-react';
import DraggableItemSkeleton from '../../components/places/DraggableItemSkeleton';
import { ReservationSource, ReservationStatus } from '../../components/common/types/Reservation';
import { Occasion } from '../../components/settings/Occasions';
import { Reservation } from './ReservationsPage';
import BaseSelect from '../../components/common/BaseSelect';
import DndPreview from '../../components/places/DndPreview';

interface ReservationType {
  results: Reservation[]
  count: number
}

export interface currentResType {
  id: BaseKey;
  full_name: string;
  time: string;
  date: string;
  email: string;
  phone: string;
  number_of_guests: number;
  occasion: Occasion;
}

export interface TableType {
  id: BaseKey;
  name: string;
  type: 'CIRCLE' | 'RECTANGLE';
  floor: number;
  floor_name: string,
  x: number;
  y: number;
  rotation: number;
  height: number;
  width: number;
  max: number;
  min: number;
  current_reservations: currentResType[];
}

interface Table {
  id: BaseKey;
  floor_name: string;
  name: string;
  max: number;
  min: number;
  rotation: number;
  floor: number;
}

interface DataTypes {
  reserveDate: string;
  time: string;
  guests: number;
}

function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

const touchBackendOptions = {
  enableMouseEvents: true, // Allow mouse events on touch devices
  enableKeyboardEvents: true,
  delayTouchStart: 50, // Small delay to distinguish between tap and drag
  ignoreContextMenu: true,
  scrollAngleRanges: [
    { start: 30, end: 150 },
    { start: 210, end: 330 }
  ]
};

const DndProviderWithPreview: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isTouch = isTouchDevice();
  const backend = isTouch ? TouchBackend : HTML5Backend;
  const options = isTouch ? touchBackendOptions : undefined;

  return (
    <DndProvider backend={backend} options={options}>
      {children}
      <DndPreview />
    </DndProvider>
  );
};

const PlacePage: React.FC = () => {
  const { t } = useTranslation();
  const { darkMode } = useDarkContext();

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
    queryOptions: {
      keepPreviousData: false,
    }
  });

  const { data: tablesData, isLoading:isLoadingTables,error: errorTables, refetch: refreshTables } = useList({
    resource: "api/v1/bo/tables/tables_reservations/",
    filters: [
      { field: "reservations__date", operator: "eq", value: format(chosenDay, 'yyyy-MM-dd') },
      { field: "reservations__time_", operator: "gte", value: time },
      { field: "reservations__time_", operator: "lte", value: newTimeString + ':00' },
    ],
    queryOptions: {
      keepPreviousData: false,
    }
  });

  // We've removed the availableTablesData fetching since it's now handled inside the EditReservationModal

  const [page, setPage] = useState(1);
  const { data: reservationsData, isLoading: isLoadingReservations, error: errorReservations, refetch: refetchReservations } = useList({
    resource: "api/v1/bo/reservations/",
    filters: [
      { field: "page", operator: "eq", value: page },
      { field: "date", operator: "null", value: format(chosenDay, 'yyyy-MM-dd') },
      { field: "time_", operator: "gte", value: time },
      { field: "time_", operator: "lte", value: newTimeString },
    ],
    queryOptions: {
      keepPreviousData: false,
    }
  });

  // Local state for data
  const [roofData, setRoofData] = useState<BaseRecord[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<TableType[]>([]);
  const [focusedRoof, setFocusedRoof] = useState<BaseKey | undefined>(undefined);
  const [floorId, setFloorId] = useState<BaseKey | undefined>(0);
  const [reservationAPIInfo, setReservationAPIInfo] = useState<ReservationType>()
  const [showBlockingModal, setShowBlockingModal] = useState(false);

  // Edit Reservation Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Reservation | null>(null);
  const [showProcess, setShowProcess] = useState(false);
  const [hasTable, setHasTable] = useState(false);
  const [editingClient, setEditingClient] = useState<BaseKey | undefined>(undefined);
  const [reservationProgressData, setReservationProgressData] = useState<DataTypes>({
    reserveDate: selectedClient?.date || '',
    time: selectedClient?.time?.slice(0, 5) || '',
    guests: selectedClient ? parseInt(String(selectedClient.number_of_guests)) : 0
  });

  // Update reservationProgressData when selectedClient changes
  useEffect(() => {
    if (selectedClient) {
      setReservationProgressData({
        reserveDate: selectedClient.date,
        time: selectedClient.time.slice(0, 5),
        guests: parseInt(String(selectedClient.number_of_guests))
      });
    }
  }, [selectedClient]);

  // Mutation
  const { mutate: upDateReservation } = useUpdate({
    resource: `api/v1/bo/reservations`,
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });

  

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
  const [showTableOptions, setShowTableOptions] = useState(false);
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
    if ((e.target as HTMLElement)?.id !== "tables-cont") return;
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
    if ((e.target as HTMLElement)?.id !== "tables-cont") return;
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
    if (!container || isLoadingTables || tables.length === 0) return;
    
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
  }, [tables, floorId, clampScale, isLoadingTables]);

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

  // Handle edit reservation
  const handleEditReservation = (id: BaseKey) => {
    setEditingClient(id);
    if (!id) return;

    // Find the reservation by id
    const reservation = reservations.find(r => r.id === id);
    if (reservation) {
      setSelectedClient(reservation);
      setShowModal(true);

      // Check if the reservation has tables
      if (reservation.tables && reservation.tables.length > 0) {
        setHasTable(true);
      } else {
        setHasTable(false);
      }
    }
  };

  // Handle status change
  const statusHandler = (status: ReservationStatus) => {
    if (selectedClient) {
      setSelectedClient({
        ...selectedClient,
        status: status,
        loading: true
      });
    }
  };

  // Handle update reservation
  const handleUpdateReservation = (reservation: Reservation) => {
    if (selectedClient && editingClient) {
      upDateReservation({
        id: `${editingClient}/`,
        values: {
          full_name: reservation.full_name,
          email: reservation.email,
          phone: reservation.phone,
          source: reservation.source,
          status: reservation.status,
          internal_note: reservation.internal_note,
          occasion: reservation.occasion?.id || reservation.occasion,
          date: reservationProgressData.reserveDate,
          time: `${reservationProgressData.time}:00`,
          tables: reservation.tables?.length ?  reservation.tables?.map(t=>t?.id? Number(t?.id):t) : [],
          number_of_guests: reservationProgressData.guests,
          commenter: reservation.commenter,
        }
      }, {
        onSuccess() {
          // Refresh data
          refetchReservations();
          refreshTables();
          setShowModal(false);
        }
      });
    }
  };


  // When fetched data changes, update local state
  useEffect(() => {
    setReservations(reservationAPIInfo?.results as Reservation[] || [])
  }, [reservationAPIInfo])
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
      // Don't call handleFocusAll here, it will be called by the floorId effect
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedRoof, roofData]);

  useEffect(() => {
    if (floorId !== undefined && tables.length > 0 && !isLoadingTables) {
      handleFocusAll();
    }
  }, [floorId, tables, isLoadingTables, handleFocusAll]);
  
  // Add a new effect specifically for table data changes
  useEffect(() => {
    if (tables.length > 0 && floorId !== undefined && !isLoadingTables) {
      handleFocusAll();
    }
  }, [tables, isLoadingTables, handleFocusAll]);

  return (
    <div className=''>
      {showBlockingModal && <BlockReservationModal onConfirm={(data) => console.log(data)} onClose={() => setShowBlockingModal(false)} />}

      {/* Reservation Process Modal */}
      {showProcess && (
        <ReservationProcess
          onClick={() => { setShowProcess(false) }}
          getDateTime={(data) => { setReservationProgressData(data) }}
        />
      )}

      {/* Edit Reservation Modal */}
      {showModal && <EditReservationModal
        showModal={showModal}
        reservation={selectedClient}
        setShowModal={setShowModal}
        setShowProcess={setShowProcess}
        reservationProgressData={reservationProgressData}
        statusHandler={statusHandler}
        upDateHandler={handleUpdateReservation}
        hasTable={hasTable}
        setHasTable={setHasTable}
        isDarkMode={darkMode}
      />}

      <div className='flex w-full justify-between mb-2'>
        <h1 className='text-3xl font-[700]'>{t('placeManagement.title')}</h1>
        <div className='flex gap-2'>
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
          <CanAccess
            resource="reservation"
            action="change">
            <button className='btn-danger-outline flex gap-1 items-center' onClick={() => setShowBlockingModal(true)}>
              <Ban size={18} />
              Block
            </button>
          </CanAccess>
        </div>
      </div>
      
      {/* Replace the original DndProvider with our enhanced version */}
      <DndProviderWithPreview>
        <div className="gt-sm:flex gap-[10px]">
          <div className='gt-sm:hidden lt-sm:mb-2'>
            <BaseSelect
              value={time}
              clearable={false}
              onChange={e => setTime(e as string)}
              options={hours.map(hour => ({ value: hour.time, label: hour.time }))}
            />
          </div>
          <div className={`rounded-[10px] p-[1em] ${darkMode ? 'bg-bgdarktheme' : 'bg-white'}`}>
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
            <div className='overflow-y-auto h-[35vh] gt-sm:h-[55vh] bar-hide'>
              
              {isLoadingReservations?
              <DraggableItemSkeleton count={3} isDarkMode={darkMode} />
              :(filteredReservations.map(item => (
                <DraggableItem
                  itemData={{
                    ...item,
                    number_of_guests: parseInt(item.number_of_guests, 10),
                    onEdit: handleEditReservation,
                    loading: item.loading ?? false,
                    created_at: item.created_at,
                    tables: item.tables || []
                  }}
                  key={item.id}
                />
              )))}
            </div>
            <Pagination setPage={(p: number) => setPage(p)} size={20} count={reservationAPIInfo?.count || 0} />
          </div>

          <div className='w-full sm:overflow-auto'>
            <div className='flex lt-sm:flex-wrap lt-sm:gap-2 justify-between lt-sm:hidden'>
              <div className='flex gap-2 w-[90%] overflow-x-scroll no-scrollbar'>
                {isLoading ? (
                  // Floor buttons skeleton loader
                  <div className="flex gap-2 animate-pulse">
                    {[1, 2, 3].map((_, index) => (
                      <div
                        key={index}
                        className={`h-9 w-24 rounded-md ${darkMode ? 'bg-darkthemeitems' : 'bg-gray-300'}`}
                      />
                    ))}
                  </div>
                ) : (
                  roofData.map(roof => (
                    <button
                      key={roof.id}
                      className={`flex items-center ${focusedRoof === roof.id ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setFocusedRoof(roof.id)}
                    >
                      {roof.name}
                    </button>
                  ))
                )}
              </div>
              <div>
                <BaseSelect
                  value={time}
                  clearable={false}
                  onChange={e => setTime(e as string)}
                  options={hours.map(hour => ({ value: hour.time, label: hour.time }))}
                />
              </div>
            </div>

            {/* Tables Container with Zoom and Pan */}
            <div className='lt-sm:hidden mt-1 lt-sm:overflow-x-auto overflow-hidden rounded-xl bg-whitetheme dark:bg-bgdarktheme tables-cont relative'>
              {isLoadingTables &&
                // Tables skeleton loader
                <div className="w-full tables-cont min-h-[400px] flex items-center justify-center bg-white dark:bg-bgdarktheme rounded-lg" style={{
                  position:"absolute",inset:"50%",transform: "translate(-50%, -50%)","zIndex": 5, height:"100%", opacity: 0.7
                }}>
                  <div className="flex flex-col items-center animate-pulse">
                    <div className={`h-10 w-10 rounded-full m-2 ${darkMode ? 'bg-darkthemeitems' : 'bg-gray-300'}`}></div>
                    <div className={`h-4 w-32 rounded m-6 ${darkMode ? 'bg-darkthemeitems' : 'bg-gray-300'}`}></div>
                    <div className="grid grid-cols-3 gap-8">
                      {[...Array(9)].map((_, index) => (
                        <div
                          key={index}
                          className={`h-16 w-16 ${index % 2 === 0 ? 'rounded-full' : 'rounded'} ${darkMode ? 'bg-darkthemeitems' : 'bg-gray-300'}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              }
              <div
                className={`tables-cont relative`} id="tables-cont"
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
                {/* {showTableOptions && <div className='overlay absolute z-[1000]'></div>} */}
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
                      onShowOptions={(e) => setShowTableOptions(e)}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </DndProviderWithPreview>
    </div>
  );
};

export default PlacePage;