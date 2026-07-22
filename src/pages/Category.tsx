import { Grid3X3, Users, Play, Layers, Tv } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRankDramas } from '../hooks/useDramas';
import { usePlatform, platforms } from '../store/platform';

const CATEGORY_TABS = [
  { id: 'all', name: 'ทั้งหมด' },
  { id: 'popular', name: 'ยอดนิยม' },
  { id: 'dubbed', name: 'พากย์ไทย' },
  { id: 'romance', name: 'โรแมนติก' },
  { id: 'revenge', name: 'แก้แค้น/ทลายแค้น' },
  { id: 'ceo', name: 'ประธานบริษัท/มาเฟีย' },
];

const Category = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const { dramas: rawDramas, loading } = useRankDramas();
  const { platform } = usePlatform();
  const activePlatformObj = platforms.find(p => p.id === platform) || platforms[0];

  const filteredDramas = rawDramas.filter(d => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'dubbed') return d.bookName.includes('พากย์') || d.introduction.includes('พากย์');
    if (selectedTab === 'romance') return d.bookName.includes('รัก') || d.introduction.includes('รัก') || d.introduction.includes('แต่งงาน');
    if (selectedTab === 'revenge') return d.bookName.includes('แค้น') || d.introduction.includes('แค้น') || d.introduction.includes('ราชินี');
    if (selectedTab === 'ceo') return d.bookName.includes('ประธาน') || d.bookName.includes('มาเฟีย') || d.introduction.includes('บริษัท');
    return true;
  });

  return (
    <div className="space-y-6 md:space-y-8 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
            <Grid3X3 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">หมวดหมู่</h1>
            <p className="text-sm text-zinc-500">ค้นพบซีรีส์ตามหมวดหมู่ที่คุณชื่นชอบ</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 bg-zinc-900/90 text-zinc-300 border border-white/10 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md">
          <Tv size={12} className="text-red-400" />
          ค่าย: {activePlatformObj.name}
        </span>
      </div>

      {/* Category Tabs */}
      <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedTab(cat.id)}
              className={`flex-shrink-0 snap-start px-4 md:px-6 py-2.5 md:py-3 rounded-full text-sm md:text-base font-medium transition-all active:scale-95 ${
                selectedTab === cat.id
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-white/5'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16 md:py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full"></div>
            <span className="text-sm text-zinc-500">กำลังโหลด...</span>
          </div>
        </div>
      )}

      {/* Drama Grid */}
      {!loading && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
              <Layers size={18} className="text-zinc-500" />
              <span>{CATEGORY_TABS.find(c => c.id === selectedTab)?.name}</span>
              <span className="text-sm text-zinc-500 font-normal">({filteredDramas.length} รายการ)</span>
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
            {filteredDramas.map((drama, index) => (
              <Link key={drama.bookId} to={`/watch/${drama.bookId}`} className="group">
                <div className="relative aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden mb-2 md:mb-3 bg-zinc-900 shadow-lg">
                  <img
                    src={drama.coverWap || drama.cover}
                    alt={drama.bookName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
                      <Play size={24} className="text-white ml-1" fill="white" />
                    </div>
                  </div>

                  {index < 3 && (
                    <div className={`absolute top-2 left-2 w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-zinc-400' : 'bg-amber-700'
                    }`}>
                      {index + 1}
                    </div>
                  )}
                </div>

                <h3 className="text-xs md:text-sm font-medium line-clamp-2 mb-1 group-hover:text-red-400 transition-colors">
                  {drama.bookName.trim()}
                </h3>

                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <Users size={10} />
                  <span>{drama.chapterCount ? `${drama.chapterCount} ตอน` : 'จบแล้ว'}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {filteredDramas.length === 0 && (
            <div className="text-center py-16 md:py-20">
              <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid3X3 size={32} className="text-zinc-600" />
              </div>
              <p className="text-zinc-500 mb-2">ไม่พบซีรีส์ในหมวดหมู่นี้</p>
              <p className="text-sm text-zinc-600">ลองเลือกหมวดหมู่อื่น</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Category;
