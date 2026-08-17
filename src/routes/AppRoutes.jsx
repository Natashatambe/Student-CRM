import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Students from "../pages/Students/Students";
import Courses from "../pages/Courses/Courses";
import Admissions from "../pages/Admissions/Admissions";
import Payments from "../pages/Payments/Payments";
import Reports from "../pages/Reports/Reports";
import UserManagement from "../pages/Users/UserManagement";
import LeadSources from "../pages/LeadSources/LeadSources";
import LeadImport from "../pages/LeadImport/LeadImport";
import FollowupCalendar from "../pages/Followups/FollowupCalendar";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Shared Routes (Accessible by Admin and Counsellor) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <Students />
            </ProtectedRoute>
          }
        />
        <Route
          path="/followups"
          element={
            <ProtectedRoute>
              <FollowupCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admissions"
          element={
            <ProtectedRoute>
              <Admissions />
            </ProtectedRoute>
          }
        />

        {/* Admin Only Routes (Blocked for Counsellors) */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lead-sources"
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
              <LeadSources />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lead-import"
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
              <LeadImport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
              <Courses />
            </ProtectedRoute>
          }
        />
        {/* Wildcard Fallback */}
        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;