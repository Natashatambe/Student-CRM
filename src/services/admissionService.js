import api from "./api";

// Get All Admissions
export const getAdmissions = async () => {
  return await api.get("/admissions");
};

// Get Admission By ID
export const getAdmissionById = async (id) => {
  return await api.get(`/admissions/${id}`);
};

// Add Admission
export const addAdmission = async (admission) => {
  return await api.post("/admissions", admission);
};

// Update Admission
export const updateAdmission = async (id, admission) => {
  return await api.put(`/admissions/${id}`, admission);
};

// Delete Admission
export const deleteAdmission = async (id) => {
  return await api.delete(`/admissions/${id}`);
};