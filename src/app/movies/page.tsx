import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { MovieWatchRoom } from "@/components/MovieWatchRoom";

export const metadata: Metadata = {
  title: "Free Movies | NexusWire",
  description:
    "Watch curated free-to-watch, public-domain, and rights-cleared movies inside NexusWire.",
};

export default function FreeMoviesPage() {
  return (
    <main>
      <Header title="Free Movies" subtitle="In-App Cinema" />
      <MovieWatchRoom />
    </main>
  );
}
