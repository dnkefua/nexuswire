import type { Metadata } from "next";
import { Exo_2, Orbitron } from "next/font/google";
import { ConnectStatus } from "@/components/ConnectStatus";
import { GlobalSearch } from "@/components/GlobalSearch";
import { LogoIntro } from "@/components/LogoIntro";
import { Nav } from "@/components/Nav";
import { SearchShortcut } from "@/components/SearchShortcut";
import { SearchProvider } from "@/context/SearchContext";
import "./globals.css";

const exo = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "NexusWire — Premium Futuristic News",
  description:
    "Professional news aggregation with journalist profiles, broadcast scheduling, RSS blogs, and YouTube live feeds.",
  icons: {
    icon: "/brand/nexuswire-logo.png",
    apple: "/brand/nexuswire-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${exo.variable} ${orbitron.variable}`}>
      <body className="font-sans antialiased pb-24">
        <SearchProvider>
          <LogoIntro />
          {children}
          <GlobalSearch />
          <SearchShortcut />
          <ConnectStatus />
          <Nav />
        </SearchProvider>
      </body>
    </html>
  );
}
