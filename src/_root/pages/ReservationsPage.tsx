// @ts-ignore
import OurCalendar from "../../components/Calendar/OurCalendar.jsx"
import { useEffect, useState } from "react"

import { format} from 'date-fns';
import SearchBar from "../../components/header/SearchBar.js";
const ReservationsPage = () => {

  const reservations = [
    {
      id: 1,
      email: ' john.doe@gmail.com ',
      fullName: 'John Doe',
      date: '23/08/2024',
      time: '12:00 PM',
      reservationMade: 'MarketPlace',
      guests: '2',
      status: 'Pending'
    },
    {
      id: 2,
      email: 'kwame1@gmail.com ',
      fullName: 'Kwame Dwayne',
      date: '23/08/2024',
      time: '12:00 PM',
      reservationMade: 'MarketPlace',
      guests: '4',
      status: 'Confirmed'
    },
    {
      id: 3,
      email: `asafo.w@gmail.com`,
      fullName: 'asafo Yaw',
      date: '21/08/2024',
      time: '12:00 PM',
      reservationMade: 'MarketPlace',
      guests: '4',
      status: 'Canceled'
    },
    {
      id: 4,
      email: 'dkqw@gmail.com',
      fullName: 'Dk Qw',
      date: '29/08/2024',
      time: '12:00 PM',
      reservationMade: 'MarketPlace',
      guests: '2',
      status: 'Confirmed'
    },
    {
      id: 5,
      email: 'lawuate@gmail.com',
      fullName: 'Lawu Ate',
      date: '23/08/2024',
      time: '12:00 PM',
      reservationMade: 'MarketPlace',
      guests: '2',
      status: 'Confirmed'
    },
    {
      id: 6,
      email: 'laquazettezak@gmail.com',
      fullName: 'Laquazette Zak',
      date: '20/08/2024',
      time: '12:00 PM',
      reservationMade: 'MarketPlace',
      guests: '2',
      status: 'Pending'
    },
    {
      id: 7,
      email: 'dalimeal@gmail.com',
      fullName: 'Da Limeal',
      date: '23/08/2024',
      time: '12:00 PM',
      reservationMade: 'MarketPlace',
      guests: '2',
      status: 'Confirmed'
    },
    {
      id: 8,
      email: 'alish.coleman@gmail.com',
      fullName: 'Alish Coleman',
      date: '23/08/2024',
      time: '12:00 PM',
      reservationMade: 'MarketPlace',
      guests: '2',
      status: 'Pending'
    },
    {
      id: 9,
      email: 'ashley.halsey@gmail.com',
      fullName: 'Ashley Halsey',
      date: '23/08/2024',
      time: '12:00 PM',
      reservationMade: 'MarketPlace',
      guests: '2',
      status: 'Confirmed'
    },
    {
      id: 10,
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

  const checkAll = () => {
    const all = document.getElementById('all') as HTMLInputElement;
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      (checkbox as HTMLInputElement).checked = all.checked;
    });
  }
  
  
  const [selectingDay, setSelectingDay] = useState("");
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const handleDateClick = (day:Date) => {
    setSelectedDate(day);
    console.log(selectedDate)
    if(selectedDate){
      setSelectingDay(format(selectedDate, 'dd/MM/yyyy'));
    }
    // props.onClick;
    setFocusedDate(false);
    console.log(selectingDay)
  };
  
  const setDefaultFilter = () => {
    setFocusedFilter('');
    setSelectingDay('');
  }
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(e)

  }

  useEffect(() => {
    if(selectedDate){
      setSelectingDay(format(selectedDate, 'dd/MM/yyyy'));
    }
  }, [selectedDate])

  const [focusedFilter, setFocusedFilter] = useState('');


  const [focusedDate, setFocusedDate] = useState(false)

  const [focusedAddReservation, setFocusedAddReservation] = useState(false)

  const handleAddReservation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (e.currentTarget.querySelector('#email') as HTMLInputElement).value;
    const fullname = (e.currentTarget.querySelector('#fullname') as HTMLInputElement).value;
    const date = (e.currentTarget.querySelector('#date') as HTMLInputElement).value;
    const time = (e.currentTarget.querySelector('#time') as HTMLInputElement).value;
    const guests = (e.currentTarget.querySelector('#guests') as HTMLInputElement).value;
    const status = (e.currentTarget.querySelector('#status') as HTMLSelectElement).value;

   
    console.log(email, fullname, date, time, guests, status)

    setFocusedAddReservation(false)
  }

  console.log(selectingDay)

  const [searchResults, setSearchResults] = useState(reservations);

  const searchFilter = (e: any) => {
    const keyword = e.target.value;
    const results = reservations.filter((item) => {
      return item.fullName.toLowerCase().includes(keyword.toLowerCase());
    });
    setSearchResults(results);
  }

  return (
    <div>

      {
        focusedAddReservation &&
        <div>
          <div className="overlay " onClick={() => { setFocusedAddReservation(false) }}></div>
          <form className="sm:sidepopup lt-sm:popup lt-sm:w-full h-full gap-5" onSubmit={handleAddReservation}>
            <h1 className="text-3xl text-blacktheme font-[700]">Add Reservation</h1>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-flow-col w-full gap-2">
                <input placeholder="First Name" type="text" className="inputs" id="firstname" required />
                <input placeholder="Last Name" type="text" className="inputs " id="lastname" required />
              </div>
              <div className="flex flex-col gap-2">
                <input placeholder="Email" type="email" className="inputs" id="email" required />
              </div>
              <div className="flex flex-col gap-2">
                <input placeholder="Phone Number" type="text" className="inputs" id="phonenumber" required />
              </div>
              <div className="flex flex-col gap-2">
                <select name="places" id="places" className="inputs" >
                  <option value="Places" disabled>Places</option>
                  <option value="Pending">Main Room</option>
                  <option value="Confirmed">Outdoor</option>
                  <option value="Canceled">Terrace</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <select name="table" id="table" className="inputs" >
                  <option value="table" disabled>Places</option>
                  <option value="Pending">T-01</option>
                  <option value="Confirmed">Outdoor</option>
                  <option value="Canceled">Terrace</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary">Add Reservation</button>
          </form>
        </div>
      }
      {focusedDate &&
        <div>
          <div className="overlay" onClick={()=>{setFocusedDate(false)}}>
          </div>
          <div className="popup lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0">
            <OurCalendar onClick={handleDateClick}/>
          </div>
        </div>
      }
      <div className='flex justify-between mb-2'>
        <h1 className='text-3xl text-blacktheme font-[700]'>Reservations</h1>
        <button className='btn-primary' onClick={()=>{setFocusedAddReservation(true)}}>
          Add Reservation
        </button>
      </div>
      <div className="flex lt-sm:flex-col lt-sm:gap-2 justify-between">
        <div className="border rounded-[10px]">
          <div>
            <SearchBar SearchHandler={searchFilter}/>
          </div>
        </div>
        <div className="flex lt-sm:flex-wrap gap-4">
          <button onClick={()=>{setFocusedFilter('Confirmed')}} className={focusedFilter === 'Confirmed' ? 'btn-primary':'btn'}>
            Confirmed
          </button>
          <button onClick={()=>{setFocusedFilter('Canceled')}} className={focusedFilter === 'Canceled' ? 'btn-primary':'btn'}>
            Canceled
          </button>
          <button onClick={()=>{setFocusedFilter('Pending')}} className={focusedFilter === 'Pending' ? 'btn-primary':'btn'}>
            Pending
          </button>
          <button className={`gap-2 flex items-center ${selectingDay === '' ? 'btn ':'btn-primary '}`} onClick={()=>{setFocusedDate(true)}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.45826 2.08334C6.45826 1.91758 6.39241 1.7586 6.2752 1.64139C6.15799 1.52418 5.99902 1.45834 5.83326 1.45834C5.6675 1.45834 5.50852 1.52418 5.39131 1.64139C5.2741 1.7586 5.20826 1.91758 5.20826 2.08334V3.4C4.00826 3.49584 3.22159 3.73084 2.64326 4.31C2.06409 4.88834 1.82909 5.67584 1.73242 6.875H18.2674C18.1708 5.675 17.9358 4.88834 17.3566 4.31C16.7783 3.73084 15.9908 3.49584 14.7916 3.39917V2.08334C14.7916 1.91758 14.7257 1.7586 14.6085 1.64139C14.4913 1.52418 14.3323 1.45834 14.1666 1.45834C14.0008 1.45834 13.8419 1.52418 13.7246 1.64139C13.6074 1.7586 13.5416 1.91758 13.5416 2.08334V3.34417C12.9874 3.33334 12.3658 3.33334 11.6666 3.33334H8.33326C7.63409 3.33334 7.01242 3.33334 6.45826 3.34417V2.08334Z" fill={selectingDay === '' ? '#1E1E1E80':'white'}/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M1.66675 10C1.66675 9.30083 1.66675 8.67917 1.67758 8.125H18.3226C18.3334 8.67917 18.3334 9.30083 18.3334 10V11.6667C18.3334 14.8092 18.3334 16.3808 17.3567 17.3567C16.3809 18.3333 14.8092 18.3333 11.6667 18.3333H8.33341C5.19091 18.3333 3.61925 18.3333 2.64341 17.3567C1.66675 16.3808 1.66675 14.8092 1.66675 11.6667V10ZM14.1667 11.6667C14.3878 11.6667 14.5997 11.5789 14.756 11.4226C14.9123 11.2663 15.0001 11.0543 15.0001 10.8333C15.0001 10.6123 14.9123 10.4004 14.756 10.2441C14.5997 10.0878 14.3878 10 14.1667 10C13.9457 10 13.7338 10.0878 13.5775 10.2441C13.4212 10.4004 13.3334 10.6123 13.3334 10.8333C13.3334 11.0543 13.4212 11.2663 13.5775 11.4226C13.7338 11.5789 13.9457 11.6667 14.1667 11.6667ZM14.1667 15C14.3878 15 14.5997 14.9122 14.756 14.7559C14.9123 14.5996 15.0001 14.3877 15.0001 14.1667C15.0001 13.9457 14.9123 13.7337 14.756 13.5774C14.5997 13.4211 14.3878 13.3333 14.1667 13.3333C13.9457 13.3333 13.7338 13.4211 13.5775 13.5774C13.4212 13.7337 13.3334 13.9457 13.3334 14.1667C13.3334 14.3877 13.4212 14.5996 13.5775 14.7559C13.7338 14.9122 13.9457 15 14.1667 15ZM10.8334 10.8333C10.8334 11.0543 10.7456 11.2663 10.5893 11.4226C10.4331 11.5789 10.2211 11.6667 10.0001 11.6667C9.77907 11.6667 9.56711 11.5789 9.41083 11.4226C9.25455 11.2663 9.16675 11.0543 9.16675 10.8333C9.16675 10.6123 9.25455 10.4004 9.41083 10.2441C9.56711 10.0878 9.77907 10 10.0001 10C10.2211 10 10.4331 10.0878 10.5893 10.2441C10.7456 10.4004 10.8334 10.6123 10.8334 10.8333ZM10.8334 14.1667C10.8334 14.3877 10.7456 14.5996 10.5893 14.7559C10.4331 14.9122 10.2211 15 10.0001 15C9.77907 15 9.56711 14.9122 9.41083 14.7559C9.25455 14.5996 9.16675 14.3877 9.16675 14.1667C9.16675 13.9457 9.25455 13.7337 9.41083 13.5774C9.56711 13.4211 9.77907 13.3333 10.0001 13.3333C10.2211 13.3333 10.4331 13.4211 10.5893 13.5774C10.7456 13.7337 10.8334 13.9457 10.8334 14.1667ZM5.83341 11.6667C6.05443 11.6667 6.26639 11.5789 6.42267 11.4226C6.57895 11.2663 6.66675 11.0543 6.66675 10.8333C6.66675 10.6123 6.57895 10.4004 6.42267 10.2441C6.26639 10.0878 6.05443 10 5.83341 10C5.6124 10 5.40044 10.0878 5.24416 10.2441C5.08788 10.4004 5.00008 10.6123 5.00008 10.8333C5.00008 11.0543 5.08788 11.2663 5.24416 11.4226C5.40044 11.5789 5.6124 11.6667 5.83341 11.6667ZM5.83341 15C6.05443 15 6.26639 14.9122 6.42267 14.7559C6.57895 14.5996 6.66675 14.3877 6.66675 14.1667C6.66675 13.9457 6.57895 13.7337 6.42267 13.5774C6.26639 13.4211 6.05443 13.3333 5.83341 13.3333C5.6124 13.3333 5.40044 13.4211 5.24416 13.5774C5.08788 13.7337 5.00008 13.9457 5.00008 14.1667C5.00008 14.3877 5.08788 14.5996 5.24416 14.7559C5.40044 14.9122 5.6124 15 5.83341 15Z"  fill={selectingDay === '' ? '#1E1E1E80':'white'}/>
            </svg>

            Date
          </button>
          <button onClick={setDefaultFilter} className={(focusedFilter === '')&& (selectingDay==='') ? 'btn-primary':'btn'}>
            All
          </button>
        </div>
      </div>
      <div className='mt-4 lt-sm:overflow-x-scroll'>
        <table className=''>
          <thead className="">
            <tr className="" >
              <th className='hidden'>
                <input type="checkbox" onChange={checkAll} id="all" />
              </th>
              <th >Id</th>
              <th >Full Name</th>
              <th >Email</th>
              <th>Made From</th>
              <th >Date</th>
              <th >Time</th>
              <th >Guests</th>
              <th >Status</th>
              <th ></th>
            </tr>
          </thead>
          <tbody className='divide-y text-subblack'>
            {searchResults
            .filter(reservation => (focusedFilter === '' || reservation.status === focusedFilter)&&
            (selectingDay === "" || reservation.date === selectingDay)
          )
            .map(reservation => (
              <tr key={reservation.id}>
                <td className="hidden">
                  <input type="checkbox" />
                </td>
                <td>{reservation.id}</td>
                <td>{reservation.fullName}</td>
                <td>{reservation.email}</td>
                <td>{reservation.reservationMade}</td>
                <td>{reservation.date}</td>
                <td>{reservation.time}</td>
                <td>{reservation.guests}</td>
                <td className="">

                  <span className={`${statusStyle(reservation.status)} text-center py-[.1em] px-3  rounded-[10px]`}> 
                    {reservation.status}
                  </span>
                </td>
                <td>
                  <button className=''>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.08333 7C4.08333 7.30942 3.96042 7.60617 3.74162 7.82496C3.52283 8.04375 3.22609 8.16667 2.91667 8.16667C2.60725 8.16667 2.3105 8.04375 2.09171 7.82496C1.87292 7.60617 1.75 7.30942 1.75 7C1.75 6.69058 1.87292 6.39383 2.09171 6.17504C2.3105 5.95625 2.60725 5.83333 2.91667 5.83333C3.22609 5.83333 3.52283 5.95625 3.74162 6.17504C3.96042 6.39383 4.08333 6.69058 4.08333 7ZM8.16667 7C8.16667 7.30942 8.04375 7.60617 7.82496 7.82496C7.60616 8.04375 7.30942 8.16667 7 8.16667C6.69058 8.16667 6.39383 8.04375 6.17504 7.82496C5.95625 7.60617 5.83333 7.30942 5.83333 7C5.83333 6.69058 5.95625 6.39383 6.17504 6.17504C6.39383 5.95625 6.69058 5.83333 7 5.83333C7.30942 5.83333 7.60616 5.95625 7.82496 6.17504C8.04375 6.39383 8.16667 6.69058 8.16667 7ZM12.25 7C12.25 7.30942 12.1271 7.60617 11.9083 7.82496C11.6895 8.04375 11.3928 8.16667 11.0833 8.16667C10.7739 8.16667 10.4772 8.04375 10.2584 7.82496C10.0396 7.60617 9.91667 7.30942 9.91667 7C9.91667 6.69058 10.0396 6.39383 10.2584 6.17504C10.4772 5.95625 10.7739 5.83333 11.0833 5.83333C11.3928 5.83333 11.6895 5.95625 11.9083 6.17504C12.1271 6.39383 12.25 6.69058 12.25 7Z" fill="#1E1E1E" fill-opacity="0.5"/>
                    </svg>

                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ReservationsPage
