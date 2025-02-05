import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import Filter from "./Filter";
import { useEffect, useState } from "react";

// Define the interface for chart data
interface ChartData {
  country: string;
  interactions: number;
}

// Define the interface for the Filter component's onClick prop
interface FilterProps {
  onClick: (range: string) => void;
}

// Generate chart data (moved outside the component to avoid redefining it on every render)
const generateChartData = (): ChartData[] => {
  return [
    { country: "Morocco", interactions: Math.floor(Math.random() * 200) },
    { country: "Spain", interactions: Math.floor(Math.random() * 50) },
    { country: "England", interactions: Math.floor(Math.random() * 30) },
    { country: "Germany", interactions: Math.floor(Math.random() * 20) },
    { country: "France", interactions: Math.floor(Math.random() * 10) },
    { country: "Italy", interactions: Math.floor(Math.random() * 5) },
  ];
};

// Custom Tooltip Component
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (active && payload && payload.length) {
    return (
      <div className={`p-2 shadow-md rounded-md ${isDarkMode ? 'bg-bgdarktheme2 text-textdarktheme' : 'bg-white text-blacktheme'}`}>
        <p className="font-semibold">{label}</p>
        <p className="text-sm">Interactions: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function TopUsers() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<string>("");
  const [chartData, setChartData] = useState<ChartData[]>(generateChartData());

  // Update chart data when time range changes
  useEffect(() => {
    setChartData(generateChartData());
  }, [timeRange]);

  // Dark mode class
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  const containerClass = `rounded-[20px] lt-sm:w-full overflow-hidden ${isDarkMode ? 'bg-bgdarktheme text-textdarktheme' : 'bg-white text-blacktheme'}`;
  const tickFill = isDarkMode ? '#ffffff' : '#1e1e1e';

  return (
    <div className={containerClass}>
      <div className="px-6 py-4 flex justify-between">
        <h2 className="text-xl font-bold mb-2">{t('overview.charts.topUsers.title')}</h2>
        <Filter onClick={(range: string) => setTimeRange(range)} />
      </div>
      <div className="px-6 py-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <YAxis
                dataKey="country"
                type="category"
                tickLine={false}
                axisLine={false}
                width={80}
                tick={{ fontSize: 12, fill: tickFill }}
              />
              <XAxis type="number" hide />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="interactions" fill="#88AB61" radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="interactions"
                  position="right"
                  fill={tickFill}
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}