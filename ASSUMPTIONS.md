# RidePay Frontend — API & Architecture Assumptions

This document captures assumptions made while building the frontend, where the backend API (as described in `swagger.json`) was incomplete or ambiguous.

## Auth & Users

- **JWT prefix**: The Authorization header uses `JWT <token>` (not `Bearer`) as is standard with `djoser` + `djangorestframework-simplejwt`.
- **Login response**: `POST /api/auth/jwt/create/` returns `{ access, refresh, user }`. The `user` object includes `role`, `is_approved_rider`, `short_code`, `plate_number`, and `wallet_balance`. If the backend does not return `user` inline, a follow-up call to `GET /api/auth/users/me/` is made.
- **`wallet_balance` field**: Assumed to be included on the User object returned by `/api/auth/users/me/`. If not present, the wallet balance from the local Zustand store is used.
- **`short_code` field**: Assumed to be a 6-character alphanumeric string returned on the User object for drivers. Used to generate the QR code.
- **Google OAuth**: `POST /api/users/google/` accepts `{ token }` (Google ID token) and returns `{ access, refresh, user }`. Google Sign-In UI is not yet implemented in the frontend — the API function is defined but the button is not wired up.

## Transactions

- **Transaction history**: Assumed endpoint `GET /api/transactions/history/` returns `Transaction[]`. This endpoint is not in the current swagger. If it 404s, the frontend silently ignores the error and shows an empty history.
- **Top-up response**: `POST /api/transactions/topup/` is assumed to return `{ reference, payment_url?, ... }`. If `payment_url` is present, the user is redirected there (for Interswitch-hosted checkout). Otherwise, the `reference` is surfaced for use with the Interswitch inline JS SDK. The exact Interswitch integration flow depends on the SDK version the backend configures.
- **Pay rider**: `POST /api/transactions/pay/` accepts `{ code, amount }`. The `amount` is the current fare fetched from `GET /api/transactions/fare/`.
- **Cashout**: `POST /api/transactions/cashout/` accepts `{ amount, account_number, bank_code }`.

## Admin

- **Admin role**: Users with admin access are assumed to have a role not equal to `"passenger"` or `"driver"`. The admin dashboard (`/admin/dashboard`) uses `RouteGuard` without `allowedRoles` restriction — access control should be enforced server-side.
- **Rider approval**: `POST /api/transactions/admin/approve-rider/<rider_id>/` accepts `{ action: "approve" | "suspend" }`.
- **Set fare**: `POST /api/transactions/admin/set-fare/` accepts `{ amount }`.
- **Plate number update**: `PUT /api/users/plate-number/` accepts `{ plate_number }`.

## WebSocket / Real-time

- **Socket.IO**: The backend is assumed to expose a Socket.IO server at `NEXT_PUBLIC_SOCKET_URL`. Authentication is via `{ auth: { token } }` on connection.
- **Event names**: `payment_received` and `payment_sent` are assumed event names. These must be verified and updated to match the actual backend event names.
- **Event payload**: The `payment_received` event is assumed to carry `{ id, amount, description, created_at }`.

## Middleware & Auth Guard

- **JWT is stored in localStorage** (not cookies), so server-side route protection via Next.js middleware is not possible. Route protection is implemented client-side via the `RouteGuard` component, which reads `localStorage` and redirects unauthenticated users to `/login`.

## Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```
