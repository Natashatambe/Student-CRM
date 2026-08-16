import React from "react";
import { TableRow, TableCell } from "../ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Pencil, Trash2, Mail, Phone, MapPin, Sparkles, GraduationCap, Calendar, Eye } from "lucide-react";
import { normalizeStatus } from "../../lib/utils";

function StudentRow({ student, index, onEdit, onDelete, onView, onStatusChange }) {
  const displayName =
    student.name ||
    `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
    "Student Partner";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const dicebearAvatar = `https://api.dicebear.com/10.x/glyphs/svg?seed=${encodeURIComponent(
    displayName
  )}`;

  const formattedStudentId = student.formattedId || `STU-${101 + index}`;
  const currentStatus = normalizeStatus(student.status);

  const admissionData =
    student.admission ||
    (student.admissionId || student.totalFee || currentStatus === "Active"
      ? {
          admissionId: student.admissionId || student.id || student.studentId,
          admissionDate: student.admissionDate,
          totalFee: student.totalFee || student.fees || 50000,
          paymentStatus: student.paymentStatus || "Pending",
          paymentType: student.paymentType || "Full",
        }
      : null);

  const hasAdmission = Boolean(
    admissionData || currentStatus === "Active"
  );
  const admIdStr = hasAdmission ? `#${101 + index}` : null;
  const admDateStr = hasAdmission
    ? admissionData?.admissionDate || student.admissionDate || student.admission?.admissionDate || "Enrolled"
    : null;
  const feeNum = hasAdmission
    ? Number(admissionData?.totalFee || student.totalFee || student.fees || 50000)
    : 0;
  const payStatus = hasAdmission
    ? (student.paymentStatus || admissionData?.paymentStatus || student.admission?.paymentStatus || (student.paymentType === "EMI" ? "Partial" : (currentStatus === "Active" ? "Paid" : "Pending")))
    : null;

  const currentCourseName = student.course || student.courseName || "Java Full Stack";
  const currentStatus = normalizeStatus(student.status);

  return (
    <TableRow className="hover:bg-[#efe9de]/50 transition-colors group">
      {/* Sequencewise ID */}
      <TableCell className="font-mono text-xs font-bold text-[#cc785c] py-3.5 px-3 align-top whitespace-nowrap">
        {formattedStudentId}
      </TableCell>

      {/* Student Partner & Contact Info */}
      <TableCell className="py-3.5 px-3 align-top">
        <div className="flex items-start gap-2.5">
          <Avatar className="h-8 w-8 ring-1 ring-[#cc785c]/40 bg-[#efe9de] shrink-0 mt-0.5">
            <AvatarImage src={dicebearAvatar} alt={displayName} />
            <AvatarFallback className="bg-[#cc785c] text-white font-medium text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1">
            <h4
              onClick={() => onView && onView(student)}
              className="font-serif-display font-medium text-sm text-[#141413] hover:text-[#cc785c] cursor-pointer flex items-center gap-1 leading-snug truncate transition"
            >
              {displayName}
              {currentStatus === "Active" && (
                <Sparkles className="h-3 w-3 text-[#cc785c] fill-current shrink-0" />
              )}
            </h4>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#6c6a64]">
              {student.email && (
                <span className="flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3 text-[#cc785c] shrink-0" />
                  <span className="truncate max-w-[160px]">{student.email}</span>
                </span>
              )}
              {student.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-[#cc785c] shrink-0" />
                  {student.phone}
                </span>
              )}
              {student.gender && (
                <span className="text-[#8e8b82] font-semibold uppercase text-[10px]">
                  • {student.gender}
                </span>
              )}
            </div>
            {student.address && (
              <div className="flex items-center gap-1 text-[11px] text-[#8e8b82] truncate">
                <MapPin className="h-3 w-3 text-[#cc785c] shrink-0" />
                <span className="truncate max-w-[220px]">{student.address}</span>
              </div>
            )}
          </div>
        </div>
      </TableCell>

      {/* Course Track */}
      <TableCell className="font-medium text-[#141413] text-xs py-3.5 px-3 align-top whitespace-nowrap">
        <div className="inline-flex items-center gap-1.5 bg-[#efe9de] text-[#141413] px-2.5 py-1 rounded-md text-[11px] font-semibold border border-[#e6dfd8] shadow-xs">
          <GraduationCap className="h-3.5 w-3.5 text-[#cc785c]" />
          <span>{currentCourseName}</span>
        </div>
      </TableCell>

      {/* Admission Data */}
      <TableCell className="py-3.5 px-3 align-top">
        {hasAdmission ? (
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-[#cc785c] text-[11px] bg-[#faf9f5] border border-[#e6dfd8] px-1.5 py-0.5 rounded">
                {admIdStr}
              </span>
              <span className="font-serif-display font-bold text-[#141413]">
                ₹{feeNum.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge
                variant={
                  payStatus.toLowerCase() === "paid" || payStatus.toLowerCase() === "completed"
                    ? "success"
                    : payStatus.toLowerCase() === "partial"
                    ? "amber"
                    : "destructive"
                }
                className="text-[10px] px-1.5 py-0"
              >
                Fee {payStatus}
              </Badge>
              <span className="text-[10px] font-mono text-[#6c6a64] flex items-center gap-1 bg-[#efe9de] px-1.5 py-0.5 rounded border border-[#e6dfd8]">
                <Calendar className="h-3 w-3 text-[#cc785c] shrink-0" />
                {admDateStr}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-[#8e8b82] italic">
            Enquiry Prospect (No Admission Yet)
          </div>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right py-3.5 px-3 align-top whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          {onView && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onView(student)}
              title="View Partner Details"
              className="h-7 px-2 rounded-lg text-xs font-semibold text-[#141413] bg-[#efe9de] hover:bg-[#e6dfd8] transition cursor-pointer gap-1 shadow-xs border border-[#e6dfd8]"
            >
              <Eye className="h-3.5 w-3.5 text-[#cc785c]" />
              <span className="hidden sm:inline">View</span>
            </Button>
          )}
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(student)}
              title="Edit Partner Record"
              className="h-7 px-2 rounded-lg text-xs font-semibold text-[#cc785c] bg-[#efe9de] hover:bg-[#a9583e] hover:text-white transition cursor-pointer gap-1 shadow-xs border border-[#e6dfd8]"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(student)}
              title="Delete Partner Record"
              className="h-7 px-2 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition cursor-pointer gap-1 shadow-xs border border-red-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export default StudentRow;
