import { useState } from "react";
import StudentForm from "./StudentForm";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../ui/sheet";
import { Button } from "../ui/button";
import { normalizeStatus } from "../../lib/utils";
import { GraduationCap, Sparkles } from "lucide-react";

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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="sm:max-w-xl" onClose={() => setOpen(false)}>
        <SheetHeader>
          <SheetTitle>
            <GraduationCap className="h-6 w-6 text-[#cc785c]" />
            Enroll New Student Partner
            <Sparkles className="h-4 w-4 text-[#cc785c] fill-current" />
          </SheetTitle>
          <SheetDescription>
            Register a new student partner record. All missing fields will auto-fill cleanly.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSave} className="flex flex-col flex-1 justify-between overflow-y-auto space-y-4">
          <div className="py-2">
            <StudentForm student={student} setStudent={setStudent} />
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-[#e6dfd8] bg-[#faf9f5]"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-[#cc785c] hover:bg-[#a9583e] text-white shadow-md font-bold">
              Enroll Student Partner
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default AddStudentDialog;