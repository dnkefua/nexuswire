import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  serverExternalPackages: ["firebase-admin"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [58, 68, 75, 78, 82],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "archive.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "**.bbci.co.uk" },
      { protocol: "https", hostname: "**.guardian.com" },
      { protocol: "https", hostname: "**.npr.org" },
      { protocol: "https", hostname: "**.aljazeera.com" },
      { protocol: "https", hostname: "**.techcrunch.com" },
    ],
  },
};

export default nextConfig;
