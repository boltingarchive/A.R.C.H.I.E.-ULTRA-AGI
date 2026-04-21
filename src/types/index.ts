export type Gender = 'sir' | 'maam';

export type SectorId = 'world' | 'finance' | 'tech' | 'region' | 'mainframe' | 'settings';

export interface Sector {
  id: SectorId;
  label: string;
  icon: string;
  description: string;
  color: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  timestamp: Date;
  priority?: boolean;
}

export interface FinanceItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  image?: string;
}

export interface GalaxyNode {
  id: string;
  keyword: string;
  x: number;
  y: number;
  pulseIntensity: number;
  createdAt: number;
  connections: string[];
}

export interface LogEntry {
  id: string;
  message: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'success' | 'processing';
}

export interface ArchieSettings {
  gender: Gender;
  darkMode: boolean;
  voiceSpeed: number;
  voicePitch: number;
  voiceEnabled: boolean;
  listeningEnabled: boolean;
}

export interface RateLimitState {
  requests: number[];
  maxRequests: number;
  windowMs: number;
}

export interface Hotspot {
  lat: number;
  lng: number;
  label: string;
  intensity: number;
}

export interface MainframeMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface PriorityAlert {
  active: boolean;
  keyword: string;
  message: string;
}
