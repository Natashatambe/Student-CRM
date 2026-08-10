import * as React from "react";
import { cn } from "../../lib/utils";

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {React.Children.map(children, (child) => {
        if (!child) return null;
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, {
            onClick: () => setOpen(!open),
          });
        }
        if (child.type === DropdownMenuContent) {
          return open ? React.cloneElement(child, { onClose: () => setOpen(false) }) : null;
        }
        return child;
      })}
    </div>
  );
};

const DropdownMenuTrigger = React.forwardRef(({ className, children, onClick, ...props }, ref) => (
  <div ref={ref} onClick={onClick} className={cn("cursor-pointer", className)} {...props}>
    {children}
  </div>
));
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = React.forwardRef(({ className, children, onClose, align = "right", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute z-50 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-900/10 animate-in fade-in-80 zoom-in-95 duration-150",
      align === "right" ? "right-0" : "left-0",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef(({ className, children, onClick, destructive, ...props }, ref) => (
  <div
    ref={ref}
    onClick={onClick}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors duration-150",
      destructive
        ? "text-red-600 hover:bg-red-50 focus:bg-red-50"
        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };
