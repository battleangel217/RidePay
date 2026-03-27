export type Role = "passenger" | "driver";

export interface User {
  id: string;
  username: string;
  role: Role;
  email: string;
  plate_number: string | null;
  short_code: string | null;
  is_approved_rider: boolean;
  wallet_balance?: number; // NOTE: not in current swagger, assumed added
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface GoogleSignupResponse {
  access: string;
  refresh: string;
  user: User;
}

// NOTE: transaction history endpoint not in swagger yet.
// Assumed: GET /api/transactions/history/ returns Transaction[]
export interface Transaction {
  id: string;
  type: "topup" | "payment" | "cashout";
  amount: number;
  description: string;
  created_at: string;
  status: "pending" | "completed" | "failed";
}

export interface GetFareResponse {
  fare: number;
}

// NOTE: topup response not documented in swagger.
// Assumed: POST /api/transactions/topup/ returns { reference, ... } for Interswitch SDK
export interface TopUpResponse {
  reference?: string;
  payment_url?: string;
  [key: string]: unknown;
}
