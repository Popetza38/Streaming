import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../store/language';
import { usePlatform } from '../store/platform';
import {
  normalizeDramaList,
  normalizeWatchData,
  normalizeChapters,
  extractList,
  type NormalizedDrama,
  type NormalizedWatchData,
  type NormalizedChapter,
} from '../utils/normalize';

/* ===== Helper: build API url with platform query param ===== */
function apiUrl(path: string, platform: string, extra: Record<string, string | number> = {}) {
  const params = new URLSearchParams({ platform, ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, String(v)])) });
  return `${path}?${params}`;
}

/* ===== For You (featured dramas) ===== */
export const useDramas = () => {
  const [dramas, setDramas] = useState<NormalizedDrama[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const { platform } = usePlatform();

  useEffect(() => {
    setLoading(true);
    setDramas([]);

    const path = platform === 'shortmax' ? '/api/foryou' : '/api/foryou/1';
    const params: Record<string, string | number> = { lang };
    if (platform === 'shortmax') params.page = 1;

    fetch(apiUrl(path, platform, params))
      .then(res => res.json())
      .then(data => {
        const list = extractList(data, platform);
        setDramas(normalizeDramaList(list, platform));
      })
      .catch(err => console.error('Failed to fetch dramas:', err))
      .finally(() => setLoading(false));
  }, [lang, platform]);

  return { dramas, loading };
};

/* ===== Infinite scroll (new dramas) ===== */
export const useInfiniteDramas = () => {
  const [dramas, setDramas] = useState<NormalizedDrama[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { lang } = useLanguage();
  const { platform } = usePlatform();

  const fetchDramas = useCallback(async (pageNum: number, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      let path: string;
      const params: Record<string, string | number> = { lang };

      if (platform === 'shortmax') {
        path = '/api/foryou';
        params.page = pageNum;
      } else {
        path = `/api/new/${pageNum}`;
        params.pageSize = 50;
      }

      const response = await fetch(apiUrl(path, platform, params));
      const data = await response.json();
      const list = extractList(data, platform);
      const normalized = normalizeDramaList(list, platform);

      if (isLoadMore) {
        setDramas(prev => [...prev, ...normalized]);
      } else {
        setDramas(normalized);
      }

      setHasMore(platform === 'shortmax' ? list.length >= 20 : list.length >= 50);
    } catch (error) {
      console.error('Failed to fetch dramas:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lang, platform]);

  useEffect(() => {
    setDramas([]);
    setPage(1);
    setHasMore(true);
    fetchDramas(1);
  }, [fetchDramas]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchDramas(nextPage, true);
    }
  }, [page, loadingMore, hasMore, fetchDramas]);

  return { dramas, loading, loadingMore, hasMore, loadMore };
};

/* ===== Rank dramas ===== */
export const useRankDramas = () => {
  const [dramas, setDramas] = useState<NormalizedDrama[]>([]);
  const [loading, setLoading] = useState(true);
  const { platform } = usePlatform();

  useEffect(() => {
    setLoading(true);
    setDramas([]);

    const path = platform === 'shortmax' ? '/api/foryou' : '/api/rank/1';
    const params: Record<string, string | number> = { lang: 'in' };
    if (platform === 'shortmax') params.page = 2;

    fetch(apiUrl(path, platform, params))
      .then(res => res.json())
      .then(data => {
        let list: any[];
        if (platform === 'shortmax') {
          const items = data?.data || [];
          list = items[0]?.items ? items.flatMap((s: any) => s.items) : items;
        } else {
          list = data?.data?.list || [];
        }
        setDramas(normalizeDramaList(list, platform));
      })
      .catch(err => console.error('Failed to fetch rank dramas:', err))
      .finally(() => setLoading(false));
  }, [platform]);

  return { dramas, loading };
};

/* ===== Search dramas ===== */
export const useSearchDramas = (query: string) => {
  const [dramas, setDramas] = useState<NormalizedDrama[]>([]);
  const [loading, setLoading] = useState(false);
  const { platform } = usePlatform();

  useEffect(() => {
    if (!query.trim()) {
      setDramas([]);
      return;
    }

    const fetchDramas = async () => {
      setLoading(true);
      try {
        let path: string;
        const params: Record<string, string | number> = { lang: 'in' };

        if (platform === 'shortmax') {
          path = '/api/search';
          params.q = query;
        } else {
          path = `/api/search/${encodeURIComponent(query)}/1`;
          params.pageSize = 20;
        }

        const response = await fetch(apiUrl(path, platform, params));
        const data = await response.json();
        const list = extractList(data, platform);
        setDramas(normalizeDramaList(list, platform));
      } catch (error) {
        console.error('Failed to search dramas:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchDramas, 300);
    return () => clearTimeout(debounce);
  }, [query, platform]);

  return { dramas, loading };
};

/* ===== Watch data (video playback) ===== */
export const useWatchData = (id: string | undefined, episode: number) => {
  const [watchData, setWatchData] = useState<NormalizedWatchData | null>(null);
  const [chapters, setChapters] = useState<NormalizedChapter[]>([]);
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const { platform } = usePlatform();

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const fetchData = async () => {
      try {
        if (platform === 'shortmax') {
          // ShortMax: path-based endpoints: /detail/{code} and /play/{code}?ep=X
          const [detailRes, playRes] = await Promise.all([
            fetch(apiUrl(`/api/detail/${id}`, platform, { lang })),
            fetch(apiUrl(`/api/play/${id}`, platform, { ep: episode, lang })),
          ]);

          const detailData = await detailRes.json();
          const playData = await playRes.json();

          const drama = detailData?.data;
          const epCount = drama?.episodes || 0;
          setTotalEpisodes(epCount);
          setChapters(normalizeChapters(null, platform, epCount));

          // Build watch data from play + detail
          const watchRaw = {
            name: drama?.name,
            cover: drama?.cover,
            summary: drama?.summary,
            video: playData?.data?.video,
          };
          setWatchData(normalizeWatchData(watchRaw, platform));
        } else {
          // DramaBox: fetch chapters list + watch data
          if (chapters.length === 0) {
            const chaptersRes = await fetch(apiUrl(`/api/chapters/${id}`, platform, { lang }));
            const chaptersData = await chaptersRes.json();
            const normalizedChapters = normalizeChapters(chaptersData, platform);
            setChapters(normalizedChapters);
            setTotalEpisodes(normalizedChapters.length);
          }

          const watchRes = await fetch(apiUrl(`/api/watch/${id}/${episode}`, platform, { lang, direction: 1 }));
          const watchResData = await watchRes.json();
          if (watchResData.success) {
            setWatchData(normalizeWatchData(watchResData.data, platform));
          }
        }
      } catch (error) {
        console.error('Failed to fetch watch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, episode, lang, platform]);

  return { watchData, chapters, totalEpisodes, loading };
};
