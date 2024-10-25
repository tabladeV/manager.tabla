'use client'

import { useEffect, useState } from "react"
import { format, set } from 'date-fns'
import SearchBar from "../../components/header/SearchBar"
import IntervalCalendar from "../../components/Calendar/IntervalCalendar"

const ReservationsPage = () => {
  const reservations = [
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
      reservationMade: 'MarketPlace',
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
      reservationMade: 'MarketPlace',
      guests: '2',
      status: 'Pending'
    },
  ]

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
    // setFocusedDate(false)
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
  const [selectedClient, setSelectedClient] = useState('')
  const EditClient = (id: string) => {
    console.log('Edit Client',id)
    setSelectedClient(id)
    setShowModal(true)
  }

  const filteredReservations = searchResults.filter(reservation => {
    if (focusedFilter !== '' && reservation.status !== focusedFilter) return false
    if (selectedDateRange.start && selectedDateRange.end) {
      const reservationDate = new Date(reservation.date.split('/').reverse().join('-'))
      return reservationDate >= selectedDateRange.start && reservationDate <= selectedDateRange.end
    }
    return true
  })

  return (
    <div>
      {
        showModal
        &&
        <div>
          <div className="overlay" onClick={() => setShowModal(false)}></div>
          <div className="sidepopup h-full">
            <h1>Edit Client's Reservation</h1>
            <div>
              {
                reservations.map(reservation => {
                  if (reservation.id === selectedClient) {
                    return (
                      <div key={reservation.id}>
                        <input type="text" value={reservation.fullName}  onChange={()=>{reservation.fullName}} />
                      </div>
                    )
                  }
                })
              }

            </div>
          </div>
        </div>
      }
      <div className='flex justify-between mb-2'>
        <h1 className='text-3xl text-blacktheme font-[700]'>Reservations</h1>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Made From</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th> */}
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {filteredReservations.map(reservation => (
              <tr key={reservation.id} className="cursor-pointer hover:opacity-75" onClick={()=>{EditClient(reservation.id)}}>
                <td className="px-6 py-4 whitespace-nowrap">{reservation.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{reservation.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{reservation.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{reservation.reservationMade}</td>
                <td className="px-6 py-4 whitespace-nowrap">{reservation.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">{reservation.time}</td>
                <td className="px-6 py-4 whitespace-nowrap">{reservation.guests}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`${statusStyle(reservation.status)} text-center py-[.1em] px-3  rounded-[10px]`}> 
                    {reservation.status}
                  </span>
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className='text-indigo-600 hover:text-indigo-900'>
                    ...
                  </button>
                </td> */}
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