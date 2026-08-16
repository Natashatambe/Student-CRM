import React from "react";
import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Loading CRM data...", rows = 4 }) {
  return (
    <div className="py-12 px-6 flex flex-col items-center justify-center space-y-4">
      <div className="flex items-center gap-3 text-[#cc785c] font-medium text-sm">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>{message}</span>
      </div>

      <div className="w-full space-y-3 max-w-4xl mx-auto pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 bg-[#efe9de]/60 rounded-xl animate-pulse w-full border border-[#e6dfd8]/50" />
        ))}
      </div>
    </div>
  );
}

export default LoadingState;
