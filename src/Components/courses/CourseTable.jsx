import { useMemo } from "react";
import { BookOpen, Pencil, Trash2, MoreVertical, Clock, Sparkles } from "lucide-react";
import { useTable } from "@tanstack/react-table";
import { dataGridFeatures, DataGrid, DataGridContainer } from "@/Components/reui/data-grid/data-grid";
import { DataGridScrollArea } from "@/Components/reui/data-grid/data-grid-scroll-area";
import { DataGridTable } from "@/Components/reui/data-grid/data-grid-table";
import { DataGridColumnHeader } from "@/Components/reui/data-grid/data-grid-column-header";
import { DataGridPagination } from "@/Components/reui/data-grid/data-grid-pagination";
import { Button } from "@/Components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/Components/ui/dropdown-menu";
import StatusBadge from "@/Components/common/StatusBadge";
import LoadingState from "@/Components/common/LoadingState";

function CourseTable({ courses = [], loading = false, onEdit, onDelete }) {
  const columns = useMemo(() => [
    {
      id: "courseId",
      accessorFn: (row) => row.id ?? row.courseId ?? 0,
      header: ({ column }) => <DataGridColumnHeader column={column} title="ID" />,
      size: 90,
      cell: ({ row }) => {
        const course = row.original;
        const courseId = course.id ?? course.courseId ?? 0;
        return (
          <span className="font-mono text-xs font-bold text-[#cc785c]">
            CRS-{courseId || (101 + row.index)}
          </span>
        );
      },
    },
    {
      id: "course",
      accessorFn: (row) => row.name || row.courseName || row.title || "Course Track",
      header: ({ column }) => <DataGridColumnHeader column={column} title="Course Track" />,
      size: 260,
      meta: { autoSize: true },
      cell: ({ row }) => {
        const course = row.original;
        const courseName = course.name || course.courseName || course.title || "Course Track";
        const status = course.status || "Active";
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-[#efe9de] text-[#cc785c] border border-[#e6dfd8] flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-serif-display text-base font-normal text-[#141413] flex items-center gap-1.5">
                {courseName}
                {status === "Active" && <Sparkles className="h-3 w-3 text-[#cc785c] fill-current" />}
              </h4>
              <span className="text-[11px] text-[#6c6a64] font-medium">Certified Curriculum</span>
            </div>
          </div>
        );
      },
    },
    {
      id: "duration",
      accessorFn: (row) => row.duration || "N/A",
      header: ({ column }) => <DataGridColumnHeader column={column} title="Duration" />,
      size: 130,
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1.5 text-[#141413] text-xs font-medium">
          <Clock className="h-3.5 w-3.5 text-[#cc785c]" />
          <span>{getValue()}</span>
        </div>
      ),
    },
    {
      id: "fees",
      accessorFn: (row) => {
        const rawFee = row.fees ?? row.fee ?? row.courseFee;
        if (typeof rawFee === "number") return rawFee;
        if (typeof rawFee === "string" && rawFee.trim()) {
          return Number(rawFee.replace(/[^0-9]/g, "")) || 0;
        }
        return 0;
      },
      header: ({ column }) => <DataGridColumnHeader column={column} title="Course Fees" />,
      size: 130,
      cell: ({ row }) => {
        const course = row.original;
        const rawFee = course.fees ?? course.fee ?? course.courseFee;
        let displayFees = "₹0";
        if (typeof rawFee === "number") {
          displayFees = `₹${rawFee.toLocaleString()}`;
        } else if (typeof rawFee === "string" && rawFee.trim()) {
          displayFees = rawFee.startsWith("₹") ? rawFee : `₹${(Number(rawFee.replace(/[^0-9]/g, "")) || 0).toLocaleString()}`;
        }
        return <span className="font-bold text-[#141413] text-xs tracking-tight">{displayFees}</span>;
      },
    },
    {
      id: "status",
      accessorFn: (row) => row.status || "Active",
      header: ({ column }) => <DataGridColumnHeader column={column} title="Status" />,
      size: 120,
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    },
    {
      id: "actions",
      header: "Actions",
      size: 80,
      enableSorting: false,
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon"
              onClick={() => onEdit?.(course)}
              className="h-8 w-8 rounded-md text-[#6c6a64] hover:text-[#cc785c] hover:bg-[#efe9de] transition"
              title="Edit course"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"
                  className="h-8 w-8 rounded-md text-[#6c6a64] hover:text-[#141413] hover:bg-[#efe9de] transition"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl border-[#e6dfd8] bg-white shadow-xl">
                <DropdownMenuItem onClick={() => onEdit?.(course)} className="gap-2 cursor-pointer">
                  <Pencil className="h-3.5 w-3.5 text-[#cc785c]" />
                  <span className="text-xs font-semibold">Edit Course</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(course)}
                  className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [onEdit, onDelete]);

  const table = useTable({
    features: dataGridFeatures,
    data: courses,
    columns,
    initialState: { pagination: { pageSize: 10, pageIndex: 0 } },
    getRowId: (row, idx) => String(row.id || row.courseId || idx),
  });

  if (loading) {
    return <LoadingState message="Loading Curriculum Catalog Tracks..." rows={5} />;
  }

  return (
    <div className="w-full rounded-xl border border-[#e6dfd8] bg-[#faf9f5] shadow-xs overflow-hidden">
      <DataGrid
        table={table}
        recordCount={courses.length}
        tableLayout={{ rowBorder: true, headerBackground: true }}
        tableClassNames={{ base: "text-xs" }}
      >
        <DataGridContainer>
          <DataGridScrollArea>
            <DataGridTable />
          </DataGridScrollArea>
          {courses.length === 0 ? (
            <div className="text-center py-12 text-[#6c6a64] font-medium text-sm">
              No course tracks matching your search.
            </div>
          ) : (
            <div className="border-t border-[#e6dfd8] px-4 py-2">
              <DataGridPagination />
            </div>
          )}
        </DataGridContainer>
      </DataGrid>
    </div>
  );
}

export default CourseTable;