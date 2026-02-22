import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Lock, Play, SkipForward } from 'lucide-react';
import Hls from 'hls.js';
import { useLanguage, lockMessages } from '../store/language';
import { useSource } from '../store/source';
import { useHistory } from '../store/history';
import { useDramaDetail, useVideoPlayer } from '../hooks/useDramas';

const Watch = () => {
  const { id: code } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [showLockPopup, setShowLockPopup] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const { lang } = useLanguage();
  const { source } = useSource();
  const { addOrUpdate } = useHistory();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeout = useRef<number>();

  // Get drama info from navigation state (for DramaBox which doesn't have detail endpoint)
  const navState = location.state as { name?: string; cover?: string; episodes?: number } | null;

  const { drama: fetchedDrama, loading: dramaLoading } = useDramaDetail(code);
  const { videoData, loading: videoLoading } = useVideoPlayer(code, currentEpisode);

  // Merge fetched drama with navigation state
  const drama = fetchedDrama ? {
    ...fetchedDrama,
    name: fetchedDrama.name || navState?.name || 'Unknown Drama',
    cover: fetchedDrama.cover || navState?.cover || '',
    episodes: fetchedDrama.episodes || navState?.episodes || 0,
  } : null;

  // Save to watch history
  useEffect(() => {
    if (!drama || !code) return;
    addOrUpdate({
      id: code,
      name: drama.name,
      cover: drama.cover,
      episodes: drama.episodes,
      lastEpisode: currentEpisode,
      source,
    });
  }, [drama?.name, code, currentEpisode, source]);

  // Setup Video Player (HLS or MP4)
  useEffect(() => {
    if (!videoRef.current || !videoData) return;

    const video = videoRef.current;

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (videoData.videoType === 'hls') {
      // ShortMax: HLS streaming
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(videoData.videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => { });
        });
        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoData.videoUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(() => { });
        }, { once: true });
      }
    } else {
      // DramaBox: Direct MP4
      video.src = videoData.videoUrl;
      if (videoData.cover) {
        video.poster = videoData.cover;
      }
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => { });
      }, { once: true });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoData]);

  // Track play state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [videoData]);

  const handleShowControls = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout.current);
    controlsTimeout.current = window.setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const isEpisodeLocked = (ep: number) => {
    if (source === 'shortmax') return ep >= 30;
    return false; // DramaBox manages its own locks
  };

  const handleEpisodeChange = (ep: number) => {
    if (isEpisodeLocked(ep)) {
      setShowLockPopup(true);
      return;
    }
    setCurrentEpisode(ep);
  };

  const handlePrevious = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode(currentEpisode - 1);
    }
  };

  const handleNext = () => {
    if (drama && currentEpisode < drama.episodes) {
      const nextEp = currentEpisode + 1;
      if (isEpisodeLocked(nextEp)) {
        setShowLockPopup(true);
        return;
      }
      setCurrentEpisode(nextEp);
    }
  };

  const handleVideoEnded = () => {
    if (drama && currentEpisode < drama.episodes) {
      const nextEp = currentEpisode + 1;
      if (isEpisodeLocked(nextEp)) {
        setShowLockPopup(true);
        return;
      }
      setCurrentEpisode(nextEp);
    }
  };

  if (dramaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Loading drama...</p>
        </div>
      </div>
    );
  }

  if (!drama) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
            <Play size={32} className="text-zinc-500" />
          </div>
          <p className="text-zinc-400 text-lg">Drama not found</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{drama.name}</h1>
            <p className="text-xs text-zinc-500">Episode {currentEpisode} of {drama.episodes}</p>
          </div>
          {/* Source badge */}
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${source === 'dramabox'
            ? 'bg-purple-500/20 text-purple-400'
            : 'bg-amber-500/20 text-amber-400'
            }`}>
            {source === 'dramabox' ? '🎬 DramaBox' : '⚡ ShortMax'}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="lg:flex lg:gap-6 lg:px-6 lg:py-6">
          {/* Video Player */}
          <div className="lg:flex-1">
            <div
              className="relative bg-black aspect-video lg:rounded-xl overflow-hidden group"
              onMouseMove={handleShowControls}
              onClick={handleShowControls}
            >
              {videoLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-3 border-[#e50914] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-zinc-400">Loading episode {currentEpisode}...</p>
                </div>
              ) : videoData ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    controls
                    onEnded={handleVideoEnded}
                    playsInline
                  />
                  {/* Custom overlay controls */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 transition-opacity duration-300 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute top-4 left-4 text-sm font-medium pointer-events-auto">
                      Ep. {currentEpisode}
                    </div>
                    {/* Quality badge for DramaBox */}
                    {videoData.qualities && videoData.qualities.length > 0 && (
                      <div className="absolute top-4 right-4 text-xs bg-white/20 px-2 py-1 rounded-full pointer-events-auto">
                        720p
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                    <Play size={28} className="text-zinc-400" />
                  </div>
                  <p className="text-zinc-500">Video not available</p>
                </div>
              )}
            </div>

            {/* Mobile: Episode Navigation */}
            <div className="px-4 py-4 space-y-4 lg:px-0 lg:pt-5">
              {/* Title & Info */}
              <div>
                <h2 className="text-xl font-bold mb-1">{drama.name}</h2>
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <span className="bg-[#e50914]/20 text-[#e50914] px-2 py-0.5 rounded-full text-xs font-semibold">
                    EP {currentEpisode}
                  </span>
                  <span>{drama.episodes} episodes total</span>
                </div>
                {drama.summary && (
                  <p className="text-sm text-zinc-400 mt-3 leading-relaxed line-clamp-3">
                    {drama.summary}
                  </p>
                )}
              </div>

              {/* Episode Nav Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentEpisode === 1}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentEpisode === drama.episodes}
                  className="flex-1 flex items-center justify-center gap-2 btn-primary py-3 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Episode Sidebar (desktop) / Episode Grid (mobile) */}
          <div className="lg:w-80 xl:w-96 px-4 lg:px-0">
            <div className="lg:sticky lg:top-20">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <SkipForward size={18} className="text-[#e50914]" />
                Episodes
              </h3>
              <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto pr-1 scrollbar-hide">
                {Array.from({ length: drama.episodes }, (_, i) => i + 1).map((ep) => {
                  const isLocked = isEpisodeLocked(ep);
                  const isCurrent = currentEpisode === ep;

                  return (
                    <button
                      key={ep}
                      onClick={() => handleEpisodeChange(ep)}
                      className={`relative aspect-square rounded-xl text-sm font-semibold transition-all duration-200 ${isCurrent
                        ? 'bg-[#e50914] text-white scale-105 shadow-lg shadow-[#e50914]/30'
                        : isLocked
                          ? 'bg-zinc-800/50 text-zinc-600 border border-zinc-700/50'
                          : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-white/5'
                        }`}
                    >
                      {isLocked && !isCurrent && (
                        <Lock size={10} className="absolute top-1 right-1 text-zinc-600" />
                      )}
                      {ep}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lock Popup (ShortMax only) */}
      {showLockPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-[#e50914]/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Lock size={36} className="text-[#e50914]" />
            </div>
            <h3 className="text-xl font-bold mb-2">Episode Locked</h3>
            <p className="text-zinc-400 mb-6 text-sm leading-relaxed whitespace-pre-line">
              {lockMessages[lang] || lockMessages.en}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLockPopup(false)}
                className="flex-1 bg-white/5 border border-white/10 text-white py-3 rounded-xl font-medium hover:bg-white/10 transition-all"
              >
                OK
              </button>
              <a
                href="https://t.me/sapitokenbot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 btn-primary py-3 rounded-xl font-medium text-center"
              >
                Telegram
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watch;
