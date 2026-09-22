import Link from "next/link";
import { Card } from "@/components/ui";

const TOOLS = [
  { href: "/tools/numerology", title: "Numerology Calculator", description: "Discover your Life Path, Destiny, and Soul Urge numbers from your name and birth date." },
  { href: "/tools/zodiac", title: "Zodiac Sign & Compatibility", description: "Find your Western sun sign and check compatibility with another sign." },
  { href: "/tools/tarot", title: "Tarot Card Reading", description: "Draw a single card or a three-card past/present/future spread." },
];

export default function ToolsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold">Astrology Tools & Calculators</h1>
        <p className="text-lg text-muted mt-2">Quick, free calculators to explore alongside your Kundli.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href}>
            <Card className="flex flex-col gap-2 h-full hover:border-accent transition-colors">
              <p className="text-xl font-semibold">{t.title}</p>
              <p className="text-lg text-muted">{t.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
