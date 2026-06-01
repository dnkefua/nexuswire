import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://nexuswire.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/live", "/search", "/journalists", "/community", "/about", "/editorial-policy", "/source-policy", "/corrections", "/privacy", "/terms", "/dmca", "/contact", "/pricing"],
        // Noindex thin preview pages to avoid duplicate content issues with original publishers
        disallow: ["/read", "/api/", "/admin/", "/studio"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
