"use client";
import { useWalletStore } from "@/lib/store/walletStore";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";

export function WalletCard() {
  const { balance } = useWalletStore();
  const { user } = useAuthStore();

  const displayBalance = user?.wallet_balance !== undefined ? user.wallet_balance : balance;

  return (
    <div className="bg-black text-white rounded-3xl p-6 shadow-xl">
      <p className="text-sm text-gray-400 mb-1">Wallet Balance</p>
      <p className="text-4xl font-bold tracking-tight mb-6">
        ₦{displayBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
      </p>
      {user?.role === "passenger" && (
        <Link
          href="/passenger/fund"
          className="inline-flex items-center gap-2 bg-white text-black rounded-2xl px-5 py-2.5 text-sm font-semibold hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Fund Wallet
        </Link>
      )}
    </div>
  );
}
