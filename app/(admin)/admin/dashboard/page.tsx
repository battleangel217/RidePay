"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { useUIStore } from "@/lib/store/uiStore";
import client from "@/lib/api/client";
import { approveRider, setFare } from "@/lib/api/admin";
import { getFare } from "@/lib/api/transactions";
import { RouteGuard } from "@/components/RouteGuard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { User } from "@/lib/types";
import { CheckCircle, XCircle, Users, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

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

  const handleApprove = async (riderId: string, action: "approve" | "suspend") => {
    try {
      await approveRider(riderId, action);
      addToast("success", `Rider ${action === "approve" ? "approved" : "suspended"}.`);
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
      <div className="min-h-screen bg-gray-50 pb-16">
        <div className="bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
          <button onClick={() => { logoutFn(); router.replace("/login"); }} className="text-sm text-red-600 font-medium">
            Sign Out
          </button>
        </div>

        <div className="px-5 py-6 space-y-6">
          {/* Fare Management */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold">Fare Management</h2>
            </div>
            {currentFare !== null && (
              <p className="text-sm text-gray-500 mb-3">Current fare: <strong>₦{currentFare.toLocaleString()}</strong></p>
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
              <Button type="submit" loading={settingFare} disabled={!newFare}>Set</Button>
            </form>
          </Card>

          {/* Riders Management */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold">Riders ({riders.length})</h2>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : riders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No riders registered yet.</p>
            ) : (
              <div className="space-y-2">
                {riders.map((rider) => (
                  <div key={rider.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{rider.username}</p>
                      <p className="text-xs text-gray-400">{rider.email}</p>
                      <p className="text-xs text-gray-400">Plate: {rider.plate_number || "—"}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${rider.is_approved_rider ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {rider.is_approved_rider ? "Approved" : "Pending"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {!rider.is_approved_rider ? (
                        <button
                          onClick={() => handleApprove(rider.id, "approve")}
                          className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-xl font-medium hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprove(rider.id, "suspend")}
                          className="flex items-center gap-1 text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-xl font-medium hover:bg-red-100 transition-colors"
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
