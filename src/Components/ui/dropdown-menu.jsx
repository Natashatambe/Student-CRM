import * as React from "react";
import { cn } from "../../lib/utils";

const DropdownMenu = ({ children, open: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (val) => {
    if (isControlled && onOpenChange) {
      onOpenChange(val);
    } else {
      setInternalOpen(val);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isControlled, onOpenChange]);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {React.Children.map(children, (child) => {
        if (!child) return null;
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, {
            onClick: (e) => {
              e.stopPropagation();
              setOpen(!open);
            },
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
  <div ref={ref} onClick={onClick} className={cn("cursor-pointer select-none", className)} {...props}>
    {children}
  </div>
));
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = React.forwardRef(
  ({ className, children, onClose, align = "right", side = "auto", ...props }, ref) => {
    const contentRef = React.useRef(null);
    const [computedSide, setComputedSide] = React.useState(side === "auto" ? "bottom" : side);

    React.useLayoutEffect(() => {
      if (side === "auto" && contentRef.current) {
        const rect = contentRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        if (spaceBelow < 60 && rect.top > 180) {
          setComputedSide("top");
        } else {
          setComputedSide("bottom");
        }
      }
    }, [side]);

    return (
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          "absolute z-[90] min-w-[10rem] rounded-xl border border-[#e6dfd8] bg-[#faf9f5] p-1.5 shadow-2xl animate-in fade-in-80 duration-150",
          computedSide === "top" ? "bottom-full mb-1.5 animate-in slide-in-from-bottom-2" : "top-full mt-1.5 animate-in slide-in-from-top-2",
          align === "right" ? "right-0" : "left-0",
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (!child) return null;
          if (child.type === DropdownMenuItem) {
            return React.cloneElement(child, {
              onClose: child.props.onClose || onClose,
            });
          }
          return child;
        })}
      </div>
    );
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef(({ className, children, onClick, onClose, destructive, ...props }, ref) => (
  <div
    ref={ref}
    onClick={(e) => {
      e.stopPropagation();
      if (onClick) onClick(e);
      if (onClose) onClose();
    }}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-xs font-semibold outline-none transition-colors duration-150 my-0.5",
      destructive
        ? "text-[#c64545] hover:bg-[#fde8e8]/60 hover:text-[#c64545] focus:bg-[#fde8e8]/60"
        : "text-[#141413] hover:bg-[#efe9de] hover:text-[#cc785c] focus:bg-[#efe9de]",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };
