# RidePay Frontend — API & Architecture Assumptions

This document captures assumptions made while building the frontend, where the backend API (as described in `swagger.json`) was incomplete or ambiguous.

## Auth & Users

- **User object** (`GET /api/auth/users/me/`): Returns a User object with the following fields:
  - `id` (string): Unique user ID
  - `username` (string): Username
  - `role` (string): User role (`"driver"` or `"passenger"`)
  - `email` (string): User email
  - `plate_number` (string | null): Vehicle plate number (for drivers)
  - `short_code` (string | null): 6-character code for generating QR (for approved drivers)
  - `is_approved_rider` (boolean): Whether the driver is approved to receive payments
  - `wallet` (number): Wallet balance in Naira
- **`short_code` field**: A 6-character alphanumeric string returned on the User object for drivers. Used to generate the QR code.
- **Google OAuth**: `POST /api/users/google/` accepts `{ token }` (Google ID token) and returns `{ access, refresh, user }`. Google Sign-In UI is not yet implemented in the frontend — the API function is defined but the button is not wired up.

## Transactions

- **Transaction history**: `GET /api/transactions/history/` returns `Transaction[]` with the following structure:
  - `id` (number): Unique transaction ID
  - `amount` (number): Transaction amount
  - `status` (string): Transaction status (e.g., `"PENDING"`, `"COMPLETED"`, `"FAILED"`)
  - `transaction_type` (string): Type of transaction (e.g., `"TOPUP"`, `"PAYMENT"`, `"TRANSFER"`, `"CASHOUT"`)
  - `interswitch_ref` (string | null): Interswitch reference code (e.g., `"TOPUP-d76156deb6"`)
  - `timestamp` (string): ISO 8601 formatted timestamp (e.g., `"2026-03-27T19:35:38.812567Z"`)
  - `sender_name` (string, optional): Name of the sender (for transfer transactions)
  - `receiver_name` (string, optional): Name of the receiver (for applicable transactions)
- **Top-up response**: `POST /api/transactions/topup/` is assumed to return `{ reference, payment_url?, ... }`. If `payment_url` is present, the user is redirected there (for Interswitch-hosted checkout). Otherwise, the `reference` is surfaced for use with the Interswitch inline JS SDK. The exact Interswitch integration flow depends on the SDK version the backend configures.
- **Pay rider**: `POST /api/transactions/pay/` accepts `{ code, amount }`. The `amount` is the current fare fetched from `GET /api/transactions/fare/`.
- **Cashout**: `POST /api/transactions/cashout/` accepts `{ amount, account_number, bank_code }`.

## Admin

- **Admin role**: Users with admin access are assumed to have a role not equal to `"passenger"` or `"driver"`. The admin dashboard (`/admin/dashboard`) uses `RouteGuard` without `allowedRoles` restriction — access control should be enforced server-side.
- **Rider approval**: `POST /api/transactions/admin/approve-rider/<rider_id>/` accepts `{ action: "approve" | "suspend" }`.
- **Set fare**: `POST /api/transactions/admin/set-fare/` accepts `{ amount }`.
- **Plate number update**: `PUT /api/users/plate-number/` accepts `{ plate_number }`.

## WebSocket / Real-time

- **Django Channels**: The backend exposes a WebSocket endpoint at `NEXT_PUBLIC_SOCKET_URL/ws/notifications/`. Authentication is via JWT token in the query string (`?token=<access_token>`).
- **WebSocket URL**: The frontend converts HTTP/HTTPS URLs to WS/WSS. For example, `https://ridepay.onrender.com` becomes `wss://ridepay.onrender.com/ws/notifications/`.
- **Event names**: Backend sends `payment_notification` messages as JSON payloads.
- **Event payload**: Messages are JSON with structure: `{ type: "payment_notification", message: string, amount: number, id: string, description?: string, created_at: string }`.
- **Socket features**: The implementation includes automatic reconnection with exponential backoff (1s to 5s), max 5 reconnection attempts, and proper cleanup on disconnect.

## Middleware & Auth Guard

- **JWT is stored in localStorage** (not cookies), so server-side route protection via Next.js middleware is not possible. Route protection is implemented client-side via the `RouteGuard` component, which reads `localStorage` and redirects unauthenticated users to `/login`.

## Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```
