"use client";
import { useState } from "react";
import { topUp } from "@/lib/api/transactions";
import { useUIStore } from "@/lib/store/uiStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { RouteGuard } from "@/components/RouteGuard";
import { BottomNav } from "@/components/ui/BottomNav";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function FundWalletPage() {
  const { addToast } = useUIStore();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount);
    if (!numAmount || numAmount < 100) {
      addToast("error", "Minimum top-up amount is ₦100.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await topUp(numAmount);
      // NOTE: Interswitch SDK integration — exact response shape TBD
      // If response includes a payment_url, redirect there; otherwise use Interswitch JS SDK
      if (data?.payment_url) {
        window.location.href = data.payment_url as string;
      } else {
        // Store reference for Interswitch JS SDK use
        addToast("info", "Use the Interswitch SDK to complete payment. Reference: " + (data?.reference || "N/A"));
      }
    } catch {
      addToast("error", "Failed to initialize payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RouteGuard allowedRoles={["passenger"]}>
      <div className="min-h-screen pb-24 px-5">
        <div className="pt-14 pb-6 flex items-center gap-4">
          <Link href="/passenger/dashboard">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold">Fund Wallet</h1>
        </div>

        <form onSubmit={handleFund} className="flex flex-col gap-6">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Quick amounts</p>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(String(a))}
                  className={`py-3 rounded-2xl text-sm font-semibold border transition-all ${
                    amount === String(a) ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-200"
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

          <Button type="submit" loading={loading} className="w-full" disabled={!amount}>
            Continue to Pay
          </Button>
        </form>
      </div>
      <BottomNav />
    </RouteGuard>
  );
}
