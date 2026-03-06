import { Grid, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../store/language';
import { usePlatform } from '../store/platform';
import { normalizeDramaList, extractList, type NormalizedDrama } from '../utils/normalize';
import { usePageMeta } from '../hooks/usePageMeta';

interface Tag {
  tagId: string | number;
  tagName: string;
}

const Category = () => {
  usePageMeta('Categories');
  const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null);
  const [dramas, setDramas] = useState<NormalizedDrama[]>([]);
  const [categories, setCategories] = useState<Tag[]>([]);
  const [allSections, setAllSections] = useState<any[]>([]); // To store DramaBite sections
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const { platform } = usePlatform();

  // Fetch popular tags from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (platform === 'shortmax' || platform === 'fundrama') {
          // ShortMax and FunDrama don't have a classify/tag system — use hardcoded genres
          const defaultTags: Tag[] = [
            { tagId: 1, tagName: 'Latest' },
            { tagId: 2, tagName: 'Popular' }
          ];
          setCategories(defaultTags);
          setSelectedCategory(defaultTags[0].tagId);
        } else if (platform === 'dramabite') {
          // DramaBite: Use both recommend sections and languages
          const [recRes, langRes] = await Promise.all([
            fetch(`/api/v1/recommend?lang=${lang}&platform=dramabite`),
            fetch(`/api/v1/languages?platform=dramabite`)
          ]);
          const sections = await recRes.json();
          const langsData = await langRes.json();

          let combinedTags: Tag[] = [];
          if (Array.isArray(sections)) {
            setAllSections(sections);
            combinedTags.push(...sections.map((s: any) => ({
              tagId: `section_${s.category}`,
              tagName: s.category
            })));
          }
          if (Array.isArray(langsData)) {
            combinedTags.push(...langsData.map((l: any) => ({
              tagId: `lang_${l.code}`,
              tagName: l.name
            })));
          }

          setCategories(combinedTags);
          if (combinedTags.length > 0) {
            setSelectedCategory(combinedTags[0].tagId);
          }
        } else {
          const path = platform === 'flextv' ? '/api/tabs/popular'
            : platform === 'dramapops' ? '/api/dramas/popular'
              : '/api/foryou/1';
          const response = await fetch(`${path}?lang=${lang}&platform=${platform}`);
          const data = await response.json();
          const list = extractList(data, platform);
          if (list.length > 0) {
            const allTags = new Map<number, string>();
            list.slice(0, 5).forEach((drama: any) => {
              const tags = platform === 'flextv' ? drama.tag_list
                : platform === 'dramapops' ? drama.tags
                  : drama.tagDetails;
              tags?.forEach((tag: any) => {
                const tagId = typeof tag === 'string' ? tag : tag.tagId;
                const tagName = typeof tag === 'string' ? tag : tag.tagName;
                if (tagId && !allTags.has(tagId)) {
                  allTags.set(tagId, tagName);
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
        if (platform === 'dramabite') {
          const catId = String(selectedCategory);
          if (catId.startsWith('section_')) {
            const sectionName = catId.replace('section_', '');
            const section = allSections.find(s => s.category === sectionName);
            if (section && Array.isArray(section.dramas)) {
              setDramas(normalizeDramaList(section.dramas, platform));
            } else {
              setDramas([]);
            }
          } else if (catId.startsWith('lang_')) {
            const langCode = catId.replace('lang_', '');
            const response = await fetch(`/api/v1/dramas?lang=${langCode}&platform=dramabite&page=0`);
            const data = await response.json();
            setDramas(normalizeDramaList(extractList(data, platform), platform));
          } else {
            const response = await fetch(`/api/v1/dramas?platform=dramabite&page=0`);
            const data = await response.json();
            setDramas(normalizeDramaList(extractList(data, platform), platform));
          }
          setLoading(false);
          return;
        }

        let url: string;
        if (platform === 'shortmax') {
          // ShortMax uses foryou or home for lists as feed is unavailable
          url = `/api/foryou?page=${selectedCategory}&lang=${lang}&platform=shortmax`;
        } else if (platform === 'fundrama') {
          // FunDrama uses /api/dramas for all lists
          url = `/api/dramas?page=${typeof selectedCategory === 'number' ? selectedCategory - 1 : 0}&lang=${lang}&platform=fundrama`;
        } else if (platform === 'flextv') {
          url = `/api/tabs/popular?lang=${lang}&platform=flextv`;
        } else if (platform === 'dramapops') {
          url = `/api/dramas/popular?limit=30&lang=${lang}&platform=dramapops`;
        } else {
          url = `/api/classify?lang=${lang}&pageNo=1&pageSize=15&sort=1&tag=${selectedCategory}&platform=${platform}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (platform === 'shortmax') {
          const items = data?.data || [];
          const list = items[0]?.items ? items.flatMap((s: any) => s.items) : items;
          setDramas(normalizeDramaList(list, platform));
        } else if (platform === 'dramapops') {
          const list = extractList(data, platform);
          setDramas(normalizeDramaList(list, platform));
        } else {
          const list = extractList(data, platform);
          setDramas(normalizeDramaList(list, platform));
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
            <Link key={drama.id} to={`/watch/${drama.id}?p=${platform}&cw=${encodeURIComponent(drama.cover || '')}`} className="group">
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
                <span>{drama.playCount ? drama.playCount : (drama.episodes && drama.episodes > 0 ? `${drama.episodes} ep` : 'Ongoing')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Category;
