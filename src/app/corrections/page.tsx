import type { Metadata } from "next";
import { Header } from "@/components/Header";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Corrections — NexusWire",
  description: "How to report inaccurate summaries or broken attribution on NexusWire.",
};

export default function CorrectionsPage() {
  return (
    <main>
      <Header title="Corrections" subtitle="Accuracy & Accountability" />
      <section className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <div className="rounded-3xl glass-strong p-8 fade-up space-y-4">
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Our Corrections Policy</h2>
          <p className="text-[var(--text-muted)] leading-relaxed">
            NexusWire is committed to accurate source attribution. If you find an error in our metadata, a broken source link, or an incorrectly attributed story, please let us know.
          </p>
        </div>

        {[
          {
            title: "What You Can Report",
            points: [
              "Incorrect publisher attribution (wrong source name or link).",
              "Broken or missing original article links.",
              "Misleading or inaccurate RSS summary content.",
              "Duplicate stories incorrectly attributed to different sources.",
              "Factual errors in NexusWire-generated metadata.",
            ],
          },
          {
            title: "What Falls Outside Our Scope",
            points: [
              "Corrections to the original article's content — please contact the original publisher directly.",
              "Opinion or editorial disputes with original publisher content.",
              "YouTube video content disputes — please use YouTube's reporting tools.",
            ],
          },
          {
            title: "How We Handle Corrections",
            points: [
              "Metadata corrections (broken links, attribution updates) are addressed within 48 hours.",
              "Previews may be removed if a publisher requests takedown.",
              "We do not issue editorial corrections on behalf of original publishers.",
              "Confirmed corrections are applied silently — we do not issue public correction notices for metadata fixes.",
            ],
          },
        ].map(({ title, points }) => (
          <div key={title} className="rounded-2xl glass p-6 space-y-3">
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-[var(--accent)]">{title}</h3>
            <ul className="space-y-2">
              {points.map((p) => (
                <li key={p} className="flex gap-3 text-sm text-[var(--text-muted)]">
                  <span className="text-[var(--accent)] flex-shrink-0">◈</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="rounded-2xl glass p-6 text-center space-y-4">
          <p className="text-sm text-[var(--text-muted)]">Found an error? Report it directly from any article page, or contact us below.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/report" className="btn-primary">
              Report an Issue
            </Link>
            <Link href="/contact" className="btn-ghost">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
