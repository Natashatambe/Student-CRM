import { Pencil, Trash2, MoreVertical, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";

function AdmissionTable({ admissions = [], onEdit, onDelete }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">ID</TableHead>
          <TableHead>Student Partner</TableHead>
          <TableHead>Course Track</TableHead>
          <TableHead>Admission Date</TableHead>
          <TableHead>Total Fee</TableHead>
          <TableHead>Payment Status</TableHead>
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
          admissions.map((admission) => {
            const studentName = admission.student
              ? `${admission.student.firstName || ""} ${admission.student.lastName || ""}`.trim()
              : admission.studentName || "N/A";

            const courseName = admission.course?.courseName || admission.courseName || "N/A";
            const dateStr = admission.admissionDate || "N/A";
            const status = admission.paymentStatus || "Pending";

            const dicebearAvatar = `https://api.dicebear.com/10.x/glyphs/svg?seed=${encodeURIComponent(studentName || "AdmissionStudent")}`;

            return (
              <TableRow key={admission.admissionId}>
                <TableCell className="font-medium text-[#141413]">#{admission.admissionId}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8.5 w-8.5 ring-1 ring-[#cc785c]/40 bg-[#efe9de]">
                      <AvatarImage src={dicebearAvatar} alt={studentName} />
                      <AvatarFallback className="bg-[#cc785c] text-white font-medium text-xs">
                        {studentName ? studentName[0] : "A"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-serif-display font-normal text-base text-[#141413] flex items-center gap-1">
                      {studentName}
                      {status.toLowerCase() === "paid" && (
                        <Sparkles className="h-3 w-3 text-[#cc785c] fill-current" />
                      )}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="font-medium text-[#141413] text-xs md:text-sm">
                  {courseName}
                </TableCell>

                <TableCell className="text-[#6c6a64] text-xs md:text-sm font-medium">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5 text-[#cc785c]" />
                    <span>{dateStr}</span>
                  </div>
                </TableCell>

                <TableCell className="font-medium text-[#141413] text-xs md:text-sm font-serif-display">
                  ₹{(admission.totalFee || 0).toLocaleString()}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      status.toLowerCase() === "paid"
                        ? "success"
                        : status.toLowerCase() === "partial"
                        ? "amber"
                        : "destructive"
                    }
                  >
                    {status}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-[#6c6a64]">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="right" className="rounded-xl bg-[#faf9f5] border-[#e6dfd8]">
                      <DropdownMenuItem onClick={() => onEdit && onEdit(admission)}>
                        <Pencil className="h-4 w-4 mr-2 text-[#cc785c]" />
                        <span className="font-medium">Edit Admission</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete && onDelete(admission.admissionId)} destructive>
                        <Trash2 className="h-4 w-4 mr-2" />
                        <span className="font-medium">Delete Admission</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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