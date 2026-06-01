import type { FeedSource } from "./types";
import { getActiveFeedSources } from "./source-registry";

/**
 * Feed catalog consumed by the RSS aggregation engine. This is now derived from
 * the trusted source registry (src/lib/source-registry.ts) so there is a single
 * source of truth for credibility scores, regions, and African publisher data.
 */
export const DEFAULT_FEEDS: FeedSource[] = getActiveFeedSources();
