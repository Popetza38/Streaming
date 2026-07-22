import { TrendingUp, Users, Crown, Medal, Award, Play, Tv } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRankDramas } from '../hooks/useDramas';
import { usePlatform, platforms } from '../store/platform';

const getRankIcon = (index: number) => {
  if (index === 0) return <Crown size={16} className="text-yellow-500" />;
  if (index === 1) return <Medal size={16} className="text-zinc-400" />;
  if (index === 2) return <Award size={16} className="text-amber-700" />;
  return null;
};

const getRankStyle = (index: number) => {
  if (index === 0) return 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30';
  if (index === 1) return 'bg-gradient-to-br from-zinc-400 to-zinc-500 text-white shadow-lg shadow-zinc-500/30';
  if (index === 2) return 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-600/30';
  return 'bg-zinc-800 text-zinc-400 border border-white/10';
};

const Rank = () => {
  const { dramas, loading } = useRankDramas();
  const { platform } = usePlatform();
  const activePlatformObj = platforms.find(p => p.id === platform) || platforms[0];


  return (
    <div className="space-y-6 md:space-y-8 pt-2">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
          <TrendingUp size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">ยอดนิยม</h1>
          <p className="text-sm text-zinc-500">ซีรีส์ที่ได้รับความนิยมสูงสุด</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 md:py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full"></div>
            <span className="text-sm text-zinc-500">กำลังโหลด...</span>
          </div>
        </div>
      )}

      {/* Top 3 Featured - Horizontal on Desktop */}
      {!loading && dramas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dramas.slice(0, 3).map((drama, index) => (
            <Link
              key={drama.bookId}
              to={`/watch/${drama.bookId}`}
              className="group relative rounded-2xl overflow-hidden bg-zinc-900/50 border border-white/5 hover:border-red-500/30 transition-all"
            >
              {/* Rank Badge */}
              <div className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankStyle(index)}`}>
                {getRankIcon(index) || index + 1}
              </div>

              {/* Image */}
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={drama.coverWap || drama.cover}
                  alt={drama.bookName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-bold text-base md:text-lg mb-1 line-clamp-1 group-hover:text-red-400 transition-colors">
                  {drama.bookName.trim()}
                </h3>
                <p className="text-xs md:text-sm text-zinc-400 line-clamp-1 mb-2">
                  {drama.introduction}
                </p>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {drama.playCount}
                  </span>
                  <span>{drama.chapterCount} ตอน</span>
                </div>
              </div>

              {/* Play Button on Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Play size={28} className="text-white ml-1" fill="white" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Rest of the List */}
      {!loading && (
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
            <span className="w-1 h-5 bg-zinc-600 rounded-full"></span>
            อันดับต่อไป
            <span className="text-sm text-zinc-500 font-normal">({dramas.length - 3} รายการ)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dramas.slice(3).map((drama, index) => (
              <Link
                key={drama.bookId}
                to={`/watch/${drama.bookId}`}
                className="group flex gap-3 p-3 rounded-xl bg-zinc-900/30 hover:bg-zinc-800/50 border border-white/5 hover:border-white/10 transition-all"
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-sm font-bold text-zinc-500">
                  {index + 4}
                </div>

                {/* Thumbnail */}
                <div className="flex-shrink-0 w-16 h-22 md:w-20 md:h-28 rounded-lg overflow-hidden bg-zinc-800">
                  <img
                    src={drama.coverWap || drama.cover}
                    alt={drama.bookName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-1">
                  <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-1 group-hover:text-red-400 transition-colors">
                    {drama.bookName.trim()}
                  </h3>
                  <p className="text-xs text-zinc-500 line-clamp-2 mb-2">
                    {drama.introduction}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {drama.playCount}
                    </span>
                    <span>{drama.chapterCount} ตอน</span>
                  </div>

                  {drama.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {drama.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span key={tagIndex} className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {dramas.length === 0 && (
            <div className="text-center py-16 md:py-20">
              <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={32} className="text-zinc-600" />
              </div>
              <p className="text-zinc-500">ไม่พบข้อมูลการจัดอันดับ</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Rank;
