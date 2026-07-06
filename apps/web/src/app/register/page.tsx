"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { ErrorAlert, FieldError } from "@/components/ui";
import { ApiClientError } from "@/lib/api";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      await register(form);
      router.push("/tickets");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        if (err.details) setFieldErrors(err.details);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold">Register</h1>
      {error && <div className="mb-4"><ErrorAlert message={error} /></div>}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        {(["username", "email", "name", "password"] as const).map((field) => (
          <div key={field}>
            <label className="mb-1 block text-sm font-medium capitalize">
              {field}
            </label>
            <input
              type={field === "password" ? "password" : field === "email" ? "email" : "text"}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="w-full rounded-md border border-[var(--border)] px-3 py-2"
              required
            />
            <FieldError errors={fieldErrors[field]} />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[var(--primary)] py-2 text-white hover:bg-[var(--primary-hover)] disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--primary)] hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
