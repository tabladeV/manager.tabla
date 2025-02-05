import { useEffect, useState } from "react"
import { format, set } from 'date-fns'
import SearchBar from "../../components/header/SearchBar"
import IntervalCalendar from "../../components/Calendar/IntervalCalendar"

import 'i18next'

import { useTranslation } from 'react-i18next';
import ReservationModal from "../../components/reservation/ReservationModal"
import { BaseKey, BaseRecord, useCreate, useList, useUpdate } from "@refinedev/core"
import ReservationProcess from "../../components/reservation/ReservationProcess"

interface Reservation extends BaseRecord {
  id: BaseKey;
  email: string;
  full_name: string;
  date: string;
  time: string;
  source: string;
  number_of_guests: string;
  status: string;
  commenter?: string;
  review?: boolean;
}

const ReservationsPage = () => {


  interface dataTypes {
    reserveDate: string,
    time: string,
    guests: number
  }
  const [showProcess, setShowProcess] = useState(false)
  

  const { t } = useTranslation();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const { data, isLoading, error } = useList<Reservation>({
    resource: "api/v1/bo/reservations",
    meta: {
      headers: {
        "X-Restaurant-ID": 1,
      },
    },
  });

  console.log(data)
  const { mutate, isLoading: postLoading, error: postError } = useCreate();

  // const handleCreate = () => {
    
  //   mutate(
  //     {
  //       resource: "api/v1/bo/reservations", // API resource
  //       values: {
  //         title: "My New Post",
  //         content: "This is the content of the new post.",
  //       },
  //       meta: {
  //         headers: {
  //           "X-Restaurant-ID": 1,
  //         },
  //       },
  //     },
  //     {
  //       onSuccess: (data) => {
  //         console.log("Post created successfully:", data);
  //       },
  //       onError: (error) => {
  //         console.error("Error creating post:", error);
  //       },
  //     }
  //   );
  // };
  const [selectedClient, setSelectedClient] = useState<Reservation | null>(null)

  const [reservationProgressData, setReservationProgressData] = useState({
    reserveDate: selectedClient?.date,
    time: selectedClient?.time,
    guests: selectedClient?.guests
  })


  
  useEffect(() => {
    if (data?.data) {
      setReservations(data.data as Reservation[]);
    }
  }, [data]);

  

  function statusStyle(status: string) {
    if (status === 'PENDING') {
      return 'bg-softbluetheme text-bluetheme'
    } else if (status === 'APPROVED') {
      return 'bg-softgreentheme text-greentheme'
    } else {
      return 'bg-softredtheme text-redtheme'
    }
  }

  const [selectingDay, setSelectingDay] = useState("")
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null })
  const [focusedFilter, setFocusedFilter] = useState('')
  const [focusedDate, setFocusedDate] = useState(false)
  const [searchResults, setSearchResults] = useState(reservations)

  useEffect(()=>{
    setSearchResults(reservations)
  },[reservations])

  const handleDateClick = (range: { start: Date, end: Date }) => {
    setSelectedDateRange(range)
  }

  const setDefaultFilter = () => {
    setFocusedFilter('')
    setSelectingDay('')
    setSelectedDateRange({ start: null, end: null })
    
    
  }

  useEffect(() => {
    if (selectedDateRange.start && selectedDateRange.end) {
      const formattedStart = format(selectedDateRange.start, 'dd/MM/yyyy')
      const formattedEnd = format(selectedDateRange.end, 'dd/MM/yyyy')
      setSelectingDay(`${formattedStart} - ${formattedEnd}`)
    } else if (selectedDateRange.start) {
      setSelectingDay(format(selectedDateRange.start, 'dd/MM/yyyy'))
    } else {
      setSelectingDay('')
    }
  }, [selectedDateRange])

  const searchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value.toLowerCase();
    
    if (keyword === "") {
      setSearchResults(reservations);
    } else {
      const results = reservations.filter((item) =>
        item.full_name.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword)
      );
      setSearchResults(results);
    }
  };

  const [showModal, setShowModal] = useState(false)

  const [editingClient, setEditingClient] = useState<BaseKey | undefined>(undefined)

  const { mutate: upDateReservation } = useUpdate({
    resource: `api/v1/bo/reservations`,
  });

  

  const upDateHandler = () => {
    
    if (selectedClient) {

      console.log(selectedClient)
      upDateReservation({
        id: editingClient+'/',
        values: {
          full_name: selectedClient.full_name,
          email: selectedClient.email,
          table_name: selectedClient.table_name,
          source: selectedClient.source,
          status: selectedClient.status,
          date: reservationProgressData.reserveDate,
          time: reservationProgressData.time+ ':00',
          number_of_guests: reservationProgressData.guests ,
          commenter: selectedClient.commenter,
        },
        meta: {
          headers: {
            "X-Restaurant-ID": 1,
          },
        },
        
      });
      window.location.reload();
      
    }
  }

  useEffect(() => {
    if (selectedClient) {
      setReservationProgressData({
        reserveDate: selectedClient.date,
        time: selectedClient.time.slice(0,5),
        guests: parseInt(selectedClient.number_of_guests)
      })
    }
  }, [selectedClient])

  const EditClient = (id: BaseKey | undefined) => {
    setEditingClient(id);
    if (!id) return;
    const client = reservations.find(r => r.id === id);
    if (client) {
      setSelectedClient(client);
      setShowModal(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (selectedClient) {
      setSelectedClient({
        ...selectedClient,
        [e.target.name]: e.target.value
      })
    }
  }



  const saveChanges = () => {
    if (selectedClient) {
      setReservations(reservations.map(r => 
        r.id === selectedClient.id ? selectedClient : r
      ))
      setSearchResults(searchResults.map(r => 
        r.id === selectedClient.id ? selectedClient : r
      ))
      setShowModal(false)
      mutate({
        resource: "api/v1/bo/reservations", // API resource
        values: selectedClient,
        meta: {
          headers: {
            "X-Restaurant-ID": 1,
          },
        },
      })
    }
  }

  const [filteredReservations, setFilteredReservations] = useState(reservations)
  
  useEffect(() => {
    setFilteredReservations(reservations)
  },[reservations])

  useEffect(() => {

    setFilteredReservations(searchResults.filter(reservation => {
      if (focusedFilter !== '' && reservation.status !== focusedFilter) return false
      if (selectedDateRange.start && selectedDateRange.end) {
        const reservationDate = new Date(reservation.date.split('/').reverse().join('-'))
        return reservationDate >= selectedDateRange.start && reservationDate <= selectedDateRange.end
      }
      return true
    }))
  }, [searchResults, focusedFilter, selectedDateRange])


  const reservationOrigin = (origin: string) => {
    if (origin === 'MARKETPLACE') {
      return (
        <div className={`flex p-1 rounded-md flex-col items-center ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}>
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 7.5H5.5M5.5 7.5V6M5.5 7.5H8M8 7.5V6M8 7.5H10.5M10.5 7.5V6M10.5 7.5H13M6.5 9.5H7.5M8.5 9.5H9.5M8.5 11H9.5M6.5 11H7.5M3.5 13.5V7.5H2.5V5.5L4 2.5H12L13.5 5.5V7.5H12.5V13.5H3.5Z" stroke={localStorage.getItem('darkMode')==='true'?'#fff':'#1e1e1e90'} strokeWidth='1.4' strokeLinejoin="round"/>
          </svg>
        </div>
      )
    }
    if (origin === 'WEBSITE') {
      return (
        <div className={`flex p-1 rounded-md  items-center ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}>
          <svg className="" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.36 14C16.44 13.34 16.5 12.68 16.5 12C16.5 11.32 16.44 10.66 16.36 10H19.74C19.9 10.64 20 11.31 20 12C20 12.69 19.9 13.36 19.74 14M14.59 19.56C15.19 18.45 15.65 17.25 15.97 16H18.92C17.9512 17.6683 16.4141 18.932 14.59 19.56ZM14.34 14H9.66C9.56 13.34 9.5 12.68 9.5 12C9.5 11.32 9.56 10.65 9.66 10H14.34C14.43 10.65 14.5 11.32 14.5 12C14.5 12.68 14.43 13.34 14.34 14ZM12 19.96C11.17 18.76 10.5 17.43 10.09 16H13.91C13.5 17.43 12.83 18.76 12 19.96ZM8 8H5.08C6.03864 6.32703 7.57466 5.06124 9.4 4.44C8.8 5.55 8.35 6.75 8 8ZM5.08 16H8C8.35 17.25 8.8 18.45 9.4 19.56C7.57827 18.9323 6.04429 17.6682 5.08 16ZM4.26 14C4.1 13.36 4 12.69 4 12C4 11.31 4.1 10.64 4.26 10H7.64C7.56 10.66 7.5 11.32 7.5 12C7.5 12.68 7.56 13.34 7.64 14M12 4.03C12.83 5.23 13.5 6.57 13.91 8H10.09C10.5 6.57 11.17 5.23 12 4.03ZM18.92 8H15.97C15.6565 6.76161 15.1931 5.56611 14.59 4.44C16.43 5.07 17.96 6.34 18.92 8ZM12 2C6.47 2 2 6.5 2 12C2 14.6522 3.05357 17.1957 4.92893 19.0711C5.85752 19.9997 6.95991 20.7362 8.17317 21.2388C9.38642 21.7413 10.6868 22 12 22C14.6522 22 17.1957 20.9464 19.0711 19.0711C20.9464 17.1957 22 14.6522 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7362 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2Z" fill={localStorage.getItem('darkMode')==='true'?'#fff':'#1e1e1e90'}/>
          </svg>
        </div>
      )
    }
    if (origin === 'BACK_OFFICE') {
      return (
        <div className={`flex p-1 rounded-md  items-center ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M2.879 3.879C2 4.757 2 6.172 2 9V15C2 17.828 2 19.243 2.879 20.121C3.757 21 5.172 21 8 21H16C18.828 21 20.243 21 21.121 20.121C22 19.243 22 17.828 22 15V9C22 6.172 22 4.757 21.121 3.879C20.243 3 18.828 3 16 3H8C5.172 3 3.757 3 2.879 3.879ZM16 8C16.2652 8 16.5196 8.10536 16.7071 8.29289C16.8946 8.48043 17 8.73478 17 9V17C17 17.2652 16.8946 17.5196 16.7071 17.7071C16.5196 17.8946 16.2652 18 16 18C15.7348 18 15.4804 17.8946 15.2929 17.7071C15.1054 17.5196 15 17.2652 15 17V9C15 8.73478 15.1054 8.48043 15.2929 8.29289C15.4804 8.10536 15.7348 8 16 8ZM9 11C9 10.7348 8.89464 10.4804 8.70711 10.2929C8.51957 10.1054 8.26522 10 8 10C7.73478 10 7.48043 10.1054 7.29289 10.2929C7.10536 10.4804 7 10.7348 7 11V17C7 17.2652 7.10536 17.5196 7.29289 17.7071C7.48043 17.8946 7.73478 18 8 18C8.26522 18 8.51957 17.8946 8.70711 17.7071C8.89464 17.5196 9 17.2652 9 17V11ZM13 13C13 12.7348 12.8946 12.4804 12.7071 12.2929C12.5196 12.1054 12.2652 12 12 12C11.7348 12 11.4804 12.1054 11.2929 12.2929C11.1054 12.4804 11 12.7348 11 13V17C11 17.2652 11.1054 17.5196 11.2929 17.7071C11.4804 17.8946 11.7348 18 12 18C12.2652 18 12.5196 17.8946 12.7071 17.7071C12.8946 17.5196 13 17.2652 13 17V13Z"  fill={localStorage.getItem('darkMode')==='true'?'#fff':'#1e1e1e90'}/>
          </svg>
        </div>
      )
    }
    return (
      <div>
        <h4 className={` text-[14px] font-[500] p-1 rounded-md ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}>{origin}</h4>
      </div>
    )
  }
  const [showStatus, setShowStatus] = useState(false)

  const [idStatusModification, setIdStatusModification] = useState<BaseKey>('');
  const showStatusModification = (id: BaseKey | undefined) => {
    if (!id) return;
    setIdStatusModification(id);
    setShowStatus(!showStatus);
  };
  const statusHandler = (status: string) => {
    setReservations(reservations.map(r => 
      r.id === idStatusModification ? {...r, status} : r
    ))
    
  }

  const [showAddReservation, setShowAddReservation] = useState(false)

  return (
    <div>
      {showProcess && <div className=''><ReservationProcess onClick={()=>{setShowProcess(false)}} getDateTime={(data:dataTypes)=>{setReservationProgressData(data)}}/></div>}

      {showAddReservation && <ReservationModal  onClick={()=>{setShowAddReservation(false)}}  onSubmit={(data: Reservation)=>{setReservations([...reservations, data])}} />} 
      {showModal && selectedClient && (
        <div>
          <div className="overlay" onClick={() => setShowModal(false)}></div>
          <div className={`sidepopup w-[45%] overflow-y-auto lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0 lt-sm:overflow-y-auto h-full ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'} `}>
            <h1 className="text-2xl font-[600] mb-4">{t('reservations.edit.title')} by <span className="font-[800]">{selectedClient.full_name}</span></h1>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium ">{t('reservations.edit.informations.name')}</label>
                <input
                  type="text"
                  name="fullName"
                  value={selectedClient.full_name}
                  onChange={(e)=>setSelectedClient({...selectedClient, full_name: e.target.value})}
                  className={`w-full rounded-md p-2 ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}
/>
              </div>
              <div>
                <label className="block text-sm font-medium ">{t('reservations.edit.informations.email')}</label>
                <input
                  type="email"
                  name="email"
                  value={selectedClient.email}
                  onChange={(e)=>setSelectedClient({...selectedClient, email: e.target.value})}
                  className={`w-full rounded-md p-2 ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}
/>
              </div>
              
              
              {/* <div>
                <label className="block text-sm font-medium ">{t('reservations.edit.informations.tableName')}</label>
                <input
                  type="text"
                  name="place"
                  value={selectedClient.table_name}
                  onChange={(e)=>setSelectedClient({...selectedClient, table: e.target.value})}
                  className={`w-full rounded-md p-2 ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}
/>
              </div> */}
              <div>
                <label className="block text-sm font-medium ">{t('reservations.edit.informations.madeBy')}</label>
                <input
                  type="text"
                  name="reservationMade"
                  defaultValue={selectedClient.source}
                  onChange={(e)=>setSelectedClient({...selectedClient, source: e.target.value})}
                  className={`w-full rounded-md p-2 ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}
/>
              </div>
              
              <div>
                <label className="block text-sm font-medium ">{t('reservations.edit.informations.comment')}</label>
                <input
                  type="text"
                  name="comment"
                  value={selectedClient.commenter}
                  onChange={(e)=>setSelectedClient({...selectedClient, commenter: e.target.value})}
                  className={`w-full rounded-md p-2 ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}
/>
              </div>
              
              <div className="">
                <label className="block text-sm font-medium ">{t('reservations.edit.informations.status')}</label>
                <select
                  name="status"
                  value={selectedClient.status}
                  onChange={(e)=>setSelectedClient({...selectedClient, status: e.target.value})}
                  className={`w-full rounded-md p-2 ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}
>
                  <option value="PENDING">{t('reservations.statusLabels.pending')}</option>
                  <option value="APPROVED">{t('reservations.statusLabels.confirmed')}</option>
                  <option value="CANCELED">{t('reservations.statusLabels.cancelled')}</option>
                </select>
              </div>
              <div onClick={()=>{setShowProcess(true)}} className={`btn flex justify-around cursor-pointer ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-white' : 'bg-white'}`}>
                  {(reservationProgressData.reserveDate === '') ?<div>date </div>:<span>{reservationProgressData.reserveDate}</span>}
                  {(reservationProgressData.time === '') ? <div>Time </div>:<span>{reservationProgressData.time}</span>} 
                  {(reservationProgressData.guests===0) ? <div>Guests </div>:<span>{reservationProgressData.guests}</span>}
                  
                  

              </div>
              <div className="h-10 sm:hidden"></div>
              <div className="flex justify-center lt-sm:fixed lt-sm:bottom-0 lt-sm: lt-sm:p-3 lt-sm:w-full space-x-2">
                <button onClick={() => setShowModal(false)} className="btn-secondary hover:bg-[#88AB6150] hover:text-greentheme transition-colors">{t('reservations.edit.buttons.cancel')}</button>
                <button onClick={upDateHandler} className="btn-primary">{t('reservations.edit.buttons.save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className='flex justify-between mb-2'>
        <h1 className={`text-3xl text-blacktheme  font-[700] ${localStorage.getItem('darkMode')==='true'?' text-whitetheme':' text-blacktheme'}`}>{t('reservations.title')}</h1>
        <button className='btn-primary' onClick={()=>{setShowAddReservation(true)}}>
          {t('reservations.buttons.addReservation')}
        </button>
      </div>
      <div className="flex lt-sm:flex-col lt-sm:gap-2 justify-between">
        <div className="">
          <SearchBar SearchHandler={searchFilter}/>
        </div>
        <div className="flex lt-sm:flex-wrap gap-4">
          <button onClick={() => setFocusedFilter('APPROVED')} className={`${localStorage.getItem('darkMode')==='true'?'text-white':''} ${focusedFilter === 'APPROVED' ? 'btn-primary' : 'btn'} `}>
            {t('reservations.filters.confirmed')}
          </button>
          <button onClick={() => setFocusedFilter('CANCELED')} className={`${localStorage.getItem('darkMode')==='true'?'text-white':''} ${focusedFilter === 'CANCELED' ? 'btn-primary' : 'btn'}`}>
            {t('reservations.filters.cancelled')}
          </button>
          <button onClick={() => setFocusedFilter('PENDING')} className={`${localStorage.getItem('darkMode')==='true'?'text-white':''} ${focusedFilter === 'PENDING' ? 'btn-primary' : 'btn'}`}>
            {t('reservations.filters.pending')}
          </button>
          <button 
            className={`gap-2 flex items-center ${localStorage.getItem('darkMode')==='true'?' text-whitetheme':''} ${selectingDay === '' ? 'btn' : 'btn-primary'}`} 
            onClick={() => setFocusedDate(true)}
          >
            {t('reservations.filters.date')}
          </button>
          <button onClick={setDefaultFilter} className={`${localStorage.getItem('darkMode')==='true'?' text-whitetheme':''} ${(focusedFilter === '') && (selectingDay === '') ? 'btn-primary' : 'btn'}`}>
            {t('reservations.filters.all')}
          </button>
        </div>
      </div>
      <div className='mt-4 lt-sm:overflow-x-scroll'>
        <table className={`min-w-full divide-y ${localStorage.getItem('darkMode')==='true'?'divide-gray-800':'divide-gray-200'}`}>
          <thead className={localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme2 text-white':'bg-gray-50 text-gray-500'}>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.id')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.name')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.email')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.comment')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.madeBy')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.date')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.time')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.guests')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.status')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.review')}</th>
            </tr>
          </thead>
          <tbody className={ `  ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme divide-y divide-gray-800':'bg-white divide-y divide-gray-200'}`} >
            {filteredReservations.sort((a, b) => (a.id < b.id ? 1 : -1)).map(reservation => (
              <tr key={reservation.id} className=" hover:opacity-75">
                <td className="px-3 py-4 whitespace-nowrap cursor-pointer"  onClick={() => { if (reservation.id) EditClient(reservation.id); }}>{reservation.id}</td>
                <td className="px-3 py-4 whitespace-nowrap cursor-pointer"  onClick={() => { if (reservation.id) EditClient(reservation.id); }}>{reservation.full_name}</td>
                <td className="px-3 py-4 whitespace-nowrap cursor-pointer" onClick={() => { if (reservation.id) EditClient(reservation.id); }}>{reservation.email}</td>
                <td className="px-3 py-4 whitespace-nowrap cursor-pointer" onClick={() => { if (reservation.id) EditClient(reservation.id); }}>{reservation.commenter}</td>
                <td className="px-3 py-4 flex items-center justify-center whitespace-nowrap cursor-pointer"  onClick={() => { if (reservation.id) EditClient(reservation.id); }}>
                  {reservationOrigin(reservation.source)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap cursor-pointer"  onClick={() => { if (reservation.id) EditClient(reservation.id); }}>{reservation.date }</td>
                <td className="px-3 py-4 whitespace-nowrap cursor-pointer" onClick={() => { if (reservation.id) EditClient(reservation.id); }}>{reservation.time.slice(0,5)}</td>
                <td className="px-3 py-4 whitespace-nowrap cursor-pointer" onClick={() => { if (reservation.id) EditClient(reservation.id); }}>{reservation.number_of_guests}</td>
                <td className="px-3 py-4 whitespace-nowrap " onClick={()=> showStatusModification(reservation.id)}>
                  <span className={`${statusStyle(reservation.status)} text-center py-[.1em] px-3  rounded-[10px]`}> 
                    {reservation.status === 'APPROVED'? t('reservations.statusLabels.confirmed') : reservation.status === 'PENDING' ? t('reservations.statusLabels.pending') : t('reservations.statusLabels.cancelled')}
                  </span>
                    {showStatus && reservation.id === idStatusModification && (
                      <div>
                        <div className="overlay left-0 top-0 w-full h-full  opacity-0 " onClick={()=>{setShowStatus(false)}}></div>
                        <ul className="fixed opacity-100 z-[300] bg-white p-2 rounded-md shadow-md">
                          <li className="py-1 px-2 hover:bg-gray-100 cursor-pointer" onClick={()=> statusHandler('PENDING')}>{t('reservations.statusLabels.pending')}</li>
                          <li className="py-1 px-2 hover:bg-gray-100 cursor-pointer" onClick={()=> statusHandler('CONFIRMED')}>{t('reservations.statusLabels.confirmed')}</li>
                          <li className="py-1 px-2 hover:bg-gray-100 cursor-pointer" onClick={()=> statusHandler('CANCELED')}>{t('reservations.statusLabels.cancelled')}</li>
                        </ul>
                      </div>
                    )}
                </td>
                <td className=" whitespace-nowrap " >
                  {reservation.review ? <span className=" cursor-default opacity-50" >{t('reservations.tableHeaders.reviewed')}</span> : <span className=" cursor-pointer text-greentheme ">{t('reservations.tableHeaders.sendReview')}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {focusedDate && (
        <div>
          <div className="overlay" onClick={() => setFocusedDate(false)}></div>
          <div className={`popup lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0 ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'}`}>
            <IntervalCalendar onRangeSelect={handleDateClick} />
          </div>
        </div>
      )}
    </div>
  )
}

export default ReservationsPage