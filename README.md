# RidePay Frontend

Apple-Style Campus Transport Payment App

---

## Overview

RidePay Frontend is a mobile-first web application that enables fast, cashless transport payments within a campus environment.

Passengers can fund a wallet and pay riders instantly using QR codes or short vehicle codes. Riders receive payments in real time and can withdraw earnings directly to their bank accounts.

The experience is designed to feel effortless, clean, and premium.

---

## Design Philosophy (Apple-Inspired)

* **Clarity over complexity**: every screen has one clear action
* **Minimal interface**: remove anything that doesn’t help the task
* **Soft visual depth**: layered cards with subtle shadows
* **Fluid interactions**: smooth, fast transitions
* **Strong typography**: balance, hierarchy, readability
* **Neutral colors**: white, gray, and a single accent for actions

If a user has to think, the design has already failed.

---

## Tech Stack

* **Framework**: Next.js (App Router)
* **Styling**: TailwindCSS
* **State Management**: Zustand (preferred) or React Context
* **Networking**: Fetch / Axios
* **Real-time**: Socket.IO Client
* **QR Scanning**: html5-qrcode (or equivalent)
* **Icons**: Lucide

---

## Core Features

### Passenger

* OTP-based authentication
* Wallet balance display
* Fund wallet
* Scan QR code or enter vehicle code
* Payment confirmation before debit
* Instant feedback on payment status

### Rider

* Rider dashboard with earnings
* Real-time payment notifications
* Cash-out to bank account

### Admin

* Approve or suspend riders
* Set transport fare
* Monitor transactions

---

## User Experience Flow

### Passenger Journey

1. Sign up / log in
2. Fund wallet
3. Scan QR or enter code
4. Review payment details
5. Confirm payment
6. Receive instant feedback

### Rider Journey

1. Get approved
2. Start receiving payments
3. View earnings in real time
4. Cash out to bank

---

## Real-Time Behavior

The app listens for live events to ensure instant updates:

* Payment success or failure
* Rider earnings updates
* Cash-out confirmations

This removes the need for manual refresh and keeps the experience responsive.

---

## Project Structure

```
/app
  /(auth)
  /(passenger)
  /(rider)
  /(admin)

/components
  ui/
  cards/
  scanner/
  modals/
  sheets/

/lib
  api/
  store/
  hooks/
  utils/

/styles
```

---

## Key UI Components

* **Wallet Card**: large balance display with clear hierarchy
* **QR Scanner**: fullscreen camera with minimal overlay
* **Payment Sheet**: bottom sheet for confirming transactions
* **Toast Notifications**: instant, lightweight feedback
* **Earnings Panel**: rider-focused financial summary

---

## Core Screens

### Passenger Dashboard

* Prominent wallet balance
* Primary action: Scan to Pay
* Secondary action: Enter Code

### Scanner Screen

* Fullscreen camera view
* Clean guide frame
* Instant QR detection
* Manual fallback option

### Payment Confirmation

* Rider name
* Vehicle ID
* Fare amount (highlighted)
* Single “Pay” action

### Payment Result

* Clear success or failure state
* Updated wallet balance
* Subtle animation feedback

### Rider Dashboard

* Total earnings
* Live payment feed
* Cash-out button

---

## State Management

* Global state for user, wallet, and session
* Local state for UI interactions
* Optimistic updates for fast feedback

---

## Environment Variables

```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SOCKET_URL=
```

---

## Running Locally

```bash
npm install
npm run dev
```

---

## Production Build

```bash
npm run build
npm start
```

---

## Design Guidelines

* Use **rounded corners (2xl)** consistently
* Follow an **8px spacing system**
* Prefer **bottom sheets** over modals on mobile
* Keep animations subtle (150–250ms)
* Avoid visual noise, let content breathe

---

## Hackathon Focus

* Build only the **happy path** end-to-end
* Prioritize speed and clarity over edge cases
* Ensure QR → Pay → Notification works flawlessly
* Mock non-critical flows if needed

---

## Demo Flow

1. Passenger logs in
2. Passenger funds wallet
3. Passenger scans QR or enters code
4. Passenger confirms payment
5. Rider receives instant notification
6. Rider cashes out
