"use client";
import { useEffect, useRef } from "react";

export interface PaymentNotificationPayload {
  type: "payment_notification";
  message: string;
  amount: number;
  id: string;
  description?: string;
  created_at: string;
}

export function useSocket(
  onPaymentNotification?: (data: PaymentNotificationPayload) => void,
) {
  const wsRef = useRef<WebSocket | null>(null);
  const callbackRef = useRef(onPaymentNotification);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttemptsRef = useRef(3); // Reduced from 5 to fail faster

  // Update callback ref when callback changes, without triggering effect
  useEffect(() => {
    callbackRef.current = onPaymentNotification;
  }, [onPaymentNotification]);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    if (!token) {
      console.debug("WebSocket: No auth token found - skipping connection");
      return;
    }

    let isMounted = true;

    const connectWebSocket = () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_SOCKET_URL || "https://ridepay.onrender.com";

        // Convert HTTP/HTTPS to WS/WSS
        const wsUrl = baseUrl
          .replace(/^https:/, "wss:")
          .replace(/^http:/, "ws:");

        // Build WebSocket URL with token
        const wsUrlWithAuth = `${wsUrl}/ws/notifications/?token=${encodeURIComponent(token)}`;

        reconnectAttemptsRef.current += 1;
        console.debug(
          `[WebSocket Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttemptsRef.current}] Connecting to:`,
          wsUrlWithAuth,
        );

        wsRef.current = new WebSocket(wsUrlWithAuth);

        // Set a timeout to detect connection failures
        const connectionTimeoutId = setTimeout(() => {
          if (
            wsRef.current &&
            wsRef.current.readyState === WebSocket.CONNECTING
          ) {
            console.warn("WebSocket connection timeout - closing");
            wsRef.current?.close();
          }
        }, 5000);

        wsRef.current.onopen = () => {
          clearTimeout(connectionTimeoutId);
          if (!isMounted) return;
          console.log("✅ WebSocket connected");
          reconnectAttemptsRef.current = 0;
        };

        wsRef.current.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            console.debug("📨 Payment notification:", data);

            // Handle payment notifications
            if (data.type === "payment_notification" && callbackRef.current) {
              callbackRef.current(data as PaymentNotificationPayload);
            }
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        wsRef.current.onerror = () => {
          clearTimeout(connectionTimeoutId);
          console.warn(
            `❌ WebSocket error on attempt ${reconnectAttemptsRef.current}. Backend may not be running.`,
          );
        };

        wsRef.current.onclose = (event: CloseEvent) => {
          clearTimeout(connectionTimeoutId);
          if (!isMounted) return;

          const closeReasons: Record<number, string> = {
            1000: "Normal closure",
            1001: "Going away",
            1002: "Protocol error",
            1003: "Unsupported data",
            1006: "Connection lost (network error)",
            1008: "Invalid token",
            1011: "Server error",
          };

          const reason =
            closeReasons[event.code] || `Unknown (code ${event.code})`;
          console.log(`🔌 WebSocket closed: ${reason}`);

          // Attempt to reconnect with exponential backoff
          if (reconnectAttemptsRef.current < maxReconnectAttemptsRef.current) {
            const delay = Math.min(
              1000 * Math.pow(2, reconnectAttemptsRef.current - 1),
              5000,
            );
            console.debug(`⏳ Reconnecting in ${delay}ms...`);
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isMounted) {
                connectWebSocket();
              }
            }, delay);
          } else {
            console.warn(
              "⚠️ WebSocket connection failed. Real-time notifications unavailable. Check backend status.",
            );
          }
        };
      } catch (error) {
        console.error("WebSocket initialization error:", error);
      }
    };

    connectWebSocket();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []); // Empty dependency array - connect only once on mount

  return wsRef;
}
