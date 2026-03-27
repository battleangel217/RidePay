# WebSocket Debugging Guide

The frontend attempts to connect to a Django Channels WebSocket endpoint at `/ws/notifications/`. Real-time payment notifications are optional - the app works fine without them.

## Quick Status Check

Open browser DevTools (F12) → Console tab and look for these messages:

| Message                           | Status          | Action                                       |
| --------------------------------- | --------------- | -------------------------------------------- |
| `✅ WebSocket connected`          | ✅ Working      | Real-time notifications enabled              |
| `❌ WebSocket error on attempt 1` | ⚠️ Backend down | App still works, notifications delayed       |
| `⚠️ WebSocket connection failed`  | ⚠️ Disabled     | Backend WebSocket not available (check docs) |

**The app is fully functional even if WebSocket is not connected.** Real-time notifications simply won't appear until backend is configured.

## 1. What's Expected in Console Logs

When the app loads:

```
[WebSocket Attempt 1/3] Connecting to: wss://ridepay.onrender.com/ws/notifications/?token=...
✅ WebSocket connected
```

If backend is down:

```
[WebSocket Attempt 1/3] Connecting to: wss://ridepay.onrender.com/ws/notifications/?token=...
❌ WebSocket error on attempt 1. Backend may not be running.
⏳ Reconnecting in 1000ms...
[WebSocket Attempt 2/3] Connecting to: wss://ridepay.onrender.com/ws/notifications/?token=...
❌ WebSocket error on attempt 2. Backend may not be running.
⏳ Reconnecting in 2000ms...
[WebSocket Attempt 3/3] Connecting to: wss://ridepay.onrender.com/ws/notifications/?token=...
❌ WebSocket error on attempt 3. Backend may not be running.
⚠️ WebSocket connection failed. Real-time notifications unavailable.
```

This is **normal** if your backend doesn't have WebSocket configured yet.

## 2. Verify Backend is Running

If you want to enable real-time notifications, set up Django Channels on your backend:

```bash
# Your Django backend needs:
pip install channels channels-redis  # or just channels if not using Redis
# Configure ASGI in Django settings
# Create ws routing consumer at /ws/notifications/
```

Then test if the endpoint exists:

```bash
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  "ws://localhost:8000/ws/notifications/?token=your_token_here"
```

## 3. Check Environment Variable

Ensure `NEXT_PUBLIC_SOCKET_URL` is set correctly in `.env.local`:

```bash
# Local development
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000

# Production (automatic WS/WSS conversion)
NEXT_PUBLIC_SOCKET_URL=https://ridepay.onrender.com
```

Frontend automatically converts:

- `http://localhost:8000` → `ws://localhost:8000/ws/notifications/?token=...`
- `https://ridepay.onrender.com` → `wss://ridepay.onrender.com/ws/notifications/?token=...`

## 4. Backend Django Channels Setup (Optional)

If implementing real-time notifications, your backend needs:

```python
# asgi.py
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

application = ProtocolTypeRouter({
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path("ws/notifications/", NotificationConsumer.as_asgi()),
        ])
    ),
})
```

The WebSocket consumer should:

1. **Accept token from query string**: `?token=<access_token>`
2. **Validate JWT token** and reject if invalid (close with code 1008)
3. **Send JSON messages** to connected clients:
   ```json
   {
     "type": "payment_notification",
     "message": "Payment received",
     "amount": 500,
     "id": "12345",
     "description": "Ride payment",
     "created_at": "2026-03-27T19:35:38Z"
   }
   ```

## 5. Close Code Reference

If WebSocket closes, check the console for the close code:

| Code | Reason          | What to Check                                         |
| ---- | --------------- | ----------------------------------------------------- |
| 1000 | Normal          | Expected on page unload                               |
| 1006 | Connection lost | Network issue or backend crashed                      |
| 1008 | Invalid token   | JWT token invalid or expired - user needs to re-login |
| 1011 | Server error    | Backend error - check backend logs                    |

## 6. Current Status

✅ **Frontend is fully implemented and ready for real-time notifications**

- Automatically converts HTTP → WS
- Handles token authentication via query string
- Automatically reconnects with exponential backoff
- Gracefully degrades if backend unavailable
- App works fine without real-time notifications

⏳ **Waiting for**: Django Channels WebSocket endpoint on backend

## 7. What Happens Without WebSocket?

If backend doesn't have WebSocket configured:

1. ✅ Users can still make payments
2. ✅ Transaction history loads normally
3. ✅ Wallet balance updates on page refresh
4. ❌ Real-time payment notifications don't appear (rider must refresh to see payment)

This is acceptable for MVP - implement WebSocket later when backend is ready.

## 8. Testing WebSocket Manually

Once your Django backend has the WebSocket endpoint:

```javascript
// Open browser console and run:
const token = localStorage.getItem("access_token");
const ws = new WebSocket(
  `wss://ridepay.onrender.com/ws/notifications/?token=${token}`,
);

ws.onopen = () => {
  console.log("✅ WebSocket connected!");
  // Try sending a test payment notification from your backend
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("📨 Received:", data);
};

ws.onerror = () => console.error("Connection error");
ws.onclose = (e) => console.log("Closed:", e.code);
```

## 9. Troubleshooting Checklist

1. **Accept token in query string** (not in headers):

   ```python
   # Good: ?token=<access_token>
   # Not: Authorization: Bearer <token>
   ```

2. **Validate JWT token** and close connection if invalid (returns code 1008)

3. **Send JSON messages** with structure:

   ```json
   {
     "type": "payment_notification",
     "message": "Payment received",
     "amount": 500,
     "id": "12345",
     "description": "Ride payment",
     "created_at": "2026-03-27T19:35:38Z"
   }
   ```

4. **Be accessible** at one of these endpoints:
   - `/ws/notifications/`
   - `/ws/`
   - `/ws/payments/`

## 5. Common Issues & Solutions

## 9. Troubleshooting Checklist

- [ ] Is `NEXT_PUBLIC_SOCKET_URL` set in `.env.local`?
- [ ] Does the backend have Django Channels configured?
- [ ] Check browser console for connect attempt logs
- [ ] If error, check the close code (1006, 1008, 1011)
- [ ] Try manual WebSocket connection in console (see section 8)
- [ ] Check backend logs for errors

---

**Note**: The app functions fully without real-time WebSocket notifications. Implement this feature once your backend Django Channels consumer is ready.
