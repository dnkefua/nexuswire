"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import Link from "next/link";

const REASONS = [
  "Copyright concern",
  "Incorrect attribution",
  "Broken source link",
  "Misleading summary",
  "Spam or abuse",
  "Other",
] as const;

type Reason = (typeof REASONS)[number];

function ReportForm() {
  const params = useSearchParams();
  const [url, setUrl] = useState(params.get("url") ? decodeURIComponent(params.get("url")!) : "");
  const [title, setTitle] = useState(params.get("title") ? decodeURIComponent(params.get("title")!) : "");
  const [source, setSource] = useState(params.get("source") ? decodeURIComponent(params.get("source")!) : "");
  const [reason, setReason] = useState<Reason>("Other");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, title, source, reason, email: email || undefined, details }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error || "Failed to submit report");
      }
      setStatus("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl glass-strong p-10 text-center space-y-4 fade-up">
        <div className="text-4xl">✓</div>
        <h2 className="font-display text-xl font-bold text-[var(--success)]">Report Received</h2>
        <p className="text-[var(--text-muted)]">Thank you. We&apos;ll review your report within 5 business days.</p>
        <Link href="/" className="btn-primary inline-block mt-4">Back to Wire</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl glass-strong p-8 space-y-6 fade-up">
      <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">Report Content Issue</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Content URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Content Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article or video title"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Source / Publisher</label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. BBC World"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Report Reason *</label>
          <div className="flex flex-wrap gap-2">
            {REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`chip cursor-pointer transition-all ${reason === r ? "chip-rss" : ""}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Your Email (optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="For follow-up (not required)"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Details</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Please describe the issue in detail..."
            rows={4}
          />
        </div>
      </div>

      {status === "error" && (
        <p className="text-sm text-[var(--danger)]">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full"
      >
        {status === "loading" ? "Submitting..." : "Submit Report"}
      </button>

      <p className="text-xs text-[var(--text-muted)] text-center">
        Reports are reviewed within 5 business days. See our{" "}
        <Link href="/corrections" className="text-[var(--accent)] hover:underline">corrections policy</Link>.
      </p>
    </form>
  );
}

export default function ReportPage() {
  return (
    <main>
      <Header title="Report Issue" subtitle="Help Us Improve" />
      <section className="mx-auto max-w-2xl px-4 py-10">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl glass" />}>
          <ReportForm />
        </Suspense>
      </section>
    </main>
  );
}
