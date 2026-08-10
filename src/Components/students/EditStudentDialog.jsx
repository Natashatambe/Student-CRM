import { useState, useEffect } from "react";
import StudentForm from "./StudentForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";

function EditStudentDialog({
  open,
  setOpen,
  studentData,
  onStudentUpdated,
}) {
  const [student, setStudent] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "Male",
    address: "",
    course: "",
    status: "Active",
  });

  useEffect(() => {
    if (studentData) {
      let fName = studentData.firstName || "";
      let lName = studentData.lastName || "";
      if (!fName && studentData.name) {
        const parts = studentData.name.split(" ");
        fName = parts[0] || "";
        lName = parts.slice(1).join(" ") || "";
      }

      setStudent({
        ...studentData,
        firstName: fName,
        lastName: lName,
        gender: studentData.gender || "Male",
        address: studentData.address || "",
      });
    }
  }, [studentData]);

  const handleUpdate = (e) => {
    e.preventDefault();
    const payload = {
      ...student,
      name: `${student.firstName} ${student.lastName}`.trim(),
    };

    if (onStudentUpdated) {
      onStudentUpdated(payload);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>Edit Student Details</DialogTitle>
          <DialogDescription>
            Update partner enrollment information for {student.firstName || student.name || "student"}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="flex flex-col flex-1 overflow-hidden">
          <DialogBody>
            <StudentForm student={student} setStudent={setStudent} />
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="shadow-md">
              Update Student Record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditStudentDialog;