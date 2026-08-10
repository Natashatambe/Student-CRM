import { Users, UserCheck, Clock3 } from "lucide-react";
import { Card } from "../ui/card";

function StudentStatsCard({ title, value }) {
  const getIcon = () => {
    switch (title) {
      case "Total Students":
        return <Users className="h-6 w-6 text-[#00754A]" />;
      case "Active Students":
        return <UserCheck className="h-6 w-6 text-[#006241]" />;
      case "Pending Students":
        return <Clock3 className="h-6 w-6 text-[#cba258]" />;
      default:
        return <Users className="h-6 w-6 text-[#00754A]" />;
    }
  };

  const getBorderColor = () => {
    switch (title) {
      case "Total Students":
        return "border-l-4 border-l-[#00754A]";
      case "Active Students":
        return "border-l-4 border-l-[#006241]";
      case "Pending Students":
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

export default StudentStatsCard;