import * as React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-[#e6dfd8] bg-[#faf9f5] px-3.5 py-2 text-sm text-[#141413] tracking-tight placeholder:text-[#8e8b82] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cc785c]/30 focus-visible:border-[#cc785c] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 shadow-2xs",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
