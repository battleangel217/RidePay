"use client";
import { RiderQRCode } from "@/components/RiderQRCode";
import { RouteGuard } from "@/components/RouteGuard";
import { BottomNav } from "@/components/ui/BottomNav";
import { Button } from "@/components/ui/Button";
import { SidebarNav } from "@/components/ui/SidebarNav";
import { updatePlateNumber } from "@/lib/api/admin";
import { getMe } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/authStore";
import { useUIStore } from "@/lib/store/uiStore";
import { AlertTriangle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RiderProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const { addToast } = useUIStore();
  const router = useRouter();
  const [editingPlate, setEditingPlate] = useState(false);
  const [plate, setPlate] = useState(user?.plate_number || "");
  const [saving, setSaving] = useState(false);

  const handleSavePlate = async () => {
    setSaving(true);
    try {
      await updatePlateNumber(plate);
      const { data: me } = await getMe();
      setUser(me);
      setEditingPlate(false);
      addToast("success", "Plate number updated.");
    } catch {
      addToast("error", "Failed to update plate number.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <RouteGuard allowedRoles={["driver"]}>
      <SidebarNav />
      <div className="min-h-screen md:ml-64 md:max-w-4xl md:mx-auto pb-24 md:pb-12 px-5 md:px-8">
        <div className="pt-14 pb-6 md:pt-8">
          <h1 className="text-xl font-bold md:text-2xl">My Profile</h1>
        </div>

        {/* Approval status */}
        {user && !user.is_approved_rider && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              Your account is pending admin approval.
            </p>
          </div>
        )}

        {/* QR Code section */}
        {user?.short_code ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6 md:max-w-lg">
            <h2 className="text-base font-semibold mb-6 text-center text-app-primary">
              Your Payment QR
            </h2>
            <RiderQRCode shortCode={user.short_code} username={user.username} />
          </div>
        ) : (
          <div className="bg-background-secondary rounded-3xl border border-border p-6 mb-6 text-center md:max-w-lg">
            <p className="text-app-secondary text-sm">
              QR code will appear once your account is approved.
            </p>
          </div>
        )}

        {/* User info */}
        <div className="bg-background-secondary rounded-3xl border border-border p-5 mb-4 space-y-3 md:max-w-lg">
          <div>
            <p className="text-xs text-app-tertiary uppercase tracking-wide">
              Username
            </p>
            <p className="text-sm font-medium mt-0.5 text-app-primary">
              {user?.username}
            </p>
          </div>
          <div>
            <p className="text-xs text-app-tertiary uppercase tracking-wide">
              Email
            </p>
            <p className="text-sm font-medium mt-0.5 text-app-primary">
              {user?.email}
            </p>
          </div>
          <div>
            <p className="text-xs text-app-tertiary uppercase tracking-wide">
              Plate Number
            </p>
            {editingPlate ? (
              <div className="flex gap-2 mt-1">
                <input
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-input-focus bg-background text-app-primary placeholder:text-app-tertiary"
                  placeholder="e.g. ABC-123-XY"
                />
                <button
                  onClick={handleSavePlate}
                  disabled={saving}
                  className="text-sm font-semibold text-app-primary disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditingPlate(false)}
                  className="text-sm text-app-tertiary"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-sm font-medium text-app-primary">
                  {user?.plate_number || "—"}
                </p>
                <button
                  onClick={() => setEditingPlate(true)}
                  className="text-xs text-app-tertiary hover:text-app-primary"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        <Button
          variant="danger"
          onClick={handleLogout}
          className="w-full md:max-w-lg"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
      <BottomNav />
    </RouteGuard>
  );
}
