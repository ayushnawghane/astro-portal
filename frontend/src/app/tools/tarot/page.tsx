"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { TarotCard } from "@/lib/types";
import { Button, Card } from "@/components/ui";

export default function TarotPage() {
  const [cards, setCards] = useState<TarotCard[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function draw(spread: "single" | "three") {
    setLoading(true);
    setCards(null);
    try {
      const res = await api.get<{ cards: TarotCard[] }>(`/tools/tarot/draw?spread=${spread}`);
      setCards(res.cards);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Tarot Card Reading</h1>
        <Link href="/tools" className="text-lg text-accent hover:underline">
          ← All tools
        </Link>
      </div>

      <div className="flex flex-wrap gap-4">
        <Button onClick={() => draw("single")} disabled={loading}>
          Draw a single card
        </Button>
        <Button variant="secondary" onClick={() => draw("three")} disabled={loading}>
          Past / Present / Future spread
        </Button>
      </div>

      {cards && (
        <div className={`grid gap-6 ${cards.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-1 max-w-md"}`}>
          {cards.map((c, i) => (
            <Card key={i} className="flex flex-col gap-2 text-center">
              <p className="text-base text-muted">{c.position}</p>
              <p className="text-2xl font-semibold">
                {c.name}
                {c.reversed ? " (Reversed)" : ""}
              </p>
              <p className="text-lg text-muted">{c.meaning}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
