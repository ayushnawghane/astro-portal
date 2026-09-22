"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import type { Panchang } from "@/lib/types";
import { Button, Card, Field, TextInput } from "@/components/ui";

export default function PanchangPage() {
  const [location, setLocation] = useState("New Delhi");
  const [panchang, setPanchang] = useState<Panchang | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  function load(loc: string) {
    setLoading(true);
    setNotFound(false);
    api
      .get<Panchang>(`/panchang?location=${encodeURIComponent(loc)}`)
      .then(setPanchang)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(location);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    load(location);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold">Today&apos;s Panchang</h1>
        <p className="text-lg text-muted mt-2">
          Tithi, Nakshatra, Yoga, Karana and auspicious/inauspicious timings for your city.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[240px]">
          <Field label="City" htmlFor="location">
            <TextInput id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>
        </div>
        <Button type="submit">Check Panchang</Button>
      </form>

      {loading ? (
        <p className="text-lg text-muted">Loading…</p>
      ) : notFound || !panchang ? (
        <Card>
          <p className="text-lg text-muted">
            No Panchang data available for &quot;{location}&quot; today yet.
          </p>
        </Card>
      ) : (
        <Card>
          <h2 className="text-2xl font-semibold mb-6">
            {panchang.location} — {new Date(panchang.date).toLocaleDateString()}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <Item label="Tithi" value={panchang.tithi} />
            <Item label="Nakshatra" value={panchang.nakshatra} />
            <Item label="Yoga" value={panchang.yoga} />
            <Item label="Karana" value={panchang.karana} />
            <Item label="Sunrise" value={new Date(panchang.sunrise).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} />
            <Item label="Sunset" value={new Date(panchang.sunset).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-border">
            <Item label="Rahu Kaal" value={panchang.rahuKaal} warn />
            <Item label="Gulika Kaal" value={panchang.gulikaKaal} warn />
            <Item label="Yamaganda" value={panchang.yamaganda} warn />
          </div>
        </Card>
      )}
    </div>
  );
}

function Item({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <div>
      <p className="text-base text-muted">{label}</p>
      <p className={`text-lg font-medium ${warn ? "text-accent" : ""}`}>{value}</p>
    </div>
  );
}
