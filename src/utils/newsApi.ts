import type { NewsItem, FinanceItem, Hotspot } from '../types';

const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';
const GNEWS_API = 'https://gnews.io/api/v4/search';

const PRIORITY_KEYWORDS = ['crash', 'breakthrough', 'crisis', 'collapse', 'emergency', 'alert', 'surge', 'plunge'];

// Major countries for nation-based news fetching
export const MAJOR_NATIONS = [
  { code: 'us', name: 'United States', lat: 37.0902, lng: -95.7129 },
  { code: 'gb', name: 'United Kingdom', lat: 55.3781, lng: -3.436 },
  { code: 'de', name: 'Germany', lat: 51.1657, lng: 10.4515 },
  { code: 'fr', name: 'France', lat: 46.2276, lng: 2.2137 },
  { code: 'jp', name: 'Japan', lat: 36.2048, lng: 138.2529 },
  { code: 'cn', name: 'China', lat: 35.8617, lng: 104.1954 },
  { code: 'in', name: 'India', lat: 20.5937, lng: 78.9629 },
  { code: 'ca', name: 'Canada', lat: 56.1304, lng: -106.3468 },
  { code: 'au', name: 'Australia', lat: -25.2744, lng: 133.7751 },
  { code: 'br', name: 'Brazil', lat: -14.2350, lng: -51.9253 },
  { code: 'mx', name: 'Mexico', lat: 23.6345, lng: -102.5528 },
  { code: 'ru', name: 'Russia', lat: 61.524, lng: 105.3188 },
  { code: 'kr', name: 'South Korea', lat: 35.9078, lng: 127.7669 },
  { code: 'sg', name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { code: 'hk', name: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
  { code: 'ae', name: 'UAE', lat: 23.4241, lng: 53.8478 },
  { code: 'sa', name: 'Saudi Arabia', lat: 23.8859, lng: 45.0792 },
  { code: 'id', name: 'Indonesia', lat: -0.7893, lng: 113.9213 },
  { code: 'th', name: 'Thailand', lat: 15.8700, lng: 100.9925 },
  { code: 'my', name: 'Malaysia', lat: 4.2105, lng: 101.6964 },
  { code: 'ph', name: 'Philippines', lat: 12.8797, lng: 121.7740 },
  { code: 'vn', name: 'Vietnam', lat: 14.0583, lng: 108.2772 },
  { code: 'ir', name: 'Iran', lat: 32.4279, lng: 53.6880 },
  { code: 'tr', name: 'Turkey', lat: 38.9637, lng: 35.2433 },
  { code: 'ng', name: 'Nigeria', lat: 9.0820, lng: 8.6753 },
  { code: 'za', name: 'South Africa', lat: -30.5595, lng: 22.9375 },
  { code: 'eg', name: 'Egypt', lat: 26.8206, lng: 30.8025 },
  { code: 'il', name: 'Israel', lat: 31.0461, lng: 34.8516 },
  { code: 'ch', name: 'Switzerland', lat: 46.8182, lng: 8.2275 },
  { code: 'se', name: 'Sweden', lat: 60.1282, lng: 18.6435 },
  { code: 'no', name: 'Norway', lat: 60.472, lng: 8.4689 },
  { code: 'nl', name: 'Netherlands', lat: 52.1326, lng: 5.2913 },
  { code: 'be', name: 'Belgium', lat: 50.5039, lng: 4.4699 },
  { code: 'es', name: 'Spain', lat: 40.4637, lng: -3.7492 },
  { code: 'it', name: 'Italy', lat: 41.8719, lng: 12.5674 },
  { code: 'gr', name: 'Greece', lat: 39.0742, lng: 21.8243 },
  { code: 'nz', name: 'New Zealand', lat: -40.9006, lng: 174.8860 },
  { code: 'ar', name: 'Argentina', lat: -38.4161, lng: -63.6167 },
  { code: 'cl', name: 'Chile', lat: -35.6751, lng: -71.5430 },
  { code: 'co', name: 'Colombia', lat: 4.5709, lng: -74.2973 },
  { code: 'pk', name: 'Pakistan', lat: 30.3753, lng: 69.3451 },
];

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

export async function fetchCountryNews(countryCode: string, countryName: string): Promise<NewsItem[]> {
  try {
    // Try GNews API first (no auth required for basic use)
    const res = await fetch(
      `${GNEWS_API}?q=${encodeURIComponent(countryName)}&lang=en&max=15&sortby=publishedAt`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!res.ok) throw new Error('GNews API unavailable');

    const data = await res.json();
    if (!data.articles) return [];

    return data.articles.map((article: Record<string, string>) => ({
      id: makeId(),
      title: article.title || 'Untitled',
      summary: article.description || article.content?.slice(0, 200) || '',
      source: article.source?.name || 'Unknown',
      url: article.url || '#',
      timestamp: new Date(article.publishedAt || Date.now()),
      priority: hasPriority(article.title || '') || hasPriority(article.description || ''),
    }));
  } catch {
    // Fallback to generic world news if country-specific fails
    return fetchWorldNews();
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
