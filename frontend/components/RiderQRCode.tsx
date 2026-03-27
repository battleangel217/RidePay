"use client";
import { Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";

interface Props {
  shortCode: string;
  username?: string;
}

export function RiderQRCode({ shortCode, username }: Props) {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ridepay-qr-${shortCode}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        ref={qrRef}
        className="p-4 bg-background rounded-3xl shadow-sm border border-border"
      >
        <QRCodeSVG
          value={shortCode}
          size={220}
          level="M"
          includeMargin={false}
          bgColor="var(--background)"
          fgColor="var(--foreground)"
        />
      </div>
      <div className="text-center">
        {username && (
          <p className="text-sm text-black mb-1">{username}</p>
        )}
        <p className="text-2xl font-bold tracking-[0.3em] font-mono text-black">
          {shortCode}
        </p>
        <p className="text-xs text-black mt-1">
          Share this code or show QR to get paid
        </p>
      </div>
      <button
        onClick={downloadQR}
        className="inline-flex items-center gap-2 text-sm text-black hover:text-black transition-colors"
      >
        <Download className="w-4 h-4" />
        Download QR
      </button>
    </div>
  );
}
