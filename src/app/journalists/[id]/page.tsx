"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { EngagementBar } from "@/components/EngagementBar";
import { CommentSection } from "@/components/CommentSection";
import { platformLabel } from "@/lib/media";
import type {
  ConnectedSource,
  ConnectedPlatform,
  Journalist,
  JournalistPost,
  PostType,
} from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import {
  getActiveJournalistId,
  setActiveJournalistId,
} from "@/lib/user-client";
import { useUser } from "@/context/UserContext";

const PLATFORMS: ConnectedPlatform[] = [
  "website",
  "rss",
  "youtube",
  "tiktok",
  "twitter",
  "instagram",
];

export default function JournalistDeskPage() {
  const params = useParams();
  const id = params.id as string;
  const { currentUser, openAuth } = useUser();

  const [journalist, setJournalist] = useState<Journalist | null>(null);
  const [posts, setPosts] = useState<JournalistPost[]>([]);
  const [sources, setSources] = useState<ConnectedSource[]>([]);
  const [tab, setTab] = useState<"posts" | "publish" | "connect">("posts");
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(
    () => typeof window !== "undefined" && getActiveJournalistId() === id
  );

  const isDeskActive = isActive && !!currentUser;
  const activeTab = currentUser ? tab : "posts";

  const [postForm, setPostForm] = useState({
    type: "blog" as PostType,
    title: "",
    body: "",
    mediaUrl: "",
    tags: "",
  });
  const [sourceForm, setSourceForm] = useState({
    platform: "website" as ConnectedPlatform,
    label: "",
    url: "",
  });
  const [socialForm, setSocialForm] = useState({
    website: "",
    youtube: "",
    tiktok: "",
    twitter: "",
    instagram: "",
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/journalists/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setJournalist(data.journalist);
    setPosts(data.posts || []);
    setSources(data.sources || []);
    setSocialForm({
      website: data.journalist.social?.website || "",
      youtube: data.journalist.social?.youtube || "",
      tiktok: data.journalist.social?.tiktok || "",
      twitter: data.journalist.social?.twitter || "",
      instagram: data.journalist.social?.instagram || "",
    });
  }, [id]);

  useEffect(() => {
    let ignore = false;
    fetch(`/api/journalists/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (ignore || !data) return;
        setJournalist(data.journalist);
        setPosts(data.posts || []);
        setSources(data.sources || []);
        setSocialForm({
          website: data.journalist.social?.website || "",
          youtube: data.journalist.social?.youtube || "",
          tiktok: data.journalist.social?.tiktok || "",
          twitter: data.journalist.social?.twitter || "",
          instagram: data.journalist.social?.instagram || "",
        });
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  function activateDesk() {
    if (!currentUser) {
      openAuth("login");
      return;
    }
    setActiveJournalistId(id);
    setIsActive(true);
  }

  async function saveSocial(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/journalists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ social: socialForm }),
      });
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function publishPost(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journalistId: id,
          type: postForm.type,
          title: postForm.title,
          body: postForm.body,
          mediaUrl: postForm.mediaUrl || undefined,
          tags: postForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setPostForm({ type: "blog", title: "", body: "", mediaUrl: "", tags: "" });
      setTab("posts");
      await load();
    } catch {
      alert("Could not publish post");
    } finally {
      setSaving(false);
    }
  }

  async function addSource(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journalistId: id,
          platform: sourceForm.platform,
          label: sourceForm.label || platformLabel(sourceForm.platform),
          url: sourceForm.url,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSourceForm({ platform: "website", label: "", url: "" });
      await load();
    } catch {
      alert("Could not connect source");
    } finally {
      setSaving(false);
    }
  }

  async function removeSource(sourceId: string) {
    await fetch(`/api/sources?id=${sourceId}`, { method: "DELETE" });
    await load();
  }

  if (!journalist) {
    return (
      <main>
        <Header title="Desk" subtitle="Loading…" />
        <div className="mx-auto max-w-6xl p-8 text-center text-[var(--text-muted)]">
          Loading journalist desk…
        </div>
      </main>
    );
  }

  return (
    <main>
      <Header title={journalist.displayName} subtitle="Journalist Desk" />

      <section className="mx-auto max-w-6xl px-4 py-6">
        <Link
          href="/journalists"
          className="mb-4 inline-block text-xs font-bold tracking-widest text-[var(--accent)] uppercase"
        >
          ← All journalists
        </Link>

        <div className="brand-hero-panel overflow-hidden rounded-3xl glass-strong p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-[var(--gold)]/40 brand-logo-glow">
              <Image
                src={journalist.avatarUrl}
                alt={journalist.displayName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold">{journalist.displayName}</h2>
                {journalist.verified && (
                  <span className="chip chip-rss">Verified</span>
                )}
                <span className="chip">{journalist.beat}</span>
              </div>
              <p className="text-sm text-[var(--accent-dim)]">{journalist.handle}</p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{journalist.bio}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {journalist.social.website && (
                  <a href={journalist.social.website} target="_blank" rel="noopener noreferrer" className="chip chip-rss">
                    Website
                  </a>
                )}
                {journalist.social.tiktok && (
                  <a href={journalist.social.tiktok} target="_blank" rel="noopener noreferrer" className="chip">
                    TikTok
                  </a>
                )}
                {journalist.social.youtube && (
                  <span className="chip chip-youtube">YouTube</span>
                )}
              </div>
            </div>
            <div>
              {!isDeskActive ? (
                <button type="button" onClick={activateDesk} className="btn-primary">
                  Manage as this journalist
                </button>
              ) : (
                <span className="chip chip-rss">✓ Active desk</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto scroll-hide pb-1">
          {(["posts", "publish", "connect"] as const)
            .filter((t) => currentUser || t === "posts")
            .map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wider ${
                  activeTab === t
                    ? "bg-[var(--accent)] text-white"
                    : "glass text-[var(--text-muted)]"
                }`}
              >
                {t === "posts" ? "My Posts" : t === "publish" ? "Publish" : "Connect Feeds"}
              </button>
            ))}
        </div>

        {activeTab === "posts" && (
          <div className="mt-6 space-y-4">
            {posts.length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">
                No posts yet. Switch to Publish to share blogs and videos.
              </p>
            )}
            {posts.map((post) => (
              <article key={post.id} className="rounded-2xl glass p-5 glow-border">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip">{post.type}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {timeAgo(post.publishedAt)}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-semibold">
                  <Link href={`/post/${post.id}`} className="hover:text-[var(--accent)]">
                    {post.title}
                  </Link>
                </h3>
                {post.body && (
                  <p className="mt-2 line-clamp-3 text-sm text-[var(--text-muted)]">
                    {post.body}
                  </p>
                )}
                {post.embedUrl && post.type === "video" && (
                  <div className="mt-4 aspect-video overflow-hidden rounded-xl">
                    <iframe
                      src={post.embedUrl}
                      title={post.title}
                      className="h-full w-full"
                      allowFullScreen
                    />
                  </div>
                )}
                <div className="mt-4">
                  <EngagementBar
                    targetType="post"
                    targetId={post.id}
                    onCommentClick={() =>
                      setExpandedPost(expandedPost === post.id ? null : post.id)
                    }
                  />
                </div>
                {expandedPost === post.id && (
                  <CommentSection targetType="post" targetId={post.id} />
                )}
              </article>
            ))}
          </div>
        )}

        {activeTab === "publish" && isDeskActive && (
          <form
            onSubmit={publishPost}
            className="mt-6 grid gap-4 rounded-2xl glass-strong p-6 md:grid-cols-2"
          >
            <h3 className="font-display md:col-span-2 text-sm font-bold tracking-widest text-[var(--gold)] uppercase">
              Publish content
            </h3>
            <div>
              <label className="mb-1 block text-[10px] font-bold text-[var(--text-muted)] uppercase">
                Type
              </label>
              <select
                value={postForm.type}
                onChange={(e) =>
                  setPostForm({ ...postForm, type: e.target.value as PostType })
                }
              >
                <option value="blog">Blog article</option>
                <option value="video">Video (YouTube / TikTok URL)</option>
                <option value="link">External link</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold text-[var(--text-muted)] uppercase">
                Tags (comma-separated)
              </label>
              <input
                value={postForm.tags}
                onChange={(e) => setPostForm({ ...postForm, tags: e.target.value })}
                placeholder="news, music, tech"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[10px] font-bold text-[var(--text-muted)] uppercase">
                Title
              </label>
              <input
                required
                value={postForm.title}
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[10px] font-bold text-[var(--text-muted)] uppercase">
                Body / description
              </label>
              <textarea
                rows={4}
                value={postForm.body}
                onChange={(e) => setPostForm({ ...postForm, body: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[10px] font-bold text-[var(--text-muted)] uppercase">
                Media URL (YouTube, TikTok, website article)
              </label>
              <input
                value={postForm.mediaUrl}
                onChange={(e) => setPostForm({ ...postForm, mediaUrl: e.target.value })}
                placeholder="https://www.tiktok.com/@you/video/…"
              />
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Publishing…" : "Publish"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "publish" && !isDeskActive && (
          <p className="mt-6 text-sm text-[var(--text-muted)]">
            Activate this desk to publish content.
          </p>
        )}

        {activeTab === "connect" && isDeskActive && (
          <div className="mt-6 space-y-6">
            <form onSubmit={saveSocial} className="grid gap-4 rounded-2xl glass p-6 md:grid-cols-2">
              <h3 className="font-display md:col-span-2 text-sm font-bold tracking-widest text-[var(--gold)] uppercase">
                Social profiles
              </h3>
              {(["website", "youtube", "tiktok", "twitter", "instagram"] as const).map(
                (key) => (
                  <div key={key}>
                    <label className="mb-1 block text-[10px] font-bold text-[var(--text-muted)] uppercase">
                      {platformLabel(key)}
                    </label>
                    <input
                      value={socialForm[key]}
                      onChange={(e) =>
                        setSocialForm({ ...socialForm, [key]: e.target.value })
                      }
                      placeholder={`https://…`}
                    />
                  </div>
                )
              )}
              <div className="md:col-span-2">
                <button type="submit" disabled={saving} className="btn-ghost">
                  Save profiles
                </button>
              </div>
            </form>

            <form onSubmit={addSource} className="grid gap-4 rounded-2xl glass p-6 md:grid-cols-2">
              <h3 className="font-display md:col-span-2 text-sm font-bold tracking-widest text-[var(--gold)] uppercase">
                Connect news feeds
              </h3>
              <p className="md:col-span-2 text-xs text-[var(--text-muted)]">
                Link your website RSS, TikTok profile, YouTube channel, or news homepage.
              </p>
              <div>
                <label className="mb-1 block text-[10px] font-bold text-[var(--text-muted)] uppercase">
                  Platform
                </label>
                <select
                  value={sourceForm.platform}
                  onChange={(e) =>
                    setSourceForm({
                      ...sourceForm,
                      platform: e.target.value as ConnectedPlatform,
                    })
                  }
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {platformLabel(p)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold text-[var(--text-muted)] uppercase">
                  Label
                </label>
                <input
                  value={sourceForm.label}
                  onChange={(e) => setSourceForm({ ...sourceForm, label: e.target.value })}
                  placeholder="My TikTok news"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-[10px] font-bold text-[var(--text-muted)] uppercase">
                  URL
                </label>
                <input
                  required
                  value={sourceForm.url}
                  onChange={(e) => setSourceForm({ ...sourceForm, url: e.target.value })}
                  placeholder="https://your-site.com/feed or TikTok profile URL"
                />
              </div>
              <div className="md:col-span-2">
                <button type="submit" disabled={saving} className="btn-primary">
                  Connect source
                </button>
              </div>
            </form>

            <ul className="space-y-2">
              {sources.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-xl glass p-4"
                >
                  <div>
                    <p className="font-semibold text-sm">{s.label}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {platformLabel(s.platform)} · {s.url}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSource(s.id)}
                    className="btn-ghost text-[10px] py-1"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "connect" && !isDeskActive && (
          <p className="mt-6 text-sm text-[var(--text-muted)]">
            Activate this desk to connect feeds and social accounts.
          </p>
        )}
      </section>
    </main>
  );
}
