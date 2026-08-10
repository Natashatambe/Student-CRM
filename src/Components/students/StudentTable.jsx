import { Pencil, Trash2, MoreVertical, Mail, Phone, MapPin, Sparkles } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";

function StudentTable({ students = [], onEdit, onDelete }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">ID</TableHead>
          <TableHead>Student Partner</TableHead>
          <TableHead>Contact Info</TableHead>
          <TableHead>Location & Gender</TableHead>
          <TableHead>Course Track</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {students.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-12 text-[#6c6a64] font-medium">
              No student records found matching your search.
            </TableCell>
          </TableRow>
        ) : (
          students.map((student) => {
            const displayName = student.name
              ? student.name
              : `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Student Partner";

            const initials = displayName
              ? displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : "ST";

            const dicebearAvatar = `https://api.dicebear.com/10.x/glyphs/svg?seed=${encodeURIComponent(displayName || "Student")}`;

            return (
              <TableRow key={student.id}>
                <TableCell className="font-medium text-[#141413]">#{student.id}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8.5 w-8.5 ring-1 ring-[#cc785c]/40 bg-[#efe9de]">
                      <AvatarImage src={dicebearAvatar} alt={displayName} />
                      <AvatarFallback className="bg-[#cc785c] text-white font-medium text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-serif-display font-normal text-base text-[#141413] flex items-center gap-1">
                        {displayName}
                        {student.status === "Active" && (
                          <Sparkles className="h-3 w-3 text-[#cc785c] fill-current" />
                        )}
                      </h4>
                      <span className="text-[11px] text-[#6c6a64] font-medium">Student ID #{student.id}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-0.5 text-xs text-[#141413] font-medium">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-[#cc785c]" />
                      <span>{student.email || "No email"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#6c6a64]">
                      <Phone className="h-3 w-3 text-[#cc785c]" />
                      <span>{student.phone || "No phone"}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-0.5 text-xs text-[#141413] font-medium">
                    <div className="flex items-center gap-1 text-[#6c6a64]">
                      <MapPin className="h-3 w-3 text-[#cc785c]" />
                      <span className="truncate max-w-[140px]">{student.address || "Main City"}</span>
                    </div>
                    <span className="text-[10px] text-[#8e8b82] font-medium block uppercase">
                      Gender: {student.gender || "N/A"}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="font-medium text-[#141413] text-xs md:text-sm">
                  {student.course || "General Track"}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      student.status === "Active"
                        ? "success"
                        : student.status === "Pending"
                        ? "amber"
                        : "destructive"
                    }
                  >
                    {student.status || "Active"}
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
                      <DropdownMenuItem onClick={() => onEdit(student)}>
                        <Pencil className="h-4 w-4 mr-2 text-[#cc785c]" />
                        <span className="font-medium">Edit Student</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(student)} destructive>
                        <Trash2 className="h-4 w-4 mr-2" />
                        <span className="font-medium">Delete Student</span>
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

export default StudentTable;