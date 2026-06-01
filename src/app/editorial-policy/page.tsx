import type { Metadata } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Editorial Policy — NexusWire",
  description: "NexusWire's editorial standards, aggregation rules, and content attribution policy.",
};

export default function EditorialPolicyPage() {
  return (
    <main>
      <Header title="Editorial Policy" subtitle="Standards & Attribution" />
      <section className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <div className="rounded-3xl glass-strong p-8 fade-up space-y-4">
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Our Editorial Standards</h2>
          <p className="text-[var(--text-muted)] leading-relaxed">
            NexusWire is a news aggregation and discovery platform. We do not produce original news reporting. Instead, we surface headlines, summaries, and previews from established third-party publishers.
          </p>
        </div>

        {[
          {
            title: "Source Attribution",
            points: [
              "All content is clearly attributed to its original publisher.",
              "Original publishers retain full ownership of their articles and media.",
              "We display the publisher name, source type, and a direct link to the original article on every preview.",
              "NexusWire preview pages are clearly labeled as previews, not original reporting.",
            ],
          },
          {
            title: "What We Aggregate",
            points: [
              "Publicly available RSS feeds from established news organizations.",
              "Blog feeds from reputable technology and industry publications.",
              "YouTube video content from verified news channels using official YouTube embed URLs.",
              "We do not aggregate paywalled content, private feeds, or content from unverified sources.",
            ],
          },
          {
            title: "AI Summaries",
            points: [
              "If AI-generated summaries are ever added, they will be clearly labeled as 'AI Summary'.",
              "AI summaries are derived only from the feed excerpt provided — never from full articles.",
              "NexusWire does not scrape full article bodies from publisher websites.",
            ],
          },
          {
            title: "Community Content",
            points: [
              "Comments represent community opinions, not NexusWire editorial positions.",
              "NexusWire moderates comments for spam, abuse, and violations of our Terms of Use.",
              "Users are responsible for the accuracy of comments they post.",
            ],
          },
          {
            title: "Corrections",
            points: [
              "We correct metadata errors (incorrect source attribution, broken links) promptly.",
              "Corrections to original article content belong to the original publisher.",
              "Publishers may request attribution updates, link corrections, or preview removal via our contact page.",
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

        <p className="text-sm text-[var(--text-muted)] px-2">
          Last updated: June 2025. Questions? <a href="mailto:hello@nexuswire.app" className="text-[var(--accent)] hover:underline">hello@nexuswire.app</a>
        </p>
      </section>
    </main>
  );
}
