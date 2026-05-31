import "server-only";
import { v4 as uuidv4 } from "uuid";
import { parseMediaUrl } from "./media";
import {
  readDataStore,
  writeDataStore,
  type DataStore,
} from "./store-backend";
import type {
  Broadcast,
  Comment,
  ConnectedSource,
  EngagementCounts,
  EngagementTarget,
  Journalist,
  JournalistPost,
  Like,
  Review,
} from "./types";

const defaultStore: DataStore = {
  journalists: [
    {
      id: "demo-1",
      displayName: "Alex Rivera",
      handle: "@arivera",
      bio: "Foreign correspondent covering geopolitics and conflict zones. Emmy nominee.",
      beat: "World Affairs",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      verified: true,
      social: {
        twitter: "@arivera",
        website: "https://example.com",
        tiktok: "https://www.tiktok.com/@arivera",
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-2",
      displayName: "Maya Chen",
      handle: "@mayachen",
      bio: "Tech & innovation journalist. Host of NexusWire Weekly.",
      beat: "Technology",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      verified: true,
      social: { youtube: "@mayachen", website: "https://example.com" },
      createdAt: new Date().toISOString(),
    },
  ],
  broadcasts: [],
  connectedSources: [],
  posts: [],
  reviews: [
    {
      id: "review-demo-1",
      authorName: "Sam K.",
      type: "musician",
      subject: "Nova Pulse — Midnight Transit",
      rating: 4,
      body: "Tight production and memorable hooks. The bridge at 2:40 is a standout.",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "review-demo-2",
      authorName: "Priya M.",
      type: "blog",
      subject: "The Signal Desk — AI in newsrooms",
      rating: 5,
      body: "Clear, practical breakdown of editorial workflows. Worth a read for any newsroom lead.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  comments: [],
  likes: [],
};

function migrateStore(parsed: Partial<DataStore>): DataStore {
  return {
    journalists: parsed.journalists ?? defaultStore.journalists,
    broadcasts: parsed.broadcasts ?? [],
    connectedSources: parsed.connectedSources ?? [],
    posts: parsed.posts ?? [],
    reviews: parsed.reviews?.length ? parsed.reviews : defaultStore.reviews,
    comments: parsed.comments ?? [],
    likes: parsed.likes ?? [],
  };
}

async function readStore(): Promise<DataStore> {
  const existing = await readDataStore();
  if (existing) return migrateStore(existing);
  const fresh = migrateStore({});
  await writeStore(fresh);
  return fresh;
}

async function writeStore(data: DataStore): Promise<void> {
  await writeDataStore(data);
}

export { useFirebaseStore } from "./store-backend";

// —— Journalists ——

export async function listJournalists(): Promise<Journalist[]> {
  const store = await readStore();
  return store.journalists.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createJournalist(
  input: Omit<Journalist, "id" | "createdAt" | "verified">
): Promise<Journalist> {
  const store = await readStore();
  const journalist: Journalist = {
    ...input,
    id: uuidv4(),
    verified: false,
    createdAt: new Date().toISOString(),
  };
  store.journalists.unshift(journalist);
  await writeStore(store);
  return journalist;
}

export async function getJournalist(id: string): Promise<Journalist | null> {
  const store = await readStore();
  return store.journalists.find((j) => j.id === id) ?? null;
}

export async function updateJournalist(
  id: string,
  patch: Partial<Pick<Journalist, "bio" | "beat" | "avatarUrl" | "social">>
): Promise<Journalist | null> {
  const store = await readStore();
  const idx = store.journalists.findIndex((j) => j.id === id);
  if (idx === -1) return null;
  store.journalists[idx] = { ...store.journalists[idx], ...patch };
  await writeStore(store);
  return store.journalists[idx];
}

// —— Connected sources ——

export async function listConnectedSources(
  journalistId: string
): Promise<ConnectedSource[]> {
  const store = await readStore();
  return store.connectedSources
    .filter((s) => s.journalistId === journalistId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addConnectedSource(
  input: Omit<ConnectedSource, "id" | "createdAt">
): Promise<ConnectedSource> {
  const store = await readStore();
  if (!store.journalists.find((j) => j.id === input.journalistId)) {
    throw new Error("Journalist not found");
  }
  const source: ConnectedSource = {
    ...input,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  store.connectedSources.unshift(source);
  await writeStore(store);
  return source;
}

export async function removeConnectedSource(id: string): Promise<boolean> {
  const store = await readStore();
  const before = store.connectedSources.length;
  store.connectedSources = store.connectedSources.filter((s) => s.id !== id);
  if (store.connectedSources.length === before) return false;
  await writeStore(store);
  return true;
}

// —— Posts ——

export async function listPosts(journalistId?: string): Promise<JournalistPost[]> {
  const store = await readStore();
  let posts = store.posts;
  if (journalistId) posts = posts.filter((p) => p.journalistId === journalistId);
  return posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getPost(id: string): Promise<JournalistPost | null> {
  const store = await readStore();
  return store.posts.find((p) => p.id === id) ?? null;
}

export async function createPost(
  input: Omit<JournalistPost, "id" | "createdAt" | "publishedAt" | "embedUrl" | "thumbnailUrl"> & {
    mediaUrl?: string;
    publishedAt?: string;
  }
): Promise<JournalistPost> {
  const store = await readStore();
  if (!store.journalists.find((j) => j.id === input.journalistId)) {
    throw new Error("Journalist not found");
  }

  const media = input.mediaUrl ? parseMediaUrl(input.mediaUrl) : {};

  const post: JournalistPost = {
    ...input,
    id: uuidv4(),
    embedUrl: media.embedUrl,
    thumbnailUrl: media.thumbnailUrl,
    publishedAt: input.publishedAt || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  store.posts.unshift(post);
  await writeStore(store);
  return post;
}

// —— Reviews ——

export async function listReviews(type?: Review["type"]): Promise<Review[]> {
  const store = await readStore();
  let reviews = store.reviews;
  if (type) reviews = reviews.filter((r) => r.type === type);
  return reviews.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getReview(id: string): Promise<Review | null> {
  const store = await readStore();
  return store.reviews.find((r) => r.id === id) ?? null;
}

export async function createReview(
  input: Omit<Review, "id" | "createdAt">
): Promise<Review> {
  const store = await readStore();
  const review: Review = {
    ...input,
    id: uuidv4(),
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    createdAt: new Date().toISOString(),
  };
  store.reviews.unshift(review);
  await writeStore(store);
  return review;
}

// —— Comments ——

export async function listComments(
  targetType: EngagementTarget,
  targetId: string
): Promise<Comment[]> {
  const store = await readStore();
  return store.comments
    .filter((c) => c.targetType === targetType && c.targetId === targetId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createComment(
  input: Omit<Comment, "id" | "createdAt">
): Promise<Comment> {
  const store = await readStore();
  const comment: Comment = {
    ...input,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  store.comments.unshift(comment);
  await writeStore(store);
  return comment;
}

// —— Likes ——

export async function toggleLike(
  targetType: EngagementTarget,
  targetId: string,
  userKey: string
): Promise<EngagementCounts> {
  const store = await readStore();
  const existing = store.likes.findIndex(
    (l) =>
      l.targetType === targetType &&
      l.targetId === targetId &&
      l.userKey === userKey
  );

  if (existing >= 0) {
    store.likes.splice(existing, 1);
  } else {
    store.likes.push({
      id: uuidv4(),
      targetType,
      targetId,
      userKey,
      createdAt: new Date().toISOString(),
    });
  }

  await writeStore(store);
  return getEngagement(targetType, targetId, userKey);
}

export async function getEngagement(
  targetType: EngagementTarget,
  targetId: string,
  userKey?: string
): Promise<EngagementCounts> {
  const store = await readStore();
  const likes = store.likes.filter(
    (l) => l.targetType === targetType && l.targetId === targetId
  );
  const comments = store.comments.filter(
    (c) => c.targetType === targetType && c.targetId === targetId
  );
  return {
    likes: likes.length,
    comments: comments.length,
    likedByMe: userKey
      ? likes.some((l) => l.userKey === userKey)
      : false,
  };
}

export async function getEngagementBatch(
  targets: { targetType: EngagementTarget; targetId: string }[],
  userKey?: string
): Promise<Record<string, EngagementCounts>> {
  const result: Record<string, EngagementCounts> = {};
  for (const t of targets) {
    const key = `${t.targetType}:${t.targetId}`;
    result[key] = await getEngagement(t.targetType, t.targetId, userKey);
  }
  return result;
}

// —— Broadcasts ——

export async function listBroadcasts(): Promise<Broadcast[]> {
  const store = await readStore();
  return store.broadcasts.sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );
}

export async function createBroadcast(
  input: Omit<Broadcast, "id" | "createdAt" | "status">
): Promise<Broadcast> {
  const store = await readStore();
  if (!store.journalists.find((j) => j.id === input.journalistId)) {
    throw new Error("Journalist not found");
  }
  const broadcast: Broadcast = {
    ...input,
    id: uuidv4(),
    status: "scheduled",
    createdAt: new Date().toISOString(),
  };
  store.broadcasts.push(broadcast);
  await writeStore(store);
  return broadcast;
}

export async function updateBroadcastStatus(
  id: string,
  status: Broadcast["status"]
): Promise<Broadcast | null> {
  const store = await readStore();
  const idx = store.broadcasts.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  store.broadcasts[idx] = { ...store.broadcasts[idx], status };
  await writeStore(store);
  return store.broadcasts[idx];
}
