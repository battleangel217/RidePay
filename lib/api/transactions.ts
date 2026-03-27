import client from "./client";
import type { GetFareResponse, TopUpResponse, Transaction } from "../types";

export const getFare = () => client.get<GetFareResponse>("/api/transactions/fare/");

export const topUp = (amount: number) =>
  client.post<TopUpResponse>("/api/transactions/topup/", { amount });

export const payRider = (code: string, amount: number) =>
  client.post("/api/transactions/pay/", { code, amount });

export const cashOut = (amount: number, account_number: string, bank_code: string) =>
  client.post("/api/transactions/cashout/", { amount, account_number, bank_code });

// NOTE: endpoint path assumed — not in swagger yet
export const getHistory = () =>
  client.get<Transaction[]>("/api/transactions/history/");
