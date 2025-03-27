"use client"

import React, {useEffect, useMemo, useState} from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useTranslation } from "react-i18next"
import Filter from "./Filter"
import { BaseRecord, useList } from "@refinedev/core"
import { format } from "date-fns"
import IntervalCalendar from "../Calendar/IntervalCalendar"
import { use } from "i18next"
import { useDarkContext } from "../../context/DarkContext"


interface range {
  start: string,
  end: string
}

export default function ReservationSource() {

  const { darkMode } = useDarkContext()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data, isLoading, error } = useList<BaseRecord>({
    resource: 'api/v1/dashboard/reservations-by-source',
    filters: [
      {
        field: "end_date",
        operator: "eq",
        value: endDate === ''?'':endDate ,
      },
      {
        field: "start_date",
        operator: "eq",
        value: startDate === ''?'':startDate,
      },
    ],

  })
  
  const [reservations, setReservations] = useState<BaseRecord[]>([])
  useEffect(() => {
    if (data?.data) {
      setReservations(data.data)
    }
  }, [data])

  interface ReservationAction {
    action: string;
    count: number;
    fill: string;
  }

  const [timeRange, setTimeRange] = useState<string>('last_7_days')

  const [generateChartData, setGenerateChartData] = useState<ReservationAction[]>([])

  const [chartData, setChartData] = useState<ReservationAction[]>([]);
  useEffect(() => {
    setChartData([
      { action: "Market Place", count: reservations.find(a => a.source === "MARKETPLACE")?.count || 0, fill: "#3F72AF" },
      { action: "Back Office", count: reservations.find(a => a.source === "BACK_OFFICE")?.count || 0, fill: "#88AB61" },
      { action: "Third Party", count: reservations.find(a => a.source === "THIRD_PARTY")?.count || 0, fill: "#FFA500" },
      {action : "Widget", count: reservations.find(a => a.source === "WIDGET")?.count || 0, fill: "#7b2cbf"},
      {action : "Walk In", count: reservations.find(a => a.source === "WALK_IN")?.count || 0, fill: "#b75d69"}
    ])
}, [reservations])


 // Update chart data when time range changes
  useEffect(() => {
    setChartData(generateChartData);
  }, [timeRange, generateChartData]);


  const totalActions = useMemo(() => {
    return chartData.reduce((acc: number, curr: ReservationAction) => acc + curr.count, 0)
  }, [chartData])

 const [showDay, setShowDay] = useState(false)

  

  const handleDateClick = (range: { start: Date, end: Date }) => {
    setStartDate(format(range.start, 'yyyy-MM-dd'));
    setEndDate(format(range.end, 'yyyy-MM-dd'));

  }

 

  const {t}= useTranslation()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="bg-white p-2  dark:bg-bgdarktheme text-blacktheme dark:text-textdarktheme rounded-[20px] lt-sm:w-full overflow-hidden">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold my-2 px-2">{t('overview.charts.reservationsSource.title')}</h2>
        <div className="px-2 flex justify-end gap-2">
          {/* <Filter onClick={(range: string) => setTimeRange(range)} /> */}
          <button onClick={()=>{setShowDay(true)}} className="text-sm btn flex items-center gap-2 font-[600] text-subblack dark:border-none dark:bg-darkthemeitems dark:text-white">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M1.375 2.0625C1.375 1.88016 1.44743 1.7053 1.57636 1.57636C1.7053 1.44743 1.88016 1.375 2.0625 1.375H8.9375C9.11984 1.375 9.2947 1.44743 9.42364 1.57636C9.55257 1.7053 9.625 1.88016 9.625 2.0625V3.01858C9.62495 3.26168 9.52834 3.4948 9.35642 3.66667L6.875 6.14808V9.55075C6.87501 9.6367 6.85305 9.72122 6.81121 9.7963C6.76936 9.87137 6.70902 9.9345 6.63591 9.97968C6.5628 10.0249 6.47935 10.0506 6.39349 10.0545C6.30763 10.0583 6.2222 10.0402 6.14533 10.0017L4.44171 9.15017C4.34654 9.10259 4.26651 9.02945 4.21057 8.93894C4.15463 8.84844 4.125 8.74415 4.125 8.63775V6.14808L1.64358 3.66667C1.47166 3.4948 1.37505 3.26168 1.375 3.01858V2.0625Z" fill={darkMode ? '#ffffff':'#1e1e1e80'} fillOpacity="1"/>
              </svg>
              {t('overview.buttons.filter')}
            </button>
            <button onClick={()=>{setStartDate('');setEndDate('')}} className="btn-primary flex items-center gap-2">
              All
            </button>
        </div>
        
      </div>
      <div>
        {/* <div className="flex items-center justify-center gap-2">
          <TrendingUp size={24} />
          <span className="text-sm font-[600] text-gray-600 dark:text-gray-200">{t('overview.charts.topUserActions.subtitle')}</span>
          {timeRange && (
            <span className="text-sm text-gray-600 dark:text-gray-200">
              {`${timeRange.start} to ${timeRange.end}`}
            </span>
          )}
        </div> */}
      </div>
      <div className="px-6 py-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{ background: 'white', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="action"
                innerRadius={60}
                outerRadius={95}
                strokeWidth={5}
                stroke={darkMode ? '#161618':'#fff'}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="text-2xl font-bold fill-blacktheme dark:fill-white"
                          >
                            {totalActions.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="text-sm fill-blacktheme dark:fill-white"
                          >
                            {t('overview.charts.reservationsSource.label')}
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-5 mb-2"> 
        <div className="flex gap-3 items-center">
            <div className="h-3 w-3 rounded-full bg-bluetheme"></div>
            <span className="text-sm text-gray-600 dark:text-gray-200">{t('overview.charts.reservationsSource.legend.MarketPlace')}</span>
        </div>
        <div className="flex gap-3 items-center">
            <div className="h-3 w-3 rounded-full bg-greentheme"></div>
            <span className="text-sm text-gray-600 dark:text-gray-200">{t('overview.charts.reservationsSource.legend.BackOffice')}</span>
        </div>
        <div className="flex gap-3 items-center">
            <div className="h-3 w-3 rounded-full bg-orangetheme"></div>
            <span className="text-sm text-gray-600 dark:text-gray-200">{t('overview.charts.reservationsSource.legend.ThirdParty')}</span>
        </div>
        <div className="flex gap-3 items-center">
            <div className="h-3 w-3 rounded-full bg-purpletheme"></div>
            <span className="text-sm text-gray-600 dark:text-gray-200">{t('overview.charts.reservationsSource.legend.Widget')}</span>
        </div>
        <div className="flex gap-3 items-center">
            <div className="h-3 w-3 rounded-full bg-blushtheme"></div>
            <span className="text-sm text-gray-600 dark:text-gray-200">{t('overview.charts.reservationsSource.legend.WalkIn')}</span>
        </div>
      </div>
      {showDay &&
        <div>
          <div className='overlay bg-transparent' onClick={()=>{setShowDay(false)}}/>
          <div className="popup lt-sm:w-full h-[50vh] lt-sm:h-[70vh] z-[250] lt-sm:bottom-0 bg-white dark:bg-bgdarktheme">
            <IntervalCalendar onRangeSelect={handleDateClick} />
          </div>
        </div>
    }
    </div>
  )
}