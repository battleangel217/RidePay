"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { useWalletStore } from "@/lib/store/walletStore";
import { useUIStore } from "@/lib/store/uiStore";
import { getMe } from "@/lib/api/auth";
import { getHistory } from "@/lib/api/transactions";
import { WalletCard } from "@/components/WalletCard";
import { TransactionList } from "@/components/TransactionList";
import { BottomNav } from "@/components/ui/BottomNav";
import { RouteGuard } from "@/components/RouteGuard";
import { QrCode, ChevronRight } from "lucide-react";
import Link from "next/link";

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
        if (me.wallet_balance !== undefined) setBalance(me.wallet_balance);

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
          <p className="text-sm text-gray-500">Good day,</p>
          <h1 className="text-2xl font-bold text-gray-900">{user?.username || "Passenger"}</h1>
        </div>

        <div className="px-5">
          <WalletCard />
        </div>

        {/* Primary CTA */}
        <div className="px-5 mt-6">
          <Link
            href="/passenger/scan"
            className="flex items-center justify-between bg-black text-white rounded-3xl px-6 py-5 shadow"
          >
            <div>
              <p className="font-semibold text-lg">Scan to Pay</p>
              <p className="text-sm text-gray-400 mt-0.5">Scan rider&apos;s QR or enter code</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
          </Link>
        </div>

        {/* Quick Pay */}
        <div className="px-5 mt-4">
          <Link
            href="/passenger/pay"
            className="flex items-center justify-between bg-white rounded-3xl px-6 py-4 shadow-sm border border-gray-100"
          >
            <p className="font-medium text-gray-900">Enter rider code manually</p>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>

        {/* Transaction History */}
        <div className="px-5 mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
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
