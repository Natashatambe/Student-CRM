import { useState, useEffect } from "react";
import StudentForm from "./StudentForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { normalizeStatus } from "../../lib/utils";

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
      const feeVal = Number(studentData.totalFee || studentData.fees || studentData.admission?.totalFee || 50000);
      const pType = studentData.paymentType || studentData.admission?.paymentType || "Full";
      const eTenure = Number(studentData.emiTenure || studentData.admission?.emiTenure || 3);
      const pStatus = studentData.paymentStatus || studentData.admission?.paymentStatus || (pType === "EMI" ? "Partial" : (normStatus === "Active" ? "Paid" : "Pending"));
      const normStatus = normalizeStatus(studentData.status);
      const admId = studentData.admissionId || studentData.admission?.admissionId || studentData.admission?.id || sId;
      const admDate = studentData.admissionDate || studentData.admission?.admissionDate || new Date().toISOString().split("T")[0];

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
        course: studentData.course || studentData.enrolledCourse || "Java Full Stack",
        status: normStatus,
        fees: feeVal,
        totalFee: feeVal,
        paymentType: pType,
        paymentStatus: pStatus,
        emiTenure: eTenure,
        emiMonthlyAmount: pType === "EMI" ? Math.round(feeVal / eTenure) : null,
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
    const feeVal = Number(student.totalFee || student.fees || 50000);
    const pType = student.paymentType || "Full";
    const eTenure = Number(student.emiTenure || 3);
    const eMonthly = pType === "EMI" ? Number(student.emiMonthlyAmount || Math.round(feeVal / eTenure)) : null;
    const normStatus = normalizeStatus(student.status);
    const admId = student.admissionId || studentData?.admissionId || sId;
    const admDate = student.admissionDate || studentData?.admissionDate || new Date().toISOString().split("T")[0];

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
      phone: student.phone ? String(student.phone).trim() : "9876543210",
      address: student.address ? student.address.trim() : "Main City",
      gender: student.gender || "Male",
      course: student.course || "Java Full Stack",
      status: normStatus,
      fees: feeVal,
      totalFee: feeVal,
      paymentType: pType,
      paymentStatus: student.paymentStatus || (pType === "EMI" ? "Partial" : (normStatus === "Active" ? "Paid" : "Pending")),
      emiTenure: pType === "EMI" ? eTenure : null,
      emiMonthlyAmount: eMonthly,
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
            <Button type="submit" variant="primary" className="bg-[#cc785c] hover:bg-[#a9583e] text-white shadow-md font-bold">
              Update Student Record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditStudentDialog;