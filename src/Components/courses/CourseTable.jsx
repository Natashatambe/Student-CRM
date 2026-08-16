import { BookOpen, Pencil, Trash2, MoreVertical, Clock, Sparkles } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import StatusBadge from "../common/StatusBadge";

function CourseTable({ courses = [], onEdit, onDelete }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">ID</TableHead>
          <TableHead>Course Track</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Course Fees</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {courses.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-12 text-[#6c6a64] font-medium">
              No course tracks matching your search.
            </TableCell>
          </TableRow>
        ) : (
          courses.map((course, index) => {
            const courseId = course.id ?? course.courseId ?? 0;
            const courseName = course.name || course.courseName || course.title || "Course Track";
            const duration = course.duration || "N/A";
            
            const rawFee = course.fees ?? course.fee ?? course.courseFee;
            let displayFees = "₹0";
            if (typeof rawFee === "number") {
              displayFees = `₹${rawFee.toLocaleString()}`;
            } else if (typeof rawFee === "string" && rawFee.trim() !== "") {
              displayFees = rawFee.startsWith("₹")
                ? rawFee
                : `₹${(Number(rawFee.replace(/[^0-9]/g, "")) || 0).toLocaleString()}`;
            }

            const status = course.status || "Active";

            const formattedCourseId = `CRS-${courseId || (101 + index)}`;

            return (
              <TableRow key={courseId || index}>
                <TableCell className="font-mono text-xs font-bold text-[#cc785c]">{formattedCourseId}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-[#efe9de] text-[#cc785c] border border-[#e6dfd8] flex items-center justify-center shrink-0">
                      <BookOpen className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="font-serif-display text-base font-normal text-[#141413] flex items-center gap-1.5">
                        {courseName}
                        {status === "Active" && (
                          <Sparkles className="h-3 w-3 text-[#cc785c] fill-current" />
                        )}
                      </h4>
                      <span className="text-[11px] text-[#6c6a64] font-medium">Certified Curriculum</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-[#141413] text-xs md:text-sm font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#cc785c]" />
                    <span>{duration}</span>
                  </div>
                </TableCell>

                <TableCell className="font-bold text-[#141413] text-xs md:text-sm tracking-tight min-w-[120px]">
                  {displayFees}
                </TableCell>

                <TableCell>
                  <StatusBadge status={status} />
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-[#6c6a64]">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="right" className="rounded-xl bg-[#faf9f5] border-[#e6dfd8]">
                      <DropdownMenuItem onClick={() => onEdit && onEdit(course)}>
                        <Pencil className="h-4 w-4 mr-2 text-[#cc785c]" />
                        <span className="font-medium">Edit Course</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete && onDelete(course)} destructive>
                        <Trash2 className="h-4 w-4 mr-2" />
                        <span className="font-medium">Delete Course</span>
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

export default CourseTable;