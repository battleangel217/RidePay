"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api/auth";
import { useUIStore } from "@/lib/store/uiStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [role, setRole] = useState<"passenger" | "driver">("passenger");
  const [form, setForm] = useState({ email: "", username: "", password: "", plate_number: "" });
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        email: form.email,
        username: form.username,
        password: form.password,
        role,
        ...(role === "driver" && form.plate_number ? { plate_number: form.plate_number } : {}),
      });
      addToast("success", "Account created! Check your email to activate.");
      router.push(`/activate?email=${encodeURIComponent(form.email)}`);
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
      const message = errData
        ? Object.values(errData).flat().join(" ")
        : "Registration failed. Please try again.";
      addToast("error", String(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-2 text-sm">Join RidePay</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
          {(["passenger", "driver"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                role === r ? "bg-white shadow-sm text-black" : "text-gray-500"
              }`}
            >
              {r === "driver" ? "Rider" : r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" required />
          <Input label="Username" value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="johndoe" required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" required />
          {role === "driver" && (
            <Input label="Plate Number" value={form.plate_number} onChange={(e) => set("plate_number", e.target.value)} placeholder="e.g. ABC-123-XY" />
          )}
          <Button type="submit" loading={loading} className="w-full mt-2">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-black hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
