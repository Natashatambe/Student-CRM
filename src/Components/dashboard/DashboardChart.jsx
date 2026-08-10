import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { BarChart3, Coffee } from "lucide-react";

const data = [
  { month: "Jan", admissions: 12, inquiries: 25 },
  { month: "Feb", admissions: 18, inquiries: 32 },
  { month: "Mar", admissions: 25, inquiries: 40 },
  { month: "Apr", admissions: 22, inquiries: 38 },
  { month: "May", admissions: 30, inquiries: 50 },
  { month: "Jun", admissions: 28, inquiries: 45 },
];

function DashboardChart() {
  return (
    <Card className="sb-shadow-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-bold text-[#006241] flex items-center gap-2">
            <Coffee className="h-5 w-5 text-[#00754A]" />
            Monthly Admission Growth
          </CardTitle>
          <CardDescription>Enrollment trends vs initial student leads</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edebe9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#1E3932", fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#1E3932", fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#00754A",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  fontWeight: "bold",
                }}
              />
              <Bar dataKey="admissions" name="Admissions" fill="#00754A" radius={[8, 8, 0, 0]} />
              <Bar dataKey="inquiries" name="Leads" fill="#d4e9e2" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default DashboardChart;