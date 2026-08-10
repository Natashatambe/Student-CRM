import * as React from "react";
import { cn } from "../../lib/utils";
import { ChevronDown, Check } from "lucide-react";

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <select
        className={cn(
          "flex h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-9 text-sm text-slate-900 tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00754A] focus-visible:border-[#00754A] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 shadow-2xs focus:bg-[#d4e9e2]/20 cursor-pointer font-semibold",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3.5 top-3.5 h-4 w-4 text-[#00754A] pointer-events-none" />
    </div>
  );
});
Select.displayName = "Select";

// Custom Shadcn Dropdown Select Component
function ShadcnSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  name,
  className,
}) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-[#1E3932] shadow-2xs hover:bg-[#edebe9]/40 focus:outline-none focus:ring-2 focus:ring-[#00754A] cursor-pointer transition-all duration-150"
      >
        <span className={selectedOption ? "text-[#1E3932] font-extrabold" : "text-slate-400 font-semibold"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-[#00754A] transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-12 z-50 w-full min-w-[12rem] max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl animate-in fade-in-80 zoom-in-95 duration-150">
          {options.length === 0 ? (
            <div className="p-3 text-center text-xs font-bold text-slate-400">No options available</div>
          ) : (
            options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    if (onChange) {
                      onChange({ target: { name, value: opt.value } });
                    }
                    setOpen(false);
                  }}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-150 my-0.5",
                    isSelected
                      ? "bg-[#d4e9e2] text-[#006241]"
                      : "text-[#1E3932] hover:bg-[#f2f0eb] hover:text-[#00754A]"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-[#00754A] shrink-0 ml-2" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export { Select, ShadcnSelect };
