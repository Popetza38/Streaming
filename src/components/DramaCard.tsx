import Link from 'next/link';
import Image from 'next/image';
import { Play, Eye } from 'lucide-react';
import { getDramaId, getDramaTitle, getDramaCover, getDramaTags, getEpisodeCount, getDramaViews, formatViews } from '@/lib/utils';

interface DramaCardProps {
  drama: any;
  rank?: number;
  showRank?: boolean;
}

export default function DramaCard({ drama, rank, showRank = false }: DramaCardProps) {
  const dramaId = getDramaId(drama);
  const title = getDramaTitle(drama);
  const cover = getDramaCover(drama);
  const tags = getDramaTags(drama);
  const episodeCount = getEpisodeCount(drama);
  const views = getDramaViews(drama);

  const getRankBadgeStyle = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-amber-600 text-black';
    if (rank === 2) return 'from-gray-300 to-gray-500 text-black';
    if (rank === 3) return 'from-orange-400 to-orange-600 text-white';
    return 'from-dark-elevated to-dark-card text-white';
  };

  return (
    <Link href={`/drama/${dramaId}`} className="group block">
      <div className="relative aspect-drama rounded-xl overflow-hidden bg-dark-surface card-hover">
        <Image
          src={cover}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 160px, 192px"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100">
              <Play className="w-7 h-7 fill-white text-white ml-0.5" />
            </div>
          </div>

          {/* Bottom info on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-white text-xs font-semibold line-clamp-1 mb-1">{title}</p>
            <div className="flex items-center gap-2 text-gray-300">
              {episodeCount > 0 && <span className="text-[10px]">{episodeCount} ตอน</span>}
              {views > 0 && (
                <span className="flex items-center gap-0.5 text-[10px]">
                  <Eye className="w-3 h-3" />
                  {formatViews(views)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Rank Badge */}
        {showRank && rank && (
          <div className={`absolute top-2 left-2 w-8 h-8 bg-gradient-to-br ${getRankBadgeStyle(rank)} rounded-lg flex items-center justify-center font-black text-sm shadow-lg`}>
            {rank}
          </div>
        )}

        {/* Genre Tag */}
        {tags.length > 0 && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-medium text-gray-200 border border-white/5">
            {tags[0]}
          </div>
        )}

        {/* Episode Count Pill */}
        {episodeCount > 0 && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-medium text-gray-200 border border-white/5 group-hover:opacity-0 transition-opacity duration-300">
            {episodeCount} EP
          </div>
        )}
      </div>

      {/* Text Below Card */}
      <div className="mt-2.5 px-0.5">
        <h3 className="font-semibold text-sm line-clamp-2 text-gray-200 group-hover:text-white transition-colors duration-200">
          {title}
        </h3>
        {views > 0 && (
          <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {formatViews(views)} การดู
          </p>
        )}
      </div>
    </Link>
  );
}
