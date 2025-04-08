import React, { useEffect, useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { useDrag, useDrop } from 'react-dnd';
import { usePreview } from 'react-dnd-preview';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { 
  Send, User, Mail, Phone, MessageSquare, 
  Calendar, Clock, Users, LayoutGrid, 
  ChevronDown, ChevronUp, Info, Edit, 
  GripVertical, EyeOff, Eye,
  Pencil,
  CalendarCheck
} from 'lucide-react';
import SearchBar from "../../components/header/SearchBar";
import IntervalCalendar from "../../components/Calendar/IntervalCalendar";
import ReservationModal from "../../components/reservation/ReservationModal";
import { BaseKey, BaseRecord, CanAccess, useCan, useCreate, useList, useUpdate } from "@refinedev/core";
import ReservationProcess from "../../components/reservation/ReservationProcess";
import Pagination from "../../components/reservation/Pagination";
import ExportModal from "../../components/common/ExportModal";
import useExportConfig from "../../components/common/config/exportConfig";
import EditReservationModal from "../../components/reservation/EditReservationModal";
import { ReservationSource, ReservationStatus } from "../../components/common/types/Reservation";
import { Occasion } from "../../components/settings/Occasions";
import { useDarkContext } from "../../context/DarkContext";
import { isTouchDevice } from '../../utils/isTouchDevice';

// Types and Interfaces
export interface ReceivedTables {
  floor_name?: string,
  id: number;
  name: string;
}

export interface Reservation extends BaseRecord {
  id: BaseKey;
  email: string;
  full_name: string;
  date: string;
  time: string;
  internal_note: string;
  source: ReservationSource;
  number_of_guests: string;
  tableSet?: number;
  phone: string;
  tables?: ReceivedTables[];
  status: ReservationStatus;
  commenter?: string;
  review?: boolean;
  allergies?: string;
  occasion?: Occasion;
  guests?: number;
  floor_name?: string;
  table_name?: string;
  loading?: boolean;
  seq_id?: string;
  selected?: boolean;
}

interface DataTypes {
  reserveDate: string;
  time: string;
  guests: number;
}

interface ReservationType {
  results: Reservation[];
  count: number;
}

// Column Configuration Interface
interface ColumnConfig {
  id: string;
  labelKey: string;
  visible: boolean;
  order: number;
}

// Custom preview component for column dragging
const DndColumnPreview = () => {
  const preview = usePreview();
  const { darkMode } = useDarkContext();
  const { t } = useTranslation();
  const item = (preview as { item?: ColumnConfig })?.item;
  if (!preview?.display || preview?.itemType !== 'column') {
    return null;
  }
  
  // Create a simplified preview of the column being dragged
  return (
    <div 
      className={`flex items-center justify-between py-3 px-1 border-b  dark:border-gray-700 border-gray-200 opacity-50`}
    >
      <div className="flex items-center">
        <div className="mr-2 cursor-move">
          <GripVertical size={16} className="dark:stroke-gray-400 stroke-gray-500" />
        </div>
        <input
          type="checkbox"
          readOnly
          aria-readonly
          checked={item?.visible}
          className="checkbox mr-2"
        />
        <label htmlFor={`col-ghost-${item?.id}`} className="cursor-pointer">
          {t(item?.labelKey || '')}
        </label>
      </div>
      <div className="flex">
        <button
          disabled
          className={`p-1 rounded hover:bg-gray-200 text-gray-600 dark:hover:bg-gray-700 dark:text-gray-300`}
          title={item?.visible ? t('common.hide') : t('common.show')}
        >
          {item?.visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>
    </div>
  );
};


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

const DndProviderWithColumnPreview: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isTouch = isTouchDevice();
  const backend = isTouch ? TouchBackend : HTML5Backend;
  const options = isTouch ? touchBackendOptions : undefined;

  return (
    <DndProvider backend={backend} options={options}>
      {children}
      {isTouch && <DndColumnPreview />}
    </DndProvider>
  );
};

// DnD Column Item
const ItemTypes = {
  COLUMN: 'column'
};

interface DraggableColumnItemProps {
  column: ColumnConfig;
  index: number;
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
  toggleVisibility: (id: string) => void;
  isDarkMode: boolean;
}

const DraggableColumnItem: React.FC<DraggableColumnItemProps> = ({ 
  column, 
  index, 
  moveColumn, 
  toggleVisibility, 
  isDarkMode 
}) => {
  const { t } = useTranslation();
  const ref = React.useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.COLUMN,
    item: { index, type: 'column', ...column },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    options: {
      dropEffect: 'move'
    }
  });
  
  const [, drop] = useDrop({
    accept: ItemTypes.COLUMN,
    hover: (item: { index: number, type: string }, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Calculate position
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
      
      // Only perform the move when the mouse has crossed half of the item's height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      moveColumn(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  
  drag(drop(ref));
  
  return (
    <div 
      ref={ref} 
      className={`flex items-center justify-between py-3 px-1 border-b border-gray-200 dark:border-gray-700 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="flex items-center">
        <div className="mr-2 cursor-move">
          <GripVertical size={16} className='dark:text-gray-400 text-gray-500' />
        </div>
        <input
          type="checkbox"
          id={`col-${column.id}`}
          checked={column.visible}
          onChange={() => toggleVisibility(column.id)}
          className="checkbox mr-2"
        />
        <label htmlFor={`col-${column.id}`} className="cursor-pointer">
          {t(column.labelKey)}
        </label>
      </div>
      <div className="flex">
        <button
          onClick={() => toggleVisibility(column.id)}
          className={`p-1 rounded dark:hover:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 text-gray-600`}
          title={column.visible ? t('common.hide') : t('common.show')}
        >
          {column.visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>
    </div>
  );
};

// Column Customization Modal Component
interface ColumnCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnConfig[];
  onSave: (columns: ColumnConfig[]) => void;
  isDarkMode: boolean;
}

const ColumnCustomizationModal: React.FC<ColumnCustomizationModalProps> = ({
  isOpen,
  onClose,
  columns,
  onSave,
  isDarkMode
}) => {
  const { t } = useTranslation();
  const [localColumns, setLocalColumns] = useState<ColumnConfig[]>([...columns]);

  useEffect(() => {
    setLocalColumns([...columns]);
  }, [columns]);

  const toggleVisibility = useCallback((id: string) => {
    setLocalColumns(prev => 
      prev.map(col => col.id === id ? { ...col, visible: !col.visible } : col)
    );
  }, []);

  const moveColumn = useCallback((dragIndex: number, hoverIndex: number) => {
    setLocalColumns(prevColumns => {
      const draggedColumn = prevColumns[dragIndex];
      const newColumns = [...prevColumns];
      newColumns.splice(dragIndex, 1);
      newColumns.splice(hoverIndex, 0, draggedColumn);
      
      // Update order property
      return newColumns.map((col, index) => ({
        ...col,
        order: index
      }));
    });
  }, []);

  const handleSave = () => {
    onSave(localColumns);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="overlay fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className={`relative w-full max-w-md p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-bgdarktheme text-white' : 'bg-white text-gray-800'}`}>
        <h3 className="text-xl font-semibold mb-4">{'Customize columns'}</h3>
        
        <div className="max-h-96 overflow-y-auto">
          <DndProviderWithColumnPreview>
            {localColumns
              .sort((a, b) => a.order - b.order)
              .map((column, index) => (
                <DraggableColumnItem
                  key={column.id}
                  column={column}
                  index={index}
                  moveColumn={moveColumn}
                  toggleVisibility={toggleVisibility}
                  isDarkMode={isDarkMode}
                />
              ))}
          </DndProviderWithColumnPreview>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <button 
            onClick={onClose} 
            className={`btn-secondary`}
          >
            {t('reservations.edit.buttons.cancel')}
          </button>
          <button 
            onClick={handleSave} 
            className="btn-primary"
          >
            {t('reservations.edit.buttons.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for managing column configuration
const useColumnConfiguration = () => {
  const { t } = useTranslation();
  const STORAGE_KEY = 'tabla_reservation_columns';
  
  // Default column configuration
  const defaultColumns: ColumnConfig[] = [
    { id: 'client', labelKey: 'clients.title', visible: true, order: 0 },
    { id: 'date', labelKey: 'reservations.tableHeaders.date', visible: true, order: 1 },
    { id: 'time', labelKey: 'reservations.tableHeaders.time', visible: true, order: 2 },
    { id: 'guests', labelKey: 'reservations.tableHeaders.guests', visible: true, order: 3 },
    { id: 'tables', labelKey: 'reservations.tableHeaders.tables', visible: true, order: 4 },
    { id: 'internalNote', labelKey: 'reservations.edit.informations.internalNote', visible: true, order: 5 },
    { id: 'status', labelKey: 'reservations.tableHeaders.status', visible: true, order: 6 },
    { id: 'occasion', labelKey: 'reservations.occasion', visible: false, order: 7 },
    { id: 'details', labelKey: 'reservations.tableHeaders.detailsShort', visible: false, order: 8 },
    { id: 'review', labelKey: 'reservations.tableHeaders.review', visible: false, order: 9 }
  ];
  
  const loadColumnsFromStorage = (): ColumnConfig[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedColumns = JSON.parse(stored) as ColumnConfig[];
        
        // Ensure all default columns exist (in case new ones were added)
        const mergedColumns = [...defaultColumns];
        
        // Update existing columns from storage
        parsedColumns.forEach(storedCol => {
          const index = mergedColumns.findIndex(col => col.id === storedCol.id);
          if (index !== -1) {
            mergedColumns[index] = storedCol;
          }
        });
        
        return mergedColumns;
      }
    } catch (error) {
      console.error('Error loading column configuration from storage:', error);
    }
    
    return defaultColumns;
  };
  
  const saveColumnsToStorage = (columns: ColumnConfig[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
    } catch (error) {
      console.error('Error saving column configuration to storage:', error);
    }
  };
  
  return {
    defaultColumns,
    loadColumnsFromStorage,
    saveColumnsToStorage
  };
};

// Helper components for the table
// ReservationFilters Component
interface ReservationFiltersProps {
  focusedFilter: string;
  setFocusedFilter: (filter: string) => void;
  selectingDay: string;
  setFocusedDate: (focused: boolean) => void;
  setDefaultFilter: () => void;
  isDarkMode: boolean;
}

const ReservationFilters: React.FC<ReservationFiltersProps> = ({ 
  focusedFilter, 
  setFocusedFilter, 
  selectingDay, 
  setFocusedDate, 
  setDefaultFilter,
  isDarkMode 
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-2 mx-1">
      <button onClick={() => setFocusedFilter('FULFILLED')} className={`${isDarkMode ? 'text-white' : ''} ${focusedFilter === 'FULFILLED' ? 'btn-primary' : 'btn'}`}>
        {t('reservations.filters.fulfilled')}
      </button>
      <button onClick={() => setFocusedFilter('SEATED')} className={`${isDarkMode ? 'text-white' : ''} ${focusedFilter === 'SEATED' ? 'btn-primary' : 'btn'}`}>
        {t('reservations.filters.seated')}
      </button>
      <button onClick={() => setFocusedFilter('APPROVED')} className={`${isDarkMode ? 'text-white' : ''} ${focusedFilter === 'APPROVED' ? 'btn-primary' : 'btn'} `}>
        {t('reservations.filters.confirmed')}
      </button>
      <button onClick={() => setFocusedFilter('CANCELED')} className={`${isDarkMode ? 'text-white' : ''} ${focusedFilter === 'CANCELED' ? 'btn-primary' : 'btn'}`}>
        {t('reservations.filters.cancelled')}
      </button>
      <button onClick={() => setFocusedFilter('PENDING')} className={`${isDarkMode ? 'text-white' : ''} ${focusedFilter === 'PENDING' ? 'btn-primary' : 'btn'}`}>
        {t('reservations.filters.pending')}
      </button>
      <button onClick={() => setFocusedFilter('NO_SHOW')} className={`${isDarkMode ? 'text-white' : ''} ${focusedFilter === 'NO_SHOW' ? 'btn-primary' : 'btn'}`}>
        {t('reservations.filters.noShow')}
      </button>
      <button 
        className={`gap-2 flex items-center ${isDarkMode ? 'text-whitetheme' : ''} ${selectingDay === '' ? 'btn' : 'btn-primary'}`} 
        onClick={() => setFocusedDate(true)}
      >
        {t('reservations.filters.date')}
      </button>
      <button onClick={setDefaultFilter} className={`${isDarkMode ? 'text-whitetheme' : ''} ${(focusedFilter === '') && (selectingDay === '') ? 'btn-primary' : 'btn'}`}>
        {t('reservations.filters.all')}
      </button>
    </div>
  )
};

// Helper functions
const statusStyle = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'bg-softbluetheme text-bluetheme'
    case 'APPROVED':
      return 'bg-softgreentheme text-greentheme'
    case 'SEATED':
      return 'bg-softorangetheme text-orangetheme'
    case 'FULFILLED':
      return 'bg-softpurpletheme text-purpletheme'
    case 'NO_SHOW':
      return 'bg-softblushtheme text-blushtheme'
    default:
      return 'bg-softredtheme text-redtheme'
  }
};

// StatusModifier Component
interface StatusModifierProps {
  showStatus: boolean;
  reservation: Reservation;
  idStatusModification: BaseKey;
  statusHandler: (status: string) => void;
  setShowStatus: (show: boolean) => void;
  isDarkMode: boolean;
}

const StatusModifier: React.FC<StatusModifierProps> = ({ 
  showStatus, 
  reservation, 
  idStatusModification, 
  statusHandler, 
  setShowStatus,
  isDarkMode 
}) => {
  const { t } = useTranslation();
  if (!showStatus || reservation.id !== idStatusModification || reservation.status === 'FULFILLED') {
    return null
  }

  return (
    <div className="relative">
      <div className="overlay left-0 top-0 w-full h-full opacity-0" onClick={() => setShowStatus(false)}></div>
      <ul className={`absolute z-[400] p-2 rounded-md shadow-md ${isDarkMode ? 'text-white bg-darkthemeitems' : 'bg-white text-subblack'}`}>
        <li className={`py-1 px-2 text-bluetheme cursor-pointer`} onClick={() => statusHandler('PENDING')}>
          {t('reservations.statusLabels.pending')}
        </li>
        <li className="py-1 px-2 text-greentheme cursor-pointer" onClick={() => statusHandler('APPROVED')}>
          {t('reservations.statusLabels.confirmed')}
        </li>
        <li className="py-1 px-2 text-redtheme cursor-pointer" onClick={() => statusHandler('CANCELED')}>
          {t('reservations.statusLabels.cancelled')}
        </li>
        <li className="py-1 px-2 text-blushtheme cursor-pointer" onClick={() => statusHandler('NO_SHOW')}>
          {t('reservations.statusLabels.noShow')}
        </li>
        <li className="py-1 px-2 text-orangetheme cursor-pointer" onClick={() => statusHandler('SEATED')}>
          {t('reservations.statusLabels.seated')}
        </li>
      </ul>
    </div>
  )
};

// ReservationStatusLabel Component
interface ReservationStatusLabelProps {
  status: string;
  loading: boolean;
}

const ReservationStatusLabel: React.FC<ReservationStatusLabelProps> = ({ status, loading }) => {
  const { t } = useTranslation();
  const statusStyles = statusStyle(status)
  let statusText = ''

  switch (status) {
    case 'APPROVED':
      statusText = t('reservations.statusLabels.confirmed')
      break
    case 'PENDING':
      statusText = t('reservations.statusLabels.pending')
      break
    case 'SEATED':
      statusText = t('reservations.statusLabels.seated')
      break
    case 'FULFILLED':
      statusText = t('reservations.statusLabels.fulfilled')
      break
    case 'NO_SHOW':
      statusText = t('reservations.statusLabels.noShow')
      break
    default:
      statusText = t('reservations.statusLabels.cancelled')
  }

  return (
    <>
    {loading ? <div className={`h-4 w-[100px] rounded-full dark:bg-darkthemeitems bg-gray-300`}></div> 
    : <span className={`${statusStyles} text-center py-[.1em] px-3 rounded-[10px]`}>
        {statusText}
      </span>}
    </>
  )
};

// DetailItem Component
interface DetailItemProps {
  icon?: React.ReactNode;
  label?: string;
  value: string | number | null | undefined;
  isDarkMode: boolean;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value, isDarkMode }) => {
  if (!value) return null;
  
  return (
    <div className={`flex items-center gap-2 text-sm py-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
      {icon && <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {icon}
      </div>}
      {label && <span className="font-medium">{label}:</span>}
      <p>{value}</p>
    </div>
  );
};

// ReservationTableHeader Component
interface ReservationTableHeaderProps {
  isDarkMode: boolean;
  columns: ColumnConfig[];
  children?: React.ReactNode;
}

const ReservationTableHeader: React.FC<ReservationTableHeaderProps> = ({ isDarkMode, columns, children }) => {
  const { t } = useTranslation();
  
  // Sort columns by order
  const sortedColumns = [...columns]
    .filter(col => col.visible)
    .sort((a, b) => a.order - b.order);
  
  return (
    <thead className={isDarkMode ? 'bg-bgdarktheme2 text-white' : 'bg-gray-50 text-gray-500'}>
      <tr>
        {sortedColumns.map(column => (
          <th 
            key={column.id} 
            className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider"
          >
            {t(column.labelKey)}
          </th>
        ))}
        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
          {children}
        </th>
      </tr>
      
    </thead>
  );
};

// ReservationRow Component
interface ReservationRowProps {
  reservation: Reservation;
  EditClient: (id: BaseKey) => void;
  showStatusModification: (id: BaseKey) => void;
  showStatus: boolean;
  idStatusModification: BaseKey;
  statusHandler: (status: string) => void;
  setShowStatus: (show: boolean) => void;
  sendReview: (id: BaseKey) => void;
  isDarkMode: boolean;
  columns: ColumnConfig[];
}

const ReservationRow: React.FC<ReservationRowProps> = ({ 
  reservation, 
  EditClient, 
  showStatusModification,
  showStatus,
  idStatusModification,
  statusHandler,
  setShowStatus,
  sendReview,
  isDarkMode,
  columns
}) => {
  const { t } = useTranslation();
  
  // Sort columns by order
  const sortedColumns = [...columns]
    .filter(col => col.visible)
    .sort((a, b) => a.order - b.order);
  
  const renderCellContent = (columnId: string) => {
    switch (columnId) {
      case 'client':
        return (
          <div className="flex flex-col">
            {/* Name */}
            <div className="flex items-center gap-2 font-medium">
              <User size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              {reservation.full_name}
            </div>
            
            {/* Contact info */}
            <div className="flex flex-col mt-1 gap-x-4 gap-y-1 text-sm lt-md:flex-col">
              <div className="flex items-center gap-1 text-gray-500">
                <Mail size={14} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                <span>{reservation.email}</span>
              </div>
              
              <div className="flex items-center gap-1 text-gray-500">
                <Phone size={14} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                <span>{reservation.phone || 'N/A'}</span>
              </div>
            </div>
            
            {/* Comment if available */}
            {reservation.commenter && (
              <div className="flex items-start gap-1 mt-1 text-sm text-gray-500">
                <MessageSquare size={14} className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span>{reservation.commenter.length > 50 ? `${reservation.commenter.substring(0, 50)}...` : reservation.commenter}</span>
              </div>
            )}
            <div className="text-sm text-gray-500">
              {` # ${reservation.seq_id}`}
            </div>
          </div>
        );
      
      case 'details':
        return (
          <div className="flex flex-wrap mt-1 gap-x-4 gap-y-1 text-sm lt-md:flex-col">
            <div className="flex gap-x-2 flex-wrap">
              <div className="flex items-center gap-1 font-bold">
                <Calendar size={14} />
                <span>{reservation.date}</span>
              </div>

              <div className="flex items-center gap-1 font-bold">
                <Clock size={14} />
                <span>{reservation.time.slice(0, 5)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 font-bold">
              <Users size={14} />
              <span>{reservation.number_of_guests}</span>
            </div>
          </div>
        );
      
      case 'tables':
        return (
          (reservation.tables && reservation.tables.length > 0) && (
            <div className="flex gap-1 text-sm mt-1 font-bold ">
              <span>{reservation.tables?.map(table => table.name).join(', ')}</span>
            </div>
          )
        );
      
      case 'internalNote':
        return (
          reservation.internal_note && (
            <DetailItem
              icon={<Info size={16} />}
              value={reservation.internal_note}
              isDarkMode={isDarkMode}
            />
          )
        );
      
      case 'status':
        return (
          <>
            <ReservationStatusLabel status={reservation.status} loading={reservation.loading as boolean} />
            
            <StatusModifier
              showStatus={showStatus}
              reservation={reservation}
              idStatusModification={idStatusModification}
              statusHandler={statusHandler}
              setShowStatus={setShowStatus}
              isDarkMode={isDarkMode}
            />
          </>
        );
      
      case 'review':
        return (
          <>
            {reservation.status !== 'SEATED' ? '' : 
              <span onClick={() => {sendReview(reservation.id)}} 
                    className="cursor-pointer text-greentheme items-center flex justify-center w-7 h-7 rounded-md p-1 hover:bg-softgreentheme">
                <Send size={20} />
              </span>
            }
          </>
        );
        
      case 'date':
        return (
          <div className="flex items-center gap-1 font-medium">
            <Calendar size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            {reservation.date}
          </div>
        );
        
      case 'time':
        return (
          <div className="flex items-center gap-1 font-medium">
            <Clock size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            {reservation.time.slice(0, 5)}
          </div>
        );
        
      case 'guests':
        return (
          <div className="flex items-center gap-1 font-medium">
            <Users size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            {reservation.number_of_guests}
          </div>
        );
      
      case 'occasion':
        return (
          <div className="flex justify-start items-center gap-1">
            {reservation?.occasion &&
              <>
              {reservation.occasion?.name}
              </>
            }
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <tr key={reservation.id} className="opacity-80 hover:opacity-100">
      {sortedColumns.map((column, index) => {
        const cellClickHandler = column.id === 'status' 
          ? () => showStatusModification(reservation.id)
          : column.id === 'review' 
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            ? () => {} // No click handler for review column
            : () => { if (reservation.id) EditClient(reservation.id); };
            
        return (
          <td 
            key={column.id} 
            className={`px-3 py-2 ${column.id === 'client'?'max-w-[180px]':''} ${['date', 'time', 'guests'].includes(column.id)?'whitespace-nowrap':''} ${column.id === 'review' ? 'whitespace-nowrap flex justify-center items-center' : column.id === 'status' ? 'whitespace-nowrap' : 'max-w-100'}`}
            onClick={cellClickHandler}
          >
            {renderCellContent(column.id)}
          </td>
        );
      })}
      <td className={`px-3 py-2 max-w-40 `}>

      </td>
    </tr>
  );
};

// LoadingRow Component
interface LoadingRowProps {
  isDarkMode: boolean;
  columns: ColumnConfig[];
}

const LoadingRow: React.FC<LoadingRowProps> = ({ isDarkMode, columns }) => {
  // Sort columns by order
  const sortedColumns = [...columns]
    .filter(col => col.visible)
    .sort((a, b) => a.order - b.order);
    
  const renderLoadingCell = (columnId: string) => {
    switch (columnId) {
      case 'client':
        return (
          <div className="space-y-2">
            <div className={`h-5 rounded w-1/3 ${isDarkMode ? 'bg-darkthemeitems' : 'bg-gray-300'}`}></div>
            <div className={`h-4 rounded w-2/3 ${isDarkMode ? 'bg-darkthemeitems' : 'bg-gray-300'}`}></div>
            <div className={`h-4 rounded w-1/2 ${isDarkMode ? 'bg-darkthemeitems' : 'bg-gray-300'}`}></div>
          </div>
        );
      case 'review':
        return (
          <div className={`h-8 w-8 rounded-full mx-auto ${isDarkMode ? 'bg-darkthemeitems' : 'bg-gray-300'}`}></div>
        );
      default:
        return (
          <div className={`h-6 rounded-full w-24 ${isDarkMode ? 'bg-darkthemeitems' : 'bg-gray-300'}`}></div>
        );
    }
  };
  
  return (
    <tr>
      {sortedColumns.map(column => (
        <td key={column.id} className="px-6 py-4 whitespace-nowrap">
          {renderLoadingCell(column.id)}
        </td>
      ))}
    </tr>
  );
};

// ReservationTable Component
interface ReservationTableProps {
  isLoading: boolean;
  filteredReservations: Reservation[];
  EditClient: (id: BaseKey) => void;
  showStatusModification: (id: BaseKey) => void;
  showStatus: boolean;
  idStatusModification: BaseKey;
  statusHandler: (status: string) => void;
  setShowStatus: (show: boolean) => void;
  setShowColumnCustomization: (show: boolean) => void;
  sendReview: (id: BaseKey) => void;
  isDarkMode: boolean;
  columns: ColumnConfig[];
}

const ReservationTable: React.FC<ReservationTableProps> = ({ 
  isLoading, 
  filteredReservations, 
  EditClient, 
  showStatusModification,
  showStatus,
  idStatusModification,
  statusHandler,
  setShowStatus,
  sendReview,
  isDarkMode,
  columns,
  setShowColumnCustomization
}) => {
  return (
    <table className={`max-w-full overflow-scroll divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
      <ReservationTableHeader isDarkMode={isDarkMode} columns={columns} >
        <button
          onClick={() => setShowColumnCustomization(true)}
          className=" dark:text-whitetheme btn-outline flex items-center gap-1"
        >
          <Pencil size={16} className='stroke-gray-600' />
        </button>
      </ReservationTableHeader>
      <tbody className={`${isDarkMode ? 'bg-bgdarktheme divide-y divide-gray-800' : 'bg-white divide-y divide-gray-200'}`}>
        {filteredReservations.length === 0 && !isLoading ? (
          <tr>
            <td colSpan={columns.length + 1} className="text-center py-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                There is no reservation to show
              </p>
            </td>
          </tr>
        ) : null}
        {isLoading ? (
          [...Array(10)].map((_, index) => (
            <LoadingRow key={index} isDarkMode={isDarkMode} columns={columns} />
          ))
        ) : (
          filteredReservations
            .sort((a, b) => (a.id < b.id ? 1 : -1))
            .map((reservation) => (
              <ReservationRow
                key={reservation.id}
                reservation={reservation}
                EditClient={EditClient}
                showStatusModification={showStatusModification}
                showStatus={showStatus}
                idStatusModification={idStatusModification}
                statusHandler={statusHandler}
                setShowStatus={setShowStatus}
                sendReview={sendReview}
                isDarkMode={isDarkMode}
                columns={columns}
              />
            ))
        )}
      </tbody>
    </table>
  );
};

// DateSelectionModal Component
interface DateSelectionModalProps {
  focusedDate: boolean;
  setFocusedDate: (focused: boolean) => void;
  handleDateClick: (range: { start: Date, end: Date }) => void;
  isDarkMode: boolean;
}

const DateSelectionModal: React.FC<DateSelectionModalProps> = ({ 
  focusedDate, 
  setFocusedDate, 
  handleDateClick, 
  isDarkMode 
}) => {
  if (!focusedDate) return null;
  
  return (
    <div>
      <div className="overlay" onClick={() => setFocusedDate(false)}></div>
      <div className={`popup sm:w-[50%] lg:w-[30%] xl:[25%] lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0 ${isDarkMode ? 'bg-bgdarktheme' : 'bg-white'}`}>
        <IntervalCalendar onRangeSelect={handleDateClick} onClose={()=>setFocusedDate(false)} />
      </div>
    </div>
  );
};

// Main ReservationsPage Component
const ReservationsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Reservations | Tabla'
  }, []);

  // Dark mode context
  const { darkMode } = useDarkContext();
  const isDarkMode = darkMode;
  
  const { t } = useTranslation();
  
  // Permission check
  const { data: changeRes } = useCan({ resource: 'reservation', action: 'change' });
  
  // Column configuration
  const { loadColumnsFromStorage, saveColumnsToStorage } = useColumnConfiguration();
  const [columns, setColumns] = useState<ColumnConfig[]>(loadColumnsFromStorage());
  const [showColumnCustomization, setShowColumnCustomization] = useState<boolean>(false);
  
  // States
  const [showProcess, setShowProcess] = useState<boolean>(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });
  const [focusedFilter, setFocusedFilter] = useState<string>('');
  const [searchKeyWord, setSearchKeyWord] = useState<string>('');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [reservationAPIInfo, setReservationAPIInfo] = useState<ReservationType>();
  const [tables, setTables] = useState<BaseRecord[]>([]);
  const [floors, setFloors] = useState<BaseRecord[]>([]);
  const [selectedClient, setSelectedClient] = useState<Reservation | null>(null);
  const [hasTable, setHasTable] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [selectingDay, setSelectingDay] = useState<string>("");
  const [focusedDate, setFocusedDate] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Reservation[]>(reservations);
  const [searched, setSearched] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<BaseKey | undefined>(undefined);
  const [toBeReviewedRes, setToBeReviewedRes] = useState<BaseKey>();
  const [showStatus, setShowStatus] = useState<boolean>(false);
  const [idStatusModification, setIdStatusModification] = useState<BaseKey>('');
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>(reservations);
  const [floorId, setFloorId] = useState<BaseKey>();
  const [showAddReservation, setShowAddReservation] = useState<boolean>(false);
  
  // Reservation progress data
  const [reservationProgressData, setReservationProgressData] = useState<DataTypes>({
    reserveDate: selectedClient?.date || '',
    time: selectedClient?.time || '',
    guests: selectedClient?.guests || 0
  });
  
  // Save column preferences to localStorage when they change
  useEffect(() => {
    saveColumnsToStorage(columns);
  }, [columns]);
  
  // Data fetching
  const { data, isLoading, error, refetch: refetchReservations } = useList({
    resource: "api/v1/bo/reservations/",
    filters: [
      { field: "page", operator: "eq", value: page },
      { field: "page_size", operator: "eq", value: 20 },
      { field: "status", operator: "eq", value: focusedFilter },
      { field: "date_", operator: "gte", value: selectedDateRange.start ? format(selectedDateRange.start, 'yyyy-MM-dd') : '' },
      { field: "date_", operator: "lte", value: selectedDateRange.end ? format(selectedDateRange.end, 'yyyy-MM-dd') : '' },
      { field: "search", operator: "eq", value: searchKeyWord },
      { field: "ordering", operator: "eq", value: "-id" }
    ],
    queryOptions: {
      onSuccess: (data) => {
        setReservationAPIInfo(data.data as unknown as ReservationType);
      },
      onError: (error) => {
        console.log('Error fetching data:', error);
      }
    }
  });

  // Fetch floors and tables
  const { data: floorsData } = useList({
    resource: 'api/v1/bo/floors/',
  });

  const { data: tablesData } = useList({
    resource: 'api/v1/bo/tables/',
  });

  // Mutations
  const { mutate: upDateReservation } = useUpdate({
    resource: `api/v1/bo/reservations`,
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });

  const { mutate: createReview } = useCreate({
    resource: `api/v1/bo/reservations/${toBeReviewedRes}/send_review_link/`,
    mutationOptions: {
      retry: 3
    },
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });

  // Config for export
  const { reservations: reservationsExportConfig } = useExportConfig();

  // Effect to update reservations from API
  useEffect(() => {
    if (reservationAPIInfo) {
      setReservations(reservationAPIInfo.results as Reservation[]);
      setCount(reservationAPIInfo.count);
    }
  }, [reservationAPIInfo]);

  // Effect to set tables and check if reservation has table
  useEffect(() => {
    if (reservationAPIInfo) {
      setReservations(reservationAPIInfo.results as Reservation[]);
      reservationAPIInfo.results.forEach((reserve: Reservation) => {
        if (reserve.tables && reserve.tables.length > 0) {
          reserve.tableSet = reserve.tables[0].id as number;
          setHasTable(true);
        } else {
          reserve.tableSet = 0;
          setHasTable(false);
        }
      });
    }
  }, []);

  // Effect to update tables and floors from API
  useEffect(() => {
    if (tablesData?.data) {
      setTables(tablesData.data);
    }

    if (floorsData?.data) {
      setFloors(floorsData.data);
    }
  }, [floorsData, tablesData]);

  // Effect to update search results
  useEffect(() => {
    if (!searched) {
      setSearchResults(reservations);
    }
  }, [reservations, searched]);

  // Effect to update filtered reservations
  useEffect(() => {
    setFilteredReservations(reservations);
  }, [reservations]);

  // Effect to update date range display
  useEffect(() => {
    if (selectedDateRange.start && selectedDateRange.end) {
      const formattedStart = format(selectedDateRange.start, 'dd/MM/yyyy');
      const formattedEnd = format(selectedDateRange.end, 'dd/MM/yyyy');
      setSelectingDay(`${formattedStart} - ${formattedEnd}`);
    } else if (selectedDateRange.start) {
      setSelectingDay(format(selectedDateRange.start, 'dd/MM/yyyy'));
    } else {
      setSelectingDay('');
    }
  }, [selectedDateRange]);

  // Effect to update reservation progress data when client changes
  useEffect(() => {
    if (selectedClient) {
      setReservationProgressData({
        reserveDate: selectedClient.date,
        time: selectedClient.time.slice(0, 5),
        guests: parseInt(selectedClient.number_of_guests)
      });
    }
  }, [selectedClient]);

  // Handle column preferences update
  const handleSaveColumns = (updatedColumns: ColumnConfig[]) => {
    setColumns(updatedColumns);
  };

  // Handler functions
  const handleDateClick = (range: { start: Date, end: Date }): void => {
    setSelectedDateRange(range);
  };

  const setDefaultFilter = (): void => {
    setFocusedFilter('');
    setSelectingDay('');
    setSelectedDateRange({ start: null, end: null });
  };

  const searchFilter = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyWord(keyword);
  };

  const EditClient = (id: BaseKey): void => {
    if (!changeRes?.can) return;

    setEditingClient(id);
    if (!id) return;
    const client = reservations.find(r => r.id === id);
    if (client) {
      setSelectedClient(client);
      setShowModal(true);
    }
  };

  const upDateHandler = (updatedReservation: Reservation): void => {
    upDateReservation({
      id: `${editingClient}/`,
      values: {
        full_name: updatedReservation.full_name,
        email: updatedReservation.email,
        phone: updatedReservation.phone,
        table_name: updatedReservation.table_name,
        source: updatedReservation.source,
        status: updatedReservation.status,
        internal_note: updatedReservation.internal_note,
        occasion: updatedReservation.occasion?.id || updatedReservation.occasion,
        date: reservationProgressData.reserveDate,
        time: `${reservationProgressData.time}:00`,
        tables: updatedReservation.tables?.map(table => Number(table.id)),
        number_of_guests: reservationProgressData.guests,
        commenter: updatedReservation.commenter,
      },
    },{
      onSuccess(){
        refetchReservations();
      }
    });
    
    setShowModal(false);
  };

  const showStatusModification = (id: BaseKey): void => {
    if (!changeRes?.can) return;
    
    if (!id) return;
    setIdStatusModification(id);
    setShowStatus(!showStatus);
  };

  const statusHandler = (status: string): void => {
    setReservations(reservations.map(r => 
      r.id === idStatusModification ? {...r, loading: true} : r
    ));

    upDateReservation({
      id: `${idStatusModification}/`,
      values: {
        status: status
      }
    },{
      onSuccess(){
        setReservations(reservations.map(r => 
          r.id === idStatusModification ? {...r, status: status as ReservationStatus, loading: false} : r
        ));
      },
      onError(){
        setReservations(reservations.map(r => 
          r.id === idStatusModification ? {...r, loading: false} : r
        ));
      }
    });
  };

  const statusHandlerFulfilled = (id: BaseKey): void => {
    setReservations(reservations.map(r => 
      r.id === id ? {...r, status: 'FULFILLED'} : r
    ));

    upDateReservation({
      id: `${id}/`,
      values: {
        status: 'FULFILLED'
      }
    });
  };

  const sendReview = (id: BaseKey): void => {
    setReservations(reservations.filter(r => r.id !== id));
    
    createReview({
      values: {
        reservations
      },
    });
    setToBeReviewedRes(id);
  };

  return (
    <div className="relative">
      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          columns={reservationsExportConfig.columns}
          customFields={reservationsExportConfig.customFields}
          onExport={(format, selectedColumns, customFields) => {
            console.log(format, selectedColumns, customFields);
            setShowExportModal(false);
          }}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Column Customization Modal */}
      <ColumnCustomizationModal
        isOpen={showColumnCustomization}
        onClose={() => setShowColumnCustomization(false)}
        columns={columns}
        onSave={handleSaveColumns}
        isDarkMode={isDarkMode}
      />

      {/* Reservation Process Modal */}
      {showProcess && (
        <ReservationProcess 
          onClick={() => {setShowProcess(false)}} 
          getDateTime={(data) => {setReservationProgressData(data)}}
        />
      )}

      {/* Add Reservation Modal */}
      {showAddReservation && (
        <ReservationModal 
          onClick={() => {setShowAddReservation(false)}} 
          onSubmit={(data) => {refetchReservations()}} 
        />
      )} 

      {/* Edit Reservation Modal using the standalone component */}
      {showModal && (
        <EditReservationModal
          showModal={showModal}
          reservation={selectedClient}
          setShowModal={setShowModal}
          setShowProcess={setShowProcess}
          reservationProgressData={reservationProgressData}
          statusHandler={statusHandler}
          upDateHandler={upDateHandler}
          hasTable={hasTable}
          setHasTable={setHasTable}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Page Header */}
      <div className='flex justify-between mb-4 lt-sm:flex-col lt-sm:gap-2'>
        <h1 className={`text-3xl text-blacktheme font-[700] ${isDarkMode ? 'text-whitetheme' : 'text-blacktheme'}`}>
          {t('reservations.title')}
        </h1>
        <div className="flex gap-4 justify-end">
          <CanAccess action="add" resource="reservation">
            <button className='btn-primary' onClick={() => {setShowAddReservation(true)}}>
              {t('reservations.buttons.addReservation')}
            </button>
          </CanAccess>
          <button onClick={() => setShowExportModal(true)} className={`${isDarkMode ? 'text-whitetheme' : ''} btn-primary`}>
            export
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex lt-xl:flex-col lt-xl:gap-2 justify-between">
        <div className="md-only:w-[50%] lg-only:w-[50%]" >
          <SearchBar SearchHandler={searchFilter} />
        </div>
        <ReservationFilters
          focusedFilter={focusedFilter}
          setFocusedFilter={setFocusedFilter}
          selectingDay={selectingDay}
          setFocusedDate={setFocusedDate}
          setDefaultFilter={setDefaultFilter}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Reservations Table */}
      <div className='overflow-x-auto max-w-full'>
        <ReservationTable
          isLoading={isLoading}
          filteredReservations={filteredReservations}
          EditClient={EditClient}
          showStatusModification={showStatusModification}
          showStatus={showStatus}
          idStatusModification={idStatusModification}
          statusHandler={statusHandler}
          setShowStatus={setShowStatus}
          sendReview={sendReview}
          isDarkMode={isDarkMode}
          columns={columns}
          setShowColumnCustomization={setShowColumnCustomization}
        />
        <Pagination setPage={(page) => {setPage(page)}} size={20} count={count} />
      </div>

      {/* Date Selection Modal */}
      <DateSelectionModal
        focusedDate={focusedDate}
        setFocusedDate={setFocusedDate}
        handleDateClick={handleDateClick}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default ReservationsPage;