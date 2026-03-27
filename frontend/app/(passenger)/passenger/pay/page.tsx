"use client";
import { RouteGuard } from "@/components/RouteGuard";
import { BottomNav } from "@/components/ui/BottomNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SidebarNav } from "@/components/ui/SidebarNav";
import { getMe } from "@/lib/api/auth";
import { getFare, payRider } from "@/lib/api/transactions";
import { useAuthStore } from "@/lib/store/authStore";
import { useUIStore } from "@/lib/store/uiStore";
import { useWalletStore } from "@/lib/store/walletStore";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

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
      .catch(() => {
        /* fare display is optional */
      });
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
      if (me.wallet !== undefined) setBalance(me.wallet);
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Payment failed. Check the code and try again.";
      addToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <SidebarNav />
        <div className="min-h-screen md:ml-64 md:max-w-4xl md:mx-auto flex flex-col items-center justify-center px-6 text-center py-12 md:py-0">
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-app-primary mb-2 md:text-3xl">
            Payment Sent!
          </h2>
          <p className="text-app-secondary text-sm mb-8">
            {fare
              ? `₦${fare.toLocaleString()} sent to rider ${code.toUpperCase()}`
              : `Payment to ${code.toUpperCase()} successful`}
          </p>
          <Button onClick={() => router.replace("/passenger/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <SidebarNav />
      <div className="min-h-screen md:ml-64 md:max-w-4xl md:mx-auto pb-24 md:pb-12 px-5 md:px-8">
        <div className="pt-14 pb-6 md:pt-8 flex items-center gap-4">
          <Link href="/passenger/dashboard">
            <ArrowLeft className="w-5 h-5 text-app-secondary" />
          </Link>
          <h1 className="text-xl font-bold text-app-primary md:text-2xl">
            Pay Rider
          </h1>
        </div>

        {fare !== null && (
          <div className="bg-primary text-white rounded-3xl px-6 py-5 mb-6">
            <p className="text-sm text-foreground-secondary">Current Fare</p>
            <p className="text-3xl font-bold">₦{fare.toLocaleString()}</p>
          </div>
        )}

        <form onSubmit={handlePay} className="flex flex-col gap-4 max-w-md">
          <Input
            label="Rider Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. ABC123"
            maxLength={6}
            className="font-mono text-lg tracking-widest uppercase"
            required
          />
          <p className="text-xs text-gray-400">
            Enter the 6-character code shown on the rider&apos;s QR card.
          </p>
          <Button
            type="submit"
            loading={loading}
            className="w-full mt-4"
            disabled={code.length < 6}
          >
            Pay ₦{fare?.toLocaleString() ?? "..."}
          </Button>
        </form>
      </div>
      <BottomNav />
    </>
  );
}

export default function PayPage() {
  return (
    <RouteGuard allowedRoles={["passenger"]}>
      <Suspense fallback={<div>Loading...</div>}>
        <PayContent />
      </Suspense>
    </RouteGuard>
  );
}
