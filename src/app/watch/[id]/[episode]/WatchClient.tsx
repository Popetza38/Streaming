'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ListOrdered, Loader2 } from 'lucide-react';
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
  currentEpisode: initialEpisode,
}: WatchClientProps) {
  const router = useRouter();
  const dramaTitle = getDramaTitle(drama);
  const dramaCover = getDramaCover(drama);
  const { addToHistory } = useWatchHistory();

  const [activeEpisode, setActiveEpisode] = useState(initialEpisode);
  const [videoUrl, setVideoUrl] = useState(getVideoUrl(videoData));
  const [transitioning, setTransitioning] = useState(false);

  // Save to watch history
  useEffect(() => {
    addToHistory({
      dramaId,
      dramaTitle,
      cover: dramaCover,
      episode: activeEpisode,
      totalEpisodes: episodes.length,
      progress: 0,
    });
  }, [dramaId, activeEpisode]);

  // Sync URL without full reload
  useEffect(() => {
    window.history.replaceState(null, '', `/watch/${dramaId}/${activeEpisode}`);
  }, [activeEpisode, dramaId]);

  const switchEpisode = useCallback(async (newEpisode: number) => {
    if (newEpisode === activeEpisode || newEpisode < 0 || newEpisode >= episodes.length) return;

    setTransitioning(true);

    try {
      const res = await fetch(`/api/watch/${dramaId}/${newEpisode}?lang=th&source=search_result`);
      const data = await res.json();
      const newUrl = getVideoUrl(data);

      if (newUrl) {
        // Small delay for smooth fade
        await new Promise(r => setTimeout(r, 150));
        setActiveEpisode(newEpisode);
        setVideoUrl(newUrl);
      }
    } catch (error) {
      console.error('Error switching episode:', error);
    } finally {
      setTransitioning(false);
    }
  }, [activeEpisode, dramaId, episodes.length]);

  const handlePrevious = useCallback(() => {
    if (activeEpisode > 0) switchEpisode(activeEpisode - 1);
  }, [activeEpisode, switchEpisode]);

  const handleNext = useCallback(() => {
    if (activeEpisode < episodes.length - 1) switchEpisode(activeEpisode + 1);
  }, [activeEpisode, episodes.length, switchEpisode]);

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
            {/* Player with fade transition */}
            <div className="relative rounded-xl overflow-hidden bg-black shadow-2xl shadow-black/50">
              <div className={`transition-opacity duration-300 ${transitioning ? 'opacity-30' : 'opacity-100'}`}>
                <VideoPlayer
                  videoUrl={videoUrl}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  hasPrevious={activeEpisode > 0}
                  hasNext={activeEpisode < episodes.length - 1}
                />
              </div>

              {/* Loading overlay */}
              {transitioning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-sm text-gray-300">กำลังโหลดตอนถัดไป...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 p-5 bg-dark-surface rounded-xl border border-white/5">
              <h1 className="text-xl font-bold text-white mb-1">{dramaTitle}</h1>
              <p className="text-sm text-gray-400">
                ตอนที่ {activeEpisode + 1}
                <span className="mx-2 text-gray-600">•</span>
                <span className="text-gray-500">{episodes.length} ตอนทั้งหมด</span>
              </p>
            </div>
          </div>

          {/* Episode List Sidebar */}
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
                  const isCurrent = episodeIndex === activeEpisode;

                  return (
                    <button
                      key={index}
                      onClick={() => switchEpisode(episodeIndex)}
                      disabled={transitioning}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-sm text-left ${isCurrent
                        ? 'bg-primary/15 text-primary border border-primary/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        } ${transitioning ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      {isCurrent && (
                        <div className="w-1 h-4 bg-primary rounded-full flex-shrink-0" />
                      )}
                      <span className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                        ตอนที่ {episodeIndex + 1}
                      </span>
                    </button>
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
