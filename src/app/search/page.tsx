'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import DramaCard from '@/components/DramaCard';
import { GridSkeleton } from '@/components/Skeleton';
import { api } from '@/lib/api';
import { extractList } from '@/lib/utils';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (query) {
      setResults([]);
      setPage(1);
      setHasMore(true);
      searchDramas(query, 1);
    }
  }, [query]);

  const searchDramas = async (keyword: string, pageNum: number) => {
    setLoading(true);
    try {
      const data = await api.search(keyword, pageNum);
      const list = extractList(data);

      if (pageNum === 1) {
        setResults(list);
      } else {
        setResults((prev) => [...prev, ...list]);
      }

      setHasMore(list.length > 0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    searchDramas(query, nextPage);
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl font-bold mb-6 text-center">ค้นหาซีรีส์</h1>
          <SearchBar fullPage />
        </div>

        {query && (
          <div className="mb-6">
            <p className="text-gray-400">
              ผลการค้นหาสำหรับ: <span className="text-white font-semibold">{query}</span>
            </p>
          </div>
        )}

        {loading && results.length === 0 ? (
          <GridSkeleton />
        ) : results.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((drama, index) => (
                <DramaCard key={index} drama={drama} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-primary hover:bg-primary/90 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? 'กำลังโหลด...' : 'โหลดเพิ่มเติม'}
                </button>
              </div>
            )}
          </>
        ) : query ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">ไม่พบผลลัพธ์สำหรับ &quot;{query}&quot;</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">พิมพ์คำค้นหาเพื่อค้นหาซีรีส์</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="pt-16 min-h-screen"><GridSkeleton /></div>}>
      <SearchContent />
    </Suspense>
  );
}
