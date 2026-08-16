import { Calendar, Download, Plus, FileSpreadsheet } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import PageHeader from "../common/PageHeader";
import { exportToExcel, exportToPDF } from "../../lib/exportUtils";
import { useToast } from "../ui/toast";

function DashboardHeader() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleExportQuickPDF = () => {
    exportToPDF("Admission Intelligence Overview", ["Metric", "Period", "Status"], [
      ["Total Students", "Active Batch", "Enrolled"],
      ["Course Offerings", "Active Tracks", "Live"],
      ["Admissions Desk", "Current Month", "Confirmed"],
      ["Total Revenue", "Quarterly", "Processed"]
    ], "Dashboard_Summary");
    showToast("Exported Executive Dashboard Report!", "success");
  };

  return (
    <PageHeader
      title="Meet your admission intelligence"
      description={`Real-time overview of enrollments, batch tracks, and financial velocity • ${today}`}
      categoryTag="Editorial CRM"
      actions={
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportQuickPDF}
            className="text-xs gap-1.5 border-[#e6dfd8] bg-[#faf9f5]"
          >
            <Download className="h-3.5 w-3.5 text-[#cc785c]" /> Export Executive Report
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
      }
    />
  );
}

export default DashboardHeader;