"use client"

import React, { useState, useEffect, useMemo } from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useTranslation } from "react-i18next"
import Filter from "./Filter"
import { BaseRecord, useList } from "@refinedev/core"

interface Range {
  start: string,
  end: string
}

const generateChartData = () => {
  // This is a placeholder function. Replace it with actual data fetching logic.
  // For now, it returns static data.
  return [
    { action: "Confirmed", count: Math.floor(Math.random() * 300), fill: "#88AB61" },
    { action: "Canceled", count: Math.floor(Math.random() * 300), fill: "#FF4B4B" },
    { action: "Pending", count: Math.floor(Math.random() * 300), fill: "#3F72AF" },
  ];
};

export default function TopActions() {

  const {data, isLoading, error} = useList({
    resource: 'api/v1/bo/reservations',
    meta: {
        headers: {
            'X-Restaurant-ID': 1
        }
    }
  })
  console.log('reservations',data?.data)




  const [reservations, setReservations] = useState<BaseRecord[]>([])

  useEffect(() => {
  if (data?.data) {
    setReservations(data.data )
  }
  }, [data])

  const [canceled, setCanceled]= useState<BaseRecord>()
  const [confirmed, setConfirmed]= useState<BaseRecord>()
  const [pending, setPending]= useState<BaseRecord>()
  
  useEffect(()=>{

    setPending(reservations.filter((reservation)=>reservation.status.includes("PENDING")))
    setConfirmed(reservations.filter((reservation)=>reservation.status.includes("APPROVED")))
    setCanceled(reservations.filter((reservation)=>reservation.status.includes("CANCELED")))

  },[reservations])


  interface chartType {
    action:string
    count:number
    fill:string
  }

  const [timeRange, setTimeRange] = useState<Range>({ start: '2023-01-01', end: '2023-12-31' })
  const [chartData, setChartData] = useState<chartType[]>()

  useEffect(()=>{
    if(pending && canceled && confirmed){
      setChartData([
        { action: "Confirmed", count: confirmed.length, fill: "#88AB61" },
        { action: "Canceled", count: canceled.length, fill: "#FF4B4B" },
        { action: "Pending", count: pending.length, fill: "#3F72AF" },
      ])
    }
  },[canceled, confirmed , pending])


  const [totalActions, setTotalActions] = useState(0)
  useEffect(()=>{
    if(reservations){
      setTotalActions(reservations.length)
    }
  }, [reservations])

  const { t } = useTranslation()

  return (
    <div className={` ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme text-textdarktheme' : 'bg-white text-blacktheme'}  rounded-[20px] lt-sm:w-full overflow-hidden`}>
      <div className="px-6 py-4 flex justify-between">
        <h2 className="text-xl font-bold mb-2">{t('overview.charts.topUserActions.title')}</h2>
        <Filter onClick={(range: Range) => setTimeRange(range)} />
      </div>
      <div>
        <div className="flex items-center justify-center gap-2">
          <TrendingUp size={24} />
          <span className={`text-sm font-[600] ${localStorage.getItem('darkMode') === 'true' ? 'text-gray-200' : 'text-gray-600'}`}>{t('overview.charts.topUserActions.subtitle')}</span>
          {timeRange && (
            <span className={`text-sm ${localStorage.getItem('darkMode') === 'true' ? 'text-gray-200' : 'text-gray-600'}`}>
              {`${timeRange.start} to ${timeRange.end}`}
            </span>
          )}
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
      <div className="flex justify-center gap-5 mb-2">
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
      </div>
    </div>
  )
}
