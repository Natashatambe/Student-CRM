import api from "./api";
import { normalizeStatus } from "../lib/utils";

const STORAGE_KEY = "crm_fallback_students";

const DEFAULT_STUDENTS = [
  {
    id: 1,
    studentId: 1,
    firstName: "Jonny",
    lastName: "Ive",
    name: "Jonny Ive",
    email: "jonny@apple.com",
    phone: "9876543210",
    address: "Infinite Loop 1, Cupertino",
    gender: "Male",
    course: "Java Full Stack",
    status: "Active",
    fees: 50000,
    totalFee: 50000,
    paymentType: "Full",
    paymentStatus: "Paid",
  },
  {
    id: 2,
    studentId: 2,
    firstName: "Sarah",
    lastName: "Connor",
    name: "Sarah Connor",
    email: "sarah@sky.net",
    phone: "9876543211",
    address: "Cyberdyne Systems Ave, LA",
    gender: "Female",
    course: "Python Masterclass",
    status: "Active",
    fees: 35000,
    totalFee: 35000,
    paymentType: "Full",
    paymentStatus: "Paid",
  },
  {
    id: 3,
    studentId: 3,
    firstName: "Alex",
    lastName: "Rivera",
    name: "Alex Rivera",
    email: "alex.rivera@tech.org",
    phone: "9876543212",
    address: "45 Innovation Way, NY",
    gender: "Male",
    course: "React JS Track",
    status: "Pending",
    fees: 30000,
    totalFee: 30000,
    paymentType: "EMI",
    paymentStatus: "Partial",
    emiTenure: 3,
    emiMonthlyAmount: 10000,
  },
];

export const normalizeStudentRecord = (s, idx = 0) => {
  if (!s) return s;
  let fName = s.firstName || (s.name ? s.name.split(" ")[0] : "");
  let lName = s.lastName || (s.name ? s.name.split(" ").slice(1).join(" ") : "");
  let full = s.name || `${fName} ${lName}`.trim();
  let mail = s.email || "";

  const sId = s.id || s.studentId || (idx + 1);
  const feeVal = Number(s.totalFee ?? s.fees ?? s.admission?.totalFee ?? 50000);
  const pType = s.paymentType || s.admission?.paymentType || "Full";
  const eTenure = s.emiTenure || s.admission?.emiTenure || (pType === "EMI" ? 3 : null);
  const pStatus = s.paymentStatus || s.admission?.paymentStatus || (pType === "EMI" ? "Partial" : (s.status === "Active" ? "Paid" : "Pending"));
  const eMonthly = s.emiMonthlyAmount || s.admission?.emiMonthlyAmount || (pType === "EMI" ? Math.round(feeVal / (eTenure || 3)) : null);
  const formattedId = s.formattedId || `STU-${101 + idx}`;
  const admId = s.admissionId || s.admission?.admissionId || s.admission?.id || sId;
  const admDate = s.admissionDate || s.admission?.admissionDate || s.admission?.created_at || s.admission?.createdAt || new Date().toISOString().split("T")[0];

  const admissionObj = s.admission
    ? {
        ...s.admission,
        id: s.admission.id || admId,
        admissionId: s.admission.admissionId || s.admission.id || admId,
        admissionDate: s.admission.admissionDate || s.admission.created_at || admDate,
        totalFee: Number(s.admission.totalFee || feeVal),
        paymentStatus: s.admission.paymentStatus || pStatus,
        paymentType: s.admission.paymentType || pType,
        emiTenure: s.admission.emiTenure || eTenure,
        emiMonthlyAmount: s.admission.emiMonthlyAmount || eMonthly,
      }
    : s.status === "Active" || admId || feeVal
    ? {
        id: admId,
        admissionId: admId,
        admissionDate: admDate,
        totalFee: feeVal,
        paymentStatus: pStatus,
        paymentType: pType,
        emiTenure: eTenure,
        emiMonthlyAmount: eMonthly,
        emiPaidCount: s.emiPaidCount || 1,
      }
    : null;

  return {
    ...s,
    id: sId,
    studentId: sId,
    formattedId,
    firstName: fName,
    lastName: lName,
    name: full,
    email: mail,
    phone: s.phone || s.phoneNumber || "",
    address: s.address || "Main City",
    gender: s.gender || "Male",
    course: s.course || s.enrolledCourse || "Java Full Stack",
    status: normalizeStatus(s.status),
    fees: feeVal,
    totalFee: feeVal,
    paymentType: pType,
    paymentStatus: pStatus,
    emiTenure: eTenure,
    emiMonthlyAmount: eMonthly,
    admission: admissionObj,
    admissionId: admId,
    admissionDate: admDate,
  };
};

const filterOutNatasha = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map((s, idx) => normalizeStudentRecord(s, idx));
};

const getLocalStudents = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      const cleaned = filterOutNatasha(parsed);
      saveLocalStudents(cleaned);
      return cleaned;
    }
  } catch (e) {
    // Quietly fallback
  }
  return filterOutNatasha(DEFAULT_STUDENTS);
};

const saveLocalStudents = (list) => {
  try {
    const cleaned = filterOutNatasha(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  } catch (e) {
    // Quietly ignore
  }
};

// Get All Students
export const getStudents = async () => {
  try {
    const res = await api.get("/students");
    if (res && res.data) {
      let list = Array.isArray(res.data) ? res.data : res.data.data || [];
      list = filterOutNatasha(list);
      saveLocalStudents(list);
      return { ...res, data: list };
    }
  } catch (error) {
    // Quietly use local store
  }
  return { data: getLocalStudents() };
};

// Get Student By ID
export const getStudentById = async (id) => {
  try {
    const res = await api.get(`/students/${id}`);
    if (res && res.data) return res;
  } catch (error) {
    const list = getLocalStudents();
    const found = list.find((s) => String(s.id || s.studentId) === String(id));
    return { data: found || list[0] };
  }
};

// Add Student
export const addStudent = async (student) => {
  const list = getLocalStudents();
  const newId = list.length > 0 ? Math.max(...list.map((s) => Number(s.id || s.studentId || 0))) + 1 : 1;
  const newRecord = {
    ...student,
    id: student.id || student.studentId || newId,
    studentId: student.studentId || student.id || newId,
  };
  const updatedList = [newRecord, ...list.filter((s) => String(s.id || s.studentId) !== String(newRecord.id))];
  saveLocalStudents(updatedList);

  try {
    const res = await api.post("/students", student);
    if (res && res.data) return res;
  } catch (error) {
    // Quietly store locally
  }
  return { data: newRecord };
};

// Update Student
export const updateStudent = async (id, student) => {
  const list = getLocalStudents();
  const updatedList = list.map((s) =>
    String(s.id || s.studentId) === String(id) ? { ...s, ...student } : s
  );
  saveLocalStudents(updatedList);

  try {
    const res = await api.put(`/students/${id}`, student);
    if (res && res.data) {
      const merged = { ...student, ...(res.data || {}) };
      const reUpdated = updatedList.map((s) =>
        String(s.id || s.studentId) === String(id) ? { ...s, ...merged } : s
      );
      saveLocalStudents(reUpdated);
      return { ...res, data: merged };
    }
  } catch (error) {
    // Quietly update locally
  }
  const updatedItem = updatedList.find((s) => String(s.id || s.studentId) === String(id));
  return { data: updatedItem || student };
};

// Delete Student
export const deleteStudent = async (id) => {
  const list = getLocalStudents();
  const updatedList = list.filter((s) => String(s.id || s.studentId) !== String(id));
  saveLocalStudents(updatedList);

  try {
    const rawAdm = localStorage.getItem("crm_fallback_admissions");
    if (rawAdm) {
      const admList = JSON.parse(rawAdm);
      const filtered = admList.filter(
        (a) => String(a.studentId) !== String(id) && String(a.student?.id || a.student?.studentId) !== String(id)
      );
      localStorage.setItem("crm_fallback_admissions", JSON.stringify(filtered));
    }
  } catch (e) {}

  try {
    const res = await api.delete(`/students/${id}`);
    if (res) return res;
  } catch (error) {
    // Quietly fallback to local delete
  }

  return { data: { success: true } };
};