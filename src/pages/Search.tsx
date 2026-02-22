import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, TrendingUp, Play } from 'lucide-react';
import { useLanguage } from '../store/language';
import { useSource } from '../store/source';
import { getProvider, type UnifiedDrama } from '../api/providers';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UnifiedDrama[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const { lang } = useLanguage();
  const { source } = useSource();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchDramas = async () => {
      setLoading(true);
      try {
        const provider = getProvider(source);
        const list = await provider.search(query, lang, 1);
        setResults(list);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchDramas, 300);
    return () => clearTimeout(debounce);
  }, [query, lang, source]);

  return (
    <div className="min-h-screen text-white pb-20 pt-2">
      <div className="max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="sticky top-16 z-10 bg-[#0a0a0f]/95 backdrop-blur-xl pb-4 -mx-4 px-4">
          <div className={`relative transition-all duration-300 ${focused ? 'scale-[1.02]' : ''}`}>
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search dramas..."
              className={`w-full bg-white/5 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none transition-all duration-300 border ${focused
                ? 'border-[#e50914]/50 bg-white/8 shadow-lg shadow-[#e50914]/10'
                : 'border-white/5 hover:border-white/10'
                }`}
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
              <span className="text-zinc-500 text-sm">Searching...</span>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-zinc-400">
                {results.length} results for "<span className="text-white">{query}</span>"
              </h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {results.map((drama, i) => (
                <Link
                  key={drama.id}
                  to={`/watch/${drama.id}`}
                  state={{ name: drama.name, cover: drama.cover, episodes: drama.episodes }}
                  className="block animate-fade-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
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
                  <h3 className="text-sm font-medium mt-2 line-clamp-2 text-zinc-200">
                    {drama.name}
                  </h3>
                  {drama.episodes > 0 && (
                    <p className="text-xs text-zinc-500 mt-0.5">{drama.episodes} episodes</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && query && results.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <SearchIcon size={32} className="text-zinc-600" />
            </div>
            <p className="text-zinc-400 font-medium">No results for "{query}"</p>
            <p className="text-zinc-600 text-sm mt-1">Try different keywords</p>
          </div>
        )}

        {/* Empty State */}
        {!query && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <TrendingUp size={32} className="text-zinc-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-300 mb-1">Discover Content</h3>
            <p className="text-zinc-600 text-sm">Search for your favorite dramas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
