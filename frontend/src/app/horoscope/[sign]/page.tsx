"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Horoscope, HoroscopeType } from "@/lib/types";
import { ZODIAC_SIGNS } from "@/lib/zodiac";
import { Card } from "@/components/ui";

const TYPES: { value: HoroscopeType; label: string }[] = [
  { value: "YESTERDAY", label: "Yesterday" },
  { value: "DAILY", label: "Today" },
  { value: "WEEKLY", label: "This Week" },
  { value: "MONTHLY", label: "This Month" },
  { value: "YEARLY", label: "This Year" },
];

export default function HoroscopeDetailPage() {
  const { sign } = useParams<{ sign: string }>();
  const [type, setType] = useState<HoroscopeType>("DAILY");
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const signInfo = ZODIAC_SIGNS.find((s) => s.value === sign);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api
      .get<Horoscope>(`/horoscopes/${sign}/${type}`)
      .then(setHoroscope)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [sign, type]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">
            {signInfo?.symbol} {signInfo?.label ?? sign} Horoscope
          </h1>
        </div>
        <Link href="/horoscope" className="text-lg text-accent hover:underline">
          ← Choose another sign
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={`rounded-lg px-5 py-2 text-lg font-medium border transition-colors ${
              type === t.value ? "bg-accent text-white border-accent" : "border-border hover:bg-zinc-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-lg text-muted">Loading…</p>
      ) : notFound || !horoscope ? (
        <Card>
          <p className="text-lg text-muted">No {TYPES.find((t) => t.value === type)?.label.toLowerCase()} horoscope available for this sign yet.</p>
        </Card>
      ) : (
        <Card className="flex flex-col gap-6">
          <p className="text-xl leading-relaxed">{horoscope.content}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
            {horoscope.luckyColor && <LuckyItem label="Lucky Color" value={horoscope.luckyColor} />}
            {horoscope.luckyNumber && <LuckyItem label="Lucky Number" value={horoscope.luckyNumber} />}
            {horoscope.luckyTime && <LuckyItem label="Lucky Time" value={horoscope.luckyTime} />}
            {horoscope.luckyDirection && <LuckyItem label="Lucky Direction" value={horoscope.luckyDirection} />}
            {horoscope.luckyGemstone && <LuckyItem label="Lucky Gemstone" value={horoscope.luckyGemstone} />}
          </div>
        </Card>
      )}
    </div>
  );
}

function LuckyItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-base text-muted">{label}</p>
      <p className="text-lg font-medium">{value}</p>
    </div>
  );
}
