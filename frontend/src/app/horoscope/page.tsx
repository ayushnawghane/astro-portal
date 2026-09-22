import Link from "next/link";
import { ZODIAC_SIGNS } from "@/lib/zodiac";
import { Card } from "@/components/ui";

export default function HoroscopePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold">Daily Horoscope</h1>
        <p className="text-lg text-muted mt-2">Choose your zodiac sign to read today&apos;s horoscope.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {ZODIAC_SIGNS.map((sign) => (
          <Link key={sign.value} href={`/horoscope/${sign.value}`}>
            <Card className="flex flex-col items-center gap-2 text-center hover:border-accent transition-colors !p-6">
              <span className="text-4xl" aria-hidden>
                {sign.symbol}
              </span>
              <span className="text-xl font-medium">{sign.label}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
