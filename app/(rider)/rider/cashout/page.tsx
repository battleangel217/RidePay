"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cashOut } from "@/lib/api/transactions";
import { getMe } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/authStore";
import { useWalletStore } from "@/lib/store/walletStore";
import { useUIStore } from "@/lib/store/uiStore";
import { RouteGuard } from "@/components/RouteGuard";
import { BottomNav } from "@/components/ui/BottomNav";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BankSelector } from "@/components/BankSelector";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CashOutPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { setBalance } = useWalletStore();
  const { addToast } = useUIStore();
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const balance = user?.wallet_balance ?? 0;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!amount || parseInt(amount) < 100) errs.amount = "Minimum cashout is ₦100";
    if (parseInt(amount) > balance) errs.amount = "Insufficient balance";
    if (!accountNumber || accountNumber.length !== 10) errs.accountNumber = "Account number must be 10 digits";
    if (!bankCode) errs.bankCode = "Please select a bank";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await cashOut(parseInt(amount), accountNumber, bankCode);
      const { data: me } = await getMe();
      setUser(me);
      if (me.wallet_balance !== undefined) setBalance(me.wallet_balance);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Cashout failed. Please try again.";
      addToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <RouteGuard allowedRoles={["driver"]}>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Cashout Initiated!</h2>
          <p className="text-gray-500 text-sm mb-8">₦{parseInt(amount).toLocaleString()} will be sent to your bank account.</p>
          <Button onClick={() => router.replace("/rider/dashboard")}>Back to Dashboard</Button>
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={["driver"]}>
      <div className="min-h-screen pb-24 px-5">
        <div className="pt-14 pb-6 flex items-center gap-4">
          <Link href="/rider/dashboard"><ArrowLeft className="w-5 h-5 text-gray-600" /></Link>
          <h1 className="text-xl font-bold">Cash Out</h1>
        </div>

        <div className="bg-gray-100 rounded-2xl px-4 py-3 mb-6">
          <p className="text-xs text-gray-500">Available Balance</p>
          <p className="text-2xl font-bold">₦{balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Amount (₦)"
            type="number"
            min="100"
            max={balance}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            error={errors.amount}
          />
          <Input
            label="Account Number"
            type="text"
            inputMode="numeric"
            maxLength={10}
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
            placeholder="0123456789"
            error={errors.accountNumber}
          />
          <BankSelector value={bankCode} onChange={setBankCode} error={errors.bankCode} />
          <Button type="submit" loading={loading} className="w-full mt-4">
            Cash Out
          </Button>
        </form>
      </div>
      <BottomNav />
    </RouteGuard>
  );
}
