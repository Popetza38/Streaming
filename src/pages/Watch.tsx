import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

interface Episode {
  episodeId?: string;
  chapterId?: string;
  episodeIndex?: number;
  chapterIndex?: number;
  episode?: number;
  videoUrl?: string;
  url?: string;
  title?: string;
  chapterName?: string;
}

interface DramaDetail {
  bookName: string;
  cover?: string;
  bookCover?: string;
  coverWap?: string;
  introduction: string;
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
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);
  const { lang } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsTransitioning(true);
      try {
        // Fetch drama detail
        const detailResponse = await fetch(`/api/drama/${id}?lang=${lang}`);
        const detailData = await detailResponse.json();
        const isDetailSuccess = detailData.success || detailData.data?.success || detailData.code === 0;
        if (isDetailSuccess) {
          // Note: detailData contains chapter metadata (bookStatus, performers, ratingConf)
          // We don't set dramaDetail here because it lacks bookName and cover.
          // We will extract dramaDetail from the episodes API response instead.
          console.log('Drama detail metadata loaded');
        }

        // Fetch episodes
        const episodesResponse = await fetch(`/api/drama/${id}/episodes?lang=${lang}`);
        const episodesData = await episodesResponse.json();
        const isEpisodesSuccess = episodesData.success || episodesData.data?.success || episodesData.code === 0;
        
        if (isEpisodesSuccess) {
          // episodesData.data contains bookName, cover, description, and episodes array
          const episodesObj = episodesData.data?.data || episodesData.data;
          
          if (episodesObj) {
            setDramaDetail({
              bookName: episodesObj.bookName || detailData.data?.bookName || 'Unknown Drama',
              cover: episodesObj.cover || episodesObj.coverWap || detailData.data?.cover || '',
              introduction: episodesObj.description || episodesObj.introduction || detailData.data?.introduction || ''
            });

            const list = episodesObj.book?.episodeList || 
                         episodesObj.episodeList || 
                         episodesObj.episodes || 
                         episodesObj.chapterList || [];
            setEpisodes(list);
          }
        }
      } catch (error) {
        console.error('Failed to fetch watch data:', error);
      } finally {
        setLoading(false);
        setIsTransitioning(false);
      }
    };

    fetchData();
  }, [id, lang]);

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

  const currentEpisodeData = episodes[currentEpisode - 1];
  const videoUrl = currentEpisodeData?.url || currentEpisodeData?.videoUrl || '';
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
            <div className="w-full md:max-w-lg lg:max-w-xl xl:max-w-none">
              {videoUrl ? (
                <video
                  ref={videoRef}
                  key={videoUrl}
                  src={videoUrl}
                  poster={dramaDetail.coverWap || dramaDetail.cover || ''}
                  controls
                  autoPlay
                  playsInline
                  onEnded={handleVideoEnded}
                  className="w-full aspect-[9/16] object-contain bg-black xl:aspect-auto xl:max-h-[75vh]"
                />
              ) : (
                <div className="w-full aspect-[9/16] flex items-center justify-center bg-gradient-to-b from-zinc-900 to-black xl:max-h-[75vh]">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-zinc-800/30">
                      <Play size={32} className="text-zinc-500 ml-1" />
                    </div>
                    <p className="text-zinc-400 font-medium">ไม่มีวิดีโอ</p>
                    <p className="text-zinc-600 text-sm mt-1">ตอนนี้ยังไม่พร้อมให้รับชม</p>
                  </div>
                </div>
              )}
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
              {currentEpisodeData?.title && (
                <span className="text-zinc-400 text-xs md:text-sm truncate max-w-[200px]">
                  {currentEpisodeData.title}
                </span>
              )}
            </div>

            {dramaDetail.introduction && (
              <div className="relative">
                <p className="text-sm md:text-base text-zinc-400 leading-relaxed line-clamp-3">
                  {dramaDetail.introduction}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-zinc-900/80 to-transparent" />
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ListVideo size={20} className="text-red-500" />
                <h3 className="font-semibold text-white md:text-lg">รายการตอน</h3>
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
              {episodes.map((episode: Episode, index: number) => {
                const epNum = episode.episode ?? (episode.episodeIndex ?? episode.chapterIndex ?? index) + 1;
                const isActive = currentEpisode === epNum;
                const isWatched = epNum < currentEpisode;

                return (
                  <button
                    key={episode.episodeId || episode.chapterId || epNum}
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
                    {/* Episode Number */}
                    <div className="aspect-square flex items-center justify-center">
                      <span>{epNum}</span>
                    </div>

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}

                    {/* Watched Indicator */}
                    {isWatched && !isActive && (
                      <div className="absolute bottom-1 right-1">
                        <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                      </div>
                    )}

                    {/* Episode Title (if available) */}
                    {episode.title && isActive && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm py-0.5 px-1">
                        <p className="text-[9px] truncate text-center">{episode.title}</p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Episode Info */}
            {currentEpisodeData?.title && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-sm text-zinc-400">
                  <span className="text-zinc-500">ตอนที่ {currentEpisode}:</span>{' '}
                  <span className="text-white">{currentEpisodeData.title}</span>
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
