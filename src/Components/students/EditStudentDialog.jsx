import { useState, useEffect } from "react";
import StudentForm from "./StudentForm";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../ui/sheet";
import { Button } from "../ui/button";
import { normalizeStatus } from "../../lib/utils";
import { UserCheck, Sparkles } from "lucide-react";

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
    if (studentData && open) {
      let fName = studentData.firstName || "";
      let lName = studentData.lastName || "";
      if (!fName && studentData.name) {
        const parts = studentData.name.split(" ");
        fName = parts[0] || "";
        lName = parts.slice(1).join(" ") || "";
      }

      const sId = studentData.id || studentData.studentId || "";
      // Only use REAL fee/admission data — no invented defaults
      const rawFee = studentData.totalFee ?? studentData.fees ?? studentData.admission?.totalFee ?? null;
      const feeVal = rawFee !== null ? Number(rawFee) : "";
      const pType = studentData.paymentType || studentData.admission?.paymentType || "Full";
      const eTenure = Number(studentData.emiTenure || studentData.admission?.emiTenure || 3);
      const normStatus = normalizeStatus(studentData.status);
      const pStatus = studentData.paymentStatus || studentData.admission?.paymentStatus || (pType === "EMI" ? "Partial" : (normStatus === "Active" && feeVal ? "Paid" : ""));
      const admId = studentData.admissionId || studentData.admission?.admissionId || studentData.admission?.id || "";
      const admDate = studentData.admissionDate || studentData.admission?.admissionDate || "";

      setStudent({
        ...studentData,
        id: sId,
        studentId: sId,
        admissionId: admId,
        admissionDate: admDate,
        firstName: fName,
        lastName: lName,
        email: studentData.email || studentData.studentEmail || "",
        phone: studentData.phone || studentData.phoneNumber || studentData.phoneNo || "",
        gender: studentData.gender || "Male",
        address: studentData.address || "",
        course: studentData.course || studentData.enrolledCourse || "",
        status: normStatus,
        fees: feeVal,
        totalFee: feeVal,
        paymentType: pType,
        paymentStatus: pStatus,
        emiTenure: eTenure,
        emiMonthlyAmount: pType === "EMI" && feeVal ? Math.round(Number(feeVal) / eTenure) : "",
      });
    }
  }, [studentData, open]);

  const handleUpdate = (e) => {
    e.preventDefault();

    const fName = student.firstName ? student.firstName.trim() : "";
    const lName = student.lastName ? student.lastName.trim() : "";

    if (!fName && !lName) {
      alert("Please enter student name.");
      return;
    }

    const finalFirstName = fName || "Student";
    const finalLastName = lName || "Partner";
    const sId = student.id || student.studentId || studentData?.id || studentData?.studentId || 1;
    const feeVal = student.totalFee != null && student.totalFee !== ""
      ? Number(student.totalFee)
      : student.fees != null && student.fees !== ""
      ? Number(student.fees)
      : null;
    const pType = student.paymentType || null;
    const eTenure = pType === "EMI" ? Number(student.emiTenure || 3) : null;
    const eMonthly = pType === "EMI" && feeVal && eTenure ? Number(student.emiMonthlyAmount || Math.round(feeVal / eTenure)) : null;
    const normStatus = normalizeStatus(student.status);
    const admId = student.admissionId || studentData?.admissionId || null;
    const admDate = student.admissionDate || studentData?.admissionDate || (normStatus === "Active" ? new Date().toISOString().split("T")[0] : null);
    const pStatus = student.paymentStatus || null;

    const payload = {
      ...studentData,
      ...student,
      id: sId,
      studentId: sId,
      admissionId: admId,
      admissionDate: admDate,
      firstName: finalFirstName,
      lastName: finalLastName,
      name: `${finalFirstName} ${finalLastName}`.trim(),
      email: student.email ? student.email.trim() : `${finalFirstName.toLowerCase()}@gmail.com`,
      phone: student.phone ? String(student.phone).trim() : "",
      address: student.address ? student.address.trim() : "",
      gender: student.gender || "Male",
      course: student.course || "",
      status: normStatus,
      fees: feeVal,
      totalFee: feeVal,
      paymentType: pType,
      paymentStatus: pStatus,
      emiTenure: eTenure,
      emiMonthlyAmount: eMonthly,
    };

    if (onStudentUpdated) {
      onStudentUpdated(payload);
    }
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="sm:max-w-xl" onClose={() => setOpen(false)}>
        <SheetHeader>
          <SheetTitle>
            <UserCheck className="h-5 w-5 text-[#cc785c]" />
            Edit Student Details
            <Sparkles className="h-3.5 w-3.5 text-[#cc785c] fill-current" />
          </SheetTitle>
          <SheetDescription>
            Update partner enrollment information for {student.firstName || student.name || "student partner"}.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleUpdate} className="flex flex-col flex-1 justify-between overflow-y-auto space-y-4">
          <div className="py-1">
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
              Update Student Record
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default EditStudentDialog;