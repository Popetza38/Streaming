import { TrendingUp, Flame } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../store/language';
import { useSource } from '../store/source';
import { getProvider, type RankSection, type UnifiedDrama } from '../api/providers';

const rankBadge = (index: number) => {
  if (index === 0) return { bg: 'bg-gradient-to-br from-yellow-400 to-amber-600', text: 'text-black', shadow: 'shadow-amber-500/30' };
  if (index === 1) return { bg: 'bg-gradient-to-br from-zinc-300 to-zinc-500', text: 'text-black', shadow: 'shadow-zinc-400/20' };
  if (index === 2) return { bg: 'bg-gradient-to-br from-orange-600 to-amber-800', text: 'text-white', shadow: 'shadow-orange-500/20' };
  return { bg: 'bg-white/10', text: 'text-zinc-400', shadow: '' };
};

const Rank = () => {
  const [sections, setSections] = useState<RankSection[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const { source } = useSource();

  useEffect(() => {
    const fetchRanked = async () => {
      setLoading(true);
      setActiveTab(0);
      try {
        const provider = getProvider(source);
        const data = await provider.getRank(lang);
        setSections(data);
      } catch (error) {
        console.error('Failed to fetch ranked:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRanked();
  }, [lang, source]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-500 text-sm">Loading rankings...</span>
        </div>
      </div>
    );
  }

  const currentSection = sections[activeTab];

  return (
    <div className="space-y-6 pt-2 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#e50914]/15 rounded-xl flex items-center justify-center">
          <TrendingUp size={22} className="text-[#e50914]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Ranking</h1>
          <p className="text-xs text-zinc-500">Most popular dramas right now</p>
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
                ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/25'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200 border border-white/5'
                }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      )}

      {/* Drama List */}
      {currentSection && (
        <div className="space-y-3">
          {currentSection.items.map((drama: UnifiedDrama, index: number) => {
            const badge = rankBadge(index);
            return (
              <Link
                key={drama.id}
                to={`/watch/${drama.id}`}
                state={{ name: drama.name, cover: drama.cover, episodes: drama.episodes }}
                className="block animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="card p-3 sm:p-4 hover:border-white/10 group">
                  <div className="flex gap-4 items-center">
                    {/* Rank Badge */}
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 ${badge.bg} rounded-xl flex items-center justify-center ${badge.text} font-black text-sm shadow-lg ${badge.shadow} flex-shrink-0`}>
                      {index + 1}
                    </div>

                    {/* Poster */}
                    <div className="w-14 h-20 sm:w-16 sm:h-22 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                      <img src={drama.cover} alt={drama.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-2 group-hover:text-[#e50914] transition-colors">{drama.name}</h3>
                      {drama.summary && (
                        <p className="text-xs text-zinc-500 mb-2 line-clamp-1 hidden sm:block">{drama.summary}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        {drama.hotScore && (
                          <span className="flex items-center gap-1 text-orange-400">
                            <Flame size={12} /> {drama.hotScore}
                          </span>
                        )}
                        {drama.playCount && (
                          <span className="text-zinc-500">{drama.playCount} views</span>
                        )}
                        <span>{drama.episodes} ep</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Rank;
