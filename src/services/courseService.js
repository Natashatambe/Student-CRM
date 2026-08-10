import api from "./api";

// Get All Courses
export const getCourses = async () => {
  return await api.get("/courses");
};

// Get Course By ID
export const getCourseById = async (id) => {
  return await api.get(`/courses/${id}`);
};

// Add Course
export const addCourse = async (course) => {
  return await api.post("/courses", course);
};

// Update Course
export const updateCourse = async (id, course) => {
  return await api.put(`/courses/${id}`, course);
};

// Delete Course
export const deleteCourse = async (id) => {
  return await api.delete(`/courses/${id}`);
};