"use client"

import React, {useEffect, useMemo, useState} from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useTranslation } from "react-i18next"
import Filter from "./Filter"


interface range {
  start: string,
  end: string
}

export default function ReservationSource() {
  
  const [timeRange, setTimeRange] = useState<range>({start: '2023-01-01', end: '2023-12-31'})


  const generateChartData = (start: string, end: string) => {
    // Example logic to generate data based on date range
    const data = [
      { action: "Market Place", count: Math.floor(Math.random() * 200), fill: "#6411ad" },
      { action: "Back Office", count: Math.floor(Math.random() * 200), fill: "#9e0059" },
      { action: "Third Party", count: Math.floor(Math.random() * 200), fill: "#fb8500" },
      {action : "Widget", count: Math.floor(Math.random() * 200), fill: "#0d00a4"},
    ];
    return data;
  };

  const [chartData, setChartData] = useState(generateChartData(timeRange.start, timeRange.end));

 // Update chart data when time range changes
  useEffect(() => {
    setChartData(generateChartData(timeRange.start, timeRange.end));
  }, [timeRange]);


  const totalActions = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0)
  }, [chartData])



  const {t}= useTranslation()
  return (
    <div className={` ${localStorage.getItem('darkMode')=== 'true'? 'bg-bgdarktheme text-textdarktheme':'bg-white text-blacktheme'} w-[30%] rounded-[20px] lt-sm:w-full overflow-hidden`}>
      <div className="px-6 py-4 flex justify-between">
        <h2 className="text-xl  font-bold mb-2">{t('overview.charts.reservationsSource.title')}</h2>
        <Filter onClick={(range: range) => setTimeRange(range)} />
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
                stroke={localStorage.getItem('darkMode')=== 'true'? '#161618':'#fff'}
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
                            className={` text-2xl font-bold ${localStorage.getItem('darkMode')=== 'true'? 'fill-white':'fill-blacktheme'}`}
                          >
                            {totalActions.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className={` text-sm ${localStorage.getItem('darkMode')=== 'true'? 'fill-white':'fill-blacktheme'}`}
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
            <div className="h-3 w-3 rounded-full bg-[#6411ad]"></div>
            <span className={`text-sm ${localStorage.getItem('darkMode')=== 'true'? 'text-gray-200':'text-gray-600'}`}>{t('overview.charts.reservationsSource.legend.MarketPlace')}</span>
        </div>
        <div className="flex gap-3 items-center">
            <div className="h-3 w-3 rounded-full bg-[#9e0059]"></div>
            <span className={`text-sm ${localStorage.getItem('darkMode')=== 'true'? 'text-gray-200':'text-gray-600'}`}>{t('overview.charts.reservationsSource.legend.BackOffice')}</span>
        </div>
        <div className="flex gap-3 items-center">
            <div className="h-3 w-3 rounded-full bg-[#fb8500]"></div>
            <span className={`text-sm ${localStorage.getItem('darkMode')=== 'true'? 'text-gray-200':'text-gray-600'}`}>{t('overview.charts.reservationsSource.legend.ThirdParty')}</span>
        </div>
        <div className="flex gap-3 items-center">
            <div className="h-3 w-3 rounded-full bg-[#0d00a4]"></div>
            <span className={`text-sm ${localStorage.getItem('darkMode')=== 'true'? 'text-gray-200':'text-gray-600'}`}>{t('overview.charts.reservationsSource.legend.Widget')}</span>
        </div>
      </div>
    </div>
  )
}