"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { WesternSign, ZodiacCompatibilityResult, ZodiacSignResult } from "@/lib/types";
import { Button, Card, ErrorText, Field, Select, TextInput } from "@/components/ui";

const SIGNS: WesternSign[] = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

export default function ZodiacToolPage() {
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sign, setSign] = useState<ZodiacSignResult | null>(null);
  const [error, setError] = useState("");

  const [signA, setSignA] = useState<WesternSign>("Aries");
  const [signB, setSignB] = useState<WesternSign>("Leo");
  const [compat, setCompat] = useState<ZodiacCompatibilityResult | null>(null);

  async function handleFindSign(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.get<ZodiacSignResult>(`/tools/zodiac-sign?dateOfBirth=${dateOfBirth}`);
      setSign(res);
      setSignA(res.sign);
    } catch {
      setError("Could not determine your sign. Please check the date.");
    }
  }

  async function handleCompat(e: FormEvent) {
    e.preventDefault();
    const res = await api.post<ZodiacCompatibilityResult>("/tools/zodiac-compatibility", { signA, signB });
    setCompat(res);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Zodiac Sign & Compatibility</h1>
        <Link href="/tools" className="text-lg text-accent hover:underline">
          ← All tools
        </Link>
      </div>

      <Card className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold">Find your sun sign</h2>
        <form onSubmit={handleFindSign} className="flex flex-wrap items-end gap-4">
          <div className="w-56">
            <Field label="Date of birth" htmlFor="dob">
              <TextInput id="dob" type="date" required value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            </Field>
          </div>
          <Button type="submit">Find my sign</Button>
        </form>
        <ErrorText>{error}</ErrorText>
        {sign && (
          <p className="text-xl">
            You are a <span className="font-semibold text-accent">{sign.sign}</span> ({sign.element} sign, ruled by{" "}
            {sign.rulingPlanet}).
          </p>
        )}
      </Card>

      <Card className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold">Check compatibility</h2>
        <form onSubmit={handleCompat} className="grid sm:grid-cols-2 gap-6">
          <Field label="First sign" htmlFor="signA">
            <Select id="signA" value={signA} onChange={(e) => setSignA(e.target.value as WesternSign)}>
              {SIGNS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Second sign" htmlFor="signB">
            <Select id="signB" value={signB} onChange={(e) => setSignB(e.target.value as WesternSign)}>
              {SIGNS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit">Check compatibility</Button>
          </div>
        </form>
        {compat && (
          <div>
            <p className="text-3xl font-semibold text-accent">{compat.score}%</p>
            <p className="text-lg mt-2">{compat.description}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
