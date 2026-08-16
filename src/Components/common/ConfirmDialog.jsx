import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { AlertTriangle } from "lucide-react";

export function ConfirmDialog({ open, onOpenChange, title = "Confirm Action", description = "Are you sure you want to proceed? This action cannot be undone.", confirmLabel = "Delete Record", onConfirm, loading = false }) {
  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={handleClose} className="max-w-md">
        <DialogHeader className="bg-[#181715] text-[#faf9f5] border-b border-[#252320] p-4 pr-12 rounded-t-xl">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#c64545] text-white flex items-center justify-center font-bold">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-serif-display font-bold text-[#faf9f5]">
                {title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="p-5">
          <DialogDescription className="text-xs text-[#6c6a64] leading-relaxed">
            {description}
          </DialogDescription>
        </DialogBody>

        <DialogFooter className="bg-[#faf9f5] border-t border-[#e6dfd8] p-4 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="text-xs">
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={() => {
              if (onConfirm) onConfirm();
            }}
            className="text-xs font-bold"
          >
            {loading ? "Processing..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDialog;
