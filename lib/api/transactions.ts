import type { GetFareResponse, TopUpResponse, Transaction } from "../types";
import client from "./client";

export const getFare = () =>
  client.get<GetFareResponse>("/api/transactions/fare/");

export const topUp = (amount: number) =>
  client.post<TopUpResponse>("/api/transactions/topup/", { amount });

export const payRider = (code: string, amount: number) =>
  client.post("/api/transactions/pay/", { code, amount });

export const cashOut = (
  amount: number,
  account_number: string,
  bank_code: string,
) =>
  client.post("/api/transactions/cashout/", {
    amount,
    account_number,
    bank_code,
  });

// NOTE: endpoint path assumed — not in swagger yet
export const getHistory = () =>
  client.get<Transaction[]>("/api/transactions/history/");

// Verify Interswitch payment on backend
// Backend should verify with Interswitch API before crediting wallet
export const verifyPayment = (
  transactionRef: string,
  interswitchRef: string,
  amount: number,
) =>
  client.post<{ status: string; message: string }>(
    "/api/transactions/verify-payment/",
    {
      transaction_ref: transactionRef,
      interswitch_ref: interswitchRef,
      amount,
    },
  );
