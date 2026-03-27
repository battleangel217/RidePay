"use client";
import { useWalletStore } from "@/lib/store/walletStore";
import { ArrowDownLeft, ArrowUpRight, Banknote } from "lucide-react";
import { Spinner } from "./ui/Spinner";

interface Props {
  loading?: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTransactionIcon(type: string) {
  const upperType = type.toUpperCase();
  if (upperType === "TOPUP" || upperType === "TRANSFER")
    return <ArrowDownLeft className="w-4 h-4" />;
  if (upperType === "PAYMENT" || upperType === "PAY")
    return <ArrowUpRight className="w-4 h-4" />;
  return <Banknote className="w-4 h-4" />;
}

function getTransactionLabel(
  type: string,
  receiverName?: string,
  senderName?: string,
) {
  const upperType = type.toUpperCase();
  if (upperType === "TOPUP") return "Wallet Top-up";
  if (upperType === "PAYMENT" || upperType === "PAY")
    return `Payment to ${receiverName}`;
  if (upperType === "CASHOUT") return "Cash Withdrawal";
  if (upperType === "TRANSFER") return `Transfer from ${senderName}`;
  return receiverName || type;
}

export function TransactionList({ loading }: Props) {
  const { transactions } = useWalletStore();

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="text-center py-12 text-app-tertiary">
        <Banknote className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {transactions.map((txn) => (
        <div
          key={txn.id}
          className="flex items-center gap-3 px-2 py-3 rounded-2xl hover:bg-background-secondary transition-colors"
        >
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              txn.transaction_type.toUpperCase() === "TOPUP" ||
              txn.transaction_type.toUpperCase() === "TRANSFER"
                ? "bg-success/20 text-success"
                : txn.transaction_type.toUpperCase() === "PAYMENT" ||
                    txn.transaction_type.toUpperCase() === "PAY"
                  ? "bg-error/20 text-error"
                  : "bg-primary/20 text-primary"
            }`}
          >
            {getTransactionIcon(txn.transaction_type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-app-primary truncate">
              {getTransactionLabel(
                txn.transaction_type,
                txn.receiver_name,
                txn.sender_name,
              )}
            </p>
            <p className="text-xs text-app-tertiary">
              {formatDate(txn.timestamp)}
            </p>
          </div>
          <div className="text-right">
            <p
              className={`text-sm font-semibold ${
                txn.transaction_type.toUpperCase() === "TOPUP" ||
                txn.transaction_type.toUpperCase() === "TRANSFER"
                  ? "text-success"
                  : txn.transaction_type.toUpperCase() === "CASHOUT"
                    ? "text-primary"
                    : "text-error"
              }`}
            >
              {txn.transaction_type.toUpperCase() === "TOPUP" ||
              txn.transaction_type.toUpperCase() === "TRANSFER"
                ? "+"
                : "-"}
              ₦{txn.amount.toLocaleString()}
            </p>
            <p
              className={`text-[10px] capitalize ${
                txn.status.toUpperCase() === "COMPLETED"
                  ? "text-success"
                  : txn.status.toUpperCase() === "FAILED"
                    ? "text-error"
                    : "text-yellow-500"
              }`}
            >
              {txn.status}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
