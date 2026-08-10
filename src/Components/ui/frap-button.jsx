import { useState } from "react";
import { Sparkles, UserPlus, CreditCard, ClipboardList, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

function FrapButton() {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Quick Action Flyout Options */}
      {expanded && (
        <div className="flex flex-col gap-2.5 items-end animate-in slide-in-from-bottom-5 fade-in duration-200">
          <button
            onClick={() => {
              setExpanded(false);
              navigate("/students");
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#181715] text-[#faf9f5] text-xs font-medium shadow-xl hover:bg-[#252320] transition-all active:scale-[0.95]"
          >
            <span>Add Student</span>
            <UserPlus className="h-4 w-4 text-[#cc785c]" />
          </button>

          <button
            onClick={() => {
              setExpanded(false);
              navigate("/admissions");
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#181715] text-[#faf9f5] text-xs font-medium shadow-xl hover:bg-[#252320] transition-all active:scale-[0.95]"
          >
            <span>New Admission</span>
            <ClipboardList className="h-4 w-4 text-[#cc785c]" />
          </button>

          <button
            onClick={() => {
              setExpanded(false);
              navigate("/payments");
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#181715] text-[#faf9f5] text-xs font-medium shadow-xl hover:bg-[#252320] transition-all active:scale-[0.95]"
          >
            <span>Record Payment</span>
            <CreditCard className="h-4 w-4 text-[#cc785c]" />
          </button>
        </div>
      )}

      {/* Signature Floating 56px Coral Action Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="h-14 w-14 rounded-full bg-[#cc785c] hover:bg-[#a9583e] text-white flex items-center justify-center shadow-xl active:scale-[0.95] transition-all duration-200 group cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#cc785c]/30"
        title="Quick Action"
      >
        {expanded ? (
          <X className="h-6 w-6 text-white transition-transform duration-200" />
        ) : (
          <div className="flex items-center justify-center relative">
            <Sparkles className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-200" />
          </div>
        )}
      </button>
    </div>
  );
}

export default FrapButton;
