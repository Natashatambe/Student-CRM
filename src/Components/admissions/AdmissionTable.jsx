import { Pencil, Trash2, MoreVertical, Calendar as CalendarIcon, Sparkles, CreditCard, Mail, FileText } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";

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

function AdmissionTable({ admissions = [], onEdit, onDelete, onManageEmi, onViewReceipt }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">ID</TableHead>
          <TableHead>Student Partner</TableHead>
          <TableHead>Course Track</TableHead>
          <TableHead>Admission Date</TableHead>
          <TableHead>Total Fee</TableHead>
          <TableHead>Payment & Fee Plan</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {admissions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-12 text-[#6c6a64] font-medium">
              No admission entries found matching search query.
            </TableCell>
          </TableRow>
        ) : (
          admissions.map((admission, index) => {
            let rawStudentName = admission.studentName || (typeof admission.student === "string" ? admission.student : (admission.student ? (admission.student.name || `${admission.student.firstName || ""} ${admission.student.lastName || ""}`).trim() : ""));
            let studentName = rawStudentName.length > 0 ? rawStudentName : "Student Partner";
            let studentEmail = admission.studentEmail || admission.student?.email || "";

            const courseName = admission.course?.courseName || admission.course?.name || (typeof admission.course === "string" ? admission.course : null) || admission.courseName || "Course Track";
            const dateStr = admission.admissionDate || admission.date || "N/A";
            const status = admission.paymentStatus || admission.status || "Pending";
            const isEmi = String(admission.paymentType || "").toUpperCase() === "EMI" || Boolean(admission.emiTenure && Number(admission.emiTenure) > 1);
            const isPaidStatus = status.toLowerCase() === "paid" || status.toLowerCase() === "completed";
            const emiTenure = Number(admission.emiTenure || 3);
            const emiPaidCount = isPaidStatus
              ? emiTenure
              : (admission.emiPaidCount !== undefined && admission.emiPaidCount !== null && Number(admission.emiPaidCount) > 0
                  ? Number(admission.emiPaidCount)
                  : (admission.emiSchedule && admission.emiSchedule.length > 0 ? admission.emiSchedule.filter(s => s.status === "Paid").length : (status.toLowerCase() === "partial" ? 1 : 0)));
            const totalFeeNum = Number(admission.totalFee || admission.fee || admission.amount || admission.course?.fees || 0);

            const dicebearAvatar = `https://api.dicebear.com/10.x/glyphs/svg?seed=${encodeURIComponent(studentName || "AdmissionStudent")}`;

            const formattedAdmissionId = `#${101 + index}`;

            return (
              <TableRow key={admission.admissionId || admission.id || index}>
                <TableCell className="font-mono text-xs font-bold text-[#cc785c]">{formattedAdmissionId}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8.5 w-8.5 ring-1 ring-[#cc785c]/40 bg-[#efe9de]">
                      <AvatarImage src={dicebearAvatar} alt={studentName} />
                      <AvatarFallback className="bg-[#cc785c] text-white font-medium text-xs">
                        {studentName ? studentName[0] : "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-serif-display font-normal text-base text-[#141413] flex items-center gap-1">
                        {studentName}
                        {isPaidStatus && (
                          <Sparkles className="h-3 w-3 text-[#cc785c] fill-current" />
                        )}
                      </span>
                      {studentEmail && (
                        <span className="text-[11px] text-slate-500 font-medium block">{studentEmail}</span>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="font-medium text-[#141413] text-xs md:text-sm">
                  {courseName}
                </TableCell>

                <TableCell className="text-[#6c6a64] text-xs md:text-sm font-medium whitespace-nowrap">
                  <div className="inline-flex items-center gap-2 bg-[#efe9de] text-[#141413] px-3 py-1.5 rounded-lg border border-[#e6dfd8] shadow-xs">
                    <CalendarIcon className="h-3.5 w-3.5 text-[#cc785c] shrink-0" />
                    <span className="font-mono text-xs font-semibold tracking-wide">{formatDateWithSpace(dateStr)}</span>
                  </div>
                </TableCell>

                <TableCell className="font-medium text-[#141413] text-xs md:text-sm font-serif-display">
                  ₹{totalFeeNum.toLocaleString()}
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <Badge
                      variant={
                        isPaidStatus
                          ? "success"
                          : status.toLowerCase() === "partial"
                          ? "amber"
                          : "destructive"
                      }
                      className={isEmi ? "cursor-pointer hover:opacity-80" : ""}
                      onClick={() => isEmi && onManageEmi && onManageEmi(admission)}
                    >
                      {status}
                    </Badge>
                    {isEmi && (
                      <span
                        onClick={() => onManageEmi && onManageEmi(admission)}
                        className={`block text-[11px] font-bold cursor-pointer hover:underline ${
                          emiPaidCount >= emiTenure || isPaidStatus ? "text-[#00754A]" : "text-[#006241]"
                        }`}
                      >
                        💳 {emiPaidCount >= emiTenure || isPaidStatus ? `EMI Completed (${emiTenure}/${emiTenure} Paid 🎉)` : `${emiTenure} Mo EMI (${emiPaidCount}/${emiTenure} Paid)`}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {isEmi && !isPaidStatus && (
                      <Button
                        variant="stripe"
                        size="sm"
                        onClick={() => onManageEmi && onManageEmi(admission)}
                        className="h-8 px-2.5 text-xs gap-1 font-bold shadow-2xs"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Pay EMI</span>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewReceipt && onViewReceipt(admission)}
                      className="h-8 px-2.5 text-xs gap-1 border-[#00754A]/30 text-[#006241] bg-[#d4e9e2]/30 hover:bg-[#d4e9e2]"
                      title="Open Gmail Web Composer for Student Receipt"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span className="font-semibold hidden sm:inline">Open Gmail Web</span>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-[#6c6a64]">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    <DropdownMenuContent align="right" className="rounded-xl bg-[#faf9f5] border-[#e6dfd8]">
                      {isEmi && (
                        <DropdownMenuItem onClick={() => onManageEmi && onManageEmi(admission)}>
                          <CreditCard className="h-4 w-4 mr-2 text-[#006241]" />
                          <span className="font-medium">Manage EMI Schedule</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onViewReceipt && onViewReceipt(admission)}>
                        <Mail className="h-4 w-4 mr-2 text-[#00754A]" />
                        <span className="font-medium">Receipt & Auto Email</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit && onEdit(admission)}>
                        <Pencil className="h-4 w-4 mr-2 text-[#cc785c]" />
                        <span className="font-medium">Edit Admission</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete && onDelete(admission.admissionId || admission.id)} destructive>
                        <Trash2 className="h-4 w-4 mr-2" />
                        <span className="font-medium">Delete Admission</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

export default AdmissionTable;