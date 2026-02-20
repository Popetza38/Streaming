'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getEpisodeIndex } from '@/lib/utils';

interface EpisodeListProps {
  episodes: any[];
  dramaId: string;
  dramaTitle?: string;
  dramaCover?: string;
  currentEpisode?: number;
}

export default function EpisodeList({ episodes, dramaId, currentEpisode }: EpisodeListProps) {
  const [expanded, setExpanded] = useState(episodes.length <= 20);
  const displayEpisodes = expanded ? episodes : episodes.slice(0, 20);

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-5">
        <h3 className="text-xl font-bold text-white">รายการตอน</h3>
        <span className="text-sm text-gray-400">({episodes.length} ตอน)</span>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-4">
        {displayEpisodes.map((episode, index) => {
          const episodeIndex = getEpisodeIndex(episode);
          const isCurrent = currentEpisode !== undefined && episodeIndex === currentEpisode;

          return (
            <Link
              key={index}
              href={`/watch/${dramaId}/${episodeIndex}`}
              className={`aspect-square flex items-center justify-center rounded-lg font-semibold transition-all ${isCurrent
                  ? 'bg-primary text-white glow'
                  : 'bg-dark-elevated hover:bg-dark-card hover:text-primary'
                }`}
            >
              {episodeIndex + 1}
            </Link>
          );
        })}
      </div>

      {episodes.length > 20 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 mx-auto px-4 py-2 bg-dark-elevated hover:bg-dark-card rounded-lg transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              แสดงน้อยลง
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              แสดงทั้งหมด ({episodes.length} ตอน)
            </>
          )}
        </button>
      )}
    </div>
  );
}
