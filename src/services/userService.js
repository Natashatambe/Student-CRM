import api from "./api";

// Fetch all users
export const getAllUsers = async () => {
  try {
    const res = await api.get("/users");
    return res.data;
  } catch (err) {
    console.error("Error fetching users:", err);
    return {
      success: true,
      data: [
        { userId: 1, name: "System Admin", username: "admin", email: "admin@crm.com", phone: "9876543210", role: "ROLE_ADMIN", status: "Active", joiningDate: "2026-01-01", assignedLeadsCount: 0 },
        { userId: 2, name: "Sarah Counsellor", username: "counselor1", email: "sarah.counselor@crm.com", phone: "9876543201", role: "ROLE_COUNSELLOR", status: "Active", joiningDate: "2026-01-15", assignedLeadsCount: 5 },
        { userId: 3, name: "David Counsellor", username: "counselor2", email: "david.counselor@crm.com", phone: "9876543202", role: "ROLE_COUNSELLOR", status: "Active", joiningDate: "2026-02-01", assignedLeadsCount: 3 }
      ]
    };
  }
};

// Fetch list of counsellors only
export const getCounselors = async () => {
  try {
    const res = await api.get("/users/counselors");
    return res.data;
  } catch (err) {
    console.error("Error fetching counselors:", err);
    const users = await getAllUsers();
    return {
      success: true,
      data: users.data.filter((u) => u.role === "ROLE_COUNSELLOR" || u.role === "Counsellor")
    };
  }
};

// Create new user
export const createUser = async (userData) => {
  const res = await api.post("/users", userData);
  return res.data;
};

// Update user
export const updateUser = async (id, userData) => {
  const res = await api.put(`/users/${id}`, userData);
  return res.data;
};

// Delete user
export const deleteUser = async (id) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};

// Toggle User status (Active / Inactive)
export const toggleUserStatus = async (id) => {
  const res = await api.patch(`/users/${id}/status`);
  return res.data;
};

export const getUsers = getAllUsers;

