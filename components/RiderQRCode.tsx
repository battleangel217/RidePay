"use client";
import { QRCodeSVG } from "qrcode.react";
import { Download } from "lucide-react";
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
      <div ref={qrRef} className="p-4 bg-white rounded-3xl shadow-sm border border-gray-100">
        <QRCodeSVG
          value={shortCode}
          size={220}
          level="M"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>
      <div className="text-center">
        {username && <p className="text-sm text-gray-500 mb-1">{username}</p>}
        <p className="text-2xl font-bold tracking-[0.3em] font-mono text-gray-900">{shortCode}</p>
        <p className="text-xs text-gray-400 mt-1">Share this code or show QR to get paid</p>
      </div>
      <button
        onClick={downloadQR}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
      >
        <Download className="w-4 h-4" />
        Download QR
      </button>
    </div>
  );
}
