import { useState } from "react";
import CourseForm from "./CourseForm";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../ui/sheet";
import { Button } from "../ui/button";
import { BookOpen, Sparkles } from "lucide-react";

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

    const numFees = Number(String(course.fees).replace(/[^0-9]/g, "")) || 0;
    const numDuration = Number(String(course.duration).replace(/[^0-9]/g, "")) || 4;

    const payload = {
      courseName: course.name,
      name: course.name,
      duration: numDuration,
      durationText: `${numDuration} Months`,
      fee: numFees,
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="sm:max-w-md" onClose={() => setOpen(false)}>
        <SheetHeader>
          <SheetTitle>
            <BookOpen className="h-5 w-5 text-[#cc785c]" />
            Create New Course Track
            <Sparkles className="h-3.5 w-3.5 text-[#cc785c] fill-current" />
          </SheetTitle>
          <SheetDescription>
            Add a new training course curriculum offering to the academy database.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSave} className="flex flex-col flex-1 justify-between py-1">
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
              Save Course Track
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default AddCourseDialog;
