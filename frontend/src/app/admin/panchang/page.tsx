"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth, ApiError } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { AdminGuard } from "@/components/admin-guard";
import { Button, Card, ErrorText, Field, TextInput } from "@/components/ui";

const today = new Date().toISOString().slice(0, 10);

export default function AdminPanchangPage() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    date: today,
    location: "New Delhi",
    latitude: "28.6139",
    longitude: "77.209",
    tithi: "",
    nakshatra: "",
    yoga: "",
    karana: "",
    sunrise: `${today}T06:00`,
    sunset: `${today}T18:00`,
    rahuKaal: "",
    gulikaKaal: "",
    yamaganda: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);
    try {
      await api.post(
        "/panchang",
        {
          ...form,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          sunrise: new Date(form.sunrise).toISOString(),
          sunset: new Date(form.sunset).toISOString(),
        },
        token,
      );
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save this Panchang entry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminGuard>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Manage Panchang</h1>
          <Link href="/admin" className="text-lg text-accent hover:underline">
            ← Dashboard
          </Link>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
            <Field label="Date" htmlFor="date">
              <TextInput id="date" type="date" required value={form.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
            <Field label="Location" htmlFor="location">
              <TextInput id="location" required value={form.location} onChange={(e) => set("location", e.target.value)} />
            </Field>
            <Field label="Latitude" htmlFor="latitude">
              <TextInput id="latitude" type="number" step="any" required value={form.latitude} onChange={(e) => set("latitude", e.target.value)} />
            </Field>
            <Field label="Longitude" htmlFor="longitude">
              <TextInput id="longitude" type="number" step="any" required value={form.longitude} onChange={(e) => set("longitude", e.target.value)} />
            </Field>
            <Field label="Tithi" htmlFor="tithi">
              <TextInput id="tithi" required value={form.tithi} onChange={(e) => set("tithi", e.target.value)} />
            </Field>
            <Field label="Nakshatra" htmlFor="nakshatra">
              <TextInput id="nakshatra" required value={form.nakshatra} onChange={(e) => set("nakshatra", e.target.value)} />
            </Field>
            <Field label="Yoga" htmlFor="yoga">
              <TextInput id="yoga" required value={form.yoga} onChange={(e) => set("yoga", e.target.value)} />
            </Field>
            <Field label="Karana" htmlFor="karana">
              <TextInput id="karana" required value={form.karana} onChange={(e) => set("karana", e.target.value)} />
            </Field>
            <Field label="Sunrise" htmlFor="sunrise">
              <TextInput id="sunrise" type="datetime-local" required value={form.sunrise} onChange={(e) => set("sunrise", e.target.value)} />
            </Field>
            <Field label="Sunset" htmlFor="sunset">
              <TextInput id="sunset" type="datetime-local" required value={form.sunset} onChange={(e) => set("sunset", e.target.value)} />
            </Field>
            <Field label="Rahu Kaal" htmlFor="rahuKaal">
              <TextInput id="rahuKaal" required placeholder="07:30 AM - 09:00 AM" value={form.rahuKaal} onChange={(e) => set("rahuKaal", e.target.value)} />
            </Field>
            <Field label="Gulika Kaal" htmlFor="gulikaKaal">
              <TextInput id="gulikaKaal" required value={form.gulikaKaal} onChange={(e) => set("gulikaKaal", e.target.value)} />
            </Field>
            <Field label="Yamaganda" htmlFor="yamaganda">
              <TextInput id="yamaganda" required value={form.yamaganda} onChange={(e) => set("yamaganda", e.target.value)} />
            </Field>
            <div className="sm:col-span-2 flex flex-col gap-4">
              <ErrorText>{error}</ErrorText>
              {success && <p className="text-lg text-green-700">Saved.</p>}
              <Button type="submit" disabled={submitting} className="self-start">
                {submitting ? "Saving…" : "Save Panchang"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminGuard>
  );
}
