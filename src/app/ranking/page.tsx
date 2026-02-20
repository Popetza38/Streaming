'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { api } from '@/lib/api';
import { extractList, getDramaId, getDramaTitle, getDramaCover, getDramaTags, getEpisodeCount, getDramaViews, formatViews } from '@/lib/utils';
import { GridSkeleton } from '@/components/Skeleton';

export const dynamic = 'force-dynamic';

export default function RankingPage() {
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
      const data = await api.getRanking(pageNum);
      const list = extractList(data);

      if (pageNum === 1) {
        setDramas(list);
      } else {
        setDramas((prev) => [...prev, ...list]);
      }

      setHasMore(list.length > 0);
    } catch (error) {
      console.error('Error loading ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadDramas(nextPage);
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-gray-600 to-gray-700';
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/10 to-transparent';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/10 to-transparent';
    if (rank === 3) return 'bg-gradient-to-r from-orange-500/10 to-transparent';
    return '';
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">อันดับซีรีส์ยอดนิยม</h1>

        {loading && dramas.length === 0 ? (
          <GridSkeleton />
        ) : (
          <>
            <div className="space-y-4">
              {dramas.map((drama, index) => {
                const rank = index + 1;
                const dramaId = getDramaId(drama);
                const title = getDramaTitle(drama);
                const cover = getDramaCover(drama);
                const tags = getDramaTags(drama);
                const episodeCount = getEpisodeCount(drama);
                const views = getDramaViews(drama);

                return (
                  <Link
                    key={index}
                    href={`/drama/${dramaId}`}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all hover:bg-dark-elevated ${getRankBg(rank)}`}
                  >
                    <div className={`w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br ${getRankBadgeColor(rank)} flex items-center justify-center font-bold text-xl shadow-lg`}>
                      {rank}
                    </div>

                    <div className="relative w-20 h-28 flex-shrink-0">
                      <Image
                        src={cover}
                        alt={title}
                        fill
                        className="object-cover rounded"
                        sizes="80px"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1">{title}</h3>

                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-2 py-1 bg-dark-card rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        {episodeCount > 0 && <span>{episodeCount} ตอน</span>}
                        {views > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {formatViews(views)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
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
        )}
      </div>
    </div>
  );
}
