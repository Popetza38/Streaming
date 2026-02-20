'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDramaId, getDramaTitle, getDramaCover, getDramaTags, getDramaDescription } from '@/lib/utils';

interface HeroBannerProps {
  dramas: any[];
}

export default function HeroBanner({ dramas }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const topDramas = dramas.slice(0, 5);

  useEffect(() => {
    if (topDramas.length === 0) return;

    const interval = setInterval(() => {
      goToSlide((currentIndex + 1) % topDramas.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [topDramas.length, currentIndex]);

  const goToSlide = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  if (topDramas.length === 0) return null;

  const currentDrama = topDramas[currentIndex];
  const dramaId = getDramaId(currentDrama);
  const title = getDramaTitle(currentDrama);
  const cover = getDramaCover(currentDrama);
  const tags = getDramaTags(currentDrama);
  const description = getDramaDescription(currentDrama);

  return (
    <div className="relative h-[75vh] md:h-[85vh] overflow-hidden">
      {/* Background Image */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <Image
          src={cover}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/20 to-transparent" />
      <div className="absolute inset-0 bg-black/10" />

      {/* Content */}
      <div className={`relative container mx-auto px-4 lg:px-8 h-full flex items-end pb-20 md:pb-24 transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <div className="max-w-xl">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 animate-fade-in">
              {tags.slice(0, 3).map((tag: string, index: number) => (
                <span key={index} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 text-white text-shadow-hero leading-tight tracking-tight">
            {title}
          </h1>

          {/* Description */}
          <p className="text-gray-300 text-sm md:text-base mb-8 line-clamp-3 leading-relaxed max-w-lg">
            {description}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/drama/${dramaId}`}
              className="btn-netflix flex items-center gap-2 px-7 py-3 rounded-md text-sm"
            >
              <Play className="w-5 h-5 fill-white" />
              ดูเลย
            </Link>
            <Link
              href={`/drama/${dramaId}`}
              className="btn-ghost flex items-center gap-2 px-7 py-3 rounded-md text-sm backdrop-blur-md"
            >
              <Info className="w-5 h-5" />
              รายละเอียด
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
        {topDramas.map((_: any, index: number) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1 rounded-full transition-all duration-500 ${index === currentIndex ? 'bg-primary w-10' : 'bg-white/30 w-5 hover:bg-white/50'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
