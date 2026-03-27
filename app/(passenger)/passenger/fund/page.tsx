"use client";
import { RouteGuard } from "@/components/RouteGuard";
import { BottomNav } from "@/components/ui/BottomNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { topUp } from "@/lib/api/transactions";
import { useUIStore } from "@/lib/store/uiStore";
import type { TopUpResponse } from "@/lib/types";
import {
  generateInterswitchPaymentURL,
  openInterswitchPayment,
} from "@/lib/utils/interswitch";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function FundWalletPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<TopUpResponse | null>(null);

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount);
    if (!numAmount || numAmount < 100) {
      addToast("error", "Minimum top-up amount is ₦100.");
      return;
    }
    setLoading(true);
    try {
      // Send amount in kobo (Naira * 100)
      const { data } = await topUp(numAmount * 100);
      setPaymentData(data);
    } catch (error: any) {
      console.error("Topup initialization error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to initialize payment. Please try again.";
      addToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = () => {
    if (!paymentData) return;

    try {
      const callbackURL = `${typeof window !== "undefined" ? window.location.origin : ""}/passenger/payment-callback`;

      const paymentURL = generateInterswitchPaymentURL({
        paymentData,
        callbackURL,
        merchantCode: "MX187",
        payItemID: "Default_Payable_MX187",
        mode:
          (process.env.NEXT_PUBLIC_INTERSWITCH_MODE as "TEST" | "LIVE") ||
          "TEST",
      });

      console.log("Opening Interswitch payment:", paymentURL);
      openInterswitchPayment(paymentURL);

      addToast(
        "info",
        "Opening payment page in a new tab. Please complete payment there.",
      );
    } catch (error: any) {
      console.error("Error opening payment:", error);
      addToast("error", "Failed to open payment page. Please try again.");
    }
  };

  const handleBackClick = () => {
    if (paymentData) {
      setPaymentData(null);
    } else {
      router.push("/passenger/dashboard");
    }
  };

  return (
    <RouteGuard allowedRoles={["passenger"]}>
      <div className="min-h-screen pb-24 px-5">
        <div className="pt-14 pb-6 flex items-center gap-4">
          <button
            onClick={handleBackClick}
            type="button"
            className="hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5 text-app-secondary" />
          </button>
          <h1 className="text-xl font-bold text-app-primary">Fund Wallet</h1>
        </div>

        {!paymentData ? (
          <form onSubmit={handleFund} className="flex flex-col gap-6">
            <div>
              <p className="text-sm font-medium text-app-primary mb-3">
                Quick amounts
              </p>
              <div className="grid grid-cols-4 gap-2">
                {QUICK_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAmount(String(a))}
                    className={`py-3 rounded-2xl text-sm font-semibold border transition-all ${
                      amount === String(a)
                        ? "bg-primary text-white border-primary"
                        : "bg-background-secondary text-app-primary border-border"
                    }`}
                  >
                    ₦{a.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Custom amount (₦)"
              type="number"
              min="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              disabled={!amount}
            >
              Continue to Pay
            </Button>
          </form>
        ) : (
          <div className="flex flex-col gap-6 mt-8">
            <div className="bg-background-secondary p-6 rounded-lg border border-border">
              <p className="text-sm text-app-secondary mb-2">Amount to pay</p>
              <p className="text-3xl font-bold text-app-primary">
                ₦{(paymentData.amount / 100).toLocaleString()}
              </p>
              <p className="text-xs text-app-secondary mt-3">
                Transaction Ref:{" "}
                <span className="font-mono">{paymentData.transaction_ref}</span>
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                💳 You will be redirected to Interswitch Webpay in a new tab to
                complete payment securely.
              </p>
            </div>

            <Button
              onClick={handleOpenPayment}
              className="w-full flex items-center justify-center gap-2"
            >
              <span>Open Payment Page</span>
              <ExternalLink className="w-4 h-4" />
            </Button>

            <p className="text-xs text-app-secondary text-center">
              After payment, you'll be redirected back to verify your
              transaction.
            </p>
          </div>
        )}
      </div>
      <BottomNav />
    </RouteGuard>
  );
}
