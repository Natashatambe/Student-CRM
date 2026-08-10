import api from "./api";

// Login User
export const loginUser = async (loginData) => {
  return await api.post("/auth/login", loginData);
};

// Register User
export const registerUser = async (userData) => {
  return await api.post("/auth/register", userData);
};

// Get Current User Profile
export const getCurrentUser = async () => {
  return await api.get("/auth/me");
};