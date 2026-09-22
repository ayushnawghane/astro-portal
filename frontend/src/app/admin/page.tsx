"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { RevenueDashboard } from "@/lib/types";
import { AdminGuard } from "@/components/admin-guard";
import { Card } from "@/components/ui";

const LINKS = [
  { href: "/admin/users", label: "Manage users" },
  { href: "/admin/astrologers", label: "Manage astrologers" },
  { href: "/admin/consultations", label: "View consultations" },
  { href: "/admin/wallet", label: "View wallet transactions" },
  { href: "/admin/horoscopes", label: "Manage horoscopes" },
  { href: "/admin/panchang", label: "Manage panchang" },
  { href: "/admin/muhurat", label: "Manage shubh muhurat" },
  { href: "/admin/content", label: "Manage blog & education content" },
];

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<RevenueDashboard | null>(null);

  useEffect(() => {
    if (!token) return;
    api.get<RevenueDashboard>("/admin/revenue", token).then(setStats);
  }, [token]);

  return (
    <AdminGuard>
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Stat label="Total users" value={stats?.totalUsers} />
          <Stat label="Approved astrologers" value={stats?.approvedAstrologers} />
          <Stat label="Completed consultations" value={stats?.completedConsultations} />
          <Stat label="Consultation revenue" value={stats ? `₹${Number(stats.totalConsultationRevenue).toFixed(2)}` : undefined} />
          <Stat label="Wallet recharges" value={stats ? `₹${Number(stats.totalWalletRecharges).toFixed(2)}` : undefined} />
        </div>

        <div className="flex gap-4 flex-wrap">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg border border-border px-5 py-3 text-lg font-medium hover:bg-zinc-100">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </AdminGuard>
  );
}

function Stat({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <Card>
      <p className="text-base text-muted">{label}</p>
      <p className="text-3xl font-semibold">{value ?? "…"}</p>
    </Card>
  );
}
