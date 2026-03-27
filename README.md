# RidePay

A modern, mobile-first web application for cashless transport payments in campus environments. Passengers fund wallets and pay riders instantly via QR codes. Riders track earnings in real time and withdraw to their bank accounts.

---

## Features Overview

### 🚗 Passengers

- **Quick Signup/Login**: OTP-based authentication for fast onboarding
- **Wallet Management**: Check balance, fund wallet via Interswitch payment gateway
- **Instant Payments**: Scan rider QR codes or enter 6-character vehicle codes to pay
- **Payment Confirmation**: Review amount and rider details before confirming
- **Transaction History**: Complete record of all payments with status and timestamps
- **Real-Time Feedback**: Instant notification of payment success or failure

### 🛵 Riders

- **Earnings Dashboard**: Live view of total earnings and recent transactions
- **Real-Time Notifications**: Instant alerts when passengers pay, with amount and timestamp
- **Vehicle QR Code**: Auto-generated QR code based on approval status
- **Bank Account Cashout**: Withdraw earnings directly to registered bank accounts with multiple bank support
- **Rider Profile**: Manage plate number and personal information
- **Payment History**: Track all received payments and cashout transactions

### 👨‍💼 Admin

- **Rider Management**: Approve or suspend rider accounts
- **Fare Control**: Set transport fare amounts dynamically
- **Transaction Monitoring**: View all platform transactions with detailed logs

---

## Tech Stack

| Category               | Technology                   |
| ---------------------- | ---------------------------- |
| **Frontend Framework** | Next.js 16 (App Router)      |
| **Language**           | TypeScript 5                 |
| **UI Styling**         | TailwindCSS 4 with PostCSS   |
| **State Management**   | Zustand 5                    |
| **HTTP Client**        | Axios, Fetch API             |
| **Real-Time**          | Socket.IO Client (WebSocket) |
| **QR Code**            | html5-qrcode, qrcode.react   |
| **Payment Gateway**    | Interswitch Webpay           |
| **Icons**              | Lucide React                 |

---

## Project Structure

```
app/                          # Next.js App Router pages
├── (admin)/                  # Admin pages (dashboard, rider management)
├── (auth)/                   # Public auth pages (login, signup, password reset)
├── (passenger)/              # Passenger pages (dashboard, fund, pay, profile)
└── (rider)/                  # Rider pages (dashboard, cashout, profile)

components/
├── ui/                       # Reusable UI components (Button, Input, Card, Toast, etc.)
├── InterswitchPayment.tsx    # Payment gateway integration
├── RiderQRCode.tsx           # QR code display for riders
├── RouteGuard.tsx            # Authentication & authorization wrapper
├── TransactionList.tsx       # Transaction history display
├── WalletCard.tsx            # Wallet balance display
└── ...

lib/
├── api/                      # API client libraries
│   ├── auth.ts               # Authentication endpoints
│   ├── admin.ts              # Admin operations
│   ├── transactions.ts       # Payment & transaction endpoints
│   └── client.ts             # Axios client configuration
├── hooks/
│   └── useSocket.ts          # WebSocket connection hook
├── store/                    # Zustand stores
│   ├── authStore.ts          # Auth state (user, tokens)
│   ├── uiStore.ts            # UI state (toasts, modals)
│   └── walletStore.ts        # Wallet & transaction state
├── utils/
│   ├── interswitch.ts        # Payment URL generation & handling
│   └── banks.ts              # Bank list & bank code mapping
└── types.ts                  # TypeScript type definitions

public/                       # Static assets
```

---

## Installation & Setup

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)

### Steps

1. **Clone & Install Dependencies**

   ```bash
   git clone <repo-url>
   cd ridepay
   pnpm install
   ```

2. **Environment Variables**
   Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_API_URL=https://api.ridepay.com
   NEXT_PUBLIC_SOCKET_URL=wss://api.ridepay.com
   NEXT_PUBLIC_INTERSWITCH_MODE=TEST
   ```

3. **Run Development Server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for Production**
   ```bash
   pnpm build
   pnpm start
   ```

---

## Core Implementation Details

### Authentication

- **OTP-based login** for passengers and riders
- **JWT tokens** stored in localStorage for API requests
- **Route guards** via `RouteGuard` component for role-based access control
- **Auto-logout** on token expiration

### Payment Flow

**Passenger → Rider Payment:**

1. Passenger enters amount or scans QR/vehicle code
2. Frontend displays payment confirmation
3. Backend calculates fare (if using code)
4. Payment is debited from wallet
5. Rider receives instant notification via WebSocket
6. Transaction logged with status

**Passenger Wallet Topup (Interswitch):**

1. User enters amount on fund page
2. Frontend opens Interswitch payment in new tab
3. User completes payment securely at Interswitch
4. Redirect to callback page for verification
5. Wallet credited upon success

**Rider Cashout:**

1. Rider selects amount and bank account
2. Frontend sends to backend with bank details
3. Cashout processed and queued
4. Rider notified when completed

### Real-Time Notifications

- **WebSocket connection** to `/ws/notifications/` endpoint
- **Auto-reconnect** with exponential backoff (max 5 attempts, 1-5s delay)
- **Event types**: `payment_notification` for wallet updates
- **Graceful fallback**: App remains functional without WebSocket

### State Management

**Zustand stores:**

- `authStore`: User profile, auth tokens, logout
- `walletStore`: Transaction history, balance, payment state
- `uiStore`: Toast notifications, loading states

**Real-time sync:** Stores update from API responses and WebSocket events

---

## Development

### Scripts

```bash
pnpm dev       # Start dev server
pnpm build     # Build for production
pnpm start     # Start production server
pnpm lint      # Run ESLint
```

### Adding New Features

1. **New API endpoint**: Add client function in `lib/api/`
2. **New page**: Create in `app/(role)/role/feature/page.tsx`
3. **New component**: Add to `components/` with proper TypeScript types
4. **State updates**: Create new Zustand store or extend existing

### Key Components to Know

- **`RouteGuard`**: Wraps pages to enforce authentication & role access
- **`useSocket`**: Hook to access real-time WebSocket events
- **`InterswitchPayment`**: Handles Interswitch payment flow
- **`RiderQRCode`**: Displays rider's unique QR code

---

## API Integration

The frontend connects to a Django REST backend with these main endpoints:

- **Auth**: `/api/auth/` (login, signup, verify OTP, refresh token)
- **Users**: `/api/users/` (profile, plate number, Google OAuth)
- **Transactions**: `/api/transactions/` (history, topup, pay, cashout, fare)
- **Admin**: `/api/transactions/admin/` (approve riders, set fare)
- **WebSocket**: `/ws/notifications/` (real-time events)

See [ASSUMPTIONS.md](ASSUMPTIONS.md) for detailed API contracts and [INTERSWITCH_INTEGRATION.md](INTERSWITCH_INTEGRATION.md) for payment flow details.

---

## Design Principles

The UI follows an **Apple-inspired minimalist approach**:

- **Clarity over complexity**: One clear action per screen
- **Minimal interface**: Remove anything that doesn't serve the task
- **Soft visual depth**: Layered cards with subtle shadows
- **Fluid interactions**: Smooth, responsive transitions
- **Clear typography**: Hierarchy, balance, reading comfort
- **Neutral palette**: White, grays, with single accent color for actions

---

## Troubleshooting

### WebSocket Not Connecting?

Check browser console (F12) for connection status messages. WebSocket is optional — the app fully works without real-time notifications.

See [WEBSOCKET_DEBUGGING.md](WEBSOCKET_DEBUGGING.md) for detailed debugging.

### Interswitch Payment Failing?

Ensure:

- `NEXT_PUBLIC_INTERSWITCH_MODE` matches backend config (TEST vs LIVE)
- Merchant code and pay item ID are correct
- Amount is converted to kobo (Naira × 100)

See [INTERSWITCH_INTEGRATION.md](INTERSWITCH_INTEGRATION.md) for full integration guide.

### API Errors?

Check that `NEXT_PUBLIC_API_URL` points to the correct backend and the backend is running. API responses are logged to browser console.

---

## Browser Support

- Chrome/Edge latest
- Safari latest
- Firefox latest
- Mobile browsers (iOS Safari, Chrome mobile)

---

## License

TBD
