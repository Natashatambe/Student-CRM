import { BookOpen, CheckCircle, XCircle } from "lucide-react";
import { Card } from "../ui/card";

function CourseStatsCard({ title, value }) {
  const getIcon = () => {
    switch (title) {
      case "Total Courses":
        return <BookOpen className="h-6 w-6 text-[#00754A]" />;
      case "Active Courses":
        return <CheckCircle className="h-6 w-6 text-[#006241]" />;
      case "Inactive Courses":
        return <XCircle className="h-6 w-6 text-[#cba258]" />;
      default:
        return <BookOpen className="h-6 w-6 text-[#00754A]" />;
    }
  };

  const getBorderColor = () => {
    switch (title) {
      case "Total Courses":
        return "border-l-4 border-l-[#00754A]";
      case "Active Courses":
        return "border-l-4 border-l-[#006241]";
      case "Inactive Courses":
        return "border-l-4 border-l-[#cba258]";
      default:
        return "border-l-4 border-l-[#00754A]";
    }
  };

  return (
    <Card className={`p-6 bg-white ${getBorderColor()} sb-shadow-card hover:shadow-md transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          <h2 className="text-3xl font-extrabold text-[#1E3932] mt-2">{value}</h2>
        </div>
        <div className="h-12 w-12 rounded-full bg-[#edebe9] flex items-center justify-center">
          {getIcon()}
        </div>
      </div>
    </Card>
  );
}

export default CourseStatsCard;