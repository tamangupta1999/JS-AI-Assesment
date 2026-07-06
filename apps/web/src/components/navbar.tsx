"use client";

import Link from "next/link";
import { useAuth } from "./auth-provider";

export function Navbar() {
  const { user, loading, logout } = useAuth();

  if (loading) return null;

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/tickets" className="text-lg font-semibold text-[var(--primary)]">
          Support Tickets
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/tickets/new" className="text-sm hover:text-[var(--primary)]">
                New Ticket
              </Link>
              {user.role === "admin" && (
                <Link href="/admin/users" className="text-sm hover:text-[var(--primary)]">
                  Users
                </Link>
              )}
              <span className="text-sm text-slate-600">
                {user.name} ({user.role})
              </span>
              <button
                onClick={() => logout()}
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-slate-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm hover:text-[var(--primary)]">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm text-white hover:bg-[var(--primary-hover)]"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
