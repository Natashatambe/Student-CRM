import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { User, Mail, Phone, GraduationCap, CheckCircle, MapPin, Users, Sparkles, CreditCard, DollarSign } from "lucide-react";
import { getCourses } from "../../services/courseService";

import { normalizeStatus } from "../../lib/utils";

const DEFAULT_COURSES = [
  { id: 1, name: "Java Full Stack", duration: "6 Months", fees: 45000, instructor: "Instructor" },
  { id: 2, name: "MERN STACK", duration: "3 Months", fees: 40000, instructor: "Instructor" },
  { id: 3, name: "Python Masterclass", duration: "4 Months", fees: 45000, instructor: "Dr. Deshmukh" },
  { id: 4, name: "Node.js & Express Masterclass", duration: "5 Months", fees: 42000, instructor: "Instructor" },
  { id: 5, name: "Data ANALYST", duration: "3 Months", fees: 35000, instructor: "Instructor" },
  { id: 6, name: "React JS Track", duration: "3 Months", fees: 30000, instructor: "Instructor" },
];

function StudentForm({ student, setStudent }) {
  const [courses, setCourses] = useState(DEFAULT_COURSES);

  useEffect(() => {
    loadCourseSuggestions();
  }, []);

  const loadCourseSuggestions = async () => {
    try {
      const res = await getCourses();
      if (res && res.data) {
        let list = [];
        if (Array.isArray(res.data)) list = res.data;
        else if (Array.isArray(res.data.data)) list = res.data.data;
        if (list.length > 0) {
          const mapped = list.map((c) => ({
            id: c.id || c.courseId,
            name: c.name || c.courseName || "Course Track",
            duration: c.duration || "3 Months",
            fees: Number(c.fees ?? c.fee ?? 0),
          }));
          setCourses(mapped);
          return;
        }
      }
    } catch (err) {
      // Quietly fallback to default courses list
    }
    setCourses(DEFAULT_COURSES);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "status") {
      const normStatus = normalizeStatus(value);
      setStudent((prev) => {
        const feeVal = Number(prev.totalFee || prev.fees || 50000);
        const pType = prev.paymentType || "Full";
        const eTenure = Number(prev.emiTenure || 3);
        return {
          ...prev,
          status: normStatus,
          totalFee: feeVal,
          fees: feeVal,
          paymentType: pType,
          paymentStatus: prev.paymentStatus || (pType === "EMI" ? "Partial" : "Paid"),
          emiTenure: pType === "EMI" ? eTenure : null,
          emiMonthlyAmount: pType === "EMI" ? Math.round(feeVal / eTenure) : null,
        };
      });
    } else if (name === "course") {
      const found = courses.find((c) => c.name === value);
      const feeVal = found ? found.fees : 50000;
      setStudent((prev) => ({
        ...prev,
        course: value,
        fees: feeVal,
        totalFee: feeVal,
        emiMonthlyAmount: prev.paymentType === "EMI" ? Math.round(feeVal / (prev.emiTenure || 3)) : null,
      }));
    } else {
      setStudent((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const selectedCourseObj = student.course ? courses.find((c) => c.name === student.course) : null;

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
            placeholder="e.g. Ive"
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
            Email Address *
          </label>
          <Input
            type="email"
            name="email"
            placeholder="e.g. jonny@apple.com"
            value={student.email || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#141413] flex items-center gap-1.5 uppercase tracking-wider">
            <Phone className="h-3.5 w-3.5 text-[#cc785c]" />
            Phone Number *
          </label>
          <Input
            type="text"
            name="phone"
            placeholder="e.g. 9876543210"
            value={student.phone || ""}
            onChange={handleChange}
            required
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
            Select Course Track *
          </label>
          <Select
            name="course"
            value={student.course || ""}
            onChange={handleChange}
          >
            <option value="">-- Choose Available Course Offering --</option>
            {courses.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name} ({c.duration} - ₹{Number(c.fees || 0).toLocaleString()})
              </option>
            ))}
          </Select>

          {selectedCourseObj && (
            <div className="text-[11px] font-bold text-[#006241] bg-[#d4e9e2]/50 p-2 rounded-md flex items-center justify-between mt-1">
              <span>Duration: {selectedCourseObj.duration}</span>
              <span>Course Fee: ₹{Number(selectedCourseObj.fees || 0).toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#141413] flex items-center gap-1.5 uppercase tracking-wider">
            <CheckCircle className="h-3.5 w-3.5 text-[#cc785c]" />
            Enrollment Status *
          </label>
          <Select
            name="status"
            value={normalizeStatus(student.status)}
            onChange={handleChange}
          >
            <option value="Active">Active (Confirmed Admission ➔ Auto-adds to Admissions Desk)</option>
            <option value="Pending">Pending Approval (On Hold)</option>
            <option value="Enquiry">Enquiry (Prospect / On Hold)</option>
            <option value="Inactive">Inactive</option>
          </Select>

          {/* Dynamic Status Indicator Banners */}
          {normalizeStatus(student.status) === "Active" && (
            <div className="text-[11px] font-medium text-[#006241] bg-[#d4e9e2] p-2 rounded-md border border-[#a3d9c9] flex items-center gap-1.5 mt-1">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#00754A]" />
              <span><strong>Active Status:</strong> Student is active and will be dynamically registered on the Admissions Desk!</span>
            </div>
          )}
          {normalizeStatus(student.status) === "Pending" && (
            <div className="text-[11px] font-medium text-[#8a6d3b] bg-[#fcf8e3] p-2 rounded-md border border-[#faebcc] flex items-center gap-1.5 mt-1">
              <span><strong>Pending Approval:</strong> Admission on hold until status is changed to Active.</span>
            </div>
          )}
          {normalizeStatus(student.status) === "Enquiry" && (
            <div className="text-[11px] font-medium text-[#31708f] bg-[#d9edf7] p-2 rounded-md border border-[#bce8f1] flex items-center gap-1.5 mt-1">
              <span><strong>Enquiry Prospect:</strong> Preliminary lead. Change to Active when student confirms enrollment.</span>
            </div>
          )}
          {normalizeStatus(student.status) === "Inactive" && (
            <div className="text-[11px] font-medium text-[#a94442] bg-[#f2dede] p-2 rounded-md border border-[#ebccd1] flex items-center gap-1.5 mt-1">
              <span><strong>Inactive:</strong> Student partner is deactivated.</span>
            </div>
          )}
        </div>
      </div>

      {/* Fee & EMI Payment Structure options when status is Active */}
      {normalizeStatus(student.status) === "Active" && (
        <div className="bg-[#faf6ee] border border-[#cba258] rounded-xl p-4 space-y-3 mt-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1E3932] uppercase tracking-wider">
            <CreditCard className="h-4 w-4 text-[#cc785c]" />
            <span>Fee Payment & EMI Structure (Admissions Desk Setup)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Total Fee */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#141413]">Total Course Fee (INR)</label>
              <Input
                type="number"
                name="totalFee"
                value={student.totalFee || student.fees || 50000}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setStudent((prev) => ({
                    ...prev,
                    totalFee: val,
                    fees: val,
                    emiMonthlyAmount: prev.paymentType === "EMI" ? Math.round(val / (prev.emiTenure || 3)) : null,
                  }));
                }}
                placeholder="e.g. 50000"
                className="bg-white"
              />
            </div>

            {/* Payment Type: Full vs EMI */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#141413]">Payment Plan</label>
              <Select
                name="paymentType"
                value={student.paymentType || "Full"}
                onChange={(e) => {
                  const val = e.target.value;
                  const fee = Number(student.totalFee || student.fees || 50000);
                  const tenure = Number(student.emiTenure || 3);
                  setStudent((prev) => ({
                    ...prev,
                    paymentType: val,
                    paymentStatus: val === "Full" ? "Paid" : "Partial",
                    emiTenure: val === "EMI" ? tenure : null,
                    emiMonthlyAmount: val === "EMI" ? Math.round(fee / tenure) : null,
                  }));
                }}
                className="bg-white"
              >
                <option value="Full">Full One-Time Payment (Paid)</option>
                <option value="EMI">EMI Monthly Installment Plan (Partial)</option>
              </Select>
            </div>

            {/* EMI Tenure (if EMI selected) */}
            {student.paymentType === "EMI" ? (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#141413]">EMI Tenure (Months)</label>
                <Select
                  name="emiTenure"
                  value={student.emiTenure || 3}
                  onChange={(e) => {
                    const tenure = Number(e.target.value);
                    const fee = Number(student.totalFee || student.fees || 50000);
                    setStudent((prev) => ({
                      ...prev,
                      emiTenure: tenure,
                      emiMonthlyAmount: Math.round(fee / tenure),
                    }));
                  }}
                  className="bg-white"
                >
                  <option value={3}>3 Months Installments</option>
                  <option value={4}>4 Months Installments</option>
                  <option value={6}>6 Months Installments</option>
                  <option value={12}>12 Months Installments</option>
                </Select>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#141413]">Payment Status</label>
                <Select
                  name="paymentStatus"
                  value={student.paymentStatus || "Paid"}
                  onChange={(e) => setStudent((prev) => ({ ...prev, paymentStatus: e.target.value }))}
                  className="bg-white"
                >
                  <option value="Paid">Fee Paid in Full</option>
                  <option value="Pending">Fee Pending</option>
                </Select>
              </div>
            )}
          </div>

          {student.paymentType === "EMI" && (
            <div className="bg-[#efe9de] p-2.5 rounded-lg text-xs flex items-center justify-between text-[#141413] font-medium border border-[#e6dfd8]">
              <span>Monthly EMI Amount: <strong className="text-[#cc785c]">₹{Number(student.emiMonthlyAmount || Math.round((student.totalFee || 50000) / (student.emiTenure || 3))).toLocaleString()} / month</strong></span>
              <span>Installments: <strong>{student.emiTenure || 3} Months</strong></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentForm;