"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Header } from "@/components/Header";
import type { Broadcast, Journalist } from "@/lib/types";

export default function StudioPage() {
  const [journalists, setJournalists] = useState<Journalist[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    journalistId: "",
    title: "",
    description: "",
    scheduledAt: "",
    durationMinutes: 30,
    category: "News",
    streamUrl: "",
  });

  const load = useCallback(() => {
    Promise.all([
      fetch("/api/journalists").then((r) => r.json()),
      fetch("/api/broadcasts").then((r) => r.json()),
    ]).then(([j, b]) => {
      const list = j.journalists || [];
      setJournalists(list);
      setBroadcasts(b.broadcasts || []);
      setForm((f) =>
        list.length && !f.journalistId ? { ...f, journalistId: list[0].id } : f
      );
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      setForm((f) => ({
        ...f,
        title: "",
        description: "",
        streamUrl: "",
      }));
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to schedule");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(id: string, status: Broadcast["status"]) {
    await fetch("/api/broadcasts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  const journalistMap = Object.fromEntries(journalists.map((j) => [j.id, j]));

  return (
    <main>
      <Header title="Broadcast Studio" subtitle="Schedule & Go Live" />

      <section className="mx-auto max-w-6xl px-4 py-6">
        {journalists.length === 0 ? (
          <div className="mb-8 rounded-2xl glass p-6 text-center">
            <p className="text-[var(--text-muted)]">
              Create a journalist profile first on the Desk tab.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mb-10 grid gap-4 rounded-2xl glass-strong p-6 md:grid-cols-2"
          >
            <h2 className="font-display md:col-span-2 text-sm font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
              Schedule Broadcast
            </h2>
            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                Journalist
              </label>
              <select
                required
                value={form.journalistId}
                onChange={(e) => setForm({ ...form, journalistId: e.target.value })}
              >
                {journalists.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {["News", "Breaking", "Analysis", "Interview", "Sports"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                Show Title
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Evening Wire: Middle East Update"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                Description
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                Air Time
              </label>
              <input
                type="datetime-local"
                required
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                Duration (min)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm({ ...form, durationMinutes: Number(e.target.value) })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                Stream URL (YouTube Live, etc.)
              </label>
              <input
                value={form.streamUrl}
                onChange={(e) => setForm({ ...form, streamUrl: e.target.value })}
                placeholder="https://youtube.com/live/…"
              />
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Scheduling…" : "Schedule Broadcast"}
              </button>
            </div>
          </form>
        )}

        <h3 className="font-display mb-4 text-sm font-bold tracking-[0.15em] text-[var(--accent)] uppercase">
          Upcoming & Past
        </h3>
        {broadcasts.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No broadcasts scheduled yet.</p>
        ) : (
          <ul className="space-y-3">
            {broadcasts.map((b) => {
              const j = journalistMap[b.journalistId];
              return (
                <li
                  key={b.id}
                  className="flex flex-col gap-3 rounded-xl glass p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`chip ${
                          b.status === "live"
                            ? "chip-live"
                            : b.status === "scheduled"
                              ? "chip-rss"
                              : ""
                        }`}
                      >
                        {b.status}
                      </span>
                      <span className="chip">{b.category}</span>
                    </div>
                    <h4 className="mt-2 font-semibold">{b.title}</h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      {j?.displayName || "Unknown"} ·{" "}
                      {format(new Date(b.scheduledAt), "MMM d, yyyy · h:mm a")} ·{" "}
                      {b.durationMinutes} min
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {b.status === "scheduled" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setStatus(b.id, "live")}
                          className="btn-primary text-[10px] py-2"
                        >
                          Go Live
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(b.id, "cancelled")}
                          className="btn-ghost text-[10px] py-2"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {b.status === "live" && (
                      <button
                        type="button"
                        onClick={() => setStatus(b.id, "completed")}
                        className="btn-ghost text-[10px] py-2"
                      >
                        End Show
                      </button>
                    )}
                    {b.streamUrl && (
                      <a
                        href={b.streamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost text-[10px] py-2"
                      >
                        Open Stream
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
