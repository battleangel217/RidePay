"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { useWalletStore } from "@/lib/store/walletStore";
import { useUIStore } from "@/lib/store/uiStore";
import { getMe } from "@/lib/api/auth";
import { getHistory } from "@/lib/api/transactions";
import { useSocket } from "@/lib/hooks/useSocket";
import { RouteGuard } from "@/components/RouteGuard";
import { BottomNav } from "@/components/ui/BottomNav";
import { TransactionList } from "@/components/TransactionList";
import { AlertTriangle, Banknote, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function RiderDashboard() {
  const { user, setUser } = useAuthStore();
  const { setTransactions, setBalance, prependTransaction, balance } = useWalletStore();
  const { addToast } = useUIStore();
  const [loading, setLoading] = useState(true);

  const displayBalance = user?.wallet_balance !== undefined ? user.wallet_balance : balance;

  useEffect(() => {
    (async () => {
      try {
        const { data: me } = await getMe();
        setUser(me);
        if (me.wallet_balance !== undefined) setBalance(me.wallet_balance);
        try {
          const { data: history } = await getHistory();
          setTransactions(history);
        } catch {/* history may not be available yet */}
      } catch {
        addToast("error", "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [setUser, setTransactions, setBalance, addToast]);

  // Real-time payment notifications via Socket.IO
  useSocket(
    (data) => {
      // NOTE: shape of payment_received event assumed
      const payment = data as { amount: number; id: string; description: string; created_at: string };
      addToast("success", `Payment received: ₦${payment.amount?.toLocaleString() || ""}`);
      prependTransaction({
        id: payment.id || String(Date.now()),
        type: "payment",
        amount: payment.amount || 0,
        description: payment.description || "Payment received",
        created_at: payment.created_at || new Date().toISOString(),
        status: "completed",
      });
      // Refresh balance
      getMe().then(({ data: me }) => {
        setUser(me);
        if (me.wallet_balance !== undefined) setBalance(me.wallet_balance);
      }).catch((err) => console.error("Failed to refresh balance after payment:", err));
    }
  );

  return (
    <RouteGuard allowedRoles={["driver"]}>
      <div className="min-h-screen pb-24">
        <div className="px-5 pt-14 pb-6">
          <p className="text-sm text-gray-500">Welcome back,</p>
          <h1 className="text-2xl font-bold text-gray-900">{user?.username || "Rider"}</h1>
        </div>

        {/* Approval Banner */}
        {user && !user.is_approved_rider && (
          <div className="mx-5 mb-4 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">Pending Approval</p>
              <p className="text-xs text-yellow-700 mt-0.5">Your account is awaiting admin approval. You cannot receive payments yet.</p>
            </div>
          </div>
        )}

        {/* Earnings Card */}
        <div className="px-5 mb-6">
          <div className="bg-black text-white rounded-3xl p-6 shadow-xl">
            <p className="text-sm text-gray-400 mb-1">Total Earnings</p>
            <p className="text-4xl font-bold tracking-tight mb-6">
              ₦{displayBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </p>
            <Link
              href="/rider/cashout"
              className={`inline-flex items-center gap-2 bg-white text-black rounded-2xl px-5 py-2.5 text-sm font-semibold transition-colors ${!user?.is_approved_rider ? "opacity-50 pointer-events-none" : "hover:bg-gray-100"}`}
            >
              <Banknote className="w-4 h-4" />
              Cash Out
            </Link>
          </div>
        </div>

        {/* My QR link */}
        <div className="px-5 mb-6">
          <Link href="/rider/profile" className="flex items-center justify-between bg-white rounded-3xl px-6 py-4 shadow-sm border border-gray-100">
            <p className="font-medium text-gray-900">View My QR Code</p>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>

        {/* Transactions */}
        <div className="px-5">
          <h2 className="text-base font-semibold mb-4">Payment History</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <TransactionList />
          )}
        </div>
      </div>
      <BottomNav />
    </RouteGuard>
  );
}
