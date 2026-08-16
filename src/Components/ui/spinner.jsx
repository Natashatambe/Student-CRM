import React from "react";
import { cn } from "@/lib/utils";

function Spinner({ className, size = "md", ...props }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("relative inline-flex items-center justify-center shrink-0 h-5 w-5", className)}
      {...props}
    >
      <div className="absolute inset-0 rounded-full border-2 border-[#cc785c]/25 border-t-[#cc785c] animate-spin" />
      <div className="absolute inset-0.5 rounded-full border border-[#a9583e]/15 border-b-[#a9583e]/70 animate-spin [animation-duration:1.2s] [animation-direction:reverse]" />
    </div>
  );
}

export { Spinner };
