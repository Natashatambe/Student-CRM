import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select } from "../ui/select";
import { useToast } from "../ui/toast";
import { Calendar, DollarSign, CheckCircle2, Clock, CreditCard, Sparkles, Send, Download } from "lucide-react";
import api from "../../services/api";
import { generatePaymentReceiptPDF, sendReceiptEmailAPI } from "../../lib/receiptUtils";

function EmiManagementDialog({ open, setOpen, admission, onAdmissionUpdated, onEmailReceiptTrigger }) {
  if (!admission) return null;

  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState("UPI / GPay");
  const [selectedInst, setSelectedInst] = useState(null);

  const handleClose = () => setOpen(false);

  const tenure = Number(admission.emiTenure || 3);
  const totalFeeNum = Number(admission.totalFee || admission.fee || admission.amount || 0);
  const monthlyFee = Number(admission.emiMonthlyAmount || (tenure > 0 ? Math.round(totalFeeNum / tenure) : 0));
  const initialPaidCount = Number(admission.emiPaidCount || (admission.paymentStatus?.toLowerCase() === "paid" ? tenure : 1));

  const schedule = (admission.emiSchedule && admission.emiSchedule.length > 0)
    ? admission.emiSchedule
    : Array.from({ length: tenure }, (_, i) => {
        const instNum = i + 1;
        const d = new Date(admission.admissionDate || Date.now());
        d.setMonth(d.getMonth() + i);
        const dateStr = d.toISOString().split("T")[0];
        const isPaid = instNum <= initialPaidCount;
        return {
          installmentNumber: instNum,
          dueDate: dateStr,
          amount: monthlyFee,
          status: isPaid ? "Paid" : "Pending",
          paidDate: isPaid ? (admission.admissionDate || new Date().toISOString().split("T")[0]) : null,
        };
      });

  const paidCount = schedule.filter((s) => s.status === "Paid").length;
  const remainingFee = Math.max(0, totalFeeNum - (paidCount * monthlyFee));

  const handlePayInstallment = async (installmentNumber) => {
    try {
      setLoading(true);
      const admId = admission.admissionId || admission.id || admission.studentId || 1;
      const res = await api.post(`/admissions/${admId}/pay-emi`, {
        installmentNumber: installmentNumber,
        paymentMethod: payMethod,
      });

      const isFinal = paidCount + 1 >= tenure;

      const updated = res.data?.admission || {
        ...admission,
        emiPaidCount: Math.min(paidCount + 1, tenure),
        paymentStatus: isFinal ? "Paid" : "Partial",
        isCompleted: isFinal,
        emiSchedule: schedule.map((item) =>
          item.installmentNumber === installmentNumber
            ? { ...item, status: "Paid", paidDate: new Date().toISOString().split("T")[0] }
            : item
        ),
      };

      let rawName = admission.studentName || admission.student?.name || "Student Partner";

      const payment = res.data?.payment || {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        studentName: rawName,
        course: admission.courseName || admission.course?.courseName || "Course Track",
        amount: monthlyFee,
        method: payMethod,
        date: new Date().toISOString().split("T")[0],
        status: "Completed",
        notes: isFinal
          ? `Final EMI Installment #${installmentNumber} of ${tenure} (Fee Paid in Full 🎉)`
          : `EMI Installment #${installmentNumber} of ${tenure}`,
      };

      if (isFinal) {
        showToast(`🎉 All ${tenure} EMI Installments Paid! Admission for ${payment.studentName} is marked as Paid in Full!`, "success");
      } else {
        showToast(`Installment #${installmentNumber} of ${tenure} Paid Successfully!`, "success");
      }

      const targetMail = admission.studentEmail || admission.student?.email || admission.email || "student@gmail.com";

      // Auto trigger receipt email API
      sendReceiptEmailAPI({
        ...payment,
        studentEmail: targetMail,
      });

      // Update parent component state
      if (onAdmissionUpdated) onAdmissionUpdated(updated);

      // Trigger email preview modal
      if (onEmailReceiptTrigger) {
        onEmailReceiptTrigger({
          ...payment,
          studentEmail: targetMail,
        });
      }

      // Auto download PDF receipt
      generatePaymentReceiptPDF(payment);

      handleClose();
    } catch (err) {
      console.error("Pay EMI error:", err);
      const isFinal = paidCount + 1 >= tenure;
      const newPaidCount = Math.min(paidCount + 1, tenure);

      const updated = {
        ...admission,
        emiPaidCount: newPaidCount,
        paymentStatus: isFinal ? "Paid" : "Partial",
        isCompleted: isFinal,
        emiSchedule: schedule.map((item) =>
          item.installmentNumber === installmentNumber
            ? { ...item, status: "Paid", paidDate: new Date().toISOString().split("T")[0] }
            : item
        ),
      };

      if (isFinal) {
        showToast(`🎉 All ${tenure} EMI Installments Paid! Admission marked as Paid in Full!`, "success");
      } else {
        showToast(`Paid Installment #${installmentNumber}!`, "success");
      }

      if (onAdmissionUpdated) onAdmissionUpdated(updated);

      const payment = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        studentName: admission.studentName || admission.student?.name || "Student Partner",
        course: admission.courseName || admission.course?.courseName || "Course Track",
        amount: monthlyFee,
        method: payMethod,
        date: new Date().toISOString().split("T")[0],
        status: "Completed",
      };

      generatePaymentReceiptPDF(payment);
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent onClose={handleClose} className="max-w-2xl">
        <DialogHeader className="bg-[#1E3932] text-white p-6 rounded-t-xl -m-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#cba258] text-white flex items-center justify-center font-bold">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
                  EMI Installments & Plan Manager
                </DialogTitle>
                <DialogDescription className="text-[#d4e9e2] text-xs mt-0.5">
                  Track monthly dues, installment schedule, and record student payments
                </DialogDescription>
              </div>
            </div>
            <Badge variant="amber" className="text-xs px-3 py-1 bg-[#cba258] text-white border-0">
              {tenure} Months EMI Plan
            </Badge>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-5 pt-2">
          {/* Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#faf6ee] border border-[#cba258]/30 rounded-xl p-4">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Course Fee</span>
              <span className="text-lg font-extrabold text-[#1E3932]">₹{(admission.totalFee || 0).toLocaleString()}</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Monthly EMI</span>
              <span className="text-lg font-extrabold text-[#00754A]">₹{monthlyFee.toLocaleString()} / mo</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Installment Status</span>
              <span className="text-lg font-extrabold text-[#cba258]">
                {paidCount} / {tenure} Paid
              </span>
            </div>
          </div>

          {/* Student Info */}
          <div className="flex items-center justify-between text-xs text-slate-700 bg-white border border-slate-200 rounded-lg p-3">
            <div>
              <span className="font-bold text-slate-500">Student: </span>
              <strong className="text-[#1E3932]">{admission.studentName}</strong> ({admission.student?.email || "student@gmail.com"})
            </div>
            <div>
              <span className="font-bold text-slate-500">Course Track: </span>
              <strong className="text-[#00754A]">{admission.courseName}</strong>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1E3932] uppercase">Payment Mode for Installment</label>
            <Select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
              <option value="UPI / GPay">UPI / GPay / PhonePe</option>
              <option value="Bank Transfer">Bank Transfer / NEFT</option>
              <option value="Credit Card">Credit / Debit Card</option>
              <option value="Cash Deposit">Cash Deposit</option>
            </Select>
          </div>

          {/* Installments Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">Inst #</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedule.map((item) => (
                  <tr key={item.installmentNumber} className={item.status === "Paid" ? "bg-[#d4e9e2]/20" : ""}>
                    <td className="p-3 font-bold text-[#1E3932]">Installment #{item.installmentNumber}</td>
                    <td className="p-3 text-slate-600 font-medium">{item.dueDate}</td>
                    <td className="p-3 font-extrabold text-[#006241]">₹{Number(item.amount).toLocaleString()}</td>
                    <td className="p-3">
                      {item.status === "Paid" ? (
                        <Badge variant="success" className="gap-1 text-[11px]">
                          <CheckCircle2 className="h-3 w-3" /> Paid ({item.paidDate || "Paid"})
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="gap-1 text-[11px]">
                          <Clock className="h-3 w-3" /> Due Pending
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {item.status === "Paid" ? (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => generatePaymentReceiptPDF({ ...item, studentName: admission.studentName, course: admission.courseName })}
                          className="gap-1 text-[11px]"
                        >
                          <Download className="h-3 w-3 text-[#00754A]" /> Receipt
                        </Button>
                      ) : (
                        <Button
                          size="xs"
                          variant="primary"
                          disabled={loading}
                          onClick={() => handlePayInstallment(item.installmentNumber)}
                          className="gap-1 bg-[#006241] hover:bg-[#00754A] text-white text-[11px]"
                        >
                          Pay ₹{Number(item.amount).toLocaleString()}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close Manager
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EmiManagementDialog;
