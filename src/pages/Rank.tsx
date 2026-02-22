import { TrendingUp, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../store/language';
import { usePlatform } from '../store/platform';
import { normalizeDramaList, extractList, type NormalizedDrama } from '../utils/normalize';

const rankTabs = [
  { id: 1, name: 'Trending', label: 'Trending' },
  { id: 2, name: 'Popular', label: 'Popular' },
  { id: 3, name: 'Latest', label: 'Latest' }
];

const Rank = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [dramas, setDramas] = useState<NormalizedDrama[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const { platform } = usePlatform();

  useEffect(() => {
    const fetchRankDramas = async () => {
      setLoading(true);
      try {
        let url: string;
        if (platform === 'shortmax') {
          // ShortMax uses feed endpoint with different types
          const types = ['vip', 'romance', 'vip'];
          url = `/api/feed?type=${types[activeTab - 1]}&lang=${lang}&platform=shortmax`;
        } else {
          url = `/api/rank/${activeTab}?lang=${lang}&platform=dramabox`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (platform === 'shortmax') {
          const items = data?.data || [];
          const list = items[0]?.items ? items.flatMap((s: any) => s.items) : items;
          setDramas(normalizeDramaList(list, platform));
        } else {
          const list = extractList(data, platform);
          setDramas(normalizeDramaList(list, platform));
        }
      } catch (error) {
        console.error('Failed to fetch rank dramas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankDramas();
  }, [activeTab, lang, platform]);

  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center gap-2">
        <TrendingUp size={20} className="text-red-500" />
        <h1 className="text-xl font-bold">Ranking</h1>
      </div>

      {/* Rank Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {rankTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap active:scale-95 ${activeTab === tab.id
              ? 'bg-red-500 text-white'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Drama List */}
      {!loading && (
        <div className="space-y-3">
          {dramas.map((drama, index) => (
            <Link key={drama.id} to={`/watch/${drama.id}`} className="block">
              <div className="card p-3.5 hover:bg-zinc-800 active:bg-zinc-700 transition-colors">
                <div className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-22 sm:w-14 sm:h-20 rounded-lg overflow-hidden bg-zinc-900">
                      <img
                        src={drama.cover}
                        alt={drama.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      {index + 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                      {drama.name}
                    </h3>
                    <p className="text-xs text-muted mb-2 line-clamp-2">
                      {drama.summary}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-muted mb-2">
                      <div className="flex items-center gap-1">
                        <Users size={11} />
                        <span>{drama.playCount || 'N/A'}</span>
                      </div>
                      <span>{drama.episodes} ep</span>
                    </div>

                    {drama.tags && drama.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {drama.tags.slice(0, 2).map((tag, tagIndex) => (
                          <span key={tagIndex} className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Rank;
