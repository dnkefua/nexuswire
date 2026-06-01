import "server-only";

export interface ArticleExcerpt {
  ok: boolean;
  paragraphs: string[];
  shownParagraphs: number;
  totalParagraphs: number;
  fraction: number;
  truncated: boolean;
  reason?: string;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min
const cache = new Map<string, { value: ArticleExcerpt; expires: number }>();

/** Block SSRF: only public http(s) URLs, no localhost / private hosts. */
function isSafeUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  const host = u.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  ) {
    return false;
  }
  return true;
}

const ENTITIES: Record<string, string> = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'",
  "&apos;": "'", "&nbsp;": " ", "&mdash;": "—", "&ndash;": "–",
  "&rsquo;": "’", "&lsquo;": "‘", "&ldquo;": "“", "&rdquo;": "”", "&hellip;": "…",
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&[a-z]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m);
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

const BOILERPLATE = /(cookie|subscribe|sign up|newsletter|advertisement|read more|share this|all rights reserved|©)/i;

/**
 * Best-effort readable-excerpt extraction. We fetch the article HTML, isolate
 * the main content, extract paragraphs, and return only the first ~`fraction`
 * of them. We never return the full body — the reader links out to finish.
 */
export async function fetchArticleExcerpt(url: string, fraction = 0.25): Promise<ArticleExcerpt> {
  const empty = (reason: string): ArticleExcerpt => ({
    ok: false, paragraphs: [], shownParagraphs: 0, totalParagraphs: 0, fraction, truncated: false, reason,
  });

  if (!isSafeUrl(url)) return empty("unsafe-url");

  const cacheKey = `${url}|${fraction}`;
  const hit = cache.get(cacheKey);
  if (hit && hit.expires > Date.now()) return hit.value;

  let html: string;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    const origin = (() => { try { return new URL(url).origin; } catch { return undefined; } })();
    // Full browser-like header set — many publishers 403 a bare/bot UA.
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Upgrade-Insecure-Requests": "1",
        ...(origin ? { Referer: origin + "/" } : {}),
      },
    });
    clearTimeout(timer);
    if (!res.ok) return empty(`http-${res.status}`);
    const ctype = res.headers.get("content-type") || "";
    if (!ctype.includes("html")) return empty("not-html");
    html = await res.text();
  } catch {
    return empty("fetch-failed");
  }

  // Drop non-content blocks before extraction.
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(nav|header|footer|aside|form)[\s\S]*?<\/\1>/gi, " ");

  // A real article paragraph reads like prose: it has sentence punctuation or is
  // long. Nav menus / link lists (e.g. "Politics Spice Education Opinion") lack
  // sentence structure, so this filters most boilerplate out.
  const maxConsecutiveCaps = (words: string[]): number => {
    let run = 0, max = 0;
    for (const w of words) {
      if (/^[A-Z][a-zA-Z]/.test(w)) { run += 1; max = Math.max(max, run); }
      else run = 0;
    }
    return max;
  };

  const looksLikeProse = (p: string): boolean => {
    if (p.length < 35 || BOILERPLATE.test(p)) return false;
    const hasSentence = /[.!?]["')\]]?(\s|$)/.test(p);
    const words = p.split(/\s+/);
    const capRatio = words.filter((w) => /^[A-Z]/.test(w)).length / Math.max(1, words.length);
    // Drop link-list lines: mostly Title-Case words with no sentence punctuation.
    if (!hasSentence && capRatio > 0.5) return false;
    // Drop nav/masthead runs glued to a paragraph (6+ consecutive Title-Case
    // words almost never occur in real prose, but are the signature of menus).
    if (maxConsecutiveCaps(words.slice(0, 18)) >= 6) return false;
    return hasSentence || p.length >= 120;
  };

  const extractParagraphs = (scope: string): string[] =>
    [...scope.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((m) => stripTags(m[1]))
      .filter(looksLikeProse);

  // Prefer specific content scopes (<article>, content containers); only fall
  // back to the whole document when those are empty/thin, so menus don't leak in.
  const specific: string[] = [];
  for (const m of cleaned.matchAll(/<article[\s\S]*?<\/article>/gi)) specific.push(m[0]);
  for (const m of cleaned.matchAll(
    /<(?:div|section)[^>]*(?:class|id)="[^"]*(?:article|content|post|story|entry|body|prose|main)[^"]*"[\s\S]*?<\/(?:div|section)>/gi
  )) specific.push(m[0]);

  const pickBest = (scopes: string[]): string[] => {
    let best: string[] = [];
    let bestLen = 0;
    for (const scope of scopes) {
      const ps = extractParagraphs(scope);
      const len = ps.join(" ").length;
      if (len > bestLen) { bestLen = len; best = ps; }
    }
    return best;
  };

  let paragraphs = pickBest(specific);
  // Only use the whole-document fallback if specific scopes were too thin.
  if (paragraphs.join(" ").length < 400) {
    const whole = extractParagraphs(cleaned);
    if (whole.join(" ").length > paragraphs.join(" ").length) paragraphs = whole;
  }

  if (paragraphs.length === 0) return empty("no-content");

  const total = paragraphs.length;
  // At least the requested fraction, with a sane floor and ceiling.
  const shown = Math.min(
    total,
    Math.max(2, Math.ceil(total * fraction))
  );
  const value: ArticleExcerpt = {
    ok: true,
    paragraphs: paragraphs.slice(0, shown),
    shownParagraphs: shown,
    totalParagraphs: total,
    fraction,
    truncated: shown < total,
  };

  cache.set(cacheKey, { value, expires: Date.now() + CACHE_TTL_MS });
  return value;
}
