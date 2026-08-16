import React from "react";
import { Card, CardContent } from "../ui/card";

export function StatCard({ title, value, subtitle, icon: Icon, badgeText, badgeColor = "coral", className = "" }) {
  return (
    <Card className={`relative overflow-hidden transition-all duration-200 hover:border-[#cc785c]/40 ${className}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#6c6a64] uppercase tracking-wider">
            {title}
          </span>
          {Icon && (
            <div className="h-9 w-9 rounded-xl bg-[#faf9f5] border border-[#e6dfd8] text-[#cc785c] flex items-center justify-center shadow-2xs">
              <Icon className="h-4.5 w-4.5" />
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <h3 className="text-2xl md:text-3xl font-serif-display font-normal text-[#141413] tracking-tight">
            {value}
          </h3>

          {badgeText && (
            <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#faf9f5] border border-[#e6dfd8] text-[#cc785c]">
              {badgeText}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-[11px] text-[#6c6a64] font-medium mt-1">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default StatCard;
