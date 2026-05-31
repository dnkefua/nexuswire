"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import type { Journalist } from "@/lib/types";
import { useUser } from "@/context/UserContext";

export default function JournalistsPage() {
  const { currentUser, openAuth } = useUser();
  const [journalists, setJournalists] = useState<Journalist[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    handle: "",
    bio: "",
    beat: "World",
    avatarUrl: "",
    twitter: "",
    youtube: "",
    website: "",
    tiktok: "",
    instagram: "",
  });

  const load = useCallback(() => {
    fetch("/api/journalists")
      .then((r) => r.json())
      .then((d) => setJournalists(d.journalists || []));
  }, []);

  useEffect(() => {
    load();
  }, [load]);



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) {
      openAuth("login");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/journalists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName,
          handle: form.handle,
          bio: form.bio,
          beat: form.beat,
          avatarUrl: form.avatarUrl,
          social: {
            twitter: form.twitter || undefined,
            youtube: form.youtube || undefined,
            website: form.website || undefined,
            tiktok: form.tiktok || undefined,
            instagram: form.instagram || undefined,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      const data = await res.json();
      setForm({
        displayName: "",
        handle: "",
        bio: "",
        beat: "World",
        avatarUrl: "",
        twitter: "",
        youtube: "",
        website: "",
        tiktok: "",
        instagram: "",
      });
      setShowForm(false);
      load();
      if (data.journalist?.id) {
        window.location.href = `/journalists/${data.journalist.id}`;
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <Header title="News Desk" subtitle="Journalist Profiles" />

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--text-muted)]">
              Create your profile, publish blogs & videos, connect TikTok, website RSS, and
              more.
            </p>
            {!currentUser && (
              <p className="text-xs text-[var(--gold)] mt-1 font-semibold">
                ✦ Create an account or sign in to configure your news desk and publish stories.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              if (!currentUser) {
                openAuth("login");
              } else {
                setShowForm(!showForm);
              }
            }}
            className="btn-primary flex-shrink-0"
          >
            {showForm && currentUser ? "Cancel" : "+ New Profile"}
          </button>
        </div>

        {showForm && currentUser && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 grid gap-4 rounded-2xl glass-strong p-6 md:grid-cols-2"
          >
            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                Display Name
              </label>
              <input
                required
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="Jordan Ellis"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                Handle
              </label>
              <input
                required
                value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value })}
                placeholder="jellis"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                Bio
              </label>
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Your beat, experience, and on-air style…"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                Beat
              </label>
              <select
                value={form.beat}
                onChange={(e) => setForm({ ...form, beat: e.target.value })}
              >
                {[
                  "World",
                  "Technology",
                  "Business",
                  "Politics",
                  "Sports",
                  "Culture",
                  "Music",
                ].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                Avatar URL (optional)
              </label>
              <input
                value={form.avatarUrl}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                Website
              </label>
              <input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://yournews.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                TikTok
              </label>
              <input
                value={form.tiktok}
                onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                placeholder="https://www.tiktok.com/@you"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                YouTube
              </label>
              <input
                value={form.youtube}
                onChange={(e) => setForm({ ...form, youtube: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                Instagram
              </label>
              <input
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary w-full md:w-auto">
                {saving ? "Creating…" : "Create & Open Desk"}
              </button>
            </div>
          </form>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {journalists.map((j, i) => (
            <Link
              key={j.id}
              href={`/journalists/${j.id}`}
              className="fade-up block overflow-hidden rounded-2xl glass glow-border transition-transform hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="relative h-32 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--gold)]/10">
                <div className="absolute -bottom-8 left-4 h-20 w-20 overflow-hidden rounded-2xl border-2 border-[var(--gold)]/40 bg-black">
                  <Image
                    src={j.avatarUrl}
                    alt={j.displayName}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </div>
              </div>
              <div className="p-4 pt-12">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[var(--text-primary)]">{j.displayName}</h3>
                  {j.verified && (
                    <span className="text-[10px] text-[var(--gold)]">✓</span>
                  )}
                </div>
                <p className="text-xs text-[var(--accent-dim)]">{j.handle}</p>
                <span className="chip chip-rss mt-2 inline-block">{j.beat}</span>
                <p className="mt-3 line-clamp-2 text-sm text-[var(--text-muted)]">{j.bio}</p>
                <p className="mt-3 text-[10px] font-bold tracking-widest text-[var(--gold)] uppercase">
                  Open desk →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
