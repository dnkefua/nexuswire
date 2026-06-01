import type { Metadata } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "DMCA & Copyright — NexusWire",
  description: "NexusWire's DMCA takedown request process and copyright policy.",
};

export default function DmcaPage() {
  return (
    <main>
      <Header title="DMCA & Copyright" subtitle="Takedown Requests" />
      <section className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <div className="rounded-3xl glass-strong p-8 fade-up space-y-4">
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Copyright Policy</h2>
          <p className="text-[var(--text-muted)] leading-relaxed">
            NexusWire respects intellectual property rights. We display only source-attributed previews and short excerpts from publicly available RSS feeds. Full article content belongs to original publishers.
          </p>
          <p className="text-[var(--text-muted)] leading-relaxed">
            If you are a copyright holder and believe content on NexusWire infringes your rights, please submit a takedown request as described below.
          </p>
        </div>

        <div className="rounded-2xl glass p-6 space-y-3">
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Required Information</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">Your DMCA notice must include:</p>
          <ol className="space-y-3 text-sm text-[var(--text-muted)]">
            {[
              "Your full name, address, phone number, and email address.",
              "A description of the copyrighted work you claim has been infringed.",
              "The specific URL(s) on NexusWire where the allegedly infringing content appears.",
              "A statement that you have a good-faith belief the use is not authorized by the copyright owner, its agent, or law.",
              "A statement, under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act on their behalf.",
              "Your electronic or physical signature.",
            ].map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-[var(--accent)] flex-shrink-0 font-bold">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl glass p-6 space-y-4">
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-[var(--accent)]">How to Submit</h3>
          <p className="text-sm text-[var(--text-muted)]">
            Send your DMCA notice by email to:
          </p>
          <a href="mailto:hello@nexuswire.app" className="inline-block text-[var(--accent)] font-bold text-sm hover:underline">
            hello@nexuswire.app
          </a>
          <p className="text-sm text-[var(--text-muted)]">
            Please use the subject line: <span className="font-semibold text-[var(--text-primary)]">&ldquo;DMCA Takedown Request&rdquo;</span>
          </p>
        </div>

        <div className="rounded-2xl glass p-6 space-y-3">
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Our Response Process</h3>
          <ul className="space-y-2 text-sm text-[var(--text-muted)]">
            {[
              "We review all DMCA notices within 5 business days.",
              "Valid notices result in removal of the infringing preview or source deactivation.",
              "We may contact you for additional information if needed.",
              "Counter-notifications from affected parties are handled in accordance with the DMCA.",
            ].map((p) => (
              <li key={p} className="flex gap-3">
                <span className="text-[var(--accent)] flex-shrink-0">◈</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-[var(--border)] p-4 text-xs text-[var(--text-muted)]">
          NexusWire acts in good faith to respect publisher rights. Our platform is designed to send traffic to original publishers, not to replace or compete with them.
        </div>
      </section>
    </main>
  );
}
