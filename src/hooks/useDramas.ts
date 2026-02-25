import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../store/language';
import { usePlatform } from '../store/platform';
import type { Platform } from '../store/platform';
import {
  normalizeDramaList,
  normalizeWatchData,
  normalizeChapters,
  extractList,
  type NormalizedDrama,
  type NormalizedWatchData,
  type NormalizedChapter,
} from '../utils/normalize';

// In-memory cache for details and chapters to speed up episode transitions
const detailCache: Record<string, any> = {};
const chaptersCache: Record<string, any> = {};

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

    let path: string;
    const params: Record<string, string | number> = { lang };

    if (platform === 'shortbox') {
      path = '/api/list';
      params.page = 1;
      params.page_size = 30;
      params.languages = lang;
    } else if (platform === 'shortmax') {
      path = '/api/foryou';
      params.page = 1;
    } else {
      path = '/api/foryou/1';
    }

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

      if (platform === 'shortbox') {
        path = '/api/list';
        params.page = pageNum;
        params.page_size = 30;
        params.languages = lang;
      } else if (platform === 'shortmax') {
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

      setHasMore(
        platform === 'shortbox' ? list.length >= 20 :
          platform === 'shortmax' ? list.length >= 20 :
            list.length >= 50
      );
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

    let path: string;
    const params: Record<string, string | number> = { lang: 'in' };

    if (platform === 'shortbox') {
      path = '/api/new-list';
      params.page = 1;
      params.page_size = 30;
      params.languages = 'en';
    } else if (platform === 'shortmax') {
      path = '/api/foryou';
      params.page = 2;
    } else {
      path = '/api/rank/1';
    }

    fetch(apiUrl(path, platform, params))
      .then(res => res.json())
      .then(data => {
        let list: any[];
        if (platform === 'shortbox') {
          list = extractList(data, platform);
        } else if (platform === 'shortmax') {
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

        if (platform === 'shortbox') {
          path = '/api/search';
          params.q = query;
          params.page = 1;
          params.page_size = 30;
          params.languages = 'en';
        } else if (platform === 'shortmax') {
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
export const useWatchData = (id: string | undefined, episode: number, platformOverride?: string) => {
  const [watchData, setWatchData] = useState<NormalizedWatchData | null>(null);
  const [chapters, setChapters] = useState<NormalizedChapter[]>([]);
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const { platform: storePlatform } = usePlatform();
  const platform = (platformOverride || storePlatform) as Platform;

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const fetchData = async () => {
      try {
        if (platform === 'shortbox') {
          const cacheKey = `${platform}_${id}_${lang}`;
          let detailInner, epsInner;

          if (detailCache[cacheKey] && chaptersCache[cacheKey]) {
            detailInner = detailCache[cacheKey];
            epsInner = chaptersCache[cacheKey];
          } else {
            // ShortBox: /detail/{id} + /episodes/{id}
            const [detailRes, epsRes] = await Promise.all([
              fetch(apiUrl(`/api/detail/${id}`, platform, { languages: lang })),
              fetch(apiUrl(`/api/episodes/${id}`, platform, { index: 1, count: 200, languages: lang })),
            ]);

            const detailData = await detailRes.json();
            const epsData = await epsRes.json();

            // ShortBox API responses may be double-nested: { data: { code, data: { ... } } }
            detailInner = detailData?.data?.data ?? detailData?.data ?? detailData;
            epsInner = epsData?.data?.data ?? epsData?.data ?? epsData;

            detailCache[cacheKey] = detailInner;
            chaptersCache[cacheKey] = epsInner;
          }

          const drama = detailInner;
          const episodes = epsInner?.episodes || [];
          const epCount = episodes.length || drama?.total || 0;
          setTotalEpisodes(epCount);
          setChapters(normalizeChapters({ data: epsInner }, platform, epCount));

          // Find the episode to play
          const ep = episodes[episode - 1];
          if (ep) {
            const pil = ep.play_info_list || [];
            let playUrl = '', playAuth = '', kid = '';
            let qualities: any[] = [];

            if (pil.length > 0) {
              const sorted = [...pil].sort((a: any, b: any) => (b.Height || 0) - (a.Height || 0));
              const best = sorted[0];
              playUrl = best.MainPlayUrl || best.BackupPlayUrl || '';
              playAuth = best.PlayAuth || '';
              kid = best.PlayAuthId || '';
              qualities = sorted.map((q: any) => ({
                url: q.MainPlayUrl || q.BackupPlayUrl || '',
                playAuth: q.PlayAuth || '',
                kid: q.PlayAuthId || '',
                height: q.Height || 0,
                label: q.Height ? `${q.Height}p` : 'Default',
              }));
            }

            // If no play_info_list, try play_auth_token
            if (!playUrl && ep.play_auth_token) {
              try {
                const token = JSON.parse(atob(ep.play_auth_token));
                const vodUrl = 'https://vod.byteplusapi.com?' + token.GetPlayInfoToken;
                const r = await fetch(`/sb-proxy?url=${encodeURIComponent(vodUrl)}`);
                const vod = await r.json();
                const playInfoList = vod?.Result?.PlayInfoList || [];
                if (playInfoList.length > 0) {
                  const sorted = [...playInfoList].sort((a: any, b: any) => (b.Height || 0) - (a.Height || 0));
                  const best = sorted[0];
                  playUrl = best.MainPlayUrl || best.BackupPlayUrl || '';
                  playAuth = best.PlayAuth || '';
                  kid = best.PlayAuthId || '';
                  qualities = sorted.map((q: any) => ({
                    url: q.MainPlayUrl || q.BackupPlayUrl || '',
                    playAuth: q.PlayAuth || '',
                    kid: q.PlayAuthId || '',
                    height: q.Height || 0,
                    label: q.Height ? `${q.Height}p` : 'Default',
                  }));
                }
              } catch (e) {
                console.error('VOD fetch error:', e);
              }
            }

            // Derive key and build proxy URL
            let finalUrl = playUrl;
            if (playAuth && kid) {
              try {
                await fetch(`/derive-key?playAuth=${encodeURIComponent(playAuth)}&kid=${encodeURIComponent(kid)}`);
                finalUrl = `/sb-proxy?url=${encodeURIComponent(playUrl)}&kid=${encodeURIComponent(kid)}`;
              } catch (e) {
                console.error('Key derivation failed:', e);
              }
            } else if (playUrl) {
              finalUrl = `/sb-proxy?url=${encodeURIComponent(playUrl)}`;
            }

            const imgUrl = drama?.cover_image || drama?.cover_image_thumb?.thumb || '';

            setWatchData(normalizeWatchData({
              name: drama?.title ?? '',
              cover: imgUrl ? `/img?url=${encodeURIComponent(imgUrl)}` : '',
              videoUrl: finalUrl,
              summary: drama?.desc ?? '',
              playAuth,
              kid,
              qualities,
            }, platform));
          }
        } else if (platform === 'shortmax') {
          const cacheKey = `${platform}_${id}_${lang}`;

          let drama;
          if (detailCache[cacheKey]) {
            drama = detailCache[cacheKey];
          } else {
            const detailRes = await fetch(apiUrl(`/api/detail/${id}`, platform, { lang }));
            const detailData = await detailRes.json();
            drama = detailData?.data;
            detailCache[cacheKey] = drama;
          }

          // ShortMax: path-based endpoints: /play/{code}?ep=X
          const playRes = await fetch(apiUrl(`/api/play/${id}`, platform, { ep: episode, lang }));
          const playData = await playRes.json();

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
            const cacheKey = `${platform}_${id}_${lang}`;
            let chaptersData;

            if (chaptersCache[cacheKey]) {
              chaptersData = chaptersCache[cacheKey];
            } else {
              const chaptersRes = await fetch(apiUrl(`/api/chapters/${id}`, platform, { lang }));
              chaptersData = await chaptersRes.json();
              chaptersCache[cacheKey] = chaptersData;
            }

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
