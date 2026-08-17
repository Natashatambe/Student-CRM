import api from "./api";

const STORAGE_KEY = "crm_fallback_admissions";

const filterOutNatasha = (list) => {
  if (!Array.isArray(list)) return [];
  return list;
};

const getLocalAdmissions = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data !== null) {
      const parsed = JSON.parse(data);
      const cleaned = filterOutNatasha(parsed);
      if (cleaned.length !== parsed.length) {
        saveLocalAdmissions(cleaned);
      }
      return cleaned;
    }
  } catch (e) {
    // Quietly fallback
  }
  return [];
};

const saveLocalAdmissions = (list) => {
  try {
    const cleaned = filterOutNatasha(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  } catch (e) {
    // Quietly ignore
  }
};

// Clear All Admissions Data (Frontend & Backend)
export const clearAllAdmissionsData = async () => {
  try {
    await api.delete("/admissions");
  } catch (e) {
    // Quietly ignore
  }
  saveLocalAdmissions([]);
  return { data: [] };
};

// Get All Admissions
export const getAdmissions = async () => {
  try {
    const res = await api.get("/admissions");
    if (res && res.data) {
      let list = Array.isArray(res.data) ? res.data : (res.data.data || []);
      list = filterOutNatasha(list);
      saveLocalAdmissions(list);
      return { ...res, data: list };
    }
  } catch (error) {
    // Quietly use local store
  }
  return { data: getLocalAdmissions() };
};

// Get Admission By ID
export const getAdmissionById = async (id) => {
  try {
    return await api.get(`/admissions/${id}`);
  } catch (error) {
    const list = getLocalAdmissions();
    const found = list.find((a) => String(a.id || a.admissionId) === String(id));
    return { data: found || (list.length > 0 ? list[0] : null) };
  }
};

// Add Admission
export const addAdmission = async (admission) => {
  const list = getLocalAdmissions();
  const newId = list.length > 0 ? Math.max(...list.map((a) => Number(a.id || a.admissionId || 0))) + 1 : 101;
  const newRecord = {
    ...admission,
    id: admission.id || admission.admissionId || newId,
    admissionId: admission.admissionId || admission.id || newId,
  };
  const updatedList = [newRecord, ...list.filter((a) => String(a.id || a.admissionId) !== String(newRecord.id))];
  saveLocalAdmissions(updatedList);

  try {
    // Only send scalar fields — do NOT spread nested student/course objects
    const payload = {
      studentId: Number(admission.studentId || admission.student?.id || 0),
      courseId: Number(admission.courseId || admission.course?.id || 0),
      admissionDate: admission.admissionDate,
      totalFee: Number(admission.totalFee || 0),
      paymentStatus: admission.paymentStatus,
      paymentType: admission.paymentType || "Full",
      emiTenure: admission.emiTenure || null,
      emiMonthlyAmount: admission.emiMonthlyAmount || null,
      emiPaidCount: admission.emiPaidCount || null,
    };
    const res = await api.post("/admissions", payload);
    if (res && res.data) return res;
  } catch (error) {
    // Quietly fallback
  }

  return { data: newRecord };
};

// Update Admission
export const updateAdmission = async (id, admission) => {
  const list = getLocalAdmissions();
  const updatedList = list.map((a) =>
    String(a.id || a.admissionId) === String(id) ? { ...a, ...admission } : a
  );
  saveLocalAdmissions(updatedList);

  try {
    // Only send scalar fields — do NOT spread nested student/course objects
    const payload = {
      studentId: Number(admission.studentId || admission.student?.id || 0),
      courseId: Number(admission.courseId || admission.course?.id || 0),
      admissionDate: admission.admissionDate,
      totalFee: Number(admission.totalFee || 0),
      paymentStatus: admission.paymentStatus,
      paymentType: admission.paymentType || "Full",
      emiTenure: admission.emiTenure || null,
      emiMonthlyAmount: admission.emiMonthlyAmount || null,
      emiPaidCount: admission.emiPaidCount || null,
    };
    const res = await api.put(`/admissions/${id}`, payload);
    if (res && res.data) return res;
  } catch (error) {
    // Quietly fallback
  }

  const updatedItem = updatedList.find((a) => String(a.id || a.admissionId) === String(id));
  return { data: updatedItem || admission };
};

// Delete Admission
export const deleteAdmission = async (id) => {
  const list = getLocalAdmissions();
  const updatedList = list.filter((a) => String(a.id || a.admissionId) !== String(id));
  saveLocalAdmissions(updatedList);

  try {
    const res = await api.delete(`/admissions/${id}`);
    if (res) return res;
  } catch (error) {
    // Quietly fallback
  }

  return { data: { success: true } };
};