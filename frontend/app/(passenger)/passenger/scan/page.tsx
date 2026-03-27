"use client";
import { RouteGuard } from "@/components/RouteGuard";
import { Button } from "@/components/ui/Button";
import { Keyboard, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ScanPage() {
  const router = useRouter();
  const scannerRef = useRef<{ clear: () => Promise<void> } | null>(null);
  const isCleaningRef = useRef(false);
  const [scannerStarted, setScannerStarted] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manualCode, setManualCode] = useState("");

  const clearScanner = async () => {
    if (isCleaningRef.current || !scannerRef.current) return;
    isCleaningRef.current = true;
    try {
      await scannerRef.current.clear();
    } catch (err) {
      // Silently ignore state transition errors
    } finally {
      scannerRef.current = null;
      isCleaningRef.current = false;
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      clearScanner();
    };
  }, []);

  useEffect(() => {
    if (manualMode) {
      clearScanner();
      return;
    }

    let stopped = false;

    const startScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode");
        if (stopped) return;

        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
          },
          false,
        );

        scanner.render(
          (decodedText: string) => {
            const code = decodedText.trim().toUpperCase();
            // Validate: expect 4-10 alphanumeric characters
            if (!/^[A-Z0-9]{4,10}$/.test(code)) return;

            // Stop scanner before navigating
            clearScanner();
            router.push(`/passenger/pay?code=${encodeURIComponent(code)}`);
          },
          () => {},
        );

        scannerRef.current = scanner;
        setScannerStarted(true);
      } catch {
        setCameraError("Camera not available. Please use manual entry.");
        setManualMode(true);
      }
    };

    startScanner();

    return () => {
      stopped = true;
      clearScanner();
    };
  }, [manualMode]);

  if (manualMode) {
    return (
      <RouteGuard allowedRoles={["passenger"]}>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <h2 className="text-xl font-bold mb-2">Enter Rider Code</h2>
            <p className="text-gray-500 text-sm mb-6">
              {cameraError ||
                "Type the 6-character code from the rider's card."}
            </p>
            <input
              autoFocus
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="ABC123"
              className="w-full text-center text-3xl font-mono tracking-[0.4em] border border-gray-200 rounded-2xl py-5 bg-gray-50 outline-none focus:border-gray-400 uppercase mb-6"
            />
            <Button
              className="w-full"
              disabled={manualCode.length < 6}
              onClick={() => router.push(`/passenger/pay?code=${manualCode}`)}
            >
              Pay Rider
            </Button>
            <button
              onClick={() => {
                setManualMode(false);
                setCameraError("");
              }}
              className="mt-4 w-full text-center text-sm text-success hover:text-success/80"
            >
              Try camera again
            </button>
          </div>
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={["passenger"]}>
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex items-center justify-between px-5 pt-14 pb-4">
          <Link href="/passenger/dashboard">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <X className="w-5 h-5 text-white" />
            </div>
          </Link>
          <p className="text-white font-semibold">Scan QR Code</p>
          <button
            onClick={() => setManualMode(true)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <Keyboard className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <p className="text-white/60 text-sm mb-6 text-center">
            Point at the rider&apos;s QR code
          </p>
          <div id="qr-reader" className="w-full max-w-xs" />
          {!scannerStarted && (
            <div className="mt-8 animate-pulse text-white/40 text-sm">
              Starting camera...
            </div>
          )}
        </div>

        <div className="px-6 pb-12">
          <button
            onClick={() => setManualMode(true)}
            className="w-full text-center text-white/60 text-sm py-4 hover:text-white transition-colors"
          >
            Enter code manually instead
          </button>
        </div>
      </div>
    </RouteGuard>
  );
}
