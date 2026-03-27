"use client";
import { useAuthStore } from "@/lib/store/authStore";
import { Home, LogOut, User, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const isPassenger = user?.role === "passenger";
  const isDriver = user?.role === "driver";

  const passengerLinks = [
    { href: "/passenger/dashboard", icon: Home, label: "Home" },
    { href: "/passenger/fund", icon: Wallet, label: "Fund Wallet" },
    { href: "/passenger/profile", icon: User, label: "Profile" },
  ];

  const driverLinks = [
    { href: "/rider/dashboard", icon: Home, label: "Home" },
    { href: "/rider/cashout", icon: Wallet, label: "Cash Out" },
    { href: "/rider/profile", icon: User, label: "Profile" },
  ];

  const links = isPassenger ? passengerLinks : isDriver ? driverLinks : [];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!links.length) return null;

  return (
    <aside
      className="hidden md:flex md:flex-col fixed left-0 top-0 h-screen w-64 bg-background border-r border-border px-6 py-8 z-50"
      style={{ color: "white" }}
    >
      {/* Logo/Brand */}
      <div className="mb-12">
        <h1 className="text-2xl font-bold" style={{ color: "white" }}>
          RidePay
        </h1>
        <p className="text-xs mt-1" style={{ color: "white" }}>
          {isPassenger ? "Passenger" : "Rider"}
        </p>
      </div>

      {/* User Info */}
      <div className="mb-8 pb-8 border-b border-border">
        <p
          className="text-xs uppercase tracking-wider"
          style={{ color: "white" }}
        >
          Logged in as
        </p>
        <p className="text-base font-semibold mt-2" style={{ color: "white" }}>
          {user?.username || "User"}
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href);
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? "bg-primary font-medium"
                  : "hover:bg-background-secondary"
              }`}
              style={{ color: "white" }}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-background-secondary transition-colors border-t border-border mt-8 pt-8"
        style={{ color: "white" }}
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </aside>
  );
}
