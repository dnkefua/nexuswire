import { BrandHero } from "@/components/BrandHero";
import { Header } from "@/components/Header";
import { CountryStrip } from "@/components/CountryStrip";
import { NewsFeed } from "@/components/NewsFeed";

export default function HomePage() {
  return (
    <main>
      <Header />
      <BrandHero />
      <CountryStrip />
      <NewsFeed />
    </main>
  );
}
