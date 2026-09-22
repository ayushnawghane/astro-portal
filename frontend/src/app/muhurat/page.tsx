"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ShubhMuhurat } from "@/lib/types";
import { Card } from "@/components/ui";

const ACTIVITIES: { value: string; label: string }[] = [
  { value: "marriage", label: "Marriage" },
  { value: "griha-pravesh", label: "Griha Pravesh (Housewarming)" },
  { value: "vehicle-purchase", label: "Vehicle Purchase" },
  { value: "naming-ceremony", label: "Naming Ceremony" },
  { value: "business-opening", label: "Business Opening" },
  { value: "engagement", label: "Engagement" },
  { value: "mundan", label: "Mundan" },
  { value: "travel", label: "Travel" },
];

export default function MuhuratPage() {
  const [activity, setActivity] = useState("marriage");
  const [entries, setEntries] = useState<ShubhMuhurat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<ShubhMuhurat[]>(`/muhurat/${activity}`)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [activity]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold">Shubh Muhurat</h1>
        <p className="text-lg text-muted mt-2">Find auspicious dates and timings for important life events.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {ACTIVITIES.map((a) => (
          <button
            key={a.value}
            onClick={() => setActivity(a.value)}
            className={`rounded-lg px-5 py-2 text-lg font-medium border transition-colors ${
              activity === a.value ? "bg-accent text-white border-accent" : "border-border hover:bg-zinc-100"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-lg text-muted">Loading…</p>
      ) : entries.length === 0 ? (
        <Card>
          <p className="text-lg text-muted">No upcoming auspicious dates published for this activity yet.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {entries.map((e) => (
            <Card key={e.id}>
              <p className="text-xl font-semibold">
                {e.title} — {new Date(e.date).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
              <p className="text-lg text-muted mt-1">{e.description}</p>
              <div className="flex flex-wrap gap-3 mt-4">
                {e.timings.map((t, i) => (
                  <span key={i} className="rounded-full border border-border px-4 py-2 text-base">
                    {t.start} – {t.end} <span className="text-muted">({t.quality})</span>
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
