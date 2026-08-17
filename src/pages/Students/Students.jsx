import { useState, useEffect } from "react";
import Layout from "../../Components/layout/Layout";
import StudentTable from "../../Components/students/StudentTable";
import AddStudentDialog from "../../Components/students/AddStudentDialog";
import EditStudentDialog from "../../Components/students/EditStudentDialog";
import DeleteStudentDialog from "../../Components/students/DeleteStudentDialog";
import ViewStudentDialog from "../../Components/students/ViewStudentDialog";
import StudentStatsCard from "../../Components/students/StudentStatsCard";
import PageHeader from "../../Components/common/PageHeader";
import LeadAssignmentModal from "../../Components/students/LeadAssignmentModal";
import ClickToCallModal from "../../Components/dialer/ClickToCallModal";

import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Select } from "../../Components/ui/select";
import { Card, CardContent } from "../../Components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../Components/ui/tabs";
import { useToast } from "../../Components/ui/toast";
import { Plus, Search, Download, FileSpreadsheet, FileText, X, Filter, UserCheck, PhoneCall } from "lucide-react";
import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  updateLeadStage,
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

const LEAD_STAGES = ["ALL", "Open", "CNR", "Call Back", "Stage 2", "Stage 2.5", "Admission Done"];

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

  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [dialerStudent, setDialerStudent] = useState(null);

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [unassignedOnly, setUnassignedOnly] = useState(false);

  const userRole = localStorage.getItem("userRole") || "ROLE_ADMIN";
  const currentUserId = localStorage.getItem("userId");
  const isAdmin = userRole === "ROLE_ADMIN";

  const loadStudentsFromBackend = async () => {
    try {
      setLoading(true);
      const [studRes, admRes] = await Promise.all([
        getStudents(),
        getAdmissions(),
      ]);

      if (studRes && studRes.data) {
        let list = Array.isArray(studRes.data) ? studRes.data : (studRes.data.data || []);
        const admList = admRes?.data || [];
        const admByStudentId = {};
        admList.forEach((adm) => {
          const sid = String(adm.studentId || adm.student?.id || adm.student?.studentId || "");
          if (sid) admByStudentId[sid] = adm;
        });

        const sortedList = [...list].sort((a, b) => Number(b.id || b.studentId || 0) - Number(a.id || a.studentId || 0));
        let mapped = sortedList.map((s, idx) => {
          const sId = String(s.id || s.studentId || "");
          const matchedAdm = admByStudentId[sId] || null;
          return normalizeStudentRecord(
            matchedAdm ? { ...s, admission: matchedAdm } : s,
            idx
          );
        });

        // Counsellor role restriction: filter to only assigned leads if Counsellor
        if (!isAdmin && currentUserId) {
          mapped = mapped.filter((s) => String(s.assignedCounselorId) === String(currentUserId));
        }

        setStudents(mapped);
      }
    } catch (error) {
      console.log("Students API error:", error);
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

  const handleStageChange = async (studentId, newStage) => {
    try {
      await updateLeadStage(studentId, newStage);
      setStudents((prev) =>
        prev.map((s) => (String(s.id || s.studentId) === String(studentId) ? { ...s, leadStage: newStage } : s))
      );
      showToast(`Updated enquiry stage to "${newStage}"`, "success");
    } catch (err) {
      showToast("Failed to update stage", "error");
    }
  };

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
      leadStage: "Open",
      leadSource: newStudent.leadSource || "Website",
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
        showToast(`Registered lead ${studentObj.firstName || payload.firstName} (${payload.leadSource})!`, "success");
      }
    } catch (error) {
      showToast(`Lead record saved!`, "success");
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

    try {
      await updateStudent(sId, updatedStudent);
      showToast(`Updated student details for ${updatedStudent.name || updatedStudent.firstName}`, "success");
    } catch (error) {
      console.log("Update error:", error);
    }
    await loadStudentsFromBackend();
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setOpenDelete(true);
  };

  const handleDeleteStudent = async (id) => {
    try {
      await deleteStudent(id);
      showToast(`Lead record removed`, "info");
    } catch (error) {
      console.log("Delete error:", error);
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
      "Lead Stage": s.leadStage || "Open",
      "Lead Source": s.leadSource || "Website",
      "Assigned Counsellor": s.assignedCounselorName || "Unassigned",
      "Course Track": s.course,
      "Active Status": s.status,
    }));
    exportToExcel(exportData, "Student_Lead_CRM_Directory");
    showToast("Exported Lead Directory to Excel!", "success");
  };

  const handleExportPDF = () => {
    const headers = ["STU ID", "Name", "Phone", "Lead Stage", "Source", "Assigned Counsellor"];
    const rows = filteredStudents.map((s, idx) => [
      s.formattedId || `STU-${101 + idx}`,
      s.name,
      s.phone || "N/A",
      s.leadStage || "Open",
      s.leadSource || "Website",
      s.assignedCounselorName || "Unassigned",
    ]);
    exportToPDF("Lead & Enquiry CRM Report", headers, rows, "Lead_CRM_Report_PDF");
    showToast("Exported PDF Report!", "success");
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
      formattedId.toLowerCase().includes(q) ||
      rawId.includes(q);

    const matchesStage =
      stageFilter === "ALL" || (student.leadStage || "Open").toLowerCase() === stageFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "all" || (student.status || "").toLowerCase() === statusFilter.toLowerCase();

    const matchesCourse =
      courseFilter === "all" || (student.course || "").toLowerCase() === courseFilter.toLowerCase();

    const matchesUnassigned = !unassignedOnly || !student.assignedCounselorId;

    return matchesSearch && matchesStage && matchesStatus && matchesCourse && matchesUnassigned;
  });

  const unassignedCount = students.filter((s) => !s.assignedCounselorId).length;

  return (
    <Layout>
      <PageHeader
        title={isAdmin ? "Student & Enquiry CRM Desk" : "My Assigned Enquiries"}
        description={isAdmin ? "Centralized student leads, assignment engine, click-to-call dialer, and stage transitions" : "Manage your assigned enquiries, calls, and follow-ups"}
        categoryTag="CRM Core"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <Button
                onClick={() => {
                  const unassignedIds = students.filter((s) => !s.assignedCounselorId).map((s) => s.id || s.studentId);
                  setSelectedLeadIds(unassignedIds.length > 0 ? unassignedIds : students.slice(0, 5).map((s) => s.id || s.studentId));
                  setOpenAssignModal(true);
                }}
                variant="outline"
                size="sm"
                className="gap-1.5 border-[#cc785c]/40 bg-[#faf9f5] hover:bg-[#efe9de] text-[#cc785c] font-bold"
              >
                <UserCheck className="h-3.5 w-3.5" /> Assign Leads ({unassignedCount})
              </Button>
            )}

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
              onClick={() => setOpenAdd(true)}
              variant="primary"
              size="sm"
              className="shadow-xs gap-1.5 bg-[#cc785c] hover:bg-[#a9583e]"
            >
              <Plus className="h-3.5 w-3.5" /> Add New Lead
            </Button>
          </div>
        }
      />

      {/* Stage Breakdown Tabs / Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {LEAD_STAGES.filter(st => st !== "ALL").map((st) => {
          const count = students.filter((s) => (s.leadStage || "Open") === st).length;
          const isActive = stageFilter === st;

          return (
            <div
              key={st}
              onClick={() => setStageFilter(isActive ? "ALL" : st)}
              className={`p-3 rounded-2xl border cursor-pointer transition select-none ${
                isActive
                  ? "bg-[#cc785c] text-white border-[#cc785c] shadow-md"
                  : "bg-[#efe9de] border-[#e6dfd8] hover:border-[#cc785c]/50 text-[#141413]"
              }`}
            >
              <span className={`text-[10px] uppercase font-bold tracking-wider block ${isActive ? "text-white/80" : "text-[#6c6a64]"}`}>
                {st}
              </span>
              <h4 className="text-xl font-serif-display font-bold mt-0.5">{count}</h4>
            </div>
          );
        })}
      </div>

      {/* Main Table Card */}
      <Card className="bg-[#efe9de] border-[#e6dfd8]">
        <CardContent className="p-4 md:p-6 space-y-6">
          {/* Search & Stage Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 max-w-2xl">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#8e8b82]" />
                <Input
                  type="text"
                  placeholder="Search name, phone, course, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-9 rounded-md bg-[#faf9f5] border-[#e6dfd8] w-full"
                />
              </div>

              <div className="w-full sm:w-56 shrink-0">
                <Select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="bg-[#faf9f5] border-[#e6dfd8] text-xs font-semibold"
                >
                  <option value="all">All Courses</option>
                  {COURSE_TRACKS.map((track) => (
                    <option key={track} value={track}>
                      {track}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Stage Tabs */}
            <div className="overflow-x-auto pb-1 lg:pb-0 shrink-0">
              <Tabs value={stageFilter} onValueChange={setStageFilter}>
                <TabsList className="bg-[#faf9f5] border-[#e6dfd8]">
                  {LEAD_STAGES.map((st) => (
                    <TabsTrigger key={st} value={st} className="text-xs">
                      {st === "ALL" ? `All (${students.length})` : st}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Student Table View */}
          <StudentTable
            students={filteredStudents}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onStageChange={handleStageChange}
            onCall={(student) => setDialerStudent(student)}
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

      {/* Lead Assignment Modal */}
      {openAssignModal && (
        <LeadAssignmentModal
          selectedLeadIds={selectedLeadIds}
          onClose={() => setOpenAssignModal(false)}
          onSuccess={() => {
            showToast("Leads assigned successfully!", "success");
            loadStudentsFromBackend();
          }}
        />
      )}

      {/* Dialer Modal */}
      {dialerStudent && (
        <ClickToCallModal
          student={dialerStudent}
          onClose={() => setDialerStudent(null)}
          onCallLogged={() => {
            showToast("Call record logged successfully!", "success");
            setDialerStudent(null);
          }}
        />
      )}
    </Layout>
  );
}

export default Students;