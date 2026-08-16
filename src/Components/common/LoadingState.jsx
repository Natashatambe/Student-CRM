import React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Premium Warm Editorial Spinner Component
 */
export function ThemeSpinner({ size = "md", className }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-9 w-9",
    xl: "h-12 w-12",
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center shrink-0", sizeClasses[size], className)}>
      {/* Outer rotating ring */}
      <div className="absolute inset-0 rounded-full border-2 border-[#cc785c]/20 border-t-[#cc785c] animate-spin" />
      {/* Inner subtle counter-ring */}
      <div className="absolute inset-1 rounded-full border border-[#a9583e]/10 border-b-[#a9583e]/60 animate-spin [animation-duration:1.5s] [animation-direction:reverse]" />
    </div>
  );
}

/**
 * Table Skeleton Rows for DataGrid loading state
 */
export function TableSkeletonRows({ count = 5, columns = 6 }) {
  return (
    <div className="w-full divide-y divide-[#e6dfd8] bg-white">
      {Array.from({ length: count }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4 px-4 py-3.5 animate-pulse">
          {/* STU ID skeleton */}
          <div className="h-4 w-16 bg-[#efe9de] rounded-md shrink-0" />
          {/* Avatar + Contact skeleton */}
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className="h-9 w-9 bg-[#efe9de] rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-32 bg-[#efe9de] rounded-md" />
              <div className="h-3 w-44 bg-[#faf9f5] rounded-md" />
            </div>
          </div>
          {/* Course track skeleton */}
          <div className="h-6 w-28 bg-[#efe9de] rounded-md shrink-0 hidden sm:block" />
          {/* Fee & Date skeleton */}
          <div className="h-7 w-24 bg-[#efe9de] rounded-md shrink-0 hidden md:block" />
          {/* Status pill skeleton */}
          <div className="h-6 w-20 bg-[#efe9de] rounded-full shrink-0" />
          {/* Actions skeleton */}
          <div className="h-7 w-12 bg-[#efe9de] rounded-md shrink-0 ml-auto" />
        </div>
      ))}
    </div>
  );
}

/**
 * Full Component / Page Loading State
 */
export function LoadingState({ message = "Loading records...", rows = 5, compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center justify-center gap-2.5 py-8 text-[#cc785c]">
        <ThemeSpinner size="md" />
        <span className="text-xs font-semibold text-[#6c6a64] tracking-tight">{message}</span>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-[#e6dfd8] bg-[#faf9f5] overflow-hidden shadow-xs">
      {/* Header Banner */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e6dfd8] bg-[#efe9de]/50">
        <div className="flex items-center gap-2.5">
          <ThemeSpinner size="sm" />
          <span className="text-xs font-bold text-[#141413] tracking-wide uppercase">{message}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#cc785c] bg-[#faf9f5] px-2.5 py-0.5 rounded-full border border-[#e6dfd8]">
          <Sparkles className="h-3 w-3 text-[#cc785c] animate-pulse" />
          <span>Fetching Live Desk Data</span>
        </div>
      </div>

      {/* Skeleton Rows */}
      <TableSkeletonRows count={rows} />
    </div>
  );
}

export default LoadingState;
