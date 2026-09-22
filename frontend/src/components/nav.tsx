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

        {loading ? null : user ? (
          <div className="flex items-center gap-4">
            <span className="text-muted text-lg">{user.email ?? user.phone}</span>
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
      </div>

      <nav className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-lg">
          <NavLink href="/horoscope">Horoscope</NavLink>
          <NavLink href="/panchang">Panchang</NavLink>
          <NavLink href="/muhurat">Shubh Muhurat</NavLink>
          <NavLink href="/astrologers">Astrologers</NavLink>
          <NavLink href="/tools">Tools</NavLink>
          <NavLink href="/blog">Blog</NavLink>
          <NavLink href="/education">Learn</NavLink>
          {user && (
            <>
              <NavLink href="/profiles">My Profiles</NavLink>
              <NavLink href="/matchmaking">Matchmaking</NavLink>
              <NavLink href="/consultations">My Consultations</NavLink>
              <NavLink href="/wallet">Wallet</NavLink>
              <NavLink href="/astrologer/dashboard">Astrologer Dashboard</NavLink>
              {user.role === "ADMIN" && <NavLink href="/admin">Admin</NavLink>}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-foreground hover:text-accent underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}
