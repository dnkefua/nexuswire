import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { aggregateNews, getSourceHealth } from "@/lib/rss";
import { listSourceHealth } from "@/lib/repositories/sources";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Source Management — NexusWire Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSourcesPage() {
  // Prefer the persisted health snapshot; otherwise warm the cache and read
  // the in-memory snapshot so the page is useful before the first ingestion.
  let sources = await listSourceHealth();
  if (sources.length === 0) {
    await aggregateNews({ limit: 1 });
    sources = getSourceHealth();
  }

  const healthy = sources.filter((s) => s.lastSuccessfulFetchAt).length;
  const failing = sources.filter((s) => s.lastError && !s.lastSuccessfulFetchAt).length;

  return (
    <main>
      <Header title="Source Management" subtitle="Feed Health Monitor" />
      <section className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Sources", value: sources.length, color: "var(--accent)" },
            { label: "Healthy", value: healthy, color: "var(--success)" },
            { label: "Failing", value: failing, color: "var(--danger)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl glass p-5 text-center">
              <p className="font-display text-3xl font-bold" style={{ color }}>{value}</p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl glass-strong overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                <th className="p-3">Source</th>
                <th className="p-3">Type</th>
                <th className="p-3">Region</th>
                <th className="p-3">Status</th>
                <th className="p-3">Articles</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => {
                const ok = !!s.lastSuccessfulFetchAt;
                return (
                  <tr key={s.id} className="border-b border-[var(--border)]/40">
                    <td className="p-3">
                      <span className="font-semibold text-[var(--text-primary)]">{s.name}</span>
                      {s.lastError && (
                        <p className="text-[10px] text-[var(--danger)] mt-0.5 line-clamp-1">{s.lastError}</p>
                      )}
                    </td>
                    <td className="p-3"><span className="chip">{s.type}</span></td>
                    <td className="p-3 text-[var(--text-muted)]">{s.region}</td>
                    <td className="p-3">
                      <span
                        className="chip"
                        style={ok
                          ? { background: "rgba(0,230,118,0.1)", color: "var(--success)", borderColor: "rgba(0,230,118,0.3)" }
                          : { background: "rgba(255,51,102,0.1)", color: "var(--danger)", borderColor: "rgba(255,51,102,0.3)" }
                        }
                      >
                        {ok ? "● Active" : "● Error"}
                      </span>
                    </td>
                    <td className="p-3 text-[var(--text-muted)]">{s.articlesFetched ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center text-xs text-[var(--text-muted)]">
          <Link href="/admin" className="hover:text-[var(--accent)]">← Back to admin</Link>
          <Link href="/source-policy" className="hover:text-[var(--accent)]">Source policy →</Link>
        </div>
      </section>
    </main>
  );
}
