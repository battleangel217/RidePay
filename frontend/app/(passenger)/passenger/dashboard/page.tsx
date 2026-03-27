"use client";
import { RouteGuard } from "@/components/RouteGuard";
import { TransactionList } from "@/components/TransactionList";
import { BottomNav } from "@/components/ui/BottomNav";
import { SidebarNav } from "@/components/ui/SidebarNav";
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
      <SidebarNav />
      <div className="min-h-screen md:ml-64 md:max-w-6xl md:mx-auto pb-24 md:pb-12">
        <div className="px-5 pt-14 pb-6 md:pt-8 md:px-8">
          <p className="text-sm text-app-secondary">Good day,</p>
          <h1 className="text-2xl font-bold text-app-primary md:text-3xl">
            {user?.username || "Passenger"}
          </h1>
        </div>

        <div className="px-5 md:px-8 md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <WalletCard />
          </div>

          {/* Primary CTA - Desktop Column */}
          <div className="mt-6 md:mt-0 md:col-span-2 space-y-4">
            {/* Scan to Pay */}
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
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <QrCode className="w-6 h-6 text-white" />
              </div>
            </Link>

            {/* Quick Pay */}
            <Link
              href="/passenger/pay"
              className="flex items-center justify-between bg-background-secondary rounded-3xl px-6 py-4 shadow-sm border border-border hover:bg-border transition-colors"
            >
              <p className="font-medium text-gray-900">
                Enter rider code manually
              </p>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </Link>
          </div>
        </div>

        {/* Transaction History */}
        <div className="px-5 md:px-8 mt-8 md:mt-12">
          <h2 className="text-base font-semibold text-gray-900 mb-4 md:text-lg">
            Recent Transactions
          </h2>
          <TransactionList loading={loading} />
        </div>
      </div>
      <BottomNav />
    </RouteGuard>
  );
}
