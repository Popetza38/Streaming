'use client';

import { useRef } from 'react';
import { getGenreId, getGenreName } from '@/lib/utils';

interface GenreFilterProps {
  genres: any[];
  selectedGenre: string;
  onGenreChange: (genreId: string) => void;
}

export default function GenreFilter({ genres, selectedGenre, onGenreChange }: GenreFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-6"
    >
      <button
        onClick={() => onGenreChange('')}
        className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${selectedGenre === ''
            ? 'bg-primary text-white'
            : 'bg-dark-elevated hover:bg-dark-card'
          }`}
      >
        ทั้งหมด
      </button>

      {genres.map((genre, index) => {
        const genreId = getGenreId(genre);
        const genreName = getGenreName(genre);
        const isSelected = selectedGenre === genreId;

        return (
          <button
            key={index}
            onClick={() => onGenreChange(genreId)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${isSelected
                ? 'bg-primary text-white'
                : 'bg-dark-elevated hover:bg-dark-card'
              }`}
          >
            {genreName}
          </button>
        );
      })}
    </div>
  );
}
