import { Play, Users, Heart } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { NormalizedDrama } from '../../utils/normalize';

interface DramaCardProps {
  drama: NormalizedDrama;
  size?: 'sm' | 'md' | 'lg';
}

const DramaCard = ({ drama, size = 'md' }: DramaCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const sizeClasses = {
    sm: 'w-36',
    md: 'w-44',
    lg: 'w-56'
  };

  return (
    <Link to={`/watch/${drama.id}`} className={`group cursor-pointer ${sizeClasses[size]} flex-shrink-0`}>
      <div className="relative overflow-hidden rounded-xl hover:scale-105 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-[3/4]">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-zinc-800 animate-pulse rounded-xl" />
          )}
          <img
            src={drama.cover}
            alt={drama.name}
            className={`w-full h-full object-cover rounded-xl transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {/* Corner Badge */}
          {drama.corner && (
            <div
              className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg z-10"
              style={{ backgroundColor: drama.corner.color }}
            >
              {drama.corner.name}
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-xl" />

          {/* Hover Actions */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={`w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center hover:scale-110 transition-transform ${isLiked ? 'text-red-500' : 'text-white'
                }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Play Button Center */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 bg-red-500/90 rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 ml-0.5 text-white" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-2">
          <h3 className="text-sm font-medium line-clamp-2 mb-1">{drama.name}</h3>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            {drama.playCount && (
              <div className="flex items-center gap-1">
                <Users size={11} />
                <span>{drama.playCount}</span>
              </div>
            )}
            {drama.episodes > 0 && (
              <span>{drama.episodes} ep</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DramaCard;
