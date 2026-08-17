import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Pencil, Trash2, Mail, Phone, MapPin, Sparkles, GraduationCap,
  Calendar, ChevronDown, Check, Eye, MoreVertical,
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/Components/ui/dropdown-menu";
import { cn, normalizeStatus } from "@/lib/utils";
import StatusBadge from "@/Components/common/StatusBadge";
import LoadingState from "@/Components/common/LoadingState";

/* ─── helpers ─── */
const formatDate = (rawDate) => {
  if (!rawDate) return "N/A";
  const str = String(rawDate).trim();
  return str.includes("T") ? str.split("T")[0] : str.split(" ")[0];
};

/* ─── Status pill with dropdown ─── */
const StatusPill = ({ status, onSelect }) => {
  const current = normalizeStatus(status);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const cfg = {
    Active:   { pill: "bg-[#d0ede3] text-[#00754A] border-[#b0dbc9]", dot: "bg-[#00754A]" },
    Pending:  { pill: "bg-[#fef3ec] text-[#cc785c] border-[#f5d8c5]", dot: "bg-[#cc785c]" },
    Enquiry:  { pill: "bg-[#f5f4f1] text-[#6c6a64] border-[#e6dfd8]", dot: "bg-[#8e8b82]" },
    Inactive: { pill: "bg-[#fde8e8] text-[#c64545] border-[#fbd5d5]", dot: "bg-[#c64545]" },
  };
  const { pill, dot } = cfg[current] || cfg.Inactive;

  const statuses = ["Active", "Pending", "Enquiry", "Inactive"];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold cursor-pointer select-none transition-all active:scale-95",
          pill
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
        {current}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {open && (
        <div className="absolute left-0 mt-1 z-50 min-w-[130px] rounded-xl bg-white border border-[#e6dfd8] p-1 shadow-xl animate-in fade-in-0 zoom-in-95">
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { onSelect?.(s); setOpen(false); }}
              className={cn(
                "w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#efe9de] transition cursor-pointer",
                current === s ? "text-[#cc785c]" : "text-[#141413]"
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className={cn("h-1.5 w-1.5 rounded-full", cfg[s]?.dot)} />
                {s}
              </div>
              {current === s && <Check className="h-3 w-3 text-[#cc785c]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Main Component ─── */
function StudentTable({ students = [], loading = false, onEdit, onDelete, onView, onStatusChange, onStageChange, onCall }) {
  const columns = useMemo(() => [


    /* Student Partner & Contact */
    {
      id: "student",
      accessorFn: (r) => r.name || `${r.firstName || ""} ${r.lastName || ""}`.trim(),
      header: ({ column }) => <DataGridColumnHeader column={column} title="Student Partner & Contact" />,
      size: 280,
      cell: ({ row }) => {
        const s = row.original;
        const name = s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim() || "Student Partner";
        const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
        const avatar = `https://api.dicebear.com/10.x/glyphs/svg?seed=${encodeURIComponent(name)}`;
        const isActive = normalizeStatus(s.status) === "Active";
        return (
          <div className="flex items-start gap-2.5 py-0.5">
            <Avatar className="h-9 w-9 ring-1 ring-[#cc785c]/30 shrink-0 mt-0.5">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="bg-[#cc785c] text-white text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p
                onClick={() => onView?.(s)}
                className="font-medium text-sm text-[#141413] hover:text-[#cc785c] cursor-pointer flex items-center gap-1 truncate leading-snug transition-colors"
              >
                {name}
                {isActive && <Sparkles className="h-3 w-3 text-[#cc785c] fill-current shrink-0" />}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[11px] text-[#6c6a64]">
                {s.email && (
                  <span className="flex items-center gap-1 min-w-0">
                    <Mail className="h-3 w-3 text-[#cc785c] shrink-0" />
                    <span className="truncate max-w-[150px]">{s.email}</span>
                  </span>
                )}
                {s.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-[#cc785c] shrink-0" />
                    {s.phone}
                  </span>
                )}
                {s.gender && <span className="text-[#aaa99f] font-semibold text-[10px]">• {s.gender}</span>}
              </div>
              {s.address && (
                <div className="flex items-center gap-1 mt-0.5 text-[11px] text-[#8e8b82]">
                  <MapPin className="h-3 w-3 text-[#cc785c] shrink-0" />
                  <span className="truncate max-w-[200px]">{s.address}</span>
                </div>
              )}
            </div>
          </div>
        );
      },
    },

    /* Course Track */
    {
      id: "course",
      accessorFn: (r) => r.course || r.courseName || "Java Full Stack",
      header: ({ column }) => <DataGridColumnHeader column={column} title="Course Track" />,
      size: 170,
      cell: ({ getValue }) => (
        <div className="inline-flex items-center gap-1.5 bg-[#efe9de] text-[#141413] px-2.5 py-1 rounded-md text-[11px] font-semibold border border-[#e6dfd8]">
          <GraduationCap className="h-3.5 w-3.5 text-[#cc785c] shrink-0" />
          <span className="truncate max-w-[120px]">{getValue()}</span>
        </div>
      ),
    },

    /* Admission & Fee Data */
    {
      id: "admission",
      header: "Admission & Fee Data",
      size: 200,
      enableSorting: false,
      cell: ({ row }) => {
        const s = row.original;
        const st = normalizeStatus(s.status);
        const isActive = st === "Active";

        // Only show fee/admission data for Active students
        if (!isActive) {
          const msgMap = {
            Pending:  { text: "Pending Enrollment",   cls: "text-[#cc785c]" },
            Enquiry:  { text: "Enquiry Prospect",     cls: "text-[#8e8b82]" },
            Inactive: { text: "Student Inactive",     cls: "text-[#c64545]" },
          };
          const { text, cls } = msgMap[st] || { text: "No Admission Yet", cls: "text-[#8e8b82]" };
          return <span className={`text-[11px] italic ${cls}`}>{text}</span>;
        }

        // Only show fee data if the student has a REAL admission record (fee + paymentStatus from backend)
        const hasRealAdmission = Boolean((s.totalFee || s.fees) && s.paymentStatus);

        if (!hasRealAdmission) {
          return <span className="text-[11px] text-[#8e8b82] italic">No Admission Yet</span>;
        }

        const feeNum = Number(s.totalFee || s.fees);
        const payStatus = s.paymentStatus;
        const admDate = s.admissionDate || s.admission?.admissionDate;
        return (
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#141413] tracking-tight">₹{feeNum.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <StatusBadge status={payStatus} />
              {admDate && (
                <span className="flex items-center gap-1 text-[10px] text-[#6c6a64] font-mono bg-[#efe9de] px-1.5 py-px rounded border border-[#e6dfd8]">
                  <Calendar className="h-3 w-3 text-[#cc785c] shrink-0" />
                  {formatDate(admDate)}
                </span>
              )}
            </div>
          </div>
        );
      },
    },

    /* Lead Stage Column */
    {
      id: "leadStage",
      accessorFn: (r) => r.leadStage || "Open",
      header: ({ column }) => <DataGridColumnHeader column={column} title="Enquiry Stage" />,
      size: 140,
      cell: ({ row }) => {
        const s = row.original;
        const currentStage = s.leadStage || "Open";
        const stages = ["Open", "CNR", "Call Back", "Stage 2", "Stage 2.5", "Admission Done"];

        const stageColors = {
          "Open": "bg-blue-500/15 text-blue-400 border-blue-500/30",
          "CNR": "bg-amber-500/15 text-amber-400 border-amber-500/30",
          "Call Back": "bg-purple-500/15 text-purple-400 border-purple-500/30",
          "Stage 2": "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
          "Stage 2.5": "bg-teal-500/15 text-teal-300 border-teal-500/30",
          "Admission Done": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        };

        return (
          <select
            value={currentStage}
            onChange={(e) => onStageChange?.(s.id || s.studentId, e.target.value)}
            className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-bold border focus:outline-none cursor-pointer",
              stageColors[currentStage] || stageColors["Open"]
            )}
          >
            {stages.map((st) => (
              <option key={st} value={st} className="bg-[#191816] text-[#faf9f5]">
                {st}
              </option>
            ))}
          </select>
        );
      },
    },

    /* Assigned Counsellor & Source */
    {
      id: "counselor",
      header: "Lead Source & Counsellor",
      size: 170,
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="space-y-0.5 text-xs">
            <span className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#efe9de] text-[#141413] border border-[#e6dfd8]">
              Source: {s.leadSource || "Website"}
            </span>
            <div className="text-[11px] text-[#6c6a64]">
              {s.assignedCounselorName ? (
                <span className="text-[#cc785c] font-semibold">👤 {s.assignedCounselorName}</span>
              ) : (
                <span className="text-[#8e8b82] italic">Unassigned</span>
              )}
            </div>
          </div>
        );
      },
    },

    /* Status */
    {
      id: "status",
      accessorFn: (r) => normalizeStatus(r.status),
      header: ({ column }) => <DataGridColumnHeader column={column} title="Status" />,
      size: 115,
      cell: ({ row }) => {
        const s = row.original;
        return (
          <StatusPill
            status={s.status}
            onSelect={(ns) => {
              if (onStatusChange) onStatusChange(s, ns);
              else onEdit?.({ ...s, status: ns });
            }}
          />
        );
      },
    },

    /* Actions — pencil icon + three-dot menu (matches target image) */
    {
      id: "actions",
      header: "Actions",
      size: 80,
      enableSorting: false,
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            {/* Pencil / Edit icon button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); onEdit?.(s); }}
              className="h-8 w-8 rounded-md text-[#6c6a64] hover:text-[#cc785c] hover:bg-[#efe9de] transition"
              title="Edit student"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {/* Three-dot menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md text-[#6c6a64] hover:text-[#141413] hover:bg-[#efe9de] transition"
                  title="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl border-[#e6dfd8] bg-white shadow-xl">
                {onView && (
                  <DropdownMenuItem onClick={() => onView?.(s)} className="gap-2 cursor-pointer">
                    <Eye className="h-3.5 w-3.5 text-[#cc785c]" />
                    <span className="text-xs font-semibold">View Profile</span>
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit?.(s)} className="gap-2 cursor-pointer">
                    <Pencil className="h-3.5 w-3.5 text-[#cc785c]" />
                    <span className="text-xs font-semibold">Edit Student</span>
                  </DropdownMenuItem>
                )}
                {(onView || onEdit) && onDelete && <DropdownMenuSeparator />}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete?.(s)}
                    className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold">Delete</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [onView, onEdit, onDelete, onStatusChange]);

  const table = useTable({
    features: dataGridFeatures,
    data: students,
    columns,
    initialState: { pagination: { pageSize: 10, pageIndex: 0 } },
    getRowId: (row, idx) => String(row.id || row.studentId || idx),
  });

  /* ── Loading State ── */
  if (loading) {
    return <LoadingState message="Loading Student Partner Directory..." rows={5} />;
  }

  /* ── Empty State ── */
  if (students.length === 0) {
    return (
      <div className="w-full rounded-xl border border-[#e6dfd8] bg-[#faf9f5] py-14 text-center">
        <GraduationCap className="h-8 w-8 text-[#cc785c]/40 mx-auto mb-3" />
        <p className="text-sm font-medium text-[#6c6a64]">No student records found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* ── Mobile card view (< md) ── */}
      <div className="block md:hidden space-y-3">
        {students.map((s, i) => {
          const name = s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim() || "Student";
          const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
          const avatar = `https://api.dicebear.com/10.x/glyphs/svg?seed=${encodeURIComponent(name)}`;
          const st = normalizeStatus(s.status);
          const feeVal = Number(s.totalFee || s.fees || 0);
          return (
            <div key={s.id || i} className="bg-white border border-[#e6dfd8] rounded-xl p-4 space-y-3 shadow-sm hover:border-[#cc785c]/40 transition">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-1 ring-[#cc785c]/30 shrink-0">
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback className="bg-[#cc785c] text-white font-bold text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p onClick={() => onView?.(s)} className="font-semibold text-sm text-[#141413] hover:text-[#cc785c] cursor-pointer">
                      {name}
                    </p>
                  </div>
                </div>
                <StatusPill status={st} onSelect={(ns) => { if (onStatusChange) onStatusChange(s, ns); else onEdit?.({ ...s, status: ns }); }} />
              </div>
              <div className="flex items-center gap-2 text-xs bg-[#efe9de] px-2.5 py-1.5 rounded-lg border border-[#e6dfd8]">
                <GraduationCap className="h-3.5 w-3.5 text-[#cc785c] shrink-0" />
                <span className="font-semibold text-[#141413] truncate">{s.course || s.courseName || "Java Full Stack"}</span>
                {feeVal > 0 && <span className="ml-auto font-bold text-[#141413] shrink-0">₹{feeVal.toLocaleString()}</span>}
              </div>
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#e6dfd8]">
                {onView && <Button type="button" variant="ghost" size="sm" onClick={() => onView?.(s)} className="h-7 px-2 text-xs gap-1 text-[#6c6a64] hover:bg-[#efe9de]"><Eye className="h-3.5 w-3.5" /> View</Button>}
                {onEdit && <Button type="button" variant="ghost" size="sm" onClick={() => onEdit?.(s)} className="h-7 px-2 text-xs gap-1 text-[#cc785c] hover:bg-[#efe9de]"><Pencil className="h-3.5 w-3.5" /> Edit</Button>}
                {onDelete && <Button type="button" variant="ghost" size="sm" onClick={() => onDelete?.(s)} className="h-7 px-2 text-xs gap-1 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Delete</Button>}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop ReUI DataGrid ── */}
      <div className="hidden md:block w-full rounded-xl border border-[#e6dfd8] bg-white shadow-sm overflow-hidden">
        <DataGrid
          table={table}
          recordCount={students.length}
          tableLayout={{ rowBorder: true, headerBackground: true }}
          tableClassNames={{ base: "text-xs" }}
        >
          <DataGridContainer>
            <DataGridScrollArea>
              <DataGridTable />
            </DataGridScrollArea>
            <div className="border-t border-[#e6dfd8] px-4 py-2 bg-[#faf9f5]">
              <DataGridPagination />
            </div>
          </DataGridContainer>
        </DataGrid>
      </div>
    </div>
  );
}

export default StudentTable;