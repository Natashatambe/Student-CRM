import { useState, useEffect } from "react";
import { CalendarDays, Plus, Clock, CheckCircle2, User, PhoneCall, Trash2, Filter } from "lucide-react";
import Layout from "../../Components/layout/Layout";
import PageHeader from "../../Components/common/PageHeader";
import ClickToCallModal from "../../Components/dialer/ClickToCallModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "../../Components/ui/dialog";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Select } from "../../Components/ui/select";
import { Badge } from "../../Components/ui/badge";
import { Card } from "../../Components/ui/card";
import { getAllFollowups, scheduleFollowup, updateFollowupStatus, deleteFollowup } from "../../services/followupService";
import { getStudents } from "../../services/studentService";

export default function FollowupCalendar() {
  const [followups, setFollowups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [dialerStudent, setDialerStudent] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

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
      if (sRes && sRes.data) {
        const stdList = Array.isArray(sRes.data) ? sRes.data : sRes.data.data || [];
        setStudents(stdList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenScheduleModal = () => {
    const firstStudent = students.length > 0 ? students[0] : null;
    setFormData({
      studentId: firstStudent ? (firstStudent.id || firstStudent.studentId) : "",
      studentName: firstStudent ? (firstStudent.name || `${firstStudent.firstName || ""} ${firstStudent.lastName || ""}`.trim()) : "",
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
        studentName: selStudent ? (selStudent.name || `${selStudent.firstName || ""} ${selStudent.lastName || ""}`.trim()) : formData.studentName,
        counselorId: Number(counselorId),
        counselorName
      });

      showToast("Follow-up appointment scheduled successfully!");
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
    if (!window.confirm("Are you sure you want to delete this follow-up schedule?")) return;
    try {
      await deleteFollowup(id);
      showToast("Follow-up deleted");
      fetchData();
    } catch (err) {
      showToast("Failed to delete follow-up", "error");
    }
  };

  const filteredFollowups = followups.filter(f => {
    if (statusFilter === "ALL") return true;
    return (f.status || "Scheduled").toUpperCase() === statusFilter.toUpperCase();
  });

  const scheduledCount = followups.filter(f => f.status === "Scheduled").length;
  const completedCount = followups.filter(f => f.status === "Completed").length;

  return (
    <Layout>
      <PageHeader
        title="Follow-up Calendar & Schedules"
        description="Schedule, track, and manage student counselling call appointments and follow-up activities."
        badgeText={`${scheduledCount} Pending`}
        primaryAction={
          <Button
            onClick={handleOpenScheduleModal}
            className="bg-[#cc785c] hover:bg-[#a9583e] text-white font-bold gap-2"
          >
            <Plus className="h-4 w-4" /> Schedule New Follow-up
          </Button>
        }
      />

      <div className="space-y-6">

        {toast && (
          <div className="p-4 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {toast.msg}
          </div>
        )}

        {/* Stats & Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-[#efe9de] border-[#e6dfd8] flex items-center justify-between">
            <div>
              <p className="text-xs text-[#6c6a64] font-medium">Pending Scheduled</p>
              <h3 className="text-2xl font-serif-display font-bold text-[#141413] mt-0.5">{scheduledCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#cc785c]/15 text-[#cc785c] flex items-center justify-center font-bold">
              <Clock className="h-5 w-5" />
            </div>
          </Card>

          <Card className="p-4 bg-[#efe9de] border-[#e6dfd8] flex items-center justify-between">
            <div>
              <p className="text-xs text-[#6c6a64] font-medium">Completed Follow-ups</p>
              <h3 className="text-2xl font-serif-display font-bold text-emerald-700 mt-0.5">{completedCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </Card>

          <Card className="p-4 bg-[#efe9de] border-[#e6dfd8] flex items-center justify-between">
            <div className="w-full">
              <p className="text-xs text-[#6c6a64] font-medium mb-1.5 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5 text-[#cc785c]" /> Filter by Status
              </p>
              <div className="flex gap-1.5">
                {["ALL", "Scheduled", "Completed"].map((st) => (
                  <Button
                    key={st}
                    size="sm"
                    variant={statusFilter === st ? "default" : "outline"}
                    onClick={() => setStatusFilter(st)}
                    className={statusFilter === st ? "bg-[#cc785c] hover:bg-[#a9583e]" : "border-[#e6dfd8] text-[#6c6a64]"}
                  >
                    {st}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Follow-up Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[#6c6a64]">Loading follow-up schedules...</div>
        ) : filteredFollowups.length === 0 ? (
          <div className="bg-[#efe9de] border border-[#e6dfd8] p-12 rounded-2xl text-center text-xs text-[#6c6a64]">
            No scheduled follow-ups found for this view.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFollowups.map((f) => {
              const isCompleted = f.status === "Completed";

              return (
                <Card
                  key={f.id}
                  className={`p-5 space-y-3.5 transition hover:shadow-md ${
                    isCompleted ? "border-emerald-500/30 opacity-80" : "border-[#e6dfd8] hover:border-[#cc785c]/60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#141413] flex items-center gap-1.5">
                        <User className="h-4 w-4 text-[#cc785c]" /> {f.studentName || `Student #${f.studentId}`}
                      </h4>
                      <p className="text-xs text-[#6c6a64] flex items-center gap-1 mt-1 font-mono">
                        <Clock className="h-3.5 w-3.5 text-[#5db8a6]" /> {f.followupDate ? String(f.followupDate).replace("T", " ") : "2026-08-18 10:30"}
                      </p>
                    </div>

                    <Badge variant={isCompleted ? "success" : "warning"}>
                      {f.status || "Scheduled"}
                    </Badge>
                  </div>

                  {f.remarks && (
                    <p className="text-xs text-[#6c6a64] bg-[#faf9f5] p-3 rounded-xl border border-[#e6dfd8] italic">
                      "{f.remarks}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2.5 border-t border-[#e6dfd8]">
                    <div className="text-[11px] text-[#6c6a64]">
                      Counsellor: <span className="text-[#141413] font-bold">{f.counselorName || "Sarah"}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => setDialerStudent({ id: f.studentId, name: f.studentName, phone: "+91 9809890898" })}
                        className="bg-[#cc785c] hover:bg-[#a9583e] text-xs h-7 gap-1"
                      >
                        <PhoneCall className="h-3 w-3" /> Call
                      </Button>

                      {!isCompleted && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(f.id, "Completed")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-xs h-7 gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Done
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(f.id)}
                        className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-600 hover:text-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Click-to-Call Dialer Modal */}
        {dialerStudent && (
          <ClickToCallModal
            student={dialerStudent}
            onClose={() => setDialerStudent(null)}
            onCallLogged={() => {
              showToast("Call log saved successfully!");
              fetchData();
            }}
          />
        )}

        {/* Schedule Modal using Shadcn Dialog */}
        {modalOpen && (
          <Dialog open={true} onOpenChange={(open) => !open && setModalOpen(false)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule Student Follow-up</DialogTitle>
                <DialogDescription>Create a future call appointment and counselling activity record</DialogDescription>
              </DialogHeader>

              <DialogBody>
                <form id="schedule-followup-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block mb-1 font-semibold text-[#6c6a64]">Select Student Lead</label>
                    <Select
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    >
                      {students.map((s) => (
                        <option key={s.id || s.studentId} value={s.id || s.studentId}>
                          {s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim()} ({s.course || "Track"})
                        </option>
                      ))}
                      {students.length === 0 && (
                        <option value="101">Jonny Ive (Java Full Stack)</option>
                      )}
                    </Select>
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold text-[#6c6a64]">Follow-up Date & Time</label>
                    <Input
                      type="datetime-local"
                      required
                      value={formData.followupDate}
                      onChange={(e) => setFormData({ ...formData, followupDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold text-[#6c6a64]">Initial Remarks / Agenda</label>
                    <textarea
                      rows={3}
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="e.g. Call back regarding fee structure breakdown and batch schedule..."
                      className="w-full px-3.5 py-2.5 bg-[#efe9de] border border-[#e6dfd8] rounded-xl text-xs text-[#141413] focus:outline-none focus:border-[#cc785c]"
                    />
                  </div>
                </form>
              </DialogBody>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" form="schedule-followup-form" className="bg-[#cc785c] hover:bg-[#a9583e] font-bold">
                  Confirm Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}
