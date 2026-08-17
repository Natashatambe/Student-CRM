import { useState } from "react";
import { PhoneCall, PhoneOff, CheckCircle2, Clock, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
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
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Click-to-Call Dialer Session</DialogTitle>
          <DialogDescription>Initiate live outbound VOIP call & log counselling session outcome</DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {/* Student Info Box */}
          <div className="p-4 bg-[#efe9de] border border-[#e6dfd8] rounded-xl text-center space-y-1">
            <h4 className="text-base font-bold text-[#141413]">{student.name || `${student.firstName || ""} ${student.lastName || ""}`.trim()}</h4>
            <p className="text-xs font-mono text-[#cc785c] font-bold">{student.phone || "+91 9809890898"}</p>
            <p className="text-xs text-[#6c6a64] mt-0.5">Course Interest: <span className="font-semibold text-[#141413]">{student.course || "Java Full Stack"}</span></p>
          </div>

          {/* Dialer Simulator */}
          <div className="p-4 bg-[#efe9de] border border-[#e6dfd8] rounded-xl text-center space-y-3">
            {callState === "idle" && (
              <Button
                type="button"
                onClick={handleStartCall}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold animate-pulse gap-2"
              >
                <PhoneCall className="h-4 w-4" /> Start Dialing Student Number
              </Button>
            )}

            {callState === "calling" && (
              <div className="space-y-2 py-2">
                <span className="text-xs text-amber-700 font-bold flex items-center justify-center gap-1.5 animate-pulse">
                  <Clock className="h-4 w-4" /> Connecting to Outbound VOIP Gateway...
                </span>
                <p className="text-[11px] text-[#6c6a64]">Simulating active call connection...</p>
              </div>
            )}

            {callState === "connected" && (
              <div className="space-y-3">
                <span className="text-xs text-emerald-700 font-bold flex items-center justify-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Call In Progress (00:45)
                </span>
                <Button
                  type="button"
                  onClick={handleEndCall}
                  variant="destructive"
                  className="w-full font-bold gap-2"
                >
                  <PhoneOff className="h-4 w-4" /> End Active Call
                </Button>
              </div>
            )}

            {callState === "ended" && (
              <div className="text-xs text-emerald-800 font-bold flex items-center justify-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Call Ended • Select Status & Save Outcome Below
              </div>
            )}
          </div>

          {/* Call Outcome Form */}
          <form id="call-record-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block mb-1.5 font-semibold text-[#6c6a64]">Call Outcome Status</label>
              <Select
                value={callStatus}
                onChange={(e) => setCallStatus(e.target.value)}
              >
                <option value="Connected">Connected</option>
                <option value="Not Connected">Not Connected</option>
                <option value="Busy">Busy</option>
                <option value="CNR">CNR (Could Not Reach)</option>
                <option value="Interested">Interested</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Follow-up Required">Follow-up Required</option>
              </Select>
            </div>

            <div>
              <label className="block mb-1 font-semibold text-[#6c6a64]">Counselling Notes / Remarks</label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Student requested fee structure breakdown and weekend batch timings..."
                className="w-full px-3.5 py-2.5 bg-[#efe9de] border border-[#e6dfd8] rounded-xl text-xs text-[#141413] focus:outline-none focus:border-[#cc785c]"
              />
            </div>
          </form>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="call-record-form" disabled={loading} className="bg-[#cc785c] hover:bg-[#a9583e]">
            {loading ? "Saving..." : "Save Call Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
