"use client"

import { useState, useMemo, useEffect } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isToday,
  parseISO,
} from "date-fns"
import { useTranslation } from "react-i18next"
import { useDateContext } from "../../context/DateContext"
import { useDarkContext } from "../../context/DarkContext"
import { Link, useNavigate } from "react-router-dom"
import { Book, BookA, ChevronRight, Tickets, TicketsPlane, Users } from "lucide-react"
import { BaseRecord, useList } from "@refinedev/core"
import { DevOnly } from "../../components/DevOnly"

// Mock data for demonstration - replace with your actual data structure
const MOCK_AVAILABLE_DAYS = Array(31).fill(null).map((_, i) => ({
  day: i + 1,
  isAvailable: Math.random() > 0.3, // 70% chance of being available
}))

const MOCK_RESERVATIONS = [
  {
    id: "1",
    date: "2025-04-15",
    time: "12:30",
    full_name: "John Smith",
    number_of_guests: "2",
    status: "confirmed",
  },
  {
    id: "2",
    date: "2025-04-15",
    time: "13:00",
    full_name: "Alice Johnson",
    number_of_guests: "4",
    status: "confirmed",
  },
  {
    id: "3",
    date: "2025-04-15",
    time: "19:30",
    full_name: "Robert Brown",
    number_of_guests: "2",
    status: "confirmed",
  },
  {
    id: "4",
    date: "2025-04-20",
    time: "18:00",
    full_name: "Emma Davis",
    number_of_guests: "6",
    status: "confirmed",
  },
  {
    id: "5",
    date: "2025-04-25",
    time: "20:30",
    full_name: "Michael Wilson",
    number_of_guests: "2",
    status: "confirmed",
  },
]

interface Reservation {
  id: string
  date: string
  time: string
  full_name: string
  number_of_guests: string
  status: string
}

const CalendarGrid = () => {

    useEffect(() => {
    document.title = "Calendar Grid - Tabla | Taste Morocco's Best "
    }, []) 

    
    const { t } = useTranslation()
    const { darkMode } = useDarkContext()
    const { chosenDay, setChosenDay } = useDateContext()
    const navigate = useNavigate()
    
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(chosenDay)

    const [availableDays, setAvailableDays] = useState<{ isAvailable: boolean }[]>([])
    
    const { data: dates, isFetching: loadingDates, refetch: getAvailableDays } = useList({
        resource: `api/v1/bo/subdomains/availability/${format(currentMonth,'yyyy-MM')}/`,
        queryOptions: {
          onSuccess: (data) => {
            setAvailableDays(data.data as unknown as { isAvailable: boolean }[])
            console.log("Available days:", data.data)
          }
        },


      });

  // Get days of current month
  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth])
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth])
  const daysInMonth = useMemo(
    () => eachDayOfInterval({ start: monthStart, end: monthEnd }),
    [monthStart, monthEnd]
  )

  // Get day of week of first day (0 = Sunday, 1 = Monday, etc.)
  const startDay = useMemo(() => getDay(monthStart), [monthStart])

  // Group reservations by date (using mock data)
  const monthlyReservations = useMemo(() => {
    const reservationsByDate: Record<string, Reservation[]> = {}
    
    // Only include reservations for the current month
    const currentMonthStr = format(currentMonth, "yyyy-MM")
    
    MOCK_RESERVATIONS.forEach((reservation) => {
      if (reservation.date.startsWith(currentMonthStr)) {
        const dateKey = reservation.date
        if (!reservationsByDate[dateKey]) {
          reservationsByDate[dateKey] = []
        }
        reservationsByDate[dateKey].push(reservation)
      }
    })
    
    return reservationsByDate
  }, [currentMonth])

  // Handle date selection
  const handleDateClick = (day: Date) => {
    setSelectedDate(day)
    setChosenDay(day) // Update the chosen day in context
    navigate("/agenda/grid") // Navigate to reservation Grid page
    
    // Here you would typically trigger your existing reservation component
    console.log(`Selected date: ${format(day, "yyyy-MM-dd")}`)
  }

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  // Check if a day is available for booking (using mock data)
  const isDayAvailable = (day: Date) => {
    const dayOfMonth = parseInt(format(day, "d")) - 1
    return MOCK_AVAILABLE_DAYS[dayOfMonth]?.isAvailable
  }

  // Get reservation count for a specific day
  const getReservationCount = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd")
    return monthlyReservations[dateKey]?.length || 0
  }

  // Generate week day headers
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => 
    t(`calendar.weekDays.${day.toLowerCase()}`, day)
  )

  return (
    <DevOnly>
    <div className="select-none flex flex-col">
      <div className="flex mb-4 justify-between items-center">
        <h1 className="text-blacktheme dark:text-textdarktheme">{t("calendar.title", "Calendar Grid")}</h1>
        <Link to="/agenda/grid" className="flex items-center gap-2 text-greentheme hover:text-greentheme dark:hover:text-greentheme transition-colors">
          {t("calendar.viewAgenda", "View Grid")} <ChevronRight  size={18}/>
        </Link>
      </div>

      {/* Calendar navigation */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-softgreytheme dark:hover:bg-darkthemeitems transition-colors"
          aria-label="Previous month"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blacktheme dark:text-textdarktheme"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">
          {format(currentMonth, "MMMM yyyy")}
        </h2>

        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-softgreytheme dark:hover:bg-darkthemeitems transition-colors"
          aria-label="Next month"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blacktheme dark:text-textdarktheme"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white dark:bg-bgdarktheme rounded-lg shadow overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-softgreytheme dark:border-darkthemeitems">
          {weekDays.map((day, index) => (
            <div key={index} className="py-2 text-center font-medium text-blacktheme dark:text-textdarktheme">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before the start of the month */}
          {Array.from({ length: startDay }).map((_, index) => (
            <div
              key={`empty-start-${index}`}
              className="h-28 lt-md:h-24 border-b border-r border-softgreytheme dark:border-darkthemeitems p-1"
            />
          ))}

          {/* Actual days of the month */}
          {daysInMonth.map((day,index) => {
            const dateKey = format(day, "yyyy-MM-dd")
            const reservationCount = getReservationCount(day)
            const isAvailable = isDayAvailable(day)
            const isSelected = isSameDay(day, selectedDate)
            const isTodayDate = isToday(day)
            // Removed unused variable

            return (
              <div
                key={dateKey}
                onClick={() => handleDateClick(day)}
                className={`h-28 lt-md:h-24 border-b border-r border-softgreytheme dark:border-darkthemeitems p-1 relative cursor-pointer transition-colors
                  ${isSelected ? "bg-softgreentheme dark:bg-darkthemeitems" : ""}
                  ${!isSameMonth(day, currentMonth) ? "text-subblack dark:text-softwhitetheme" : ""}
                  hover:bg-softgreytheme dark:hover:bg-darkthemeitems
                `}
              >
                <div className="flex justify-between">
                  <span
                    className={`
                    inline-flex h-6 w-6 items-center justify-center rounded-full text-sm
                    ${isTodayDate ? "bg-greentheme text-white" : "text-blacktheme dark:text-textdarktheme"}
                  `}
                  >
                    {format(day, "d")}
                  </span>

                  {availableDays && availableDays[index]?.isAvailable ? (
                    <span
                      className="h-2 w-2 rounded-full bg-greentheme"
                      title={t("calendar.available", "Available")}
                    ></span>
                  ):(
                    <span
                      className="h-2 w-2 rounded-full bg-red-500"
                      title={t("calendar.notAvailable", "Not Available")}
                    ></span>
                  )}
                </div>

                <div className="mt-1 text-sm text-blacktheme dark:text-textdarktheme">
                  {reservationCount > 0 && (
                    <div className="text-sm flex items-center gap-2 p-1 mb-1 rounded bg-greentheme text-textdarktheme truncate cursor-pointer ">
                      <Tickets size={17} /> {reservationCount} Reservations
                    </div>
                  )}
                </div>

                {/* Reservation preview (show up to 2) */}
                <div className="mt-1 overflow-hidden">
                  

                    {reservationCount > 0 && (
                      <div className="text-sm flex items-center gap-2 p-1 mb-1 rounded dark:bg-softgreentheme/50 bg-softgreentheme/20 text-greentheme  dark:text-textdarktheme truncate cursor-pointer ">
                        <Users size={17}/> 10 People
                      </div>
                    )}
                    
                </div>
              </div>
            )
            
          }
          
          // Removed unnecessary increment
        )
          }

          {/* Empty cells for days after the end of the month */}
          {Array.from({ length: (7 - ((daysInMonth.length + startDay) % 7)) % 7 }).map((_, index) => (
            <div
              key={`empty-end-${index}`}
              className="h-28 lt-md:h-24 border-b border-r border-softgreytheme dark:border-darkthemeitems p-1"
            />
          ))}
        </div>
      </div>
    </div>
    </DevOnly>
  )
}

export default CalendarGrid
