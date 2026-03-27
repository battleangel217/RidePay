"use client";
import { RouteGuard } from "@/components/RouteGuard";
import { BottomNav } from "@/components/ui/BottomNav";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store/authStore";
import { useUIStore } from "@/lib/store/uiStore";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PassengerProfile() {
  const { user, logout } = useAuthStore();
  const { addToast } = useUIStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    addToast("info", "Signed out.");
    router.replace("/login");
  };

  return (
    <RouteGuard allowedRoles={["passenger"]}>
      <div className="min-h-screen pb-24 px-5">
        <div className="pt-14 pb-6">
          <h1 className="text-xl font-bold text-app-primary\">Profile</h1>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-background-secondary rounded-full flex items-center justify-center mb-3">
            <User className="w-8 h-8 text-app-tertiary\" />
          </div>
          <p className="font-semibold text-xl text-app-primary\">
            {user?.username}
          </p>
          <p className="text-app-secondary text-sm\">{user?.email}</p>
          <span className="mt-2 inline-block bg-background-secondary text-app-secondary text-xs font-medium px-3 py-1 rounded-full capitalize\">
            {user?.role}
          </span>
        </div>

        <div className="mt-8">
          <Button variant="danger" onClick={handleLogout} className="w-full">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
      <BottomNav />
    </RouteGuard>
  );
}
