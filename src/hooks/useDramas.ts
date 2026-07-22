import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../store/language';
import { usePlatform } from '../store/platform';

export interface TagDetail {
  tagId: number;
  tagName: string;
  tagEnName?: string;
}

export interface Drama {
  id: string;
  bookId: string;
  title: string;
  bookName: string;
  description: string;
  introduction: string;
  cover: string;
  coverWap?: string;
  chapterCount?: number;
  episodesCount?: number;
  playCount?: string;
  tags?: string[];
  tagDetails?: TagDetail[];
}

function formatPlayCount(val: any, idStr: string): string {
  if (val) {
    const s = String(val).trim();
    if (s.length > 0) {
      if (/^\d+$/.test(s)) {
        const num = parseInt(s, 10);
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M ครั้ง';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k ครั้ง';
        return num + ' ครั้ง';
      }
      return s.includes('ครั้ง') || s.includes('k') || s.includes('M') ? s : s + ' ครั้ง';
    }
  }
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash * 31 + idStr.charCodeAt(i)) % 999;
  }
  const kVal = (hash % 850 + 50).toFixed(1);
  return `${kVal}k ครั้ง`;
}

const normalizeDrama = (raw: any): Drama => {
  const id = String(raw.id || raw.bookId || raw.dramaId || '');
  const title = raw.title || raw.bookName || raw.dramaName || raw.name || 'Drama';
  const description = raw.description || raw.introduction || raw.summary || '';
  const cover = raw.cover || raw.coverWap || raw.poster || raw.img || '';
  const rawPlay = raw.playCount || raw.playAmount || raw.viewCount || raw.views || raw.hotCode || raw.readCount;

  return {
    id,
    bookId: id,
    title,
    bookName: title,
    description,
    introduction: description,
    cover,
    coverWap: cover,
    chapterCount: raw.chapterCount || raw.episodesCount || raw.episodes || 0,
    episodesCount: raw.chapterCount || raw.episodesCount || raw.episodes || 0,
    playCount: formatPlayCount(rawPlay, id),
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    tagDetails: Array.isArray(raw.tagDetails) ? raw.tagDetails : []
  };
};

const extractList = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.list)) return data.list;
  if (Array.isArray(data.dramas)) return data.dramas;
  if (Array.isArray(data.books)) return data.books;
  if (Array.isArray(data.records)) return data.records;
  if (Array.isArray(data.data)) return data.data;
  if (data.data && Array.isArray(data.data.items)) return data.data.items;
  if (data.data && Array.isArray(data.data.list)) return data.data.list;
  if (data.data && Array.isArray(data.data.dramas)) return data.data.dramas;
  if (data.data && Array.isArray(data.data.books)) return data.data.books;
  return [];
};


export const useDramas = () => {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const { platform } = usePlatform();

  useEffect(() => {
    const fetchDramas = async () => {
      setLoading(true);
      try {
        const pages = [1, 2, 3, 4, 5];
        const pagePromises = pages.map(p =>
          fetch(`/api/${platform}/foryou?page=${p}&lang=${lang}`)
            .then(res => res.json())
            .catch(() => null)
        );
        const results = await Promise.all(pagePromises);
        const allRaw: Drama[] = [];
        const seenIds = new Set<string>();

        results.forEach(data => {
          const list = extractList(data);
          list.forEach(item => {
            const drama = normalizeDrama(item);
            if (drama.id && !seenIds.has(drama.id)) {
              seenIds.add(drama.id);
              allRaw.push(drama);
            }
          });
        });

        setDramas(allRaw);
      } catch (error) {
        console.error('Failed to fetch dramas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDramas();
  }, [lang, platform]);

  return { dramas, loading };
};

export const useInfiniteDramas = () => {
  const [dramas, setDramas] = useState<Drama[]>([]);
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
      const response = await fetch(`/api/${platform}/foryou?page=${pageNum}&lang=${lang}`);
      const data = await response.json();
      const rawList = extractList(data);
      const normalized = rawList.map(normalizeDrama);

      if (isLoadMore) {
        setDramas((prev) => {
          const existingIds = new Set(prev.map(d => d.id));
          const newItems = normalized.filter(d => !existingIds.has(d.id));
          return [...prev, ...newItems];
        });
      } else {
        setDramas(normalized);
      }

      setHasMore(normalized.length > 0 && pageNum < 15);
    } catch (error) {
      console.error('Failed to fetch dramas:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lang, platform]);

  useEffect(() => {
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

export const useRankDramas = () => {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const { platform } = usePlatform();

  useEffect(() => {
    const fetchDramas = async () => {
      setLoading(true);
      try {
        const pages = [1, 2, 3, 4, 5];
        const pagePromises = pages.map(p =>
          fetch(`/api/${platform}/trending?page=${p}&lang=${lang}`)
            .then(res => res.json())
            .catch(() => null)
        );
        const results = await Promise.all(pagePromises);
        const allRaw: Drama[] = [];
        const seenIds = new Set<string>();

        results.forEach(data => {
          const list = extractList(data);
          list.forEach(item => {
            const drama = normalizeDrama(item);
            if (drama.id && !seenIds.has(drama.id)) {
              seenIds.add(drama.id);
              allRaw.push(drama);
            }
          });
        });

        setDramas(allRaw);
      } catch (error) {
        console.error('Failed to fetch rank dramas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDramas();
  }, [lang, platform]);

  return { dramas, loading };
};

export const useSearchDramas = (query: string) => {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(false);
  const { lang } = useLanguage();
  const { platform } = usePlatform();

  useEffect(() => {
    if (!query.trim()) {
      setDramas([]);
      return;
    }

    const fetchDramas = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/${platform}/search?q=${encodeURIComponent(query)}&lang=${lang}`);
        const data = await response.json();
        const rawList = extractList(data);
        setDramas(rawList.map(normalizeDrama));
      } catch (error) {
        console.error('Failed to search dramas:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchDramas, 300);
    return () => clearTimeout(debounce);
  }, [query, lang, platform]);

  return { dramas, loading };
};

interface CategorySection {
  tagId: number;
  tagName: string;
  dramas: Drama[];
}

export const useCategories = () => {
  const [categories, setCategories] = useState<CategorySection[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const { platform } = usePlatform();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const trendingRes = await fetch(`/api/${platform}/trending?lang=${lang}`);
        const trendingData = await trendingRes.json();
        const rawList = extractList(trendingData);
        const normalizedList = rawList.map(normalizeDrama);

        let tagNames = new Set<string>();
        for (const item of normalizedList.slice(0, 3)) {
          if (item.tags && item.tags.length > 0) {
            item.tags.forEach(t => tagNames.add(t));
          } else {
            try {
              const detailRes = await fetch(`/api/${platform}/detail?id=${item.id}&lang=${lang}`);
              const detailData = await detailRes.json();
              if (detailData.tags && Array.isArray(detailData.tags)) {
                detailData.tags.forEach((t: string) => tagNames.add(t));
              }
            } catch {
              // ignore
            }
          }
        }

        const tagList = Array.from(tagNames).slice(0, 6);
        if (tagList.length === 0) {
          tagList.push('Love', 'Revenge', 'Billionaire', 'Boss', 'Romance');
        }

        const categoryPromises = tagList.map(async (tagName, idx) => {
          try {
            const res = await fetch(`/api/${platform}/search?q=${encodeURIComponent(tagName)}&lang=${lang}`);
            const searchData = await res.json();
            const results = extractList(searchData).map(normalizeDrama);
            return { tagId: idx + 1, tagName, dramas: results.slice(0, 8) };
          } catch {
            return { tagId: idx + 1, tagName, dramas: [] };
          }
        });

        const results = await Promise.all(categoryPromises);
        setCategories(results.filter(cat => cat.dramas.length > 0));
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [lang, platform]);

  return { categories, loading };
};
