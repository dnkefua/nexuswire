import { Header } from "@/components/Header";
import { LiveTv } from "@/components/LiveTv";
import { BrandHero } from "@/components/BrandHero";
import { CountryStrip } from "@/components/CountryStrip";
import { NewsFeed } from "@/components/NewsFeed";

export default function HomePage() {
  return (
    <main>
      <Header />
      {/* Landing TV: live news player + clickable scrolling highlights */}
      <LiveTv />
      <BrandHero />
      <CountryStrip />
      <NewsFeed />
    </main>
  );
}
