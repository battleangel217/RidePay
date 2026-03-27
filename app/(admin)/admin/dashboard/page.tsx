"use client";
import { RouteGuard } from "@/components/RouteGuard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { approveRider, setFare } from "@/lib/api/admin";
import client from "@/lib/api/client";
import { getFare } from "@/lib/api/transactions";
import { useAuthStore } from "@/lib/store/authStore";
import { useUIStore } from "@/lib/store/uiStore";
import type { User } from "@/lib/types";
import { CheckCircle, Settings, Users, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function AdminDashboard() {
  const { user, logout: logoutFn } = useAuthStore();
  const { addToast } = useUIStore();
  const router = useRouter();
  const [riders, setRiders] = useState<User[]>([]);
  const [currentFare, setCurrentFare] = useState<number | null>(null);
  const [newFare, setNewFare] = useState("");
  const [loading, setLoading] = useState(true);
  const [settingFare, setSettingFare] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, fareRes] = await Promise.all([
        client.get<User[]>("/api/auth/users/"),
        getFare(),
      ]);
      setRiders(usersRes.data.filter((u) => u.role === "driver"));
      setCurrentFare(fareRes.data.fare);
    } catch {
      addToast("error", "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (
    riderId: string,
    action: "approve" | "suspend",
  ) => {
    try {
      await approveRider(riderId, action);
      addToast(
        "success",
        `Rider ${action === "approve" ? "approved" : "suspended"}.`,
      );
      fetchData();
    } catch {
      addToast("error", "Action failed.");
    }
  };

  const handleSetFare = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingFare(true);
    try {
      await setFare(parseInt(newFare));
      setCurrentFare(parseInt(newFare));
      setNewFare("");
      addToast("success", "Fare updated.");
    } catch {
      addToast("error", "Failed to update fare.");
    } finally {
      setSettingFare(false);
    }
  };

  return (
    <RouteGuard>
      <div className="min-h-screen bg-background pb-16">
        <div className="bg-background-secondary border-b border-border px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-app-primary">
              Admin Dashboard
            </h1>
            <p className="text-xs text-app-tertiary">{user?.email}</p>
          </div>
          <button
            onClick={() => {
              logoutFn();
              router.replace("/login");
            }}
            className="text-sm text-error font-medium"
          >
            Sign Out
          </button>
        </div>

        <div className="px-5 py-6 space-y-6">
          {/* Fare Management */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-app-tertiary" />
              <h2 className="font-semibold text-app-primary">
                Fare Management
              </h2>
            </div>
            {currentFare !== null && (
              <p className="text-sm text-app-secondary mb-3">
                Current fare: <strong>₦{currentFare.toLocaleString()}</strong>
              </p>
            )}
            <form onSubmit={handleSetFare} className="flex gap-3">
              <Input
                placeholder="New fare amount"
                type="number"
                min="0"
                value={newFare}
                onChange={(e) => setNewFare(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" loading={settingFare} disabled={!newFare}>
                Set
              </Button>
            </form>
          </Card>

          {/* Riders Management */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-app-tertiary" />
              <h2 className="font-semibold text-app-primary">
                Riders ({riders.length})
              </h2>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-background-secondary rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : riders.length === 0 ? (
              <p className="text-sm text-app-tertiary text-center py-6">
                No riders registered yet.
              </p>
            ) : (
              <div className="space-y-2">
                {riders.map((rider) => (
                  <div
                    key={rider.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-app-primary">
                        {rider.username}
                      </p>
                      <p className="text-xs text-app-tertiary">{rider.email}</p>
                      <p className="text-xs text-app-tertiary">
                        Plate: {rider.plate_number || "—"}
                      </p>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${rider.is_approved_rider ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}
                      >
                        {rider.is_approved_rider ? "Approved" : "Pending"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {!rider.is_approved_rider ? (
                        <button
                          onClick={() => handleApprove(rider.id, "approve")}
                          className="flex items-center gap-1 text-xs bg-success/20 text-success px-3 py-1.5 rounded-xl font-medium hover:bg-success/30 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprove(rider.id, "suspend")}
                          className="flex items-center gap-1 text-xs bg-error/20 text-error px-3 py-1.5 rounded-xl font-medium hover:bg-error/30 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Suspend
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </RouteGuard>
  );
}
