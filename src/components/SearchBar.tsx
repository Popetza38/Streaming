'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { api } from '@/lib/api';
import { extractList, getDramaId, getDramaTitle, getDramaCover } from '@/lib/utils';

interface SearchBarProps {
  onClose?: () => void;
  fullPage?: boolean;
}

export default function SearchBar({ onClose, fullPage = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (debouncedQuery.trim().length > 1) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  const fetchSuggestions = async (keyword: string) => {
    setLoading(true);
    try {
      const data = await api.getSuggestions(keyword);
      const list = extractList(data);
      setSuggestions(list.slice(0, 5));
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
      onClose?.();
    }
  };

  const handleSuggestionClick = (drama: any) => {
    router.push(`/drama/${getDramaId(drama)}`);
    setShowSuggestions(false);
    onClose?.();
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="ค้นหาซีรีส์..."
          className={`w-full ${fullPage ? 'h-14 text-lg' : 'h-12'} pl-12 pr-12 bg-dark-elevated border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition-colors`}
          autoFocus={fullPage}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-dark-card rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-elevated border border-gray-700 rounded-lg overflow-hidden z-50">
          {suggestions.map((drama, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(drama)}
              className="w-full flex items-center gap-3 p-3 hover:bg-dark-card transition-colors text-left"
            >
              <div className="relative w-12 h-16 flex-shrink-0">
                <Image
                  src={getDramaCover(drama)}
                  alt={getDramaTitle(drama)}
                  fill
                  className="object-cover rounded"
                  sizes="48px"
                />
              </div>
              <span className="flex-1 line-clamp-2">{getDramaTitle(drama)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
