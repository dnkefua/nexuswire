import { BrandHero } from "@/components/BrandHero";
import { Header } from "@/components/Header";
import { NewsFeed } from "@/components/NewsFeed";

export default function HomePage() {
  return (
    <main>
      <Header />
      <BrandHero />
      <NewsFeed />
    </main>
  );
}
