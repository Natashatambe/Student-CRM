import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "../ui/button";

export function EmptyState({ icon: Icon = FolderOpen, title = "No records found", description = "There are no entries matching your query or current filters.", actionLabel, onAction }) {
  return (
    <div className="py-14 px-6 text-center flex flex-col items-center justify-center bg-[#faf9f5]/50 border border-dashed border-[#e6dfd8] rounded-xl my-4">
      <div className="h-12 w-12 rounded-xl bg-[#efe9de] text-[#cc785c] flex items-center justify-center mb-3.5 shadow-2xs">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-serif-display font-bold text-[#141413] mb-1">
        {title}
      </h3>
      <p className="text-xs text-[#6c6a64] max-w-sm mb-4">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="sm" className="shadow-xs">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
