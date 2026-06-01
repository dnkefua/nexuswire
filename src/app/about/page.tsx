import type { Metadata } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "About — NexusWire",
  description: "NexusWire is a premium news aggregation and discovery platform. Learn more about our mission and approach.",
};

export default function AboutPage() {
  return (
    <main>
      <Header title="About" subtitle="Our Mission" />
      <section className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <div className="rounded-3xl glass-strong p-8 fade-up">
          <h2 className="font-display text-2xl font-bold glow-text mb-4">
            <span className="brand-nexus">Nexus</span><span className="brand-wire">Wire</span>
          </h2>
          <p className="text-[var(--text-muted)] leading-relaxed mb-4">
            NexusWire is a premium news aggregation and discovery platform. We bring together trusted global headlines from RSS feeds, renowned blogs, and YouTube channels into one fast, elegant experience.
          </p>
          <p className="text-[var(--text-muted)] leading-relaxed mb-4">
            We believe news should be accessible, transparent, and attributed properly. Every story on NexusWire is a source-attributed preview — we link directly to the original publisher so you can read the full story and support the journalists who wrote it.
          </p>
          <p className="text-[var(--text-muted)] leading-relaxed">
            NexusWire does not claim ownership of any third-party publisher content. We are a discovery layer — helping you find trusted reporting from around the world.
          </p>
        </div>

        <div className="rounded-2xl glass p-6 space-y-4">
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-[var(--accent)]">What We Do</h3>
          <ul className="space-y-3 text-sm text-[var(--text-muted)]">
            {[
              "Aggregate publicly available headlines from trusted publishers worldwide.",
              "Display short, source-attributed summaries — never full articles without permission.",
              "Send users to the original publisher for the complete story.",
              "Feature live YouTube news broadcasts from major channels.",
              "Provide journalist profiles and community engagement tools.",
              "Support regional diversity with African, Middle Eastern, European, and global sources.",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-[var(--accent)] flex-shrink-0">◈</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl glass p-6">
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-[var(--accent)] mb-4">Our Principles</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {[
              { title: "Transparency", body: "We show you where every story comes from and link back to the source." },
              { title: "Attribution", body: "Publishers retain full ownership and credit for their content." },
              { title: "Ethics", body: "We do not scrape, bypass paywalls, or misrepresent third-party content." },
              { title: "Diversity", body: "We curate sources across regions, languages, and perspectives." },
            ].map(({ title, body }) => (
              <div key={title} className="rounded-xl border border-[var(--border)] p-4">
                <p className="font-bold text-[var(--text-primary)] mb-1">{title}</p>
                <p className="text-[var(--text-muted)]">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl glass p-6 text-sm text-[var(--text-muted)]">
          <p>Questions? Reach us at <a href="mailto:hello@nexuswire.app" className="text-[var(--accent)] hover:underline">hello@nexuswire.app</a></p>
        </div>
      </section>
    </main>
  );
}
