import { useState, useEffect } from "react";
import CourseForm from "./CourseForm";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../ui/sheet";
import { Button } from "../ui/button";
import { BookOpen, Sparkles } from "lucide-react";

function EditCourseDialog({
  open,
  setOpen,
  courseData,
  onCourseUpdated,
}) {
  const [course, setCourse] = useState({
    id: "",
    name: "",
    duration: "",
    fees: "",
    status: "Active",
  });

  useEffect(() => {
    if (courseData) {
      setCourse({
        ...courseData,
        name: courseData.name || courseData.courseName || "",
        fees: courseData.fees !== undefined ? courseData.fees : courseData.fee || "",
        duration: courseData.duration || "",
      });
    }
  }, [courseData]);

  const handleUpdate = (e) => {
    e.preventDefault();

    const numFees = Number(String(course.fees).replace(/[^0-9]/g, "")) || 0;
    const rawDur = course.duration ? String(course.duration).trim() : "3 Months";
    const formattedDuration = /^\d+$/.test(rawDur) ? `${rawDur} Months` : rawDur;

    const payload = {
      ...course,
      courseName: course.name,
      name: course.name,
      duration: formattedDuration,
      fee: numFees,
      fees: numFees,
      status: course.status || "Active",
    };

    if (onCourseUpdated) {
      onCourseUpdated(payload);
    }
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="sm:max-w-md" onClose={() => setOpen(false)}>
        <SheetHeader>
          <SheetTitle>
            <BookOpen className="h-5 w-5 text-[#cc785c]" />
            Edit Course Track Details
            <Sparkles className="h-3.5 w-3.5 text-[#cc785c] fill-current" />
          </SheetTitle>
          <SheetDescription>
            Modify duration, fees, or status for {course.name || "course track"}.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleUpdate} className="flex flex-col flex-1 justify-between space-y-4 py-1">
          <CourseForm course={course} setCourse={setCourse} />

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
              Update Course Track
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default EditCourseDialog;