"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, ApiError } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { AstrologerWithReviews, Consultation } from "@/lib/types";
import { Button, Card, ErrorText } from "@/components/ui";

const BADGE_LABEL: Record<string, string> = {
  NEW: "New",
  VERIFIED: "Verified",
  EXPERT: "Expert",
  CELEBRITY: "Celebrity",
};

export default function AstrologerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const router = useRouter();

  const [astrologer, setAstrologer] = useState<AstrologerWithReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<AstrologerWithReviews>(`/astrologers/${id}`)
      .then(setAstrologer)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStart(type: "CHAT" | "VOICE") {
    if (!user) {
      router.push("/login");
      return;
    }
    setError("");
    setStarting(true);
    try {
      const consultation = await api.post<Consultation>("/consultations", { astrologerId: id, type }, token);
      router.push(`/consultations/${consultation.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start a consultation. Please try again.");
    } finally {
      setStarting(false);
    }
  }

  if (loading) return <p className="text-lg text-muted">Loading…</p>;
  if (!astrologer) return <p className="text-lg text-muted">Astrologer not found.</p>;

  return (
    <div className="flex flex-col gap-8">
      <Link href="/astrologers" className="text-lg text-accent hover:underline">
        ← Back to all astrologers
      </Link>

      <Card className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">{astrologer.displayName}</h1>
            <p className="text-lg text-muted mt-1">{astrologer.experienceYears} years experience</p>
          </div>
          <span className="rounded-full bg-accent/10 text-accent px-4 py-2 text-base font-semibold">
            {BADGE_LABEL[astrologer.badge]}
          </span>
        </div>

        <p className="text-xl leading-relaxed">{astrologer.bio}</p>

        <div className="flex flex-wrap gap-2">
          {astrologer.expertise.map((e) => (
            <span key={e} className="rounded-full border border-border px-4 py-1 text-lg">
              {e}
            </span>
          ))}
        </div>

        <p className="text-lg text-muted">Speaks: {astrologer.languages.join(", ")}</p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-2xl font-semibold">₹{astrologer.pricePerMinuteChat}/min chat</p>
            {astrologer.pricePerMinuteVoice && <p className="text-lg text-muted">₹{astrologer.pricePerMinuteVoice}/min voice call</p>}
            <p className="text-base text-muted">
              {astrologer.ratingCount > 0 ? `★ ${astrologer.ratingAvg.toFixed(1)} (${astrologer.ratingCount} reviews)` : "No reviews yet"}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => handleStart("CHAT")} disabled={starting || !astrologer.isAvailable}>
              {!astrologer.isAvailable ? "Currently unavailable" : starting ? "Starting…" : "Start chat"}
            </Button>
            {astrologer.pricePerMinuteVoice && (
              <Button variant="secondary" onClick={() => handleStart("VOICE")} disabled={starting || !astrologer.isAvailable}>
                Start voice call
              </Button>
            )}
          </div>
        </div>
        <ErrorText>{error}</ErrorText>
      </Card>

      {astrologer.reviews.length > 0 && (
        <Card>
          <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
          <ul className="flex flex-col gap-4">
            {astrologer.reviews.map((r) => (
              <li key={r.id} className="border-b border-border pb-4 last:border-0">
                <p className="text-lg font-medium">{"★".repeat(r.rating)}</p>
                {r.comment && <p className="text-lg text-muted mt-1">{r.comment}</p>}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
