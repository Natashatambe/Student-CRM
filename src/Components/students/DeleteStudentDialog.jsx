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
      <DialogContent onClose={() => setOpen(false)} className="max-w-md bg-[#faf9f5] border-[#e6dfd8] p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="bg-[#efe9de] border-b border-[#e6dfd8] p-5 pr-12">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-100 border border-red-200 text-red-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-serif-display font-normal text-[#141413] tracking-tight">
                Delete Student Record
              </DialogTitle>
              <DialogDescription className="text-xs text-[#6c6a64] font-medium mt-0.5">
                Permanent deletion confirmation
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="p-5">
          <p className="text-xs md:text-sm text-[#141413] leading-relaxed font-medium">
            Are you sure you want to remove <strong className="text-[#cc785c] font-bold">{student.name}</strong> (ID #{student.id}) from the database? This action cannot be undone.
          </p>
        </DialogBody>

        <DialogFooter className="bg-[#faf9f5] border-t border-[#e6dfd8] p-4 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="text-xs border-[#e6dfd8] bg-[#faf9f5]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#c64545] hover:bg-[#a53434] text-white text-xs font-bold shadow-xs"
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