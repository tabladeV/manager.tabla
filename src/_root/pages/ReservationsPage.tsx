'use client'

import { useEffect, useState } from "react"
import { format } from 'date-fns'
import SearchBar from "../../components/header/SearchBar"
import IntervalCalendar from "../../components/Calendar/IntervalCalendar"

import 'i18next'

import { useTranslation } from 'react-i18next';
import ReservationModal from "../../components/reservation/ReservationModal"
interface Reservation {
  id: string
  email: string
  fullName: string
  date: string
  time: string
  reservationMade: string
  guests: string
  status: string
}

const ReservationsPage = () => {

  const { t } = useTranslation();

  const [reservations,setReservations] = useState([
    {
      id: '1',
      email: ' john.doe@gmail.com ',
      fullName: 'John Doe',
      date: '23/08/2024',
      time: '12:00 PM',
      reservationMade: 'MarketPlace',
      guests: '2',
      status: 'Pending'
    },
    {
      id: '2',
      email: 'kwame1@gmail.com ',
      fullName: 'Kwame Dwayne',
      date: '23/08/2024',
      time: '12:00 PM',
      reservationMade: 'MarketPlace',
      guests: '4',
      status: 'Confirmed'
    },
    {
      id: '3',
      email: `asafo.w@gmail.com`,
      fullName: 'asafo Yaw',
      date: '21/08/2024',
      time: '12:00 PM',
      reservationMade: 'MarketPlace',
      guests: '4',
      status: 'Canceled'
    },
    {
      id: '4',
      email: 'dkqw@gmail.com',
      fullName: 'Dk Qw',
      date: '29/08/2024',
      time: '12:00 PM',
      reservationMade: 'MarketPlace',
      guests: '2',
      status: 'Confirmed'
    },
    {
      id: '5',
      email: 'lawuate@gmail.com',
      fullName: 'Lawu Ate',
      date: '23/08/2024',
      time: '12:00 PM',
      reservationMade: 'MarketPlace',
      guests: '2',
      status: 'Confirmed'
    },
    {
      id: '6',
      email: 'laquazettezak@gmail.com',
      fullName: 'Laquazette Zak',
      date: '20/08/2024',
      time: '12:00 PM',
      reservationMade: 'MarketPlace',
      guests: '2',
      status: 'Pending'
    },
    {
      id: '7',
      email: 'dalimeal@gmail.com',
      fullName: 'Da Limeal',
      date: '23/08/2024',
      time: '12:00 PM',
      reservationMade: 'MarketPlace',
      guests: '2',
      status: 'Confirmed'
    },
    {
      id: '8',
      email: 'alish.coleman@gmail.com',
      fullName: 'Alish Coleman',
      date: '23/08/2024',
      time: '12:00 PM',
      reservationMade: 'Jack Ma',
      guests: '2',
      status: 'Pending'
    },
    {
      id: '9',
      email: 'ashley.halsey@gmail.com',
      fullName: 'Ashley Halsey',
      date: '23/08/2024',
      time: '12:00 PM',
      reservationMade: 'MarketPlace',
      guests: '2',
      status: 'Confirmed'
    },
    {
      id: '10',
      email: 'armstrongschwazeneger@gmail.com',
      fullName: 'Armstrong Schwazeneger',
      date: '23/08/2024',
      time: '12:00 PM',
      reservationMade: 'Website',
      guests: '2',
      status: 'Pending'
    },
  ])

  function statusStyle(status: string) {
    if (status === 'Pending') {
      return 'bg-softbluetheme text-bluetheme'
    } else if (status === 'Confirmed') {
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
    const results = reservations.filter((item) =>
        item.fullName.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword)
    );
    setSearchResults(results);
  };

  const [showModal, setShowModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Reservation | null>(null)

  const EditClient = (id: string) => {
    const client = reservations.find(r => r.id === id)
    if (client) {
      setSelectedClient({...client})
      setShowModal(true)
    }
  }

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
    }
  }

  const filteredReservations = searchResults.filter(reservation => {
    if (focusedFilter !== '' && reservation.status !== focusedFilter) return false
    if (selectedDateRange.start && selectedDateRange.end) {
      const reservationDate = new Date(reservation.date.split('/').reverse().join('-'))
      return reservationDate >= selectedDateRange.start && reservationDate <= selectedDateRange.end
    }
    return true
  })

  const reservationOrigin = (origin: string) => {
    if (origin === 'MarketPlace') {
      return (
        <div className={`flex p-1 rounded-md flex-col items-center ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}>
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 7.5H5.5M5.5 7.5V6M5.5 7.5H8M8 7.5V6M8 7.5H10.5M10.5 7.5V6M10.5 7.5H13M6.5 9.5H7.5M8.5 9.5H9.5M8.5 11H9.5M6.5 11H7.5M3.5 13.5V7.5H2.5V5.5L4 2.5H12L13.5 5.5V7.5H12.5V13.5H3.5Z" stroke={localStorage.getItem('darkMode')==='true'?'#fff':'#1e1e1e90'} strokeWidth='1.4' strokeLinejoin="round"/>
          </svg>
        </div>
      )
    }
    if (origin === 'Website') {
      return (
        <div className={`flex p-1 rounded-md  items-center ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}>
          <svg className="" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.36 14C16.44 13.34 16.5 12.68 16.5 12C16.5 11.32 16.44 10.66 16.36 10H19.74C19.9 10.64 20 11.31 20 12C20 12.69 19.9 13.36 19.74 14M14.59 19.56C15.19 18.45 15.65 17.25 15.97 16H18.92C17.9512 17.6683 16.4141 18.932 14.59 19.56ZM14.34 14H9.66C9.56 13.34 9.5 12.68 9.5 12C9.5 11.32 9.56 10.65 9.66 10H14.34C14.43 10.65 14.5 11.32 14.5 12C14.5 12.68 14.43 13.34 14.34 14ZM12 19.96C11.17 18.76 10.5 17.43 10.09 16H13.91C13.5 17.43 12.83 18.76 12 19.96ZM8 8H5.08C6.03864 6.32703 7.57466 5.06124 9.4 4.44C8.8 5.55 8.35 6.75 8 8ZM5.08 16H8C8.35 17.25 8.8 18.45 9.4 19.56C7.57827 18.9323 6.04429 17.6682 5.08 16ZM4.26 14C4.1 13.36 4 12.69 4 12C4 11.31 4.1 10.64 4.26 10H7.64C7.56 10.66 7.5 11.32 7.5 12C7.5 12.68 7.56 13.34 7.64 14M12 4.03C12.83 5.23 13.5 6.57 13.91 8H10.09C10.5 6.57 11.17 5.23 12 4.03ZM18.92 8H15.97C15.6565 6.76161 15.1931 5.56611 14.59 4.44C16.43 5.07 17.96 6.34 18.92 8ZM12 2C6.47 2 2 6.5 2 12C2 14.6522 3.05357 17.1957 4.92893 19.0711C5.85752 19.9997 6.95991 20.7362 8.17317 21.2388C9.38642 21.7413 10.6868 22 12 22C14.6522 22 17.1957 20.9464 19.0711 19.0711C20.9464 17.1957 22 14.6522 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7362 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2Z" fill={localStorage.getItem('darkMode')==='true'?'#fff':'#1e1e1e90'}/>
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

  const [idStatusModification, setIdStatusModification] = useState('')

  const showStatusModification = (id:string) => {
    setIdStatusModification(id)
    setShowStatus(!showStatus)
  }
  
  const statusHandler = (status: string) => {
    setReservations(reservations.map(r => 
      r.id === idStatusModification ? {...r, status} : r
    ))
    
  }

  const [showAddReservation, setShowAddReservation] = useState(false)

  return (
    <div>
      {showAddReservation && <ReservationModal onClick={()=>{setShowAddReservation(false)}}/>}
      {showModal && selectedClient && (
        <div>
          <div className="overlay" onClick={() => setShowModal(false)}></div>
          <div className={`sidepopup lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0 lt-sm:overflow-y-auto h-full ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'} `}>
            <h1 className="text-2xl font-[600] mb-4">{t('reservations.edit.title')} by <span className="font-[800]">{selectedClient.fullName}</span></h1>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium ">{t('reservations.edit.informations.name')}</label>
                <input
                  type="text"
                  name="fullName"
                  value={selectedClient.fullName}
                  onChange={handleInputChange}
                  className={`w-full rounded-md p-2 ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}
/>
              </div>
              <div>
                <label className="block text-sm font-medium ">{t('reservations.edit.informations.email')}</label>
                <input
                  type="email"
                  name="email"
                  value={selectedClient.email}
                  onChange={handleInputChange}
                  className={`w-full rounded-md p-2 ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}
/>
              </div>
              <div>
                <label className="block text-sm font-medium ">{t('reservations.edit.informations.date')}</label>
                <input
                  type="text"
                  name="date"
                  value={selectedClient.date}
                  onChange={handleInputChange}
                  className={`w-full rounded-md p-2 ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}
/>
              </div>
              <div>
                <label className="block text-sm font-medium ">{t('reservations.edit.informations.time')}</label>
                <input
                  type="text"
                  name="time"
                  value={selectedClient.time}
                  onChange={handleInputChange}
                  className={`w-full rounded-md p-2 ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}
/>
              </div>
              <div>
                <label className="block text-sm font-medium ">{t('reservations.edit.informations.madeBy')}</label>
                <input
                  type="text"
                  name="reservationMade"
                  value={selectedClient.reservationMade}
                  onChange={handleInputChange}
                  className={`w-full rounded-md p-2 ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}
/>
              </div>
              <div>
                <label className="block text-sm font-medium ">{t('reservations.edit.informations.guests')}</label>
                <input
                  type="text"
                  name="guests"
                  value={selectedClient.guests}
                  onChange={handleInputChange}
                  className={`w-full rounded-md p-2 ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}
/>
              </div>
              <div className="">
                <label className="block text-sm font-medium ">{t('reservations.edit.informations.status')}</label>
                <select
                  name="status"
                  value={selectedClient.status}
                  onChange={handleInputChange}
                  className={`w-full rounded-md p-2 ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}
>
                  <option value="Pending">{t('reservations.statusLabels.pending')}</option>
                  <option value="Confirmed">{t('reservations.statusLabels.confirmed')}</option>
                  <option value="Canceled">{t('reservations.statusLabels.cancelled')}</option>
                </select>
              </div>
              <div className="h-10 sm:hidden"></div>
              <div className="flex justify-center lt-sm:fixed lt-sm:bottom-0 lt-sm: lt-sm:p-3 lt-sm:w-full space-x-2">
                <button onClick={() => setShowModal(false)} className="btn-secondary hover:bg-[#88AB6150] hover:text-greentheme transition-colors">{t('reservations.edit.buttons.cancel')}</button>
                <button onClick={saveChanges} className="btn-primary">{t('reservations.edit.buttons.save')}</button>
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
          <button onClick={() => setFocusedFilter('Confirmed')} className={`${localStorage.getItem('darkMode')==='true'?'text-white':''} ${focusedFilter === 'Confirmed' ? 'btn-primary' : 'btn'} `}>
            {t('reservations.filters.confirmed')}
          </button>
          <button onClick={() => setFocusedFilter('Canceled')} className={`${localStorage.getItem('darkMode')==='true'?'text-white':''} ${focusedFilter === 'Canceled' ? 'btn-primary' : 'btn'}`}>
            {t('reservations.filters.cancelled')}
          </button>
          <button onClick={() => setFocusedFilter('Pending')} className={`${localStorage.getItem('darkMode')==='true'?'text-white':''} ${focusedFilter === 'Pending' ? 'btn-primary' : 'btn'}`}>
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
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.id')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.name')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.email')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.madeBy')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.date')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.time')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.guests')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reservations.tableHeaders.status')}</th>
            </tr>
          </thead>
          <tbody className={ `  ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme divide-y divide-gray-800':'bg-white divide-y divide-gray-200'}`} >
            {filteredReservations.map(reservation => (
              <tr key={reservation.id} className=" hover:opacity-75">
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer"  onClick={() => EditClient(reservation.id)}>{reservation.id}</td>
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer"  onClick={() => EditClient(reservation.id)}>{reservation.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => EditClient(reservation.id)}>{reservation.email}</td>
                <td className="px-6 py-4 flex items-center justify-center whitespace-nowrap cursor-pointer"  onClick={() => EditClient(reservation.id)}>
                  {reservationOrigin(reservation.reservationMade)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer"  onClick={() => EditClient(reservation.id)}>{reservation.date }</td>
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => EditClient(reservation.id)}>{reservation.time}</td>
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => EditClient(reservation.id)}>{reservation.guests}</td>
                <td className="px-6 py-4 whitespace-nowrap " onClick={()=> showStatusModification(reservation.id)}>
                  <span className={`${statusStyle(reservation.status)} text-center py-[.1em] px-3  rounded-[10px]`}> 
                    {reservation.status === 'Confirmed'? t('reservations.statusLabels.confirmed') : reservation.status === 'Pending' ? t('reservations.statusLabels.pending') : t('reservations.statusLabels.cancelled')}
                  </span>
                    {showStatus && reservation.id === idStatusModification && (
                      <div>
                        <div className="overlay left-0 top-0 w-full h-full  opacity-0 " onClick={()=>{setShowStatus(false)}}></div>
                        <ul className="fixed opacity-100 z-[300] bg-white p-2 rounded-md shadow-md">
                          <li className="py-1 px-2 hover:bg-gray-100 cursor-pointer" onClick={()=> statusHandler('Pending')}>{t('reservations.statusLabels.pending')}</li>
                          <li className="py-1 px-2 hover:bg-gray-100 cursor-pointer" onClick={()=> statusHandler('Confirmed')}>{t('reservations.statusLabels.confirmed')}</li>
                          <li className="py-1 px-2 hover:bg-gray-100 cursor-pointer" onClick={()=> statusHandler('Cancelled')}>{t('reservations.statusLabels.cancelled')}</li>
                        </ul>
                      </div>
                    )}
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