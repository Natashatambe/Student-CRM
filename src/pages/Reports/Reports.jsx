import Layout from "../../Components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Progress } from "../../Components/ui/progress";
import { useToast } from "../../Components/ui/toast";
import { FileBarChart, Download, TrendingUp, BookOpen, Star, FileSpreadsheet } from "lucide-react";
import { exportToExcel, exportToPDF } from "../../lib/exportUtils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const monthlyData = [
  { month: "Jan", admissions: 42, revenue: 210000 },
  { month: "Feb", admissions: 55, revenue: 275000 },
  { month: "Mar", admissions: 68, revenue: 340000 },
  { month: "Apr", admissions: 60, revenue: 300000 },
  { month: "May", admissions: 85, revenue: 425000 },
  { month: "Jun", admissions: 96, revenue: 480000 },
];

const courseShare = [
  { name: "Java Full Stack", value: 45, color: "#00754A" },
  { name: "Python Masterclass", value: 30, color: "#006241" },
  { name: "React JS Track", value: 15, color: "#cba258" },
  { name: "Data Science & AI", value: 10, color: "#1E3932" },
];

function Reports() {
  const { showToast } = useToast();

  const handleExportCSV = () => {
    const dataToExport = monthlyData.map((d) => ({
      Month: d.month,
      Admissions: d.admissions,
      "Revenue (INR)": d.revenue,
    }));
    exportToExcel(dataToExport, "Academy_Analytics_Report");
    showToast("Exported Analytics Report to Excel Sheet!", "success");
  };

  const handleExportPDF = () => {
    const headers = ["Month", "Student Enrollments", "Monthly Revenue"];
    const rows = monthlyData.map((d) => [
      d.month,
      d.admissions,
      `₹${d.revenue.toLocaleString()}`,
    ]);
    exportToPDF("Academy Analytics & Enrollment Trajectory", headers, rows, "Academy_Analytics_PDF_Sheet");
    showToast("Exported PDF Report Sheet!", "success");
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#006241] tracking-tight flex items-center gap-2.5">
            <FileBarChart className="h-8 w-8 text-[#00754A]" />
            Academy Analytics & Reports
          </h1>
          <p className="text-sm text-slate-600 font-semibold mt-1">
            Comprehensive insight into enrollments, course popularity, and revenue growth
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2 bg-white border-slate-200">
            <FileSpreadsheet className="h-4 w-4 text-[#00754A]" /> Export Excel
          </Button>
          <Button onClick={handleExportPDF} variant="primary" className="shadow-md gap-2">
            <Download className="h-4 w-4" /> Download PDF Report Sheet
          </Button>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Growth Area Chart */}
        <Card className="lg:col-span-2 sb-shadow-card bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#006241] flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#00754A]" />
              Annual Admission Trajectory
            </CardTitle>
            <CardDescription>Monthly growth trend of student partner enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAdm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00754A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00754A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
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
                  <Area type="monotone" dataKey="admissions" stroke="#00754A" strokeWidth={3} fillOpacity={1} fill="url(#colorAdm)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Course Share Pie */}
        <Card className="sb-shadow-card bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#006241] flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#00754A]" />
              Course Track Share
            </CardTitle>
            <CardDescription>Distribution across top curricula</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={courseShare} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4}>
                    {courseShare.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {courseShare.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-extrabold text-[#1E3932]">{item.name}</span>
                  </div>
                  <span className="font-extrabold text-[#00754A]">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Target Progress Bar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 sb-shadow-card bg-white">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-extrabold text-[#1E3932]">Quarterly Enrollment Target</h4>
            <span className="text-xs font-extrabold text-[#00754A]">84% Achieved</span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mb-3">168 / 200 Enrollments</p>
          <Progress value={84} color="bg-[#00754A]" />
        </Card>

        <Card className="p-6 sb-shadow-card bg-white">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-extrabold text-[#1E3932]">Fee Collection Target</h4>
            <span className="text-xs font-extrabold text-[#006241]">92% Collected</span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mb-3">₹4.85L / ₹5.20L Revenue</p>
          <Progress value={92} color="bg-[#006241]" />
        </Card>

        <Card className="p-6 sb-shadow-card bg-[#faf6ee] border border-[#cba258]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-extrabold text-[#1E3932] flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-[#cba258] fill-current" /> Gold Lead Conversion
            </h4>
            <span className="text-xs font-extrabold text-[#cba258]">76% Rate</span>
          </div>
          <p className="text-xs text-slate-600 font-semibold mb-3">96 / 126 Qualified Partner Leads</p>
          <Progress value={76} color="bg-[#cba258]" />
        </Card>
      </div>
    </Layout>
  );
}

export default Reports;