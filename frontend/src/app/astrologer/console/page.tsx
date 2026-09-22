"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Consultation } from "@/lib/types";
import { Card } from "@/components/ui";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "New request",
  ACTIVE: "Live now",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-gold",
  ACTIVE: "text-green-700",
  COMPLETED: "text-muted",
  CANCELLED: "text-muted",
};

export default function AstrologerConsolePage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!token) return;
    api
      .get<Consultation[]>("/consultations/astrologer/me", token)
      .then(setConsultations)
      .catch(() => setError("You need an approved astrologer profile to view this page."))
      .finally(() => setLoadingList(false));
  }, [token]);

  if (loading || !user) return null;

  const pending = consultations.filter((c) => c.status === "PENDING");
  const active = consultations.filter((c) => c.status === "ACTIVE");
  const history = consultations.filter((c) => c.status === "COMPLETED" || c.status === "CANCELLED");

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Consultation Console</h1>
        <Link href="/astrologer/dashboard" className="text-lg text-accent hover:underline">
          ← Dashboard
        </Link>
      </div>

      {error ? (
        <Card>
          <p className="text-lg text-muted">{error}</p>
        </Card>
      ) : loadingList ? (
        <p className="text-lg text-muted">Loading…</p>
      ) : (
        <>
          <Section title="New requests" items={pending} empty="No pending requests." />
          <Section title="Live" items={active} empty="No active consultations." />
          <Section title="History" items={history} empty="No past consultations yet." />
        </>
      )}
    </div>
  );
}

function Section({ title, items, empty }: { title: string; items: Consultation[]; empty: string }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-lg text-muted">{empty}</p>
      ) : (
        items.map((c) => (
          <Link key={c.id} href={`/consultations/${c.id}`}>
            <Card className="flex items-center justify-between gap-4 hover:border-accent transition-colors">
              <div>
                <p className="text-xl font-semibold">{c.user?.email ?? c.user?.phone ?? "Client"}</p>
                <p className="text-base text-muted">
                  {c.type === "CHAT" ? "Chat" : "Voice"} · {new Date(c.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={`text-lg font-semibold ${STATUS_COLOR[c.status]}`}>{STATUS_LABEL[c.status]}</span>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
