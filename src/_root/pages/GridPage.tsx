"use client"

import { useState, useEffect, useRef } from "react"
import { addHours, format, startOfHour, isBefore, setMinutes, endOfDay, set } from "date-fns"
import { Link } from "react-router-dom"

const halfHours = ['00', '30']

// Sample reservations object
const reservations: { [key: string]: { name: string; people: number }[] } = {
  "16:00": [{ name: "James George", people: 4 }, { name: "John Doe", people: 2 }],
  "18:30": [{ name: "Alice Smith", people: 2 }],
  "20:00": [{ name: "Bob Johnson", people: 3 }],
  "20:30": [{ name: "Alex Geul", people: 1 }, { name: "Jane Doe", people: 2 }],
}

const GridPage = () => {
  const [visibleHours, setVisibleHours] = useState<Date[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  useEffect(() => {
    const now = startOfHour(new Date())
    const midnight = endOfDay(now)
    const allHours: Date[] = []
    let currentHour = now

    while (isBefore(currentHour, midnight) || format(currentHour, 'HH:mm') === '00:00') {
      allHours.push(currentHour)
      currentHour = addHours(currentHour, 1)
    }

    setVisibleHours(allHours)
  }, [])

  const isBreakfast = (date: Date) => {
    const hour = date.getHours()
    return hour >= 6 && hour < 11
  }

  const isLunch = (date: Date) => {
    const hour = date.getHours()
    return hour >= 11 && hour < 20
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current!.offsetLeft)
    setScrollLeft(scrollRef.current!.scrollLeft)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current!.offsetLeft
    const walk = (x - startX) * 2
    scrollRef.current!.scrollLeft = scrollLeft - walk
  }

  const [focusedAddReservation, setFocusedAddReservation] = useState(false)

  const [addingReservation, setAddingReservation] = useState('')

  function addReservation(time: string) {
    console.log('Add reservation at', time)
    setFocusedAddReservation(true)
    setAddingReservation(time)
  }

  function handleAddReservation(e: React.FormEvent) {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const firstName = (form.elements.namedItem('firstname') as HTMLInputElement).value
    const lastName = (form.elements.namedItem('lastname') as HTMLInputElement).value
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const phoneNumber = (form.elements.namedItem('phonenumber') as HTMLInputElement).value
    const place = (form.elements.namedItem('places') as HTMLSelectElement).value
    const table = (form.elements.namedItem('table') as HTMLSelectElement).value

    console.log('Add reservation', {
      time: addingReservation,
      firstName,
      lastName,
      email,
      phoneNumber,
      place,
      table,
    })

    reservations[addingReservation] = [
      ...(reservations[addingReservation] || []),
      {
        name: `${firstName} ${lastName}`,
        people: 4,
      },
    ]

    setFocusedAddReservation(false)
  }


  return (
    <div className="flex flex-col ">
      {
        focusedAddReservation &&
        <div>
          <div className="overlay " onClick={() => { setFocusedAddReservation(false) }}></div>
          <form className="sm:sidepopup lt-sm:popup lt-sm:h-[70vh] lt-sm:w-full lt-sm:bottom-0 h-full gap-5" onSubmit={handleAddReservation}>
            <h1 className="text-3xl text-blacktheme font-[700]">Add Reservation</h1>
            
            <div className="flex flex-col gap-2">
              <div className="flex flex-row w-full gap-2">
                <input placeholder="First Name" type="text" className="inputs" id="firstname" required />
                <input placeholder="Last Name" type="text" className="inputs " id="lastname" required />
              </div>
              <input placeholder="Email" type="email" className="inputs" id="email" required />
              <input placeholder="Phone Number" type="text" className="inputs" id="phonenumber" required />
              <select name="places" id="places" className="inputs" >
                <option value="Places" disabled>Places</option>
                <option value="Pending">Main Room</option>
                <option value="Confirmed">Outdoor</option>
                <option value="Canceled">Terrace</option>
              </select>
              <select name="table" id="table" className="inputs" >
                <option value="table" disabled>Places</option>
                <option value="Pending">T-01</option>
                <option value="Confirmed">Outdoor</option>
                <option value="Canceled">Terrace</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">Add Reservation</button>
          </form>
        </div>
      }
      <div className="flex mb-4 justify-between items-center">
        <h1 className="">Grid</h1>
        <Link to="/agenda" className="btn">Navigate to Agenda  {'>'}</Link>
      </div>
      <div
        className="overflow-x-scroll mx-auto cursor-grab max-w-fit w-full no-scrollbar bg-white"
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {/* Hour headers */}
        <div className="flex  sticky top-0 bg-background z-10">
          <div className="w-20 border-b  shrink-0 bg-white  h-10 z-20"></div>
          {visibleHours.map((hour) => (
            <div key={hour.toISOString()} className="w-40 border-b shrink-0 text-center py-2 font-medium border-l">
              {format(hour, 'HH:mm')}
            </div>
          ))}
        </div>

        {/* Reservation grid */}
        {halfHours.map((minutes) => (
          <div key={minutes} className="flex  ">
            <div className="w-20 shrink-0 py-4  border-b text-right pr-2 font-medium  bg-white z-10 min-h-[14em] ">--:{minutes}</div>
            {visibleHours.map((hour) => {
              const slotTime = setMinutes(hour, parseInt(minutes))
              const timeKey = format(slotTime, 'HH:mm')
              const reservation = reservations[timeKey]

              return (
                <div key={`${hour.toISOString()}-${minutes}`} className="w-40 border-b shrink-0 flex flex-col  items-center p-1 justify-center gap-2 border-l relative">
                  
                  {minutes === '00' && (
                    
                    <div className={`w-full top-0 left-0 right-0 h-4 flex justify-between px-2 text-subblack bg-softgreytheme`} >
                      <div className="text-xs text-center font-semibold">{isBreakfast(hour) ? 'Breakfast' : isLunch(hour) ? 'Lunch' : 'Dinner'}</div>
                      <div className="text-xs text-center flex items-center gap-1 font-semibold">
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5.83333 5.41668V6.25002H0V5.41668C0 5.41668 0 3.75002 2.91667 3.75002C5.83333 3.75002 5.83333 5.41668 5.83333 5.41668ZM4.375 1.45835C4.375 1.16992 4.28947 0.887964 4.12923 0.648142C3.96898 0.40832 3.74122 0.221402 3.47475 0.111024C3.20827 0.000646623 2.91505 -0.0282332 2.63216 0.0280369C2.34927 0.084307 2.08942 0.2232 1.88547 0.427151C1.68152 0.631103 1.54262 0.890953 1.48635 1.17384C1.43008 1.45673 1.45896 1.74995 1.56934 2.01643C1.67972 2.2829 1.86664 2.51066 2.10646 2.67091C2.34628 2.83115 2.62824 2.91668 2.91667 2.91668C3.30344 2.91668 3.67437 2.76304 3.94786 2.48955C4.22135 2.21606 4.375 1.84512 4.375 1.45835ZM5.80833 3.75002C6.06448 3.94824 6.27407 4.2002 6.42236 4.48814C6.57066 4.77609 6.65405 5.09304 6.66667 5.41668V6.25002H8.33333V5.41668C8.33333 5.41668 8.33333 3.90418 5.80833 3.75002ZM5.41667 1.53319e-05C5.12991 -0.00131848 4.8495 0.0844033 4.6125 0.245849C4.8656 0.599489 5.00169 1.02347 5.00169 1.45835C5.00169 1.89323 4.8656 2.31721 4.6125 2.67085C4.8495 2.83229 5.12991 2.91802 5.41667 2.91668C5.80344 2.91668 6.17437 2.76304 6.44786 2.48955C6.72135 2.21606 6.875 1.84512 6.875 1.45835C6.875 1.07157 6.72135 0.700642 6.44786 0.427151C6.17437 0.153661 5.80344 1.53319e-05 5.41667 1.53319e-05Z" fill="#1E1E1E" fill-opacity="0.5"/>
                        </svg>

                        {['00', '30'].reduce((count, min) => {
                          const timeKey = format(setMinutes(hour, parseInt(min)), 'HH:mm');
                          return count + (reservations[timeKey] ? reservations[timeKey].length : 0);
                        }, 0)}
                      </div>
                    </div>
                  )}
                  <div className="flex h-[10em] flex-col p-1 gap-1 justify-start items-center">
                    {reservation ? (
                      reservation.map((r) => (
                        <div key={r.name} className="border-[1px] w-full text-center border-solid border-subblack p-2 rounded-lg">
                          <div className="font-semibold">{r.name}</div>
                          <div className="text-sm">{r.people} people</div>
                        </div>
                      ))
                    ) : null}
                    
                  </div>
                    <button className="btn-primary text-[.8rem] text-center bottom-0" onClick={() => addReservation(format(hour, 'HH') + ':' + minutes)}>Add Reservation</button>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default GridPage
