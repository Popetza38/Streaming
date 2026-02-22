import { Crown, Play, Clapperboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../store/language';
import { useSource } from '../store/source';
import { getProvider, type UnifiedDrama } from '../api/providers';

interface Section {
  title: string;
  items: UnifiedDrama[];
}

const Category = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const { source } = useSource();

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setActiveTab(0);
      try {
        if (source === 'dramabox') {
          // DramaBox: show new releases
          const provider = getProvider(source);
          const newDramas = await (provider as any).getNew(1, lang);
          setSections([{ title: 'New Releases', items: newDramas }]);
        } else {
          // ShortMax: show VIP feed
          const response = await fetch(`/api/feed?type=vip&lang=${lang}`);
          const data = await response.json();
          const items = data.data || [];
          if (items[0]?.items) {
            setSections(items.map((s: any) => ({
              title: s.title,
              items: (s.items || []).map((d: any) => ({
                id: String(d.code || d.id),
                name: d.name || '',
                cover: d.cover || '',
                episodes: d.episodes || 0,
                summary: d.summary || '',
                source: 'shortmax' as const,
              })),
            })));
          } else {
            setSections([{
              title: 'VIP',
              items: items.map((d: any) => ({
                id: String(d.code || d.id),
                name: d.name || '',
                cover: d.cover || '',
                episodes: d.episodes || 0,
                summary: d.summary || '',
                source: 'shortmax' as const,
              })),
            }]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch content:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [lang, source]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-500 text-sm">Loading content...</span>
        </div>
      </div>
    );
  }

  const currentSection = sections[activeTab];
  const isDramaBox = source === 'dramabox';

  return (
    <div className="space-y-6 pt-2 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDramaBox
            ? 'bg-purple-500/15'
            : 'bg-gradient-to-br from-yellow-400/20 to-amber-600/20'
          }`}>
          {isDramaBox
            ? <Clapperboard size={22} className="text-purple-400" />
            : <Crown size={22} className="text-amber-400" />
          }
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {isDramaBox ? 'New Releases' : 'VIP Collection'}
          </h1>
          <p className="text-xs text-zinc-500">
            {isDramaBox ? 'Latest dramas just for you' : 'Premium exclusive content'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      {sections.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${activeTab === index
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200 border border-white/5'
                }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      )}

      {/* Drama Grid */}
      {currentSection && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {currentSection.items.map((drama, i) => (
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
                  <Play size={24} className="text-white mx-auto fill-white" />
                </div>
              </div>
              <h3 className="text-sm font-medium line-clamp-2 mt-2 text-zinc-200">{drama.name}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">{drama.episodes} episodes</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Category;
