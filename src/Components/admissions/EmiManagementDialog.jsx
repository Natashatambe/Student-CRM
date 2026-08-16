import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select } from "../ui/select";
import { useToast } from "../ui/toast";
import { Calendar, DollarSign, CheckCircle2, Clock, CreditCard, Sparkles, Send, Download } from "lucide-react";
import api from "../../services/api";
import { generatePaymentReceiptPDF, sendReceiptEmailAPI } from "../../lib/receiptUtils";
import StripePaymentModal from "../common/StripePaymentModal";

function EmiManagementDialog({ open, setOpen, admission, onAdmissionUpdated, onEmailReceiptTrigger }) {
  if (!admission) return null;

  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState("Stripe Test Gateway");
  const [selectedInst, setSelectedInst] = useState(null);
  const [openStripeModal, setOpenStripeModal] = useState(false);
  const [stripePaymentData, setStripePaymentData] = useState(null);

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

  const triggerStripeCheckout = (item) => {
    setStripePaymentData({
      installmentNumber: item.installmentNumber,
      amount: item.amount || monthlyFee,
      studentName: admission.studentName || admission.student?.name || "Student Partner",
      studentEmail: admission.studentEmail || admission.student?.email || "student@gmail.com",
      courseName: admission.courseName || admission.course?.courseName || "Java Full Stack",
      notes: `Installment #${item.installmentNumber} of ${tenure} Fee Payment`,
    });
    setOpenStripeModal(true);
  };

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

      sendReceiptEmailAPI({
        ...payment,
        studentEmail: targetMail,
      });

      if (onAdmissionUpdated) onAdmissionUpdated(updated);

      if (onEmailReceiptTrigger) {
        onEmailReceiptTrigger({
          ...payment,
          studentEmail: targetMail,
        });
      }

      generatePaymentReceiptPDF(payment);

      setOpenStripeModal(false);
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
      setOpenStripeModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={handleClose} className="max-w-2xl">
          <DialogHeader className="bg-[#1E3932] text-white p-5 pr-14 border-b border-[#2d5248]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#cba258] text-white flex items-center justify-center font-bold shrink-0">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
                    EMI Installments & Plan Manager
                    <Badge variant="amber" className="text-[10px] px-2 py-0.5 bg-[#cba258] text-white border-0 font-sans ml-1">
                      {tenure} Months Plan
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-[#d4e9e2] text-xs mt-0.5">
                    Track monthly dues, installment schedule, and record student payments
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <DialogBody className="space-y-5 pt-2">
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E3932] uppercase">Payment Gateway for Checkout</label>
              <Select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                <option value="Stripe Test Gateway">Stripe Test Gateway (Credit / Debit Card)</option>
                <option value="UPI / GPay">UPI / GPay / PhonePe</option>
                <option value="Bank Transfer">Bank Transfer / NEFT</option>
              </Select>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
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
                            className="gap-1.5 text-xs border-[#e6dfd8] text-[#141413] hover:bg-[#efe9de] font-medium"
                          >
                            <Download className="h-3.5 w-3.5 text-[#00754A]" /> Receipt
                          </Button>
                        ) : (
                          <Button
                            size="xs"
                            variant="stripe"
                            disabled={loading}
                            onClick={() => triggerStripeCheckout(item)}
                            className="gap-1.5 text-xs font-bold px-3 py-1 rounded-lg inline-flex items-center shadow-2xs"
                          >
                            <CreditCard className="h-3.5 w-3.5 shrink-0" /> Pay ₹{Number(item.amount).toLocaleString()}
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

      {openStripeModal && stripePaymentData && (
        <StripePaymentModal
          open={openStripeModal}
          setOpen={setOpenStripeModal}
          paymentData={stripePaymentData}
          onPaymentSuccess={(stripeReceipt) => {
            handlePayInstallment(stripePaymentData.installmentNumber);
          }}
        />
      )}
    </>
  );
}

export default EmiManagementDialog;
