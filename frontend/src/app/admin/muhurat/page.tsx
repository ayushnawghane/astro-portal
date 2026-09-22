"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth, ApiError } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { MuhuratTiming } from "@/lib/types";
import { AdminGuard } from "@/components/admin-guard";
import { Button, Card, ErrorText, Field, Select, TextInput } from "@/components/ui";

const ACTIVITIES = [
  "marriage", "griha-pravesh", "vehicle-purchase", "naming-ceremony",
  "business-opening", "engagement", "mundan", "travel",
];

export default function AdminMuhuratPage() {
  const { token } = useAuth();
  const [activityType, setActivityType] = useState("marriage");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timings, setTimings] = useState<MuhuratTiming[]>([{ start: "06:00", end: "07:30", quality: "Best" }]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function updateTiming(i: number, key: keyof MuhuratTiming, value: string) {
    setTimings((prev) => prev.map((t, idx) => (idx === i ? { ...t, [key]: value } : t)));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);
    try {
      await api.post("/muhurat", { activityType, date, title, description, timings }, token);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save this Muhurat entry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminGuard>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Manage Shubh Muhurat</h1>
          <Link href="/admin" className="text-lg text-accent hover:underline">
            ← Dashboard
          </Link>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
            <Field label="Activity" htmlFor="activityType">
              <Select id="activityType" value={activityType} onChange={(e) => setActivityType(e.target.value)}>
                {ACTIVITIES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Date" htmlFor="date">
              <TextInput id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Title" htmlFor="title">
              <TextInput id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Description" htmlFor="description">
              <TextInput id="description" required value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>

            <div className="sm:col-span-2 flex flex-col gap-4">
              <p className="text-lg font-medium">Timing windows</p>
              {timings.map((t, i) => (
                <div key={i} className="flex flex-wrap gap-3 items-end">
                  <TextInput type="time" value={t.start} onChange={(e) => updateTiming(i, "start", e.target.value)} className="w-32" />
                  <span className="text-lg self-center">to</span>
                  <TextInput type="time" value={t.end} onChange={(e) => updateTiming(i, "end", e.target.value)} className="w-32" />
                  <TextInput
                    placeholder="Quality (e.g. Best)"
                    value={t.quality}
                    onChange={(e) => updateTiming(i, "quality", e.target.value)}
                    className="w-40"
                  />
                  {timings.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setTimings((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-lg text-accent hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                className="self-start"
                onClick={() => setTimings((prev) => [...prev, { start: "10:00", end: "11:30", quality: "Good" }])}
              >
                + Add timing window
              </Button>
            </div>

            <div className="sm:col-span-2 flex flex-col gap-4">
              <ErrorText>{error}</ErrorText>
              {success && <p className="text-lg text-green-700">Saved.</p>}
              <Button type="submit" disabled={submitting} className="self-start">
                {submitting ? "Saving…" : "Save Muhurat"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminGuard>
  );
}
