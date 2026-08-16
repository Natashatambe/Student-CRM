import React from "react";
import { Badge } from "../ui/badge";
import { Sparkles, CheckCircle2, Clock, AlertCircle, CreditCard } from "lucide-react";

export function StatusBadge({ status, isEmi, emiPaidCount, emiTenure, onClick, className = "" }) {
  const norm = String(status || "Active").trim();
  const lower = norm.toLowerCase();

  let variant = "default";
  let icon = null;

  if (lower === "active" || lower === "paid" || lower === "completed" || lower === "approved") {
    variant = "success";
    icon = <CheckCircle2 className="h-3 w-3 shrink-0" />;
  } else if (lower === "partial" || lower === "pending" || lower === "enquiry" || lower === "due") {
    variant = "amber";
    icon = <Clock className="h-3 w-3 shrink-0" />;
  } else if (lower === "inactive" || lower === "rejected" || lower === "overdue" || lower === "unpaid") {
    variant = "destructive";
    icon = <AlertCircle className="h-3 w-3 shrink-0" />;
  } else if (lower === "emi") {
    variant = "purple";
    icon = <CreditCard className="h-3 w-3 shrink-0" />;
  }

  const isClickable = Boolean(onClick);

  return (
    <div className="inline-flex items-center gap-1.5">
      <Badge
        variant={variant}
        onClick={onClick}
        className={`${isClickable ? "cursor-pointer hover:opacity-85 transition-opacity" : ""} gap-1 ${className}`}
      >
        {icon}
        <span>{norm}</span>
      </Badge>

      {isEmi && (
        <span
          onClick={onClick}
          className={`text-[11px] font-mono font-bold ${isClickable ? "cursor-pointer hover:underline" : ""} ${
            Number(emiPaidCount) >= Number(emiTenure) || lower === "paid" ? "text-[#00754A]" : "text-[#006241]"
          }`}
        >
          💳 {Number(emiPaidCount) >= Number(emiTenure) || lower === "paid"
            ? `EMI (${emiTenure}/${emiTenure} Paid 🎉)`
            : `${emiTenure} Mo EMI (${emiPaidCount || 1}/${emiTenure || 3} Paid)`}
        </span>
      )}
    </div>
  );
}

export default StatusBadge;
