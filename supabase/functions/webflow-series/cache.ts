import type { Lesson } from './types.ts';

interface CacheEntry {
  data: Lesson;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached lesson if available and not expired
 */
export function getCached(seriesId: string): Lesson | null {
  const entry = cache.get(seriesId);
  
  if (!entry) {
    return null;
  }
  
  const now = Date.now();
  const age = now - entry.timestamp;
  
  if (age > CACHE_TTL_MS) {
    cache.delete(seriesId);
    return null;
  }
  
  return entry.data;
}

/**
 * Store lesson in cache
 */
export function setCache(seriesId: string, lesson: Lesson): void {
  cache.set(seriesId, {
    data: lesson,
    timestamp: Date.now(),
  });
}

/**
 * Clear all cache (useful for testing)
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cache stats (for debugging)
 */
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}
