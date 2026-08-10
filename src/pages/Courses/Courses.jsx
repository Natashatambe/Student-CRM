import { useState, useEffect } from "react";
import Layout from "../../Components/layout/Layout";
import CourseTable from "../../Components/courses/CourseTable";
import CourseStatsCard from "../../Components/courses/CourseStatsCard";
import AddCourseDialog from "../../Components/courses/AddCourseDialog";
import EditCourseDialog from "../../Components/courses/EditCourseDialog";
import DeleteCourseDialog from "../../Components/courses/DeleteCourseDialog";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Card, CardContent } from "../../Components/ui/card";
import { useToast } from "../../Components/ui/toast";
import { Plus, Search } from "lucide-react";
import {
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
} from "../../services/courseService";

function Courses() {
  const { showToast } = useToast();

  const [courses, setCourses] = useState([
    {
      id: 1,
      name: "Java Full Stack",
      duration: "6 Months",
      fees: 50000,
      status: "Active",
    },
    {
      id: 2,
      name: "Python Masterclass",
      duration: "4 Months",
      fees: 35000,
      status: "Active",
    },
    {
      id: 3,
      name: "React JS Track",
      duration: "3 Months",
      fees: 30000,
      status: "Inactive",
    },
    {
      id: 4,
      name: "Data Science & AI",
      duration: "8 Months",
      fees: 65000,
      status: "Active",
    },
    {
      id: 5,
      name: "MERN STACK",
      duration: "4 months",
      fees: 40000,
      status: "Active",
    },
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
        if (list.length > 0) {
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
      }
    } catch (error) {
      console.log("Courses API loaded with fallback data:", error);
    }
  };

  useEffect(() => {
    loadCoursesFromBackend();
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
        id: created.id || created.courseId || (courses.length > 0 ? Math.max(...courses.map((c) => c.id || 0)) + 1 : 1),
      };
      setCourses([course, ...courses]);
      showToast(`Created course track ${course.name}!`, "success");
    } catch (error) {
      console.log("API add course simulation:", error);
      const course = {
        ...apiPayload,
        id: courses.length > 0 ? Math.max(...courses.map((c) => c.id || 0)) + 1 : 1,
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

    const apiPayload = {
      name: updatedCourse.name,
      courseName: updatedCourse.name,
      duration: updatedCourse.duration,
      fees: numFees,
      fee: numFees,
      status: updatedCourse.status || "Active",
    };

    try {
      await updateCourse(updatedCourse.id, apiPayload);
    } catch (error) {
      console.log("API update course simulation:", error);
    }
    setCourses(
      courses.map((c) => (c.id === updatedCourse.id ? { ...c, ...apiPayload } : c))
    );
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
    const target = courses.find((c) => c.id === id);
    setCourses(courses.filter((c) => c.id !== id));
    showToast(`Deleted course track ${target?.name || ""}`, "info");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-normal text-[#141413] tracking-tight font-serif-display flex items-center gap-2">
            <span className="text-[#cc785c] font-bold text-2xl">✱</span>
            Course Curriculum Catalog
          </h1>
          <p className="text-sm text-[#6c6a64] font-medium mt-1">
            Manage course offerings, fee structures, and active track batches
          </p>
        </div>

        <Button
          onClick={() => setOpenAdd(true)}
          variant="primary"
          className="shadow-xs gap-2 bg-[#cc785c] hover:bg-[#a9583e]"
        >
          <Plus className="h-4 w-4" /> Add New Course Track
        </Button>
      </div>

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
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#8e8b82]" />
            <Input
              type="text"
              placeholder="Search course title, duration, or fees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-md bg-[#faf9f5] border-[#e6dfd8]"
            />
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