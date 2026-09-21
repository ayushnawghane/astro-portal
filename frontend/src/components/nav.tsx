"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function Nav() {
  const { user, logout, loading } = useAuth();

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="text-2xl font-semibold text-accent tracking-tight">
          Astro Portal
        </Link>

        <nav className="flex items-center gap-6 text-lg">
          <Link href="/profiles" className="hover:text-accent underline-offset-4 hover:underline">
            My Profiles
          </Link>

          {loading ? null : user ? (
            <div className="flex items-center gap-4">
              <span className="text-muted">{user.email ?? user.phone}</span>
              <button
                onClick={logout}
                className="rounded-lg border border-border px-4 py-2 text-base font-medium hover:bg-zinc-100 transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-lg border border-border px-4 py-2 text-base font-medium hover:bg-zinc-100 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-accent px-4 py-2 text-base font-medium text-white hover:bg-accent-hover transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
