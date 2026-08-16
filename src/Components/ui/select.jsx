import * as React from "react";
import { cn } from "../../lib/utils";
import { ChevronDown, Check } from "lucide-react";

// Custom Shadcn Dropdown Select Component for all forms & modals
const Select = React.forwardRef(
  ({ className, children, value, onChange, name, placeholder = "Select an option", disabled, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef(null);

    // Extract options from JSX <option> children
    const options = React.useMemo(() => {
      const list = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === "option") {
          list.push({
            value: child.props.value !== undefined ? child.props.value : child.props.children,
            label: child.props.children,
            disabled: child.props.disabled,
          });
        }
      });
      return list;
    }, [children]);

    const selectedOption = options.find((opt) => String(opt.value) === String(value));

    React.useEffect(() => {
      const handleClickOutside = (e) => {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
          setOpen(false);
        }
      };
      const handleKeyDown = (e) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [open]);

    const handleSelectOption = (optValue) => {
      if (disabled) return;
      setOpen(false);
      if (onChange) {
        onChange({
          target: {
            name: name || props.id || "",
            value: optValue,
          },
        });
      }
    };

    const displayText = selectedOption
      ? selectedOption.label
      : (options.length > 0 && options[0].value === "" ? options[0].label : placeholder);

    return (
      <div ref={containerRef} className={cn("relative w-full", className)}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen(!open)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-xl border border-[#e6dfd8] bg-white px-3.5 py-2 text-xs font-semibold text-[#141413] shadow-2xs hover:bg-[#efe9de]/40 focus:outline-none focus:ring-2 focus:ring-[#cc785c] cursor-pointer transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
            open && "ring-2 ring-[#cc785c] border-[#cc785c] bg-[#efe9de]/20"
          )}
          {...props}
        >
          <span className={cn("truncate text-left flex-1 pr-2", selectedOption && selectedOption.value !== "" ? "text-[#141413] font-bold" : "text-[#8e8b82] font-semibold")}>
            {displayText}
          </span>
          <ChevronDown className={cn("h-4 w-4 text-[#cc785c] shrink-0 transition-transform duration-200", open && "rotate-180")} />
        </button>

        {open && (
          <div className="absolute left-0 top-11 z-[100] w-full min-w-[12rem] max-h-60 overflow-y-auto rounded-xl border border-[#e6dfd8] bg-[#faf9f5] p-1.5 shadow-2xl animate-in fade-in-80 zoom-in-95 duration-150">
            {options.length === 0 ? (
              <div className="p-3 text-center text-xs font-bold text-[#8e8b82]">No options available</div>
            ) : (
              options.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                const isPlaceholderItem = opt.value === "";

                return (
                  <div
                    key={String(opt.value) + idx}
                    onClick={() => !opt.disabled && handleSelectOption(opt.value)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150 my-0.5",
                      opt.disabled && "opacity-40 cursor-not-allowed",
                      isSelected && !isPlaceholderItem
                        ? "bg-[#efe9de] text-[#cc785c] font-bold shadow-2xs"
                        : "text-[#141413] hover:bg-[#efe9de]/60 hover:text-[#cc785c]",
                      isPlaceholderItem && "text-[#8e8b82] border-b border-[#e6dfd8]/60 mb-1 pb-2"
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && !isPlaceholderItem && <Check className="h-4 w-4 text-[#cc785c] shrink-0 ml-2" />}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

// Custom Shadcn Dropdown Select Component for array options
function ShadcnSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  name,
  className,
  disabled,
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
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-[#e6dfd8] bg-white px-3.5 py-2 text-xs font-semibold text-[#141413] shadow-2xs hover:bg-[#efe9de]/40 focus:outline-none focus:ring-2 focus:ring-[#cc785c] cursor-pointer transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
          open && "ring-2 ring-[#cc785c] border-[#cc785c] bg-[#efe9de]/20"
        )}
      >
        <span className={cn("truncate text-left flex-1 pr-2", selectedOption ? "text-[#141413] font-bold" : "text-[#8e8b82] font-semibold")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-[#cc785c] shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-11 z-[100] w-full min-w-[12rem] max-h-60 overflow-y-auto rounded-xl border border-[#e6dfd8] bg-[#faf9f5] p-1.5 shadow-2xl animate-in fade-in-80 zoom-in-95 duration-150">
          {options.length === 0 ? (
            <div className="p-3 text-center text-xs font-bold text-[#8e8b82]">No options available</div>
          ) : (
            options.map((opt, idx) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div
                  key={String(opt.value) + idx}
                  onClick={() => {
                    if (onChange) {
                      onChange({ target: { name, value: opt.value } });
                    }
                    setOpen(false);
                  }}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150 my-0.5",
                    isSelected
                      ? "bg-[#efe9de] text-[#cc785c] font-bold shadow-2xs"
                      : "text-[#141413] hover:bg-[#efe9de]/60 hover:text-[#cc785c]"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-[#cc785c] shrink-0 ml-2" />}
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
