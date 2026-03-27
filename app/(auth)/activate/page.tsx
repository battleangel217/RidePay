"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { activate, resendActivation } from "@/lib/api/auth";
import { useUIStore } from "@/lib/store/uiStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail } from "lucide-react";

function ActivateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useUIStore();
  const [uid, setUid] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const email = searchParams.get("email") || "";

  // Auto-fill from URL if present (e.g. activation link from email)
  useEffect(() => {
    const urlUid = searchParams.get("uid");
    const urlToken = searchParams.get("token");
    if (urlUid) setUid(urlUid);
    if (urlToken) setToken(urlToken);
  }, [searchParams]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await activate(uid, token);
      addToast("success", "Account activated! You can now log in.");
      router.push("/login");
    } catch {
      addToast("error", "Invalid or expired activation link.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await resendActivation(email);
      addToast("success", "Activation email resent.");
    } catch {
      addToast("error", "Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          {email && <p className="text-gray-500 mt-2 text-sm">We sent an activation link to <strong>{email}</strong></p>}
        </div>

        <form onSubmit={handleActivate} className="flex flex-col gap-4">
          <Input label="User ID (uid)" value={uid} onChange={(e) => setUid(e.target.value)} placeholder="Paste uid from email link" required />
          <Input label="Token" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste token from email link" required />
          <Button type="submit" loading={loading} className="w-full mt-2">Activate Account</Button>
        </form>

        {email && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Didn&apos;t get the email?{" "}
            <button onClick={handleResend} disabled={resending} className="font-medium text-black hover:underline disabled:opacity-50">
              {resending ? "Sending..." : "Resend"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense>
      <ActivateContent />
    </Suspense>
  );
}
