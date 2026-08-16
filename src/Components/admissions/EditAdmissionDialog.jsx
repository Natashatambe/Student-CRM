import { useEffect, useState } from "react";
import { getStudents } from "../../services/studentService";
import { getCourses } from "../../services/courseService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, ShadcnSelect } from "../ui/select";
import Calendar from "../ui/calendar";
import { User, BookOpen, Calendar as CalendarIcon, DollarSign, CheckCircle } from "lucide-react";

function EditAdmissionDialog({
  open = true,
  setOpen,
  onClose,
  onSuccess,
  admission,
  onAdmissionUpdated,
}) {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [showCalendar, setShowCalendar] = useState(false);

  const [formData, setFormData] = useState({
    studentId: "",
    courseId: "",
    admissionDate: "",
    totalFee: "",
    paymentType: "Full",
    emiTenure: 3,
    paymentStatus: "Pending",
  });

  useEffect(() => {
    if (open) {
      loadStudents();
      loadCourses();
    }
  }, [open]);

  useEffect(() => {
    if (admission) {
      setFormData({
        studentId: admission.studentId || admission.student?.id || admission.student?.studentId || "",
        courseId: admission.courseId || admission.course?.id || admission.course?.courseId || "",
        admissionDate: admission.admissionDate || "",
        totalFee: admission.totalFee || "",
        paymentType: admission.paymentType || (admission.emiTenure ? "EMI" : "Full"),
        emiTenure: admission.emiTenure || 3,
        paymentStatus: admission.paymentStatus || "Pending",
      });
    }
  }, [admission]);

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
          }));
          setStudents(mapped);
          return;
        }
      }
    } catch (error) {
      console.log("Using preview students");
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
      console.log("Using preview courses");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedStudent = students.find((s) => String(s.id) === String(formData.studentId) || s.name === admission?.studentName);
    const selectedCourse = courses.find((c) => String(c.id) === String(formData.courseId) || c.name === admission?.courseName);

    const totalFeeNum = Number(formData.totalFee || 0);
    const isEMI = formData.paymentType === "EMI";
    const emiTenureNum = isEMI ? Number(formData.emiTenure || 3) : null;
    const emiMonthlyAmount = isEMI && emiTenureNum ? Math.round(totalFeeNum / emiTenureNum) : null;

    const sId = selectedStudent ? Number(selectedStudent.id) : Number(formData.studentId || admission?.studentId || 1);
    const cId = selectedCourse ? Number(selectedCourse.id) : Number(formData.courseId || admission?.courseId || 1);

    const payload = {
      ...admission,
      ...formData,
      studentId: sId,
      courseId: cId,
      totalFee: totalFeeNum,
      paymentType: isEMI ? "EMI" : "Full",
      emiTenure: emiTenureNum,
      emiMonthlyAmount: emiMonthlyAmount,
      studentName: selectedStudent ? (selectedStudent.name || `${selectedStudent.firstName || ""} ${selectedStudent.lastName || ""}`.trim()) : (admission.studentName || admission.student?.name || "Student Partner"),
      courseName: selectedCourse ? selectedCourse.name : (admission.courseName || admission.course?.courseName || admission.course?.name || "Course Track"),
      student: selectedStudent || { id: sId },
      course: selectedCourse || { id: cId },
    };

    if (onAdmissionUpdated) await onAdmissionUpdated(payload);
    if (onSuccess) await onSuccess(payload);

    handleClose();
  };

  const isEMI = formData.paymentType === "EMI";
  const emiTenureNum = Number(formData.emiTenure || 3);
  const totalFeeNum = Number(formData.totalFee || 0);
  const monthlyEmi = totalFeeNum > 0 && emiTenureNum > 0 ? Math.round(totalFeeNum / emiTenureNum) : 0;

  const rawAdmId = admission ? Number(admission.admissionId || admission.id || 1) : 1;
  const formattedAdmId = `#${rawAdmId}`;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent onClose={handleClose}>
        <DialogHeader>
          <DialogTitle>Edit Admission Entry</DialogTitle>
          <DialogDescription>
            Update enrollment information for admission record {formattedAdmId}.
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

            {/* Payment Fee Structure: Full vs EMI */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E3932] flex items-center gap-1.5 uppercase tracking-wider">
                Payment Fee Structure
              </label>
              <ShadcnSelect
                name="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
                options={[
                  { value: "Full", label: "Full One-Time Payment" },
                  { value: "EMI", label: "EMI Monthly Installment Plan" },
                ]}
                placeholder="-- Select Payment Plan --"
              />
            </div>

            {/* EMI Options if EMI selected */}
            {isEMI && (
              <div className="bg-[#faf6ee] border border-[#cba258] rounded-xl p-3.5 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1E3932] uppercase">Select EMI Tenure (Months)</label>
                  <ShadcnSelect
                    name="emiTenure"
                    value={formData.emiTenure}
                    onChange={handleChange}
                    options={[
                      { value: 3, label: "3 Months EMI Plan" },
                      { value: 6, label: "6 Months EMI Plan" },
                      { value: 9, label: "9 Months EMI Plan" },
                      { value: 12, label: "12 Months EMI Plan" },
                    ]}
                  />
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
                  <CheckCircle className="h-3.5 w-3.5 text-[#00754A]" /> Payment Status
                </label>
                <ShadcnSelect
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  options={[
                    { value: "Pending", label: "Pending Dues" },
                    { value: "Paid", label: "Paid in Full" },
                    { value: "Partial", label: "Partial Payment" },
                  ]}
                  placeholder="-- Select Payment Status --"
                />
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="shadow-md">
              Update Admission Record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditAdmissionDialog;