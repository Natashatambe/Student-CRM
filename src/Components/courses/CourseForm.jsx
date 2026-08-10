import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { BookOpen, Clock, DollarSign, CheckCircle } from "lucide-react";

function CourseForm({ course, setCourse }) {
  const handleChange = (e) => {
    setCourse({
      ...course,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Course Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#141413] flex items-center gap-1.5 uppercase tracking-wider">
          <BookOpen className="h-3.5 w-3.5 text-[#cc785c]" />
          Course Name Track
        </label>
        <Input
          type="text"
          name="name"
          placeholder="e.g. Java Full Stack"
          value={course.name || ""}
          onChange={handleChange}
        />
      </div>

      {/* Duration */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#141413] flex items-center gap-1.5 uppercase tracking-wider">
          <Clock className="h-3.5 w-3.5 text-[#cc785c]" />
          Course Duration
        </label>
        <Input
          type="text"
          name="duration"
          placeholder="e.g. 6 Months"
          value={course.duration || ""}
          onChange={handleChange}
        />
      </div>

      {/* Fees */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#141413] flex items-center gap-1.5 uppercase tracking-wider">
          <DollarSign className="h-3.5 w-3.5 text-[#cc785c]" />
          Course Fees (INR)
        </label>
        <Input
          type="text"
          name="fees"
          placeholder="e.g. ₹50,000"
          value={course.fees || ""}
          onChange={handleChange}
        />
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#141413] flex items-center gap-1.5 uppercase tracking-wider">
          <CheckCircle className="h-3.5 w-3.5 text-[#cc785c]" />
          Course Status
        </label>
        <Select
          name="status"
          value={course.status || "Active"}
          onChange={handleChange}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </Select>
      </div>
    </div>
  );
}

export default CourseForm;
