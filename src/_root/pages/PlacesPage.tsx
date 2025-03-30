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
import { Ban, ListCollapse, Pencil, Plus, Settings2, X } from 'lucide-react';
import DraggableItemSkeleton from '../../components/places/DraggableItemSkeleton';
import { ReservationSource, ReservationStatus } from '../../components/common/types/Reservation';
import { Occasion } from '../../components/settings/Occasions';
import { Reservation } from './ReservationsPage';
import BaseSelect from '../../components/common/BaseSelect';
import DndPreview from '../../components/places/DndPreview';
import SlideGroup from '../../components/common/SlideGroup';
import BaseTimeInput from '../../components/common/BaseTimeInput';
import { isTouchDevice } from '../../utils/isTouchDevice';
import ReservationModal from '../../components/reservation/ReservationModal';

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
  blocked: boolean;
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
      {isTouch && <DndPreview />}
    </DndProvider>
  );
};

const PlacePage: React.FC = () => {
  const { t } = useTranslation();
  const { darkMode } = useDarkContext();

  // Update document title
  useEffect(() => {
    document.title = 'Overview - Table Management | Tabla'
  }, [])

  // Manage current time (updates every minute)
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    setCurrentTime(new Date())
  }, []);
  const currentHour = useMemo(() => format(currentTime, 'HH:00'), [currentTime]);

  // Time state – this can be updated when user selects a different hour.
  const [time, setTime] = useState<string | null>(currentHour);
  const [timeTo, setTimeTo] = useState<string | null>(null);
  const { chosenDay } = useDateContext();

  // Data fetching with useList
  const { data, isLoading, error } = useList({
    resource: "api/v1/bo/floors/",
    queryOptions: {
      keepPreviousData: false,
    }
  });

  const { data: tablesData, isLoading: isLoadingTables, error: errorTables, refetch: refreshTables } = useList({
    resource: "api/v1/bo/tables/tables_reservations/",
    filters: [
      { field: "reservations__date", operator: "eq", value: format(chosenDay, 'yyyy-MM-dd') },
      { field: "reservations__time_", operator: "gte", value: time || '00:00' },
      { field: "reservations__time_", operator: "lte", value: timeTo ? timeTo : '23:59' },
    ],
    queryOptions: {
      keepPreviousData: false,
      enabled: false,
    }
  });

  // We've removed the availableTablesData fetching since it's now handled inside the EditReservationModal

  const [page, setPage] = useState(1);
  const { data: reservationsData, isLoading: isLoadingReservations, error: errorReservations, refetch: refetchReservations } = useList({
    resource: "api/v1/bo/reservations/",
    filters: [
      { field: "page", operator: "eq", value: page },
      { field: "date", operator: "null", value: format(chosenDay, 'yyyy-MM-dd') },
      { field: "time_", operator: "gte", value: time || '00:00' },
      { field: "time_", operator: "lte", value: timeTo ? timeTo : '23:59' },
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
  const [focusedTable, setFocuseTable] = useState<BaseKey | null>(null);
  const [showAddReservation, setShowAddReservation] = useState<boolean>(false);
  // Edit Reservation Modal state
  const [showModal, setShowModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
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


  // Update timeTo when time changes
  useEffect(() => {
    if(format(new Date (chosenDay), 'yyyy-MM-dd') === format(new Date (), 'yyyy-MM-dd')){
      const currentHour = format(new Date(), 'HH');
      setTime(`${currentHour}:00`);
      setTimeTo('');
    }else {
      setTime('')
      setTimeTo('')
    }
  }, [chosenDay]);

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
  const [expandTables, setExpandTables] = useState(false);
  const [lastPanPosition, setLastPanPosition] = useState<{ x: number; y: number } | null>(null);
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [lastTouchCenter, setLastTouchCenter] = useState<{ x: number; y: number } | null>(null);
  const optionsButtonRef = useRef<HTMLButtonElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

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

  const floorTables = useMemo(():TableType[] => {
    return roofData?.find(floor => floor.id === focusedRoof)?.tables || [];
  },[roofData, focusedRoof]);

  // Zoom control buttons – using container center as focal point
  // Helper function to animate zoom transitions
  const animateZoom = useCallback((startScale: number, endScale: number, startTranslate: { x: number; y: number }, center: { x: number; y: number }) => {
    const duration = 300; // duration in ms
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out function for smoother deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 2);
      const currentScale = startScale + (endScale - startScale) * easeProgress;
      const scaleFactor = currentScale / startScale;
      const currentTranslateX = center.x - scaleFactor * (center.x - startTranslate.x);
      const currentTranslateY = center.y - scaleFactor * (center.y - startTranslate.y);
      setScale(currentScale);
      setTranslate({ x: currentTranslateX, y: currentTranslateY });
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, []);

  const handleZoomIn = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const center = { x: container.clientWidth / 2, y: container.clientHeight / 2 };
    const newScale = clampScale(scale + 0.1);
    animateZoom(scale, newScale, translate, center);
  }, [scale, translate, clampScale, animateZoom]);

  const handleZoomOut = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const center = { x: container.clientWidth / 2, y: container.clientHeight / 2 };
    const newScale = clampScale(scale - 0.1);
    animateZoom(scale, newScale, translate, center);
  }, [scale, translate, clampScale, animateZoom]);

  const handleTableFocus = useCallback((x: number, y: number, tableWidth = 100, tableHeight = 100) => {
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate target values
    const targetScale = clampScale(0.6);
    const targetTranslateX = (containerWidth / 2) - (x * targetScale) - (tableWidth * targetScale / 2);
    const targetTranslateY = (containerHeight / 2) - (y * targetScale) - (tableHeight * targetScale / 2);

    // Start with current values
    const startScale = scale;
    const startTranslateX = translate.x;
    const startTranslateY = translate.y;

    // Animation duration and start time
    const duration = 500; // milliseconds
    const startTime = Date.now();

    // Animation function using requestAnimationFrame
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function - easeOutQuad for smoother deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 2);

      // Calculate intermediate values
      const currentScale = startScale + (targetScale - startScale) * easeProgress;
      const currentTranslateX = startTranslateX + (targetTranslateX - startTranslateX) * easeProgress;
      const currentTranslateY = startTranslateY + (targetTranslateY - startTranslateY) * easeProgress;

      // Update state
      setScale(currentScale);
      setTranslate({ x: currentTranslateX, y: currentTranslateY });

      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    // Start animation
    requestAnimationFrame(animate);
  }, [clampScale, scale, translate]);

  // "Focus on All Tables": centers all tables of the current floor with margin
  const handleFocusAll = () => {
    const container = containerRef.current;
    if (!container || isLoadingTables || tables.length === 0) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const margin = 40; // margin in pixels

    if (floorTables.length === 0) return;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    floorTables.forEach((table: TableType) => {
      minX = Math.min(minX, table.x + (table.type === 'RECTANGLE' ? 0 : table.width / 2));
      minY = Math.min(minY, table.y + (table.type === 'RECTANGLE' ? 0 : table.height / 2));
      maxX = Math.max(maxX, table.x + (table.type === 'RECTANGLE' ? table.width : table.width / 2));
      maxY = Math.max(maxY, table.y + (table.type === 'RECTANGLE' ? table.height : table.height / 2));
    });
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    // Calculate new scale based on container size with margin
    const newScale = clampScale(Math.min((containerWidth - 2 * margin) / contentWidth, (containerHeight - 2 * margin) / contentHeight)) - 0.1;
    // Calculate translation such that the focused area is centered with margin on all sides
    const newTranslateX = margin + ((containerWidth - 2 * margin) - contentWidth * newScale) / 2 - minX * newScale;
    const newTranslateY = margin + ((containerHeight - 2 * margin) - contentHeight * newScale) / 2 - minY * newScale;

    // Smooth transition animation over 300ms
    const startScale = scale;
    const startTranslate = { ...translate };
    const duration = 300;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 2); // ease-out easing
      const currentScale = startScale + (newScale - startScale) * easeProgress;
      const currentTranslateX = startTranslate.x + (newTranslateX - startTranslate.x) * easeProgress;
      const currentTranslateY = startTranslate.y + (newTranslateY - startTranslate.y) * easeProgress;
      setScale(currentScale);
      setTranslate({ x: currentTranslateX, y: currentTranslateY });
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

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
          tables: reservation.tables?.length ? reservation.tables?.map(t => t?.id ? Number(t?.id) : t) : [],
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
    if (focusedRoof) {
      refreshTables();
      handleFocusAll();
    }
  }, [focusedRoof]);

  // // Add a new effect specifically for table data changes
  // useEffect(() => {
  //   if (tables.length > 0 && floorId !== undefined && !isLoadingTables) {
  //     handleFocusAll();
  //   }
  // }, [tables, isLoadingTables, handleFocusAll]);


  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: { target: any; }) => {

      // Close options menu dropdown
      if (
        showOptions &&
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(event.target) &&
        optionsButtonRef.current &&
        !optionsButtonRef.current.contains(event.target)
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showOptions]);

  return (
    <div className=''>

      {/* Add Reservation Modal */}
      {showAddReservation && (
        <ReservationModal 
          onClick={() => {setShowAddReservation(false)}} 
          onSubmit={(data) => {
            refreshTables();
            refetchReservations();
          }} 
        />
      )} 

      
      {showBlockingModal && <BlockReservationModal onClose={() => setShowBlockingModal(false)} />}

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
      <div className='flex w-full justify-between mb-2 items-center gap-2'>
        <div className='flex items-center lt-sm:hidden w-[50%]'>
          <button
            className="btn-primary transform transition-all duration-300 ease-in-out mr-1"
            onClick={() => {
              setExpandTables(prev => !prev)
              setTimeout(() => {
                handleFocusAll()
              }, 500)
            }}
          >
            <div className="relative w-5 h-6 flex items-center justify-center">
              <ListCollapse
                className={`absolute transition-all duration-300 ease-in-out 
                      ${!expandTables ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}`}
              />

              <X
                className={`absolute transition-all duration-300 ease-in-out 
                      ${!expandTables ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`}
              />
            </div>
          </button>
          <div className='w-[80%]'>
          {isLoading ? (
            // Floor buttons skeleton loader
            <div className='flex gap-2 overflow-x-scroll no-scrollbar'>
              <div className="flex gap-2 animate-pulse">
                {[1, 2, 3].map((_, index) => (
                  <div
                    key={index}
                    className={`h-9 w-24 rounded-md ${darkMode ? 'bg-darkthemeitems' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <SlideGroup>
              {roofData.map(roof => (
                <button
                  key={roof.id}
                  className={`flex items-center ${focusedRoof === roof.id ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFocusedRoof(roof.id)}
                >
                  {roof.name}
                </button>
              ))}
            </SlideGroup>
          )}
          </div>
        </div>
        <div className='flex gap-2 justify-end w-[50%] lt-md:w-full relative'>
          <BaseTimeInput value={time} onChange={(v) => setTime(v)} clearable={true} placeholder='Start of Day' />
          <BaseTimeInput value={timeTo} onChange={(v) => setTimeTo(v)} clearable={true} placeholder='End of Day' />
          <button
            ref={optionsButtonRef}
            className="btn-primary transform transition-all duration-300 ease-in-out"
            onClick={() => setShowOptions(prev => !prev)}
          >
            <div className="relative w-6 h-6 flex items-center justify-center">
              <Settings2
                className={`absolute transition-all duration-300 ease-in-out 
                      ${showOptions ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}`}
              />

              <X
                className={`absolute transition-all duration-300 ease-in-out 
                      ${showOptions ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`}
              />
            </div>
          </button>
          {showOptions &&
            <div
              ref={optionsMenuRef}
              className={`absolute right-0 top-[50px] w-64 rounded-md shadow-lg z-50 dark:bg-bgdarktheme overflow-hidden bg-white`}
            >
              <CanAccess action="add" resource="reservation">
                <button className='btn-primary flex gap-2 w-full items-center rounded-none' onClick={() => { setShowAddReservation(true) }}>
                  <Plus size={18}/>
                  {t('reservations.buttons.addReservation')}
                </button>
              </CanAccess>
              <CanAccess
                resource="floor"
                action="change">
                <Link to='/places/design' className='btn-primary rounded-none flex gap-2 items-center lt-sm:hidden'>
                  <Pencil fill="white" strokeWidth={0} size={18}/>
                  {t('placeManagement.buttons.designPlace')}
                </Link>
              </CanAccess>
              <CanAccess
                resource="reservation"
                action="change">
                <button className='btn-danger w-full flex gap-2 items-center rounded-none' onClick={() => setShowBlockingModal(true)}>
                  <Ban size={18} />
                  Block
                </button>
              </CanAccess>
            </div>
          }
        </div>
      </div>

      {/* Replace the original DndProvider with our enhanced version */}
      <DndProviderWithPreview>
        <div className={`gt-sm:flex ${!expandTables ? 'gap-[10px]' : ''}`}>
          <div className={`flex flex-col transition-all duration-300 ease-in-out ${!expandTables ? 'gt-sm:w-[35%] gt-sm:p-[0.5em]' : 'gt-sm:w-[0] gt-sm:p-0 gt-sm:m-0 gt-sm:overflow-hidden'} rounded-[10px] dark:bg-bgdarktheme bg-white`}>
            <SearchBar SearchHandler={searchFilter} />
            <SlideGroup>
              <button className={showOnly === 'SEATED' ? 'btn-primary' : 'btn-secondary'} onClick={() => setShowOnly("SEATED")}>
                {t('placeManagement.filters.seated')}
              </button>
              <button className={showOnly === 'APPROVED' ? 'btn-primary' : 'btn-secondary'} onClick={() => setShowOnly("APPROVED")}>
                {t('placeManagement.filters.confirmed')}
              </button>
              <button className={showOnly === 'PENDING' ? 'btn-primary' : 'btn-secondary'} onClick={() => setShowOnly("PENDING")}>
                {t('placeManagement.filters.pending')}
              </button>
            </SlideGroup>
            <div className='overflow-y-auto overflow-x-hidden bar-hide transition-all duration-300 ease-in-out h-[56vh]'>

              {isLoadingReservations ?
                <DraggableItemSkeleton count={3} isDarkMode={darkMode} />
                : (filteredReservations.map(item => (
                  <DraggableItem
                    itemData={{
                      ...item,
                      number_of_guests: parseInt(item.number_of_guests, 10),
                      onEdit: handleEditReservation,
                      onUpdate: () => {
                        refetchReservations();
                      },
                      loading: item.loading ?? false,
                      created_at: item.created_at,
                      tables: item.tables || []
                    }}
                    key={item.id}
                  />
                )))}
            </div>
            {((reservationAPIInfo?.count || 0) > 1 && filteredReservations?.length > 100) && (<>
              <div className='bottom mx-auto'>
                <Pagination setPage={(p: number) => setPage(p)} size={20} count={reservationAPIInfo?.count || 0} />
              </div>
            </>)}
          </div>
          <div className={`transition-all duration-300 ease-in-out w-full`}>

            {/* Tables Container with Zoom and Pan */}
            <div className='lt-sm:hidden mt-1 overflow-hidden rounded-xl bg-whitetheme dark:bg-bgdarktheme tables-cont relative select-none'>
              {isLoadingTables &&
                // Tables skeleton loader
                <div className="w-full tables-cont min-h-[400px] flex items-center justify-center bg-white dark:bg-bgdarktheme rounded-lg" style={{
                  position: "absolute", inset: "50%", transform: "translate(-50%, -50%)", "zIndex": 5, height: "100%", opacity: 0.7
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
              >
                <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onFocusAll={()=>handleFocusAll()} />
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
                      blocked={table.blocked}
                      focusedTable={focusedTable}
                      setFocuseTable={(id) => setFocuseTable(id)}
                      onTableFocus={() => handleTableFocus(table.x, table.y, table.width, table.height)}
                      reservedBy={table.current_reservations[0]}
                      reservations={table.current_reservations}
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