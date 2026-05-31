import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "**.bbci.co.uk" },
      { protocol: "https", hostname: "**.guardian.com" },
      { protocol: "https", hostname: "**.npr.org" },
      { protocol: "https", hostname: "**.aljazeera.com" },
      { protocol: "https", hostname: "**.techcrunch.com" },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
