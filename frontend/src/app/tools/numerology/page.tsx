"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { NumerologyResult } from "@/lib/types";
import { Button, Card, ErrorText, Field, TextInput } from "@/components/ui";

export default function NumerologyPage() {
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post<NumerologyResult>("/tools/numerology", { fullName, dateOfBirth });
      setResult(res);
    } catch {
      setError("Could not calculate your numbers. Please check the details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Numerology Calculator</h1>
        <Link href="/tools" className="text-lg text-accent hover:underline">
          ← All tools
        </Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
          <Field label="Full name (as given at birth)" htmlFor="fullName">
            <TextInput id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </Field>
          <Field label="Date of birth" htmlFor="dob">
            <TextInput id="dob" type="date" required value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          </Field>
          <div className="sm:col-span-2 flex flex-col gap-4">
            <ErrorText>{error}</ErrorText>
            <Button type="submit" disabled={submitting} className="self-start">
              {submitting ? "Calculating…" : "Calculate my numbers"}
            </Button>
          </div>
        </form>
      </Card>

      {result && (
        <div className="grid sm:grid-cols-3 gap-6">
          <NumberCard label="Life Path Number" value={result.lifePathNumber} meaning={result.lifePathMeaning} />
          <NumberCard label="Destiny Number" value={result.destinyNumber} meaning={result.destinyMeaning} />
          <NumberCard label="Soul Urge Number" value={result.soulUrgeNumber} meaning={result.soulUrgeMeaning} />
        </div>
      )}
    </div>
  );
}

function NumberCard({ label, value, meaning }: { label: string; value: number; meaning: string }) {
  return (
    <Card className="flex flex-col items-center text-center gap-2">
      <p className="text-base text-muted">{label}</p>
      <p className="text-5xl font-semibold text-accent">{value}</p>
      <p className="text-lg">{meaning}</p>
    </Card>
  );
}
