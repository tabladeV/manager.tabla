import SearchBar from "../../components/header/SearchBar"

const ReservationsPage = () => {

  const reservations = [
    {
      id: 1,
      restaurantName: 'Orchid Restaurant',
      fullName: 'John Doe',
      date: '10/10/2021',
      time: '12:00 PM',
      guests: '2',
      status: 'Pending'
    },
    {
      id: 2,
      restaurantName: 'IPON Restaurant',
      fullName: 'Kwame Dwayne',
      date: '11/12/2022',
      time: '12:00 PM',
      guests: '4',
      status: 'Confirmed'
    },
    {
      id: 3,
      restaurantName: `Mama's Kitchen`,
      fullName: 'asafo Yaw',
      date: '10/10/2021',
      time: '12:00 PM',
      guests: '4',
      status: 'Canceled'
    },
    {
      id:4,
      restaurantName: 'Orchid Restaurant',
      fullName: 'John Doe',
      date: '10/10/2021',
      time: '12:00 PM',
      guests: '2',
      status: 'Pending'
    },
    {
      id: 5,
      restaurantName: 'IPON Restaurant',
      fullName: 'Kwame Dwayne',
      date: '11/12/2022',
      time: '12:00 PM',
      guests: '4',
      status: 'Confirmed'
    },
    {
      id: 6,
      restaurantName: `Mama's Kitchen`,
      fullName: 'asafo Yaw',
      date: '10/10/2021',
      time: '12:00 PM',
      guests: '4',
      status: 'Canceled'
    },
    {
      id:7,
      restaurantName: 'Orchid Restaurant',
      fullName: 'John Doe',
      date: '10/10/2021',
      time: '12:00 PM',
      guests: '2',
      status: 'Pending'
    },
    {
      id: 8,
      restaurantName: 'IPON Restaurant',
      fullName: 'Kwame Dwayne',
      date: '11/12/2022',
      time: '12:00 PM',
      guests: '4',
      status: 'Confirmed'
    },
    {
      id: 9,
      restaurantName: `Mama's Kitchen`,
      fullName: 'asafo Yaw',
      date: '10/10/2021',
      time: '12:00 PM',
      guests: '4',
      status: 'Canceled'
    }
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




  return (
    <div>
      <div className='flex justify-between mb-2'>
        <h1 className='text-3xl text-blacktheme font-[700]'>Reservations</h1>
        <button className='btn-primary'>Add Reservation</button>
      </div>
      <div className="flex justify-between">
        <div className="border rounded-[10px]">
          <SearchBar />
        </div>
        <div className="flex gap-4">
          <button className='btn flex items-center'>
            Date 
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10L12 15L17 10" stroke="#1E1E1E80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button className='btn flex items-center'>
            Guest
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10L12 15L17 10" stroke="#1E1E1E80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button className='btn flex items-center'>
            Status
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10L12 15L17 10" stroke="#1E1E1E80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button className='btn flex items-center'>
            More
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10L12 15L17 10" stroke="#1E1E1E80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      <div className='mt-4'>
        <table className='w-full'>
          <thead className="">
            <tr className="" >
              <th className='text-left'>
                <input type="checkbox" onChange={checkAll} id="all" />
              </th>
              <th className='text-left'>Id</th>
              <th className='text-left'>Restaurant Name</th>
              <th className='text-left'>Full Name</th>
              <th className='text-left'>Date</th>
              <th className='text-left'>Time</th>
              <th className='text-left'>Guests</th>
              <th className='text-left'>Status</th>
            </tr>
          </thead>
          <tbody className='divide-y text-subblack'>
            {reservations.map(reservation => (
              <tr key={reservation.id}>
                <td>
                  <input type="checkbox" />
                </td>
                <td>{reservation.id}</td>
                <td>{reservation.restaurantName}</td>
                <td>{reservation.fullName}</td>
                <td>{reservation.date}</td>
                <td>{reservation.time}</td>
                <td>{reservation.guests}</td>
                <td className="">

                  <span className={`${statusStyle(reservation.status)} text-center py-[.1em] px-3  rounded-[10px]`}> 
                    {reservation.status}
                  </span>
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
