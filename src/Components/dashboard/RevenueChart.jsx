import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { TrendingUp, Star } from "lucide-react";

const data = [
  { month: "Jan", revenue: 25000 },
  { month: "Feb", revenue: 30000 },
  { month: "Mar", revenue: 45000 },
  { month: "Apr", revenue: 38000 },
  { month: "May", revenue: 52000 },
  { month: "Jun", revenue: 61000 },
];

function RevenueChart() {
  return (
    <Card className="sb-shadow-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-bold text-[#006241] flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#cba258]" />
            Fee Collection Trend (INR)
          </CardTitle>
          <CardDescription>Monthly course fees processed in ₹</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edebe9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#1E3932", fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#1E3932", fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val) => [`₹${val.toLocaleString()}`, "Revenue"]}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#cba258",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  fontWeight: "bold",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#00754A"
                strokeWidth={3}
                dot={{ r: 5, fill: "#cba258", strokeWidth: 2, stroke: "#ffffff" }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default RevenueChart;