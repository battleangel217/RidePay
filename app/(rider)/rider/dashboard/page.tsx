"use client";
import { RouteGuard } from "@/components/RouteGuard";
import { TransactionList } from "@/components/TransactionList";
import { BottomNav } from "@/components/ui/BottomNav";
import { getMe } from "@/lib/api/auth";
import { getHistory } from "@/lib/api/transactions";
import {
  useSocket,
  type PaymentNotificationPayload,
} from "@/lib/hooks/useSocket";
import { useAuthStore } from "@/lib/store/authStore";
import { useUIStore } from "@/lib/store/uiStore";
import { useWalletStore } from "@/lib/store/walletStore";
import { AlertTriangle, Banknote, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RiderDashboard() {
  const { user, setUser } = useAuthStore();
  const { setTransactions, setBalance, prependTransaction, balance } =
    useWalletStore();
  const { addToast } = useUIStore();
  const [loading, setLoading] = useState(true);

  const displayBalance = user?.wallet !== undefined ? user.wallet : balance;

  useEffect(() => {
    (async () => {
      try {
        const { data: me } = await getMe();
        setUser(me);
        if (me.wallet !== undefined) setBalance(me.wallet);
        try {
          const { data: history } = await getHistory();
          setTransactions(history);
        } catch {
          /* history may not be available yet */
        }
      } catch {
        addToast("error", "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [setUser, setTransactions, setBalance, addToast]);

  // Real-time payment notifications via Socket.IO
  useSocket((data: PaymentNotificationPayload) => {
    const { amount, id, description, created_at } = data;
    addToast(
      "success",
      `Payment received: ₦${amount?.toLocaleString() || "0"}`,
    );
    prependTransaction({
      id: parseInt(id, 10) || Date.now(),
      amount: amount || 0,
      status: "COMPLETED",
      transaction_type: "PAYMENT",
      interswitch_ref: null,
      timestamp: created_at || new Date().toISOString(),
      receiver_name: user?.username || "You",
    });
    // Refresh balance
    getMe()
      .then(({ data: me }) => {
        setUser(me);
        if (me.wallet !== undefined) setBalance(me.wallet);
      })
      .catch((err) =>
        console.error("Failed to refresh balance after payment:", err),
      );
  });

  return (
    <RouteGuard allowedRoles={["driver"]}>
      <div className="min-h-screen pb-24">
        <div className="px-5 pt-14 pb-6">
          <p className="text-sm text-app-secondary">Welcome back,</p>
          <h1 className="text-2xl font-bold text-app-primary">
            {user?.username || "Rider"}
          </h1>
        </div>

        {/* Approval Banner */}
        {user && !user.is_approved_rider && (
          <div className="mx-5 mb-4 bg-warning/20 border border-warning rounded-2xl px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-warning">
                Pending Approval
              </p>
              <p className="text-xs text-warning/80 mt-0.5">
                Your account is awaiting admin approval. You cannot receive
                payments yet.
              </p>
            </div>
          </div>
        )}

        {/* Earnings Card */}
        <div className="px-5 mb-6">
          <div className="bg-primary text-white rounded-3xl p-6 shadow-xl">
            <p className="text-sm text-foreground-secondary mb-1">
              Total Earnings
            </p>
            <p className="text-4xl font-bold tracking-tight mb-6">
              ₦
              {displayBalance.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
              })}
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
          <Link
            href="/rider/profile"
            className="flex items-center justify-between bg-background-secondary rounded-3xl px-6 py-4 shadow-sm border border-border"
          >
            <p className="font-medium text-app-primary">View My QR Code</p>
            <ChevronRight className="w-5 h-5 text-app-tertiary" />
          </Link>
        </div>

        {/* Transactions */}
        <div className="px-5">
          <h2 className="text-base font-semibold text-app-primary mb-4">
            Payment History
          </h2>
          <TransactionList loading={loading} />
        </div>
      </div>
      <BottomNav />
    </RouteGuard>
  );
}
