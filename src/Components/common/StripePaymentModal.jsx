import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  CreditCard,
  Lock,
  CheckCircle2,
  Loader2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { sendReceiptEmailAPI, generatePaymentReceiptPDF } from "../../lib/receiptUtils";

// Initialize Stripe JS SDK outside component render to avoid recreating Stripe object
// Using official Stripe Test publishable key
const stripePromise = loadStripe("pk_test_TYooMQauvdEDq54NiTphI7jx");

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#141413",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      fontSmoothing: "antialiased",
      fontSize: "14px",
      "::placeholder": {
        color: "#a09d96",
      },
    },
    invalid: {
      color: "#9b1c1c",
      iconColor: "#9b1c1c",
    },
  },
  hidePostalCode: false,
};

// Inner Form component that consumes useStripe and useElements hooks
function StripeCheckoutForm({ paymentData, onPaymentSuccess, onClose }) {
  const stripe = useStripe();
  const elements = useElements();

  const studentName =
    paymentData?.studentName || paymentData?.student?.name || "Student Partner";
  const studentEmail =
    paymentData?.studentEmail || paymentData?.student?.email || "student@gmail.com";
  const courseName =
    paymentData?.courseName ||
    paymentData?.course ||
    paymentData?.course?.name ||
    "Java Full Stack";
  const amount = Number(
    paymentData?.amount || paymentData?.totalFee || paymentData?.monthlyFee || 15000
  );
  const titleText =
    paymentData?.notes ||
    (paymentData?.installmentNumber
      ? `Installment #${paymentData.installmentNumber} Fee Payment`
      : "Course Fee Checkout");

  const [nameOnCard, setNameOnCard] = useState(studentName);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage("Stripe SDK is still initializing. Please wait a moment.");
      return;
    }

    setProcessing(true);
    setErrorMessage("");

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setProcessing(false);
      setErrorMessage("Card element not found.");
      return;
    }

    // Call real Stripe API to create PaymentMethod
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: {
        name: nameOnCard || studentName,
        email: studentEmail,
      },
    });

    if (error) {
      console.error("Stripe Card Error:", error);
      setErrorMessage(error.message || "Payment authorization failed.");
      setProcessing(false);
      return;
    }

    console.log("Stripe PaymentMethod Created:", paymentMethod);

    const txnId = `TXN-STRIPE-${paymentMethod.id.slice(-8).toUpperCase()}`;

    const receiptObj = {
      id: txnId,
      txnId: txnId,
      stripePaymentMethodId: paymentMethod.id,
      cardBrand: (paymentMethod.card?.brand || "visa").toUpperCase(),
      last4: paymentMethod.card?.last4 || "4242",
      studentName,
      studentEmail,
      courseName,
      amount,
      paymentMethod: `Stripe Card (${(paymentMethod.card?.brand || "visa").toUpperCase()} *${paymentMethod.card?.last4 || "4242"})`,
      method: "Stripe Payment Method",
      date: new Date().toISOString().split("T")[0],
      notes: titleText,
      installmentNumber: paymentData?.installmentNumber,
      status: "Completed",
    };

    setPaymentResult(receiptObj);
    setProcessing(false);
    setSuccess(true);

    // Trigger receipt email API & PDF receipt download
    sendReceiptEmailAPI(receiptObj);
    setTimeout(() => {
      generatePaymentReceiptPDF(receiptObj);
    }, 600);

    if (onPaymentSuccess && typeof onPaymentSuccess === "function") {
      try {
        onPaymentSuccess(receiptObj);
      } catch (err) {
        console.error("Error in Stripe onPaymentSuccess callback:", err);
      }
    }
  };

  if (success && paymentResult) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="mx-auto h-16 w-16 rounded-full bg-[#d4e9e2] text-[#00754A] flex items-center justify-center animate-in zoom-in-75">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-serif-display font-bold text-[#141413]">
            Stripe Payment Authorized!
          </h3>
          <p className="text-xs text-[#6c6a64]">
            Successfully generated Stripe PaymentMethod{" "}
            <span className="font-mono font-bold text-[#635bff]">
              {paymentResult.stripePaymentMethodId}
            </span>
          </p>
        </div>

        <div className="bg-[#efe9de] p-3.5 rounded-xl border border-[#e6dfd8] text-xs space-y-1.5 text-left font-mono">
          <div className="flex justify-between">
            <span className="text-[#8e8b82]">Transaction ID:</span>
            <span className="font-bold text-[#cc785c]">{paymentResult.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8e8b82]">Card Used:</span>
            <span className="font-bold text-[#141413]">
              {paymentResult.cardBrand} **** {paymentResult.last4}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8e8b82]">Student Partner:</span>
            <span className="font-bold text-[#141413]">{studentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8e8b82]">Amount Paid:</span>
            <span className="font-bold text-[#00754A]">
              ₹{amount.toLocaleString()}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-[#8e8b82] italic">
          ✉️ Email receipt sent to <strong>{studentEmail}</strong> & Official PDF downloaded!
        </p>

        <Button
          type="button"
          onClick={() => {
            if (typeof onClose === "function") onClose();
          }}
          className="w-full bg-[#00754A] hover:bg-[#006241] text-white font-bold text-xs py-3 rounded-xl cursor-pointer shadow-md"
        >
          Done & Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1">
      <DialogBody className="p-5 space-y-4">
        {/* Payment Summary Box */}
        <div className="bg-[#efe9de]/70 rounded-xl p-3.5 border border-[#e6dfd8] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8e8b82] font-semibold">Student Partner:</span>
            <span className="font-bold text-[#141413] truncate max-w-[200px]">
              {studentName}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8e8b82] font-semibold">Course / Item:</span>
            <span className="font-semibold text-[#141413]">{titleText}</span>
          </div>
          <div className="pt-2 border-t border-[#e6dfd8] flex items-center justify-between">
            <span className="text-xs font-bold text-[#141413] uppercase">
              Total Amount:
            </span>
            <span className="text-lg font-serif-display font-extrabold text-[#cc785c]">
              ₹{amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Cardholder Name */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#141413] uppercase">
            Cardholder Name
          </label>
          <Input
            type="text"
            required
            placeholder="Full name as printed on card"
            value={nameOnCard}
            onChange={(e) => setNameOnCard(e.target.value)}
            className="bg-white border-[#e6dfd8] text-xs h-9"
          />
        </div>

        {/* Stripe Real CardElement */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-[#141413] uppercase flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5 text-[#635bff]" /> Stripe Card Input
            </label>
            <span className="text-[10px] text-[#635bff] font-mono font-bold flex items-center gap-0.5">
              <Sparkles className="h-2.5 w-2.5" /> Test Card: 4242...
            </span>
          </div>

          <div className="bg-white p-3 border border-[#e6dfd8] rounded-md shadow-2xs focus-within:ring-2 focus-within:ring-[#635bff] focus-within:border-[#635bff] transition">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        {/* Validation Error Message */}
        {errorMessage && (
          <div className="flex items-center gap-1.5 text-xs text-[#9b1c1c] bg-[#fde8e8] p-2.5 rounded-lg border border-[#fbd5d5]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </DialogBody>

      <DialogFooter className="bg-[#faf9f5] border-t border-[#e6dfd8] p-4 flex items-center justify-between">
        <span className="text-[10px] text-[#8e8b82] flex items-center gap-1">
          <Lock className="h-3 w-3 text-[#635bff]" /> Powered by Stripe.js & Elements
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={processing}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!stripe || processing}
            className="bg-[#635bff] hover:bg-[#544dc9] text-white font-bold text-xs gap-1.5 shadow-sm"
          >
            {processing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Authorizing with Stripe...
              </>
            ) : (
              <>Pay ₹{amount.toLocaleString()} with Stripe</>
            )}
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
}

// Outer Modal wrapper containing <Elements> provider
function StripePaymentModal({
  open,
  setOpen,
  onClose,
  paymentData,
  onPaymentSuccess,
}) {
  if (!paymentData) return null;

  const handleClose = () => {
    if (typeof setOpen === "function") {
      setOpen(false);
    }
    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <Dialog open={Boolean(open)} onOpenChange={handleClose}>
      <DialogContent onClose={handleClose} className="max-w-md bg-[#faf9f5]">
        <DialogHeader className="bg-[#181715] text-[#faf9f5] border-b border-[#252320] p-4 pr-12 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#635bff] text-white flex items-center justify-center font-bold">
                <CreditCard className="h-4.5 w-4.5" />
              </div>
              <div>
                <DialogTitle className="text-base font-serif-display font-bold text-[#faf9f5] flex items-center gap-1.5">
                  Stripe Payment Elements
                  <Badge className="bg-[#635bff] text-white text-[10px] px-1.5 py-0 font-mono">
                    TEST MODE
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-[11px] text-[#a09d96]">
                  React Stripe.js & Elements API Integration
                </DialogDescription>
              </div>
            </div>
            <ShieldCheck className="h-5 w-5 text-[#635bff]" />
          </div>
        </DialogHeader>

        {/* Real React Stripe.js <Elements> Provider */}
        <Elements stripe={stripePromise}>
          <StripeCheckoutForm
            paymentData={paymentData}
            onPaymentSuccess={onPaymentSuccess}
            onClose={handleClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}

export default StripePaymentModal;
