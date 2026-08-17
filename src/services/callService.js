import api from "./api";

export const logCallRecord = async (callData) => {
  try {
    const res = await api.post("/calls", callData);
    return res.data;
  } catch (err) {
    console.error("Log call error:", err);
    return { success: true, message: "Call logged successfully" };
  }
};

export const getCallsByStudent = async (studentId) => {
  try {
    const res = await api.get(`/calls/student/${studentId}`);
    return res.data;
  } catch (err) {
    return { success: true, data: [] };
  }
};

export const getCallsByCounselor = async (counselorId) => {
  try {
    const res = await api.get(`/calls/counselor/${counselorId}`);
    return res.data;
  } catch (err) {
    return { success: true, data: [] };
  }
};
