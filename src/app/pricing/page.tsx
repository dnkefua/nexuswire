import type { Metadata } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Pricing — NexusWire",
  description: "NexusWire plans — Free, Pro, and Newsroom. Premium news intelligence for every audience.",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Discover trusted global news from hundreds of sources.",
    features: [
      { label: "Global headlines feed", available: true },
      { label: "Source-attributed previews", available: true },
      { label: "Live video hub", available: true },
      { label: "Save articles locally", available: true },
      { label: "Journalist desks & posts", available: true },
      { label: "Community comments", available: true },
      { label: "Personalized briefing", available: false },
      { label: "Saved articles sync", available: false },
      { label: "Topic alerts", available: false },
      { label: "Advanced search & filters", available: false },
    ],
    cta: "Get Started Free",
    ctaHref: "/",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/ month",
    description: "Deeper intelligence, personalized for how you consume news.",
    badge: "Coming Soon",
    features: [
      { label: "Everything in Free", available: true },
      { label: "Personalized briefing", available: true },
      { label: "Saved articles cloud sync", available: true },
      { label: "Topic & keyword alerts", available: true },
      { label: "Advanced search & date filters", available: true },
      { label: "Regional intelligence feeds", available: true },
      { label: "Ad-free experience", available: true },
      { label: "Team dashboards", available: false },
      { label: "API access", available: false },
      { label: "Custom briefings", available: false },
    ],
    cta: "Coming Soon",
    ctaHref: "/contact",
    highlight: true,
  },
  {
    name: "Newsroom",
    price: "Custom",
    period: "",
    description: "Enterprise-grade news intelligence for media teams and organizations.",
    badge: "Coming Soon",
    features: [
      { label: "Everything in Pro", available: true },
      { label: "Team dashboards", available: true },
      { label: "Source monitoring", available: true },
      { label: "Curated intelligence feed", available: true },
      { label: "API & widget access", available: true },
      { label: "Custom briefings", available: true },
      { label: "Priority support", available: true },
      { label: "White-label options", available: true },
      { label: "SLA guarantees", available: true },
      { label: "Dedicated account manager", available: true },
    ],
    cta: "Contact Us",
    ctaHref: "/contact",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <main>
      <Header title="Pricing" subtitle="Choose Your Plan" />
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="text-center mb-10 fade-up">
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-3">
            <span className="brand-nexus">Premium</span>{" "}
            <span className="brand-wire">News Intelligence</span>
          </h2>
          <p className="text-[var(--text-muted)] max-w-lg mx-auto">
            NexusWire aggregates trusted global news and helps you discover what matters. Start free, upgrade when you&apos;re ready.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-6 flex flex-col space-y-5 fade-up ${
                plan.highlight
                  ? "glass-strong ring-1 ring-[var(--accent)]/40"
                  : "glass"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                    {plan.name}
                  </span>
                  {plan.badge && (
                    <span className="chip" style={{ background: "rgba(212,168,83,0.12)", color: "var(--gold)", borderColor: "rgba(212,168,83,0.35)" }}>
                      {plan.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-display text-3xl font-bold text-[var(--text-primary)]">{plan.price}</span>
                  {plan.period && <span className="text-sm text-[var(--text-muted)]">{plan.period}</span>}
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-snug">{plan.description}</p>
              </div>

              <ul className="space-y-2 flex-1">
                {plan.features.map(({ label, available }) => (
                  <li key={label} className={`flex gap-2 text-sm ${available ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]/50"}`}>
                    <span className={available ? "text-[var(--success)]" : "text-[var(--text-muted)]/30"}>
                      {available ? "✓" : "–"}
                    </span>
                    {label}
                  </li>
                ))}
              </ul>

              <a
                href={plan.ctaHref}
                className={plan.highlight ? "btn-primary text-center" : "btn-ghost text-center"}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl glass p-6 text-center space-y-3">
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-[var(--accent)]">All plans include</h3>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-[var(--text-muted)]">
            {[
              "Source transparency",
              "Publisher attribution",
              "No full-article scraping",
              "YouTube official embeds",
              "Ethical aggregation",
              "GDPR-aware",
            ].map((f) => (
              <span key={f} className="chip">✓ {f}</span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
