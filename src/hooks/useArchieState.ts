import { useState, useCallback } from 'react';
import type { SectorId, GalaxyNode, LogEntry, ArchieSettings, PriorityAlert, Gender } from '../types';
import { PRIORITY_KEYWORDS } from '../utils/newsApi';

const SECTOR_COMMANDS: Record<string, SectorId> = {
  world: 'world', globe: 'world', news: 'world',
  finance: 'finance', financial: 'finance', market: 'finance', crypto: 'finance',
  tech: 'tech', technology: 'tech', hacker: 'tech',
  region: 'region', local: 'region', national: 'region',
  mainframe: 'mainframe', terminal: 'mainframe', ai: 'mainframe', archie: 'mainframe',
  settings: 'settings', config: 'settings', configure: 'settings',
};

function makeId() {
  return Math.random().toString(36).slice(2);
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'show', 'me', 'i', 'you', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'as', 'into', 'through', 'during', 'archie', 'sir', 'please', 'can', 'could', 'would', 'should']);
  return text.toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .split(' ')
    .filter(w => w.length > 3 && !stopWords.has(w))
    .slice(0, 3);
}

const DEFAULT_SETTINGS: ArchieSettings = {
  gender: 'sir',
  darkMode: true,
  voiceSpeed: 1.0,
  voicePitch: 0.9,
  voiceEnabled: true,
  listeningEnabled: false,
};

export function useArchieState() {
  const [activeSector, setActiveSector] = useState<SectorId | null>(null);
  const [galaxyNodes, setGalaxyNodes] = useState<GalaxyNode[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: makeId(), message: 'A.R.C.H.I.E. systems online. All sectors nominal.', timestamp: new Date(), type: 'success' },
    { id: makeId(), message: 'Initializing neural pathways...', timestamp: new Date(), type: 'processing' },
    { id: makeId(), message: 'Calibrating semantic processors...', timestamp: new Date(), type: 'info' },
  ]);
  const [settings, setSettings] = useState<ArchieSettings>(DEFAULT_SETTINGS);
  const [priorityAlert, setPriorityAlert] = useState<PriorityAlert>({ active: false, keyword: '', message: '' });

  const title = settings.gender === 'maam' ? 'Ma\'am' : 'Sir';

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [
      { id: makeId(), message, timestamp: new Date(), type },
      ...prev.slice(0, 49),
    ]);
  }, []);

  const addGalaxyKeywords = useCallback((text: string) => {
    const keywords = extractKeywords(text);
    keywords.forEach(keyword => {
      setGalaxyNodes(prev => {
        const exists = prev.find(n => n.keyword === keyword);
        if (exists) {
          return prev.map(n => n.keyword === keyword ? { ...n, pulseIntensity: Math.min(1, n.pulseIntensity + 0.3) } : n);
        }
        const newNode: GalaxyNode = {
          id: makeId(),
          keyword,
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          pulseIntensity: 0.6,
          createdAt: Date.now(),
          connections: prev.slice(-2).map(n => n.id),
        };
        return [...prev.slice(-19), newNode];
      });
    });
  }, []);

  const checkPriorityKeywords = useCallback((text: string, onAlert: (keyword: string) => void) => {
    const lower = text.toLowerCase();
    const found = PRIORITY_KEYWORDS.find(k => lower.includes(k));
    if (found) {
      setPriorityAlert({ active: true, keyword: found.toUpperCase(), message: text });
      onAlert(found);
      setTimeout(() => setPriorityAlert({ active: false, keyword: '', message: '' }), 8000);
    }
  }, []);

  const processVoiceCommand = useCallback((text: string): SectorId | null => {
    const lower = text.toLowerCase();
    for (const [keyword, sector] of Object.entries(SECTOR_COMMANDS)) {
      if (lower.includes(keyword)) {
        return sector;
      }
    }
    return null;
  }, []);

  const detectGenderChange = useCallback((text: string): Gender | null => {
    const lower = text.toLowerCase();
    if (lower.includes('woman') || lower.includes('girl') || lower.includes('lady') || lower.includes("ma'am") || lower.includes('maam')) {
      return 'maam';
    }
    if (lower.includes('man') || lower.includes('sir') || lower.includes('mister') || lower.includes('mr')) {
      return 'sir';
    }
    return null;
  }, []);

  const updateSettings = useCallback((patch: Partial<ArchieSettings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  }, []);

  return {
    activeSector, setActiveSector,
    galaxyNodes,
    logs, addLog,
    settings, updateSettings,
    priorityAlert, setPriorityAlert,
    title,
    addGalaxyKeywords,
    checkPriorityKeywords,
    processVoiceCommand,
    detectGenderChange,
  };
}
