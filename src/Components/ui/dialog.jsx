import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

const DialogContext = React.createContext({
  open: false,
  onClose: () => {},
});

const Dialog = ({ open, onOpenChange, children }) => {
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        if (onOpenChange) onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
  };

  return (
    <DialogContext.Provider value={{ open, onClose: handleClose }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Overlay backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
          onClick={handleClose}
        />

        {/* Modal Window Container */}
        <div className="relative z-50 w-full max-w-lg my-auto animate-in zoom-in-95 duration-200 focus:outline-none">
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );
};

const DialogContent = React.forwardRef(({ className, children, onClose, ...props }, ref) => {
  const context = React.useContext(DialogContext);
  const handleClose = onClose || context.onClose;

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full rounded-xl border border-[#e6dfd8] bg-[#faf9f5] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-[#141413]",
        className
      )}
      {...props}
    >
      {/* Top Close Button */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute right-4 top-4 z-20 rounded-md p-1.5 text-[#a09d96] hover:text-white bg-[#252320] hover:bg-[#322f2b] transition cursor-pointer active:scale-95"
        title="Close dialog"
      >
        <X className="h-4.5 w-4.5" />
        <span className="sr-only">Close</span>
      </button>
      {children}
    </div>
  );
});
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, children, ...props }) => (
  <div
    className={cn(
      "bg-[#181715] text-[#faf9f5] border-b border-[#252320] p-6 relative flex flex-col space-y-1 shrink-0",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-2xl font-normal text-[#faf9f5] font-serif-display tracking-tight leading-snug pr-8 flex items-center gap-2", className)}
  >
    <span className="text-[#cc785c] font-bold text-xl">✱</span>
    {props.children}
  </h2>
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-[#a09d96] font-medium mt-0.5", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

const DialogBody = ({ className, ...props }) => (
  <div className={cn("p-6 overflow-y-auto space-y-4 flex-1 bg-[#faf9f5]", className)} {...props} />
);

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 p-4 px-6 border-t border-[#e6dfd8] bg-[#efe9de] shrink-0",
      className
    )}
    {...props}
  />
);

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter };
