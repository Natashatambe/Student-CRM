import * as React from "react";
import { cn } from "../../lib/utils";

const Progress = React.forwardRef(({ className, value = 0, color = "bg-blue-600", ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100", className)}
    {...props}
  >
    <div
      className={cn("h-full w-full flex-1 transition-all duration-500 ease-out rounded-full", color)}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
));
Progress.displayName = "Progress";

export { Progress };
