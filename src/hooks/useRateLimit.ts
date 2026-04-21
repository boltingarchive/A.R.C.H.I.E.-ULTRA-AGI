import { useState, useCallback } from 'react';

const MAX_REQUESTS = 15;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export function useRateLimit() {
  const [requests, setRequests] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('archie_rate_limit');
      if (!stored) return [];
      const parsed: number[] = JSON.parse(stored);
      const now = Date.now();
      return parsed.filter(t => now - t < WINDOW_MS);
    } catch {
      return [];
    }
  });

  const now = Date.now();
  const validRequests = requests.filter(t => now - t < WINDOW_MS);
  const remaining = MAX_REQUESTS - validRequests.length;
  const isLimited = remaining <= 0;

  const oldestRequest = validRequests.length > 0 ? Math.min(...validRequests) : null;
  const resetAt = oldestRequest ? oldestRequest + WINDOW_MS : null;
  const cooldownMs = resetAt ? Math.max(0, resetAt - now) : 0;

  const tryRequest = useCallback((): boolean => {
    const now = Date.now();
    setRequests(prev => {
      const valid = prev.filter(t => now - t < WINDOW_MS);
      if (valid.length >= MAX_REQUESTS) return valid;
      const updated = [...valid, now];
      localStorage.setItem('archie_rate_limit', JSON.stringify(updated));
      return updated;
    });
    const valid = requests.filter(t => now - t < WINDOW_MS);
    return valid.length < MAX_REQUESTS;
  }, [requests]);

  return { remaining, isLimited, cooldownMs, tryRequest, maxRequests: MAX_REQUESTS };
}
