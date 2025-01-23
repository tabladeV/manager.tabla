"use client"

import React, { useState, useEffect, useMemo } from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useTranslation } from "react-i18next"
import Filter from "./Filter"
import { range } from "../../../../../../../Downloads/gridpack_trial/codebase/types/ts-common/core"

interface Range {
  start: string,
  end: string
}

const generateChartData = (range: Range) => {
  // This is a placeholder function. Replace it with actual data fetching logic.
  // For now, it returns static data.
  return [
    { action: "Confirmed", count: Math.floor(Math.random() * 300), fill: "#88AB61" },
    { action: "Canceled", count: Math.floor(Math.random() * 300), fill: "#FF4B4B" },
    { action: "Pending", count: Math.floor(Math.random() * 300), fill: "#3F72AF" },
  ];
};

export default function TopActions() {
  const [timeRange, setTimeRange] = useState<Range>({ start: '2023-01-01', end: '2023-12-31' })
  const [chartData, setChartData] = useState(generateChartData(timeRange))

  useEffect(() => {
    setChartData(generateChartData(timeRange))
  }, [timeRange])

  const totalActions = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0)
  }, [chartData])

  const { t } = useTranslation()

  return (
    <div className={` ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme text-textdarktheme' : 'bg-white text-blacktheme'} w-[30%] rounded-[20px] lt-sm:w-full overflow-hidden`}>
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
                            {totalActions.toLocaleString()}
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
