import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../store/language';
import { useSource } from '../store/source';
import { getProvider, type UnifiedDrama, type VideoData } from '../api/providers';

export type { UnifiedDrama as Drama };

export const useDramas = () => {
  const [dramas, setDramas] = useState<UnifiedDrama[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { lang } = useLanguage();
  const { source } = useSource();

  useEffect(() => {
    setDramas([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);

    const provider = getProvider(source);
    provider.getForYou(1, lang).then(({ dramas: list, hasMore: more }) => {
      setDramas(list);
      setHasMore(more);
      setPage(2);
    }).finally(() => setLoading(false));
  }, [lang, source]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);

    const provider = getProvider(source);
    provider.getForYou(page, lang).then(({ dramas: list, hasMore: more }) => {
      setDramas(prev => [...prev, ...list]);
      setHasMore(more);
      setPage(p => p + 1);
    }).finally(() => setLoading(false));
  }, [page, lang, source, loading, hasMore]);

  return { dramas, loading, hasMore, loadMore };
};

export const useDramaDetail = (code: string | undefined) => {
  const [drama, setDrama] = useState<UnifiedDrama | null>(null);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const { source } = useSource();

  useEffect(() => {
    if (!code) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const provider = getProvider(source);
        if (source === 'dramabox') {
          // For DramaBox, get chapters to know episode count
          const chapData = await (provider as any).getChapters(code, lang);
          // Drama info comes from URL params or local state, set episodes from chapters
          setDrama({
            id: code,
            name: '', // Will be overridden by Watch page state
            cover: '',
            episodes: chapData.episodes,
            source: 'dramabox',
          });
        } else {
          const detail = await provider.getDetail(code, lang);
          setDrama(detail);
        }
      } catch (error) {
        console.error('Error fetching drama detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [code, lang, source]);

  return { drama, loading };
};

export const useVideoPlayer = (code: string | undefined, episode: number) => {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const { source } = useSource();

  useEffect(() => {
    if (!code) return;

    const fetchVideo = async () => {
      setLoading(true);
      try {
        const provider = getProvider(source);
        const data = await provider.getVideo(code, episode, lang);
        setVideoData(data);
      } catch (error) {
        console.error('Error fetching video:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [code, episode, lang, source]);

  return { videoData, loading };
};

export const useRomanceDramas = () => {
  const [dramas, setDramas] = useState<UnifiedDrama[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const { source } = useSource();

  useEffect(() => {
    const provider = getProvider(source);
    provider.getRomance(lang)
      .then(list => setDramas(list))
      .catch(err => console.error('Error fetching romance/new:', err))
      .finally(() => setLoading(false));
  }, [lang, source]);

  return { dramas, loading };
};

export const useVipDramas = () => {
  const [dramas, setDramas] = useState<UnifiedDrama[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const { source } = useSource();

  useEffect(() => {
    const fetchVip = async () => {
      try {
        if (source === 'dramabox') {
          // DramaBox doesn't have VIP feed, use new releases
          const provider = getProvider(source);
          const list = await (provider as any).getNew(1, lang);
          setDramas(list);
        } else {
          const provider = getProvider(source);
          const data = await provider.getFeed('vip', lang);
          const items = data || [];
          if (items[0]?.items) {
            setDramas(items.flatMap((s: any) => s.items).map((d: any) => ({
              id: String(d.code || d.id),
              name: d.name || '',
              cover: d.cover || '',
              episodes: d.episodes || 0,
              summary: d.summary || '',
              source: 'shortmax' as const,
            })));
          } else {
            setDramas(items.map((d: any) => ({
              id: String(d.code || d.id),
              name: d.name || '',
              cover: d.cover || '',
              episodes: d.episodes || 0,
              summary: d.summary || '',
              source: 'shortmax' as const,
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching VIP/new dramas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVip();
  }, [lang, source]);

  return { dramas, loading };
};

export const useHomeDramas = (tab: number = 1) => {
  const [dramas, setDramas] = useState<UnifiedDrama[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const { source } = useSource();

  useEffect(() => {
    const fetchDramas = async () => {
      setLoading(true);
      try {
        if (source === 'shortmax') {
          const response = await fetch(`/api/home?tab=${tab}&lang=${lang}`);
          const data = await response.json();
          setDramas((data.data || []).map((d: any) => ({
            id: String(d.code || d.id),
            name: d.name || '',
            cover: d.cover || '',
            episodes: d.episodes || 0,
            summary: d.summary || '',
            source: 'shortmax' as const,
          })));
        } else {
          const provider = getProvider(source);
          const { dramas: list } = await provider.getForYou(1, lang);
          setDramas(list);
        }
      } catch (error) {
        console.error('Error fetching home dramas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDramas();
  }, [tab, lang, source]);

  return { dramas, loading };
};
