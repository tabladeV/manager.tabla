'use client'

import { useEffect, useState } from "react"
import { format } from 'date-fns'
import SearchBar from "../../components/header/SearchBar"
import IntervalCalendar from "../../components/Calendar/IntervalCalendar"

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
        <div className='flex p-1 rounded-md bg-softgreytheme flex-col items-center'>
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 7.5H5.5M5.5 7.5V6M5.5 7.5H8M8 7.5V6M8 7.5H10.5M10.5 7.5V6M10.5 7.5H13M6.5 9.5H7.5M8.5 9.5H9.5M8.5 11H9.5M6.5 11H7.5M3.5 13.5V7.5H2.5V5.5L4 2.5H12L13.5 5.5V7.5H12.5V13.5H3.5Z" stroke="#1e1e1e90" strokeWidth='1.4' strokeLinejoin="round"/>
          </svg>
        </div>
      )
    }
    if (origin === 'Website') {
      return (
        <div className='flex p-1 rounded-md bg-softgreytheme items-center'>
          <svg className="" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.36 14C16.44 13.34 16.5 12.68 16.5 12C16.5 11.32 16.44 10.66 16.36 10H19.74C19.9 10.64 20 11.31 20 12C20 12.69 19.9 13.36 19.74 14M14.59 19.56C15.19 18.45 15.65 17.25 15.97 16H18.92C17.9512 17.6683 16.4141 18.932 14.59 19.56ZM14.34 14H9.66C9.56 13.34 9.5 12.68 9.5 12C9.5 11.32 9.56 10.65 9.66 10H14.34C14.43 10.65 14.5 11.32 14.5 12C14.5 12.68 14.43 13.34 14.34 14ZM12 19.96C11.17 18.76 10.5 17.43 10.09 16H13.91C13.5 17.43 12.83 18.76 12 19.96ZM8 8H5.08C6.03864 6.32703 7.57466 5.06124 9.4 4.44C8.8 5.55 8.35 6.75 8 8ZM5.08 16H8C8.35 17.25 8.8 18.45 9.4 19.56C7.57827 18.9323 6.04429 17.6682 5.08 16ZM4.26 14C4.1 13.36 4 12.69 4 12C4 11.31 4.1 10.64 4.26 10H7.64C7.56 10.66 7.5 11.32 7.5 12C7.5 12.68 7.56 13.34 7.64 14M12 4.03C12.83 5.23 13.5 6.57 13.91 8H10.09C10.5 6.57 11.17 5.23 12 4.03ZM18.92 8H15.97C15.6565 6.76161 15.1931 5.56611 14.59 4.44C16.43 5.07 17.96 6.34 18.92 8ZM12 2C6.47 2 2 6.5 2 12C2 14.6522 3.05357 17.1957 4.92893 19.0711C5.85752 19.9997 6.95991 20.7362 8.17317 21.2388C9.38642 21.7413 10.6868 22 12 22C14.6522 22 17.1957 20.9464 19.0711 19.0711C20.9464 17.1957 22 14.6522 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7362 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2Z" fill="#1e1e1e90"/>
          </svg>
        </div>
      )
    }
    return (
      <div>
        <h4 className="text-subblack text-[14px] font-[500] p-1 rounded-md bg-softgreytheme">{origin}</h4>
      </div>
    )
  }

  return (
    <div>
      {showModal && selectedClient && (
        <div>
          <div className="overlay" onClick={() => setShowModal(false)}></div>
          <div className="sidepopup lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0 lt-sm:overflow-y-auto h-full">
            <h1 className="text-2xl font-bold mb-4">Edit {selectedClient.fullName}'s Reservation infos</h1>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={selectedClient.fullName}
                  onChange={handleInputChange}
                  className="inputs-unique mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={selectedClient.email}
                  onChange={handleInputChange}
                  className="inputs-unique mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="text"
                  name="date"
                  value={selectedClient.date}
                  onChange={handleInputChange}
                  className="inputs-unique mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <input
                  type="text"
                  name="time"
                  value={selectedClient.time}
                  onChange={handleInputChange}
                  className="inputs-unique mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reservation Made</label>
                <input
                  type="text"
                  name="reservationMade"
                  value={selectedClient.reservationMade}
                  onChange={handleInputChange}
                  className="inputs-unique mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Guests</label>
                <input
                  type="text"
                  name="guests"
                  value={selectedClient.guests}
                  onChange={handleInputChange}
                  className="inputs-unique mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div className="">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={selectedClient.status}
                  onChange={handleInputChange}
                  className="inputs-unique mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Canceled">Canceled</option>
                </select>
              </div>
              <div className="h-10 sm:hidden"></div>
              <div className="flex justify-center lt-sm:fixed lt-sm:bottom-0 lt-sm:bg-white lt-sm:p-3 lt-sm:w-full space-x-2">
                <button onClick={() => setShowModal(false)} className="btn-secondary hover:bg-[#88AB6150] hover:text-greentheme transition-colors">Cancel</button>
                <button onClick={saveChanges} className="btn-primary">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className='flex justify-between mb-2'>
        <h1 className='text-3xl text-blacktheme  font-[700]'>Reservations</h1>
        <button className='btn-primary'>
          Add Reservation
        </button>
      </div>
      <div className="flex lt-sm:flex-col lt-sm:gap-2 justify-between">
        <div className="border-[2px] rounded-[10px]">
          <SearchBar SearchHandler={searchFilter}/>
        </div>
        <div className="flex lt-sm:flex-wrap gap-4">
          <button onClick={() => setFocusedFilter('Confirmed')} className={focusedFilter === 'Confirmed' ? 'btn-primary' : 'btn'}>
            Confirmed
          </button>
          <button onClick={() => setFocusedFilter('Canceled')} className={focusedFilter === 'Canceled' ? 'btn-primary' : 'btn'}>
            Canceled
          </button>
          <button onClick={() => setFocusedFilter('Pending')} className={focusedFilter === 'Pending' ? 'btn-primary' : 'btn'}>
            Pending
          </button>
          <button 
            className={`gap-2 flex items-center ${selectingDay === '' ? 'btn' : 'btn-primary'}`} 
            onClick={() => setFocusedDate(true)}
          >
            Date
          </button>
          <button onClick={setDefaultFilter} className={(focusedFilter === '') && (selectingDay === '') ? 'btn-primary' : 'btn'}>
            All
          </button>
        </div>
      </div>
      <div className='mt-4 lt-sm:overflow-x-scroll'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Id</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Made From/By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {filteredReservations.map(reservation => (
              <tr key={reservation.id} className="cursor-pointer hover:opacity-75" onClick={() => EditClient(reservation.id)}>
                <td className="px-6 py-4 whitespace-nowrap">{reservation.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{reservation.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{reservation.email}</td>
                <td className="px-6 py-4 flex items-center justify-center whitespace-nowrap">
                  {reservationOrigin(reservation.reservationMade)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{reservation.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">{reservation.time}</td>
                <td className="px-6 py-4 whitespace-nowrap">{reservation.guests}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`${statusStyle(reservation.status)} text-center py-[.1em] px-3  rounded-[10px]`}> 
                    {reservation.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {focusedDate && (
        <div>
          <div className="overlay" onClick={() => setFocusedDate(false)}></div>
          <div className="popup lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0">
            <IntervalCalendar onRangeSelect={handleDateClick} />
          </div>
        </div>
      )}
    </div>
  )
}

export default ReservationsPage