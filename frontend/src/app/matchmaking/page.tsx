"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, ApiError } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { MatchResult, Profile } from "@/lib/types";
import { Button, Card, ErrorText, Field, Select } from "@/components/ui";

export default function MatchmakingPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileIdA, setProfileIdA] = useState("");
  const [profileIdB, setProfileIdB] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!token) return;
    api.get<Profile[]>("/profiles", token).then((res) => {
      setProfiles(res);
      if (res.length >= 2) {
        setProfileIdA(res[0].id);
        setProfileIdB(res[1].id);
      }
    });
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (profileIdA === profileIdB) {
      setError("Choose two different profiles to compare.");
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const res = await api.post<MatchResult>("/matchmaking/compare", { profileIdA, profileIdB }, token);
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not compute compatibility. Make sure both profiles have birth coordinates set.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) return null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold">Kundli Matching (Ashtakoot)</h1>
        <p className="text-lg text-muted mt-2">Compare two of your saved profiles for classical marriage compatibility.</p>
      </div>

      {profiles.length < 2 ? (
        <Card>
          <p className="text-lg text-muted">
            You need at least two saved profiles to check compatibility.{" "}
            <Link href="/profiles" className="text-accent hover:underline">
              Add a profile
            </Link>{" "}
            (e.g. yourself and a prospective partner as &quot;Someone else&quot;).
          </p>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
            <Field label="First profile" htmlFor="profileA">
              <Select id="profileA" value={profileIdA} onChange={(e) => setProfileIdA(e.target.value)}>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Second profile" htmlFor="profileB">
              <Select id="profileB" value={profileIdB} onChange={(e) => setProfileIdB(e.target.value)}>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="sm:col-span-2 flex flex-col gap-4">
              <ErrorText>{error}</ErrorText>
              <Button type="submit" disabled={submitting} className="self-start">
                {submitting ? "Checking…" : "Check compatibility"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {result && (
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-base text-muted">Total Guna score</p>
              <p className="text-4xl font-semibold text-accent">
                {result.totalScore} / {result.maxScore}
              </p>
            </div>
            <p className="text-xl font-medium">{result.verdict}</p>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-4">Koota Breakdown</h2>
            <ul className="flex flex-col">
              {result.kootas.map((k) => (
                <li key={k.name} className="py-3 border-b border-border last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">{k.name}</span>
                    <span className="text-lg font-semibold">
                      {k.score} / {k.maxScore}
                    </span>
                  </div>
                  <p className="text-base text-muted">{k.description}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-2">Mangal Dosha</h2>
            <p className="text-lg">{result.mangalDosha.note}</p>
          </Card>

          <p className="text-base text-muted">
            This is a computational approximation of classical Ashtakoot (Guna Milan) matching, intended as a starting
            point — not a substitute for a detailed consultation with a qualified astrologer.
          </p>
        </div>
      )}
    </div>
  );
}
