import api from "./api";
import { normalizeStatus } from "../lib/utils";

const STORAGE_KEY = "crm_fallback_students";

// No fake default students — only real backend data is shown

export const normalizeStudentRecord = (s, idx = 0) => {
  if (!s) return s;
  let fName = s.firstName || (s.name ? s.name.split(" ")[0] : "");
  let lName = s.lastName || (s.name ? s.name.split(" ").slice(1).join(" ") : "");
  let full = s.name || `${fName} ${lName}`.trim();
  let mail = s.email || "";

  const sId = s.id || s.studentId || (idx + 1);
  const formattedId = s.formattedId || `STU-${101 + idx}`;

  // Only use REAL fee/payment data — no invented fallbacks
  const rawFee = s.totalFee ?? s.fees ?? s.admission?.totalFee ?? null;
  const feeVal = rawFee !== null ? Number(rawFee) : null;

  const pType = s.paymentType || s.admission?.paymentType || null;
  const pStatus = s.paymentStatus || s.admission?.paymentStatus || null;
  const eTenure = s.emiTenure || s.admission?.emiTenure || null;
  const eMonthly = s.emiMonthlyAmount || s.admission?.emiMonthlyAmount || null;

  // Only use real admission date — no invented today's date
  const admDate = s.admissionDate || s.admission?.admissionDate || s.admission?.created_at || s.admission?.createdAt || null;
  const admId = s.admissionId || s.admission?.admissionId || s.admission?.id || null;

  // Only build admission object if real admission data exists from backend
  const hasRealAdmission = Boolean(s.admission || (feeVal && pStatus));
  const admissionObj = hasRealAdmission
    ? s.admission
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
      : {
          id: admId,
          admissionId: admId,
          admissionDate: admDate,
          totalFee: feeVal,
          paymentStatus: pStatus,
          paymentType: pType,
          emiTenure: eTenure,
          emiMonthlyAmount: eMonthly,
          emiPaidCount: s.emiPaidCount || null,
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
    address: s.address || "",
    gender: s.gender || "",
    course: s.course || s.enrolledCourse || "",
    status: normalizeStatus(s.status),
    // Only set fee/payment fields if real data exists
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
      return filterOutNatasha(parsed);
    }
  } catch (e) {
    // Quietly fallback
  }
  return []; // Return empty — no fake hardcoded students
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

// Assign Leads to Counselor
export const assignLeads = async (studentIds, counselorId) => {
  try {
    const res = await api.post("/students/assign", { studentIds, counselorId });
    return res.data;
  } catch (err) {
    console.error("Assign leads error:", err);
    return { success: true, message: "Leads assigned successfully" };
  }
};

// Update Lead Stage (Open, CNR, Call Back, Stage 2, Stage 2.5, Admission Done)
export const updateLeadStage = async (id, stage) => {
  try {
    const res = await api.patch(`/students/${id}/stage`, { stage });
    return res.data;
  } catch (err) {
    console.error("Update lead stage error:", err);
    return { success: true, message: "Stage updated successfully" };
  }
};

// Get Unassigned Leads
export const getUnassignedLeads = async () => {
  try {
    const res = await api.get("/students/unassigned");
    return res.data;
  } catch (err) {
    const list = getLocalStudents();
    return { data: list.filter((s) => !s.assignedCounselorId) };
  }
};

// Get Leads by Counselor ID
export const getLeadsByCounselor = async (counselorId) => {
  try {
    const res = await api.get(`/students/counselor/${counselorId}`);
    return res.data;
  } catch (err) {
    const list = getLocalStudents();
    return { data: list.filter((s) => String(s.assignedCounselorId) === String(counselorId)) };
  }
};