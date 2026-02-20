'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import DramaCard from './DramaCard';

interface DramaCarouselProps {
  title: string;
  dramas: any[];
  viewAllHref?: string;
  showRank?: boolean;
}

export default function DramaCarousel({ title, dramas, viewAllHref, showRank = false }: DramaCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 600;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!dramas || dramas.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3 group">
          <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="flex items-center gap-1.5 text-xs text-primary font-semibold px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all duration-200"
            >
              ดูทั้งหมด
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-full transition-all duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-full transition-all duration-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-4 overflow-x-auto hide-scrollbar snap-x pb-4"
      >
        {dramas.map((drama: any, index: number) => (
          <div key={index} className="flex-shrink-0 w-36 md:w-44 snap-start">
            <DramaCard drama={drama} rank={showRank ? index + 1 : undefined} showRank={showRank} />
          </div>
        ))}
      </div>
    </section>
  );
}
