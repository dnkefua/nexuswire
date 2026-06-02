import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { isFirebaseConfigured, getFirestoreDb } from "../firebase-admin";
import { normalizeUrl } from "../dedupe";
import { matchesCategory } from "../taxonomy";
import type { NewsItem, NormalizedArticle } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const ARTICLES_FILE = path.join(DATA_DIR, "articles.json");
const COLLECTION = "articles";

/** Map an aggregated NewsItem → a preview-safe NormalizedArticle for storage. */
export function toNormalized(item: NewsItem): NormalizedArticle {
  return {
    id: item.id,
    canonicalUrl: normalizeUrl(item.link),
    title: item.title,
    summary: item.summary?.slice(0, 400) || "",
    image: item.image,
    sourceId: item.source,
    sourceName: item.source,
    sourceType: item.sourceType,
    category: item.category,
    region: item.region,
    country: item.country,
    author: item.author,
    publishedAt: item.publishedAt,
    fetchedAt: new Date().toISOString(),
    originalLink: item.link,
    contentOwnership: "third_party",
    previewOnly: true,
    status: item.viaDiscovery ? "reported" : "active", // discovery items flagged for review
    credibilityScore: item.credibilityScore,
    viaDiscovery: item.viaDiscovery,
    videoId: item.videoId,
    playlistId: item.playlistId,
    isLive: item.isLive,
  };
}

/** Extract a YouTube video id from a watch/embed/youtu.be URL. */
function videoIdFromUrl(url: string): string | undefined {
  const m = url.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1];
}

/** Convert a stored article back to the NewsItem shape the UI consumes. */
export function toNewsItem(a: NormalizedArticle): NewsItem {
  return {
    id: a.id,
    title: a.title,
    summary: a.summary || "",
    link: a.originalLink,
    image: a.image,
    source: a.sourceName,
    sourceType: a.sourceType,
    category: a.category,
    region: a.region || "",
    country: a.country || "",
    publishedAt: a.publishedAt,
    author: a.author,
    credibilityScore: a.credibilityScore,
    viaDiscovery: a.viaDiscovery,
    // Reconstruct videoId from the stored field, falling back to the URL so
    // previously-stored videos still render embeds without a re-ingest.
    videoId: a.sourceType === "youtube" ? (a.videoId || videoIdFromUrl(a.originalLink)) : undefined,
    playlistId: a.playlistId,
    isLive: a.isLive,
  };
}

// ─── Dev JSON fallback ───────────────────────────────────────────────────────

async function readLocal(): Promise<Record<string, NormalizedArticle>> {
  try {
    const raw = await fs.readFile(ARTICLES_FILE, "utf-8");
    return JSON.parse(raw) as Record<string, NormalizedArticle>;
  } catch {
    return {};
  }
}

async function writeLocal(map: Record<string, NormalizedArticle>): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ARTICLES_FILE, JSON.stringify(map, null, 2), "utf-8");
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface UpsertResult {
  created: number;
  updated: number;
}

/** Persist a batch of articles (one document per article). */
export async function upsertArticles(items: NewsItem[]): Promise<UpsertResult> {
  const normalized = items.map(toNormalized);

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    let created = 0;
    let updated = 0;
    // Chunk into Firestore's 500-write batch limit.
    for (let i = 0; i < normalized.length; i += 450) {
      const chunk = normalized.slice(i, i + 450);
      const refs = chunk.map((a) => db.collection(COLLECTION).doc(a.id));
      const snaps = await db.getAll(...refs);
      const batch = db.batch();
      chunk.forEach((a, idx) => {
        if (snaps[idx].exists) updated += 1;
        else created += 1;
        batch.set(refs[idx], a, { merge: true });
      });
      await batch.commit();
    }
    return { created, updated };
  }

  // Dev fallback
  const map = await readLocal();
  let created = 0;
  let updated = 0;
  for (const a of normalized) {
    if (map[a.id]) updated += 1;
    else created += 1;
    map[a.id] = { ...map[a.id], ...a };
  }
  await writeLocal(map);
  return { created, updated };
}

export interface ListOptions {
  category?: string;
  type?: NewsItem["sourceType"];
  country?: string;
  source?: string;
  q?: string;
  limit?: number;
  offset?: number;
  includeReported?: boolean;
}

/** Read persisted articles, newest first, with in-memory filtering. */
export async function listArticles(options: ListOptions = {}): Promise<NormalizedArticle[]> {
  const limit = options.limit ?? 40;
  const offset = options.offset ?? 0;

  let all: NormalizedArticle[];
  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    // Pull a recent window ordered by publishedAt; filter in memory to avoid
    // requiring composite indexes for every filter combination.
    const snap = await db
      .collection(COLLECTION)
      .orderBy("publishedAt", "desc")
      .limit(500)
      .get();
    all = snap.docs.map((d) => d.data() as NormalizedArticle);
  } else {
    all = Object.values(await readLocal()).sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  let items = all.filter((a) => a.status !== "removed" && a.status !== "hidden");
  if (!options.includeReported) {
    items = items.filter((a) => a.status === "active");
  }
  if (options.category && options.category !== "All") {
    items = items.filter((a) =>
      matchesCategory(options.category!, {
        title: a.title,
        summary: a.summary,
        category: a.category,
        sourceType: a.sourceType,
      })
    );
  }
  if (options.type) items = items.filter((a) => a.sourceType === options.type);
  if (options.country) {
    const c = options.country.toLowerCase();
    items = items.filter(
      (a) =>
        (a.country || "").toLowerCase() === c ||
        a.title.toLowerCase().includes(c) ||
        (a.summary || "").toLowerCase().includes(c)
    );
  }
  if (options.source) items = items.filter((a) => a.sourceName === options.source);
  if (options.q) {
    const q = options.q.toLowerCase();
    items = items.filter(
      (a) => a.title.toLowerCase().includes(q) || (a.summary || "").toLowerCase().includes(q)
    );
  }

  return items.slice(offset, offset + limit);
}

/** Count of persisted, active articles (cheap existence check for /api/news). */
export async function hasPersistedArticles(): Promise<boolean> {
  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    const snap = await db.collection(COLLECTION).limit(1).get();
    return !snap.empty;
  }
  const map = await readLocal();
  return Object.keys(map).length > 0;
}

/** Update a single article's moderation status (admin action). */
export async function setArticleStatus(
  id: string,
  status: NormalizedArticle["status"]
): Promise<boolean> {
  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    await db.collection(COLLECTION).doc(id).set({ status }, { merge: true });
    return true;
  }
  const map = await readLocal();
  if (!map[id]) return false;
  map[id].status = status;
  await writeLocal(map);
  return true;
}
