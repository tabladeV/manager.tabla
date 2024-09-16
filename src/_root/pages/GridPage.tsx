"use client"

import { useState, useEffect, useRef } from "react"
import { addHours, format, startOfHour, isBefore, setMinutes, endOfDay, set } from "date-fns"

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
    return hour >= 11 && hour < 17
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
          <form className="sidepopup h-full gap-5" onSubmit={handleAddReservation}>
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
      <div className="flex justify-between items-center">
        <h1 className="mb-4">Grid</h1>
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
          <div className="w-20 border-b  shrink-0"></div>
          {visibleHours.map((hour) => (
            <div key={hour.toISOString()} className="w-40 border-b shrink-0 text-center py-2 font-medium border-l">
              {format(hour, 'HH:mm')}
            </div>
          ))}
        </div>

        {/* Reservation grid */}
        {halfHours.map((minutes) => (
          <div key={minutes} className="flex ">
            <div className="w-20 shrink-0 py-4 border-b  text-right pr-2 font-medium">:{minutes}</div>
            {visibleHours.map((hour) => {
              const slotTime = setMinutes(hour, parseInt(minutes))
              const timeKey = format(slotTime, 'HH:mm')
              const reservation = reservations[timeKey]

              return (
                <div key={`${hour.toISOString()}-${minutes}`} className="w-40 border-b  shrink-0 flex flex-col  items-center p-1 justify-center gap-2 border-l relative">
                  {minutes === '00' && (
                    <div className={`absolute top-0 left-0 right-0 h-1 ${isBreakfast(hour) ? 'bg-green-200' : isLunch(hour) ? 'bg-yellow-200' : ''}`} />
                  )}
                  <div className="flex h-full flex-col p-1 gap-1 justify-start items-center">
                    {reservation ? (
                      reservation.map((r) => (
                        <div key={r.name} className="border-[1px] w-full text-center border-solid border-subblack p-2 rounded-lg">
                          <div className="font-semibold">{r.name}</div>
                          <div className="text-sm">{r.people} people</div>
                        </div>
                      ))
                    ) : null}
                  </div>
                    <button className="btn-primary text-center bottom-0" onClick={() => addReservation(format(hour, 'HH') + ':' + minutes)}>Add</button>
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
