"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

export default function RootPage() {
  const router = useRouter();
  const { rehydrate, user } = useAuthStore();

  useEffect(() => {
    rehydrate();
  }, [rehydrate]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      router.replace("/login");
    } else if (user) {
      if (user.role === "passenger") router.replace("/passenger/dashboard");
      else if (user.role === "driver") router.replace("/rider/dashboard");
      else router.replace("/login");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-black" />
    </div>
  );
}
