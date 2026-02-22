import { Grid, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../store/language';
import { usePlatform } from '../store/platform';
import { normalizeDramaList, type NormalizedDrama } from '../utils/normalize';

interface Tag {
  tagId: number;
  tagName: string;
}

const Category = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [dramas, setDramas] = useState<NormalizedDrama[]>([]);
  const [categories, setCategories] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const { platform } = usePlatform();

  // Fetch popular tags from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (platform === 'shortmax') {
          // ShortMax doesn't have a classify/tag system — use hardcoded genres
          const defaultTags: Tag[] = [
            { tagId: 1, tagName: 'Romance' },
            { tagId: 2, tagName: 'VIP' },
            { tagId: 3, tagName: 'Latest' },
          ];
          setCategories(defaultTags);
          setSelectedCategory(defaultTags[0].tagId);
        } else {
          const response = await fetch(`/api/foryou/1?lang=${lang}&platform=dramabox`);
          const data = await response.json();
          if (data.success && data.data.list.length > 0) {
            const allTags = new Map<number, string>();
            data.data.list.slice(0, 5).forEach((drama: any) => {
              drama.tagDetails?.forEach((tag: any) => {
                if (!allTags.has(tag.tagId)) {
                  allTags.set(tag.tagId, tag.tagName);
                }
              });
            });

            const tagArray = Array.from(allTags, ([tagId, tagName]) => ({ tagId, tagName })).slice(0, 6);
            setCategories(tagArray);

            if (tagArray.length > 0) {
              setSelectedCategory(tagArray[0].tagId);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, [lang, platform]);

  useEffect(() => {
    if (!selectedCategory) return;

    const fetchCategoryDramas = async () => {
      setLoading(true);
      try {
        let url: string;
        if (platform === 'shortmax') {
          // Map tag IDs to feed types
          const feedMap: Record<number, string> = { 1: 'romance', 2: 'vip', 3: 'vip' };
          const type = feedMap[selectedCategory] || 'vip';
          url = `/api/feed?type=${type}&lang=${lang}&platform=shortmax`;
        } else {
          url = `/api/classify?lang=${lang}&pageNo=1&pageSize=15&sort=1&tag=${selectedCategory}&platform=dramabox`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (platform === 'shortmax') {
          const items = data?.data || [];
          const list = items[0]?.items ? items.flatMap((s: any) => s.items) : items;
          setDramas(normalizeDramaList(list, platform));
        } else {
          if (data.success) {
            setDramas(normalizeDramaList(data.data.list, platform));
          }
        }
      } catch (error) {
        console.error('Failed to fetch category dramas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDramas();
  }, [selectedCategory, lang, platform]);

  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center gap-2">
        <Grid size={20} className="text-red-500" />
        <h1 className="text-xl font-bold">Category</h1>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {categories.map((category) => (
          <button
            key={category.tagId}
            onClick={() => setSelectedCategory(category.tagId)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors active:scale-95 ${selectedCategory === category.tagId
              ? 'bg-red-500 text-white'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
          >
            {category.tagName}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Drama Grid */}
      {!loading && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {dramas.map((drama) => (
            <Link key={drama.id} to={`/watch/${drama.id}`} className="group">
              <div className="aspect-[3/4] rounded-lg overflow-hidden mb-2">
                <img
                  src={drama.cover}
                  alt={drama.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-sm font-medium line-clamp-2 mb-1">
                {drama.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted">
                <Users size={12} />
                <span>{drama.playCount || `${drama.episodes} ep`}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Category;
