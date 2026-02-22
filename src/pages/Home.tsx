import { Link } from 'react-router-dom';
import { Play, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDramas, useRomanceDramas } from '../hooks/useDramas';
import { useSource } from '../store/source';

const Home = () => {
  const { dramas: featured, loading: featuredLoading, hasMore, loadMore } = useDramas();
  const { dramas: romance, loading: romanceLoading } = useRomanceDramas();
  const { source } = useSource();
  const loaderRef = useRef<HTMLDivElement>(null);
  const [heroImgLoaded, setHeroImgLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  // Reset hero image state when source changes
  useEffect(() => {
    setHeroImgLoaded(false);
  }, [source]);

  if (featuredLoading && featured.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm font-medium">Loading content...</p>
        </div>
      </div>
    );
  }

  const dramaLink = (drama: any) => ({
    pathname: `/watch/${drama.id}`,
    state: { name: drama.name, cover: drama.cover, episodes: drama.episodes },
  });

  return (
    <div className="min-h-screen text-white space-y-8 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Hero Banner */}
      {featured[0] && (
        <Link to={`/watch/${featured[0].id}`} state={{ name: featured[0].name, cover: featured[0].cover, episodes: featured[0].episodes }} className="block relative group">
          <div className="relative w-full aspect-[16/7] sm:aspect-[21/9] overflow-hidden">
            {!heroImgLoaded && (
              <div className="absolute inset-0 skeleton" />
            )}
            <img
              src={featured[0].cover}
              alt={featured[0].name}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${heroImgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setHeroImgLoaded(true)}
            />
            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/80 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16">
              <div className="max-w-2xl animate-slide-up">
                <div className="inline-flex items-center gap-2 bg-[#e50914] text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 shadow-lg">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  FEATURED
                </div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black mb-3 leading-tight line-clamp-2">
                  {featured[0].name}
                </h1>
                {featured[0].summary && (
                  <p className="text-sm sm:text-base text-zinc-300 mb-6 line-clamp-2 max-w-xl">
                    {featured[0].summary}
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <div className="btn-primary inline-flex items-center gap-2 text-sm sm:text-base group-hover:scale-105 transition-transform">
                    <Play size={18} className="fill-white" />
                    Watch Now
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}

      <div className="px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Romance / New Releases Carousel */}
        {!romanceLoading && romance.length > 0 && (
          <section className="animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg sm:text-xl font-bold">
                {source === 'dramabox' ? 'New Releases' : 'Romance'}
              </h2>
              <button className="text-sm text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
                See all <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-snap-x pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              {romance.slice(0, 12).map((drama) => (
                <Link
                  key={drama.id}
                  to={`/watch/${drama.id}`}
                  state={{ name: drama.name, cover: drama.cover, episodes: drama.episodes }}
                  className="flex-shrink-0 w-[130px] sm:w-[160px]"
                >
                  <div className="drama-card">
                    <div className="aspect-[2/3] bg-zinc-900">
                      <img
                        src={drama.cover}
                        alt={drama.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="drama-overlay" />
                    <div className="drama-info">
                      <Play size={24} className="text-white mx-auto mb-1 fill-white" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium mt-2 line-clamp-2 text-zinc-200">
                    {drama.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{drama.episodes} episodes</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* For You Grid */}
        {featured.length > 1 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg sm:text-xl font-bold">For You</h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {featured.slice(1).map((drama, i) => (
                <Link
                  key={drama.id}
                  to={`/watch/${drama.id}`}
                  state={{ name: drama.name, cover: drama.cover, episodes: drama.episodes }}
                  className="block animate-fade-in"
                  style={{ animationDelay: `${(i % 6) * 0.05}s` }}
                >
                  <div className="drama-card">
                    <div className="aspect-[2/3] bg-zinc-900">
                      <img
                        src={drama.cover}
                        alt={drama.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="drama-overlay" />
                    <div className="drama-info">
                      <Play size={24} className="text-white mx-auto mb-1 fill-white" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium mt-2 line-clamp-2 text-zinc-200">
                    {drama.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{drama.episodes} episodes</p>
                </Link>
              ))}
            </div>

            {/* Infinite scroll loader */}
            <div ref={loaderRef} className="flex justify-center py-8">
              {featuredLoading && (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
                  <span className="text-zinc-500 text-sm">Loading more...</span>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;
