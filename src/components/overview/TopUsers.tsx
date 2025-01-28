
import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, ResponsiveContainer, Tooltip, TooltipProps } from "recharts"
import Filter from "./Filter";
import { useEffect, useState } from "react";


// Define the interface for the tooltip props
interface CustomTooltipProps extends TooltipProps<number, string> {}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={` p-2 shadow-md rounded-md  ${localStorage.getItem('darkMode')=== 'true'? 'bg-bgdarktheme2 text-textdarktheme':'bg-white text-blacktheme'}`}>
        <p className="font-semibold">{label}</p>
        <p className="text-sm">Interactions: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};


interface range {
  start: string,
  end: string
}

export default function TopUsers() {
  
    const [timeRange, setTimeRange] = useState<range>({start: '2023-01-01', end: '2023-12-31'})
  const generateChartData = (start: string, end: string) => {
    // Example logic to generate data based on date range
    const data = [
      { country: "Morocco", interactions: Math.floor(Math.random() * 200) },
      { country: "Spain", interactions: Math.floor(Math.random() * 50) },
      { country: "England", interactions: Math.floor(Math.random() * 30) },
      { country: "Germany", interactions: Math.floor(Math.random() * 20) },
      { country: "France", interactions: Math.floor(Math.random() * 10) },
      { country: "Italy", interactions: Math.floor(Math.random() * 5) },
    ];
    return data;
  };

  const [chartData, setChartData] = useState(generateChartData(timeRange.start, timeRange.end));

  // Update chart data when time range changes
  useEffect(() => {
    setChartData(generateChartData(timeRange.start, timeRange.end));
  }, [timeRange]);

  const {t}= useTranslation()
  return (
    <div className={` rounded-[20px]  lt-sm:w-full overflow-hidden ${localStorage.getItem('darkMode')=== 'true'? 'bg-bgdarktheme text-textdarktheme':'bg-white text-blacktheme'}`}>
      <div className="px-6 py-4 flex justify-between">
        <h2 className="text-xl font-bold mb-2">{t('overview.charts.topUsers.title')}</h2>
        <Filter onClick={(range: range) => setTimeRange(range)} />
      </div>
      <div className="px-6 py-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 5,
                right: 0,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <YAxis
                dataKey="country"
                type="category"
                tickLine={false}
                axisLine={false}
                width={80}
                tick={{ fontSize: 12, fill: localStorage.getItem('darkMode')=== 'true'? '#ffffff':'#1e1e1e' }}
              />
              <XAxis type="number" hide />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="interactions" fill="#88AB61" radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="interactions"
                  position="right"
                  fill={localStorage.getItem('darkMode')=== 'true'? '#ffffff':'#1e1e1e'}
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
