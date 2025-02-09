"use client"

import React, { useState, useEffect, useMemo } from "react"
import { FilterIcon, TrendingUp, View } from "lucide-react"
import { Label, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useTranslation } from "react-i18next"
import Filter from "./Filter"
import { BaseRecord, useList } from "@refinedev/core"
import IntervalCalendar from "../Calendar/IntervalCalendar"
import { format } from "date-fns"
import { start } from "repl"

interface Range {
  start: string,
  end: string
}

interface ReservationAction {
  action: string;
  count: number;
}

interface ChartType {
  action: string;
  count: number;
  fill: string;
}

export default function TopActions() {
  const { t } = useTranslation()
  const [timeRange, setTimeRange] = useState<string>()
  const [chartData, setChartData] = useState<ChartType[]>([])
  const [totalActions, setTotalActions] = useState(0)

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data: reservationsActionsData, isLoading: loading, error: err } = useList<ReservationAction>({
    resource: 'api/v1/dashboard/top-actions',
    filters: [
      {
        field: "end_date",
        operator: "eq",
        value: startDate === ''?'':startDate,
      },
      {
        field: "start_date",
        operator: "eq",
        value: endDate === ''?'':endDate,
      },
    ],

  })

  

  useEffect(() => {
    if (reservationsActionsData?.data) {
      const actions = reservationsActionsData.data
      setChartData([
        { action: "Confirmed", count: actions.find(a => a.action === "APPROVED")?.count || 0, fill: "#88AB61" },
        { action: "Canceled", count: actions.find(a => a.action === "CANCELED")?.count || 0, fill: "#FF4B4B" },
        { action: "Pending", count: actions.find(a => a.action === "PENDING")?.count || 0, fill: "#3F72AF" },
        { action: "Fulfilled", count: actions.find(a => a.action === "FULFILLED")?.count || 0, fill: "#7b2cbf" },
        { action: "Seated", count: actions.find(a => a.action === "SEATED")?.count || 0, fill: "#FFA500" },
      ])
    }
  }, [reservationsActionsData])

  useEffect(() => {
    if (chartData.length > 0) {
      setTotalActions(chartData[0].count + chartData[1].count + chartData[2].count + chartData[3].count + chartData[4].count)
    }
  }, [chartData])

  const [showDay, setShowDay] = useState(false)

  

  const handleDateClick = (range: { start: Date, end: Date }) => {
    setStartDate(format(range.start, 'yyyy-MM-dd'));
    setEndDate(format(range.end, 'yyyy-MM-dd'));

  }

 

  return (
    <div className={` ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme text-textdarktheme' : 'bg-white text-blacktheme'}  rounded-[20px] lt-sm:w-full overflow-hidden`}>
      <div className="px-6 py-4 flex justify-between">
        <h2 className="text-xl font-bold mb-2">{t('overview.charts.topUserActions.title')}</h2>
        {/* <Filter onClick={() => setTimeRange('last_7_days')} /> */}
        <div className="flex gap-2">
          <button onClick={()=>{setShowDay(true)}} className={`text-sm btn flex items-center gap-2 font-[600] text-subblack ${localStorage.getItem('darkMode')==='true'?'border-none bg-darkthemeitems text-white':''}`}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M1.375 2.0625C1.375 1.88016 1.44743 1.7053 1.57636 1.57636C1.7053 1.44743 1.88016 1.375 2.0625 1.375H8.9375C9.11984 1.375 9.2947 1.44743 9.42364 1.57636C9.55257 1.7053 9.625 1.88016 9.625 2.0625V3.01858C9.62495 3.26168 9.52834 3.4948 9.35642 3.66667L6.875 6.14808V9.55075C6.87501 9.6367 6.85305 9.72122 6.81121 9.7963C6.76936 9.87137 6.70902 9.9345 6.63591 9.97968C6.5628 10.0249 6.47935 10.0506 6.39349 10.0545C6.30763 10.0583 6.2222 10.0402 6.14533 10.0017L4.44171 9.15017C4.34654 9.10259 4.26651 9.02945 4.21057 8.93894C4.15463 8.84844 4.125 8.74415 4.125 8.63775V6.14808L1.64358 3.66667C1.47166 3.4948 1.37505 3.26168 1.375 3.01858V2.0625Z" fill={localStorage.getItem('darkMode')==='true' ? '#ffffff':'#1e1e1e80'} fillOpacity="1"/>
            </svg>
            {t('overview.buttons.filter')} 
          </button>
          <button onClick={()=>{setStartDate('');setEndDate('')}} className="btn-primary flex items-center gap-2">
            All
          </button>
        </div>
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
                stroke={localStorage.getItem('darkMode') === 'true' ? '#161618' : '#fff'}
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
                            className={` text-2xl font-bold ${localStorage.getItem('darkMode') === 'true' ? 'fill-white' : 'fill-blacktheme'}`}
                          >
                            {totalActions}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className={` text-sm ${localStorage.getItem('darkMode') === 'true' ? 'fill-white' : 'fill-blacktheme'}`}
                          >
                            {t('overview.charts.topUserActions.label')}
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
      <div className="flex justify-center flex-wrap gap-5 mb-2">
        <div className="flex gap-3 items-center">
          <div className="h-3 w-3 rounded-full bg-greentheme"></div>
          <span className={`text-sm ${localStorage.getItem('darkMode') === 'true' ? 'text-gray-200' : 'text-gray-600'}`}>{t('overview.charts.topUserActions.legend.confirmed')}</span>
        </div>
        <div className="flex gap-3 items-center">
          <div className="h-3 w-3 rounded-full bg-redtheme"></div>
          <span className={`text-sm ${localStorage.getItem('darkMode') === 'true' ? 'text-gray-200' : 'text-gray-600'}`}>{t('overview.charts.topUserActions.legend.cancelled')}</span>
        </div>
        <div className="flex gap-3 items-center">
          <div className="h-3 w-3 rounded-full bg-bluetheme"></div>
          <span className={`text-sm ${localStorage.getItem('darkMode') === 'true' ? 'text-gray-200' : 'text-gray-600'}`}>{t('overview.charts.topUserActions.legend.pending')}</span>
        </div>
        <div className="flex gap-3 items-center">
          <div className="h-3 w-3 rounded-full bg-purpletheme"></div>
          <span className={`text-sm ${localStorage.getItem('darkMode') === 'true' ? 'text-gray-200' : 'text-gray-600'}`}>{t('overview.charts.topUserActions.legend.fulfilled')}</span>
        </div>
        <div className="flex gap-3 items-center">
          <div className="h-3 w-3 rounded-full bg-orangetheme"></div>
          <span className={`text-sm ${localStorage.getItem('darkMode') === 'true' ? 'text-gray-200' : 'text-gray-600'}`}>{t('overview.charts.topUserActions.legend.seated')}</span>
        </div>
      </div>
      {showDay &&
        <div>
          <div className='overlay bg-transparent' onClick={()=>{setShowDay(false)}}/>
          <div className={`popup lt-sm:w-full h-[50vh] lt-sm:h-[70vh] z-[250] lt-sm:bottom-0 ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'}`}>
            <IntervalCalendar onRangeSelect={handleDateClick} />
          </div>
        </div>
      }
    </div>
  )
}