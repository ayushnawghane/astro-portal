"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ContentDetail } from "@/lib/types";
import { Card } from "@/components/ui";

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ContentDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get<ContentDetail>(`/content/BLOG/${slug}`)
      .then(setArticle)
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <Card>
        <p className="text-lg text-muted">This article could not be found.</p>
      </Card>
    );
  }
  if (!article) return <p className="text-lg text-muted">Loading…</p>;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <Link href="/blog" className="text-lg text-accent hover:underline">
        ← All articles
      </Link>
      <h1 className="text-3xl font-semibold">{article.title}</h1>
      <p className="text-lg text-muted">{article.summary}</p>
      <div className="flex flex-wrap gap-2">
        {article.tags.map((t) => (
          <span key={t} className="rounded-full border border-border px-3 py-1 text-base text-muted">
            {t}
          </span>
        ))}
      </div>
      <p className="text-xl leading-relaxed whitespace-pre-line">{article.body}</p>
    </div>
  );
}
