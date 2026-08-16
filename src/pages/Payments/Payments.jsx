import { useState, useEffect } from "react";
import Layout from "../../Components/layout/Layout";
import { Card, CardContent } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Badge } from "../../Components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../Components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "../../Components/ui/dialog";
import { Select } from "../../Components/ui/select";
import { useToast } from "../../Components/ui/toast";
import { CreditCard, DollarSign, Clock, CheckCircle2, Plus, Search, ArrowUpRight, Star, Download, FileSpreadsheet, Mail, FileText, Sparkles } from "lucide-react";
import { getPayments, addPayment } from "../../services/paymentService";
import { getAdmissions } from "../../services/admissionService";
import { exportToExcel, exportToPDF } from "../../lib/exportUtils";
import { generatePaymentReceiptPDF, sendReceiptEmailAPI } from "../../lib/receiptUtils";
import EmailReceiptModal from "../../Components/common/EmailReceiptModal";
import StripePaymentModal from "../../Components/common/StripePaymentModal";

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

  const handleLaunchStripeDirect = (pData = null) => {
    const dataToUse = pData || {
      studentName: newPayment.studentName || "Student Partner",
      studentEmail: newPayment.studentEmail || "student@gmail.com",
      courseName: newPayment.course || "Java Full Stack",
      amount: Number(newPayment.amount || 25000),
      notes: "Direct Stripe Fee Checkout",
    };
    setStripePaymentData(dataToUse);
    setOpenStripeModal(true);
  };

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

    const payload = {
      ...newPayment,
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      studentEmail: newPayment.studentEmail || "student@gmail.com",
      amount: Number(newPayment.amount),
      date: new Date().toISOString().split("T")[0],
    };

    try {
      const res = await addPayment(payload);
      if (res && res.data) {
        const created = res.data;
        setPayments((prev) => [created, ...prev.filter((p) => String(p.id) !== String(created.id))]);
      } else {
        setPayments((prev) => [payload, ...prev.filter((p) => String(p.id) !== String(payload.id))]);
      }
    } catch (error) {
      console.log("API add payment simulation:", error);
      setPayments((prev) => [payload, ...prev.filter((p) => String(p.id) !== String(payload.id))]);
    }

    showToast(`Processed fee receipt for ₹${payload.amount.toLocaleString()}!`, "info");
    setOpenModal(false);

    sendReceiptEmailAPI(payload);
    generatePaymentReceiptPDF(payload);

    setSelectedReceipt(payload);
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
  };

  const handleOpenReceiptEmail = (p) => {
    sendReceiptEmailAPI(p);
    setSelectedReceipt(p);
    setOpenEmailModal(true);
  };

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

  const [statusTab, setStatusTab] = useState("all");

  // Combine explicit payments and admissions desk transactions for complete financial view
  const getCombinedPaymentsList = () => {
    const list = [];
    const addedIds = new Set();

    // 1. Add explicit payment records
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

    // 2. Combine with admissions desk student payment records & EMI schedules
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

  const totalCollected = allCombinedPayments
    .filter((p) => p.status === "Completed")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const pendingDues = allCombinedPayments
    .filter((p) => p.status === "Pending")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalPotential = totalCollected + pendingDues;
  const collectionRate = totalPotential > 0 ? ((totalCollected / totalPotential) * 100).toFixed(1) : "100.0";

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-normal text-[#141413] tracking-tight font-serif-display flex items-center gap-2">
            <span className="text-[#cc785c] font-bold text-2xl">✱</span>
            Fee Transactions & Financials
          </h1>
          <p className="text-sm text-[#6c6a64] font-medium mt-1">
            Track student fee receipts, payment modes, and financial transactions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button onClick={handleExportExcel} variant="outline" size="sm" className="gap-1.5 border-[#e6dfd8] bg-[#faf9f5] hover:bg-[#efe9de] text-[#141413]">
            <FileSpreadsheet className="h-4 w-4 text-[#00754A]" /> Export Excel
          </Button>

          <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-1.5 border-[#e6dfd8] bg-[#faf9f5] hover:bg-[#efe9de] text-[#141413]">
            <Download className="h-4 w-4 text-[#cc785c]" /> Export PDF Sheet
          </Button>

          <Button
            onClick={() => handleLaunchStripeDirect()}
            variant="outline"
            size="sm"
            className="gap-1.5 border-[#635bff] text-[#635bff] bg-[#faf9f5] font-bold hover:bg-[#635bff]/10"
          >
            <Sparkles className="h-4 w-4" /> Stripe Test Checkout
          </Button>

          <Button
            onClick={() => setOpenModal(true)}
            variant="primary"
            className="shadow-xs gap-2 bg-[#cc785c] hover:bg-[#a9583e]"
          >
            <Plus className="h-4 w-4" /> Record Fee Receipt
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-[#efe9de] border-[#e6dfd8] shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#6c6a64] uppercase">Total Fee Collected</p>
              <h2 className="text-2xl font-normal font-serif-display text-[#141413] mt-2">₹{totalCollected.toLocaleString()}</h2>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#faf9f5] text-[#00754A] border border-[#e6dfd8] flex items-center justify-center font-bold">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-[#efe9de] border-[#e6dfd8] shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#6c6a64] uppercase">Pending Dues</p>
              <h2 className="text-2xl font-normal font-serif-display text-[#141413] mt-2">₹{pendingDues.toLocaleString()}</h2>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#faf6ee] text-[#cba258] border border-[#cba258] flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-[#efe9de] border-[#e6dfd8] shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#6c6a64] uppercase">Successful Receipts</p>
              <h2 className="text-2xl font-normal font-serif-display text-[#141413] mt-2">{payments.filter(p => p.status === "Completed").length}</h2>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#faf9f5] text-[#cc785c] border border-[#e6dfd8] flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-[#faf6ee] border border-[#cba258] shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#cba258] uppercase flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" /> Collection Rate
              </p>
              <h2 className="text-2xl font-normal font-serif-display text-[#141413] mt-2">{collectionRate}%</h2>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#cba258] text-white flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Transactions Table */}
      <Card className="bg-[#efe9de] border-[#e6dfd8]">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-[#f2f0eb] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setStatusTab("all")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  statusTab === "all" ? "bg-white text-[#006241] shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Transactions ({allCombinedPayments.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusTab("completed")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  statusTab === "completed" ? "bg-white text-[#00754A] shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Completed Receipts ({allCombinedPayments.filter(p => p.status === "Completed").length})
              </button>
              <button
                type="button"
                onClick={() => setStatusTab("pending")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  statusTab === "pending" ? "bg-white text-[#cba258] shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pending Dues ({allCombinedPayments.filter(p => p.status === "Pending").length})
              </button>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2 max-w-md w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search student, txn ID, or course..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 rounded-full bg-[#f2f0eb] border-slate-200 text-xs h-9"
                />
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Txn ID</TableHead>
                <TableHead>Student Partner</TableHead>
                <TableHead>Course Track</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Receipt Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((p) => (
                <TableRow key={p.id} className={p.status === "Pending" ? "bg-[#faf6ee]/50" : ""}>
                  <TableCell className="font-mono text-xs font-bold text-[#00754A]">{p.id}</TableCell>
                  <TableCell className="font-extrabold text-[#1E3932] text-sm">
                    {p.studentName}
                    {p.notes && <span className="block text-[11px] text-slate-500 font-normal">{p.notes}</span>}
                  </TableCell>
                  <TableCell className="text-slate-700 text-sm font-bold">{p.course || p.courseName}</TableCell>
                  <TableCell className="text-slate-600 text-sm font-semibold">{p.method || p.paymentMethod}</TableCell>
                  <TableCell className="font-extrabold text-[#1E3932] text-sm">₹{(p.amount || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-slate-500 text-sm font-medium">{p.date}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "Completed" ? "greenLight" : "warning"}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {p.status === "Pending" ? (
                      <Button
                        size="xs"
                        variant="stripe"
                        onClick={() => handleLaunchStripeDirect(p)}
                        className="gap-1 text-xs font-bold px-2.5 py-1 rounded-lg"
                      >
                        <CreditCard className="h-3.5 w-3.5" /> Pay ₹{(p.amount || 0).toLocaleString()}
                      </Button>
                    ) : (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleOpenReceiptEmail(p)}
                        className="gap-1 text-xs border-slate-200"
                      >
                        <Mail className="h-3.5 w-3.5 text-[#006241]" /> Receipt Email
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal to record fee receipt */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent onClose={() => setOpenModal(false)}>
          <DialogHeader>
            <DialogTitle>Record Fee Payment Receipt</DialogTitle>
            <DialogDescription>
              Add a new fee transaction record for an enrolled student.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePayment} className="flex flex-col flex-1 overflow-hidden">
            <DialogBody className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E3932] uppercase">Student Partner Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={newPayment.studentName}
                  onChange={(e) => setNewPayment({ ...newPayment, studentName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E3932] uppercase">Student Email Address</label>
                <Input
                  type="email"
                  placeholder="e.g. alex.rivera@tech.org"
                  value={newPayment.studentEmail}
                  onChange={(e) => setNewPayment({ ...newPayment, studentEmail: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E3932] uppercase">Course Track</label>
                <Input
                  type="text"
                  placeholder="e.g. Java Full Stack"
                  value={newPayment.course}
                  onChange={(e) => setNewPayment({ ...newPayment, course: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E3932] uppercase">Amount Paid (INR)</label>
                <Input
                  type="number"
                  placeholder="e.g. 25000"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E3932] uppercase">Payment Mode</label>
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
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="shadow-md">
                Generate Receipt & Auto-Email
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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