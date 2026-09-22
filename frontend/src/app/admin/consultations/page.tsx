"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Consultation, PaginatedResult } from "@/lib/types";
import { AdminGuard } from "@/components/admin-guard";
import { Card } from "@/components/ui";

export default function AdminConsultationsPage() {
  const { token } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api
      .get<PaginatedResult<Consultation>>("/admin/consultations?pageSize=50", token)
      .then((res) => setConsultations(res.items))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <AdminGuard>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Consultations</h1>
          <Link href="/admin" className="text-lg text-accent hover:underline">
            ← Dashboard
          </Link>
        </div>

        {loading ? (
          <p className="text-lg text-muted">Loading…</p>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-lg text-left">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="py-2 pr-4">Astrologer</th>
                    <th className="py-2 pr-4">Client</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {consultations.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4">{c.astrologer?.displayName}</td>
                      <td className="py-3 pr-4">{c.user?.email ?? c.user?.phone}</td>
                      <td className="py-3 pr-4">{c.type}</td>
                      <td className="py-3 pr-4">{c.status}</td>
                      <td className="py-3 pr-4">{c.amountCharged ? `₹${Number(c.amountCharged).toFixed(2)}` : c.isFreeSession ? "Free" : "—"}</td>
                      <td className="py-3 pr-4 text-muted">{new Date(c.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AdminGuard>
  );
}
