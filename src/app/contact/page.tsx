import type { Metadata } from "next";
import { Header } from "@/components/Header";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact — NexusWire",
  description: "Get in touch with NexusWire for general inquiries, source requests, corrections, and partnerships.",
};

const contacts = [
  {
    title: "General Inquiries",
    description: "Questions about NexusWire, feature requests, or general feedback.",
    email: "hello@nexuswire.app",
    icon: "◈",
  },
  {
    title: "Publisher & Source Requests",
    description: "Request to add your publication, correct attribution, or remove your feed.",
    email: "hello@nexuswire.app",
    icon: "◇",
    subject: "Publisher Request",
  },
  {
    title: "Corrections",
    description: "Report inaccurate summaries, broken links, or incorrect attribution.",
    email: "hello@nexuswire.app",
    icon: "⚑",
    subject: "Correction Request",
    link: { label: "Use our report form", href: "/report" },
  },
  {
    title: "DMCA & Copyright",
    description: "Copyright takedown requests must include all required DMCA information.",
    email: "hello@nexuswire.app",
    icon: "⊛",
    subject: "DMCA Takedown Request",
    link: { label: "Read DMCA policy", href: "/dmca" },
  },
  {
    title: "Partnership & Business",
    description: "B2B inquiries, newsroom integrations, API access, and advertising.",
    email: "hello@nexuswire.app",
    icon: "▣",
    subject: "Partnership Inquiry",
  },
];

export default function ContactPage() {
  return (
    <main>
      <Header title="Contact" subtitle="Get in Touch" />
      <section className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <div className="rounded-3xl glass-strong p-8 fade-up">
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-3">Contact NexusWire</h2>
          <p className="text-[var(--text-muted)] leading-relaxed">
            We&apos;re a small team with a big vision. Reach out for any of the topics below and we&apos;ll respond within 3–5 business days.
          </p>
        </div>

        <div className="space-y-4">
          {contacts.map(({ title, description, email, icon, subject, link }) => {
            const mailtoHref = subject
              ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
              : `mailto:${email}`;
            return (
              <div key={title} className="rounded-2xl glass p-6">
                <div className="flex items-start gap-4">
                  <span className="text-2xl text-[var(--accent)] mt-0.5 font-display">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[var(--text-primary)] text-sm mb-1">{title}</h3>
                    <p className="text-sm text-[var(--text-muted)] mb-3">{description}</p>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={mailtoHref}
                        className="inline-flex items-center gap-1.5 text-[var(--accent)] text-sm font-medium hover:underline"
                      >
                        ✉ {email}
                      </a>
                      {link && (
                        <Link
                          href={link.href}
                          className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                        >
                          → {link.label}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-[var(--border)] p-4 text-center text-xs text-[var(--text-muted)]">
          Response time: 3–5 business days. For urgent DMCA notices, please include &ldquo;URGENT&rdquo; in the subject line.
        </div>
      </section>
    </main>
  );
}
