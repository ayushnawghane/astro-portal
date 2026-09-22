"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Consultation } from "@/lib/types";
import { Card } from "@/components/ui";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Waiting for astrologer",
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

export default function ConsultationsPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!token) return;
    api
      .get<Consultation[]>("/consultations/me", token)
      .then(setConsultations)
      .finally(() => setLoadingList(false));
  }, [token]);

  if (loading || !user) return null;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-semibold">My Consultations</h1>

      {loadingList ? (
        <p className="text-lg text-muted">Loading…</p>
      ) : consultations.length === 0 ? (
        <Card>
          <p className="text-lg text-muted">
            You haven&apos;t started a consultation yet.{" "}
            <Link href="/astrologers" className="text-accent hover:underline">
              Find an astrologer
            </Link>{" "}
            to talk to.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {consultations.map((c) => (
            <Link key={c.id} href={`/consultations/${c.id}`}>
              <Card className="flex items-center justify-between gap-4 hover:border-accent transition-colors">
                <div>
                  <p className="text-xl font-semibold">{c.astrologer?.displayName ?? "Astrologer"}</p>
                  <p className="text-base text-muted">
                    {c.type === "CHAT" ? "Chat" : "Voice"} · {new Date(c.createdAt).toLocaleString()}
                    {c.isFreeSession ? " · Free session" : ""}
                  </p>
                </div>
                <span className={`text-lg font-semibold ${STATUS_COLOR[c.status]}`}>{STATUS_LABEL[c.status]}</span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
