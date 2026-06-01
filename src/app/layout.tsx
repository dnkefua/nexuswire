import type { Metadata, Viewport } from "next";
import { Exo_2, Orbitron } from "next/font/google";
import { ConnectStatus } from "@/components/ConnectStatus";
import { GlobalSearch } from "@/components/GlobalSearch";
import { LogoIntro } from "@/components/LogoIntro";
import { Nav } from "@/components/Nav";
import { SearchShortcut } from "@/components/SearchShortcut";
import { SearchProvider } from "@/context/SearchContext";
import { UserProvider } from "@/context/UserContext";
import "./globals.css";

const exo = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nexuswire.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "NexusWire — Premium Global News",
    template: "%s — NexusWire",
  },
  description:
    "Discover trusted global news, live video feeds, and source-attributed previews. NexusWire aggregates RSS, blogs, and YouTube from the world's leading publishers.",
  keywords: ["news", "global news", "news aggregator", "RSS", "live news", "Africa", "Cameroon", "world news"],
  authors: [{ name: "NexusWire" }],
  creator: "NexusWire",
  publisher: "NexusWire",
  // Icons are provided by the App Router file convention:
  // src/app/favicon.ico, icon.png, apple-icon.png (generated from the brand logo).
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    siteName: "NexusWire",
    title: "NexusWire — Premium Global News",
    description:
      "Discover trusted global news, live video feeds, and source-attributed previews from the world's leading publishers.",
    url: APP_URL,
    images: [{ url: "/brand/nexuswire-logo.png", width: 512, height: 512, alt: "NexusWire" }],
  },
  twitter: {
    card: "summary",
    title: "NexusWire — Premium Global News",
    description: "Trusted news aggregation with source attribution, live video, and regional diversity.",
    images: ["/brand/nexuswire-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#2d8cff",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${exo.variable} ${orbitron.variable}`}>
      <body className="font-sans antialiased pb-24">
        <UserProvider>
          <SearchProvider>
            <LogoIntro />
            {children}
            <GlobalSearch />
            <SearchShortcut />
            <ConnectStatus />
            <Nav />
          </SearchProvider>
        </UserProvider>
      </body>
    </html>
  );
}
