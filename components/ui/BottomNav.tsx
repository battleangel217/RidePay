"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, QrCode, Wallet, User } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const isPassenger = user?.role === "passenger";
  const isDriver = user?.role === "driver";

  const passengerLinks = [
    { href: "/passenger/dashboard", icon: Home, label: "Home" },
    { href: "/passenger/scan", icon: QrCode, label: "Scan" },
    { href: "/passenger/fund", icon: Wallet, label: "Fund" },
    { href: "/passenger/profile", icon: User, label: "Profile" },
  ];

  const driverLinks = [
    { href: "/rider/dashboard", icon: Home, label: "Home" },
    { href: "/rider/profile", icon: QrCode, label: "My QR" },
    { href: "/rider/cashout", icon: Wallet, label: "Cash Out" },
    { href: "/rider/profile", icon: User, label: "Profile" },
  ];

  const links = isPassenger ? passengerLinks : isDriver ? driverLinks : [];
  if (!links.length) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-16 px-2 z-40 safe-area-bottom">
      {links.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={`${href}-${label}`}
            href={href}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${active ? "text-black" : "text-gray-400"}`}
          >
            <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
