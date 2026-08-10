import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X, Star } from "lucide-react";
import { cn } from "../../lib/utils";

const ToastContext = React.createContext({
  showToast: () => {},
});

export const useToast = () => React.useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col space-y-2.5 max-w-md w-full px-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-center justify-between rounded-full px-5 py-3.5 text-xs font-bold shadow-2xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in-0 bg-[#1E3932] text-white border-[#00754A]/40",
              toast.type === "success" && "border-[#00754A]",
              toast.type === "error" && "border-red-500/60",
              toast.type === "info" && "border-[#cba258]/60"
            )}
          >
            <div className="flex items-center gap-3">
              {toast.type === "success" && (
                <div className="h-6 w-6 rounded-full bg-[#00754A] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              )}
              {toast.type === "error" && (
                <div className="h-6 w-6 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-4 w-4 text-white" />
                </div>
              )}
              {toast.type === "info" && (
                <div className="h-6 w-6 rounded-full bg-[#cba258] flex items-center justify-center shrink-0">
                  <Star className="h-3.5 w-3.5 text-[#1E3932] fill-current" />
                </div>
              )}
              <span className="tracking-tight leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 rounded-full p-1 text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
