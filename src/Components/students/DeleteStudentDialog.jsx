import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { AlertTriangle } from "lucide-react";

function DeleteStudentDialog({
  open,
  setOpen,
  student,
  onDelete,
}) {
  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent onClose={() => setOpen(false)} className="max-w-md">
        <DialogHeader className="bg-red-900 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-800 flex items-center justify-center text-white shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-extrabold text-white">Delete Student Record</DialogTitle>
              <DialogDescription className="text-xs text-red-100 font-semibold mt-0.5">
                Permanent deletion confirmation
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody>
          <p className="text-sm font-semibold text-slate-700 leading-relaxed">
            Are you sure you want to remove <strong className="text-[#1E3932] font-extrabold">{student.name}</strong> (ID #{student.id}) from the database? This action cannot be undone.
          </p>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-red-700 hover:bg-red-800 text-white shadow-md"
            onClick={() => {
              if (onDelete) onDelete(student.id);
              setOpen(false);
            }}
          >
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteStudentDialog;