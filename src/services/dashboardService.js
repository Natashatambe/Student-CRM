import api from "./api";

// Get Overview Dashboard Metrics
export const getDashboardData = async () => {
  return await api.get("/dashboard");
};

// Get Analytics Reports Metrics
export const getReportsData = async () => {
  return await api.get("/reports");
};