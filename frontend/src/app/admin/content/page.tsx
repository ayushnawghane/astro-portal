"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth, ApiError } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { ContentCategory, ContentDetail, PaginatedResult } from "@/lib/types";
import { AdminGuard } from "@/components/admin-guard";
import { Button, Card, ErrorText, Field, Select, TextInput } from "@/components/ui";

export default function AdminContentPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<ContentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!token) return;
    api
      .get<PaginatedResult<ContentDetail>>("/content?pageSize=50", token)
      .then((res) => setItems(res.items))
      .finally(() => setLoading(false));
  }, [token]);

  async function togglePublish(item: ContentDetail) {
    await api.patch(`/content/${item.id}`, { isPublished: !item.isPublished }, token);
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isPublished: !i.isPublished } : i)));
  }

  return (
    <AdminGuard>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Manage Content</h1>
          <div className="flex gap-3">
            <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "New article"}</Button>
            <Link href="/admin" className="text-lg text-accent hover:underline self-center">
              ← Dashboard
            </Link>
          </div>
        </div>

        {showForm && (
          <CreateContentForm
            token={token}
            onCreated={(item) => {
              setItems((prev) => [item, ...prev]);
              setShowForm(false);
            }}
          />
        )}

        {loading ? (
          <p className="text-lg text-muted">Loading…</p>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <Card key={item.id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold">
                    {item.title} <span className="text-base text-muted">({item.category})</span>
                  </p>
                  <p className="text-base text-muted">/{item.slug}</p>
                </div>
                <Button variant={item.isPublished ? "secondary" : "primary"} onClick={() => togglePublish(item)}>
                  {item.isPublished ? "Unpublish" : "Publish"}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}

function CreateContentForm({ token, onCreated }: { token: string | null; onCreated: (item: ContentDetail) => void }) {
  const [category, setCategory] = useState<ContentCategory>("BLOG");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const item = await api.post<ContentDetail>(
        "/content",
        { category, slug, title, summary, body, tags: tags.split(",").map((t) => t.trim()).filter(Boolean), isPublished },
        token,
      );
      onCreated(item);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save this article.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
        <Field label="Category" htmlFor="category">
          <Select id="category" value={category} onChange={(e) => setCategory(e.target.value as ContentCategory)}>
            <option value="BLOG">Blog</option>
            <option value="EDUCATION">Education</option>
          </Select>
        </Field>
        <Field label="Slug (URL-friendly)" htmlFor="slug" hint="lowercase-with-hyphens">
          <TextInput id="slug" required value={slug} onChange={(e) => setSlug(e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Title" htmlFor="title">
            <TextInput id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Summary" htmlFor="summary">
            <TextInput id="summary" required value={summary} onChange={(e) => setSummary(e.target.value)} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Body" htmlFor="body">
            <textarea
              id="body"
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-lg focus:border-accent"
            />
          </Field>
        </div>
        <Field label="Tags (comma separated)" htmlFor="tags">
          <TextInput id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
        </Field>
        <div className="flex items-center gap-3 mt-8">
          <input id="isPublished" type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="w-5 h-5" />
          <label htmlFor="isPublished" className="text-lg">
            Publish immediately
          </label>
        </div>
        <div className="sm:col-span-2 flex flex-col gap-4">
          <ErrorText>{error}</ErrorText>
          <Button type="submit" disabled={submitting} className="self-start">
            {submitting ? "Saving…" : "Save article"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
