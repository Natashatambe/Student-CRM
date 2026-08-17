import { useEffect, useState } from "react";
import Layout from "../../Components/layout/Layout";

import DashboardCard from "../../Components/dashboard/DashboardCard";
import DashboardChart from "../../Components/dashboard/DashboardChart";
import DashboardHeader from "../../Components/dashboard/DashboardHeader";
import RevenueChart from "../../Components/dashboard/RevenueChart";
import RecentStudents from "../../Components/dashboard/RecentStudents";
import RecentActivities from "../../Components/dashboard/RecentActivities";

import { getDashboardData } from "../../services/dashboardService";
import { getStudents } from "../../services/studentService";
import { getCourses } from "../../services/courseService";
import { getAdmissions } from "../../services/admissionService";
import { getPayments } from "../../services/paymentService";
import { Users, GraduationCap, ClipboardList, CreditCard, UserCheck, PhoneCall, Calendar, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [dashboard, setDashboard] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalAdmissions: 0,
    totalRevenue: 0,
  });

  const [students, setStudents] = useState([]);
  const userRole = localStorage.getItem("userRole") || "ROLE_ADMIN";
  const userName = localStorage.getItem("userName") || "Admin";
  const isAdmin = userRole === "ROLE_ADMIN";

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await getDashboardData();
      if (response && response.data) {
        setDashboard((prev) => ({
          ...prev,
          ...response.data,
        }));
      }
    } catch (error) {
      console.log("Dashboard loaded preview metrics:", error);
    }

    try {
      const [stdRes, crsRes, admRes, pmtRes] = await Promise.all([
        getStudents().catch(() => null),
        getCourses().catch(() => null),
        getAdmissions().catch(() => null),
        getPayments().catch(() => null),
      ]);

      const stdList = stdRes?.data ? (Array.isArray(stdRes.data) ? stdRes.data : stdRes.data.data || []) : [];
      const crsList = crsRes?.data ? (Array.isArray(crsRes.data) ? crsRes.data : crsRes.data.data || []) : [];
      const admList = admRes?.data ? (Array.isArray(admRes.data) ? admRes.data : admRes.data.data || []) : [];
      const pmtList = pmtRes?.data ? (Array.isArray(pmtRes.data) ? pmtRes.data : pmtRes.data.data || []) : [];

      setStudents(stdList);

      const totalRev = pmtList.reduce((sum, p) => sum + Number(p.amount || 0), 0);

      setDashboard((prev) => ({
        totalStudents: stdList.length || prev.totalStudents || 0,
        totalCourses: crsList.length || prev.totalCourses || 0,
        totalAdmissions: admList.length || prev.totalAdmissions || 0,
        totalRevenue: totalRev || prev.totalRevenue || 0,
      }));
    } catch (err) {
      console.log("Dashboard aggregate metrics error:", err);
    }
  };

  const openCount = students.filter(s => (s.leadStage || "Open") === "Open").length;
  const cnrCount = students.filter(s => s.leadStage === "CNR").length;
  const callBackCount = students.filter(s => s.leadStage === "Call Back").length;
  const stage2Count = students.filter(s => s.leadStage === "Stage 2").length;
  const stage25Count = students.filter(s => s.leadStage === "Stage 2.5").length;
  const admissionDoneCount = students.filter(s => s.leadStage === "Admission Done").length;
  const unassignedCount = students.filter(s => !s.assignedCounselorId).length;

  return (
    <Layout>
      {/* Header */}
      <DashboardHeader />

      {/* Unassigned Leads Alert Banner for Admin */}
      {isAdmin && unassignedCount > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-[#cc785c]/10 border border-[#cc785c]/30 flex items-center justify-between text-[#faf9f5]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#cc785c] text-white flex items-center justify-center font-bold">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Unassigned Enquiries Requiring Attention</h4>
              <p className="text-xs text-[#a09d96]">There are currently <span className="font-bold text-[#cc785c]">{unassignedCount} unassigned lead(s)</span> ready for counsellor assignment.</p>
            </div>
          </div>
          <Link
            to="/students"
            className="px-3.5 py-2 bg-[#cc785c] hover:bg-[#a9583e] text-white text-xs font-bold rounded-xl transition shadow-sm shrink-0"
          >
            Assign Leads Now
          </Link>
        </div>
      )}

      {/* 4 Primary Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Leads / Enquiries"
          value={dashboard.totalStudents}
          icon={Users}
          trend="+18% vs last month"
          variant="cream"
        />

        <DashboardCard
          title="Active Courses"
          value={dashboard.totalCourses}
          icon={GraduationCap}
          trend="+2 new batches"
          variant="soft"
        />

        <DashboardCard
          title="Admissions Completed"
          value={admissionDoneCount || dashboard.totalAdmissions}
          icon={ClipboardList}
          trend="+12 this week"
          variant="coral"
        />

        <DashboardCard
          title="Total Revenue"
          value={`₹${(dashboard.totalRevenue || 0).toLocaleString()}`}
          icon={CreditCard}
          trend="+24% quarterly"
          variant="dark"
        />
      </div>

      {/* PRD Enquiry Stages Breakdown Grid */}
      <div className="mt-8">
        <h3 className="text-sm font-serif-display font-semibold text-[#faf9f5] mb-3 uppercase tracking-wider text-[11px] text-[#a09d96]">
          Enquiry Lifecycle Stages Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#1f1e1b] border border-[#252320] p-4 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-blue-400">1. Open</span>
            <h4 className="text-2xl font-serif-display font-bold text-[#faf9f5] mt-1">{openCount}</h4>
          </div>

          <div className="bg-[#1f1e1b] border border-[#252320] p-4 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-amber-400">2. CNR</span>
            <h4 className="text-2xl font-serif-display font-bold text-[#faf9f5] mt-1">{cnrCount}</h4>
          </div>

          <div className="bg-[#1f1e1b] border border-[#252320] p-4 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-purple-400">3. Call Back</span>
            <h4 className="text-2xl font-serif-display font-bold text-[#faf9f5] mt-1">{callBackCount}</h4>
          </div>

          <div className="bg-[#1f1e1b] border border-[#252320] p-4 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-indigo-400">4. Stage 2</span>
            <h4 className="text-2xl font-serif-display font-bold text-[#faf9f5] mt-1">{stage2Count}</h4>
          </div>

          <div className="bg-[#1f1e1b] border border-[#252320] p-4 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-teal-300">5. Stage 2.5</span>
            <h4 className="text-2xl font-serif-display font-bold text-[#faf9f5] mt-1">{stage25Count}</h4>
          </div>

          <div className="bg-[#1f1e1b] border border-[#252320] p-4 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-emerald-400">6. Admission Done</span>
            <h4 className="text-2xl font-serif-display font-bold text-emerald-300 mt-1">{admissionDoneCount}</h4>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <DashboardChart />
        <RevenueChart />
      </div>

      {/* Recent Activity & Student Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <RecentStudents />
        <RecentActivities />
      </div>
    </Layout>
  );
}

export default Dashboard;