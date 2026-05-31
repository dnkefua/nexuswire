export type NewsSourceType = "rss" | "youtube" | "blog";

export type SearchFacet = "all" | "videos" | "newspaper" | "blogs" | "countries";

export type PostType = "blog" | "video" | "link";

export type ConnectedPlatform =
  | "website"
  | "rss"
  | "youtube"
  | "tiktok"
  | "twitter"
  | "instagram";

export type ReviewType = "musician" | "blog" | "album" | "video";

export type EngagementTarget = "post" | "review" | "video" | "article";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  image?: string;
  source: string;
  sourceType: NewsSourceType;
  category: string;
  region: string;
  country: string;
  publishedAt: string;
  author?: string;
  isLive?: boolean;
  videoId?: string;
}

export interface JournalistSocial {
  twitter?: string;
  youtube?: string;
  website?: string;
  tiktok?: string;
  instagram?: string;
}

export interface ConnectedSource {
  id: string;
  journalistId: string;
  platform: ConnectedPlatform;
  label: string;
  url: string;
  createdAt: string;
}

export interface Journalist {
  id: string;
  displayName: string;
  handle: string;
  bio: string;
  beat: string;
  avatarUrl: string;
  verified: boolean;
  social: JournalistSocial;
  createdAt: string;
}

export interface JournalistPost {
  id: string;
  journalistId: string;
  type: PostType;
  title: string;
  body: string;
  mediaUrl?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  tags: string[];
  publishedAt: string;
  createdAt: string;
}

export interface Review {
  id: string;
  authorName: string;
  type: ReviewType;
  subject: string;
  rating: number;
  body: string;
  mediaUrl?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  targetType: EngagementTarget;
  targetId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface Like {
  id: string;
  targetType: EngagementTarget;
  targetId: string;
  userKey: string;
  createdAt: string;
}

export interface Broadcast {
  id: string;
  journalistId: string;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  category: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  streamUrl?: string;
  createdAt: string;
}

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  type: NewsSourceType;
  category: string;
  region: string;
  country: string;
}

export interface EngagementCounts {
  likes: number;
  comments: number;
  likedByMe: boolean;
}
