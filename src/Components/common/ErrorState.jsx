import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

export function ErrorState({ title = "Unable to load data", message = "Something went wrong while communicating with the CRM service.", onRetry }) {
  return (
    <div className="py-12 px-6 text-center flex flex-col items-center justify-center bg-[#fde8e8]/40 border border-[#fbd5d5] rounded-xl my-4">
      <div className="h-12 w-12 rounded-xl bg-[#fde8e8] text-[#c64545] flex items-center justify-center mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-serif-display font-bold text-[#141413] mb-1">
        {title}
      </h3>
      <p className="text-xs text-[#6c6a64] max-w-md mb-4">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="gap-1.5 border-[#e6dfd8] text-[#141413]">
          <RefreshCw className="h-3.5 w-3.5 text-[#cc785c]" />
          <span>Try Again</span>
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
