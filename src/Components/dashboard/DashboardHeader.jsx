import { Calendar, Download, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

function DashboardHeader() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e6dfd8] mb-8">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-3xl md:text-4xl font-normal text-[#141413] tracking-tight font-serif-display flex items-center gap-2">
            <span className="text-[#cc785c] font-bold text-2xl">✱</span>
            Meet your admission intelligence
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#cc785c] text-white">
            Editorial CRM
          </span>
        </div>
        <p className="text-xs md:text-sm text-[#6c6a64] flex items-center gap-1.5 mt-1 font-medium">
          <Calendar className="h-3.5 w-3.5 text-[#cc785c]" /> {today}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/reports")}
          className="text-xs gap-1.5 border-[#e6dfd8] bg-[#faf9f5]"
        >
          <Download className="h-3.5 w-3.5 text-[#6c6a64]" /> Export Report
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate("/students")}
          className="text-xs gap-1.5 bg-[#cc785c] hover:bg-[#a9583e]"
        >
          <Plus className="h-3.5 w-3.5" /> Add Student
        </Button>
      </div>
    </div>
  );
}

export default DashboardHeader;