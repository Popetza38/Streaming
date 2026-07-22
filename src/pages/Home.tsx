import { Play, Users, Sparkles, ChevronRight, Loader2, Tag, Tv } from 'lucide-react';
import { useDramas, useInfiniteDramas, useCategories } from '../hooks/useDramas';
import { usePlatform, platforms } from '../store/platform';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const Home = () => {
  const { dramas: featuredDramas, loading: featuredLoading } = useDramas();
  const { dramas, loading, loadingMore, hasMore, loadMore } = useInfiniteDramas();
  const { categories, loading: categoriesLoading } = useCategories();
  const { platform } = usePlatform();
  const activePlatformObj = platforms.find(p => p.id === platform) || platforms[0];
  const observerRef = useRef<HTMLDivElement>(null);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    const currentObserver = observerRef.current;
    if (currentObserver) {
      observer.observe(currentObserver);
    }

    return () => {
      if (currentObserver) {
        observer.unobserve(currentObserver);
      }
    };
  }, [hasMore, loadingMore, loadMore]);

  if (featuredLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-10 pt-2">
      {/* Featured Hero Section */}
      {featuredDramas[0] && (
        <Link to={`/watch/${featuredDramas[0].bookId}`} className="block group">
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
            <img
              src={featuredDramas[0].coverWap || featuredDramas[0].cover}
              alt={featuredDramas[0].bookName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 lg:p-10">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  <Sparkles size={12} />
                  แนะนำสำหรับคุณ
                </span>
                <span className="inline-flex items-center gap-1.5 bg-zinc-900/90 text-zinc-300 border border-white/10 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md">
                  <Tv size={12} className="text-red-400" />
                  ค่าย: {activePlatformObj.name}
                </span>
                {featuredDramas[0].playCount && (
                  <span className="inline-flex items-center gap-1.5 bg-zinc-900/90 text-zinc-300 border border-white/10 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md">
                    <Users size={12} className="text-red-400" />
                    {featuredDramas[0].playCount}
                  </span>
                )}
              </div>

              <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3 line-clamp-2 max-w-2xl">
                {featuredDramas[0].bookName.trim()}
              </h1>


              <p className="text-sm md:text-base text-zinc-300 mb-4 line-clamp-2 max-w-xl hidden sm:block">
                {featuredDramas[0].introduction}
              </p>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 bg-white text-black px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-semibold text-sm md:text-base transition-all group-hover:bg-zinc-200">
                  <Play size={18} fill="currentColor" />
                  รับชมเลย
                </span>
                <span className="text-zinc-400 text-sm flex items-center gap-1 group-hover:text-white transition-colors">
                  ดูเพิ่มเติม
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* For You Section */}
      {featuredDramas.length > 1 && (
        <section>
          <div className="flex items-center justify-between mb-4 md:mb-5">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
              <span className="w-1 h-6 bg-red-500 rounded-full"></span>
              แนะนำสำหรับคุณ
            </h2>
            <span className="text-sm text-zinc-500">{featuredDramas.length - 1} รายการ</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
            {featuredDramas.slice(1).map((drama, index) => (

              <Link key={`foryou-${drama.bookId}-${index}`} to={`/watch/${drama.bookId}`} className="group">
                <div className="relative aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden mb-2 md:mb-3 bg-zinc-900 shadow-lg">
                  <img
                    src={drama.coverWap || drama.cover}
                    alt={drama.bookName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Corner Badge */}
                  {drama.corner && (
                    <div
                      className="absolute top-2 left-2 text-[10px] md:text-xs font-bold px-2 py-1 rounded-lg shadow-lg backdrop-blur-sm"
                      style={{ backgroundColor: drama.corner.color }}
                    >
                      {drama.corner.name}
                    </div>
                  )}

                  {/* Rank Badge */}
                  {drama.rank && (
                    <div className="absolute bottom-2 left-2 bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-lg shadow-lg backdrop-blur-sm">
                      🔥 {drama.rank.hotCode}
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
                      <Play size={24} className="text-white ml-1" fill="white" />
                    </div>
                  </div>
                </div>

                <h3 className="text-xs md:text-sm font-medium line-clamp-2 mb-1 group-hover:text-red-400 transition-colors">
                  {drama.bookName.trim()}
                </h3>

                <div className="flex items-center justify-between text-xs text-zinc-400 mt-1">
                  <span className="flex items-center gap-1 font-medium text-zinc-300">
                    <Users size={11} className="text-red-400" />
                    {drama.playCount || '10.5k ครั้ง'}
                  </span>
                  {drama.chapterCount ? (
                    <span className="text-zinc-500 text-[11px]">{drama.chapterCount} ตอน</span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categories Sections */}
      {!categoriesLoading && categories.length > 0 && (
        <div className="space-y-8 md:space-y-10">
          {categories.map((category) => (
            <section key={category.tagId}>
              <div className="flex items-center justify-between mb-4 md:mb-5">
                <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                  <Tag size={18} className="text-red-500" />
                  {category.tagName}
                </h2>
                <Link
                  to={`/category`}
                  className="text-sm text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  ดูทั้งหมด
                  <ChevronRight size={16} />
                </Link>
              </div>

              {/* Horizontal Scrollable Row */}
              <div className="relative -mx-4 px-4">
                <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {category.dramas.map((drama, index) => (
                    <Link
                      key={`${category.tagId}-${drama.bookId}-${index}`}
                      to={`/watch/${drama.bookId}`}
                      className="group flex-shrink-0 snap-start w-32 sm:w-36 md:w-40"
                    >
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2 bg-zinc-900 shadow-lg">
                        <img
                          src={drama.coverWap || drama.cover}
                          alt={drama.bookName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
                            <Play size={20} className="text-white ml-0.5" fill="white" />
                          </div>
                        </div>
                      </div>

                      <h3 className="text-xs font-medium line-clamp-2 group-hover:text-red-400 transition-colors">
                        {drama.bookName.trim()}
                      </h3>
                    </Link>
                  ))}
                </div>
                {/* Fade edges */}
                <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none" />
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Loading Categories */}
      {categoriesLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
            <span className="text-sm text-zinc-500">กำลังโหลดหมวดหมู่...</span>
          </div>
        </div>
      )}

      {/* New Dramas Section with Infinite Scroll */}
      <section>
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
            <span className="w-1 h-6 bg-red-500 rounded-full"></span>
            ซีรีส์ใหม่ล่าสุด
          </h2>
          <span className="text-sm text-zinc-500">{dramas.length} รายการ</span>
        </div>

        {loading && dramas.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
              {dramas.map((drama, index) => (
                <Link key={`${drama.bookId}-${index}`} to={`/watch/${drama.bookId}`} className="group">
                  <div className="relative aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden mb-2 md:mb-3 bg-zinc-900 shadow-lg">
                    <img
                      src={drama.coverWap || drama.cover}
                      alt={drama.bookName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Corner Badge */}
                    {drama.corner && (
                      <div
                        className="absolute top-2 left-2 text-[10px] md:text-xs font-bold px-2 py-1 rounded-lg shadow-lg backdrop-blur-sm"
                        style={{ backgroundColor: drama.corner.color }}
                      >
                        {drama.corner.name}
                      </div>
                    )}

                    {/* Rank Badge */}
                    {drama.rank && (
                      <div className="absolute bottom-2 left-2 bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-lg shadow-lg backdrop-blur-sm">
                        🔥 {drama.rank.hotCode}
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
                        <Play size={24} className="text-white ml-1" fill="white" />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xs md:text-sm font-medium line-clamp-2 mb-1 group-hover:text-red-400 transition-colors">
                    {drama.bookName.trim()}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Users size={10} />
                    <span>{drama.playCount}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            <div ref={observerRef} className="h-4" />

            {/* Loading More */}
            {loadingMore && (
              <div className="flex items-center justify-center py-8 md:py-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                  <span className="text-sm text-zinc-500 animate-pulse">กำลังโหลดซีรีส์เพิ่ม...</span>
                </div>
              </div>
            )}

            {/* End of Content */}
            {!hasMore && dramas.length > 0 && (
              <div className="text-center py-8 md:py-10">
                <div className="inline-flex flex-col items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 rounded-full text-sm text-zinc-500">
                    <Sparkles size={14} className="text-yellow-500" />
                    <span>โหลดทั้งหมดแล้ว ({dramas.length} รายการ)</span>
                  </div>
                  <p className="text-xs text-zinc-600">เลื่อนขึ้นด้านบนเพื่อดูซีรีส์ทั้งหมด</p>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
