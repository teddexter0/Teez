import { trends, type Platform, type Trend } from './catalog';

/** Rights are explicit; a source signal is never permission to download or rehost. */
export type SourceMedia =
  | { rights: 'original-demo'; trendId: string; durationSeconds: number }
  | { rights: 'licensed-asset'; src: string; credit: string; licenseUrl: string; durationSeconds: number }
  | { rights: 'official-embed'; provider: Exclude<Platform, 'Google Trends'>; externalId: string; segment?: { startSeconds: number; endSeconds: number } }
  | { rights: 'link-only' };

/** Input to curation. Editorial explanations are modeled separately as Trend. */
export type TrendSignal = {
  platform: Platform;
  externalId: string;
  title: string;
  permalink?: string;
  observedAt?: string;
  media: SourceMedia;
};

export type SourceQuery = { platforms?: readonly Platform[]; signal?: AbortSignal };

export interface SourceAdapter {
  readonly id: string;
  readonly mode: 'demo' | 'live';
  collect(query?: SourceQuery): Promise<readonly TrendSignal[]>;
}

/** The only active adapter. It never contacts third-party services. */
export const demoSource: SourceAdapter = {
  id: 'teez-demo',
  mode: 'demo',
  async collect({ platforms, signal } = {}) {
    signal?.throwIfAborted();
    return trends.filter((trend) => !platforms || platforms.includes(trend.platform)).map((trend): TrendSignal => ({
      platform: trend.platform,
      externalId: `demo:${trend.id}`,
      title: trend.title,
      media: { rights: 'original-demo', trendId: trend.id, durationSeconds: trend.seconds },
    }));
  },
};

export function getDemoCatalog(): readonly Trend[] {
  return trends;
}

type FutureSource = {
  enabled: false;
  roles: readonly ('discovery' | 'embed')[];
  docs: string;
  activation: string;
};

/** Integration roadmap. Provider adapters and their credentials belong on the server. */
export const futureSources = {
  YouTube: {
    enabled: false, roles: ['discovery', 'embed'], docs: 'https://developers.google.com/youtube/apis',
    activation: 'Use the Data API within project quota and the official player. Check embeddability; do not download or cache footage.',
  },
  Reddit: {
    enabled: false, roles: ['discovery', 'embed'], docs: 'https://support.reddithelp.com/hc/en-us/articles/14945211791892-Developer-Platform-Accessing-Reddit-Data',
    activation: 'Obtain applicable Data API access and use approved authentication. Honor removal and retention requirements; use official embeds or links.',
  },
  'Google Trends': {
    enabled: false, roles: ['discovery'], docs: 'https://developers.google.com/search/blog/2025/07/trends-api',
    activation: 'Request Trends API access and use search interest as a signal, never as a video source.',
  },
  TikTok: {
    enabled: false, roles: ['embed'], docs: 'https://developers.tiktok.com/docs/en/embed-player',
    activation: 'Start with editorially selected public posts and the official player. Display API requires creator authorization and is not a broad discovery feed.',
  },
  Instagram: {
    enabled: false, roles: ['embed'], docs: 'https://developers.facebook.com/docs/instagram-platform/oembed/',
    activation: 'Use supported public embeds or official links with applicable Meta app access. Do not scrape, crop or rehost Reels.',
  },
  X: {
    enabled: false, roles: ['discovery', 'embed'], docs: 'https://docs.x.com/x-api/getting-started/pricing',
    activation: 'Keep paid API calls disabled until explicitly authorized. For selected posts, consider official embeds or link out.',
  },
} as const satisfies Record<Platform, FutureSource>;
