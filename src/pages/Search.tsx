import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Sparkles, TrendingUp, Play, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../store/language';

interface Drama {
  bookId: string;
  bookName: string;
  introduction: string;
  cover: string;
  coverWap?: string;
  playCount: string;
}

const Search = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Drama[]>([]);
  const [results, setResults] = useState<Drama[]>([]);
  const [popularDramas, setPopularDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { lang } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Fetch popular dramas on mount
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const response = await fetch(`/api/rank?lang=${lang}`);
        const data = await response.json();
        const isSuccess = data.success || data.data?.success || data.code === 0;
        if (isSuccess) {
          const list = data.data?.data?.rankList ||
                       data.data?.rankList ||
                       data.data?.list ||
                       data.list || [];
          setPopularDramas(list.slice(0, 6));
        }
      } catch (error) {
        console.error('Failed to fetch popular dramas:', error);
      }
    };

    fetchPopular();
  }, [lang]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`/api/search?keyword=${encodeURIComponent(q)}&page=1&lang=${lang}&pageSize=5`);
      const data = await response.json();
      const isSuccess = data.success || data.data?.success || data.code === 0;
      if (isSuccess) {
        const list = data.data?.data?.searchList ||
                     data.data?.searchList ||
                     data.data?.list ||
                     data.list || [];
        setSuggestions(list.slice(0, 5));
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
    saveRecentSearch(q.trim());

    try {
      const response = await fetch(`/api/search?keyword=${encodeURIComponent(q)}&page=1&lang=${lang}&pageSize=20`);
      const data = await response.json();
      const isSuccess = data.success || data.data?.success || data.code === 0;
      if (isSuccess) {
        const list = data.data?.data?.searchList ||
                     data.data?.searchList ||
                     data.data?.list ||
                     data.list || [];
        setResults(list);
      }
    } catch (error) {
      console.error('Failed to search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      const debounce = setTimeout(() => fetchSuggestions(value), 200);
      return () => clearTimeout(debounce);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: Drama) => {
    setQuery(suggestion.bookName.trim());
    setShowSuggestions(false);
    handleSearch(suggestion.bookName.trim());
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setResults([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6 md:space-y-8 pt-2">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
          <SearchIcon size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">ค้นหา</h1>
          <p className="text-sm text-zinc-500">ค้นหาซีรีส์ที่คุณชื่นชอบ</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative" ref={suggestionsRef}>
        <div className="relative">
          <SearchIcon size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            placeholder="พิมพ์ชื่อซีรีส์..."
            className="w-full pl-12 pr-12 py-4 bg-zinc-900/80 border border-white/10 rounded-2xl text-white text-base placeholder-zinc-500 focus:outline-none focus:border-red-500/50 focus:bg-zinc-900 transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-all"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl">
            <div className="p-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.bookId}
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full text-left p-3 hover:bg-white/5 transition-colors flex gap-3 rounded-xl"
                >
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                    <img
                      src={suggestion.coverWap || suggestion.cover}
                      alt={suggestion.bookName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <h4 className="font-medium text-white text-sm line-clamp-2 mb-1">
                      {suggestion.bookName.trim()}
                    </h4>
                    <p className="text-xs text-zinc-500 line-clamp-2">
                      {suggestion.introduction}
                    </p>
                  </div>
                  <div className="flex-shrink-0 self-center">
                    <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                      <Play size={14} className="text-red-400 ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full"></div>
            <span className="text-sm text-zinc-500">กำลังค้นหา...</span>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-500" />
              ผลลัพธ์การค้นหา
              <span className="text-sm text-zinc-500 font-normal">({results.length})</span>
            </h2>
            <span className="text-sm text-zinc-500">"{query}"</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
            {results.map((drama) => (
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
        </div>
      )}

      {/* No Results */}
      {!loading && query && results.length === 0 && !showSuggestions && (
        <div className="text-center py-16 md:py-20">
          <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchIcon size={40} className="text-zinc-600" />
          </div>
          <p className="text-zinc-400 mb-2">ไม่พบผลลัพธ์สำหรับ "{query}"</p>
          <p className="text-sm text-zinc-600">ลองค้นหาด้วยคำอื่น</p>
        </div>
      )}

      {/* Empty State - Show Recent & Popular */}
      {!query && (
        <div className="space-y-6 md:space-y-8">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
                  <Clock size={18} className="text-zinc-500" />
                  ค้นหาล่าสุด
                </h2>
                <button
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem('recentSearches');
                  }}
                  className="text-sm text-zinc-500 hover:text-red-400 transition-colors"
                >
                  ล้างทั้งหมด
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      handleSearch(term);
                    }}
                    className="group flex items-center gap-2 px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 hover:border-white/10 rounded-xl text-sm transition-all"
                  >
                    <span className="text-zinc-300">{term}</span>
                    <X
                      size={14}
                      className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      onClick={(e) => removeRecentSearch(term, e)}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Dramas */}
          {popularDramas.length > 0 && (
            <div>
              <h2 className="text-base md:text-lg font-semibold flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-red-500" />
                ยอดนิยม
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {popularDramas.map((drama, index) => (
                  <Link
                    key={drama.bookId}
                    to={`/watch/${drama.bookId}`}
                    className="group flex gap-3 p-3 rounded-xl bg-zinc-900/30 hover:bg-zinc-800/50 border border-white/5 hover:border-white/10 transition-all"
                  >
                    {/* Rank */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      index < 3
                        ? index === 0
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : index === 1
                            ? 'bg-zinc-500/20 text-zinc-400'
                            : 'bg-amber-700/20 text-amber-600'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-14 h-20 md:w-16 md:h-24 rounded-lg overflow-hidden bg-zinc-800">
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
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Users size={10} />
                        <span>{drama.playCount}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
