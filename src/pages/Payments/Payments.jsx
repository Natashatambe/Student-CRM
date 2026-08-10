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
import { CreditCard, DollarSign, Clock, CheckCircle2, Plus, Search, ArrowUpRight, Star } from "lucide-react";
import { getPayments, addPayment } from "../../services/paymentService";

function Payments() {
  const { showToast } = useToast();

  const [payments, setPayments] = useState([
    {
      id: "TXN-9021",
      studentName: "Natasha Tambe",
      course: "Java Full Stack",
      amount: 50000,
      method: "UPI / GPay",
      date: "2026-08-01",
      status: "Completed",
    },
    {
      id: "TXN-9022",
      studentName: "Rahul Sharma",
      course: "Python Masterclass",
      amount: 15000,
      method: "Bank Transfer",
      date: "2026-08-05",
      status: "Partial",
    },
    {
      id: "TXN-9023",
      studentName: "Priya Patel",
      course: "React JS Track",
      amount: 30000,
      method: "Credit Card",
      date: "2026-08-08",
      status: "Completed",
    },
    {
      id: "TXN-9024",
      studentName: "Amit Joshi",
      course: "Data Science & AI",
      amount: 65000,
      method: "UPI / PhonePe",
      date: "2026-08-09",
      status: "Completed",
    },
    {
      id: "TXN-9025",
      studentName: "Sneha Patil",
      course: "UI/UX Design",
      amount: 20000,
      method: "Cash Deposit",
      date: "2026-08-10",
      status: "Pending",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    studentName: "",
    course: "",
    amount: "",
    method: "UPI / GPay",
    status: "Completed",
  });

  const loadPaymentsFromBackend = async () => {
    try {
      setLoading(true);
      const res = await getPayments();
      if (res && res.data) {
        let list = [];
        if (Array.isArray(res.data)) list = res.data;
        else if (Array.isArray(res.data.data)) list = res.data.data;
        if (list.length > 0) setPayments(list);
      }
    } catch (error) {
      console.log("Payments API loaded with fallback data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentsFromBackend();
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
      amount: Number(newPayment.amount),
      date: new Date().toISOString().split("T")[0],
    };

    try {
      const res = await addPayment(payload);
      if (res && res.data) {
        const created = res.data;
        setPayments([created, ...payments]);
      } else {
        setPayments([payload, ...payments]);
      }
    } catch (error) {
      console.log("API add payment simulation:", error);
      setPayments([payload, ...payments]);
    }

    showToast(`Processed fee receipt for ₹${payload.amount.toLocaleString()}!`, "info");
    setOpenModal(false);
    setNewPayment({
      studentName: "",
      course: "",
      amount: "",
      method: "UPI / GPay",
      status: "Completed",
    });
  };

  const filteredPayments = payments.filter(
    (p) =>
      (p.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.id || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.course || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = payments
    .filter((p) => p.status === "Completed")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

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

        <Button
          onClick={() => setOpenModal(true)}
          variant="primary"
          className="shadow-md gap-2"
        >
          <Plus className="h-4 w-4" /> Record Fee Receipt
        </Button>
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
              <h2 className="text-2xl font-extrabold text-[#1E3932] mt-2">₹35,000</h2>
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
              <h2 className="text-2xl font-extrabold text-[#1E3932] mt-2">94.2%</h2>
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
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by txn ID, student, or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 rounded-full bg-[#f2f0eb] border-slate-200"
            />
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs font-bold text-[#00754A]">{p.id}</TableCell>
                  <TableCell className="font-extrabold text-[#1E3932] text-sm">{p.studentName}</TableCell>
                  <TableCell className="text-slate-700 text-sm font-bold">{p.course}</TableCell>
                  <TableCell className="text-slate-600 text-sm font-semibold">{p.method}</TableCell>
                  <TableCell className="font-extrabold text-[#1E3932] text-sm">₹{(p.amount || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-slate-500 text-sm font-medium">{p.date}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "Completed" ? "greenLight" : p.status === "Partial" ? "warning" : "destructive"}>
                      {p.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal */}
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
                  placeholder="e.g. Natasha Tambe"
                  value={newPayment.studentName}
                  onChange={(e) => setNewPayment({ ...newPayment, studentName: e.target.value })}
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
                Generate Receipt
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default Payments;