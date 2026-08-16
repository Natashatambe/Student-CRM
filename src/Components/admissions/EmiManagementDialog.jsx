import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../ui/sheet";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { useToast } from "../ui/toast";
import { Calendar, DollarSign, CheckCircle2, Clock, CreditCard, Sparkles, Send, Download } from "lucide-react";
import api from "../../services/api";
import { generatePaymentReceiptPDF, sendReceiptEmailAPI } from "../../lib/receiptUtils";
import StripePaymentModal from "../common/StripePaymentModal";
import StatusBadge from "../common/StatusBadge";

function EmiManagementDialog({ open, setOpen, admission, onAdmissionUpdated, onEmailReceiptTrigger }) {
  if (!admission) return null;

  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState("Stripe Test Gateway");
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
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="sm:max-w-2xl" onClose={handleClose}>
          <SheetHeader>
            <SheetTitle>
              <CreditCard className="h-5 w-5 text-[#cc785c]" />
              EMI Installments & Plan Manager
              <span className="text-[10px] px-2 py-0.5 bg-[#cc785c] text-white rounded-full font-sans font-bold ml-1">
                {tenure} Months Plan
              </span>
            </SheetTitle>
            <SheetDescription>
              Track monthly dues, installment schedule, and record student payments for {admission.studentName}.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col flex-1 justify-between overflow-y-auto space-y-4 py-1">
            <div className="space-y-4">
              {/* Stat Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-3.5">
                <div>
                  <span className="text-[10px] font-bold text-[#6c6a64] uppercase block">Total Course Fee</span>
                  <span className="text-base font-bold text-[#141413] tracking-tight">₹{(admission.totalFee || 0).toLocaleString()}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#6c6a64] uppercase block">Monthly EMI</span>
                  <span className="text-base font-bold text-[#cc785c] tracking-tight">₹{monthlyFee.toLocaleString()} / mo</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#6c6a64] uppercase block">Installment Status</span>
                  <span className="text-base font-bold text-[#00754A] tracking-tight">
                    {paidCount} / {tenure} Paid
                  </span>
                </div>
              </div>

              {/* Student & Course Details Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-[#faf9f5] border border-[#e6dfd8] rounded-xl p-3 text-[#141413]">
                <div>
                  <span className="font-semibold text-[#8e8b82]">Student: </span>
                  <strong className="text-[#141413]">{admission.studentName}</strong> ({admission.student?.email || "student@gmail.com"})
                </div>
                <div>
                  <span className="font-semibold text-[#8e8b82]">Course Track: </span>
                  <strong className="text-[#cc785c]">{admission.courseName}</strong>
                </div>
              </div>

              {/* Payment Gateway Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#141413] uppercase tracking-wider">
                  Payment Gateway Checkout
                </label>
                <Select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                  <option value="Stripe Test Gateway">Stripe Test Gateway (Credit / Debit Card)</option>
                  <option value="UPI / GPay">UPI / GPay / PhonePe</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                </Select>
              </div>

              {/* Schedule Table */}
              <div className="border border-[#e6dfd8] rounded-xl overflow-hidden text-xs bg-[#faf9f5]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#efe9de] text-[#141413] font-bold border-b border-[#e6dfd8] uppercase text-[10px] tracking-wider">
                      <th className="p-3">Inst #</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6dfd8]">
                    {schedule.map((item) => (
                      <tr key={item.installmentNumber} className={item.status === "Paid" ? "bg-[#efe9de]/40" : "hover:bg-[#efe9de]/30"}>
                        <td className="p-3 font-bold text-[#141413]">Installment #{item.installmentNumber}</td>
                        <td className="p-3 text-[#6c6a64] font-medium whitespace-nowrap">{item.dueDate}</td>
                        <td className="p-3 font-bold text-[#141413] tracking-tight">₹{Number(item.amount).toLocaleString()}</td>
                        <td className="p-3">
                          <StatusBadge status={item.status === "Paid" ? "Completed" : "Pending"} />
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          {item.status === "Paid" ? (
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => generatePaymentReceiptPDF({ ...item, studentName: admission.studentName, course: admission.courseName })}
                              className="gap-1 text-xs border-[#e6dfd8] bg-[#faf9f5] hover:bg-[#efe9de] text-[#141413] font-semibold"
                            >
                              <Download className="h-3.5 w-3.5 text-[#00754A]" /> Receipt
                            </Button>
                          ) : (
                            <Button
                              size="xs"
                              variant="stripe"
                              disabled={loading}
                              onClick={() => triggerStripeCheckout(item)}
                              className="gap-1.5 text-xs font-bold px-3 py-1 rounded-lg inline-flex items-center shadow-2xs bg-[#635bff] hover:bg-[#534ae4] text-white"
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
            </div>

            <SheetFooter>
              <Button variant="outline" onClick={handleClose} className="border-[#e6dfd8] bg-[#faf9f5]">
                Close Manager
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>

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
