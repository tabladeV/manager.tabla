
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, ResponsiveContainer, Tooltip, TooltipProps } from "recharts"

const chartData = [
  { user: "Alice", interactions: 186 },
  { user: "Bob", interactions: 305 },
  { user: "Charlie", interactions: 237 },
  { user: "David", interactions: 173 },
  { user: "Eve", interactions: 209 },
  { user: "Frank", interactions: 214 },
]

// Define the interface for the tooltip props
interface CustomTooltipProps extends TooltipProps<number, string> {}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 shadow-md rounded-md border border-gray-200">
        <p className="font-semibold">{label}</p>
        <p className="text-sm">Interactions: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function TopUsers() {
  return (
    <div className=" bg-white  rounded-[20px] w-[40%] overflow-hidden">
      <div className="px-6 py-4">
        <h2 className="text-xl font-bold mb-2">Top Users</h2>
      </div>
      <div className="px-6 py-4">
        <div className="h-64">
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
                dataKey="user"
                type="category"
                tickLine={false}
                axisLine={false}
                width={80}
                tick={{ fontSize: 12 }}
              />
              <XAxis type="number" hide />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="interactions" fill="#88AB61" radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="interactions"
                  position="right"
                  fill="#4B5563"
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
