import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { TrendingUp, Sparkles } from "lucide-react";
import { getPayments } from "../../services/paymentService";
import { getAdmissions } from "../../services/admissionService";

function RevenueChart() {
  const [chartData, setChartData] = useState([
    { month: "Jan", revenue: 45000 },
    { month: "Feb", revenue: 60000 },
    { month: "Mar", revenue: 85000 },
    { month: "Apr", revenue: 70000 },
    { month: "May", revenue: 110000 },
    { month: "Jun", revenue: 95000 },
    { month: "Jul", revenue: 140000 },
    { month: "Aug", revenue: 317000 },
  ]);

  useEffect(() => {
    loadMonthlyRevenueData();
  }, []);

  const loadMonthlyRevenueData = async () => {
    try {
      const [pmtRes, admRes] = await Promise.all([
        getPayments().catch(() => null),
        getAdmissions().catch(() => null),
      ]);

      let paymentsList = [];
      if (pmtRes && pmtRes.data) {
        paymentsList = Array.isArray(pmtRes.data) ? pmtRes.data : pmtRes.data.data || [];
      }

      let admissionsList = [];
      if (admRes && admRes.data) {
        admissionsList = Array.isArray(admRes.data) ? admRes.data : admRes.data.data || [];
      }

      if (paymentsList.length > 0 || admissionsList.length > 0) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyRevenue = {};

        monthNames.forEach((m) => {
          monthlyRevenue[m] = 0;
        });

        paymentsList.forEach((p) => {
          if (p.date || p.paymentDate) {
            const d = new Date(p.date || p.paymentDate);
            if (!isNaN(d.getTime())) {
              const mName = monthNames[d.getMonth()];
              const amt = Number(p.amount || 0);
              if (monthlyRevenue[mName] !== undefined && (p.status === "Completed" || !p.status)) {
                monthlyRevenue[mName] += amt;
              }
            }
          }
        });

        admissionsList.forEach((a) => {
          if (a.admissionDate && a.paymentStatus === "Paid") {
            const d = new Date(a.admissionDate);
            if (!isNaN(d.getTime())) {
              const mName = monthNames[d.getMonth()];
              if (monthlyRevenue[mName] === 0) {
                monthlyRevenue[mName] += Number(a.totalFee || 0);
              }
            }
          }
        });

        const currentMonthIdx = new Date().getMonth();
        const activeMonths = monthNames.slice(0, currentMonthIdx + 1);

        const dynamicData = activeMonths.map((mName) => ({
          month: mName,
          revenue: monthlyRevenue[mName] || 0,
        }));

        if (dynamicData.some((d) => d.revenue > 0)) {
          setChartData(dynamicData);
        }
      }
    } catch (err) {
      console.log("Revenue chart data load error:", err);
    }
  };

  return (
    <Card className="bg-[#efe9de] border-[#e6dfd8] shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-normal text-[#141413] tracking-tight font-serif-display flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#cc785c]" />
            Fee Collection Trend (INR)
            <Sparkles className="h-3.5 w-3.5 text-[#cc785c] fill-current" />
          </CardTitle>
          <CardDescription className="text-xs text-[#6c6a64] font-medium mt-0.5">
            Real-time monthly course fees processed in ₹ (INR)
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#cc785c" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#cc785c" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6dfd8" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#141413", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#141413", fontWeight: 600 }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(val) => [`₹${Number(val).toLocaleString()}`, "Fee Collected"]}
                contentStyle={{
                  backgroundColor: "#faf9f5",
                  borderColor: "#cc785c",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.08)",
                  color: "#141413",
                  fontWeight: "bold",
                }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: "10px", fontSize: "12px", fontWeight: "600" }} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Processed Fees (₹)"
                stroke="#cc785c"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#revenueGradient)"
                dot={{ r: 4, fill: "#cc785c", strokeWidth: 2, stroke: "#faf9f5" }}
                activeDot={{ r: 7, fill: "#cc785c" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default RevenueChart;