import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { AlertTriangle } from "lucide-react";

function DeleteAdmissionDialog({
  open,
  setOpen,
  onDelete,
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent onClose={() => setOpen && setOpen(false)}>
        <DialogHeader>
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-red-600">Delete Admission Record</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete this admission record? This action will remove the admission and payment history permanently.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen && setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (onDelete) onDelete();
              if (setOpen) setOpen(false);
            }}
          >
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteAdmissionDialog;