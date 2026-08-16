import { useMemo } from "react";
import {
  Pencil, Trash2, MoreVertical, Calendar as CalendarIcon, Sparkles, CreditCard, Mail, Eye,
} from "lucide-react";
import { useTable } from "@tanstack/react-table";
import { dataGridFeatures, DataGrid, DataGridContainer } from "@/Components/reui/data-grid/data-grid";
import { DataGridScrollArea } from "@/Components/reui/data-grid/data-grid-scroll-area";
import { DataGridTable } from "@/Components/reui/data-grid/data-grid-table";
import { DataGridColumnHeader } from "@/Components/reui/data-grid/data-grid-column-header";
import { DataGridPagination } from "@/Components/reui/data-grid/data-grid-pagination";
import { Avatar, AvatarImage, AvatarFallback } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/Components/ui/dropdown-menu";
import StatusBadge from "@/Components/common/StatusBadge";

const formatDateWithSpace = (rawDate) => {
  if (!rawDate) return "N/A";
  const str = String(rawDate).trim();
  if (str.includes("T") || str.includes(" ")) {
    const parts = str.split(/[T ]/);
    const datePart = parts[0];
    const timePart = parts[1] ? parts[1].slice(0, 5) : "";
    return timePart ? `${datePart}   •   ${timePart}` : datePart;
  }
  return str;
};

function AdmissionTable({ admissions = [], onEdit, onDelete, onManageEmi, onViewReceipt }) {
  const columns = useMemo(() => [
    {
      id: "admissionId",
      header: ({ column }) => <DataGridColumnHeader column={column} title="ID" />,
      size: 70,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-[#cc785c]">#{101 + row.index}</span>
      ),
    },
    {
      id: "student",
      accessorFn: (row) => {
        const raw = row.studentName || (typeof row.student === "string" ? row.student : (row.student ? (row.student.name || `${row.student.firstName || ""} ${row.student.lastName || ""}`.trim()) : ""));
        return raw || "Student Partner";
      },
      header: ({ column }) => <DataGridColumnHeader column={column} title="Student Partner" />,
      size: 220,
      cell: ({ row }) => {
        const admission = row.original;
        const rawStudentName = admission.studentName || (typeof admission.student === "string" ? admission.student : (admission.student ? (admission.student.name || `${admission.student.firstName || ""} ${admission.student.lastName || ""}`.trim()) : ""));
        const studentName = rawStudentName || "Student Partner";
        const studentEmail = admission.studentEmail || admission.student?.email || "";
        const status = admission.paymentStatus || admission.status || "Pending";
        const isPaidStatus = status.toLowerCase() === "paid" || status.toLowerCase() === "completed";
        const dicebearAvatar = `https://api.dicebear.com/10.x/glyphs/svg?seed=${encodeURIComponent(studentName || "AdmissionStudent")}`;
        return (
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 ring-1 ring-[#cc785c]/40 bg-[#efe9de]">
              <AvatarImage src={dicebearAvatar} alt={studentName} />
              <AvatarFallback className="bg-[#cc785c] text-white font-medium text-xs">{studentName[0] || "A"}</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-serif-display font-normal text-base text-[#141413] flex items-center gap-1">
                {studentName}
                {isPaidStatus && <Sparkles className="h-3 w-3 text-[#cc785c] fill-current" />}
              </span>
              {studentEmail && <span className="text-[11px] text-slate-500 font-medium block">{studentEmail}</span>}
            </div>
          </div>
        );
      },
    },
    {
      id: "course",
      accessorFn: (row) => row.course?.courseName || row.course?.name || (typeof row.course === "string" ? row.course : null) || row.courseName || "Course Track",
      header: ({ column }) => <DataGridColumnHeader column={column} title="Course Track" />,
      size: 160,
      cell: ({ getValue }) => (
        <span className="font-medium text-[#141413] text-xs">{getValue()}</span>
      ),
    },
    {
      id: "admissionDate",
      accessorFn: (row) => row.admissionDate || row.date || "N/A",
      header: ({ column }) => <DataGridColumnHeader column={column} title="Admission Date" />,
      size: 170,
      cell: ({ getValue }) => (
        <div className="inline-flex items-center gap-2 bg-[#efe9de] text-[#141413] px-3 py-1.5 rounded-lg border border-[#e6dfd8] shadow-xs">
          <CalendarIcon className="h-3.5 w-3.5 text-[#cc785c] shrink-0" />
          <span className="font-mono text-xs font-semibold tracking-wide">{formatDateWithSpace(getValue())}</span>
        </div>
      ),
    },
    {
      id: "totalFee",
      accessorFn: (row) => Number(row.totalFee || row.fee || row.amount || row.course?.fees || 0),
      header: ({ column }) => <DataGridColumnHeader column={column} title="Total Fee" />,
      size: 120,
      cell: ({ getValue }) => (
        <span className="font-bold text-[#141413] text-xs tracking-tight">₹{getValue().toLocaleString()}</span>
      ),
    },
    {
      id: "payment",
      header: "Payment & Fee Plan",
      size: 180,
      enableSorting: false,
      cell: ({ row }) => {
        const admission = row.original;
        const status = admission.paymentStatus || admission.status || "Pending";
        const isEmi = String(admission.paymentType || "").toUpperCase() === "EMI" || Boolean(admission.emiTenure && Number(admission.emiTenure) > 1);
        const isPaidStatus = status.toLowerCase() === "paid" || status.toLowerCase() === "completed";
        const emiTenure = Number(admission.emiTenure || 3);
        const emiPaidCount = isPaidStatus ? emiTenure
          : (admission.emiPaidCount !== undefined && admission.emiPaidCount !== null && Number(admission.emiPaidCount) > 0
            ? Number(admission.emiPaidCount)
            : (admission.emiSchedule?.length > 0 ? admission.emiSchedule.filter(s => s.status === "Paid").length : (status.toLowerCase() === "partial" ? 1 : 0)));
        return (
          <div className="space-y-1">
            <StatusBadge status={status} isEmi={isEmi} emiPaidCount={emiPaidCount} emiTenure={emiTenure} onClick={() => isEmi && onManageEmi?.(admission)} />
            {isEmi && (
              <span onClick={() => onManageEmi?.(admission)}
                className={`block text-[11px] font-bold cursor-pointer hover:underline ${emiPaidCount >= emiTenure || isPaidStatus ? "text-[#00754A]" : "text-[#cc785c]"}`}>
                💳 {emiPaidCount >= emiTenure || isPaidStatus ? `EMI Completed (${emiTenure}/${emiTenure} Paid 🎉)` : `${emiTenure} Mo EMI (${emiPaidCount}/${emiTenure} Paid)`}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      size: 80,
      enableSorting: false,
      cell: ({ row }) => {
        const admission = row.original;
        const status = admission.paymentStatus || admission.status || "Pending";
        const isEmi = String(admission.paymentType || "").toUpperCase() === "EMI" || Boolean(admission.emiTenure && Number(admission.emiTenure) > 1);
        const isPaid = status.toLowerCase() === "paid" || status.toLowerCase() === "completed";
        return (
          <div className="flex items-center justify-end gap-1">
            {/* Pay EMI shortcut for unpaid EMI */}
            {isEmi && !isPaid && (
              <Button variant="ghost" size="icon"
                onClick={() => onManageEmi?.(admission)}
                className="h-8 w-8 rounded-md text-[#635bff] hover:bg-[#635bff]/10 transition"
                title="Manage EMI"
              >
                <CreditCard className="h-4 w-4" />
              </Button>
            )}
            {/* Pencil / Edit */}
            <Button variant="ghost" size="icon"
              onClick={() => onEdit?.(admission)}
              className="h-8 w-8 rounded-md text-[#6c6a64] hover:text-[#cc785c] hover:bg-[#efe9de] transition"
              title="Edit admission"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {/* Three-dot menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"
                  className="h-8 w-8 rounded-md text-[#6c6a64] hover:text-[#141413] hover:bg-[#efe9de] transition"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-xl border-[#e6dfd8] bg-white shadow-xl">
                {isEmi && (
                  <DropdownMenuItem onClick={() => onManageEmi?.(admission)} className="gap-2 cursor-pointer">
                    <CreditCard className="h-3.5 w-3.5 text-[#006241]" />
                    <span className="text-xs font-semibold">Manage EMI</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onViewReceipt?.(admission)} className="gap-2 cursor-pointer">
                  <Mail className="h-3.5 w-3.5 text-[#00754A]" />
                  <span className="text-xs font-semibold">Receipt & Email</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(admission)} className="gap-2 cursor-pointer">
                  <Pencil className="h-3.5 w-3.5 text-[#cc785c]" />
                  <span className="text-xs font-semibold">Edit Admission</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(admission.admissionId || admission.id)}
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
  ], [onEdit, onDelete, onManageEmi, onViewReceipt]);

  const table = useTable({
    features: dataGridFeatures,
    data: admissions,
    columns,
    initialState: { pagination: { pageSize: 10, pageIndex: 0 } },
    getRowId: (row, idx) => String(row.admissionId || row.id || idx),
  });

  return (
    <div className="w-full rounded-xl border border-[#e6dfd8] bg-[#faf9f5] shadow-xs overflow-hidden">
      <DataGrid
        table={table}
        recordCount={admissions.length}
        tableLayout={{ rowBorder: true, headerBackground: true }}
        tableClassNames={{ base: "text-xs" }}
      >
        <DataGridContainer>
          <DataGridScrollArea>
            <DataGridTable />
          </DataGridScrollArea>
          {admissions.length === 0 ? (
            <div className="text-center py-12 text-[#6c6a64] font-medium text-sm">
              No admission entries found matching search query.
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

export default AdmissionTable;