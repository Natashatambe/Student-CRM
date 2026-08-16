import { useState } from "react";
import StudentForm from "./StudentForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { normalizeStatus } from "../../lib/utils";

function AddStudentDialog({ open, setOpen, onStudentAdded }) {
  const [student, setStudent] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "Male",
    address: "",
    course: "Java Full Stack",
    fees: 50000,
    totalFee: 50000,
    status: "Active",
    paymentType: "Full",
    paymentStatus: "Paid",
  });

  const handleSave = (e) => {
    e.preventDefault();

    const fName = student.firstName ? student.firstName.trim() : "";
    const lName = student.lastName ? student.lastName.trim() : "";

    if (!fName && !lName) {
      alert("Please enter student name.");
      return;
    }

    const finalFirstName = fName || "New";
    const finalLastName = lName || "Student";
    const fullName = `${finalFirstName} ${finalLastName}`.trim();

    const cleanPhone = student.phone ? String(student.phone).replace(/[^0-9]/g, "").padEnd(10, "0").slice(0, 10) : "9876543210";
    const cleanAddress = student.address && student.address.trim().length > 0 ? student.address.trim() : "Main City Location";

    const payload = {
      firstName: finalFirstName,
      lastName: finalLastName,
      name: fullName,
      email: student.email ? student.email.trim() : `${finalFirstName.toLowerCase()}@gmail.com`,
      phone: cleanPhone,
      address: cleanAddress,
      gender: student.gender || "Male",
      course: student.course || "Java Full Stack",
      totalFee: Number(student.totalFee || student.fees || 50000),
      fees: Number(student.fees || student.totalFee || 50000),
      paymentType: student.paymentType || "Full",
      paymentStatus: student.paymentStatus || (student.paymentType === "EMI" ? "Partial" : "Paid"),
      emiTenure: student.paymentType === "EMI" ? Number(student.emiTenure || 3) : null,
      emiMonthlyAmount: student.paymentType === "EMI" ? Number(student.emiMonthlyAmount || Math.round((student.totalFee || 50000) / (student.emiTenure || 3))) : null,
      status: normalizeStatus(student.status || "Active"),
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
      course: "Java Full Stack",
      fees: 50000,
      totalFee: 50000,
      status: "Active",
      paymentType: "Full",
      paymentStatus: "Paid",
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>Enroll New Student Partner</DialogTitle>
          <DialogDescription>
            Register a new student partner record. All missing fields will auto-fill cleanly.
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
            <Button type="submit" variant="primary" className="bg-[#cc785c] hover:bg-[#a9583e] text-white shadow-md font-bold">
              Enroll Student Partner
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddStudentDialog;