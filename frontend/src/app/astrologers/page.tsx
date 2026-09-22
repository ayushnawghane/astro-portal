"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Astrologer, PaginatedResult } from "@/lib/types";
import { Card } from "@/components/ui";

const BADGE_LABEL: Record<string, string> = {
  NEW: "New",
  VERIFIED: "Verified",
  EXPERT: "Expert",
  CELEBRITY: "Celebrity",
};

export default function AstrologersPage() {
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<PaginatedResult<Astrologer>>("/astrologers")
      .then((res) => setAstrologers(res.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold">Talk to an Astrologer</h1>
        <p className="text-lg text-muted mt-2">Verified astrologers, available for chat consultation.</p>
      </div>

      {loading ? (
        <p className="text-lg text-muted">Loading astrologers…</p>
      ) : astrologers.length === 0 ? (
        <Card>
          <p className="text-lg text-muted">No astrologers are available right now. Please check back soon.</p>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {astrologers.map((a) => (
            <Link key={a.id} href={`/astrologers/${a.id}`}>
              <Card className="flex flex-col gap-3 h-full hover:border-accent transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold">{a.displayName}</p>
                    <p className="text-base text-muted">{a.experienceYears} years experience</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-accent/10 text-accent px-3 py-1 text-sm font-semibold">
                    {BADGE_LABEL[a.badge]}
                  </span>
                </div>
                <p className="text-lg text-muted line-clamp-2">{a.bio}</p>
                <div className="flex flex-wrap gap-2 text-base text-muted">
                  {a.expertise.map((e) => (
                    <span key={e} className="rounded-full border border-border px-3 py-1">
                      {e}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 mt-auto">
                  <span className="text-lg font-semibold">₹{a.pricePerMinuteChat}/min chat</span>
                  <span className="text-base text-muted">
                    {a.ratingCount > 0 ? `★ ${a.ratingAvg.toFixed(1)} (${a.ratingCount})` : "New"}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
