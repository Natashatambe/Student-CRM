import { useState, useEffect } from "react";
import Layout from "../../Components/layout/Layout";
import CourseTable from "../../Components/courses/CourseTable";
import CourseStatsCard from "../../Components/courses/CourseStatsCard";
import AddCourseDialog from "../../Components/courses/AddCourseDialog";
import EditCourseDialog from "../../Components/courses/EditCourseDialog";
import DeleteCourseDialog from "../../Components/courses/DeleteCourseDialog";
import PageHeader from "../../Components/common/PageHeader";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Card, CardContent } from "../../Components/ui/card";
import { useToast } from "../../Components/ui/toast";
import { Plus, Search, Download, FileSpreadsheet } from "lucide-react";
import {
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
} from "../../services/courseService";
import { exportToExcel, exportToPDF } from "../../lib/exportUtils";

function Courses() {
  const { showToast } = useToast();

  const [courses, setCourses] = useState([
    { id: 1, name: "Java Full Stack", courseName: "Java Full Stack", duration: "6 Months", fees: 45000, fee: 45000, status: "Active", instructor: "Instructor" },
    { id: 2, name: "MERN STACK", courseName: "MERN STACK", duration: "3 Months", fees: 40000, fee: 40000, status: "Active", instructor: "Instructor" },
    { id: 3, name: "Python Masterclass", courseName: "Python Masterclass", duration: "4 Months", fees: 45000, fee: 45000, status: "Active", instructor: "Dr. Deshmukh" },
    { id: 4, name: "Node.js & Express Masterclass", courseName: "Node.js & Express Masterclass", duration: "5 Months", fees: 42000, fee: 42000, status: "Active", instructor: "Instructor" },
    { id: 5, name: "Data ANALYST", courseName: "Data ANALYST", duration: "3 Months", fees: 35000, fee: 35000, status: "Active", instructor: "Instructor" },
    { id: 6, name: "React JS Track", courseName: "React JS Track", duration: "3 Months", fees: 30000, fee: 30000, status: "Active", instructor: "Instructor" },
  ]);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [search, setSearch] = useState("");

  const loadCoursesFromBackend = async () => {
    try {
      const res = await getCourses();
      if (res && res.data) {
        let list = [];
        if (Array.isArray(res.data)) list = res.data;
        else if (Array.isArray(res.data.data)) list = res.data.data;
        const mapped = list.map((c) => {
          const rawFee = c.fees ?? c.fee ?? c.courseFee;
          const feeNum = typeof rawFee === "number" ? rawFee : Number(String(rawFee || "").replace(/[^0-9]/g, "")) || 0;
          return {
            id: c.id ?? c.courseId,
            courseId: c.courseId ?? c.id,
            name: c.name || c.courseName || c.title || "Course Track",
            courseName: c.courseName || c.name || c.title || "Course Track",
            duration: c.duration || "3 Months",
            fees: feeNum,
            fee: feeNum,
            status: c.status || "Active",
          };
        });
        setCourses(mapped);
      }
    } catch (error) {
      console.log("Courses API loaded with fallback data:", error);
    }
  };

  useEffect(() => {
    loadCoursesFromBackend();
    const params = new URLSearchParams(window.location.search);
    const q = params.get("search");
    if (q) setSearch(q);
  }, []);

  const handleAddCourse = async (newCourse) => {
    const numFees = Number(String(newCourse.fees).replace(/[^0-9]/g, "")) || 0;

    const apiPayload = {
      name: newCourse.name,
      courseName: newCourse.name,
      duration: newCourse.duration,
      fees: numFees,
      fee: numFees,
      status: newCourse.status || "Active",
    };

    try {
      const res = await addCourse(apiPayload);
      const created = res?.data || apiPayload;
      const course = {
        ...apiPayload,
        ...created,
        id: created.id || created.courseId || (courses.length > 0 ? Math.max(...courses.map((c) => Number(c.id || 0))) + 1 : 1),
      };
      setCourses((prev) => [course, ...prev.filter((c) => String(c.id) !== String(course.id))]);
      showToast(`Created course track ${course.name}!`, "success");
    } catch (error) {
      console.log("API add course simulation:", error);
      const course = {
        ...apiPayload,
        id: courses.length > 0 ? Math.max(...courses.map((c) => Number(c.id || 0))) + 1 : 1,
      };
      setCourses([course, ...courses]);
      showToast(`Created course track ${course.name}!`, "success");
    }
  };

  const handleEditClick = (course) => {
    setCourseToEdit(course);
    setOpenEdit(true);
  };

  const handleUpdateCourse = async (updatedCourse) => {
    const numFees = Number(String(updatedCourse.fees).replace(/[^0-9]/g, "")) || 0;
    const rawDur = updatedCourse.duration ? String(updatedCourse.duration).trim() : "3 Months";
    const formattedDuration = /^\d+$/.test(rawDur) ? `${rawDur} Months` : rawDur;

    const apiPayload = {
      name: updatedCourse.name,
      courseName: updatedCourse.name,
      duration: formattedDuration,
      fees: numFees,
      fee: numFees,
      status: updatedCourse.status || "Active",
    };

    try {
      const res = await updateCourse(updatedCourse.id, apiPayload);
      if (res?.data) {
        const returned = res.data;
        setCourses((prev) =>
          prev.map((c) =>
            String(c.id) === String(updatedCourse.id)
              ? { ...c, ...returned, duration: returned.duration || formattedDuration }
              : c
          )
        );
      } else {
        setCourses((prev) =>
          prev.map((c) => (String(c.id) === String(updatedCourse.id) ? { ...c, ...apiPayload } : c))
        );
      }
    } catch (error) {
      console.log("API update course simulation:", error);
      setCourses((prev) =>
        prev.map((c) => (String(c.id) === String(updatedCourse.id) ? { ...c, ...apiPayload } : c))
      );
    }
    showToast(`Updated course track details for ${updatedCourse.name}`, "success");
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setOpenDelete(true);
  };

  const handleDeleteCourse = async (id) => {
    try {
      await deleteCourse(id);
    } catch (error) {
      console.log("API delete course simulation:", error);
    }
    const target = courses.find((c) => String(c.id) === String(id));
    setCourses((prev) => prev.filter((c) => String(c.id) !== String(id)));
    showToast(`Deleted course track ${target?.name || ""}`, "info");
  };

  const handleExportExcel = () => {
    const exportData = filteredCourses.map((c) => ({
      ID: c.id,
      "Course Track Name": c.name,
      Duration: c.duration,
      "Fee (INR)": c.fees,
      Status: c.status,
    }));
    exportToExcel(exportData, "Course_Catalog");
    showToast("Exported Course Catalog to Excel Sheet!", "success");
  };

  const handleExportPDF = () => {
    const headers = ["ID", "Course Track Name", "Duration", "Fees", "Status"];
    const rows = filteredCourses.map((c) => [
      `#${c.id}`,
      c.name,
      c.duration,
      `₹${Number(c.fees || 0).toLocaleString()}`,
      c.status,
    ]);
    exportToPDF("Course Curriculum Catalog Report", headers, rows, "Course_Catalog_PDF");
    showToast("Exported PDF Report Sheet!", "success");
  };

  const filteredCourses = courses.filter((course) => {
    const text = search.toLowerCase();
    const courseName = course.name || course.courseName || "";
    const feeStr = String(course.fees || course.fee || "");

    return (
      courseName.toLowerCase().includes(text) ||
      (course.duration || "").toLowerCase().includes(text) ||
      feeStr.toLowerCase().includes(text)
    );
  });

  return (
    <Layout>
      {/* Header */}
      <PageHeader
        title="Course Curriculum Catalog"
        description="Manage course offerings, fee structures, and active track batches"
        categoryTag="Curriculum Catalog"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button onClick={handleExportExcel} variant="outline" size="sm" className="gap-1.5 border-[#e6dfd8] bg-[#faf9f5]">
              <FileSpreadsheet className="h-3.5 w-3.5 text-[#00754A]" /> Export Excel
            </Button>

            <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-1.5 border-[#e6dfd8] bg-[#faf9f5]">
              <Download className="h-3.5 w-3.5 text-[#cc785c]" /> Export PDF Sheet
            </Button>

            <Button
              onClick={() => setOpenAdd(true)}
              variant="primary"
              size="sm"
              className="shadow-xs gap-1.5 bg-[#cc785c] hover:bg-[#a9583e]"
            >
              <Plus className="h-3.5 w-3.5" /> Add New Course Track
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CourseStatsCard title="Total Courses" value={courses.length} />
        <CourseStatsCard
          title="Active Courses"
          value={courses.filter((c) => c.status === "Active").length}
        />
        <CourseStatsCard
          title="Inactive Courses"
          value={courses.filter((c) => c.status === "Inactive").length}
        />
      </div>

      {/* Table Container Card */}
      <Card className="bg-[#efe9de] border-[#e6dfd8]">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#8e8b82]" />
              <Input
                type="text"
                placeholder="Search course title, duration, or fees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-md bg-[#faf9f5] border-[#e6dfd8]"
              />
            </div>
            <Button variant="primary" className="bg-[#cc785c] hover:bg-[#a9583e] text-white shrink-0 gap-1.5">
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>

          <CourseTable
            courses={filteredCourses}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddCourseDialog
        open={openAdd}
        setOpen={setOpenAdd}
        onCourseAdded={handleAddCourse}
      />

      <EditCourseDialog
        open={openEdit}
        setOpen={setOpenEdit}
        courseData={courseToEdit}
        onCourseUpdated={handleUpdateCourse}
      />

      <DeleteCourseDialog
        open={openDelete}
        setOpen={setOpenDelete}
        course={courseToDelete}
        onDelete={handleDeleteCourse}
      />
    </Layout>
  );
}

export default Courses;