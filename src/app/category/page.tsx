'use client';

import { useState, useEffect } from 'react';
import DramaCard from '@/components/DramaCard';
import GenreFilter from '@/components/GenreFilter';
import { GridSkeleton } from '@/components/Skeleton';
import { api } from '@/lib/api';
import { extractList, extractGenres } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default function CategoryPage() {
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sort, setSort] = useState(1);
  const [dramas, setDramas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadGenres();
  }, []);

  useEffect(() => {
    setDramas([]);
    setPage(1);
    setHasMore(true);
    loadDramas(selectedGenre, 1, sort);
  }, [selectedGenre, sort]);

  const loadGenres = async () => {
    try {
      const data = await api.getClassify();
      const genreList = extractGenres(data);
      setGenres(genreList);
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const loadDramas = async (genreId: string, pageNum: number, sortType: number) => {
    setLoading(true);
    try {
      const data = await api.getClassify(genreId || undefined, pageNum, sortType);
      const list = extractList(data);

      if (pageNum === 1) {
        setDramas(list);
      } else {
        setDramas((prev) => [...prev, ...list]);
      }

      setHasMore(list.length > 0);
    } catch (error) {
      console.error('Error loading dramas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadDramas(selectedGenre, nextPage, sort);
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">หมวดหมู่ซีรีส์</h1>

        <GenreFilter
          genres={genres}
          selectedGenre={selectedGenre}
          onGenreChange={setSelectedGenre}
        />

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setSort(1)}
            className={`px-4 py-2 rounded-lg transition-colors ${sort === 1 ? 'bg-primary text-white' : 'bg-dark-elevated hover:bg-dark-card'
              }`}
          >
            ยอดนิยม
          </button>
          <button
            onClick={() => setSort(2)}
            className={`px-4 py-2 rounded-lg transition-colors ${sort === 2 ? 'bg-primary text-white' : 'bg-dark-elevated hover:bg-dark-card'
              }`}
          >
            ล่าสุด
          </button>
          <button
            onClick={() => setSort(3)}
            className={`px-4 py-2 rounded-lg transition-colors ${sort === 3 ? 'bg-primary text-white' : 'bg-dark-elevated hover:bg-dark-card'
              }`}
          >
            Rating
          </button>
        </div>

        {loading && dramas.length === 0 ? (
          <GridSkeleton />
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
