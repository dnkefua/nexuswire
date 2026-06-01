"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { FilteredFeed } from "@/components/FilteredFeed";
import { slugToCategory } from "@/lib/taxonomy";
import Link from "next/link";

export default function TopicPage() {
  const params = useParams<{ topic: string }>();
  const category = slugToCategory(params.topic);

  if (!category) {
    return (
      <main>
        <Header title="Topic" subtitle="Not Found" />
        <div className="mx-auto max-w-3xl px-4 py-12 text-center text-[var(--text-muted)]">
          <p>Unknown topic.</p>
          <Link href="/" className="btn-primary inline-block mt-4">Back to Wire</Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Header title={category} subtitle="Topic Stream" />
      <section className="mx-auto max-w-6xl px-4 py-6">
        <FilteredFeed
          query={`category=${encodeURIComponent(category)}`}
          emptyText={`No ${category} stories right now. Check back shortly.`}
        />
      </section>
    </main>
  );
}
