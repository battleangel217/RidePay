import { create } from "zustand";
import type { Transaction } from "../types";

interface WalletState {
  balance: number;
  transactions: Transaction[];
  setBalance: (balance: number) => void;
  setTransactions: (txns: Transaction[]) => void;
  prependTransaction: (txn: Transaction) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  transactions: [],
  setBalance: (balance) => set({ balance }),
  setTransactions: (transactions) => set({ transactions }),
  prependTransaction: (txn) =>
    set((s) => ({ transactions: [txn, ...s.transactions] })),
}));
