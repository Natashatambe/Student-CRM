import { useState } from "react";
import { PhoneCall, PhoneOff, CheckCircle2, Clock, X } from "lucide-react";
import { logCallRecord } from "../../services/callService";

export default function ClickToCallModal({ student, onClose, onCallLogged }) {
  const [callState, setCallState] = useState("idle"); // idle, calling, connected, ended
  const [callStatus, setCallStatus] = useState("Connected");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const counselorId = localStorage.getItem("userId") || "1";
  const counselorName = localStorage.getItem("userName") || "Counsellor";

  const handleStartCall = () => {
    setCallState("calling");
    setTimeout(() => {
      setCallState("connected");
    }, 2000);
  };

  const handleEndCall = () => {
    setCallState("ended");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await logCallRecord({
        studentId: student.id || student.studentId,
        studentName: student.name || `${student.firstName || ""} ${student.lastName || ""}`.trim(),
        counselorId: Number(counselorId),
        counselorName,
        callStatus,
        remarks,
        callDate: new Date().toISOString()
      });
      onCallLogged();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1f1e1b] border border-[#322f2b] rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl text-[#faf9f5]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#252320] pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#cc785c]/15 text-[#cc785c] flex items-center justify-center">
              <PhoneCall className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-serif-display font-semibold">Click-to-Call Dialer</h3>
              <p className="text-[10px] text-[#a09d96]">Student Counselling Call Session</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#a09d96] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Student Contact Info */}
        <div className="p-4 bg-[#181715] border border-[#322f2b] rounded-xl text-center space-y-1">
          <h4 className="text-base font-bold text-[#faf9f5]">{student.name || `${student.firstName} ${student.lastName}`}</h4>
          <p className="text-xs font-mono text-[#cc785c] font-semibold">{student.phone || "+91 9809890898"}</p>
          <p className="text-[10px] text-[#a09d96]">Course Interest: {student.course || "Java Full Stack"}</p>
        </div>

        {/* Dialer Simulation Bar */}
        <div className="p-4 bg-[#181715] border border-[#322f2b] rounded-xl text-center space-y-3">
          {callState === "idle" && (
            <button
              onClick={handleStartCall}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition animate-pulse"
            >
              <PhoneCall className="h-4 w-4" /> Initiate Call to Student
            </button>
          )}

          {callState === "calling" && (
            <div className="space-y-2 py-2">
              <span className="text-xs text-amber-400 font-semibold flex items-center justify-center gap-1.5 animate-pulse">
                <Clock className="h-4 w-4" /> Dialing Student Number...
              </span>
              <p className="text-[10px] text-[#a09d96]">Connecting to outbound VOIP gateway</p>
            </div>
          )}

          {callState === "connected" && (
            <div className="space-y-3">
              <span className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" /> Call In Progress (00:45)
              </span>
              <button
                onClick={handleEndCall}
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <PhoneOff className="h-4 w-4" /> End Call
              </button>
            </div>
          )}

          {callState === "ended" && (
            <div className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Call Completed • Record Outcome Below
            </div>
          )}
        </div>

        {/* Call Outcome Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block mb-1.5 font-semibold text-[#a09d96]">Call Status Outcome</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Connected",
                "Not Connected",
                "Busy",
                "CNR",
                "Interested",
                "Not Interested",
                "Follow-up Required",
              ].map((st) => (
                <label
                  key={st}
                  className={`p-2 rounded-xl border text-[11px] font-semibold cursor-pointer text-center transition ${
                    callStatus === st
                      ? "bg-[#cc785c] text-white border-[#cc785c]"
                      : "bg-[#181715] border-[#322f2b] text-[#a09d96] hover:border-[#cc785c]/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="callStatus"
                    value={st}
                    checked={callStatus === st}
                    onChange={(e) => setCallStatus(e.target.value)}
                    className="hidden"
                  />
                  {st}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-[#a09d96]">Counselling Remarks / Notes</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Student requested fee structure breakdown and weekend batch timings..."
              className="w-full px-3 py-2 bg-[#181715] border border-[#322f2b] rounded-xl text-xs text-[#faf9f5] focus:outline-none focus:border-[#cc785c]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#252320]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#252320] text-[#faf9f5] rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#cc785c] hover:bg-[#a9583e] text-white rounded-xl text-xs font-bold shadow-md"
            >
              {loading ? "Saving..." : "Save Call Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
