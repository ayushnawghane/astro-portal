"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth, ApiError } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { ZODIAC_SIGNS } from "@/lib/zodiac";
import type { HoroscopeType } from "@/lib/types";
import { AdminGuard } from "@/components/admin-guard";
import { Button, Card, ErrorText, Field, Select, TextInput } from "@/components/ui";

const TYPES: HoroscopeType[] = ["YESTERDAY", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"];

export default function AdminHoroscopesPage() {
  const { token } = useAuth();
  const [zodiacSign, setZodiacSign] = useState("aries");
  const [type, setType] = useState<HoroscopeType>("DAILY");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState("");
  const [luckyColor, setLuckyColor] = useState("");
  const [luckyNumber, setLuckyNumber] = useState("");
  const [luckyTime, setLuckyTime] = useState("");
  const [luckyDirection, setLuckyDirection] = useState("");
  const [luckyGemstone, setLuckyGemstone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);
    try {
      await api.post(
        "/horoscopes",
        { zodiacSign, type, date, content, luckyColor, luckyNumber, luckyTime, luckyDirection, luckyGemstone },
        token,
      );
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save this horoscope.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminGuard>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Manage Horoscopes</h1>
          <Link href="/admin" className="text-lg text-accent hover:underline">
            ← Dashboard
          </Link>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
            <Field label="Zodiac sign" htmlFor="sign">
              <Select id="sign" value={zodiacSign} onChange={(e) => setZodiacSign(e.target.value)}>
                {ZODIAC_SIGNS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Type" htmlFor="type">
              <Select id="type" value={type} onChange={(e) => setType(e.target.value as HoroscopeType)}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Date" htmlFor="date">
              <TextInput id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Content" htmlFor="content">
                <textarea
                  id="content"
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-border bg-white px-4 py-3 text-lg focus:border-accent"
                />
              </Field>
            </div>
            <Field label="Lucky color" htmlFor="luckyColor">
              <TextInput id="luckyColor" value={luckyColor} onChange={(e) => setLuckyColor(e.target.value)} />
            </Field>
            <Field label="Lucky number" htmlFor="luckyNumber">
              <TextInput id="luckyNumber" value={luckyNumber} onChange={(e) => setLuckyNumber(e.target.value)} />
            </Field>
            <Field label="Lucky time" htmlFor="luckyTime">
              <TextInput id="luckyTime" value={luckyTime} onChange={(e) => setLuckyTime(e.target.value)} />
            </Field>
            <Field label="Lucky direction" htmlFor="luckyDirection">
              <TextInput id="luckyDirection" value={luckyDirection} onChange={(e) => setLuckyDirection(e.target.value)} />
            </Field>
            <Field label="Lucky gemstone" htmlFor="luckyGemstone">
              <TextInput id="luckyGemstone" value={luckyGemstone} onChange={(e) => setLuckyGemstone(e.target.value)} />
            </Field>
            <div className="sm:col-span-2 flex flex-col gap-4">
              <ErrorText>{error}</ErrorText>
              {success && <p className="text-lg text-green-700">Saved.</p>}
              <Button type="submit" disabled={submitting} className="self-start">
                {submitting ? "Saving…" : "Save horoscope"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminGuard>
  );
}
