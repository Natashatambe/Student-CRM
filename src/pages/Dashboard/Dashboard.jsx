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
import { Users, GraduationCap, ClipboardList, CreditCard } from "lucide-react";

function Dashboard() {
  const [dashboard, setDashboard] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalAdmissions: 0,
    totalRevenue: 0,
  });

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

  return (
    <Layout>
      {/* Header */}
      <DashboardHeader />

      {/* 4-Surface Alternating Cards (Cream, Soft, Coral, Dark Navy) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Students"
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
          title="Total Admissions"
          value={dashboard.totalAdmissions}
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

      {/* Recharts Analytics Charts */}
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