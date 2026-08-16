import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium tracking-tight transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cc785c]/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-[#cc785c] text-white hover:bg-[#a9583e] border border-[#cc785c] shadow-2xs",
        primary: "bg-[#cc785c] text-white hover:bg-[#a9583e] border border-[#cc785c] shadow-2xs",
        secondary: "bg-[#faf9f5] text-[#141413] hover:bg-[#efe9de] border border-[#e6dfd8]",
        outline: "border border-[#e6dfd8] bg-[#faf9f5] text-[#141413] hover:bg-[#efe9de]",
        dark: "bg-[#252320] text-[#faf9f5] hover:bg-[#322f2b] border border-[#252320]",
        black: "bg-[#181715] text-[#faf9f5] hover:bg-[#252320] border border-[#181715]",
        ghost: "hover:bg-[#efe9de] text-[#141413]",
        link: "text-[#cc785c] underline-offset-4 hover:underline",
        coralInverted: "bg-[#faf9f5] text-[#cc785c] hover:bg-white border border-[#faf9f5] font-semibold",
        pillPrimary: "bg-[#cc785c] text-white hover:bg-[#a9583e] rounded-full shadow-2xs",
        stripe: "bg-[#635bff] text-white hover:bg-[#544dc9] border border-[#635bff] shadow-2xs font-bold",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-7 px-2.5 text-xs rounded-md",
        sm: "h-8 px-3 text-xs rounded-md",
        lg: "h-11 px-6 text-base font-medium rounded-md",
        icon: "h-10 w-10 p-0 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
