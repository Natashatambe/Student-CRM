import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { User, Mail, Phone, GraduationCap, CheckCircle, MapPin, Users } from "lucide-react";

function StudentForm({ student, setStudent }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-4">
      {/* First Name & Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#141413] flex items-center gap-1.5 uppercase tracking-wider">
            <User className="h-3.5 w-3.5 text-[#cc785c]" />
            First Name *
          </label>
          <Input
            type="text"
            name="firstName"
            placeholder="e.g. Jonny"
            value={student.firstName || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#141413] flex items-center gap-1.5 uppercase tracking-wider">
            <User className="h-3.5 w-3.5 text-[#cc785c]" />
            Last Name *
          </label>
          <Input
            type="text"
            name="lastName"
            placeholder="e.g. Jon"
            value={student.lastName || ""}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#141413] flex items-center gap-1.5 uppercase tracking-wider">
            <Mail className="h-3.5 w-3.5 text-[#cc785c]" />
            Email Address
          </label>
          <Input
            type="email"
            name="email"
            placeholder="e.g. jonnyjon@gmail.com"
            value={student.email || ""}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#141413] flex items-center gap-1.5 uppercase tracking-wider">
            <Phone className="h-3.5 w-3.5 text-[#cc785c]" />
            Phone Number
          </label>
          <Input
            type="text"
            name="phone"
            placeholder="e.g. 4567876543"
            value={student.phone || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Gender & Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#141413] flex items-center gap-1.5 uppercase tracking-wider">
            <Users className="h-3.5 w-3.5 text-[#cc785c]" />
            Gender *
          </label>
          <Select
            name="gender"
            value={student.gender || "Male"}
            onChange={handleChange}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#141413] flex items-center gap-1.5 uppercase tracking-wider">
            <MapPin className="h-3.5 w-3.5 text-[#cc785c]" />
            Address *
          </label>
          <Input
            type="text"
            name="address"
            placeholder="e.g. 123 Main St, New York"
            value={student.address || ""}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Enrolled Course & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#141413] flex items-center gap-1.5 uppercase tracking-wider">
            <GraduationCap className="h-3.5 w-3.5 text-[#cc785c]" />
            Enrolled Course Track
          </label>
          <Input
            type="text"
            name="course"
            placeholder="e.g. Java Full Stack"
            value={student.course || ""}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#141413] flex items-center gap-1.5 uppercase tracking-wider">
            <CheckCircle className="h-3.5 w-3.5 text-[#cc785c]" />
            Enrollment Status
          </label>
          <Select
            name="status"
            value={student.status || "Active"}
            onChange={handleChange}
          >
            <option value="Active">Active (Enrolled)</option>
            <option value="Pending">Pending Approval</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </div>
      </div>
    </div>
  );
}

export default StudentForm;