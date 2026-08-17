import { useState, useEffect } from "react";
import { CalendarDays, Plus, Clock, CheckCircle2, AlertCircle, User, Calendar as CalendarIcon, Edit2, Trash2 } from "lucide-react";
import Layout from "../../Components/layout/Layout";
import { getAllFollowups, scheduleFollowup, updateFollowupStatus, deleteFollowup } from "../../services/followupService";
import { getStudents } from "../../services/studentService";

export default function FollowupCalendar() {
  const [followups, setFollowups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    followupDate: new Date().toISOString().slice(0, 16),
    status: "Scheduled",
    remarks: ""
  });

  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fRes, sRes] = await Promise.all([
        getAllFollowups(),
        getStudents()
      ]);

      if (fRes && fRes.data) setFollowups(fRes.data);
      if (sRes && sRes.data) setStudents(sRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenScheduleModal = () => {
    setFormData({
      studentId: students.length > 0 ? (students[0].id || students[0].studentId) : "",
      studentName: students.length > 0 ? (students[0].name || `${students[0].firstName} ${students[0].lastName}`) : "",
      followupDate: new Date().toISOString().slice(0, 16),
      status: "Scheduled",
      remarks: ""
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const counselorId = localStorage.getItem("userId") || "1";
      const counselorName = localStorage.getItem("userName") || "Counsellor";
      const selStudent = students.find(s => String(s.id || s.studentId) === String(formData.studentId));

      await scheduleFollowup({
        ...formData,
        studentName: selStudent ? (selStudent.name || `${selStudent.firstName} ${selStudent.lastName}`) : formData.studentName,
        counselorId: Number(counselorId),
        counselorName
      });

      showToast("Follow-up scheduled!");
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast("Failed to schedule follow-up", "error");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateFollowupStatus(id, status);
      showToast(`Follow-up marked as ${status}`);
      fetchData();
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this scheduled follow-up?")) return;
    try {
      await deleteFollowup(id);
      showToast("Follow-up deleted");
      fetchData();
    } catch (err) {
      showToast("Failed to delete follow-up", "error");
    }
  };

  const scheduledList = followups.filter(f => f.status === "Scheduled");
  const completedList = followups.filter(f => f.status === "Completed");

  return (
    <Layout>
      <div className="space-y-6 text-[#faf9f5]">

        {toast && (
          <div className="p-4 rounded-xl text-xs font-semibold bg-emerald-900/40 text-emerald-200 border border-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {toast.msg}
          </div>
        )}

        {/* Top Header & Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-[#1f1e1b] border border-[#252320] p-4 rounded-2xl gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#cc785c]/15 text-[#cc785c] flex items-center justify-center">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-serif-display font-semibold">Scheduled Student Follow-ups</h3>
              <p className="text-xs text-[#a09d96]">{scheduledList.length} pending calls scheduled</p>
            </div>
          </div>

          <button
            onClick={handleOpenScheduleModal}
            className="px-4 py-2.5 bg-[#cc785c] hover:bg-[#a9583e] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition"
          >
            <Plus className="h-4 w-4" /> Schedule New Follow-up
          </button>
        </div>

        {/* Follow-up Cards List */}
        {loading ? (
          <div className="p-8 text-center text-xs text-[#a09d96]">Loading calendar follow-ups...</div>
        ) : followups.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#a09d96]">No scheduled follow-ups found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {followups.map((f) => {
              const isCompleted = f.status === "Completed";
              const isScheduled = f.status === "Scheduled";

              return (
                <div
                  key={f.id}
                  className={`bg-[#1f1e1b] border p-5 rounded-2xl space-y-3 transition ${
                    isCompleted ? "border-emerald-500/30 opacity-80" : "border-[#252320] hover:border-[#cc785c]/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#faf9f5] flex items-center gap-1.5">
                        <User className="h-4 w-4 text-[#cc785c]" /> {f.studentName || `Student #${f.studentId}`}
                      </h4>
                      <p className="text-[11px] text-[#a09d96] flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3 text-[#5db8a6]" /> {f.followupDate ? String(f.followupDate).replace("T", " ") : "2026-08-18 10:30"}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isCompleted
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {f.status || "Scheduled"}
                    </span>
                  </div>

                  {f.remarks && (
                    <p className="text-xs text-[#a09d96] bg-[#181715] p-2.5 rounded-xl border border-[#322f2b]">
                      "{f.remarks}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-[#252320]">
                    <div className="text-[10px] text-[#a09d96]">
                      Counsellor: <span className="text-[#faf9f5] font-semibold">{f.counselorName || "Sarah"}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isScheduled && (
                        <button
                          onClick={() => handleStatusChange(f.id, "Completed")}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Complete
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(f.id)}
                        className="p-1 rounded-lg bg-[#252320] text-rose-400 hover:bg-rose-600 hover:text-white transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Form */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1f1e1b] border border-[#322f2b] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-[#faf9f5]">
              <div className="flex justify-between items-center border-b border-[#252320] pb-3">
                <h3 className="text-base font-serif-display font-semibold">Schedule Student Follow-up</h3>
                <button onClick={() => setModalOpen(false)} className="text-[#a09d96] text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block mb-1 text-[#a09d96]">Select Student Lead</label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#181715] border border-[#322f2b] rounded-xl text-xs text-[#faf9f5] focus:outline-none focus:border-[#cc785c]"
                  >
                    {students.map((s) => (
                      <option key={s.id || s.studentId} value={s.id || s.studentId}>
                        {s.name || `${s.firstName} ${s.lastName}`} ({s.course || "Course Track"})
                      </option>
                    ))}
                    {students.length === 0 && (
                      <option value="101">Jonny Ive (Java Full Stack)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-[#a09d96]">Follow-up Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.followupDate}
                    onChange={(e) => setFormData({ ...formData, followupDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#181715] border border-[#322f2b] rounded-xl text-xs text-[#faf9f5] focus:outline-none focus:border-[#cc785c]"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[#a09d96]">Initial Remarks / Agenda</label>
                  <textarea
                    rows={3}
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="e.g. Call back regarding discount offer and fee EMI option..."
                    className="w-full px-3 py-2 bg-[#181715] border border-[#322f2b] rounded-xl text-xs text-[#faf9f5] focus:outline-none focus:border-[#cc785c]"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-[#252320]">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-[#252320] text-[#faf9f5] rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#cc785c] text-white rounded-xl text-xs font-bold"
                  >
                    Confirm Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

