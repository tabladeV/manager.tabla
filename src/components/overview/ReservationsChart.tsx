"use client"

import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data generator
const generateMockData = (months: number) => {
  return Array.from({ length: months }, (_, i) => ({
    date: new Date(2023, i, 1).toLocaleString('default', { month: 'short' }),
    confirmed: Math.floor(Math.random() * 300) + 200,
    canceled: Math.floor(Math.random() * 150) + 100,
  }))
}

const data = generateMockData(12)
console.log(data)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-md rounded-md">
        <p className="font-semibold">{label}</p>
        <p className="text-greentheme">Confirmed: {payload[0].value}</p>
        <p className="text-redtheme">Canceled: {payload[1].value}</p>
      </div>
    )
  }
  return null
}

export default function ReservationsChart() {
  const [timeRange, setTimeRange] = useState<string>('7')

  useEffect(() => {
    const data = generateMockData(Number(timeRange))
    console.log(data)
  }, [timeRange])

  return (
    <div className="w-full mx-auto p-4 bg-white rounded-[20px] lt-sm:w-full">
      <div className="flex flex-row items-center justify-between">
        <h1 className='text-xl font-bold'>Reservations</h1>
        <div className="flex items-center space-x-4 lt-sm:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-greentheme"></div>
            <span className="text-sm text-gray-600">Confirmed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-redtheme"></div>
            <span className="text-sm text-gray-600">Canceled</span>
          </div>

        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="inputs-unique"
        >
          <option value="" disabled>
            Select time range
          </option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90" >Last Year</option>
        </select>
      </div>
      <div className="flex items-center space-x-4 justify-center lt-sm:mt-2 sm:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-greentheme"></div>
            <span className="text-sm text-gray-600">Confirmed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-redtheme"></div>
            <span className="text-sm text-gray-600">Canceled</span>
          </div>

        </div>
      <div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
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