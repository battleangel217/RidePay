export type Role = "passenger" | "driver";

export interface User {
  id: string;
  username: string;
  role: Role;
  email: string;
  plate_number: string | null;
  short_code: string | null;
  is_approved_rider: boolean;
  wallet: number; // Wallet balance from GET /api/auth/users/me/
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

// Transaction from GET /api/transactions/history/
export interface Transaction {
  id: number;
  amount: number;
  status: string; // "PENDING", "COMPLETED", "FAILED", etc.
  transaction_type: string; // "TOPUP", "PAYMENT", "CASHOUT", "TRANSFER", etc.
  interswitch_ref: string | null;
  timestamp: string; // ISO 8601 format
  receiver_name?: string;
  sender_name?: string;
}

export interface GetFareResponse {
  fare: number;
}

// POST /api/transactions/topup/ response for Interswitch Webpay initialization
export interface TopUpResponse {
  amount: number; // Amount in kobo
  transaction_ref: string; // e.g., "TOPUP-51577e5511"
  customer_id: string; // e.g., "PASS-5e33-8e86-45a9"
  customer_name: string; // e.g., "emma"
  customer_email: string; // e.g., "emmanuelekopimo@gmail.com"
  message: string; // "Use these details to initialize Interswitch Webpay on the frontend"
}
