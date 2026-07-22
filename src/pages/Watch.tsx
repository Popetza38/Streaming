import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Share2,
  Heart,
  Eye,
  ListVideo,
  SkipForward,
  SkipBack
} from 'lucide-react';
import { useLanguage } from '../store/language';
import { usePlatform } from '../store/platform';

interface Episode {
  chapterId?: string;
  chapterName?: string;
  chapterIndex?: number;
  duration?: number;
  hlsUrl?: string;
  locked?: boolean;
  number?: number;
  subtitlesUrl?: string;
  episode?: number;
  title?: string;
}

interface DramaDetail {
  id: string;
  bookName: string;
  cover: string;
  introduction: string;
  tags?: string[];
}

const Watch = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [dramaDetail, setDramaDetail] = useState<DramaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [epFilter, setEpFilter] = useState('');
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const { lang } = useLanguage();
  const { platform } = usePlatform();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const filteredEpisodes = episodes.filter((_, idx) => {
    if (!epFilter.trim()) return true;
    const epNum = (idx + 1).toString();
    return epNum.includes(epFilter.trim());
  });

  useEffect(() => {
    if (!id) return;

    setCurrentEpisode(1);
    const fetchData = async () => {
      setIsTransitioning(true);
      try {
        // Fetch detail
        const detailRes = await fetch(`/api/${platform}/detail?id=${id}&lang=${lang}`);
        const detailData = await detailRes.json();
        let loadedEpisodes: Episode[] = [];
        
        if (detailData && (detailData.id || detailData.title || detailData.bookName)) {
          setDramaDetail({
            id: detailData.id || id,
            bookName: detailData.title || detailData.bookName || 'Drama',
            cover: detailData.cover || detailData.coverWap || '',
            introduction: detailData.description || detailData.introduction || '',
            tags: detailData.tags || []
          });

          if (Array.isArray(detailData.episodes) && detailData.episodes.length > 0) {
            loadedEpisodes = detailData.episodes;
          } else if (Array.isArray(detailData.chapterList) && detailData.chapterList.length > 0) {
            loadedEpisodes = detailData.chapterList;
          }
        }

        // Fetch episodes only if detailData didn't contain episode list
        if (loadedEpisodes.length === 0) {
          try {
            const epRes = await fetch(`/api/${platform}/allepisode?id=${id}&lang=${lang}`);
            if (epRes.ok) {
              const epData = await epRes.json();
              if (epData) {
                if (epData.bookName || epData.cover || epData.description) {
                  setDramaDetail(prev => ({
                    id: epData.bookId || prev?.id || id,
                    bookName: epData.bookName || prev?.bookName || 'Drama',
                    cover: epData.cover || prev?.cover || '',
                    introduction: epData.description || prev?.introduction || '',
                    tags: prev?.tags || []
                  }));
                }
                loadedEpisodes = epData.episodes || epData.chapterList || epData.data?.episodes || [];
              }
            }
          } catch (e) {
            console.warn('allepisode fetch fallback:', e);
          }
        }

        setEpisodes(loadedEpisodes);

      } catch (error) {
        console.error('Failed to fetch watch data:', error);
      } finally {
        setLoading(false);
        setIsTransitioning(false);
      }
    };

    fetchData();
  }, [id, lang, platform]);

  const currentEpisodeData = episodes[currentEpisode - 1] as any;
  let videoUrl = `/api/${platform}/hls?id=${id}&ep=${currentEpisode}`;

  if (currentEpisodeData) {
    const rawUrl = currentEpisodeData.hlsUrl || currentEpisodeData.videoUrl || currentEpisodeData.playUrl || currentEpisodeData.url || currentEpisodeData.src || currentEpisodeData.link || currentEpisodeData.streamUrl;
    if (rawUrl) {
      if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        videoUrl = rawUrl;
      } else {
        // Automatically fix 0-indexed ep=0 to ep=1 for Hoshiyomi API compliance
        videoUrl = rawUrl.replace(/([?&]ep=)0(&|$)/, `$11$2`);
      }
    }
  }

  // Attach Universal Player for HLS, MP4, and Proxy Streams
  useEffect(() => {
    if (loading) return;
    setVideoError(null);

    const video = videoRef.current;
    if (!videoUrl || !video) return;

    let isSubscribed = true;

    const prepareAndPlayVideo = async () => {
      let activeUrl = videoUrl;

      // Pre-inspect proxy URL if response is JSON or error
      if (videoUrl.startsWith('/api/')) {
        try {
          const res = await fetch(videoUrl);
          if (!res.ok) {
            const errJson = await res.json().catch(() => null);
            const errMsg = errJson?.error || `HTTP ${res.status}`;
            if (isSubscribed) {
              setVideoError(`เซิร์ฟเวอร์ค่าย ${platform.toUpperCase()} อยู่ระหว่างปรับปรุงระบบ (${errMsg})`);
            }
            return;
          }

          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const json = await res.json();
            const directUrl = json.hlsUrl || json.videoUrl || json.playUrl || json.url || json.streamUrl || json.data?.url || json.data?.hlsUrl;
            if (directUrl && typeof directUrl === 'string') {
              activeUrl = directUrl;
            } else if (json.error) {
              if (isSubscribed) {
                setVideoError(`ไม่สามารถโหลดวิดีโอค่ายนี้ได้ขณะนี้ (${json.error})`);
              }
              return;
            }
          }
        } catch (e) {
          console.warn('Pre-fetch video URL check failed:', e);
        }
      }

      if (!isSubscribed) return;

      const isMp4 = activeUrl.includes('.mp4') || activeUrl.includes('mime_type=video_mp4') || (!activeUrl.includes('.m3u8') && !activeUrl.includes('/hls') && activeUrl.startsWith('http'));

      if (isMp4) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        video.src = activeUrl;
        video.play().catch(() => {});
        return;
      }

      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.loadSource(activeUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            console.error('HLS Fatal Error:', data);
            setVideoError('ไม่สามารถโหลดวิดีโอได้ชั่วคราว กรุณารอสักครู่แล้วกดปุ่มลองใหม่อีกครั้ง');
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = activeUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(() => {});
        });
        video.addEventListener('error', () => {
          setVideoError('ไม่สามารถเล่นวิดีโอได้ กรุณารอสักครู่แล้วลองใหม่อีกครั้ง');
        });
      }
    };

    prepareAndPlayVideo();

    return () => {
      isSubscribed = false;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl, loading]);





  const handleEpisodeChange = (episodeIndex: number) => {
    setCurrentEpisode(episodeIndex);
  };

  const handlePrevious = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode(currentEpisode - 1);
    }
  };

  const handleNext = () => {
    if (currentEpisode < episodes.length) {
      setCurrentEpisode(currentEpisode + 1);
    }
  };

  const handleVideoEnded = () => {
    if (currentEpisode < episodes.length) {
      setCurrentEpisode(currentEpisode + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-zinc-800 border-t-red-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Play size={24} className="text-red-500" fill="currentColor" />
          </div>
        </div>
        <p className="mt-4 text-zinc-500 animate-pulse">กำลังโหลดซีรีส์...</p>
      </div>
    );
  }

  if (!dramaDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <ListVideo size={40} className="text-zinc-600" />
          </div>
          <p className="text-zinc-400 mb-4 text-lg">ไม่พบซีรีส์</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl font-medium transition-all"
          >
            กลับหน้าแรก
          </button>
        </div>
      </div>
    );
  }

  const progress = episodes.length > 0 ? (currentEpisode / episodes.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-md">
        <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-2 bg-black/40 hover:bg-black/60 rounded-xl transition-all active:scale-95 group"
          >
            <ArrowLeft size={18} className="text-white group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-white text-sm hidden sm:block">กลับ</span>
          </button>

          <div className="flex-1 mx-4 text-center">
            <h1 className="font-semibold text-white text-sm md:text-base line-clamp-1">
              {dramaDetail.bookName}
            </h1>
            <p className="text-xs text-zinc-400 hidden sm:block">
              ตอนที่ {currentEpisode} จาก {episodes.length}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2.5 rounded-xl transition-all ${
                isLiked ? 'bg-red-500/20 text-red-500' : 'bg-black/40 hover:bg-black/60 text-white'
              }`}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button className="p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-xl transition-all">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="pt-14 xl:flex xl:gap-6 xl:max-w-7xl xl:mx-auto xl:p-6 xl:pt-20">
        {/* Left: Video Player */}
        <div className="relative xl:flex-1 xl:max-w-lg xl:sticky xl:top-20 xl:self-start">
          {/* Transition Overlay */}
          {isTransitioning && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-20 rounded-2xl">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-zinc-800 border-t-red-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-red-500 font-bold text-sm">{currentEpisode}</span>
                  </div>
                </div>
                <p className="text-white font-medium">กำลังโหลดตอนที่ {currentEpisode}...</p>
              </div>
            </div>
          )}

          {/* Video Container */}
          <div className="relative bg-black flex justify-center xl:rounded-2xl xl:overflow-hidden xl:border xl:border-white/10 shadow-2xl shadow-black/50">
            <div className="w-full md:max-w-lg lg:max-w-xl xl:max-w-none relative">
              {videoError && (
                <div className="absolute inset-0 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center p-6 text-center z-10">
                  <div className="w-14 h-14 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-3 font-bold text-2xl animate-pulse">
                    ⚠️
                  </div>
                  <p className="text-white text-sm font-semibold mb-1 max-w-xs">{videoError}</p>
                  <p className="text-zinc-400 text-xs mb-4">แนะนำให้สลับไปรับชมค่ายที่พร้อมใช้งานอย่างสมบูรณ์</p>
                  <div className="flex gap-2 flex-wrap justify-center max-w-xs">
                    <button
                      onClick={() => {
                        setPlatform('dramabox');
                        navigate('/');
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-red-500/25"
                    >
                      DramaPop
                    </button>
                    <button
                      onClick={() => {
                        setPlatform('melolo');
                        navigate('/');
                      }}
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold transition-all border border-white/10"
                    >
                      Melolo
                    </button>
                    <button
                      onClick={() => {
                        setPlatform('reelshort');
                        navigate('/');
                      }}
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold transition-all border border-white/10"
                    >
                      ReelShort
                    </button>
                  </div>
                </div>
              )}
              <video
                ref={videoRef}
                poster={dramaDetail.cover || ''}
                controls
                autoPlay
                playsInline
                onEnded={handleVideoEnded}
                className="w-full aspect-[9/16] object-contain bg-black xl:aspect-auto xl:max-h-[75vh]"
              />
            </div>
          </div>


          {/* Quick Actions Below Video */}
          <div className="hidden xl:flex items-center justify-center gap-3 mt-4">
            <button
              onClick={handlePrevious}
              disabled={currentEpisode <= 1}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm transition-all"
            >
              <SkipBack size={16} />
              ตอนก่อน
            </button>
            <div className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium">
              ตอนที่ {currentEpisode}
            </div>
            <button
              onClick={handleNext}
              disabled={currentEpisode >= episodes.length}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm transition-all"
            >
              ตอนถัดไป
              <SkipForward size={16} />
            </button>
          </div>
        </div>

        {/* Right: Content */}
        <div className="p-4 space-y-5 xl:flex-1 xl:max-w-xl xl:p-0">
          {/* Drama Info Card */}
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 rounded-2xl p-4 md:p-6 border border-white/5 shadow-xl">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3">{dramaDetail.bookName}</h2>

            {/* Episode Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                <span>ความคืบหน้า</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs md:text-sm font-bold rounded-full shadow-lg shadow-red-500/20">
                EP.{currentEpisode} / {episodes.length}
              </span>
              {currentEpisodeData?.chapterName && (
                <span className="text-zinc-400 text-xs md:text-sm truncate max-w-[200px]">
                  {currentEpisodeData.chapterName}
                </span>
              )}
            </div>

            {dramaDetail.introduction && (
              <div className="relative">
                <p className="text-sm md:text-base text-zinc-400 leading-relaxed line-clamp-3">
                  {dramaDetail.introduction}
                </p>
              </div>
            )}

            {/* Tags */}
            {dramaDetail.tags && dramaDetail.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-3">
                {dramaDetail.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs bg-zinc-800/80 text-zinc-400 px-2.5 py-1 rounded-full border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <ListVideo size={14} />
                <span>{episodes.length} ตอน</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Eye size={14} />
                <span>กำลังรับชม</span>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 md:gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentEpisode <= 1 || isTransitioning}
              className="flex-1 py-3.5 md:py-4 bg-zinc-800/80 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm md:text-base font-medium group"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>ตอนก่อน</span>
            </button>
            <button
              onClick={handleNext}
              disabled={currentEpisode >= episodes.length || isTransitioning}
              className="flex-1 py-3.5 md:py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-white text-sm md:text-base font-medium shadow-lg shadow-red-500/25 group"
            >
              <span>ตอนถัดไป</span>
              <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Episode List */}
          <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 rounded-2xl p-4 md:p-5 border border-white/5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ListVideo size={20} className="text-red-500" />
                <h3 className="font-semibold text-white md:text-lg">รายการตอน</h3>
                <input
                  type="text"
                  value={epFilter}
                  onChange={(e) => setEpFilter(e.target.value)}
                  placeholder="ค้นหาตอน..."
                  className="w-24 px-2 py-1 bg-zinc-950 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-zinc-500">{episodes.length} ตอน</span>
                {episodes.length > 12 && (
                  <button
                    onClick={() => setShowAllEpisodes(!showAllEpisodes)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    {showAllEpisodes ? 'แสดงน้อย' : 'ดูทั้งหมด'}
                  </button>
                )}
              </div>
            </div>

            <div className={`grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 xl:grid-cols-8 gap-1.5 md:gap-2 overflow-y-auto pr-1 transition-all duration-300 ${
              showAllEpisodes ? 'max-h-96' : 'max-h-60'
            }`}>
              {filteredEpisodes.map((ep: Episode) => {
                const epNum = episodes.indexOf(ep) + 1;
                const isActive = currentEpisode === epNum;
                const isWatched = epNum < currentEpisode;



                return (
                  <button
                    key={ep.chapterId || epNum}
                    onClick={() => handleEpisodeChange(epNum)}
                    disabled={isTransitioning}
                    className={`relative rounded-lg text-xs md:text-sm font-medium transition-all overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 scale-105 ring-2 ring-red-500/50'
                        : isWatched
                          ? 'bg-zinc-700/80 text-zinc-300 hover:bg-zinc-600'
                          : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                    } ${isTransitioning ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
                  >
                    <div className="aspect-square flex items-center justify-center">
                      <span>{epNum}</span>
                    </div>

                    {isActive && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}

                    {isWatched && !isActive && (
                      <div className="absolute bottom-1 right-1">
                        <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {currentEpisodeData?.chapterName && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-sm text-zinc-400">
                  <span className="text-zinc-500">ตอนที่ {currentEpisode}:</span>{' '}
                  <span className="text-white">{currentEpisodeData.chapterName}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;

