"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ContentSummary, PaginatedResult } from "@/lib/types";
import { Card } from "@/components/ui";

export default function BlogPage() {
  const [articles, setArticles] = useState<ContentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<PaginatedResult<ContentSummary>>("/content/BLOG")
      .then((res) => setArticles(res.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold">Blog</h1>
        <p className="text-lg text-muted mt-2">Tips, stories, and updates from Astro Portal.</p>
      </div>

      {loading ? (
        <p className="text-lg text-muted">Loading…</p>
      ) : articles.length === 0 ? (
        <Card>
          <p className="text-lg text-muted">No articles published yet.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {articles.map((a) => (
            <Link key={a.id} href={`/blog/${a.slug}`}>
              <Card className="flex flex-col gap-2 h-full hover:border-accent transition-colors">
                <p className="text-xl font-semibold">{a.title}</p>
                <p className="text-lg text-muted">{a.summary}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
