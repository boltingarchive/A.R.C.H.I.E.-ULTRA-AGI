import type { NewsItem, FinanceItem, Hotspot } from '../types';

const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

const PRIORITY_KEYWORDS = ['crash', 'breakthrough', 'crisis', 'collapse', 'emergency', 'alert'];

function hasPriority(text: string): boolean {
  return PRIORITY_KEYWORDS.some(k => text.toLowerCase().includes(k));
}

function makeId(): string {
  return Math.random().toString(36).slice(2);
}

async function fetchRSS(url: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(`${RSS2JSON}${encodeURIComponent(url)}&count=20`);
    const data = await res.json();
    if (!data.items) return [];
    return data.items.slice(0, 15).map((item: Record<string, string>) => ({
      id: makeId(),
      title: item.title || 'Untitled',
      summary: item.description?.replace(/<[^>]+>/g, '').slice(0, 200) || '',
      source: data.feed?.title || 'Unknown',
      url: item.link || '#',
      timestamp: new Date(item.pubDate || Date.now()),
      priority: hasPriority(item.title || '') || hasPriority(item.description || ''),
    }));
  } catch {
    return [];
  }
}

export async function fetchWorldNews(): Promise<NewsItem[]> {
  const feeds = [
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  ];
  const results = await Promise.allSettled(feeds.map(fetchRSS));
  const items = results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
  return items.slice(0, 20);
}

export async function fetchTechNews(): Promise<NewsItem[]> {
  try {
    const topIds = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json').then(r => r.json());
    const ids: number[] = topIds.slice(0, 15);
    const stories = await Promise.allSettled(
      ids.map((id: number) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
      )
    );
    return stories
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<Record<string, unknown>>).value)
      .filter(s => s && s.title)
      .map(s => ({
        id: makeId(),
        title: s.title as string,
        summary: `${s.score ?? 0} points · ${s.descendants ?? 0} comments`,
        source: 'Hacker News',
        url: (s.url as string) || `https://news.ycombinator.com/item?id=${s.id}`,
        timestamp: new Date((s.time as number) * 1000),
        priority: hasPriority(s.title as string),
      }));
  } catch {
    return fetchRSS('https://feeds.feedburner.com/TechCrunch');
  }
}

export async function fetchFinanceNews(): Promise<NewsItem[]> {
  return fetchRSS('https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC&region=US&lang=en-US');
}

export async function fetchRegionNews(): Promise<NewsItem[]> {
  const feeds = [
    'https://feeds.bbci.co.uk/news/uk/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/US.xml',
  ];
  const results = await Promise.allSettled(feeds.map(fetchRSS));
  return results.flatMap(r => (r.status === 'fulfilled' ? r.value : [])).slice(0, 20);
}

export async function fetchCryptoData(): Promise<FinanceItem[]> {
  try {
    const data = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1'
    ).then(r => r.json());
    return data.map((c: Record<string, unknown>) => ({
      symbol: (c.symbol as string).toUpperCase(),
      name: c.name as string,
      price: c.current_price as number,
      change: c.price_change_24h as number,
      changePercent: c.price_change_percentage_24h as number,
      marketCap: c.market_cap as number,
      image: c.image as string,
    }));
  } catch {
    return [];
  }
}

export const NEWS_HOTSPOTS: Hotspot[] = [
  { lat: 51.5, lng: -0.1, label: 'London', intensity: 0.8 },
  { lat: 40.7, lng: -74.0, label: 'New York', intensity: 0.9 },
  { lat: 35.7, lng: 139.7, label: 'Tokyo', intensity: 0.7 },
  { lat: 48.9, lng: 2.3, label: 'Paris', intensity: 0.6 },
  { lat: 39.9, lng: 116.4, label: 'Beijing', intensity: 0.85 },
  { lat: -33.9, lng: 18.4, label: 'Cape Town', intensity: 0.5 },
  { lat: 19.1, lng: 72.9, label: 'Mumbai', intensity: 0.75 },
  { lat: 55.8, lng: 37.6, label: 'Moscow', intensity: 0.65 },
  { lat: -23.5, lng: -46.6, label: 'São Paulo', intensity: 0.55 },
  { lat: 25.2, lng: 55.3, label: 'Dubai', intensity: 0.7 },
  { lat: 37.6, lng: -122.4, label: 'San Francisco', intensity: 0.8 },
  { lat: 1.3, lng: 103.8, label: 'Singapore', intensity: 0.72 },
];

export { PRIORITY_KEYWORDS };
