import React from "react";
import { Users, UserCheck, Clock3, UserX, ChevronRight } from "lucide-react";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";

function StudentStatsCard({ title, value, active = false, onClick }) {
  const getIcon = () => {
    switch (title) {
      case "Total Students":
        return <Users className="h-5 w-5 text-[#cc785c]" />;
      case "Active Students":
        return <UserCheck className="h-5 w-5 text-[#00754A]" />;
      case "Pending Students":
        return <Clock3 className="h-5 w-5 text-[#d97706]" />;
      case "Inactive Students":
        return <UserX className="h-5 w-5 text-[#dc2626]" />;
      default:
        return <Users className="h-5 w-5 text-[#cc785c]" />;
    }
  };

  const getBadgeStyle = () => {
    switch (title) {
      case "Active Students":
        return "bg-[#d4e9e2] text-[#006241] border-[#a3d9c9]";
      case "Pending Students":
        return "bg-[#fef3c7] text-[#92400e] border-[#fde68a]";
      case "Inactive Students":
        return "bg-[#fee2e2] text-[#991b1b] border-[#fca5a5]";
      default:
        return "bg-[#efe9de] text-[#141413] border-[#e6dfd8]";
    }
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-5 bg-[#faf9f5] border transition-all duration-200 cursor-pointer select-none rounded-xl hover:shadow-md hover:-translate-y-0.5",
        active
          ? "border-[#cc785c] ring-2 ring-[#cc785c]/30 bg-[#efe9de]/40 shadow-xs"
          : "border-[#e6dfd8] hover:border-[#cc785c]/50"
      )}
      title={`Filter by ${title}`}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-[#6c6a64] uppercase tracking-wider block">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-serif-display font-bold text-[#141413]">
              {value}
            </h2>
            {active && (
              <span className="text-[10px] font-semibold text-[#cc785c] bg-[#efe9de] px-1.5 py-0.5 rounded border border-[#e6dfd8]">
                Filtered
              </span>
            )}
          </div>
        </div>
        <div
          className={cn(
            "h-11 w-11 rounded-xl flex items-center justify-center border shadow-xs transition-transform duration-200 group-hover:scale-105",
            getBadgeStyle()
          )}
        >
          {getIcon()}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#e6dfd8]/60 flex items-center justify-between text-[11px] text-[#8e8b82]">
        <span>Click to filter directory</span>
        <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", active ? "text-[#cc785c] translate-x-0.5" : "text-[#8e8b82]")} />
      </div>
    </Card>
  );
}

export default StudentStatsCard;