import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import Filter from "./Filter";
import { useEffect, useState } from "react";
import { BaseRecord, useList } from "@refinedev/core";

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
    { country: "Morocco", interactions: 0 },
    { country: "Spain", interactions: 0},
    { country: "England", interactions: 0 },
    { country: "Germany", interactions: 0 },
    { country: "France", interactions: 0 },
    { country: "Italy", interactions: 0 },
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

  interface ReservationType {
    
    results: BaseRecord[]
    count: number
    
  }

  const [reservationAPIInfo, setReservationAPIInfo] =useState<ReservationType>() 

  const { data, isLoading, error } = useList({
      resource: 'api/v1/bo/reservations/',
      filters: [
        {
          field: "page",
          operator: "eq",
          value: 1,
        },
        {
          field: "page_size",
          operator: "eq",
          value: 500,
        }
      ],
      queryOptions:{
        onSuccess(data){
          setReservationAPIInfo(data.data as unknown as ReservationType)
        }
      }

    })

    const [reservations, setReservations] = useState<BaseRecord[]>([])
    useEffect(() => {
      if (reservationAPIInfo) {
        setReservations(reservationAPIInfo.results as BaseRecord[]);
      }
    }, [reservationAPIInfo])


  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<string>("");
  const [chartData, setChartData] = useState<ChartData[]>([
    { country: "Morocco", interactions: 0 },
    { country: "Spain", interactions: 0 },
    { country: "England", interactions: 0 },
    { country: "Germany", interactions: 0 },
    { country: "France", interactions: 0 },
    { country: "Italy", interactions: 0 },
  ]);

  useEffect(() => {
    if (reservations) {
      setChartData([
        { country: "Morocco", interactions: reservations.length },
        { country: "Spain", interactions: 0 },
        { country: "England", interactions: 0 },
        { country: "Germany", interactions: 0 },
        { country: "France", interactions: 0 },
        { country: "Italy", interactions: 0 },
      ])
    }
  }, [reservations])

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
        {/* <Filter onClick={(range: string) => setTimeRange(range)} /> */}
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