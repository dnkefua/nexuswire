import type { Metadata } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Source Policy — NexusWire",
  description: "How NexusWire selects, curates, and manages its news sources.",
};

export default function SourcePolicyPage() {
  return (
    <main>
      <Header title="Source Policy" subtitle="How We Select Sources" />
      <section className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <div className="rounded-3xl glass-strong p-8 fade-up">
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-4">Source Selection</h2>
          <p className="text-[var(--text-muted)] leading-relaxed">
            NexusWire curates sources with a focus on trustworthiness, regional diversity, and editorial integrity. We prioritize established publishers with publicly available RSS feeds.
          </p>
        </div>

        {[
          {
            title: "Selection Criteria",
            points: [
              "The publisher maintains editorial standards and has a verifiable publishing history.",
              "The feed is publicly available (RSS/Atom/YouTube) without requiring authentication.",
              "The publisher has a public presence and contact information.",
              "The source covers categories relevant to our editorial mix: World, Technology, Business, Africa, and Live.",
            ],
          },
          {
            title: "Source Categories",
            points: [
              "World News — global affairs from major international outlets.",
              "Technology — tech journalism and innovation reporting.",
              "Business & Finance — economic and financial news.",
              "Africa — regional African news with emphasis on underrepresented voices.",
              "Cameroon — local Cameroonian news and francophone Africa.",
              "Diaspora — news relevant to African diaspora communities.",
              "Live — YouTube news channels with broadcast-quality video content.",
            ],
          },
          {
            title: "Regional Diversity",
            points: [
              "We actively curate sources from multiple regions: Americas, Europe, Middle East, Asia, and Africa.",
              "No single region or perspective dominates our default feed.",
              "Country of origin is clearly displayed on all source metadata.",
            ],
          },
          {
            title: "Publisher Attribution",
            points: [
              "Every article preview displays the publisher name prominently.",
              "We do not present third-party content as NexusWire original reporting.",
              "Publisher logos and brand identifiers are preserved where available.",
            ],
          },
          {
            title: "Source Removal",
            points: [
              "Sources that become unreliable, inactive, or consistently fail health checks may be deactivated.",
              "Sources spreading misinformation or whose editorial standards decline significantly may be removed.",
              "Publishers may request removal from NexusWire by contacting us at hello@nexuswire.app.",
            ],
          },
          {
            title: "Publisher Requests",
            points: [
              "Publishers can request attribution corrections, link updates, or source removal.",
              "Publishers wishing to be added to NexusWire can submit their RSS feed URL for review.",
              "All publisher requests are handled within 5 business days.",
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
      </section>
    </main>
  );
}
