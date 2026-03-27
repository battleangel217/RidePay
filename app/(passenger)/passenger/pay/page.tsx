"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { payRider, getFare } from "@/lib/api/transactions";
import { useWalletStore } from "@/lib/store/walletStore";
import { useAuthStore } from "@/lib/store/authStore";
import { useUIStore } from "@/lib/store/uiStore";
import { getMe } from "@/lib/api/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { RouteGuard } from "@/components/RouteGuard";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

function PayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useUIStore();
  const { setBalance } = useWalletStore();
  const { setUser } = useAuthStore();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [fare, setFare] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getFare()
      .then(({ data }) => setFare(data.fare))
      .catch(() => {/* fare display is optional */});
  }, []);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      await payRider(code.trim().toUpperCase(), fare || 0);
      // Refresh balance after payment
      const { data: me } = await getMe();
      setUser(me);
      if (me.wallet_balance !== undefined) setBalance(me.wallet_balance);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Payment failed. Check the code and try again.";
      addToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Payment Sent!</h2>
        <p className="text-gray-500 text-sm mb-8">
          {fare ? `₦${fare.toLocaleString()} sent to rider ${code.toUpperCase()}` : `Payment to ${code.toUpperCase()} successful`}
        </p>
        <Button onClick={() => router.replace("/passenger/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-5">
      <div className="pt-14 pb-6 flex items-center gap-4">
        <Link href="/passenger/dashboard">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold">Pay Rider</h1>
      </div>

      {fare !== null && (
        <div className="bg-black text-white rounded-3xl px-6 py-5 mb-6">
          <p className="text-sm text-gray-400">Current Fare</p>
          <p className="text-3xl font-bold">₦{fare.toLocaleString()}</p>
        </div>
      )}

      <form onSubmit={handlePay} className="flex flex-col gap-4">
        <Input
          label="Rider Code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. ABC123"
          maxLength={6}
          className="font-mono text-lg tracking-widest uppercase"
          required
        />
        <p className="text-xs text-gray-400">Enter the 6-character code shown on the rider&apos;s QR card.</p>
        <Button type="submit" loading={loading} className="w-full mt-4" disabled={code.length < 4}>
          Pay ₦{fare?.toLocaleString() ?? "..."}
        </Button>
      </form>
    </div>
  );
}

export default function PayPage() {
  return (
    <RouteGuard allowedRoles={["passenger"]}>
      <Suspense>
        <PayContent />
      </Suspense>
    </RouteGuard>
  );
}
