import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Sparkles,
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  HelpCircle,
  UserX,
  Pencil,
  Zap,
} from "lucide-react";
import { normalizeStatus } from "../../lib/utils";

function ViewStudentDialog({ open, setOpen, student, onEdit, onStatusChange }) {
  if (!student) return null;

  const currentStatus = normalizeStatus(student.status);
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

  const feeVal = Number(student.totalFee || student.fees || student.admission?.totalFee || 0);
  const pType = student.paymentType || student.admission?.paymentType || "Full";
  const pStatus =
    student.paymentStatus || student.admission?.paymentStatus || (pType === "EMI" ? "Partial" : (student.status === "Active" ? "Paid" : "Pending"));
  const eTenure = student.emiTenure || student.admission?.emiTenure || (pType === "EMI" ? 3 : null);
  const eMonthly = student.emiMonthlyAmount || student.admission?.emiMonthlyAmount || (pType === "EMI" ? Math.round(feeVal / (eTenure || 3)) : null);
  const admDate = student.admissionDate || student.admission?.admissionDate || student.admission?.created_at || new Date().toISOString().split("T")[0];

  const handleQuickStatusChange = (newStatus) => {
    if (onStatusChange) {
      onStatusChange(student, newStatus);
    } else if (onEdit) {
      onEdit({ ...student, status: newStatus });
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case "Active":
        return (
          <Badge className="bg-[#d4e9e2] text-[#006241] border-[#a3d9c9] px-3 py-1 font-bold text-xs">
            <Sparkles className="h-3.5 w-3.5 mr-1 text-[#00754A]" /> Active Partner
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-[#fef3c7] text-[#92400e] border-[#fde68a] px-3 py-1 font-bold text-xs">
            <Clock className="h-3.5 w-3.5 mr-1" /> Pending Approval
          </Badge>
        );
      case "Enquiry":
        return (
          <Badge className="bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd] px-3 py-1 font-bold text-xs">
            <HelpCircle className="h-3.5 w-3.5 mr-1" /> Enquiry Prospect
          </Badge>
        );
      default:
        return (
          <Badge className="bg-[#fee2e2] text-[#991b1b] border-[#fca5a5] px-3 py-1 font-bold text-xs">
            <UserX className="h-3.5 w-3.5 mr-1" /> Inactive Partner
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent onClose={() => setOpen(false)} className="max-w-xl">
        <DialogHeader className="bg-[#faf9f5] border-b border-[#e6dfd8] pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-[#cc785c]/40 bg-[#efe9de] shrink-0">
              <AvatarImage src={dicebearAvatar} alt={displayName} />
              <AvatarFallback className="bg-[#cc785c] text-white font-bold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <DialogTitle className="text-xl font-serif-display font-bold text-[#141413]">
                  {displayName}
                </DialogTitle>
                {getStatusBadge(currentStatus)}
              </div>
              <DialogDescription className="text-xs text-[#6c6a64] font-medium flex items-center gap-2">
                <span className="font-mono font-bold text-[#cc785c] bg-[#efe9de] px-2 py-0.5 rounded border border-[#e6dfd8]">
                  {student.formattedId || `#${student.id}`}
                </span>
                <span>Enrolled Partner Student Record</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-5 p-6 bg-[#faf9f5]">
          {/* Quick Action Bar to Toggle Status to Active / Pending / Inactive */}
          <div className="bg-[#faf6ee] border border-[#cba258] rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              <span className="font-bold text-[#1E3932] flex items-center gap-1.5 uppercase tracking-wider">
                <Zap className="h-4 w-4 text-[#cc785c]" /> Change Partner Status Action
              </span>
              <span className="text-[11px] text-[#6c6a64]">Current: <strong>{currentStatus}</strong></span>
            </div>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <Button
                type="button"
                size="sm"
                variant={currentStatus === "Active" ? "primary" : "outline"}
                onClick={() => handleQuickStatusChange("Active")}
                className={currentStatus === "Active" ? "bg-[#00754A] hover:bg-[#006241] text-white h-7 text-xs gap-1 font-bold" : "border-[#a3d9c9] bg-white text-[#006241] hover:bg-[#d4e9e2] h-7 text-xs gap-1"}
              >
                <Sparkles className="h-3 w-3" /> Set Active
              </Button>
              <Button
                type="button"
                size="sm"
                variant={currentStatus === "Pending" ? "primary" : "outline"}
                onClick={() => handleQuickStatusChange("Pending")}
                className={currentStatus === "Pending" ? "bg-[#d97706] hover:bg-[#b45309] text-white h-7 text-xs gap-1 font-bold" : "border-[#fde68a] bg-white text-[#92400e] hover:bg-[#fef3c7] h-7 text-xs gap-1"}
              >
                <Clock className="h-3 w-3" /> Set Pending
              </Button>
              <Button
                type="button"
                size="sm"
                variant={currentStatus === "Enquiry" ? "primary" : "outline"}
                onClick={() => handleQuickStatusChange("Enquiry")}
                className={currentStatus === "Enquiry" ? "bg-[#0284c7] hover:bg-[#0369a1] text-white h-7 text-xs gap-1 font-bold" : "border-[#bae6fd] bg-white text-[#0369a1] hover:bg-[#e0f2fe] h-7 text-xs gap-1"}
              >
                <HelpCircle className="h-3 w-3" /> Set Enquiry
              </Button>
              <Button
                type="button"
                size="sm"
                variant={currentStatus === "Inactive" ? "primary" : "outline"}
                onClick={() => handleQuickStatusChange("Inactive")}
                className={currentStatus === "Inactive" ? "bg-[#dc2626] hover:bg-[#b91c1c] text-white h-7 text-xs gap-1 font-bold" : "border-[#fca5a5] bg-white text-[#991b1b] hover:bg-[#fee2e2] h-7 text-xs gap-1"}
              >
                <UserX className="h-3 w-3" /> Set Inactive
              </Button>
            </div>
          </div>

          {/* Personal & Contact Details */}
          <div className="bg-[#efe9de]/60 rounded-xl p-4 border border-[#e6dfd8] space-y-3">
            <h4 className="text-xs font-bold text-[#141413] uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-4 w-4 text-[#cc785c]" /> Personal & Contact Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[#8e8b82] font-medium block">Full Name</span>
                <span className="text-[#141413] font-semibold">{displayName}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[#8e8b82] font-medium block">Gender</span>
                <span className="text-[#141413] font-semibold">{student.gender || "Male"}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[#8e8b82] font-medium block">Email Address</span>
                <span className="text-[#141413] font-semibold flex items-center gap-1 truncate">
                  <Mail className="h-3.5 w-3.5 text-[#cc785c] shrink-0" />
                  <span className="truncate">{student.email || "N/A"}</span>
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[#8e8b82] font-medium block">Phone Number</span>
                <span className="text-[#141413] font-semibold flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-[#cc785c] shrink-0" />
                  {student.phone || "N/A"}
                </span>
              </div>

              <div className="sm:col-span-2 space-y-0.5">
                <span className="text-[#8e8b82] font-medium block">Address Location</span>
                <span className="text-[#141413] font-semibold flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#cc785c] shrink-0" />
                  {student.address || "Main City"}
                </span>
              </div>
            </div>
          </div>

          {/* Academic Track Details */}
          <div className="bg-[#efe9de]/60 rounded-xl p-4 border border-[#e6dfd8] space-y-3">
            <h4 className="text-xs font-bold text-[#141413] uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-[#cc785c]" /> Enrollment Track Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[#8e8b82] font-medium block">Enrolled Course</span>
                <span className="text-[#141413] font-bold text-sm bg-[#faf9f5] px-2.5 py-1 rounded-md border border-[#e6dfd8] inline-block">
                  {student.course || "Java Full Stack"}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[#8e8b82] font-medium block">Admission Date</span>
                <span className="text-[#141413] font-semibold flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-[#cc785c]" />
                  {admDate}
                </span>
              </div>
            </div>
          </div>

          {/* Fee & EMI Breakdown */}
          <div className="bg-[#efe9de]/60 rounded-xl p-4 border border-[#e6dfd8] space-y-3">
            <h4 className="text-xs font-bold text-[#141413] uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-[#cc785c]" /> Fee Structure & Payment Status
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[#8e8b82] font-medium block">Total Course Fee</span>
                <span className="text-[#141413] font-bold text-sm">
                  ₹{feeVal.toLocaleString()}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[#8e8b82] font-medium block">Payment Plan</span>
                <span className="text-[#141413] font-semibold">
                  {pType === "EMI" ? `EMI (${eTenure || 3} Months)` : "Full One-Time"}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[#8e8b82] font-medium block">Payment Status</span>
                <Badge
                  variant={
                    pStatus.toLowerCase() === "paid" || pStatus.toLowerCase() === "completed"
                      ? "success"
                      : pStatus.toLowerCase() === "partial"
                      ? "amber"
                      : "destructive"
                  }
                  className="text-[10px] px-2 py-0.5"
                >
                  {pStatus}
                </Badge>
              </div>
            </div>

            {pType === "EMI" && (
              <div className="bg-[#faf9f5] p-3 rounded-lg text-xs flex items-center justify-between text-[#141413] font-medium border border-[#e6dfd8] mt-2">
                <span>Monthly Installment: <strong className="text-[#cc785c]">₹{Number(eMonthly || Math.round(feeVal / (eTenure || 3))).toLocaleString()} / mo</strong></span>
                <span>Tenure: <strong>{eTenure || 3} Months</strong></span>
              </div>
            )}
          </div>
        </DialogBody>

        <DialogFooter className="bg-[#faf9f5] border-t border-[#e6dfd8] gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
          {onEdit && (
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                setOpen(false);
                onEdit(student);
              }}
              className="bg-[#cc785c] hover:bg-[#a9583e] text-white gap-1.5 shadow-xs"
            >
              <Pencil className="h-4 w-4" /> Edit Record
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ViewStudentDialog;
