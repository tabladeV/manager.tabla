import { useEffect, useState } from "react"
import { format } from 'date-fns'
import SearchBar from "../../components/header/SearchBar"
import IntervalCalendar from "../../components/Calendar/IntervalCalendar"
import { useTranslation } from 'react-i18next'
import ReservationModal from "../../components/reservation/ReservationModal"
import { BaseKey, BaseRecord, CanAccess, useCan, useCreate, useList, useUpdate } from "@refinedev/core"
import ReservationProcess from "../../components/reservation/ReservationProcess"
import { 
  Send, User, Mail, Phone, MessageSquare, 
  Calendar, Clock, Users, LayoutGrid, 
  ChevronDown, ChevronUp, Info, Edit
} from "lucide-react"
import Pagination from "../../components/reservation/Pagination"
import ExportModal from "../../components/common/ExportModal"
import useExportConfig from "../../components/common/config/exportConfig"
import EditReservationModal from "../../components/reservation/EditReservationModal"
import { ReservationSource, ReservationStatus } from "../../components/common/types/Reservation"
import { Occasion } from "../../components/settings/Occasions"

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

interface ReservationType {
  results: Reservation[];
  count: number;
}

interface ReservationFiltersProps {
  focusedFilter: string;
  setFocusedFilter: (filter: string) => void;
  selectingDay: string;
  setFocusedDate: (focused: boolean) => void;
  setDefaultFilter: () => void;
  isDarkMode: boolean;
}

interface ReservationTableHeaderProps {
  isDarkMode: boolean;
}

interface StatusModifierProps {
  showStatus: boolean;
  reservation: Reservation;
  idStatusModification: BaseKey;
  statusHandler: (status: string) => void;
  setShowStatus: (show: boolean) => void;
  isDarkMode: boolean;
}

interface ReservationStatusLabelProps {
  status: string;
  loading: boolean;
}

interface DetailItemProps {
  icon?: React.ReactNode;
  label?: string;
  value: string | number | null | undefined;
  isDarkMode: boolean;
}

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
}

interface LoadingRowProps {
  isDarkMode: boolean;
}

interface ReservationTableProps {
  isLoading: boolean;
  filteredReservations: Reservation[];
  EditClient: (id: BaseKey) => void;
  showStatusModification: (id: BaseKey) => void;
  showStatus: boolean;
  idStatusModification: BaseKey;
  statusHandler: (status: string) => void;
  setShowStatus: (show: boolean) => void;
  sendReview: (id: BaseKey) => void;
  isDarkMode: boolean;
}

interface DateSelectionModalProps {
  focusedDate: boolean;
  setFocusedDate: (focused: boolean) => void;
  handleDateClick: (range: { start: Date, end: Date }) => void;
  isDarkMode: boolean;
}

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
    // case 'RESCHEDULED':
    //   return 'bg-softbrowntheme text-browntheme'
    default:
      return 'bg-softredtheme text-redtheme'
  }
}

// ReservationFilters Component
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
      {/* <button onClick={() => setFocusedFilter('RESCHEDULED')} className={`${isDarkMode ? 'text-white' : ''} ${focusedFilter === 'RESCHEDULED' ? 'btn-primary' : 'btn'}`}>
        {t('reservations.filters.rescheduled')}
      </button> */}
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
}



// StatusModifier Component
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
        {/* <li className="py-1 px-2 text-browntheme cursor-pointer" onClick={() => statusHandler('RESCHEDULED')}>
          {t('reservations.statusLabels.rescheduled')}
        </li> */}
        <li className="py-1 px-2 text-orangetheme cursor-pointer" onClick={() => statusHandler('SEATED')}>
          {t('reservations.statusLabels.seated')}
        </li>
      </ul>
    </div>
  )
}

// ReservationStatusLabel Component
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
    // case 'RESCHEDULED':
    //   statusText = t('reservations.statusLabels.rescheduled')
      break
    default:
      statusText = t('reservations.statusLabels.cancelled')
  }

  return (
    <>
    {loading?<div className={`h-4 w-[100px] rounded-full dark:bg-darkthemeitems bg-gray-300`}></div>:<span className={`${statusStyles} text-center py-[.1em] px-3 rounded-[10px]`}>
      {statusText}
    </span>}
    </>
  )
}

// DetailItem Component for each piece of information in the expanded details
const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value, isDarkMode }) => {
  if (!value) return null;
  
  return (
    <div className={`flex items-center gap-2 text-sm py-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
      {icon && <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {icon}
      </div>}
      {label && <span className="font-medium">{label}:</span>
      }
      <p>{value}</p>
    </div>
  );
};

// ReservationTableHeader Component
const ReservationTableHeader: React.FC<ReservationTableHeaderProps> = ({ isDarkMode }) => {
  const { t } = useTranslation();
  return (
    <thead className={isDarkMode ? 'bg-bgdarktheme2 text-white' : 'bg-gray-50 text-gray-500'}>
      <tr>
        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
          {t('clients.title')}
        </th>
        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
          {t('reservations.tableHeaders.detailsShort')}
        </th>
        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.tables')}</th>
        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.edit.informations.internalNote')}</th>
        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.status')}</th>
        <th className="w-4 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.review')}</th>
      </tr>
    </thead>
  )
}

// ReservationRow Component
const ReservationRow: React.FC<ReservationRowProps> = ({ 
  reservation, 
  EditClient, 
  showStatusModification,
  showStatus,
  idStatusModification,
  statusHandler,
  setShowStatus,
  sendReview,
  isDarkMode
}) => {
  const { t } = useTranslation();
  return (
    <tr key={reservation.id} className="opacity-80 hover:opacity-100">
      <td className="px-3 py-2 cursor-pointer" onClick={() => { if (reservation.id) EditClient(reservation.id); }}>
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
      </td>
      
      <td className="px-3 py-2 max-w-40" onClick={() => EditClient(reservation.id)}>
        {/* Reservation details */}
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
            <span>{reservation.number_of_guests} guests</span>
          </div>
        </div>
      </td>
      <td className="px-3 py-2 max-w-40" onClick={() => EditClient(reservation.id)}>
      {(reservation.tables && reservation.tables.length > 0) && (
          <div className="flex gap-1 text-sm mt-1 font-bold ">
            <span>{reservation.tables?.map(table => table.name).join(', ')}</span>
          </div>
        )}
      </td>
      <td className="px-3 py-2 max-w-40" onClick={() => EditClient(reservation.id)}>
        {reservation.internal_note && (
          <DetailItem
            icon={<Info size={16} />}
            // label={t('reservations.edit.informations.internalNote')}
            value={reservation.internal_note}
            isDarkMode={isDarkMode}
          />
        )}
      </td>
      <td className="px-3 py-2 whitespace-nowrap" onClick={() => showStatusModification(reservation.id)}>
        <ReservationStatusLabel status={reservation.status} loading={reservation.loading as boolean} />
        
        <StatusModifier
          showStatus={showStatus}
          reservation={reservation}
          idStatusModification={idStatusModification}
          statusHandler={statusHandler}
          setShowStatus={setShowStatus}
          isDarkMode={isDarkMode}
        />
      </td>
      <td className="whitespace-nowrap flex justify-center items-center">
        {reservation.status !== 'SEATED' ? '' : 
          <span onClick={() => {sendReview(reservation.id)}} 
                className="cursor-pointer text-greentheme items-center flex justify-center w-7 h-7 rounded-md p-1 hover:bg-softgreentheme">
            <Send size={20} />
          </span>
        }
      </td>
    </tr>
  )
}

// LoadingRow Component (adjusted for new table structure)
const LoadingRow: React.FC<LoadingRowProps> = ({ isDarkMode }) => {
  return (
    <tr>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className={`h-5 rounded w-1/3 ${isDarkMode ? 'bg-darkthemeitems' : 'bg-gray-300'}`}></div>
          <div className={`h-4 rounded w-2/3 ${isDarkMode ? 'bg-darkthemeitems' : 'bg-gray-300'}`}></div>
          <div className={`h-4 rounded w-1/2 ${isDarkMode ? 'bg-darkthemeitems' : 'bg-gray-300'}`}></div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`h-6 rounded-full w-24 ${isDarkMode ? 'bg-darkthemeitems' : 'bg-gray-300'}`}></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`h-6 rounded-full w-24 ${isDarkMode ? 'bg-darkthemeitems' : 'bg-gray-300'}`}></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`h-6 rounded-full w-24 ${isDarkMode ? 'bg-darkthemeitems' : 'bg-gray-300'}`}></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`h-6 rounded-full w-24 ${isDarkMode ? 'bg-darkthemeitems' : 'bg-gray-300'}`}></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`h-8 w-8 rounded-full mx-auto ${isDarkMode ? 'bg-darkthemeitems' : 'bg-gray-300'}`}></div>
      </td>
    </tr>
  )
}

// ReservationTable Component
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
  isDarkMode
}) => {
  return (
    <table className={`max-w-full overflow-scroll divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
      <ReservationTableHeader isDarkMode={isDarkMode} />
      <tbody className={`${isDarkMode ? 'bg-bgdarktheme divide-y divide-gray-800' : 'bg-white divide-y divide-gray-200'}`}>
        {isLoading ? (
          [...Array(10)].map((_, index) => (
            <LoadingRow key={index} isDarkMode={isDarkMode} />
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
              />
            ))
        )}
      </tbody>
    </table>
  )
}

// DateSelectionModal Component
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
      <div className={`popup lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0 ${isDarkMode ? 'bg-bgdarktheme' : 'bg-white'}`}>
        <IntervalCalendar onRangeSelect={handleDateClick} />
      </div>
    </div>
  );
};

// Main ReservationsPage Component
const ReservationsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Reservations | Tabla'
  }, [])

  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  const { t } = useTranslation();
  
  // Permission check
  const { data: changeRes } = useCan({ resource: 'reservation', action: 'change' })
  
  // States
  const [showProcess, setShowProcess] = useState<boolean>(false)
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null })
  const [focusedFilter, setFocusedFilter] = useState<string>('')
  const [searchKeyWord, setSearchKeyWord] = useState<string>('')
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [count, setCount] = useState<number>(0)
  const [page, setPage] = useState<number>(1)
  const [reservationAPIInfo, setReservationAPIInfo] = useState<ReservationType>()
  const [tables, setTables] = useState<BaseRecord[]>([])
  const [floors, setFloors] = useState<BaseRecord[]>([])
  const [selectedClient, setSelectedClient] = useState<Reservation | null>(null)
  const [hasTable, setHasTable] = useState<boolean>(false)
  const [showExportModal, setShowExportModal] = useState<boolean>(false)
  const [selectingDay, setSelectingDay] = useState<string>("")
  const [focusedDate, setFocusedDate] = useState<boolean>(false)
  const [searchResults, setSearchResults] = useState<Reservation[]>(reservations)
  const [searched, setSearched] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [editingClient, setEditingClient] = useState<BaseKey | undefined>(undefined)
  const [toBeReviewedRes, setToBeReviewedRes] = useState<BaseKey>()
  const [showStatus, setShowStatus] = useState<boolean>(false)
  const [idStatusModification, setIdStatusModification] = useState<BaseKey>('');
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>(reservations)
  const [floorId, setFloorId] = useState<BaseKey>()
  const [showAddReservation, setShowAddReservation] = useState<boolean>(false);
  
  // Reservation progress data
  const [reservationProgressData, setReservationProgressData] = useState<DataTypes>({
    reserveDate: selectedClient?.date || '',
    time: selectedClient?.time || '',
    guests: selectedClient?.guests || 0
  });
  
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
      <div className='mt-4 overflow-x-auto max-w-full'>
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
  )
}

export default ReservationsPage