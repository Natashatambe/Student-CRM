import { useState, useEffect } from "react";
import { UserCheck, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
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
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Enquiries / Leads</DialogTitle>
          <DialogDescription>Assign selected student leads to a designated staff counsellor</DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="p-3.5 bg-[#efe9de] border border-[#e6dfd8] rounded-xl text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#6c6a64]">Selected Batch</span>
            <p className="font-bold text-emerald-800">{selectedLeadIds.length} Lead(s) Selected for Assignment</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-800 border border-rose-500/30 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-2 text-xs">
            <label className="block font-semibold text-[#6c6a64]">Target Staff Counsellor</label>
            <Select
              value={selectedCounselorId}
              onChange={(e) => setSelectedCounselorId(e.target.value)}
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
            </Select>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={loading}
            className="bg-[#cc785c] hover:bg-[#a9583e] font-bold gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            {loading ? "Assigning..." : "Confirm Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
