import { Grid3X3, Users, Play, Layers } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../store/language';

interface Drama {
  bookId: string;
  bookName: string;
  cover: string;
  coverWap?: string;
  playCount: string;
  tagV3s?: Array<{
    tagId: number;
    tagName: string;
  }>;
  tagDetails?: Array<{
    tagId: number;
    tagName: string;
  }>;
}

interface Tag {
  tagId: number;
  tagName: string;
}

const Category = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [categories, setCategories] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const tabsRef = useRef<HTMLDivElement>(null);

  // Fetch popular tags from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/home?page=1&size=10&lang=${lang}`);
        const data = await response.json();
        const isSuccess = data.success || data.data?.success || data.code === 0;
        const list = data.data?.data?.classifyBookList?.records ||
                     data.data?.classifyBookList?.records ||
                     data.data?.list ||
                     data.list || [];
        if (isSuccess && list.length > 0) {
          // Extract unique tags from first few dramas
          const allTags = new Map<number, string>();
          list.slice(0, 5).forEach((drama: Drama) => {
            const tags = drama.tagV3s || drama.tagDetails || [];
            tags.forEach(tag => {
              if (!allTags.has(tag.tagId)) {
                allTags.set(tag.tagId, tag.tagName);
              }
            });
          });

          const tagArray = Array.from(allTags, ([tagId, tagName]) => ({ tagId, tagName })).slice(0, 6);
          setCategories(tagArray);

          // Always set first tag when language changes
          if (tagArray.length > 0) {
            setSelectedCategory(tagArray[0].tagId);
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [lang]);

  useEffect(() => {
    if (!selectedCategory) return;

    const fetchCategoryDramas = async () => {
      setLoading(true);
      try {
        const categoryName = categories.find(c => c.tagId === selectedCategory)?.tagName || '';
        const response = await fetch(`/api/search?keyword=${encodeURIComponent(categoryName)}&page=1&lang=${lang}&pageSize=15`);
        const data = await response.json();
        const isSuccess = data.success === true || data.data?.success === true || data.code === 0;
        if (isSuccess) {
          const list = data.data?.data?.searchList ||
                       data.data?.data?.classifyBookList?.records ||
                       data.data?.searchList ||
                       data.data?.classifyBookList?.records ||
                       data.data?.list ||
                       data.list || [];
          setDramas(list);
        }
      } catch (error) {
        console.error('Failed to fetch category dramas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDramas();
  }, [selectedCategory, lang]);

  return (
    <div className="space-y-6 md:space-y-8 pt-2">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
          <Grid3X3 size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">หมวดหมู่</h1>
          <p className="text-sm text-zinc-500">ค้นพบซีรีส์ตามหมวดหมู่ที่คุณชื่นชอบ</p>
        </div>
      </div>

      {/* Category Tabs - Horizontal Scroll on Mobile */}
      <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
        <div
          ref={tabsRef}
          className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => (
            <button
              key={category.tagId}
              onClick={() => setSelectedCategory(category.tagId)}
              className={`flex-shrink-0 snap-start px-4 md:px-6 py-2.5 md:py-3 rounded-full text-sm md:text-base font-medium transition-all active:scale-95 ${
                selectedCategory === category.tagId
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-white/5'
              }`}
            >
              {category.tagName}
            </button>
          ))}
        </div>
        {/* Fade edges indicator for scroll */}
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-zinc-950 to-transparent md:hidden pointer-events-none" />
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
              <span>
                {categories.find(c => c.tagId === selectedCategory)?.tagName || 'ผลลัพธ์'}
              </span>
              <span className="text-sm text-zinc-500 font-normal">({dramas.length} รายการ)</span>
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
            {dramas.map((drama, index) => (
              <Link key={drama.bookId} to={`/watch/${drama.bookId}`} className="group">
                <div className="relative aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden mb-2 md:mb-3 bg-zinc-900 shadow-lg">
                  <img
                    src={drama.coverWap || drama.cover}
                    alt={drama.bookName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
                      <Play size={24} className="text-white ml-1" fill="white" />
                    </div>
                  </div>

                  {/* Rank Badge */}
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
                  <span>{drama.playCount}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {dramas.length === 0 && (
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
