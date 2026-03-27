"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

interface Props {
  allowedRoles?: string[];
  children: React.ReactNode;
}

export function RouteGuard({ allowedRoles, children }: Props) {
  const { user, rehydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    rehydrate();
  }, [rehydrate]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      const redirect = user.role === "passenger" ? "/passenger/dashboard" : "/rider/dashboard";
      router.replace(redirect);
    }
  }, [user, allowedRoles, router]);

  return <>{children}</>;
}
