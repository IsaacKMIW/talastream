import { useState, useEffect } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheItem<any>>();

export function useCache<T>(
  key: string,
  fetchData: () => Promise<T>,
  dependencies: any[] = []
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache
        const cachedItem = cache.get(key);
        const now = Date.now();

        if (cachedItem && now - cachedItem.timestamp < CACHE_DURATION) {
          setData(cachedItem.data);
          setLoading(false);
          return;
        }

        // Fetch fresh data
        const freshData = await fetchData();
        
        // Update cache
        cache.set(key, {
          data: freshData,
          timestamp: now,
        });

        setData(freshData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key, ...dependencies]);

  return { data, loading, error };
}