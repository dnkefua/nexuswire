import type { Metadata } from "next";
import { Header } from "@/components/Header";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin — NexusWire",
  robots: { index: false, follow: false },
};

const sections = [
  {
    title: "Source Health",
    description: "Monitor active feeds, fetch status, and error rates.",
    href: "/admin/sources",
    icon: "◈",
    status: "live",
  },
  {
    title: "Article Review",
    description: "Review the ingestion queue and article status.",
    href: "/admin/articles",
    icon: "▤",
    status: "live",
  },
  {
    title: "Story Clusters",
    description: "Inspect multi-source coverage and duplicate groups.",
    href: "/admin/clusters",
    icon: "◈",
    status: "live",
  },
  {
    title: "Video News",
    description: "Trusted YouTube channel feeds.",
    href: "/admin/videos",
    icon: "▶",
    status: "live",
  },
  {
    title: "Newsletter Draft",
    description: "Generate a source-attributed daily briefing draft.",
    href: "/admin/newsletter",
    icon: "✉",
    status: "live",
  },
  {
    title: "Reports",
    description: "Review content reports (requires Firestore).",
    href: "/report",
    icon: "⚑",
    status: "coming-soon",
  },
];

export default function AdminPage() {
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) ?? [];

  return (
    <main>
      <Header title="Admin" subtitle="NexusWire Control Panel" />
      <section className="mx-auto max-w-4xl px-4 py-10 space-y-6">
        <div className="rounded-3xl glass-strong p-6 fade-up">
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-2">Dashboard</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Admin access is restricted to authorized email addresses.
            {adminEmails.length > 0 ? ` Configured for ${adminEmails.length} admin(s).` : " Configure ADMIN_EMAILS in your environment."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map(({ title, description, href, icon, status }) => (
            <div key={title} className="rounded-2xl glass p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-display text-xl text-[var(--accent)]">{icon}</span>
                  <h3 className="font-bold text-[var(--text-primary)]">{title}</h3>
                </div>
                {status === "coming-soon" ? (
                  <span className="chip" style={{ background: "rgba(212,168,83,0.12)", color: "var(--gold)", borderColor: "rgba(212,168,83,0.35)" }}>
                    Soon
                  </span>
                ) : (
                  <span className="chip" style={{ background: "rgba(0,230,118,0.1)", color: "var(--success)", borderColor: "rgba(0,230,118,0.3)" }}>
                    Live
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--text-muted)]">{description}</p>
              <Link href={href} className="btn-ghost text-xs inline-block">
                Open →
              </Link>
            </div>
          ))}
        </div>

        <div className="rounded-2xl glass p-5 space-y-3">
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Quick Links</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Home Feed", href: "/" },
              { label: "Live Hub", href: "/live" },
              { label: "Editorial Policy", href: "/editorial-policy" },
              { label: "Source Policy", href: "/source-policy" },
              { label: "Reports", href: "/report" },
              { label: "Contact", href: "/contact" },
            ].map(({ label, href }) => (
              <Link key={href} href={href} className="chip hover:chip-rss transition-all cursor-pointer">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
