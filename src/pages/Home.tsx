import { Play, Users, Clock, Star } from 'lucide-react';
import { useDramas, useInfiniteDramas, useRankDramas } from '../hooks/useDramas';
import { Link } from 'react-router-dom';
import { useEffect, useCallback } from 'react';
import HeroBanner from '../components/HeroBanner';
import Carousel from '../components/Carousel';
import { useWatchHistory } from '../store/watchHistory';
import { usePlatform, platforms } from '../store/platform';
import { usePageMeta } from '../hooks/usePageMeta';
import type { NormalizedDrama } from '../utils/normalize';

/* ===== Skeleton Loaders ===== */
const SkeletonBanner = () => <div className="skeleton skeleton-banner" />;

const SkeletonCards = ({ count = 6 }: { count?: number }) => (
  <div className="carousel-scroll">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="skeleton-card">
        <div className="skeleton skeleton-card-poster" />
        <div className="skeleton skeleton-card-title" />
        <div className="skeleton skeleton-card-sub" />
      </div>
    ))}
  </div>
);

/* ===== Continue Watching Card ===== */
const ContinueWatchingItem = ({ item }: { item: any }) => {
  const progress = item.videoDuration > 0 ? (item.videoTime / item.videoDuration) * 100 : 0;
  const timeAgo = getTimeAgo(item.timestamp);

  return (
    <Link
      to={`/watch/${item.bookId}?p=${item.platform || 'dramabox'}`}
      className="drama-card flex-shrink-0"
      style={{ width: 140 }}
    >
      <div className="drama-poster relative">
        <img src={item.cover} alt={item.bookName} loading="lazy" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
          <div className="h-full bg-red-500 rounded-r" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
        <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded shadow-lg z-10 overflow-hidden" style={{ backgroundColor: item.platform === 'shortmax' ? '#7c3aed' : item.platform === 'flextv' ? '#3b82f6' : '#e50914' }}>
          <img src={`/logos/${item.platform || 'dramabox'}.png`} alt="" className="w-full h-full object-contain" />
        </div>
        <div className="absolute top-1.5 right-1.5 bg-black/70 text-[10px] text-white px-1.5 py-0.5 rounded">
          EP {item.episode}
        </div>
        <div className="drama-overlay">
          <div className="drama-overlay-play">
            <Play size={18} className="text-white ml-0.5" />
          </div>
        </div>
      </div>
      <h3 className="text-xs font-medium line-clamp-1 mt-1.5 mb-0.5">
        {item.bookName.trim()}
      </h3>
      <div className="flex items-center gap-1 text-[10px] text-zinc-500">
        <Clock size={10} />
        <span>{timeAgo}</span>
      </div>
    </Link>
  );
};

function getTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ===== Star Rating (inline) ===== */
const InlineStarRating = ({ score }: { score: number }) => {
  const fullStars = Math.floor(score);
  const hasHalf = score - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`f-${i}`} size={10} className="text-yellow-400 fill-yellow-400" />
      ))}
      {hasHalf && (
        <div className="relative" style={{ width: 10, height: 10 }}>
          <Star size={10} className="text-zinc-600 absolute inset-0" />
          <div className="overflow-hidden absolute inset-0" style={{ width: '50%' }}>
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
          </div>
        </div>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`e-${i}`} size={10} className="text-zinc-600" />
      ))}
      <span className="text-[10px] text-yellow-400 font-semibold ml-0.5">{score.toFixed(1)}</span>
    </div>
  );
};

/* ===== Drama Card (inline) ===== */
const DramaItem = ({ drama, platform }: { drama: NormalizedDrama; platform: string }) => (
  <Link
    to={`/watch/${drama.id}?p=${platform}`}
    className="drama-card"
    style={{ width: 150 }}
  >
    <div className="drama-poster">
      <img src={drama.cover} alt={drama.name} loading="lazy" />
      {drama.corner && (
        <div
          className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg z-10"
          style={{ backgroundColor: drama.corner.color }}
        >
          {drama.corner.name}
        </div>
      )}
      {drama.rank && (
        <div className="absolute bottom-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg z-10">
          🔥 {drama.rank.hotCode}
        </div>
      )}
      <div className="drama-overlay">
        <div className="drama-overlay-play">
          <Play size={18} className="text-white ml-0.5" />
        </div>
      </div>
    </div>
    <h3 className="text-sm font-medium line-clamp-2 mt-2 mb-1">
      {drama.name}
    </h3>
    {drama.score != null && drama.score > 0 && (
      <InlineStarRating score={drama.score} />
    )}
    <div className="flex items-center gap-1 text-xs text-muted">
      <Users size={11} />
      <span>{drama.playCount || `${drama.episodes} ep`}</span>
    </div>
  </Link>
);

/* ===== Ranked Drama Card (Top 10) ===== */
const RankedDramaItem = ({ drama, platform, rank }: { drama: NormalizedDrama; platform: string; rank: number }) => (
  <Link
    to={`/watch/${drama.id}?p=${platform}`}
    className="drama-card relative"
    style={{ width: 140 }}
  >
    {/* Large Rank Number */}
    <div className="absolute -left-3 bottom-8 text-[80px] font-black leading-none tracking-tighter text-white drop-shadow-2xl z-20"
      style={{ WebkitTextStroke: '2px rgba(255,255,255,0.2)', color: 'transparent', userSelect: 'none' }}>
      {rank}
    </div>

    <div className="drama-poster ml-6">
      <img src={drama.cover} alt={drama.name} loading="lazy" />
      {drama.corner && (
        <div
          className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg z-10"
          style={{ backgroundColor: drama.corner.color }}
        >
          {drama.corner.name}
        </div>
      )}
      <div className="drama-overlay">
        <div className="drama-overlay-play">
          <Play size={18} className="text-white ml-0.5" />
        </div>
      </div>
    </div>
    <h3 className="text-sm font-medium line-clamp-2 mt-2 mb-1 ml-6">
      {drama.name}
    </h3>
  </Link>
);

/* ===== Grid Drama Card ===== */
const GridDramaItem = ({ drama, platform }: { drama: NormalizedDrama; platform: string }) => (
  <Link to={`/watch/${drama.id}?p=${platform}`} className="drama-card block">
    <div className="drama-poster">
      <img src={drama.cover} alt={drama.name} loading="lazy" />
      {drama.corner && (
        <div
          className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg z-10"
          style={{ backgroundColor: drama.corner.color }}
        >
          {drama.corner.name}
        </div>
      )}
      {drama.rank && (
        <div className="absolute bottom-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg z-10">
          🔥 {drama.rank.hotCode}
        </div>
      )}
      <div className="drama-overlay">
        <div className="drama-overlay-play">
          <Play size={18} className="text-white ml-0.5" />
        </div>
      </div>
    </div>
    <h3 className="text-sm font-medium line-clamp-2 mt-2 mb-1">
      {drama.name}
    </h3>
    {drama.tags && drama.tags.length > 0 && (
      <div className="flex flex-wrap gap-1 mb-1.5 h-3.5 overflow-hidden">
        {drama.tags.slice(0, 2).map((tag, idx) => {
          const label = typeof tag === 'string' ? tag : (tag as any)?.tag_name ?? '';
          if (!label) return null;
          return (
            <span key={idx} className="text-[10px] px-1 font-medium bg-zinc-800 text-zinc-300 rounded leading-tight">
              {label}
            </span>
          );
        })}
      </div>
    )}
    <div className="flex items-center justify-between">
      {drama.score != null && drama.score > 0 ? (
        <InlineStarRating score={drama.score} />
      ) : <div />}
      <div className="flex items-center gap-1 text-[10px] text-muted">
        <Users size={10} />
        <span>{drama.playCount || `${drama.episodes} ep`}</span>
      </div>
    </div>
  </Link>
);

const Home = () => {
  const { dramas: featuredDramas, loading: featuredLoading } = useDramas();
  const { dramas: rankDramas, loading: rankLoading } = useRankDramas();
  const { dramas, loading, loadingMore, hasMore, loadMore } = useInfiniteDramas();
  const { history } = useWatchHistory();
  const { platform } = usePlatform();
  const currentPlatformInfo = platforms.find(p => p.id === platform);
  usePageMeta();

  // Infinite scroll
  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
      if (hasMore && !loadingMore) loadMore();
    }
  }, [hasMore, loadingMore, loadMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="space-y-8 pt-2 pb-4">
      {/* ===== Hero Banner ===== */}
      {featuredLoading ? (
        <SkeletonBanner />
      ) : (
        <HeroBanner dramas={featuredDramas} />
      )}

      {/* ===== Continue Watching ===== */}
      {history.filter(h => (h.platform || 'dramabox') === platform).length > 0 && (
        <Carousel title={`${currentPlatformInfo?.icon || '⏯️'} Continue Watching · ${currentPlatformInfo?.name || 'DramaBox'}`}>
          {history.filter(h => (h.platform || 'dramabox') === platform).slice(0, 10).map((item) => (
            <ContinueWatchingItem key={item.bookId} item={item} />
          ))}
        </Carousel>
      )}

      {/* ===== For You Carousel ===== */}
      {featuredLoading ? (
        <div>
          <div className="skeleton" style={{ width: 100, height: 20, marginBottom: 14 }} />
          <SkeletonCards />
        </div>
      ) : featuredDramas.length > 1 ? (
        <Carousel title="🎬 For You">
          {featuredDramas.slice(1).map((drama, i) => (
            <DramaItem key={`fy-${drama.id}-${i}`} drama={drama} platform={platform} />
          ))}
        </Carousel>
      ) : null}

      <div className="section-divider" />

      {/* ===== Trending / Rank Carousel ===== */}
      {rankLoading ? (
        <div>
          <div className="skeleton" style={{ width: 120, height: 20, marginBottom: 14 }} />
          <SkeletonCards />
        </div>
      ) : rankDramas.length > 0 ? (
        <Carousel title="🔥 Top 10 Trending">
          {rankDramas.slice(0, 10).map((drama, i) => (
            <RankedDramaItem key={`rank-${drama.id}-${i}`} drama={drama} platform={platform} rank={i + 1} />
          ))}
        </Carousel>
      ) : null}

      <div className="section-divider" />

      {/* ===== New Dramas Grid ===== */}
      <div>
        <h2 className="text-lg font-bold mb-4">✨ New Dramas</h2>

        {loading && dramas.length === 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 10, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 10, width: '50%' }} />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {dramas.map((drama, index) => (
                <GridDramaItem key={`${drama.id}-${index}`} drama={drama} platform={platform} />
              ))}
            </div>

            {/* Loading More */}
            {loadingMore && (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full"></div>
                <span className="ml-2 text-sm text-muted">Loading more...</span>
              </div>
            )}

            {hasMore && !loadingMore && (
              <div className="text-center py-6">
                <button onClick={loadMore} className="btn-primary">
                  Load More ({dramas.length} loaded)
                </button>
              </div>
            )}

            {!hasMore && dramas.length > 0 && (
              <div className="text-center py-6 text-sm text-muted">
                All dramas loaded ({dramas.length} total)
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
