import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "RidePay",
  description: "Campus Transport Payment Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-gray-50 min-h-screen">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
