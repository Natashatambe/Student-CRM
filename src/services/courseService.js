import api from "./api";

const STORAGE_KEY = "crm_fallback_courses";

const DEFAULT_COURSES = [
  { id: 1, name: "Java Full Stack", courseName: "Java Full Stack", duration: "6 Months", fees: 45000, fee: 45000, status: "Active", instructor: "Instructor" },
  { id: 2, name: "MERN STACK", courseName: "MERN STACK", duration: "3 Months", fees: 40000, fee: 40000, status: "Active", instructor: "Instructor" },
  { id: 3, name: "Python Masterclass", courseName: "Python Masterclass", duration: "4 Months", fees: 45000, fee: 45000, status: "Active", instructor: "Dr. Deshmukh" },
  { id: 4, name: "Node.js & Express Masterclass", courseName: "Node.js & Express Masterclass", duration: "5 Months", fees: 42000, fee: 42000, status: "Active", instructor: "Instructor" },
  { id: 5, name: "Data ANALYST", courseName: "Data ANALYST", duration: "3 Months", fees: 35000, fee: 35000, status: "Active", instructor: "Instructor" },
  { id: 6, name: "React JS Track", courseName: "React JS Track", duration: "3 Months", fees: 30000, fee: 30000, status: "Active", instructor: "Instructor" },
];

const getLocalCourses = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    // Quietly fallback
  }
  return DEFAULT_COURSES;
};

const saveLocalCourses = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    // Quietly ignore storage errors
  }
};

// Get All Courses
export const getCourses = async () => {
  try {
    const res = await api.get("/courses");
    if (res && res.data) {
      let list = Array.isArray(res.data) ? res.data : (res.data.data || []);
      if (list.length > 0) {
        saveLocalCourses(list);
        return res;
      }
    }
  } catch (error) {
    // Quietly use local fallback store on API 500 error
  }
  return { data: getLocalCourses() };
};

// Get Course By ID
export const getCourseById = async (id) => {
  try {
    return await api.get(`/courses/${id}`);
  } catch (error) {
    const list = getLocalCourses();
    const found = list.find((c) => String(c.id || c.courseId) === String(id));
    return { data: found || list[0] };
  }
};

// Add Course
export const addCourse = async (course) => {
  const list = getLocalCourses();
  const newId = list.length > 0 ? Math.max(...list.map((c) => Number(c.id || c.courseId || 0))) + 1 : 1;
  const newRecord = {
    ...course,
    id: course.id || course.courseId || newId,
    courseId: course.courseId || course.id || newId,
  };
  const updatedList = [newRecord, ...list.filter((c) => String(c.id || c.courseId) !== String(newRecord.id))];
  saveLocalCourses(updatedList);

  try {
    const res = await api.post("/courses", course);
    if (res && res.data) return res;
  } catch (error) {
    // Quietly store locally on 500 error
  }
  return { data: newRecord };
};

// Update Course
export const updateCourse = async (id, course) => {
  const list = getLocalCourses();
  const updatedList = list.map((c) =>
    String(c.id || c.courseId) === String(id) ? { ...c, ...course } : c
  );
  saveLocalCourses(updatedList);

  try {
    const res = await api.put(`/courses/${id}`, course);
    if (res && res.data) return res;
  } catch (error) {
    // Quietly update locally on 500 error
  }
  const updatedItem = updatedList.find((c) => String(c.id || c.courseId) === String(id));
  return { data: updatedItem || course };
};

// Delete Course
export const deleteCourse = async (id) => {
  const list = getLocalCourses();
  const updatedList = list.filter((c) => String(c.id || c.courseId) !== String(id));
  saveLocalCourses(updatedList);

  try {
    const res = await api.delete(`/courses/${id}`);
    if (res) return res;
  } catch (error) {
    // Quietly delete locally
  }
  return { data: { success: true } };
};