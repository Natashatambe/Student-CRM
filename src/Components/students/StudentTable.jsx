import React, { useState, useEffect, useRef } from "react";
import {
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  GraduationCap,
  Calendar,
  ChevronDown,
  Check,
  Eye,
  CreditCard,
  Building,
} from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { cn, normalizeStatus } from "../../lib/utils";
import StatusBadge from "../common/StatusBadge";

const formatDateWithSpace = (rawDate) => {
  if (!rawDate) return "N/A";
  const str = String(rawDate).trim();
  if (str.includes("T") || str.includes(" ")) {
    const parts = str.split(/[T ]/);
    const datePart = parts[0];
    let timePart = parts[1] ? parts[1].slice(0, 5) : "";
    if (timePart) {
      return `${datePart}   •   ${timePart}`;
    }
    return datePart;
  }
  return str;
};

const StatusBadgeButton = ({ status, onSelect }) => {
  const currentStatus = normalizeStatus(status);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusStyles = (st) => {
    switch (st) {
      case "Active":
        return "bg-[#d4e9e2] text-[#00754A] border-[#a3d9c9] hover:bg-[#b8e2d4]";
      case "Pending":
        return "bg-[#efe9de] text-[#cc785c] border-[#e6dfd8] hover:bg-[#e8e0d2]";
      case "Enquiry":
        return "bg-[#faf9f5] text-[#141413] border-[#e6dfd8] hover:bg-[#efe9de]";
      default:
        return "bg-[#fde8e8] text-[#c64545] border-[#fbd5d5] hover:bg-[#fbd5d5]";
    }
  };

  const getDotColor = (st) => {
    switch (st) {
      case "Active":
        return "bg-[#00754A]";
      case "Pending":
        return "bg-[#cc785c]";
      case "Enquiry":
        return "bg-[#141413]";
      default:
        return "bg-[#c64545]";
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border transition-all duration-150 shadow-xs cursor-pointer select-none active:scale-95",
          getStatusStyles(currentStatus)
        )}
        title="Click to change partner status"
      >
        <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", getDotColor(currentStatus))} />
        <span>{currentStatus}</span>
        <ChevronDown className="h-3 w-3 opacity-70 shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 z-50 min-w-[140px] rounded-xl bg-[#faf9f5] border border-[#e6dfd8] p-1.5 shadow-xl animate-in fade-in-80 zoom-in-95">
          {[
            { label: "Active", desc: "Enrolled & Active" },
            { label: "Pending", desc: "On Hold Approval" },
            { label: "Enquiry", desc: "Lead Prospect" },
            { label: "Inactive", desc: "Deactivated" },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                onSelect(item.label);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between hover:bg-[#efe9de] transition cursor-pointer",
                currentStatus === item.label ? "bg-[#efe9de] text-[#cc785c]" : "text-[#141413]"
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className={cn("h-1.5 w-1.5 rounded-full", getDotColor(item.label))} />
                <span>{item.label}</span>
              </div>
              {currentStatus === item.label && <Check className="h-3.5 w-3.5 text-[#cc785c]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

function StudentTable({ students = [], onEdit, onDelete, onView, onStatusChange }) {
  if (students.length === 0) {
    return (
      <div className="w-full rounded-xl border border-[#e6dfd8] bg-[#faf9f5] p-12 text-center text-[#6c6a64] font-medium">
        No student records found matching your search.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* MOBILE CARD VIEW (< 768px) */}
      <div className="block md:hidden space-y-3">
        {students.map((student, index) => {
          const displayName = student.name
            ? student.name
            : `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Student Partner";

          const initials = displayName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          const dicebearAvatar = `https://api.dicebear.com/10.x/glyphs/svg?seed=${encodeURIComponent(displayName)}`;
          const formattedStudentId = student.formattedId || `STU-${101 + index}`;
          const currentCourseName = student.course || student.courseName || "Java Full Stack";
          const currentStatus = normalizeStatus(student.status);

          const feeVal = Number(student.totalFee || student.fees || 0);

          return (
            <div
              key={student.id || index}
              className="bg-[#faf9f5] border border-[#e6dfd8] rounded-xl p-4 space-y-3 shadow-xs hover:border-[#cc785c]/50 transition"
            >
              {/* Header: Avatar, Name, ID & Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-1 ring-[#cc785c]/40 bg-[#efe9de] shrink-0">
                    <AvatarImage src={dicebearAvatar} alt={displayName} />
                    <AvatarFallback className="bg-[#cc785c] text-white font-bold text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4
                      onClick={() => onView && onView(student)}
                      className="font-serif-display font-bold text-base text-[#141413] hover:text-[#cc785c] cursor-pointer flex items-center gap-1"
                    >
                      {displayName}
                      {currentStatus === "Active" && (
                        <Sparkles className="h-3.5 w-3.5 text-[#cc785c] fill-current shrink-0" />
                      )}
                    </h4>
                    <span className="font-mono text-xs font-bold text-[#cc785c]">
                      {formattedStudentId}
                    </span>
                  </div>
                </div>

                <StatusBadgeButton
                  status={currentStatus}
                  onSelect={(newStatus) => {
                    if (onStatusChange) onStatusChange(student, newStatus);
                    else if (onEdit) onEdit({ ...student, status: newStatus });
                  }}
                />
              </div>

              {/* Course & Fee Banner */}
              <div className="flex items-center justify-between gap-2 bg-[#efe9de] p-2.5 rounded-lg border border-[#e6dfd8] text-xs">
                <div className="flex items-center gap-1.5 text-[#141413] font-semibold">
                  <GraduationCap className="h-4 w-4 text-[#cc785c]" />
                  <span>{currentCourseName}</span>
                </div>
                {feeVal > 0 && (
                  <span className="font-serif-display font-bold text-[#141413] bg-[#faf9f5] px-2 py-0.5 rounded border border-[#e6dfd8]">
                    ₹{feeVal.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#6c6a64]">
                {student.email && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-[#cc785c] shrink-0" />
                    <span className="truncate">{student.email}</span>
                  </div>
                )}
                {student.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#cc785c] shrink-0" />
                    <span>{student.phone}</span>
                  </div>
                )}
                {student.address && (
                  <div className="flex items-center gap-1.5 truncate col-span-full">
                    <MapPin className="h-3.5 w-3.5 text-[#cc785c] shrink-0" />
                    <span className="truncate">{student.address}</span>
                  </div>
                )}
              </div>

              {/* Card Actions Footer */}
              <div className="pt-2 border-t border-[#e6dfd8] flex items-center justify-end gap-2">
                {onView && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onView(student)}
                    className="h-8 px-3 text-xs gap-1 border-[#e6dfd8] bg-[#faf9f5]"
                  >
                    <Eye className="h-3.5 w-3.5 text-[#cc785c]" /> View
                  </Button>
                )}
                {onEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(student)}
                    className="h-8 px-3 text-xs gap-1 border-[#e6dfd8] bg-[#faf9f5] text-[#cc785c]"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(student)}
                    className="h-8 px-3 text-xs gap-1 border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP TABLE VIEW (>= 768px) */}
      <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-[#e6dfd8] bg-[#faf9f5] shadow-xs">
        <Table className="w-full text-xs">
          <TableHeader>
            <TableRow className="bg-[#efe9de] text-[#141413]">
              <TableHead className="w-24 font-bold">STU ID</TableHead>
              <TableHead className="font-bold">Student Partner & Contact</TableHead>
              <TableHead className="font-bold">Course Track</TableHead>
              <TableHead className="font-bold">Admission & Fee Data</TableHead>
              <TableHead className="w-28 font-bold text-center">Status</TableHead>
              <TableHead className="w-32 text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {students.map((student, index) => {
              const displayName = student.name
                ? student.name
                : `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Student Partner";

              const initials = displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              const dicebearAvatar = `https://api.dicebear.com/10.x/glyphs/svg?seed=${encodeURIComponent(displayName)}`;
              const formattedStudentId = student.formattedId || `STU-${101 + index}`;

              const currentStatus = normalizeStatus(student.status);

              const admissionData = student.admission || (student.admissionId || student.totalFee || currentStatus === "Active" ? {
                admissionId: student.admissionId || student.id || student.studentId,
                admissionDate: student.admissionDate,
                totalFee: student.totalFee || student.fees || 50000,
                paymentStatus: student.paymentStatus || "Pending",
                paymentType: student.paymentType || "Full",
              } : null);

              const hasAdmission = Boolean(admissionData || currentStatus === "Active");
              const admIdStr = hasAdmission ? `#${101 + index}` : null;
              const admDateStr = hasAdmission ? (admissionData?.admissionDate || student.admissionDate || student.admission?.admissionDate || "Enrolled") : null;
              const feeNum = hasAdmission ? Number(admissionData?.totalFee || student.totalFee || student.fees || 50000) : 0;
              const payStatus = hasAdmission ? (student.paymentStatus || admissionData?.paymentStatus || student.admission?.paymentStatus || (student.paymentType === "EMI" ? "Partial" : (currentStatus === "Active" ? "Paid" : "Pending"))) : null;
              const currentCourseName = student.course || student.courseName || "Java Full Stack";

              return (
                <TableRow key={student.id || index} className="hover:bg-[#efe9de]/50 transition-colors">
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
                  <TableCell className="py-3.5 px-4 align-top min-w-[180px]">
                    {hasAdmission ? (
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#cc785c] text-[11px] bg-[#faf9f5] border border-[#e6dfd8] px-1.5 py-0.5 rounded-md shadow-2xs">
                            {admIdStr}
                          </span>
                          <span className="font-serif-display font-bold text-[#141413] text-sm">
                            ₹{feeNum.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <StatusBadge status={payStatus} />
                          <span className="text-[10px] font-mono text-[#6c6a64] flex items-center gap-1 bg-[#efe9de] px-1.5 py-0.5 rounded-md border border-[#e6dfd8]">
                            <Calendar className="h-3 w-3 text-[#cc785c] shrink-0" />
                            {formatDateWithSpace(admDateStr)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-[#8e8b82] italic">
                        Enquiry Prospect (No Admission Yet)
                      </div>
                    )}
                  </TableCell>

                  {/* Status Badge Button */}
                  <TableCell className="py-3.5 px-3 text-center align-top whitespace-nowrap">
                    <StatusBadgeButton
                      status={currentStatus}
                      onSelect={(newStatus) => {
                        if (onStatusChange) {
                          onStatusChange(student, newStatus);
                        } else if (onEdit) {
                          onEdit({ ...student, status: newStatus });
                        }
                      }}
                    />
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell className="text-right py-3.5 px-3 align-top whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {onView && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(student);
                          }}
                          title="View Details"
                          className="h-7 px-2 rounded-lg text-xs font-semibold text-[#141413] bg-[#efe9de] hover:bg-[#e6dfd8] transition cursor-pointer gap-1 shadow-xs border border-[#e6dfd8]"
                        >
                          <Eye className="h-3.5 w-3.5 text-[#cc785c]" />
                          <span>View</span>
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(student);
                          }}
                          title="Edit Student Partner Details"
                          className="h-7 px-2 rounded-lg text-xs font-semibold text-[#cc785c] bg-[#efe9de] hover:bg-[#a9583e] hover:text-white transition cursor-pointer gap-1 shadow-xs border border-[#e6dfd8]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(student);
                          }}
                          title="Delete Student Record"
                          className="h-7 px-2 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition cursor-pointer gap-1 shadow-xs border border-red-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default StudentTable;