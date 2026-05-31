"use client";

import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { EngagementBar } from "@/components/EngagementBar";
import { CommentSection } from "@/components/CommentSection";
import { StarRating } from "@/components/StarRating";
import Link from "next/link";
import type { JournalistPost, Review, ReviewType } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { getUserDisplayName, setUserDisplayName } from "@/lib/user-client";

const TYPES: { id: ReviewType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "musician", label: "Musicians" },
  { id: "blog", label: "Blogs" },
  { id: "album", label: "Albums" },
  { id: "video", label: "Videos" },
];

export default function CommunityPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [posts, setPosts] = useState<JournalistPost[]>([]);
  const [filter, setFilter] = useState<ReviewType | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    authorName: typeof window !== "undefined" ? getUserDisplayName() : "",
    type: "musician" as ReviewType,
    subject: "",
    rating: 5,
    body: "",
    mediaUrl: "",
  });

  const load = useCallback(async () => {
    const params = filter !== "all" ? `?type=${filter}` : "";
    const [reviewsRes, postsRes] = await Promise.all([
      fetch(`/api/reviews${params}`),
      fetch("/api/posts"),
    ]);
    const reviewsData = await reviewsRes.json();
    const postsData = await postsRes.json();
    setReviews(reviewsData.reviews || []);
    setPosts((postsData.posts || []).slice(0, 6));
  }, [filter]);

  useEffect(() => {
    let ignore = false;
    const params = filter !== "all" ? `?type=${filter}` : "";
    Promise.all([fetch(`/api/reviews${params}`), fetch("/api/posts")])
      .then(([reviewsRes, postsRes]) =>
        Promise.all([reviewsRes.json(), postsRes.json()])
      )
      .then(([reviewsData, postsData]) => {
        if (ignore) return;
        setReviews(reviewsData.reviews || []);
        setPosts((postsData.posts || []).slice(0, 6));
      });
    return () => {
      ignore = true;
    };
  }, [filter]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      setUserDisplayName(form.authorName);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setShowForm(false);
      setForm((f) => ({ ...f, subject: "", body: "", mediaUrl: "" }));
      await load();
    } catch {
      alert("Could not post review");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <Header title="Community" subtitle="Reviews & Discussion" />

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--text-muted)]">
            Review musicians, blogs, albums, and videos. Like and comment on posts.
          </p>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="btn-primary w-fit"
          >
            {showForm ? "Cancel" : "+ Write Review"}
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase ${
                filter === t.id
                  ? "bg-[var(--accent)] text-white"
                  : "glass text-[var(--text-muted)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 grid gap-4 rounded-2xl glass-strong p-6 md:grid-cols-2"
          >
            <div>
              <label className="mb-1 block text-[10px] font-bold text-[var(--text-muted)] uppercase">
                Your name
              </label>
              <input
                required
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold text-[var(--text-muted)] uppercase">
                Review type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as ReviewType })
                }
              >
                <option value="musician">Musician</option>
                <option value="blog">Blog</option>
                <option value="album">Album</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[10px] font-bold text-[var(--text-muted)] uppercase">
                Subject (artist, blog, video title)
              </label>
              <input
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[10px] font-bold text-[var(--text-muted)] uppercase">
                Rating
              </label>
              <StarRating
                value={form.rating}
                onChange={(rating) => setForm({ ...form, rating })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[10px] font-bold text-[var(--text-muted)] uppercase">
                Review
              </label>
              <textarea
                required
                rows={4}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Publishing…" : "Publish Review"}
              </button>
            </div>
          </form>
        )}

        {posts.length > 0 && (
          <div className="mb-10">
            <h3 className="font-display mb-4 text-sm font-bold tracking-widest text-[var(--gold)] uppercase">
              Latest from journalists
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="rounded-xl glass p-4 transition-all hover:glow-border"
                >
                  <span className="chip">{post.type}</span>
                  <p className="mt-2 font-semibold line-clamp-2">{post.title}</p>
                  <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                    {timeAgo(post.publishedAt)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl glass p-5 glow-border">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip">{review.type}</span>
                <StarRating value={review.rating} readonly />
                <span className="text-[10px] text-[var(--text-muted)]">
                  {timeAgo(review.createdAt)}
                </span>
              </div>
              <h3 className="mt-2 text-lg font-semibold">{review.subject}</h3>
              <p className="mt-1 text-xs text-[var(--accent)]">by {review.authorName}</p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                {review.body}
              </p>
              <div className="mt-4">
                <EngagementBar
                  targetType="review"
                  targetId={review.id}
                  onCommentClick={() =>
                    setExpanded(expanded === review.id ? null : review.id)
                  }
                />
              </div>
              {expanded === review.id && (
                <CommentSection targetType="review" targetId={review.id} />
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
