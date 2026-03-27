"use client";
import { useEffect, useRef } from "react";

// NOTE: socket.io-client integration. Event names assumed — verify with backend.
export function useSocket(
  onPaymentReceived?: (data: unknown) => void,
  onPaymentSent?: (data: unknown) => void
) {
  const socketRef = useRef<import("socket.io-client").Socket | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) return;

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000";

    import("socket.io-client").then(({ io }) => {
      socketRef.current = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
      });

      const socket = socketRef.current;
      // NOTE: event names assumed. Verify with backend.
      if (onPaymentReceived) socket.on("payment_received", onPaymentReceived);
      if (onPaymentSent) socket.on("payment_sent", onPaymentSent);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [onPaymentReceived, onPaymentSent]);

  return socketRef;
}
