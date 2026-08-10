import { useState } from "react";
import CourseForm from "./CourseForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";

function AddCourseDialog({ open, setOpen, onCourseAdded }) {
  const [course, setCourse] = useState({
    name: "",
    duration: "",
    fees: "",
    status: "Active",
  });

  const handleSave = (e) => {
    e.preventDefault();

    if (!course.name || !course.duration || !course.fees) {
      alert("Please fill all required course fields (Title, Duration, Fees)");
      return;
    }

    // Convert fees and duration to numeric formats expected by Spring Boot Java entity (@Valid)
    const numFees = Number(String(course.fees).replace(/[^0-9]/g, "")) || 0;
    const numDuration = Number(String(course.duration).replace(/[^0-9]/g, "")) || 4;

    const payload = {
      courseName: course.name,
      name: course.name,
      duration: numDuration, // Integer type for Spring Boot entity (e.g. 4)
      durationText: `${numDuration} Months`,
      fee: numFees, // Double type for Spring Boot entity
      fees: numFees,
      status: course.status || "Active",
    };

    if (onCourseAdded) {
      onCourseAdded(payload);
    }

    setCourse({
      name: "",
      duration: "",
      fees: "",
      status: "Active",
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>Create New Course Track</DialogTitle>
          <DialogDescription>
            Add a new training course curriculum to the academy database.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
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
              Save Course Track
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddCourseDialog;
