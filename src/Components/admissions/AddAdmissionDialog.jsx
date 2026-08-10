import { useEffect, useState } from "react";
import { getStudents } from "../../services/studentService";
import { getCourses } from "../../services/courseService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ShadcnSelect } from "../ui/select";
import Calendar from "../ui/calendar";
import { User, BookOpen, Calendar as CalendarIcon, DollarSign, CheckCircle } from "lucide-react";

function AddAdmissionDialog({ open = true, setOpen, onClose, onSuccess, onAdmissionAdded }) {
  const [students, setStudents] = useState([
    { id: 1, firstName: "Natasha", lastName: "Tambe", name: "Natasha Tambe" },
    { id: 2, firstName: "Rahul", lastName: "Sharma", name: "Rahul Sharma" },
    { id: 3, firstName: "Priya", lastName: "Patel", name: "Priya Patel" },
    { id: 3, firstName: "Jonny", lastName: "Jon", name: "Jonny Jon" },
  ]);

  const [courses, setCourses] = useState([
    { id: 1, name: "Java Full Stack", fees: "₹50,000" },
    { id: 2, name: "Python Masterclass", fees: "₹35,000" },
    { id: 3, name: "React JS Track", fees: "₹30,000" },
    { id: 4, name: "Data Science & AI", fees: "₹65,000" },
  ]);

  const [showCalendar, setShowCalendar] = useState(false);

  const [formData, setFormData] = useState({
    studentId: "",
    courseId: "",
    admissionDate: new Date().toISOString().split("T")[0],
    totalFee: "",
    paymentStatus: "Pending",
  });

  useEffect(() => {
    loadStudents();
    loadCourses();
  }, []);

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
            fees: c.fees ? (typeof c.fees === "number" ? `₹${c.fees.toLocaleString()}` : c.fees) : "",
          }));
          setCourses(mapped);
        }
      }
    } catch (error) {
      console.log("Using preview courses list");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      if (name === "courseId" && value) {
        const selectedCourse = courses.find((c) => String(c.id) === String(value));
        if (selectedCourse && selectedCourse.fees) {
          const numFee = String(selectedCourse.fees).replace(/[^0-9]/g, "");
          if (numFee) updated.totalFee = numFee;
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
      totalFee: Number(formData.totalFee),
      paymentStatus: formData.paymentStatus,
      studentName: selectedStudent ? (selectedStudent.name || `${selectedStudent.firstName} ${selectedStudent.lastName}`.trim()) : "Student Partner",
      courseName: selectedCourse ? selectedCourse.name : "Course Track",
      student: selectedStudent,
      course: selectedCourse,
    };

    if (onAdmissionAdded) await onAdmissionAdded(recordData);
    if (onSuccess) await onSuccess(recordData);

    handleClose();
  };

  const studentOptions = students.map((s) => ({
    value: s.id,
    label: `${s.name || `${s.firstName} ${s.lastName}`.trim()} (ID #${s.id})`,
  }));

  const courseOptions = courses.map((c) => ({
    value: c.id,
    label: `${c.name} ${c.fees ? `(${c.fees})` : ""}`,
  }));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent onClose={handleClose}>
        <DialogHeader>
          <DialogTitle>Create Admission Entry</DialogTitle>
          <DialogDescription>
            Official enrollment registration for partner academy courses.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <DialogBody className="space-y-4">
            {/* Select Student Partner */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E3932] flex items-center gap-1.5 uppercase tracking-wider">
                <User className="h-3.5 w-3.5 text-[#00754A]" /> Select Student Partner
              </label>
              <ShadcnSelect
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                options={studentOptions}
                placeholder="-- Choose Student Partner --"
              />
            </div>

            {/* Select Course Track */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E3932] flex items-center gap-1.5 uppercase tracking-wider">
                <BookOpen className="h-3.5 w-3.5 text-[#00754A]" /> Select Course Track
              </label>
              <ShadcnSelect
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                options={courseOptions}
                placeholder="-- Choose Course Track --"
              />
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

            {/* Payment Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E3932] flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle className="h-3.5 w-3.5 text-[#00754A]" /> Initial Payment Status
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