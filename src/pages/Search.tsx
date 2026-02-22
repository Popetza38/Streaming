import { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../store/language';
import { usePlatform } from '../store/platform';
import type { NormalizedDrama } from '../utils/normalize';
import { normalizeDramaList, extractList } from '../utils/normalize';

const Search = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [results, setResults] = useState<NormalizedDrama[]>([]);
  const [popularDramas, setPopularDramas] = useState<NormalizedDrama[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { lang } = useLanguage();
  const { platform } = usePlatform();

  // Fetch popular dramas on mount
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        let url: string;
        if (platform === 'shortmax') {
          url = `/api/feed?type=vip&lang=${lang}&platform=shortmax`;
        } else {
          url = `/api/rank/2?lang=${lang}&platform=dramabox`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (platform === 'shortmax') {
          const items = data?.data || [];
          const list = items[0]?.items ? items.flatMap((s: any) => s.items) : items;
          setPopularDramas(normalizeDramaList(list, platform));
        } else {
          if (data.success) {
            setPopularDramas(normalizeDramaList(data.data.list, platform));
          }
        }
      } catch (error) {
        console.error('Failed to fetch popular dramas:', error);
      }
    };

    fetchPopular();
  }, [lang, platform]);

  const fetchSuggestions = async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (platform === 'shortmax') {
      // ShortMax doesn't have suggest endpoint, skip
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`/api/suggest/${encodeURIComponent(q)}?lang=${lang}&platform=dramabox`);
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.data.suggestList.slice(0, 5));
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;

    setLoading(true);
    setShowSuggestions(false);

    try {
      let url: string;
      if (platform === 'shortmax') {
        url = `/api/search?q=${encodeURIComponent(q)}&lang=${lang}&platform=shortmax`;
      } else {
        url = `/api/search/${encodeURIComponent(q)}/1?lang=${lang}&pageSize=20&platform=dramabox`;
      }

      const response = await fetch(url);
      const data = await response.json();
      const list = extractList(data, platform);
      setResults(normalizeDramaList(list, platform));
    } catch (error) {
      console.error('Failed to search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      const debounce = setTimeout(() => {
        fetchSuggestions(value);
        // For ShortMax, search directly on input change
        if (platform === 'shortmax') {
          handleSearch(value);
        }
      }, 300);
      return () => clearTimeout(debounce);
    } else {
      setSuggestions([]);
      setResults([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: any) => {
    const name = (suggestion.bookName || suggestion.name || '').trim();
    setQuery(name);
    setShowSuggestions(false);
    handleSearch(name);
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Search Input */}
      <div className="relative">
        <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
          placeholder="Search dramas..."
          className="w-full pl-10 pr-10 py-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
          autoFocus
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setResults([]);
              setShowSuggestions(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
          >
            <X size={18} />
          </button>
        )}

        {/* Suggestions (DramaBox only) */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 card max-h-96 overflow-y-auto z-50">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.bookId}
                onClick={() => selectSuggestion(suggestion)}
                className="w-full text-left p-3.5 hover:bg-zinc-800 active:bg-zinc-700 transition-colors flex gap-3 border-b border-zinc-800 last:border-0"
              >
                <img
                  src={suggestion.cover}
                  alt={suggestion.bookName}
                  className="w-12 h-16 object-cover rounded flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white text-sm line-clamp-2 mb-1">
                    {(suggestion.bookName || '').trim()}
                  </h4>
                  <p className="text-xs text-muted line-clamp-2">
                    {suggestion.introduction}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 text-zinc-300">
            {results.length} results for "{query}"
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {results.map((drama) => (
              <Link key={drama.id} to={`/watch/${drama.id}`} className="group">
                <div className="aspect-[3/4] rounded-lg overflow-hidden mb-2 bg-zinc-900">
                  <img
                    src={drama.cover}
                    alt={drama.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <h3 className="text-xs font-medium line-clamp-2 mb-1 leading-tight">
                  {drama.name}
                </h3>
                <p className="text-xs text-muted">
                  {drama.playCount || `${drama.episodes} ep`}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && query && results.length === 0 && !showSuggestions && (
        <div className="text-center py-16 text-muted">
          <SearchIcon size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">No results for "{query}"</p>
          <p className="text-xs mt-1">Try different keywords</p>
        </div>
      )}

      {/* Empty State - Show Popular Searches */}
      {!query && popularDramas.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 text-zinc-300">Popular Searches</h2>
          <div className="space-y-3">
            {popularDramas.map((drama, index) => (
              <Link key={drama.id} to={`/watch/${drama.id}`} className="card p-3.5 flex gap-3 hover:bg-zinc-800 active:bg-zinc-700 transition-colors">
                <div className="relative flex-shrink-0">
                  <img
                    src={drama.cover}
                    alt={drama.name}
                    className="w-16 h-20 object-cover rounded-lg"
                  />
                  <div className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                    {drama.name}
                  </h3>
                  <p className="text-xs text-muted line-clamp-2 mb-2">
                    {drama.summary}
                  </p>
                  <p className="text-xs text-muted">
                    {drama.playCount ? `${drama.playCount} views` : `${drama.episodes} episodes`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!query && popularDramas.length === 0 && (
        <div className="text-center py-16 text-muted">
          <SearchIcon size={40} className="mx-auto mb-3 opacity-50" />
          <h3 className="font-semibold mb-1">Search Dramas</h3>
          <p className="text-sm">Type to search your favorite dramas</p>
        </div>
      )}
    </div>
  );
};

export default Search;
