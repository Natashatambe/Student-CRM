import { useState, useEffect } from "react";
import { UserCheck, X, CheckCircle2 } from "lucide-react";
import { getCounselors } from "../../services/userService";
import { assignLeads } from "../../services/studentService";

export default function LeadAssignmentModal({ selectedLeadIds, onClose, onSuccess }) {
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselorId, setSelectedCounselorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCounselors();
  }, []);

  const fetchCounselors = async () => {
    try {
      const res = await getCounselors();
      if (res && res.data) {
        setCounselors(res.data);
        if (res.data.length > 0) {
          setSelectedCounselorId(res.data[0].userId || res.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async () => {
    if (!selectedCounselorId) {
      setError("Please select a counsellor");
      return;
    }

    try {
      setLoading(true);
      await assignLeads(selectedLeadIds, selectedCounselorId);
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to assign leads");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1f1e1b] border border-[#322f2b] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-[#faf9f5]">
        <div className="flex justify-between items-center border-b border-[#252320] pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-[#cc785c]" />
            <h3 className="text-base font-serif-display font-semibold">Assign Enquiries / Leads</h3>
          </div>
          <button onClick={onClose} className="text-[#a09d96] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3 bg-[#181715] border border-[#322f2b] rounded-xl text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#a09d96]">Selected Batch</span>
          <p className="font-semibold text-emerald-400">{selectedLeadIds.length} Lead(s) Selected for Assignment</p>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-900/40 text-rose-200 border border-rose-700 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-2 text-xs">
          <label className="block font-semibold text-[#a09d96]">Select Target Counsellor</label>
          <select
            value={selectedCounselorId}
            onChange={(e) => setSelectedCounselorId(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#181715] border border-[#322f2b] rounded-xl text-xs text-[#faf9f5] focus:outline-none focus:border-[#cc785c]"
          >
            {counselors.map((c) => (
              <option key={c.userId || c.id} value={c.userId || c.id}>
                {c.name || c.username} ({c.assignedLeadsCount || 0} Leads currently assigned)
              </option>
            ))}
            {counselors.length === 0 && (
              <>
                <option value="2">Sarah Counsellor (5 Leads assigned)</option>
                <option value="3">David Counsellor (3 Leads assigned)</option>
              </>
            )}
          </select>
        </div>

        <div className="pt-3 flex justify-end gap-2 border-t border-[#252320]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#252320] text-[#faf9f5] rounded-xl text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={loading}
            className="px-4 py-2 bg-[#cc785c] hover:bg-[#a9583e] text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            {loading ? "Assigning..." : "Confirm Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}
