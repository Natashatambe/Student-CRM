import { useState, useEffect } from "react";
import CourseForm from "./CourseForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";

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
    const numDuration = Number(String(course.duration).replace(/[^0-9]/g, "")) || 4;

    const payload = {
      ...course,
      courseName: course.name,
      name: course.name,
      duration: numDuration,
      durationText: `${numDuration} Months`,
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>Edit Course Track Details</DialogTitle>
          <DialogDescription>
            Modify duration, fees, or status for {course.name || "course"}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="flex flex-col flex-1 overflow-hidden">
          <DialogBody>
            <CourseForm course={course} setCourse={setCourse} />
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="shadow-md">
              Update Course Track
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditCourseDialog;