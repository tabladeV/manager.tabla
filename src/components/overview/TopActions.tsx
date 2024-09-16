"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const chartData = [
  { action: "Confirmed", count: 275, fill: "#3F72AF" },
  { action: "Canceled", count: 200, fill: "#FF4B4B" },
  { action: "Pending", count: 287, fill: "#F09300" },

]

export default function TopActions() {
  const totalActions = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0)
  }, [])

  return (
    <div className=" bg-white w-[30%] rounded-[20px] overflow-hidden">
      <div className="px-6 py-4 ">
        <h2 className="text-xl  font-bold mb-2">Top User Actions</h2>
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
                stroke="#fff"
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
                            className="fill-gray-900 text-2xl font-bold"
                          >
                            {totalActions.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-gray-500 text-sm"
                          >
                            Actions
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
            <div className="h-3 w-3 rounded-full bg-bluetheme"></div>
            <span className="text-sm text-gray-600">Confirmed</span>
        </div>
        <div className="flex gap-3 items-center">
            <div className="h-3 w-3 rounded-full bg-[#FF4B4B]"></div>
            <span className="text-sm text-gray-600">Canceled</span>
        </div>
        <div className="flex gap-3 items-center">
            <div className="h-3 w-3 rounded-full bg-[#F09300]"></div>
            <span className="text-sm text-gray-600">Pending</span>
        </div>
      </div>
    </div>
  )
}