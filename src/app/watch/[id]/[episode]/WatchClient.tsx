'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ListOrdered } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import { getVideoUrl, getDramaTitle, getDramaCover, getEpisodeIndex } from '@/lib/utils';
import { useWatchHistory } from '@/hooks/useWatchHistory';

interface WatchClientProps {
  videoData: any;
  episodes: any[];
  drama: any;
  dramaId: string;
  currentEpisode: number;
}

export default function WatchClient({
  videoData,
  episodes,
  drama,
  dramaId,
  currentEpisode,
}: WatchClientProps) {
  const router = useRouter();
  const videoUrl = getVideoUrl(videoData);
  const dramaTitle = getDramaTitle(drama);
  const dramaCover = getDramaCover(drama);
  const { addToHistory } = useWatchHistory();

  useEffect(() => {
    addToHistory({
      dramaId,
      dramaTitle,
      cover: dramaCover,
      episode: currentEpisode,
      totalEpisodes: episodes.length,
      progress: 0,
    });
  }, [dramaId, currentEpisode]);

  const handlePrevious = () => {
    if (currentEpisode > 0) {
      router.push(`/watch/${dramaId}/${currentEpisode - 1}`);
    }
  };

  const handleNext = () => {
    if (currentEpisode < episodes.length - 1) {
      router.push(`/watch/${dramaId}/${currentEpisode + 1}`);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg pt-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="py-3">
          <Link
            href={`/drama/${dramaId}`}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับไปรายละเอียด
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1">
            <div className="rounded-xl overflow-hidden bg-black shadow-2xl shadow-black/50">
              <VideoPlayer
                videoUrl={videoUrl}
                onPrevious={handlePrevious}
                onNext={handleNext}
                hasPrevious={currentEpisode > 0}
                hasNext={currentEpisode < episodes.length - 1}
              />
            </div>

            <div className="mt-4 p-5 bg-dark-surface rounded-xl border border-white/5">
              <h1 className="text-xl font-bold text-white mb-1">{dramaTitle}</h1>
              <p className="text-sm text-gray-400">
                ตอนที่ {currentEpisode + 1}
                <span className="mx-2 text-gray-600">•</span>
                <span className="text-gray-500">{episodes.length} ตอนทั้งหมด</span>
              </p>
            </div>
          </div>

          <div className="lg:w-80">
            <div className="bg-dark-surface rounded-xl border border-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center gap-2.5">
                <ListOrdered className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-sm text-white">รายการตอน</h2>
                <span className="text-xs text-gray-500 ml-auto">{episodes.length} ตอน</span>
              </div>
              <div className="max-h-[600px] overflow-y-auto p-2 space-y-1">
                {episodes.map((episode: any, index: number) => {
                  const episodeIndex = getEpisodeIndex(episode);
                  const isCurrent = episodeIndex === currentEpisode;

                  return (
                    <Link
                      key={index}
                      href={`/watch/${dramaId}/${episodeIndex}`}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-sm ${isCurrent
                        ? 'bg-primary/15 text-primary border border-primary/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      {isCurrent && (
                        <div className="w-1 h-4 bg-primary rounded-full" />
                      )}
                      <span className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                        ตอนที่ {episodeIndex + 1}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
