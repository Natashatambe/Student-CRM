import { useState, useEffect, useMemo, useCallback } from "react";
import Layout from "../../Components/layout/Layout";
import { Card, CardContent } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../../Components/ui/sheet";
import { Select } from "../../Components/ui/select";
import { useToast } from "../../Components/ui/toast";
import { CreditCard, DollarSign, Clock, CheckCircle2, Plus, Search, ArrowUpRight, Download, FileSpreadsheet, Mail, Sparkles, User, BookOpen } from "lucide-react";
import { useTable } from "@tanstack/react-table";
import { dataGridFeatures, DataGrid, DataGridContainer } from "../../Components/reui/data-grid/data-grid";
import { DataGridScrollArea } from "../../Components/reui/data-grid/data-grid-scroll-area";
import { DataGridTable } from "../../Components/reui/data-grid/data-grid-table";
import { DataGridColumnHeader } from "../../Components/reui/data-grid/data-grid-column-header";
import { DataGridPagination } from "../../Components/reui/data-grid/data-grid-pagination";
import { getPayments, addPayment } from "../../services/paymentService";
import { getAdmissions } from "../../services/admissionService";
import { exportToExcel, exportToPDF } from "../../lib/exportUtils";
import { generatePaymentReceiptPDF, sendReceiptEmailAPI } from "../../lib/receiptUtils";
import EmailReceiptModal from "../../Components/common/EmailReceiptModal";
import StripePaymentModal from "../../Components/common/StripePaymentModal";
import PageHeader from "../../Components/common/PageHeader";
import StatCard from "../../Components/common/StatCard";
import StatusBadge from "../../Components/common/StatusBadge";
import LoadingState from "../../Components/common/LoadingState";

function Payments() {
  const { showToast } = useToast();

  const [payments, setPayments] = useState([]);
  const [admissions, setAdmissions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [openStripeModal, setOpenStripeModal] = useState(false);
  const [stripePaymentData, setStripePaymentData] = useState(null);

  const [statusTab, setStatusTab] = useState("all");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [newPayment, setNewPayment] = useState({
    studentName: "",
    studentEmail: "",
    course: "",
    amount: "",
    method: "Stripe Test Card",
    status: "Completed",
  });

  const loadPaymentsFromBackend = async () => {
    try {
      setLoading(true);
      const [payRes, admRes] = await Promise.allSettled([getPayments(), getAdmissions()]);
      if (payRes.status === "fulfilled" && payRes.value?.data) {
        let list = Array.isArray(payRes.value.data) ? payRes.value.data : (payRes.value.data.data || []);
        setPayments(list);
      }
      if (admRes.status === "fulfilled" && admRes.value?.data) {
        let list = Array.isArray(admRes.value.data) ? admRes.value.data : (admRes.value.data.data || []);
        setAdmissions(list);
      }
    } catch (error) {
      console.log("Payments API loaded with fallback data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentsFromBackend();
    const params = new URLSearchParams(window.location.search);
    const q = params.get("search");
    if (q) setSearch(q);
  }, []);



  const handleLaunchStripeDirect = useCallback((pData = null) => {
    const dataToUse = pData || {
      studentName: newPayment.studentName || "Student Partner",
      studentEmail: newPayment.studentEmail || "student@gmail.com",
      courseName: newPayment.course || "Java Full Stack",
      amount: Number(newPayment.amount || 25000),
      notes: "Direct Stripe Fee Checkout",
    };
    setStripePaymentData(dataToUse);
    setOpenStripeModal(true);
  }, [newPayment]);

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    if (!newPayment.studentName || !newPayment.amount) {
      alert("Please fill student name and amount");
      return;
    }

    if (newPayment.method === "Stripe Test Card") {
      setOpenModal(false);
      handleLaunchStripeDirect({
        studentName: newPayment.studentName,
        studentEmail: newPayment.studentEmail || "student@gmail.com",
        courseName: newPayment.course || "Java Full Stack",
        amount: Number(newPayment.amount),
        notes: "Stripe Test Gateway Checkout",
      });
      return;
    }

    const txnId = `TXN-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split("T")[0];

    // Build payload with field names matching backend PaymentDTO
    const payload = {
      paymentId: txnId,
      studentName: newPayment.studentName,
      studentEmail: newPayment.studentEmail || "student@gmail.com",
      course: newPayment.course,
      amount: Number(newPayment.amount),
      paymentDate: today,
      paymentMode: newPayment.method,
      paymentStatus: newPayment.status || "Completed",
    };

    // Local display record (uses same field names for consistency)
    const localRecord = {
      ...payload,
      id: txnId,
      date: today,
      method: newPayment.method,
      status: newPayment.status || "Completed",
      courseName: newPayment.course,
    };

    try {
      const res = await addPayment(payload);
      if (res && res.data) {
        const created = { ...localRecord, ...res.data };
        setPayments((prev) => [created, ...prev.filter((p) => String(p.id || p.paymentId) !== String(created.id || created.paymentId))]);
      } else {
        setPayments((prev) => [localRecord, ...prev.filter((p) => String(p.id || p.paymentId) !== String(localRecord.id))]);
      }
    } catch (error) {
      console.log("API add payment simulation:", error);
      setPayments((prev) => [localRecord, ...prev.filter((p) => String(p.id || p.paymentId) !== String(localRecord.id))]);
    }

    showToast(`Processed fee receipt for ₹${payload.amount.toLocaleString()}!`, "info");
    setOpenModal(false);

    sendReceiptEmailAPI(localRecord);
    generatePaymentReceiptPDF(localRecord);

    setSelectedReceipt(localRecord);
    setOpenEmailModal(true);

    setNewPayment({
      studentName: "",
      studentEmail: "",
      course: "",
      amount: "",
      method: "Stripe Test Card",
      status: "Completed",
    });
  };

  const handleStripeSuccessCallback = (stripeReceipt) => {
    setPayments((prev) => [stripeReceipt, ...prev.filter((p) => String(p.id) !== String(stripeReceipt.id))]);
    addPayment(stripeReceipt);
    showToast(`🎉 Stripe Test Payment Completed for ₹${stripeReceipt.amount.toLocaleString()}!`, "success");
    setOpenStripeModal(false);
    // Auto-open receipt modal for stripe payment
    setSelectedReceipt(stripeReceipt);
    setOpenEmailModal(true);
  };

  const handleOpenReceiptEmail = useCallback((p) => {
    sendReceiptEmailAPI(p);
    setSelectedReceipt(p);
    setOpenEmailModal(true);
  }, []);

  const handleExportExcel = () => {
    const exportData = filteredPayments.map((p) => ({
      "Txn ID": p.id,
      "Student Name": p.studentName,
      Course: p.course,
      Method: p.method,
      "Amount (INR)": p.amount,
      Date: p.date,
      Status: p.status,
    }));
    exportToExcel(exportData, "Fee_Transactions");
    showToast("Exported Fee Receipts to Excel Sheet!", "success");
  };

  const handleExportPDF = () => {
    const headers = ["Txn ID", "Student Name", "Course Track", "Mode", "Amount", "Date", "Status"];
    const rows = filteredPayments.map((p) => [
      p.id,
      p.studentName,
      p.course,
      p.method,
      `₹${Number(p.amount || 0).toLocaleString()}`,
      p.date,
      p.status,
    ]);
    exportToPDF("Fee Transactions & Receipts Report", headers, rows, "Fee_Transactions_PDF");
    showToast("Exported PDF Report Sheet!", "success");
  };

  const getCombinedPaymentsList = () => {
    const list = [];
    const addedIds = new Set();

    payments.forEach((p) => {
      const key = String(p.id || p.txnId).toLowerCase();
      addedIds.add(key);
      list.push({
        ...p,
        id: p.id || p.txnId || `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        studentName: p.studentName || p.student?.name || "Student Partner",
        studentEmail: p.studentEmail || p.student?.email || "student@gmail.com",
        course: p.course || p.courseName || p.course?.name || "Java Full Stack",
        method: p.method || p.paymentMethod || "Stripe / UPI",
        amount: Number(p.amount || p.totalFee || 0),
        date: p.date || p.admissionDate || new Date().toISOString().split("T")[0],
        status: p.status || "Completed",
      });
    });

    admissions.forEach((a, idx) => {
      const sName = a.studentName || (typeof a.student === "string" ? a.student : (a.student?.name || `${a.student?.firstName || ""} ${a.student?.lastName || ""}`.trim())) || "Student Partner";
      const sMail = a.studentEmail || a.student?.email || "student@gmail.com";
      const cName = a.courseName || a.course?.name || (typeof a.course === "string" ? a.course : null) || "Java Full Stack";
      const totalFeeNum = Number(a.totalFee || a.fee || 50000);
      const statusStr = (a.paymentStatus || "").toLowerCase();
      const isEmi = String(a.paymentType || "").toUpperCase() === "EMI" || Boolean(a.emiTenure && Number(a.emiTenure) > 1);

      if (isEmi) {
        const tenure = Number(a.emiTenure || 3);
        const monthlyFee = Number(a.emiMonthlyAmount || Math.round(totalFeeNum / tenure));
        const paidCount = Number(a.emiPaidCount || (statusStr === "paid" ? tenure : 1));

        for (let i = 1; i <= tenure; i++) {
          const key = `txn-emi-${a.id || a.studentId || idx}-${i}`;
          if (!addedIds.has(key)) {
            addedIds.add(key);
            const isPaid = i <= paidCount;
            list.push({
              id: `TXN-EMI-${a.studentId || a.id || (100 + idx)}-${i}`,
              studentName: sName,
              studentEmail: sMail,
              course: cName,
              amount: monthlyFee,
              method: "EMI Installment",
              date: a.admissionDate || new Date().toISOString().split("T")[0],
              status: isPaid ? "Completed" : "Pending",
              notes: isPaid ? `EMI Installment #${i} of ${tenure} (Paid)` : `EMI Installment #${i} of ${tenure} (Due Pending)`,
              isDueItem: !isPaid,
            });
          }
        }
      } else if (statusStr === "paid" || statusStr === "completed") {
        const key = `txn-adm-${a.id || a.studentId || idx}`;
        if (!addedIds.has(key)) {
          addedIds.add(key);
          list.push({
            id: `TXN-ADM-${101 + idx}`,
            studentName: sName,
            studentEmail: sMail,
            course: cName,
            amount: totalFeeNum,
            method: a.paymentType || "Full Payment",
            date: a.admissionDate || new Date().toISOString().split("T")[0],
            status: "Completed",
            notes: "Full Admission Fee Paid",
          });
        }
      } else {
        const key = `due-adm-${a.id || a.studentId || idx}`;
        if (!addedIds.has(key)) {
          addedIds.add(key);
          list.push({
            id: `DUE-ADM-${101 + idx}`,
            studentName: sName,
            studentEmail: sMail,
            course: cName,
            amount: totalFeeNum,
            method: a.paymentType || "Full Fee",
            date: a.admissionDate || "Pending",
            status: "Pending",
            notes: "Full Admission Fee Due",
            isDueItem: true,
          });
        }
      }
    });

    return list;
  };

  const allCombinedPayments = getCombinedPaymentsList();

  const filteredPayments = allCombinedPayments.filter((p) => {
    const text = search.toLowerCase();
    const matchesSearch =
      (p.studentName || "").toLowerCase().includes(text) ||
      (p.id || "").toLowerCase().includes(text) ||
      (p.course || "").toLowerCase().includes(text) ||
      (p.method || "").toLowerCase().includes(text);

    if (!matchesSearch) return false;

    if (statusTab === "completed") return p.status === "Completed";
    if (statusTab === "pending") return p.status === "Pending";
    return true;
  });

  // Reset to page 0 whenever filter/search changes
  const handleSetStatusTab = useCallback((tab) => {
    setStatusTab(tab);
    setPageIndex(0);
  }, []);

  const handleSetSearch = useCallback((val) => {
    setSearch(val);
    setPageIndex(0);
  }, []);

  const totalCollected = allCombinedPayments
    .filter((p) => p.status === "Completed")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const pendingDues = allCombinedPayments
    .filter((p) => p.status === "Pending")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalPotential = totalCollected + pendingDues;
  const collectionRate = totalPotential > 0 ? ((totalCollected / totalPotential) * 100).toFixed(1) : "100.0";

  // Columns are stable — they don't depend on filteredPayments.
  // Removing filteredPayments from deps prevents the table from being
  // reconstructed (and pagination reset) on every search/filter change.
  const paymentsColumns = useMemo(() => [
    {
      id: "student",
      accessorKey: "studentName",
      header: ({ column }) => <DataGridColumnHeader column={column} title="Student Partner" />,
      size: 200,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div>
            <span className="font-semibold text-[#141413] text-xs">{p.studentName}</span>
            {p.notes && <span className="block text-[11px] text-[#6c6a64] font-medium">{p.notes}</span>}
          </div>
        );
      },
    },
    {
      id: "course",
      accessorFn: (row) => row.course || row.courseName,
      header: ({ column }) => <DataGridColumnHeader column={column} title="Course Track" />,
      size: 160,
      cell: ({ getValue }) => <span className="text-[#141413] text-xs font-semibold">{getValue()}</span>,
    },
    {
      id: "method",
      accessorFn: (row) => row.method || row.paymentMethod,
      header: ({ column }) => <DataGridColumnHeader column={column} title="Payment Method" />,
      size: 150,
      cell: ({ getValue }) => <span className="text-[#6c6a64] text-xs font-semibold">{getValue()}</span>,
    },
    {
      id: "amount",
      accessorKey: "amount",
      header: ({ column }) => <DataGridColumnHeader column={column} title="Amount" />,
      size: 110,
      cell: ({ getValue }) => <span className="font-bold text-[#141413] text-xs tracking-tight">₹{(getValue() || 0).toLocaleString()}</span>,
    },
    {
      id: "date",
      accessorKey: "date",
      header: ({ column }) => <DataGridColumnHeader column={column} title="Date" />,
      size: 110,
      cell: ({ getValue }) => <span className="text-[#6c6a64] text-xs font-medium whitespace-nowrap">{getValue()}</span>,
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => <DataGridColumnHeader column={column} title="Status" />,
      size: 110,
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    },
    {
      id: "actions",
      header: "Receipt Action",
      size: 200,
      enableSorting: false,
      cell: ({ row }) => {
        const p = row.original;
        const isEmi = (p.method || "").toLowerCase().includes("emi");
        if (p.status === "Pending") {
          return (
            <Button size="xs" variant="stripe" onClick={() => handleLaunchStripeDirect(p)}
              className="gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-[#635bff] hover:bg-[#534ae4] text-white">
              <CreditCard className="h-3.5 w-3.5" /> Pay ₹{(p.amount || 0).toLocaleString()}
            </Button>
          );
        }
        return (
          <div className="flex items-center gap-1.5">
            <Button size="xs" variant="outline" onClick={() => handleOpenReceiptEmail(p)}
              className="gap-1 text-xs border-[#e6dfd8] bg-[#faf9f5] hover:bg-[#efe9de] text-[#141413]">
              <Mail className="h-3.5 w-3.5 text-[#cc785c]" />
              {isEmi ? "EMI Receipt" : "Receipt Email"}
            </Button>
            <Button size="xs" variant="outline" onClick={() => { generatePaymentReceiptPDF(p); }}
              className="gap-1 text-xs border-[#e6dfd8] bg-[#faf9f5] hover:bg-[#efe9de] text-[#141413]">
              <Download className="h-3.5 w-3.5 text-[#00754A]" /> PDF
            </Button>
          </div>
        );
      },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [handleLaunchStripeDirect, handleOpenReceiptEmail]);

  const paymentsTable = useTable({
    features: dataGridFeatures,
    data: filteredPayments,
    columns: paymentsColumns,
    // Controlled pagination state — managed by our local state so we can
    // reset the page index to 0 whenever the filter or search changes.
    state: {
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === "function"
        ? updater({ pageIndex, pageSize })
        : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    // Also let TanStack reset the page automatically when the data array
    // changes (e.g. new payment added, admissions reload).
    autoResetPageIndex: true,
    getRowId: (row, idx) => String(row.id || idx),
  });

  return (
    <Layout>
      {/* Header */}
      <PageHeader
        title="Fee Transactions & Financials"
        description="Track student fee receipts, payment modes, and financial transactions"
        categoryTag="Financial Intelligence"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button onClick={handleExportExcel} variant="outline" size="sm" className="gap-1.5 border-[#e6dfd8] bg-[#faf9f5]">
              <FileSpreadsheet className="h-3.5 w-3.5 text-[#00754A]" /> Export Excel
            </Button>

            <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-1.5 border-[#e6dfd8] bg-[#faf9f5]">
              <Download className="h-3.5 w-3.5 text-[#cc785c]" /> Export PDF Sheet
            </Button>

            <Button
              onClick={() => handleLaunchStripeDirect()}
              variant="outline"
              size="sm"
              className="gap-1.5 border-[#635bff] text-[#635bff] bg-[#faf9f5] font-bold hover:bg-[#635bff]/10"
            >
              <Sparkles className="h-3.5 w-3.5" /> Stripe Test Checkout
            </Button>

            <Button
              onClick={() => setOpenModal(true)}
              variant="primary"
              size="sm"
              className="shadow-xs gap-1.5 bg-[#cc785c] hover:bg-[#a9583e]"
            >
              <Plus className="h-3.5 w-3.5" /> Record Fee Receipt
            </Button>
          </div>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          title="TOTAL FEE COLLECTED"
          value={`₹${totalCollected.toLocaleString()}`}
          subtitle="Processed fee payments"
          icon={DollarSign}
        />

        <StatCard
          title="PENDING DUES"
          value={`₹${pendingDues.toLocaleString()}`}
          subtitle="Outstanding installments"
          icon={Clock}
        />

        <StatCard
          title="SUCCESSFUL RECEIPTS"
          value={payments.filter((p) => p.status === "Completed").length}
          subtitle="Total verified receipts"
          icon={CheckCircle2}
        />

        <StatCard
          title="COLLECTION RATE"
          value={`${collectionRate}%`}
          subtitle="Revenue velocity"
          icon={ArrowUpRight}
          badgeText="Performance"
        />
      </div>

      {/* Main Transactions Table */}
      <Card className="bg-[#efe9de] border-[#e6dfd8]">
        <CardContent className="p-4 md:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-[#faf9f5] p-1 rounded-xl border border-[#e6dfd8]">
              <button
                type="button"
                onClick={() => handleSetStatusTab("all")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  statusTab === "all" ? "bg-[#efe9de] text-[#cc785c] font-bold shadow-2xs" : "text-[#6c6a64] hover:text-[#141413]"
                }`}
              >
                All Transactions ({allCombinedPayments.length})
              </button>
              <button
                type="button"
                onClick={() => handleSetStatusTab("completed")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  statusTab === "completed" ? "bg-[#efe9de] text-[#00754A] font-bold shadow-2xs" : "text-[#6c6a64] hover:text-[#141413]"
                }`}
              >
                Completed Receipts ({allCombinedPayments.filter((p) => p.status === "Completed").length})
              </button>
              <button
                type="button"
                onClick={() => handleSetStatusTab("pending")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  statusTab === "pending" ? "bg-[#efe9de] text-[#cc785c] font-bold shadow-2xs" : "text-[#6c6a64] hover:text-[#141413]"
                }`}
              >
                Pending Dues ({allCombinedPayments.filter((p) => p.status === "Pending").length})
              </button>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2 max-w-md w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#8e8b82]" />
                <Input
                  type="text"
                  placeholder="Search student, txn ID, or course..."
                  value={search}
                  onChange={(e) => handleSetSearch(e.target.value)}
                  className="pl-10 rounded-xl bg-[#faf9f5] border-[#e6dfd8] text-xs h-9"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingState message="Loading Fee Transactions & Payments..." rows={5} />
          ) : (
            <div className="rounded-xl border border-[#e6dfd8] overflow-hidden">
              <DataGrid
                table={paymentsTable}
                recordCount={filteredPayments.length}
                tableLayout={{ rowBorder: true, headerBackground: true }}
                tableClassNames={{ base: "text-xs" }}
              >
                <DataGridContainer>
                  <DataGridScrollArea>
                    <DataGridTable />
                  </DataGridScrollArea>
                  {filteredPayments.length === 0 ? (
                    <div className="text-center py-12 text-[#6c6a64] font-medium text-sm">
                      No fee transactions found matching your search.
                    </div>
                  ) : (
                    <div className="border-t border-[#e6dfd8] px-4 py-2">
                      <DataGridPagination />
                    </div>
                  )}
                </DataGridContainer>
              </DataGrid>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sheet Slide-Over Drawer for Record Fee Receipt */}
      <Sheet open={openModal} onOpenChange={setOpenModal}>
        <SheetContent side="right" className="sm:max-w-md" onClose={() => setOpenModal(false)}>
          <SheetHeader>
            <SheetTitle>
              <CreditCard className="h-5 w-5 text-[#cc785c]" />
              Record Fee Payment Receipt
              <Sparkles className="h-3.5 w-3.5 text-[#cc785c] fill-current" />
            </SheetTitle>
            <SheetDescription>
              Add a new fee transaction record for an enrolled student partner.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleCreatePayment} className="flex flex-col flex-1 justify-between space-y-4 py-1">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#141413] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[#cc785c]" /> Student Partner Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={newPayment.studentName}
                  onChange={(e) => setNewPayment({ ...newPayment, studentName: e.target.value })}
                  className="bg-white border-[#e6dfd8] rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#141413] uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#cc785c]" /> Student Email Address
                </label>
                <Input
                  type="email"
                  placeholder="e.g. alex.rivera@tech.org"
                  value={newPayment.studentEmail}
                  onChange={(e) => setNewPayment({ ...newPayment, studentEmail: e.target.value })}
                  className="bg-white border-[#e6dfd8] rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#141413] uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-[#cc785c]" /> Course Track
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Java Full Stack"
                  value={newPayment.course}
                  onChange={(e) => setNewPayment({ ...newPayment, course: e.target.value })}
                  className="bg-white border-[#e6dfd8] rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#141413] uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-[#cc785c]" /> Amount Paid (INR)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 25000"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  className="bg-white border-[#e6dfd8] rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#141413] uppercase tracking-wider flex items-center gap-1.5">
                  Payment Mode
                </label>
                <Select
                  value={newPayment.method}
                  onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                >
                  <option value="Stripe Test Card">Stripe Test Card (Visa / Mastercard)</option>
                  <option value="UPI / GPay">UPI / GPay / PhonePe</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  <option value="Cash Deposit">Cash Deposit</option>
                </Select>
              </div>
            </div>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setOpenModal(false)} className="border-[#e6dfd8] bg-[#faf9f5]">
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="bg-[#cc785c] hover:bg-[#a9583e] text-white shadow-md font-bold">
                Generate Receipt & Auto-Email
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Email Receipt Preview Modal */}
      {openEmailModal && selectedReceipt && (
        <EmailReceiptModal
          open={openEmailModal}
          setOpen={setOpenEmailModal}
          receiptData={selectedReceipt}
        />
      )}

      {/* Stripe Payment Modal */}
      {openStripeModal && (
        <StripePaymentModal
          open={openStripeModal}
          setOpen={setOpenStripeModal}
          onClose={() => setOpenStripeModal(false)}
          paymentData={stripePaymentData}
          onPaymentSuccess={handleStripeSuccessCallback}
        />
      )}
    </Layout>
  );
}

export default Payments;