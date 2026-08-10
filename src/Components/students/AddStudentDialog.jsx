import { useState } from "react";
import StudentForm from "./StudentForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";

function AddStudentDialog({ open, setOpen, onStudentAdded }) {
  const [student, setStudent] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "Male",
    address: "",
    course: "",
    status: "Active",
  });

  const handleSave = (e) => {
    e.preventDefault();

    if (!student.firstName || !student.lastName || !student.address || !student.gender) {
      alert("Please fill required fields: First Name, Last Name, Address, and Gender");
      return;
    }

    // Spring Boot Validation Rules (@Pattern 10 digits for phone, @Size >= 5 for address)
    const cleanPhone = String(student.phone).replace(/[^0-9]/g, "").padEnd(10, "0").slice(0, 10);
    const cleanAddress = student.address.trim().length >= 5 ? student.address.trim() : `${student.address.trim()} Street`;

    const payload = {
      firstName: student.firstName,
      lastName: student.lastName,
      name: `${student.firstName} ${student.lastName}`.trim(),
      email: student.email || `${student.firstName.toLowerCase()}@gmail.com`,
      phone: cleanPhone,
      address: cleanAddress,
      gender: student.gender || "Male",
      course: student.course || "General Track",
      status: student.status || "Active",
    };

    if (onStudentAdded) {
      onStudentAdded(payload);
    }

    setStudent({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "Male",
      address: "",
      course: "",
      status: "Active",
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>Enroll New Student</DialogTitle>
          <DialogDescription>
            Register a new student partner with complete personal and course details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
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
              Save Student Record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddStudentDialog;