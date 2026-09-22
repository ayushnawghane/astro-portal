"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, ApiError } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Astrologer } from "@/lib/types";
import { Button, Card, ErrorText, Field, TextInput } from "@/components/ui";

interface Dashboard {
  astrologer: Astrologer;
  completedSessions: number;
  totalEarnings: number;
}

export default function AstrologerDashboardPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [notApplied, setNotApplied] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!token) return;
    api
      .get<Dashboard>("/astrologers/me/dashboard", token)
      .then(setDashboard)
      .catch(() => setNotApplied(true))
      .finally(() => setChecking(false));
  }, [token]);

  if (loading || !user) return null;

  if (checking) return <p className="text-lg text-muted">Loading…</p>;

  if (notApplied) return <ApplyForm token={token} onApplied={() => window.location.reload()} />;

  if (!dashboard) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Astrologer Dashboard</h1>
        <Link
          href="/astrologer/console"
          className="rounded-lg bg-accent px-5 py-3 text-lg font-semibold text-white hover:bg-accent-hover transition-colors"
        >
          Go to consultation console
        </Link>
      </div>

      {!dashboard.astrologer.isApproved && (
        <Card className="bg-gold/5 border-gold">
          <p className="text-lg">
            Your application is under review. You&apos;ll appear in the marketplace once approved.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <p className="text-base text-muted">Completed sessions</p>
          <p className="text-3xl font-semibold">{dashboard.completedSessions}</p>
        </Card>
        <Card>
          <p className="text-base text-muted">Total earnings</p>
          <p className="text-3xl font-semibold text-accent">₹{Number(dashboard.totalEarnings).toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-base text-muted">Rating</p>
          <p className="text-3xl font-semibold">
            {dashboard.astrologer.ratingCount > 0 ? `★ ${dashboard.astrologer.ratingAvg.toFixed(1)}` : "No reviews yet"}
          </p>
        </Card>
      </div>

      <Card className="flex flex-col gap-2">
        <p className="text-xl font-semibold">{dashboard.astrologer.displayName}</p>
        <p className="text-lg text-muted">{dashboard.astrologer.bio}</p>
        <p className="text-lg">₹{dashboard.astrologer.pricePerMinuteChat}/min chat</p>
      </Card>
    </div>
  );
}

function ApplyForm({ token, onApplied }: { token: string | null; onApplied: () => void }) {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState("1");
  const [languages, setLanguages] = useState("English, Hindi");
  const [expertise, setExpertise] = useState("Vedic Astrology");
  const [pricePerMinuteChat, setPricePerMinuteChat] = useState("10");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post(
        "/astrologers/apply",
        {
          displayName,
          bio,
          experienceYears: Number(experienceYears),
          languages: languages.split(",").map((s) => s.trim()).filter(Boolean),
          expertise: expertise.split(",").map((s) => s.trim()).filter(Boolean),
          pricePerMinuteChat: Number(pricePerMinuteChat),
        },
        token,
      );
      onApplied();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit your application.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-semibold mb-6">Become an Astrologer</h1>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Field label="Display name" htmlFor="displayName">
            <TextInput id="displayName" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </Field>
          <Field label="About you" htmlFor="bio">
            <textarea
              id="bio"
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-lg focus:border-accent"
            />
          </Field>
          <Field label="Years of experience" htmlFor="experience">
            <TextInput
              id="experience"
              type="number"
              min={0}
              required
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
            />
          </Field>
          <Field label="Languages (comma separated)" htmlFor="languages">
            <TextInput id="languages" required value={languages} onChange={(e) => setLanguages(e.target.value)} />
          </Field>
          <Field label="Areas of expertise (comma separated)" htmlFor="expertise">
            <TextInput id="expertise" required value={expertise} onChange={(e) => setExpertise(e.target.value)} />
          </Field>
          <Field label="Price per minute for chat (₹)" htmlFor="price">
            <TextInput
              id="price"
              type="number"
              min={1}
              required
              value={pricePerMinuteChat}
              onChange={(e) => setPricePerMinuteChat(e.target.value)}
            />
          </Field>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit application"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
