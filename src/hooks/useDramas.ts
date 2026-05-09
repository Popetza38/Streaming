import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../store/language';

interface TagDetail {
  tagId: number;
  tagName: string;
}

interface Drama {
  bookId: string;
  bookName: string;
  introduction: string;
  cover: string;
  coverWap?: string;
  bannerUrl?: string;
  chapterCount: number;
  playCount: string;
  tags: string[];
  tagV3s?: TagDetail[];
  tagDetails?: TagDetail[];
  corner?: {
    cornerType: number;
    name: string;
    color: string;
  };
  rank?: {
    rankType: number;
    hotCode: string;
    recCopy: string;
    sort: number;
  };
}

export const useDramas = () => {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();

  useEffect(() => {
    const fetchDramas = async () => {
      try {
        const response = await fetch(`/api/home?page=1&size=10&lang=${lang}`);
        const data = await response.json();
        const isSuccess = data.success || data.data?.success || data.code === 0;
        if (isSuccess) {
          const list = data.data?.data?.classifyBookList?.records || 
                       data.data?.classifyBookList?.records || 
                       data.data?.list || 
                       data.list || [];
          setDramas(list);
        }
      } catch (error) {
        console.error('Failed to fetch dramas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDramas();
  }, [lang]);

  return { dramas, loading };
};

export const useInfiniteDramas = () => {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { lang } = useLanguage();

  const fetchDramas = useCallback(async (pageNum: number, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(`/api/home?page=${pageNum}&size=100&lang=${lang}`);
      const data = await response.json();

      const isSuccess = data.success || data.data?.success || data.code === 0;
      if (isSuccess) {
        const newDramas = data.data?.data?.classifyBookList?.records ||
                          data.data?.classifyBookList?.records ||
                          data.data?.list ||
                          data.list || [];

        if (isLoadMore) {
          setDramas((prev: Drama[]) => [...prev, ...newDramas]);
        } else {
          setDramas(newDramas);
        }

        // Check if we got a full page of results
        const totalRecords = data.data?.data?.classifyBookList?.total ||
                            data.data?.classifyBookList?.total ||
                            data.data?.total || 0;
        const currentTotal = isLoadMore ? dramas.length + newDramas.length : newDramas.length;
        setHasMore(currentTotal < totalRecords && newDramas.length === 100);
      }
    } catch (error) {
      console.error('Failed to fetch dramas:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lang]);

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

  useEffect(() => {
    const fetchDramas = async () => {
      try {
        const response = await fetch('/api/rank?lang=th');
        const data = await response.json();
        const isSuccess = data.success || data.data?.success || data.code === 0;
        if (isSuccess) {
          const list = data.data?.data?.rankList || 
                       data.data?.rankList || 
                       data.data?.list || 
                       data.list || [];
          setDramas(list);
        }
      } catch (error) {
        console.error('Failed to fetch rank dramas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDramas();
  }, []);

  return { dramas, loading };
};

export const useSearchDramas = (query: string) => {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setDramas([]);
      return;
    }

    const fetchDramas = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?keyword=${encodeURIComponent(query)}&page=1&lang=th&pageSize=20`);
        const data = await response.json();
        const isSuccess = data.success || data.data?.success || data.code === 0;
        if (isSuccess) {
          const list = data.data?.data?.searchList ||
                       data.data?.searchList ||
                       data.data?.list ||
                       data.list || [];
          setDramas(list);
        }
      } catch (error) {
        console.error('Failed to search dramas:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchDramas, 300);
    return () => clearTimeout(debounce);
  }, [query]);

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

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        // First fetch to get available tags
        const homeResponse = await fetch(`/api/home?page=1&size=20&lang=${lang}`);
        const homeData = await homeResponse.json();

        const isSuccess = homeData.success || homeData.data?.success || homeData.code === 0;
        if (!isSuccess) {
          setLoading(false);
          return;
        }

        const dramas = homeData.data?.data?.classifyBookList?.records ||
                       homeData.data?.classifyBookList?.records ||
                       homeData.data?.list ||
                       homeData.list || [];

        // Extract unique tags
        const allTags = new Map<number, string>();
        dramas.forEach((drama: Drama) => {
          const tags = drama.tagV3s || drama.tagDetails || [];
          tags.forEach((tag: TagDetail) => {
            if (!allTags.has(tag.tagId) && allTags.size < 8) {
              allTags.set(tag.tagId, tag.tagName);
            }
          });
        });

        // Fetch dramas for each category
        const categoryPromises = Array.from(allTags).map(async ([tagId, tagName]) => {
          try {
            const response = await fetch(`/api/search?keyword=${encodeURIComponent(tagName)}&page=1&lang=${lang}&pageSize=12`);
            const data = await response.json();
            const isSuccess = data.success || data.data?.success || data.code === 0;
            if (isSuccess) {
              const list = data.data?.data?.searchList ||
                           data.data?.data?.classifyBookList?.records ||
                           data.data?.searchList ||
                           data.data?.classifyBookList?.records ||
                           data.data?.list ||
                           data.list || [];
              return { tagId, tagName, dramas: list.slice(0, 8) as Drama[] };
            }
            return { tagId, tagName, dramas: [] };
          } catch {
            return { tagId, tagName, dramas: [] };
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
  }, [lang]);

  return { categories, loading };
};
