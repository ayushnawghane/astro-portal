import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center gap-8 py-12">
      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground max-w-2xl">
        Understand your life's path with a trusted astrologer
      </h1>
      <p className="text-xl text-muted max-w-xl">
        Get your free birth chart (Kundli), read your daily horoscope, and talk to a verified
        astrologer whenever you need guidance.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/register"
          className="rounded-lg bg-accent px-8 py-4 text-xl font-semibold text-white hover:bg-accent-hover transition-colors"
        >
          Create your free account
        </Link>
        <Link
          href="/profiles"
          className="rounded-lg border border-border px-8 py-4 text-xl font-semibold text-foreground hover:bg-zinc-100 transition-colors"
        >
          Get my free Kundli
        </Link>
      </div>
    </div>
  );
}
