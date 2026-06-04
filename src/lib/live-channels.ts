/**
 * 24/7 broadcasters that run a continuous live stream on YouTube. We embed
 * these with `youtube.com/embed/live_stream?channel=ID`, which always plays the
 * channel's *current* live broadcast (no fixed video id needed). Featured at the
 * top of the landing TV with a 🔴 LIVE badge. African channels lead the list.
 */
export interface LiveChannel {
  id: string;
  channelId: string;
  name: string;
  region: string;
  country: string;
}

export const LIVE_CHANNELS: LiveChannel[] = [
  { id: "live-crtv", channelId: "UCN48Jt-wS3AvFcIrMwbIe4w", name: "CRTV", region: "Central Africa", country: "Cameroon" },
  { id: "live-africanews", channelId: "UC25EuGAePOPvPrUA5cmu3dQ", name: "Africanews", region: "Pan-African", country: "Pan-African" },
  { id: "live-channelstv", channelId: "UCfquiJA6_bKLo5m4CLqUphw", name: "Channels Television", region: "West Africa", country: "Nigeria" },
  { id: "live-arise", channelId: "UCdzq1US_l7VuX74tCOHMsMw", name: "Arise News", region: "West Africa", country: "Nigeria" },
  { id: "live-citizen", channelId: "UChBQgieUidXV1CmDxSdRm3g", name: "Citizen TV Kenya", region: "East Africa", country: "Kenya" },
  { id: "live-aljazeera", channelId: "UCNye-wNBqNL5ZzHSJj3l8Bg", name: "Al Jazeera English", region: "Global", country: "Global" },
  { id: "live-skynews", channelId: "UCoMdktPbSTixAyNGwb-UYkQ", name: "Sky News", region: "Global", country: "Global" },
  { id: "live-dwnews", channelId: "UCknLrEdhRCp1aegoMqRaCZg", name: "DW News", region: "Global", country: "Global" },
];

export function liveEmbedSrc(channelId: string): string {
  return `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=1&rel=0&playsinline=1`;
}

export function liveWatchUrl(channelId: string): string {
  return `https://www.youtube.com/channel/${channelId}/live`;
}
