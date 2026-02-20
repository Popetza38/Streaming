'use client';

import { useState, useEffect } from 'react';
import DramaCard from '@/components/DramaCard';
import { GridSkeleton } from '@/components/Skeleton';
import { api } from '@/lib/api';
import { extractList } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default function NewReleasesPage() {
  const [dramas, setDramas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadDramas(1);
  }, []);

  const loadDramas = async (pageNum: number) => {
    setLoading(true);
    try {
      const data = await api.getNewReleases(pageNum, 20);
      const list = extractList(data);

      if (pageNum === 1) {
        setDramas(list);
      } else {
        setDramas((prev) => [...prev, ...list]);
      }

      setHasMore(list.length > 0);
    } catch (error) {
      console.error('Error loading new releases:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadDramas(nextPage);
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">เรื่องใหม่ล่าสุด</h1>

        {loading && dramas.length === 0 ? (
          <GridSkeleton count={20} />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {dramas.map((drama, index) => (
                <DramaCard key={index} drama={drama} />
              ))}
            </div>

            {hasMore && dramas.length > 0 && (
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
        )}
      </div>
    </div>
  );
}
