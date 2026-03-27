"use client";
import { useWalletStore } from "@/lib/store/walletStore";
import { ArrowUpRight, ArrowDownLeft, Banknote } from "lucide-react";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function TransactionList() {
  const { transactions } = useWalletStore();

  if (!transactions.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Banknote className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {transactions.map((txn) => (
        <div key={txn.id} className="flex items-center gap-3 px-2 py-3 rounded-2xl hover:bg-gray-50 transition-colors">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            txn.type === "topup" ? "bg-green-100 text-green-700" :
            txn.type === "payment" ? "bg-red-100 text-red-700" :
            "bg-blue-100 text-blue-700"
          }`}>
            {txn.type === "topup" ? <ArrowDownLeft className="w-4 h-4" /> :
             txn.type === "payment" ? <ArrowUpRight className="w-4 h-4" /> :
             <Banknote className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{txn.description}</p>
            <p className="text-xs text-gray-400">{formatDate(txn.created_at)}</p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${
              txn.type === "topup" ? "text-green-700" :
              txn.type === "cashout" ? "text-blue-700" :
              "text-red-700"
            }`}>
              {txn.type === "topup" ? "+" : "-"}₦{txn.amount.toLocaleString()}
            </p>
            <p className={`text-[10px] capitalize ${
              txn.status === "completed" ? "text-green-500" :
              txn.status === "failed" ? "text-red-500" :
              "text-yellow-500"
            }`}>{txn.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
