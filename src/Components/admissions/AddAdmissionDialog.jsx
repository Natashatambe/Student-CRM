import { useEffect, useState } from "react";
import { getStudents } from "../../services/studentService";
import { getCourses } from "../../services/courseService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, ShadcnSelect } from "../ui/select";
import Calendar from "../ui/calendar";
import { User, BookOpen, Calendar as CalendarIcon, DollarSign, CheckCircle } from "lucide-react";

function AddAdmissionDialog({ open = true, setOpen, onClose, onSuccess, onAdmissionAdded }) {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [showCalendar, setShowCalendar] = useState(false);

  const [formData, setFormData] = useState({
    studentId: "",
    courseId: "",
    admissionDate: new Date().toISOString().split("T")[0],
    totalFee: "",
    paymentStatus: "Pending",
    paymentType: "Full",
    emiTenure: 3,
  });

  useEffect(() => {
    if (open) {
      loadStudents();
      loadCourses();
    }
  }, [open]);

  const loadStudents = async () => {
    try {
      const response = await getStudents();
      if (response && response.data) {
        let list = [];
        if (Array.isArray(response.data)) list = response.data;
        else if (Array.isArray(response.data.data)) list = response.data.data;
        if (list.length > 0) {
          const mapped = list.map((s) => ({
            id: s.id || s.studentId,
            firstName: s.firstName || (s.name ? s.name.split(" ")[0] : "Student"),
            lastName: s.lastName || (s.name ? s.name.split(" ").slice(1).join(" ") : ""),
            name: s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim(),
            email: s.email || "student@gmail.com",
          }));
          setStudents(mapped);
        }
      }
    } catch (error) {
      console.log("Using preview students list");
    }
  };

  const loadCourses = async () => {
    try {
      const response = await getCourses();
      if (response && response.data) {
        let list = [];
        if (Array.isArray(response.data)) list = response.data;
        else if (Array.isArray(response.data.data)) list = response.data.data;
        if (list.length > 0) {
          const mapped = list.map((c) => ({
            id: c.id || c.courseId,
            name: c.name || c.courseName || "Course Track",
            fees: Number(c.fees ?? c.fee ?? 0),
          }));
          setCourses(mapped);
          return;
        }
      }
    } catch (error) {
      console.log("Using preview courses list:", error);
    }

    setCourses([
      { id: 4, name: "Java Full Stack", fees: 45000 },
      { id: 9, name: "Python Masterclass", fees: 45000 },
      { id: 10, name: "Node.js & Express Masterclass", fees: 42000 },
      { id: 11, name: "Data ANALYST", fees: 35000 },
      { id: 2, name: "MERN STACK", fees: 40000 },
    ]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      if (name === "courseId" && value) {
        const selectedCourse = courses.find((c) => String(c.id) === String(value));
        if (selectedCourse && selectedCourse.fees) {
          updated.totalFee = Number(selectedCourse.fees);
        }
      }
      return updated;
    });
  };

  const handleClose = () => {
    if (setOpen) setOpen(false);
    if (onClose) onClose();
  };

  const totalFeeNum = Number(formData.totalFee || 0);
  const isEMI = formData.paymentType === "EMI";
  const emiTenureNum = Number(formData.emiTenure || 3);
  const monthlyEmi = isEMI && totalFeeNum > 0 ? Math.round(totalFeeNum / emiTenureNum) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.studentId || !formData.courseId || !formData.totalFee) {
      alert("Please select student partner, course track, and enter fee amount");
      return;
    }

    const sId = Number(formData.studentId);
    const cId = Number(formData.courseId);
    const selectedStudent = students.find((s) => Number(s.id) === sId);
    const selectedCourse = courses.find((c) => Number(c.id) === cId);

    const recordData = {
      studentId: sId,
      courseId: cId,
      admissionDate: formData.admissionDate,
      totalFee: totalFeeNum,
      paymentStatus: isEMI ? "Partial" : formData.paymentStatus,
      paymentType: formData.paymentType,
      emiTenure: isEMI ? emiTenureNum : null,
      emiMonthlyAmount: isEMI ? monthlyEmi : null,
      studentName: selectedStudent ? (selectedStudent.name || `${selectedStudent.firstName} ${selectedStudent.lastName}`.trim()) : "Student Partner",
      courseName: selectedCourse ? selectedCourse.name : "Course Track",
      student: selectedStudent,
      course: selectedCourse,
    };

    if (onAdmissionAdded) await onAdmissionAdded(recordData);
    if (onSuccess) await onSuccess(recordData);

    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent onClose={handleClose}>
        <DialogHeader>
          <DialogTitle>Create Admission Entry</DialogTitle>
          <DialogDescription>
            Official enrollment registration for partner academy courses.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogBody className="space-y-4 overflow-y-auto max-h-[60vh] pr-3">
            {/* Select Student Partner */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E3932] flex items-center gap-1.5 uppercase tracking-wider">
                <User className="h-3.5 w-3.5 text-[#00754A]" /> Select Student Partner *
              </label>
              <Select
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
              >
                <option value="">-- Choose Student Partner --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim()} (STU-{s.id})
                  </option>
                ))}
              </Select>
            </div>

            {/* Select Course Track */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E3932] flex items-center gap-1.5 uppercase tracking-wider">
                <BookOpen className="h-3.5 w-3.5 text-[#00754A]" /> Select Course Track *
              </label>
              <Select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                required
              >
                <option value="">-- Choose Available Course Offering --</option>
                {courses.map((c) => {
                  const feeNum = Number(c.fees || c.fee || 0);
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name || c.courseName} (CRS-{c.id}) {feeNum > 0 ? `- ₹${feeNum.toLocaleString()}` : ""}
                    </option>
                  );
                })}
              </Select>
            </div>

            {/* Admission Date Selector */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-[#1E3932] flex items-center gap-1.5 uppercase tracking-wider">
                <CalendarIcon className="h-3.5 w-3.5 text-[#00754A]" /> Admission Date
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="px-3 shrink-0"
                  title="Open Calendar DatePicker"
                >
                  <CalendarIcon className="h-4 w-4 text-[#00754A]" />
                </Button>
              </div>

              {showCalendar && (
                <div className="absolute top-16 right-0 z-50 animate-in fade-in-50 zoom-in-95 shadow-2xl">
                  <Calendar
                    selectedDate={formData.admissionDate}
                    onSelectDate={(dateStr) => {
                      setFormData({ ...formData, admissionDate: dateStr });
                      setShowCalendar(false);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Total Fee */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E3932] flex items-center gap-1.5 uppercase tracking-wider">
                <DollarSign className="h-3.5 w-3.5 text-[#00754A]" /> Total Fee (INR)
              </label>
              <Input
                type="number"
                name="totalFee"
                placeholder="e.g. 50000"
                value={formData.totalFee}
                onChange={handleChange}
              />
            </div>

            {/* Payment Type: Full vs EMI */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E3932] flex items-center gap-1.5 uppercase tracking-wider">
                Payment Fee Structure
              </label>
              <Select
                name="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
              >
                <option value="Full">Full One-Time Payment</option>
                <option value="EMI">EMI Monthly Installment Plan</option>
              </Select>
            </div>

            {/* EMI Options if EMI selected */}
            {isEMI && (
              <div className="bg-[#faf6ee] border border-[#cba258] rounded-xl p-3.5 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1E3932] uppercase">Select EMI Tenure (Months)</label>
                  <Select
                    name="emiTenure"
                    value={formData.emiTenure}
                    onChange={handleChange}
                  >
                    <option value={3}>3 Months EMI Plan</option>
                    <option value={6}>6 Months EMI Plan</option>
                    <option value={9}>9 Months EMI Plan</option>
                    <option value={12}>12 Months EMI Plan</option>
                  </Select>
                </div>

                <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-[#cba258]/40">
                  <span className="text-xs font-bold text-slate-700">Calculated Monthly EMI:</span>
                  <span className="text-sm font-extrabold text-[#006241]">
                    ₹{monthlyEmi.toLocaleString()} / month ({emiTenureNum} installments)
                  </span>
                </div>
              </div>
            )}

            {/* Payment Status */}
            {!isEMI && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E3932] flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle className="h-3.5 w-3.5 text-[#00754A]" /> Initial Payment Status
                </label>
                <Select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                >
                  <option value="Pending">Pending Dues</option>
                  <option value="Paid">Paid in Full</option>
                  <option value="Partial">Partial Payment</option>
                </Select>
              </div>
            )}

            {/* Fees Structure Breakdown Summary Card */}
            <div className="bg-[#eef7f2] border border-[#a3d9c9] rounded-xl p-3.5 space-y-2 mt-2">
              <div className="flex items-center justify-between border-b border-[#a3d9c9]/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#006241]">Fee Structure Summary</span>
                <span className="text-xs font-extrabold text-[#00754A] bg-[#d4e9e2] px-2 py-0.5 rounded-full">
                  {isEMI ? `${emiTenureNum} Months EMI` : "Full Payment"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#1E3932]">
                <div>
                  <span className="text-slate-500 block text-[11px]">Total Course Fee</span>
                  <span className="font-extrabold text-sm text-[#006241]">₹{totalFeeNum.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">{isEMI ? "Monthly Installment" : "Payment Status"}</span>
                  <span className="font-extrabold text-sm text-[#00754A]">
                    {isEMI ? `₹${monthlyEmi.toLocaleString()} / mo` : formData.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="shadow-md">
              Save Admission Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddAdmissionDialog;