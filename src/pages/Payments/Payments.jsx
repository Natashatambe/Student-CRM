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
import { CreditCard, DollarSign, Clock, CheckCircle2, Plus, Search, ArrowUpRight, Star, Download, FileSpreadsheet, Mail, FileText } from "lucide-react";
import { getPayments, addPayment } from "../../services/paymentService";
import { getAdmissions } from "../../services/admissionService";
import { exportToExcel, exportToPDF } from "../../lib/exportUtils";
import { generatePaymentReceiptPDF, sendReceiptEmailAPI } from "../../lib/receiptUtils";
import EmailReceiptModal from "../../Components/common/EmailReceiptModal";

function Payments() {
  const { showToast } = useToast();

  const [payments, setPayments] = useState([]);
  const [admissions, setAdmissions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const [newPayment, setNewPayment] = useState({
    studentName: "",
    studentEmail: "",
    course: "",
    amount: "",
    method: "UPI / GPay",
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

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    if (!newPayment.studentName || !newPayment.amount) {
      alert("Please fill student name and amount");
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

    // Auto send receipt email & PDF download
    sendReceiptEmailAPI(payload);
    generatePaymentReceiptPDF(payload);

    // Open email modal preview
    setSelectedReceipt(payload);
    setOpenEmailModal(true);

    setNewPayment({
      studentName: "",
      studentEmail: "",
      course: "",
      amount: "",
      method: "UPI / GPay",
      status: "Completed",
    });
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

  const filteredPayments = payments.filter(
    (p) =>
      (p.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.id || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.course || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = payments
    .filter((p) => p.status === "Completed")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const pendingDues = admissions.reduce((acc, a) => {
    const totalFee = Number(a.totalFee || 0);
    if (a.paymentStatus === "Paid") return acc;
    if (a.paymentType === "EMI" && a.emiMonthlyAmount && a.emiPaidCount !== undefined) {
      const paid = Number(a.emiPaidCount || 0) * Number(a.emiMonthlyAmount || 0);
      return acc + Math.max(0, totalFee - paid);
    }
    if (a.paymentStatus === "Partial") return acc + (totalFee / 2);
    return acc + totalFee;
  }, 0);

  const totalPotential = totalCollected + pendingDues;
  const collectionRate = totalPotential > 0 ? ((totalCollected / totalPotential) * 100).toFixed(1) : "100.0";

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#006241] tracking-tight flex items-center gap-2.5">
            <CreditCard className="h-8 w-8 text-[#00754A]" />
            Fee Transactions & Financials
          </h1>
          <p className="text-sm text-slate-600 font-semibold mt-1">
            Track student fee receipts, payment modes, and financial transactions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button onClick={handleExportExcel} variant="outline" size="sm" className="gap-1.5 border-slate-200 bg-white">
            <FileSpreadsheet className="h-4 w-4 text-[#00754A]" /> Export Excel
          </Button>

          <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-1.5 border-slate-200 bg-white">
            <Download className="h-4 w-4 text-[#006241]" /> Export PDF Sheet
          </Button>

          <Button
            onClick={() => setOpenModal(true)}
            variant="primary"
            className="shadow-md gap-2"
          >
            <Plus className="h-4 w-4" /> Record Fee Receipt
          </Button>
        </div>
      </div>

      {/* Starbucks Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-white border-l-4 border-l-[#006241] sb-shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Total Fee Collected</p>
              <h2 className="text-2xl font-extrabold text-[#1E3932] mt-2">₹{totalCollected.toLocaleString()}</h2>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#d4e9e2] text-[#006241] flex items-center justify-center font-bold">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-l-4 border-l-[#cba258] sb-shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Pending Dues</p>
              <h2 className="text-2xl font-extrabold text-[#1E3932] mt-2">₹{pendingDues.toLocaleString()}</h2>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#faf6ee] text-[#cba258] border border-[#cba258] flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-l-4 border-l-[#00754A] sb-shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Successful Receipts</p>
              <h2 className="text-2xl font-extrabold text-[#1E3932] mt-2">{payments.filter(p => p.status === "Completed").length}</h2>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#d4e9e2] text-[#00754A] flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-[#faf6ee] border border-[#cba258] sb-shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#cba258] uppercase flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" /> Collection Rate
              </p>
              <h2 className="text-2xl font-extrabold text-[#1E3932] mt-2">{collectionRate}%</h2>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#cba258] text-white flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Transactions Table */}
      <Card className="sb-shadow-card bg-white">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by txn ID, student, or course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 rounded-full bg-[#f2f0eb] border-slate-200"
              />
            </div>
            <Button variant="primary" className="bg-[#006241] hover:bg-[#004d33] text-white rounded-full shrink-0 gap-1.5 px-5">
              <Search className="h-4 w-4" /> Search
            </Button>
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
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs font-bold text-[#00754A]">{p.id}</TableCell>
                  <TableCell className="font-extrabold text-[#1E3932] text-sm">
                    {p.studentName}
                    {p.notes && <span className="block text-[11px] text-slate-500 font-normal">{p.notes}</span>}
                  </TableCell>
                  <TableCell className="text-slate-700 text-sm font-bold">{p.course}</TableCell>
                  <TableCell className="text-slate-600 text-sm font-semibold">{p.method}</TableCell>
                  <TableCell className="font-extrabold text-[#1E3932] text-sm">₹{(p.amount || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-slate-500 text-sm font-medium">{p.date}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "Completed" ? "greenLight" : p.status === "Partial" ? "warning" : "destructive"}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleOpenReceiptEmail(p)}
                      className="gap-1 text-xs border-slate-200"
                    >
                      <Mail className="h-3.5 w-3.5 text-[#006241]" /> Receipt Email
                    </Button>
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
                  <option value="UPI / GPay">UPI / GPay / PhonePe</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  <option value="Credit Card">Credit / Debit Card</option>
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
    </Layout>
  );
}

export default Payments;