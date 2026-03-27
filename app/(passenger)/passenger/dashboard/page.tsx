"use client";
import { RouteGuard } from "@/components/RouteGuard";
import { TransactionList } from "@/components/TransactionList";
import { BottomNav } from "@/components/ui/BottomNav";
import { WalletCard } from "@/components/WalletCard";
import { getMe } from "@/lib/api/auth";
import { getHistory } from "@/lib/api/transactions";
import { useAuthStore } from "@/lib/store/authStore";
import { useUIStore } from "@/lib/store/uiStore";
import { useWalletStore } from "@/lib/store/walletStore";
import { ChevronRight, QrCode } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PassengerDashboard() {
  const { setUser, user } = useAuthStore();
  const { setTransactions, setBalance } = useWalletStore();
  const { addToast } = useUIStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: me } = await getMe();
        setUser(me);
        if (me.wallet !== undefined) setBalance(me.wallet);

        // NOTE: assumes GET /api/transactions/history/ exists
        try {
          const { data: history } = await getHistory();
          setTransactions(history);
        } catch {
          // History endpoint may not be ready yet
        }
      } catch {
        addToast("error", "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [setUser, setTransactions, setBalance, addToast]);

  return (
    <RouteGuard allowedRoles={["passenger"]}>
      <div className="min-h-screen pb-24">
        <div className="px-5 pt-14 pb-6">
          <p className="text-sm text-app-secondary">Good day,</p>
          <h1 className="text-2xl font-bold text-app-primary">
            {user?.username || "Passenger"}
          </h1>
        </div>

        <div className="px-5">
          <WalletCard />
        </div>

        {/* Primary CTA */}
        <div className="px-5 mt-6">
          <Link
            href="/passenger/scan"
            className="flex items-center justify-between bg-primary text-white rounded-3xl px-6 py-5 shadow hover:bg-primary-hover transition-colors no-underline"
          >
            <div>
              <p className="font-semibold text-lg text-white">Scan to Pay</p>
              <p className="text-sm text-white/80 mt-0.5">
                Scan rider&apos;s QR or enter code
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
          </Link>
        </div>

        {/* Quick Pay */}
        <div className="px-5 mt-4">
          <Link
            href="/passenger/pay"
            className="flex items-center justify-between bg-background-secondary rounded-3xl px-6 py-4 shadow-sm border border-border hover:bg-border transition-colors"
          >
            <p className="font-medium text-gray-900">
              Enter rider code manually
            </p>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>

        {/* Transaction History */}
        <div className="px-5 mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Recent Transactions
          </h2>
          <TransactionList loading={loading} />
        </div>
      </div>
      <BottomNav />
    </RouteGuard>
  );
}
