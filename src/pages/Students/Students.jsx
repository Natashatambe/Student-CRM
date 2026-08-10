import { useState, useEffect } from "react";
import Layout from "../../Components/layout/Layout";
import StudentTable from "../../Components/students/StudentTable";
import AddStudentDialog from "../../Components/students/AddStudentDialog";
import EditStudentDialog from "../../Components/students/EditStudentDialog";
import DeleteStudentDialog from "../../Components/students/DeleteStudentDialog";
import StudentStatsCard from "../../Components/students/StudentStatsCard";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Card, CardContent } from "../../Components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../Components/ui/tabs";
import { useToast } from "../../Components/ui/toast";
import { Plus, Search } from "lucide-react";
import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from "../../services/studentService";

function Students() {
  const { showToast } = useToast();

  const [students, setStudents] = useState([
    {
      id: 1,
      firstName: "Natasha",
      lastName: "Tambe",
      name: "Natasha Tambe",
      email: "natasha@gmail.com",
      phone: "9876543210",
      address: "123 Park Street, Mumbai",
      gender: "Female",
      course: "Java Full Stack",
      status: "Active",
    },
    {
      id: 2,
      firstName: "Rahul",
      lastName: "Sharma",
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "9876543211",
      address: "45 MG Road, Delhi",
      gender: "Male",
      course: "Python Masterclass",
      status: "Active",
    },
    {
      id: 3,
      firstName: "Priya",
      lastName: "Patel",
      name: "Priya Patel",
      email: "priya@gmail.com",
      phone: "9876543212",
      address: "88 Ring Road, Ahmedabad",
      gender: "Female",
      course: "React JS Track",
      status: "Pending",
    },
    {
      id: 4,
      firstName: "Jonny",
      lastName: "Jon",
      name: "Jonny Jon",
      email: "jonnyjon@gmail.com",
      phone: "4567876543",
      address: "123 Main St, New York",
      gender: "Male",
      course: "Java Full Stack",
      status: "Active",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadStudentsFromBackend = async () => {
    try {
      setLoading(true);
      const res = await getStudents();
      if (res && res.data) {
        let list = [];
        if (Array.isArray(res.data)) list = res.data;
        else if (Array.isArray(res.data.data)) list = res.data.data;
        if (list.length > 0) {
          const mapped = list.map((s) => ({
            id: s.id || s.studentId,
            firstName: s.firstName || (s.name ? s.name.split(" ")[0] : ""),
            lastName: s.lastName || (s.name ? s.name.split(" ").slice(1).join(" ") : ""),
            name: s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim(),
            email: s.email || "",
            phone: s.phone || s.phoneNumber || "",
            address: s.address || "Main City",
            gender: s.gender || "Male",
            course: s.course || s.enrolledCourse || "General",
            status: s.status || "Active",
          }));
          setStudents(mapped);
        }
      }
    } catch (error) {
      console.log("Students API loaded with fallback data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentsFromBackend();
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
      status: newStudent.status,
    };

    try {
      const res = await addStudent(payload);
      const created = res?.data || payload;
      const student = {
        ...created,
        id: created.id || created.studentId || (students.length > 0 ? Math.max(...students.map((s) => s.id)) + 1 : 1),
      };
      setStudents([student, ...students]);
      showToast(`Registered student partner ${student.firstName} ${student.lastName}!`, "success");
    } catch (error) {
      console.log("API add student simulation:", error);
      const student = {
        ...payload,
        id: students.length > 0 ? Math.max(...students.map((s) => s.id)) + 1 : 1,
      };
      setStudents([student, ...students]);
      showToast(`Registered student partner ${student.firstName} ${student.lastName}!`, "success");
    }
  };

  const handleEdit = (student) => {
    setStudentToEdit(student);
    setOpenEdit(true);
  };

  const handleUpdateStudent = async (updatedStudent) => {
    const payload = {
      firstName: updatedStudent.firstName,
      lastName: updatedStudent.lastName,
      name: `${updatedStudent.firstName} ${updatedStudent.lastName}`.trim(),
      email: updatedStudent.email,
      phone: updatedStudent.phone,
      address: updatedStudent.address,
      gender: updatedStudent.gender,
      course: updatedStudent.course,
      status: updatedStudent.status,
    };

    try {
      await updateStudent(updatedStudent.id, payload);
    } catch (error) {
      console.log("API update student simulation:", error);
    }
    setStudents(
      students.map((s) => (s.id === updatedStudent.id ? { ...s, ...payload } : s))
    );
    showToast(`Updated record for ${payload.firstName} ${payload.lastName}`, "success");
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setOpenDelete(true);
  };

  const handleDeleteStudent = async (id) => {
    try {
      await deleteStudent(id);
    } catch (error) {
      console.log("API delete student simulation:", error);
    }
    const target = students.find((s) => s.id === id);
    setStudents(students.filter((s) => s.id !== id));
    showToast(`Removed student ${target?.name || target?.firstName || ""}`, "info");
  };

  const filteredStudents = students.filter((student) => {
    const displayName = student.name || `${student.firstName || ""} ${student.lastName || ""}`;
    const matchesSearch =
      displayName.toLowerCase().includes(search.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (student.course || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || (student.status || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-normal text-[#141413] tracking-tight font-serif-display flex items-center gap-2">
            <span className="text-[#cc785c] font-bold text-2xl">✱</span>
            Student Partner Directory
          </h1>
          <p className="text-sm text-[#6c6a64] font-medium mt-1">
            Manage partner student records, enrollment tracks, and active status
          </p>
        </div>

        <Button
          onClick={() => setOpenAdd(true)}
          variant="primary"
          className="shadow-xs gap-2 bg-[#cc785c] hover:bg-[#a9583e]"
        >
          <Plus className="h-4 w-4" /> Enroll Student
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StudentStatsCard title="Total Students" value={students.length} />
        <StudentStatsCard
          title="Active Students"
          value={students.filter((s) => s.status === "Active").length}
        />
        <StudentStatsCard
          title="Pending Students"
          value={students.filter((s) => s.status === "Pending").length}
        />
      </div>

      {/* Table Container Card */}
      <Card className="bg-[#efe9de] border-[#e6dfd8]">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#8e8b82]" />
              <Input
                type="text"
                placeholder="Search by student name, email, or course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-md bg-[#faf9f5] border-[#e6dfd8]"
              />
            </div>

            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All ({students.length})</TabsTrigger>
                <TabsTrigger value="active">
                  Active ({students.filter((s) => s.status === "Active").length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({students.filter((s) => s.status === "Pending").length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <StudentTable
            students={filteredStudents}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
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