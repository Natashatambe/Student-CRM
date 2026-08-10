import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium transition-all tracking-tight",
  {
    variants: {
      variant: {
        default: "bg-[#cc785c] text-white",
        coral: "bg-[#cc785c] text-white",
        primary: "bg-[#cc785c] text-white",
        secondary: "bg-[#efe9de] text-[#141413] border border-[#e6dfd8]",
        cream: "bg-[#efe9de] text-[#141413] border border-[#e6dfd8]",
        success: "bg-[#e2f3e8] text-[#2e6840] border border-[#b8e2c7]",
        greenLight: "bg-[#e2f3e8] text-[#2e6840] border border-[#b8e2c7]",
        amber: "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]",
        warning: "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]",
        destructive: "bg-[#fde8e8] text-[#9b1c1c] border border-[#fbd5d5]",
        dark: "bg-[#181715] text-[#faf9f5] border border-[#252320]",
        outline: "text-[#141413] border border-[#e6dfd8] bg-[#faf9f5]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
