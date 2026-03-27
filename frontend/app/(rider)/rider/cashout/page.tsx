"use client";
import { BankSelector } from "@/components/BankSelector";
import { RouteGuard } from "@/components/RouteGuard";
import { BottomNav } from "@/components/ui/BottomNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SidebarNav } from "@/components/ui/SidebarNav";
import { getMe } from "@/lib/api/auth";
import { cashOut } from "@/lib/api/transactions";
import { useAuthStore } from "@/lib/store/authStore";
import { useUIStore } from "@/lib/store/uiStore";
import { useWalletStore } from "@/lib/store/walletStore";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

  const balance = user?.wallet ?? 0;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!amount || parseInt(amount) < 100)
      errs.amount = "Minimum cashout is ₦100";
    if (parseInt(amount) > balance) errs.amount = "Insufficient balance";
    if (!accountNumber || accountNumber.length !== 10)
      errs.accountNumber = "Account number must be 10 digits";
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
      if (me.wallet !== undefined) setBalance(me.wallet);
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Cashout failed. Please try again.";
      addToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <RouteGuard allowedRoles={["driver"]}>
        <SidebarNav />
        <div className="min-h-screen md:ml-64 md:max-w-4xl md:mx-auto flex flex-col items-center justify-center px-6 text-center py-12 md:py-0">
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-app-primary mb-2 md:text-3xl">
            Cashout Initiated!
          </h2>
          <p className="text-app-secondary text-sm mb-8">
            ₦{parseInt(amount).toLocaleString()} will be sent to your bank
            account.
          </p>
          <Button onClick={() => router.replace("/rider/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
        <BottomNav />
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={["driver"]}>
      <SidebarNav />
      <div className="min-h-screen md:ml-64 md:max-w-4xl md:mx-auto pb-24 md:pb-12 px-5 md:px-8">
        <div className="pt-14 pb-6 md:pt-8 flex items-center gap-4">
          <Link href="/rider/dashboard">
            <ArrowLeft className="w-5 h-5 text-app-secondary" />
          </Link>
          <h1 className="text-xl font-bold text-app-primary md:text-2xl">
            Cash Out
          </h1>
        </div>

        <div className="bg-background-secondary rounded-2xl px-4 py-3 mb-6 max-w-md">
          <p className="text-xs text-app-tertiary">Available Balance</p>
          <p className="text-2xl font-bold text-app-primary">
            ₦{balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
          </p>
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
            onChange={(e) =>
              setAccountNumber(e.target.value.replace(/\D/g, ""))
            }
            placeholder="0123456789"
            error={errors.accountNumber}
          />
          <BankSelector
            value={bankCode}
            onChange={setBankCode}
            error={errors.bankCode}
          />
          <Button type="submit" loading={loading} className="w-full mt-4">
            Cash Out
          </Button>
        </form>
      </div>
      <BottomNav />
    </RouteGuard>
  );
}
