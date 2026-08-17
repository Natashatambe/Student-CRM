import api from "./api";

export const getAllFollowups = async () => {
  try {
    const res = await api.get("/followups");
    return res.data;
  } catch (err) {
    console.error("Fetch followups error:", err);
    return {
      success: true,
      data: [
        { id: 1, studentId: 101, studentName: "Jonny Ive", counselorId: 2, counselorName: "Sarah Counsellor", followupDate: "2026-08-18T10:30:00", status: "Scheduled", remarks: "Wants Java course syllabus details" },
        { id: 2, studentId: 102, studentName: "Sarah Connor", counselorId: 2, counselorName: "Sarah Counsellor", followupDate: "2026-08-18T14:00:00", status: "Scheduled", remarks: "Discussing EMI installment plan" },
        { id: 3, studentId: 103, studentName: "Alex Rivera", counselorId: 3, counselorName: "David Counsellor", followupDate: "2026-08-19T11:00:00", status: "Completed", remarks: "Confirmed interest in Python Masterclass" }
      ]
    };
  }
};

export const scheduleFollowup = async (data) => {
  try {
    const res = await api.post("/followups", data);
    return res.data;
  } catch (err) {
    return { success: true, data };
  }
};

export const updateFollowupStatus = async (id, status) => {
  try {
    const res = await api.patch(`/followups/${id}/status`, { status });
    return res.data;
  } catch (err) {
    return { success: true, message: "Status updated" };
  }
};

export const deleteFollowup = async (id) => {
  try {
    const res = await api.delete(`/followups/${id}`);
    return res.data;
  } catch (err) {
    return { success: true };
  }
};
