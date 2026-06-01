import { NextResponse } from "next/server";
import { aggregateNews } from "@/lib/rss";
import { clusterStories } from "@/lib/clustering";

export const dynamic = "force-dynamic";

/**
 * Generates a newsletter draft from aggregated, source-attributed articles.
 * Output is plain markdown with attribution + links preserved — never full
 * article text. AI rewriting can be layered on later via /lib/ai.ts.
 */
export async function GET() {
  try {
    const all = await aggregateNews({ limit: 120 });
    const today = new Date().toLocaleDateString(undefined, {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    const top = all.slice(0, 8);
    const clusters = clusterStories(all).slice(0, 3);

    const lines: string[] = [];
    lines.push(`# NexusWire — Africa Daily Briefing`);
    lines.push(`### ${today}`);
    lines.push("");
    lines.push(`> Source-attributed previews. Full stories belong to the original publishers.`);
    lines.push("");
    lines.push(`## Top Stories`);
    top.forEach((a, i) => {
      lines.push(`${i + 1}. **${a.title}** — _${a.source}_`);
      if (a.summary) lines.push(`   ${a.summary.slice(0, 160)}`);
      lines.push(`   ${a.link}`);
      lines.push("");
    });

    if (clusters.length) {
      lines.push(`## Multiple Sources Covering`);
      clusters.forEach((c) => {
        lines.push(`- **${c.title}** — covered by ${c.sources.join(", ")}`);
      });
      lines.push("");
    }

    lines.push(`---`);
    lines.push(`_Curated by NexusWire — Premium African News Network._`);

    const markdown = lines.join("\n");

    return NextResponse.json({
      title: `NexusWire Africa Daily — ${today}`,
      generatedAt: new Date().toISOString(),
      storyCount: top.length,
      clusterCount: clusters.length,
      markdown,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to generate draft";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
