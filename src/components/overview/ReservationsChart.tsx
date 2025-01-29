"use client"

import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useTranslation } from 'react-i18next'
import Filter from './Filter'
import { useCustom, useList } from '@refinedev/core'

// Mock data generator
const generateMockData = (months: number) => {
  return Array.from({ length: months }, (_, i) => ({
    date: new Date(2023, i, 1).toLocaleString('default', { month: 'short' }),
    confirmed: Math.floor(Math.random() * 300) + 200,
    canceled: Math.floor(Math.random() * 150) + 100,
  }))
}

const determineTimeUnit = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 365) {
    return 'years';
  } else if (diffDays > 60) {
    return 'months';
  } else if (diffDays > 21) {
    return 'weeks';
  } else {
    return 'days';
  }
};

const generateData = (start: string, end: string) => {
  const timeUnit = determineTimeUnit(start, end);
  const startDate = new Date(start);
  const endDate = new Date(end);
  const data = [];

  if (timeUnit === 'years') {
    for (let d = new Date(startDate); d <= endDate; d.setFullYear(d.getFullYear() + 1)) {
      data.push({
        date: d.getFullYear().toString(),
        confirmed: Math.floor(Math.random() * 300) + 200,
        canceled: Math.floor(Math.random() * 150) + 100,
      });
    }
  } else if (timeUnit === 'months') {
    for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
      data.push({
        date: d.toLocaleString('default', { month: 'short' }),
        confirmed: Math.floor(Math.random() * 300) + 200,
        canceled: Math.floor(Math.random() * 150) + 100,
      });
    }
  } else if (timeUnit === 'weeks') {
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
      data.push({
        date: `Week ${Math.ceil((d.getDate() + 1) / 7)}`,
        confirmed: Math.floor(Math.random() * 300) + 200,
        canceled: Math.floor(Math.random() * 150) + 100,
      });
    }
  } else {
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      data.push({
        date: d.toLocaleDateString(),
        confirmed: Math.floor(Math.random() * 300) + 200,
        canceled: Math.floor(Math.random() * 150) + 100,
      });
    }
  }

  return data;
};

interface range {
  start: string,
  end: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={` p-4 shadow-md rounded-md ${localStorage.getItem('darkMode')=== 'true'? 'bg-bgdarktheme2 text-textdarktheme':'bg-white text-blacktheme'}`}>
        <p className="font-semibold">{label}</p>
        <p className="text-greentheme">Confirmed: {payload[0].value}</p>
        <p className="text-redtheme">Canceled: {payload[1].value}</p>
      </div>
    )
  }
  return null
}



export default function ReservationsChart() {
  
  const [timeRange, setTimeRange] = useState<range>({start: '2023-01-01', end: '2023-12-31'})
  const [chartData, setChartData] = useState(generateData(timeRange.start, timeRange.end))
  
  useEffect(() => {
    const data = generateData(timeRange.start, timeRange.end)
    setChartData(data)
  }, [timeRange])
  
  const { t } = useTranslation()
  
  const { data, isLoading, error } = useCustom({
    url: "http://128.199.50.127/api/v1/bo/tables/",
    method: "get",
    meta: {
      headers: {
        "X-Restaurant-ID": 1,
      },
    },
  });

  console.log(isLoading,data,error)



  

  return (
    <div className={`w-full h-full mx-auto p-4  rounded-[20px] lt-sm:w-full ${localStorage.getItem('darkMode')=== 'true'? 'bg-bgdarktheme text-textdarktheme':'bg-white text-blacktheme'}`}>
      <div className="flex flex-row items-center justify-between">
        <h1 className='text-xl font-bold'>{t('overview.reservations.title')}</h1>
        <div className="flex items-center space-x-4 lt-sm:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-greentheme"></div>
            <span className={`text-sm  ${localStorage.getItem('darkMode')==='true'?'text-softwhitetheme':'text-gray-600'}`}>{t('overview.reservations.status.confirmed')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-redtheme"></div>
            <span className={`text-sm  ${localStorage.getItem('darkMode')==='true'?'text-softwhitetheme':'text-gray-600'}`}>{t('overview.reservations.status.canceled')}</span>
          </div>

        </div>
        <Filter onClick={(range: range) => setTimeRange(range)} />
      </div>
      <div className="flex items-center space-x-4 justify-center lt-sm:mt-2 sm:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-greentheme"></div>
            <span className="text-sm text-gray-600">{t('overview.reservations.status.confirmed')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-redtheme"></div>
            <span className="text-sm text-gray-600">{t('overview.reservations.status.canceled')}</span>
          </div>

        </div>
      <div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 30, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCanceled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF5252" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#FF5252" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9E9E9E' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9E9E9E' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="confirmed" stroke="#4CAF50" fillOpacity={1} fill="url(#colorConfirmed)" />
              <Area type="monotone" dataKey="canceled" stroke="#FF5252" fillOpacity={1} fill="url(#colorCanceled)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
