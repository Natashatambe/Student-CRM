import { useState, useEffect } from "react";
import Layout from "../../Components/layout/Layout";
import StudentTable from "../../Components/students/StudentTable";
import AddStudentDialog from "../../Components/students/AddStudentDialog";
import EditStudentDialog from "../../Components/students/EditStudentDialog";
import DeleteStudentDialog from "../../Components/students/DeleteStudentDialog";
import ViewStudentDialog from "../../Components/students/ViewStudentDialog";
import StudentStatsCard from "../../Components/students/StudentStatsCard";
import PageHeader from "../../Components/common/PageHeader";

import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Select } from "../../Components/ui/select";
import { Card, CardContent } from "../../Components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../Components/ui/tabs";
import { useToast } from "../../Components/ui/toast";
import { Plus, Search, Download, FileSpreadsheet, FileText, X, Filter } from "lucide-react";
import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  normalizeStudentRecord,
} from "../../services/studentService";
import { addAdmission, updateAdmission, deleteAdmission, getAdmissions } from "../../services/admissionService";
import { exportToExcel, exportToPDF } from "../../lib/exportUtils";
import { normalizeStatus } from "../../lib/utils";

const COURSE_TRACKS = [
  "Java Full Stack",
  "MERN STACK",
  "Python Masterclass",
  "Node.js & Express Masterclass",
  "Data ANALYST",
  "React JS Track",
];

function Students() {
  const { showToast } = useToast();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [studentToView, setStudentToView] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");


  const loadStudentsFromBackend = async () => {
    try {
      setLoading(true);
      // Fetch students AND admissions in parallel
      const [studRes, admRes] = await Promise.all([
        getStudents(),
        getAdmissions(),
      ]);

      if (studRes && studRes.data) {
        let list = Array.isArray(studRes.data) ? studRes.data : (studRes.data.data || []);

        // Build a map of studentId -> admission for fast lookup
        const admList = admRes?.data || [];
        const admByStudentId = {};
        admList.forEach((adm) => {
          const sid = String(adm.studentId || adm.student?.id || adm.student?.studentId || "");
          if (sid) admByStudentId[sid] = adm;
        });

        // Merge admission data into each student record
        const sortedList = [...list].sort((a, b) => Number(b.id || b.studentId || 0) - Number(a.id || a.studentId || 0));
        const mapped = sortedList.map((s, idx) => {
          const sId = String(s.id || s.studentId || "");
          const matchedAdm = admByStudentId[sId] || null;
          return normalizeStudentRecord(
            matchedAdm ? { ...s, admission: matchedAdm } : s,
            idx
          );
        });
        setStudents(mapped);
      }
    } catch (error) {
      console.log("Students API loaded with local data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentsFromBackend();
    const params = new URLSearchParams(window.location.search);
    const q = params.get("search");
    if (q) setSearch(q);
  }, []);


  const handleAddStudent = async (newStudent) => {
    const payload = {
      firstName: newStudent.firstName,
      lastName: newStudent.lastName,
      name: `${newStudent.firstName} ${newStudent.lastName}`.trim(),
      email: newStudent.email,
      phone: newStudent.phone,
      address: newStudent.address,
      gender: newStudent.gender,
      course: newStudent.course,
      status: newStudent.status || "Enquiry",
      totalFee: Number(newStudent.totalFee || newStudent.fees || 50000),
      fees: Number(newStudent.fees || newStudent.totalFee || 50000),
      paymentType: newStudent.paymentType || "Full",
      paymentStatus: newStudent.paymentStatus || "Paid",
    };

    let studentObj = null;

    try {
      const res = await addStudent(payload);
      if (res?.data) {
        studentObj = res.data;
        showToast(`Registered student partner ${studentObj.firstName || payload.firstName} ${studentObj.lastName || payload.lastName} (${payload.status})!`, "success");
      }
    } catch (error) {
      console.log("API add student error:", error);
      showToast(`Registered student enquiry record saved!`, "success");
    }

    const effectiveStudentObj = studentObj || {
      id: students.length > 0 ? Math.max(...students.map(s => Number(s.id || 0))) + 1 : 1,
      ...payload
    };

    // Prepend to top of list (latest entry first)
    setStudents((prev) => {
      const sId = effectiveStudentObj.id || effectiveStudentObj.studentId;
      const exists = prev.some((s) => String(s.id || s.studentId) === String(sId));
      if (exists) return prev;
      const formattedId = `STU-${101 + prev.length}`;
      return [
        {
          ...effectiveStudentObj,
          id: sId,
          studentId: sId,
          formattedId,
          status: normalizeStatus(effectiveStudentObj.status),
        },
        ...prev,
      ];
    });

    if (newStudent.status === "Active") {
      try {
        const realCourseTrack = effectiveStudentObj.course || newStudent.course || "Java Full Stack";
        const selectedFee = Number(newStudent.totalFee || newStudent.fees || 50000);
        const cId = Number(effectiveStudentObj.courseId || newStudent.courseId || 1);
        const sId = Number(effectiveStudentObj.id || effectiveStudentObj.studentId || 1);

        await addAdmission({
          studentId: sId,
          courseId: cId,
          studentName: effectiveStudentObj.name || `${effectiveStudentObj.firstName} ${effectiveStudentObj.lastName}`.trim(),
          courseName: realCourseTrack,
          admissionDate: new Date().toISOString().split("T")[0],
          totalFee: selectedFee,
          paymentStatus: newStudent.paymentStatus || "Paid",
          paymentType: newStudent.paymentType || "Full",
          student: { id: sId },
          course: { id: cId, name: realCourseTrack },
        });
        showToast(`Active student ${effectiveStudentObj.firstName} enrolled in ${realCourseTrack} added to Admissions Desk!`, "success");
      } catch (err) {
        console.log("Auto-admission error for active student:", err);
      }
    } else {
      showToast(`Student registered for ${newStudent.status || "Enquiry"} purpose`, "info");
    }

    await loadStudentsFromBackend();
  };

  const handleView = (student) => {
    setStudentToView(student);
    setOpenView(true);
  };

  const handleEdit = (student) => {
    setStudentToEdit(student);
    setOpenEdit(true);
  };

  const handleUpdateStudent = async (updatedStudent) => {
    const sId = updatedStudent.id || updatedStudent.studentId;
    if (!sId) return;

    const normStatus = normalizeStatus(updatedStudent.status);
    const previousStudent = students.find((s) => String(s.id || s.studentId) === String(sId));
    const wasNotActive = !previousStudent || normalizeStatus(previousStudent.status) !== "Active";
    const isNowActive = normStatus === "Active";
    const existingAdmId = previousStudent?.admissionId || previousStudent?.admission?.id || previousStudent?.admission?.admissionId;
    const hasAdmission = Boolean(existingAdmId);

    const realCourseTrack = updatedStudent.course || previousStudent?.course || "";
    const cId = Number(updatedStudent.courseId || previousStudent?.courseId || 1);

    const feeVal = updatedStudent.totalFee != null ? Number(updatedStudent.totalFee)
      : updatedStudent.fees != null ? Number(updatedStudent.fees)
      : previousStudent?.totalFee != null ? Number(previousStudent.totalFee)
      : null;
    const pType = updatedStudent.paymentType || previousStudent?.paymentType || null;
    const eTenure = pType === "EMI" ? Number(updatedStudent.emiTenure || previousStudent?.emiTenure || 3) : null;
    const eMonthly = pType === "EMI" ? Number(updatedStudent.emiMonthlyAmount || (feeVal && eTenure ? Math.round(feeVal / eTenure) : 0)) : null;
    const pStatus = updatedStudent.paymentStatus || previousStudent?.paymentStatus || null;

    const payload = {
      ...previousStudent,
      ...updatedStudent,
      id: sId,
      studentId: sId,
      firstName: updatedStudent.firstName,
      lastName: updatedStudent.lastName,
      name: `${updatedStudent.firstName} ${updatedStudent.lastName}`.trim(),
      email: updatedStudent.email,
      phone: updatedStudent.phone,
      address: updatedStudent.address,
      gender: updatedStudent.gender,
      course: realCourseTrack,
      status: normStatus,
      totalFee: feeVal,
      fees: feeVal,
      paymentType: pType,
      paymentStatus: pStatus,
      emiTenure: eTenure,
      emiMonthlyAmount: eMonthly,
    };

    // Optimistically update UI
    setStudents((prev) =>
      prev.map((s) => (String(s.id || s.studentId) === String(sId) ? { ...s, ...payload, status: normStatus } : s))
    );
    if (studentToView && String(studentToView.id || studentToView.studentId) === String(sId)) {
      setStudentToView((prev) => ({ ...prev, ...payload, status: normStatus }));
    }

    try {
      await updateStudent(sId, payload);
    } catch (error) {
      console.log("API update student error:", error);
    }

    if (isNowActive && feeVal) {
      try {
        const admPayload = {
          studentId: Number(sId),
          courseId: cId,
          studentName: payload.name,
          studentEmail: payload.email,
          courseName: realCourseTrack,
          admissionDate: updatedStudent.admissionDate || previousStudent?.admissionDate || new Date().toISOString().split("T")[0],
          totalFee: feeVal,
          paymentStatus: pStatus || (pType === "EMI" ? "Partial" : "Paid"),
          paymentType: pType || "Full",
          emiTenure: eTenure,
          emiMonthlyAmount: eMonthly,
          student: { id: Number(sId), name: payload.name, email: payload.email },
          course: { id: cId, name: realCourseTrack },
        };

        if (hasAdmission && !wasNotActive) {
          // Student already had admission — UPDATE it
          await updateAdmission(existingAdmId, admPayload).catch((err) => console.log("Admission update error:", err));
          showToast(`\uD83D\uDCCB Admission & fee details updated for ${payload.name}!`, "success");
        } else {
          // First time becoming Active — CREATE admission
          await addAdmission(admPayload).catch((err) => console.log("Admission add error:", err));
          showToast(`\uD83C\uDF89 Student ${payload.name} approved for ${realCourseTrack}!`, "success");
        }
      } catch (err) {
        console.log("Admission sync error:", err);
      }
    } else {
      showToast(`Updated student status to ${normStatus} for ${payload.name}`, "success");
    }

    // Reload to get fresh merged student+admission data
    await loadStudentsFromBackend();
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setOpenDelete(true);
  };

  const handleDeleteStudent = async (id) => {
    const target = students.find((s) => String(s.id || s.studentId) === String(id));

    setStudents((prev) => prev.filter((s) => String(s.id || s.studentId) !== String(id)));
    showToast(`Removed student partner ${target?.name || target?.firstName || ""}`, "info");

    try {
      const admId = target?.admission?.id || target?.admissionId;
      if (admId) {
        await deleteAdmission(admId).catch(() => null);
      }
      await deleteStudent(id);
    } catch (error) {
      console.log("API delete student error:", error);
    } finally {
      await loadStudentsFromBackend();
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredStudents.map((s, idx) => ({
      "STU ID": s.formattedId || `STU-${101 + idx}`,
      "Full Name": s.name,
      "Email Address": s.email,
      "Phone Number": s.phone,
      Gender: s.gender,
      Address: s.address,
      "Course Track": s.course,
      "Active Status": s.status,
      "Fee (INR)": s.totalFee || 0,
      "Payment Plan": s.paymentType || "Full",
    }));
    exportToExcel(exportData, "Student_Partner_Directory");
    showToast("Exported Student Directory to Excel Sheet!", "success");
  };

  const handleExportPDF = () => {
    const headers = ["STU ID", "Partner Name", "Email", "Phone", "Course Track", "Status"];
    const rows = filteredStudents.map((s, idx) => [
      s.formattedId || `STU-${101 + idx}`,
      s.name,
      s.email || "N/A",
      s.phone || "N/A",
      s.course || "General",
      s.status,
    ]);
    exportToPDF("Student Partner Directory Report", headers, rows, "Student_Directory_PDF");
    showToast("Exported PDF Report Sheet!", "success");
  };

  const handleExportInactivePDF = () => {
    const inactiveList = students.filter((s) => (s.status || "").toLowerCase() === "inactive");
    if (inactiveList.length === 0) {
      showToast("No inactive students found to download PDF!", "info");
      return;
    }
    const headers = ["STU ID", "Student Name", "Email Address", "Phone Number", "Course Track", "Address", "Status"];
    const rows = inactiveList.map((s, idx) => [
      s.formattedId || `STU-${101 + idx}`,
      s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim(),
      s.email || "N/A",
      s.phone || "N/A",
      s.course || "Java Full Stack",
      s.address || "Main City",
      "Inactive",
    ]);
    exportToPDF("Inactive Student Partners Directory Report", headers, rows, "Inactive_Students_Report");
    showToast(`Downloaded PDF report for ${inactiveList.length} Inactive Student(s)!`, "success");
  };

  // Filter students (sorted DESC by ID)
  const filteredStudents = students.filter((student, index) => {
    const displayName = student.name || `${student.firstName || ""} ${student.lastName || ""}`.trim();
    const formattedId = student.formattedId || `stu-${101 + index}`;
    const rawId = String(student.id || student.studentId || "");
    const q = search.toLowerCase().trim();

    const matchesSearch =
      !q ||
      displayName.toLowerCase().includes(q) ||
      (student.email || "").toLowerCase().includes(q) ||
      (student.course || "").toLowerCase().includes(q) ||
      (student.phone || "").includes(q) ||
      (student.address || "").toLowerCase().includes(q) ||
      formattedId.toLowerCase().includes(q) ||
      rawId.includes(q);

    const matchesStatus =
      statusFilter === "all" || (student.status || "").toLowerCase() === statusFilter.toLowerCase();

    const matchesCourse =
      courseFilter === "all" || (student.course || "").toLowerCase() === courseFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCourse;
  });


  return (
    <Layout>
      {/* Page Header */}
      <PageHeader
        title="Student Partner Directory"
        description="Manage partner student records, enrollment tracks, and active status"
        categoryTag="Partner Desk"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleExportExcel}
              variant="outline"
              size="sm"
              className="gap-1.5 border-[#e6dfd8] bg-[#faf9f5] hover:bg-[#efe9de] text-[#141413]"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-[#00754A]" /> Export Excel
            </Button>

            <Button
              onClick={handleExportPDF}
              variant="outline"
              size="sm"
              className="gap-1.5 border-[#e6dfd8] bg-[#faf9f5] hover:bg-[#efe9de] text-[#141413]"
            >
              <Download className="h-3.5 w-3.5 text-[#cc785c]" /> Export PDF
            </Button>

            <Button
              onClick={handleExportInactivePDF}
              variant="outline"
              size="sm"
              className="gap-1.5 border-[#e6dfd8] bg-[#faf9f5] text-[#cc785c] hover:bg-[#efe9de]"
            >
              <FileText className="h-3.5 w-3.5 text-[#cc785c]" /> Inactive PDF
            </Button>

            <Button
              onClick={() => setOpenAdd(true)}
              variant="primary"
              size="sm"
              className="shadow-xs gap-1.5 bg-[#cc785c] hover:bg-[#a9583e]"
            >
              <Plus className="h-3.5 w-3.5" /> Enroll Student
            </Button>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StudentStatsCard
          title="Total Students"
          value={students.length}
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />
        <StudentStatsCard
          title="Active Students"
          value={students.filter((s) => s.status === "Active").length}
          active={statusFilter === "active"}
          onClick={() => setStatusFilter("active")}
        />
        <StudentStatsCard
          title="Pending Students"
          value={students.filter((s) => s.status === "Pending").length}
          active={statusFilter === "pending"}
          onClick={() => setStatusFilter("pending")}
        />
        <StudentStatsCard
          title="Inactive Students"
          value={students.filter((s) => s.status === "Inactive").length}
          active={statusFilter === "inactive"}
          onClick={() => setStatusFilter("inactive")}
        />
      </div>

      {/* Main Table Card */}
      <Card className="bg-[#efe9de] border-[#e6dfd8]">
        <CardContent className="p-4 md:p-6 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 max-w-2xl">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#8e8b82]" />
                <Input
                  type="text"
                  placeholder="Search name, STU ID, email, phone, course..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-9 rounded-md bg-[#faf9f5] border-[#e6dfd8] w-full"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-3 text-[#8e8b82] hover:text-[#141413] transition"
                    title="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="w-full sm:w-56 shrink-0">
                <Select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="bg-[#faf9f5] border-[#e6dfd8] text-xs font-semibold"
                >
                  <option value="all">All Course Tracks</option>
                  {COURSE_TRACKS.map((track) => (
                    <option key={track} value={track}>
                      {track}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto pb-1 lg:pb-0 shrink-0">
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList className="bg-[#faf9f5] border-[#e6dfd8]">
                  <TabsTrigger value="all" className="text-xs">
                    All ({students.length})
                  </TabsTrigger>
                  <TabsTrigger value="active" className="text-xs">
                    Active ({students.filter((s) => s.status === "Active").length})
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs">
                    Pending ({students.filter((s) => s.status === "Pending").length})
                  </TabsTrigger>
                  <TabsTrigger value="enquiry" className="text-xs">
                    Enquiry ({students.filter((s) => s.status === "Enquiry").length})
                  </TabsTrigger>
                  <TabsTrigger value="inactive" className="text-xs">
                    Inactive ({students.filter((s) => s.status === "Inactive").length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Active Filter Clear Banner */}
          {(search || statusFilter !== "all" || courseFilter !== "all") && (
            <div className="flex items-center justify-between gap-2 bg-[#faf9f5] p-2.5 rounded-lg border border-[#e6dfd8] text-xs">
              <div className="flex items-center gap-2 flex-wrap text-[#6c6a64]">
                <span className="font-semibold text-[#141413] flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5 text-[#cc785c]" /> Active Filters:
                </span>
                {statusFilter !== "all" && (
                  <span className="bg-[#efe9de] text-[#cc785c] font-bold px-2 py-0.5 rounded border border-[#e6dfd8]">
                    Status: {statusFilter.toUpperCase()}
                  </span>
                )}
                {courseFilter !== "all" && (
                  <span className="bg-[#efe9de] text-[#141413] font-bold px-2 py-0.5 rounded border border-[#e6dfd8]">
                    Track: {courseFilter}
                  </span>
                )}
                {search && (
                  <span className="bg-[#efe9de] text-[#141413] font-bold px-2 py-0.5 rounded border border-[#e6dfd8]">
                    Query: "{search}"
                  </span>
                )}
                <span className="text-[#8e8b82]">({filteredStudents.length} results)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setCourseFilter("all");
                }}
                className="text-xs text-[#cc785c] font-bold hover:underline shrink-0"
              >
                Reset All
              </button>
            </div>
          )}

          {/* Student Table View */}
          <StudentTable
            students={filteredStudents}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onStatusChange={(student, newStatus) =>
              handleUpdateStudent({ ...student, status: newStatus })
            }
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ViewStudentDialog
        open={openView}
        setOpen={setOpenView}
        student={studentToView}
        onEdit={handleEdit}
        onStatusChange={(student, newStatus) => {
          handleUpdateStudent({ ...student, status: newStatus });
          if (studentToView) {
            setStudentToView({ ...studentToView, status: newStatus });
          }
        }}
      />

      <AddStudentDialog
        open={openAdd}
        setOpen={setOpenAdd}
        onStudentAdded={handleAddStudent}
      />

      <EditStudentDialog
        open={openEdit}
        setOpen={setOpenEdit}
        studentData={studentToEdit}
        onStudentUpdated={handleUpdateStudent}
      />

      <DeleteStudentDialog
        open={openDelete}
        setOpen={setOpenDelete}
        student={studentToDelete}
        onDelete={handleDeleteStudent}
      />
    </Layout>
  );
}

export default Students;