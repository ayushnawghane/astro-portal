"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, ApiError } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Astrologer, PaginatedResult } from "@/lib/types";
import { AdminGuard } from "@/components/admin-guard";
import { Button, Card, ErrorText } from "@/components/ui";

export default function AdminAstrologersPage() {
  const { token } = useAuth();
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState("");

  function refresh() {
    if (!token) return;
    api
      .get<PaginatedResult<Astrologer>>("/admin/astrologers?pageSize=50", token)
      .then((res) => setAstrologers(res.items))
      .finally(() => setLoadingList(false));
  }

  useEffect(refresh, [token]);

  async function handleApprove(id: string) {
    setError("");
    try {
      await api.patch(`/astrologers/${id}/approve`, undefined, token);
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not approve this astrologer.");
    }
  }

  return (
    <AdminGuard>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Astrologers</h1>
          <Link href="/admin" className="text-lg text-accent hover:underline">
            ← Dashboard
          </Link>
        </div>

        <ErrorText>{error}</ErrorText>

        {loadingList ? (
          <p className="text-lg text-muted">Loading…</p>
        ) : astrologers.length === 0 ? (
          <Card>
            <p className="text-lg text-muted">No astrologer applications yet.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {astrologers.map((a) => (
              <Card key={a.id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold">{a.displayName}</p>
                  <p className="text-base text-muted">
                    {a.experienceYears} years · {a.expertise.join(", ")}
                  </p>
                </div>
                {a.isApproved ? (
                  <span className="rounded-full bg-green-100 text-green-700 px-4 py-2 text-base font-semibold">Approved</span>
                ) : (
                  <Button onClick={() => handleApprove(a.id)}>Approve</Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
