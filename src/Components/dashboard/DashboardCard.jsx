import { ArrowUpRight } from "lucide-react";
import { Card } from "../ui/card";

function DashboardCard({ title, value, icon: Icon, trend = "+12% this month", variant = "cream" }) {
  const getCardStyle = () => {
    switch (variant) {
      case "dark":
        return "bg-[#181715] text-[#faf9f5] border-[#252320] shadow-md";
      case "coral":
        return "bg-[#cc785c] text-white border-[#cc785c] shadow-md";
      case "soft":
        return "bg-[#f5f0e8] text-[#141413] border-[#e6dfd8] shadow-xs";
      case "cream":
      default:
        return "bg-[#efe9de] text-[#141413] border-[#e6dfd8] shadow-xs";
    }
  };

  return (
    <Card className={`overflow-hidden relative transition-all duration-300 hover:-translate-y-0.5 border ${getCardStyle()}`}>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">{title}</p>
          {Icon && (
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${variant === 'dark' ? 'bg-[#252320] text-[#cc785c]' : variant === 'coral' ? 'bg-white/20 text-white' : 'bg-[#faf9f5] text-[#cc785c] border border-[#e6dfd8]'}`}>
              <Icon className="h-4.5 w-4.5" />
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <h2 className="text-2xl xl:text-3xl font-serif-display font-normal tracking-tight truncate">{value}</h2>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] ${variant === 'coral' ? 'bg-white/20 text-white' : variant === 'dark' ? 'bg-[#252320] text-[#cc785c]' : 'bg-[#faf9f5] text-[#cc785c] border border-[#e6dfd8]'}`}>
            <ArrowUpRight className="h-3 w-3 mr-0.5 shrink-0" /> {trend}
          </span>
        </div>
      </div>
    </Card>
  );
}

export default DashboardCard;