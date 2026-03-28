import { useState, useEffect, useCallback } from 'react';
import type { BlackbuckData } from '../types';

export function useBlackbuck() {
  const [data, setData] = useState<BlackbuckData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      const r = await fetch(`${base}/api/fetch-blackbuck`);
      const d = await r.json();
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fetch failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { data, loading, error, refetch: fetch_ };
}
