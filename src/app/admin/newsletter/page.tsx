"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import Link from "next/link";

interface Draft {
  title: string;
  generatedAt: string;
  storyCount: number;
  clusterCount: number;
  markdown: string;
}

export default function AdminNewsletterPage() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/draft");
      const d = (await res.json()) as Draft;
      setDraft(d);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!draft) return;
    await navigator.clipboard.writeText(draft.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main>
      <Header title="Newsletter Draft" subtitle="Daily Briefing Generator" />
      <section className="mx-auto max-w-3xl px-4 py-8 space-y-5">
        <div className="rounded-2xl glass-strong p-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">Generate Newsletter</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Builds a source-attributed markdown draft from today&apos;s top stories and clusters.
            </p>
          </div>
          <button type="button" onClick={generate} disabled={loading} className="btn-primary whitespace-nowrap">
            {loading ? "Generating…" : "✦ Generate"}
          </button>
        </div>

        {draft && (
          <div className="rounded-2xl glass p-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--text-muted)]">
                {draft.storyCount} stories · {draft.clusterCount} clusters
              </p>
              <button type="button" onClick={copy} className="btn-ghost text-xs">
                {copied ? "Copied!" : "⧉ Copy markdown"}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-xs text-[var(--text-primary)] bg-black/30 rounded-xl p-4 max-h-[480px] overflow-auto border border-[var(--border)]">
              {draft.markdown}
            </pre>
          </div>
        )}

        <Link href="/admin" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)]">← Back to admin</Link>
      </section>
    </main>
  );
}
