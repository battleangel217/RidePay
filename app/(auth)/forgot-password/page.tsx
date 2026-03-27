"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { resetPassword } from "@/lib/api/auth";
import { useUIStore } from "@/lib/store/uiStore";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const { addToast } = useUIStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      addToast("error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-success/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-success">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-app-primary mb-2">
            Check your inbox
          </h2>
          <p className="text-app-secondary text-sm mb-6">
            We sent a password reset link to <strong>{email}</strong>
          </p>
          <Link
            href="/login"
            className="text-sm font-medium text-success hover:text-success/80"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-success hover:text-success/80 mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
        <h1 className="text-2xl font-bold text-app-primary mb-2">
          Forgot password?
        </h1>
        <p className="text-app-secondary text-sm mb-8">
          Enter your email and we&apos;ll send a reset link.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Button type="submit" loading={loading} className="w-full mt-2">
            Send Reset Link
          </Button>
        </form>
      </div>
    </div>
  );
}
