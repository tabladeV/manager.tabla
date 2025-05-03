"use client"

import { useState, useEffect } from "react"
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
} from "date-fns"
import { useTranslation } from "react-i18next"
import { useDateContext } from "../../context/DateContext"
import { Link, useNavigate } from "react-router-dom"
import { ChevronRight, Clock, TicketIcon as Tickets, Users } from "lucide-react"
import { useList } from "@refinedev/core"
import { DevOnly } from "../../components/DevOnly"

// Define types for API responses
type MonthRes = {
  date: string
  isBlocked: boolean
  total_guests: number
  total_reservations: number
}

type AvailabilityDay = {
  isAvailable: boolean
}

const CalendarGrid = () => {
  const { t } = useTranslation()
  const { chosenDay, setChosenDay } = useDateContext()
  const navigate = useNavigate()

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableDays, setAvailableDays] = useState<AvailabilityDay[]>([])
  const [monthlyRes, setMonthlyRes] = useState<MonthRes[]>([])

  // Set page title
  useEffect(() => {
    document.title = "Calendar Grid - Tabla | Taste Morocco's Best"
  }, [])

  // Fetch availability data
  const { refetch: getAvailableDays } = useList({
    resource: `api/v1/bo/availability/work-shifts/${format(currentMonth, "yyyy-MM")}/`,
    queryOptions: {
      onSuccess: (data) => {
        setAvailableDays(data.data as unknown as AvailabilityDay[])
      },
    },
  })

  // Fetch reservation data
  const { refetch: getAvailableMonthReservations } = useList({
    resource: `api/v1/bo/reservations/calendar/${format(currentMonth, "yyyy/MM")}/`,
    queryOptions: {
      onSuccess: (data) => {
        setMonthlyRes(data.data as unknown as MonthRes[])
      },
    },
  })

  // Refetch data when month changes
  useEffect(() => {
    getAvailableDays()
    getAvailableMonthReservations()
  }, [currentMonth])

  // Calendar calculations
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDay = getDay(monthStart)

  // Week day headers
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) =>
    t(`calendar.weekDays.${day.toLowerCase()}`, day),
  )

  // Navigation handlers
  const handleDateClick = (day: Date) => {
    setChosenDay(day)
    navigate("/agenda/grid")
  }

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  return (
    <DevOnly>
      <div className="select-none flex flex-col">
        {/* Header */}
        <div className="flex mb-4 justify-between items-center">
          <h1 className="text-blacktheme dark:text-textdarktheme">{t("calendar.title", "Calendar Grid")}</h1>
          <Link
            to="/agenda/grid"
            className="flex items-center gap-2 text-greentheme hover:text-greentheme dark:hover:text-greentheme transition-colors"
          >
            {t("calendar.viewAgenda", "View Grid")} <ChevronRight size={18} />
          </Link>
        </div>

        {/* Month navigation */}
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
            {daysInMonth.map((day, index) => {
              const isSelected = isSameDay(day, chosenDay)
              const isTodayDate = isToday(day)
              const dayData = monthlyRes[index] || { total_guests: 0, total_reservations: 0 }
              const isAvailable = availableDays[index]?.isAvailable

              return (
                <div
                  key={format(day, "yyyy-MM-dd")}
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

                    {isAvailable  ? (
                      <div className="flex items-center gap-1 bg-softgreentheme rounded-xl py-1 px-2 text-greentheme text-sm">
                        <span className="lt-sm:hidden block"> Open </span> <Clock size={13} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-softredtheme rounded-xl py-1 px-2 text-redtheme text-sm">
                        <span className="lt-sm:hidden block">Closed</span> <Clock size={13} />
                      </div>
                    )}
                  </div>

                  {/* Reservation info */}
                  {dayData.total_reservations > 0 && (
                    <div className="mt-1 space-y-1">
                      <div className="text-sm flex items-center gap-2 p-1 rounded dark:bg-darkthemeitems bg-darkthemeitems/10 text-darkthemeitems dark:text-textdarktheme truncate">
                        <Tickets size={17} /> {dayData.total_reservations}{" "}
                        {dayData.total_reservations === 1 ? "Reservation" : "Reservations"}
                      </div>

                      <div className="text-sm flex items-center gap-2 p-1 rounded dark:bg-darkthemeitems/40 bg-darkthemeitems/5 text-darkthemeitems dark:text-textdarktheme truncate">
                        <Users size={17} /> {dayData.total_guests} {dayData.total_guests === 1 ? "Person" : "People"}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

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
