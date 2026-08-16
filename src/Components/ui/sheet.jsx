import * as React from "react";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

const Sheet = ({ children, open: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (val) => {
    if (isControlled && onOpenChange) {
      onOpenChange(val);
    } else {
      setInternalOpen(val);
    }
  };

  return (
    <>
      {React.Children.map(children, (child) => {
        if (!child) return null;
        if (child.type === SheetTrigger) {
          return React.cloneElement(child, {
            onClick: () => setOpen(!open),
          });
        }
        if (child.type === SheetContent) {
          return open ? React.cloneElement(child, { open, onClose: () => setOpen(false) }) : null;
        }
        return child;
      })}
    </>
  );
};

const SheetTrigger = React.forwardRef(({ className, children, onClick, ...props }, ref) => (
  <div ref={ref} onClick={onClick} className={cn("cursor-pointer inline-block", className)} {...props}>
    {children}
  </div>
));
SheetTrigger.displayName = "SheetTrigger";

const SheetClose = React.forwardRef(({ className, children, onClick, ...props }, ref) => (
  <button ref={ref} type="button" onClick={onClick} className={cn("cursor-pointer", className)} {...props}>
    {children}
  </button>
));
SheetClose.displayName = "SheetClose";

const SheetContent = React.forwardRef(
  (
    {
      className,
      children,
      onClose,
      side = "right",
      showCloseButton = true,
      ...props
    },
    ref
  ) => {
    React.useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === "Escape" && onClose) {
          onClose();
        }
      };
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [onClose]);

    const sideStyles = {
      top: "inset-x-0 top-0 border-b animate-in slide-in-from-top duration-300",
      bottom: "inset-x-0 bottom-0 border-t animate-in slide-in-from-bottom duration-300",
      left: "inset-y-0 left-0 h-full w-full sm:max-w-md border-r animate-in slide-in-from-left duration-300",
      right: "inset-y-0 right-0 h-full w-full sm:max-w-md border-l animate-in slide-in-from-right duration-300",
    };

    return (
      <div className="fixed inset-0 z-[100] flex">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in-80 duration-200"
        />

        {/* Sheet Slide-Over Drawer */}
        <div
          ref={ref}
          className={cn(
            "fixed z-[101] flex flex-col bg-[#faf9f5] p-6 shadow-2xl border-[#e6dfd8] text-[#141413] font-sans-body justify-between max-h-screen",
            sideStyles[side],
            className
          )}
          {...props}
        >
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-[#8e8b82] hover:bg-[#efe9de] hover:text-[#141413] transition cursor-pointer"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          )}

          {children}
        </div>
      </div>
    );
  }
);
SheetContent.displayName = "SheetContent";

const SheetHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1 text-left border-b border-[#e6dfd8] pb-3 mb-4 shrink-0", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-xl font-serif-display font-normal text-[#141413] tracking-tight flex items-center gap-2", className)} {...props} />
));
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-xs font-medium text-[#6c6a64]", className)} {...props} />
));
SheetDescription.displayName = "SheetDescription";

const SheetFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 border-t border-[#e6dfd8] pt-3 mt-4 shrink-0", className)} {...props} />
);
SheetFooter.displayName = "SheetFooter";

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
};
