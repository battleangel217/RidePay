import { ToastContainer } from "@/components/ui/Toast";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RidePay",
  description: "Campus Transport Payment Platform",
  icons: {
    icon: [
      {
        url: "/ridepay.png",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
