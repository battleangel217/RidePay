# Interswitch Payment Integration Guide

## Frontend Implementation ✅

The frontend uses a **redirect-based payment flow** with Interswitch Webpay. This approach:

- Opens payment in a new tab (better UX)
- More secure (no client-side callback vulnerabilities)
- Cleaner error handling

### Components & Pages

- **Fund Wallet Page** (`app/(passenger)/passenger/fund/page.tsx`): Amount entry and payment initiation
- **Payment Callback Page** (`app/(passenger)/passenger/payment-callback/page.tsx`): Verifies payment after redirect
- **Interswitch Utility** (`lib/utils/interswitch.ts`): URL generation and payment opener

### Key Points:

1. **Amount Conversion**: Frontend sends amounts in **kobo** (Naira × 100)
   - User enters: ₦500 (Naira)
   - Sent to backend: 50000 (kobo)

2. **Merchant Details**:
   - Merchant Code: `MX187`
   - Pay Item ID: `Default_Payable_MX187`
   - Mode: Controlled by `NEXT_PUBLIC_INTERSWITCH_MODE` env variable (`TEST` or `LIVE`)

3. **Payment Flow**:
   - User enters amount → Frontend converts to kobo → Calls `/api/transactions/topup/`
   - Backend returns payment initialization data with transaction reference
   - Frontend generates Interswitch payment URL
   - Opens payment in new tab (user completes payment on Interswitch)
   - Interswitch redirects user back to `/passenger/payment-callback?...`
   - Callback page verifies payment with backend
   - On success: Wallet credited, user redirected to dashboard

---

## Backend Requirements ⚠️

You need to implement these endpoints:

### 1. POST `/api/transactions/topup/`

**Request:**

```json
{
  "amount": 50000 // in kobo
}
```

**Response:**

```json
{
  "amount": 50000,
  "transaction_ref": "TOPUP-51577e5511",
  "customer_id": "PASS-5e33-8e86-45a9",
  "customer_name": "emma",
  "customer_email": "emmanuelekopimo@gmail.com",
  "message": "Use these details to initialize Interswitch Webpay on the frontend"
}
```

**Backend Logic:**

- Extract user from request
- Generate unique transaction reference (e.g., `TOPUP-{timestamp}`)
- Store transaction record in db with status `PENDING`
- Return customer details from user profile

---

### 2. POST `/api/transactions/verify-payment/` ⭐ CRITICAL

Called from `/passenger/payment-callback` after user completes payment on Interswitch.

**Request:**

```json
{
  "transaction_ref": "TOPUP-51577e5511",
  "interswitch_ref": "000106923853 or FBN|WEB|MX26070|...",
  "amount": 50000
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Payment verified and wallet credited"
}
```

**Backend Logic:**

- ✅ Verify transaction exists and is PENDING
- ✅ Verify amount matches
- ✅ **Server-side verification with Interswitch API** (CRITICAL!)
  - Use appropriate endpoint based on mode:
    - **TEST**: `https://qa.interswitchng.com/collections/api/v1/gettransaction.json?merchantcode=MX187&transactionreference=TOPUP-51577e5511&amount=50000`
    - **LIVE**: `https://webpay.interswitchng.com/collections/api/v1/gettransaction.json?merchantcode=MX187&transactionreference=TOPUP-51577e5511&amount=50000`
- ✅ Verify response shows completed transaction
- ✅ Update transaction record to `COMPLETED`
- ✅ **Credit user's wallet** with the amount
- ✅ Return success or detailed error

---

## Payment Callback Parameters

When user completes payment on Interswitch, they are redirected back to:

```
/passenger/payment-callback?transaction_ref={ref}&payRef={payRef}&resp={resp}&amount={amount}&...
```

**URL Parameters from Interswitch:**

- `transaction_ref`: Your transaction reference
- `payRef`: Interswitch payment reference (bank details: `FBN|WEB|MX26070|...`)
- `resp`: Response code (`00` = success, `01` = pending, others = failed)
- `amount`: Original amount in kobo
- Other fields: `retRef`, `txnref`, `apprAmt`, `mac`, etc.

---

## Interswitch Response Codes

| Code | Meaning             |
| ---- | ------------------- |
| 00   | Approved ✅         |
| 01   | Pending             |
| 02   | Invalid Status      |
| 05   | Generic Decline     |
| 12   | Invalid Transaction |
| 13   | Invalid Amount      |
| 51   | Insufficient Funds  |

---

## Testing

1. Set `NEXT_PUBLIC_INTERSWITCH_MODE=TEST` in `.env.local`
2. Set `NEXT_PUBLIC_INTERSWITCH_CALLBACK_URL` (optional, defaults to app origin)
3. Use test card details from Interswitch documentation
4. Check browser console for payment URL logs
5. Verify backend receives `/verify-payment/` request and makes server-side call to Interswitch

---

## Common Issues

### Error: "We could not process your payment request"

- ❌ Transaction reference format invalid
- ❌ Amount not in kobo
- ❌ Merchant code mismatch
- ❌ Customer email missing

### Payment succeeds but wallet not credited

- ❌ `/verify-payment/` endpoint not implemented
- ❌ Server-side verification with Interswitch not done
- ❌ Wallet update query failed

### Payment window doesn't open

- ✅ Check browser console for errors
- ✅ Ensure pop-ups are not blocked
- ✅ Check that Interswitch payment URL is correctly generated
