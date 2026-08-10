import api from "./api";

// Get All Students
export const getStudents = async () => {
  return await api.get("/students");
};

// Get Student By ID
export const getStudentById = async (id) => {
  return await api.get(`/students/${id}`);
};

// Add Student
export const addStudent = async (student) => {
  return await api.post("/students", student);
};

// Update Student
export const updateStudent = async (id, student) => {
  return await api.put(`/students/${id}`, student);
};

// Delete Student
export const deleteStudent = async (id) => {
  return await api.delete(`/students/${id}`);
};