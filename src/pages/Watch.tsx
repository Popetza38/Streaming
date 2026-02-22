import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../store/language';
import { useWatchHistory } from '../store/watchHistory';
import VideoPlayer from '../components/VideoPlayer';
import { usePageMeta } from '../hooks/usePageMeta';

interface Chapter {
  chapterId: string;
  chapterIndex: number;
  isCharge: number;
  isPay: number;
}

interface WatchData {
  bookName: string;
  bookCover: string;
  videoUrl: string;
  introduction: string;
}

const Watch = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentChapter, setCurrentChapter] = useState(1);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [watchData, setWatchData] = useState<WatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialTime, setInitialTime] = useState(0);
  const { lang } = useLanguage();
  const { save, getItem } = useWatchHistory();
  const saveTimerRef = useRef<ReturnType<typeof setInterval>>();
  const lastTimeRef = useRef({ time: 0, duration: 0 });

  usePageMeta(
    watchData ? `${watchData.bookName} EP ${currentChapter}` : 'Loading...',
    watchData?.introduction
  );

  // Resume from watch history on first load
  useEffect(() => {
    if (!id) return;
    const saved = getItem(id);
    if (saved) {
      setCurrentChapter(saved.episode);
      setInitialTime(saved.videoTime);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        if (chapters.length === 0) {
          const chaptersResponse = await fetch(`/api/chapters/${id}?lang=${lang}`);
          const chaptersData = await chaptersResponse.json();
          if (chaptersData.success) {
            setChapters(chaptersData.data.chapterList);
          }
        }

        const watchResponse = await fetch(`/api/watch/${id}/${currentChapter}?lang=${lang}&direction=1`);
        const watchDataResponse = await watchResponse.json();
        if (watchDataResponse.success) {
          setWatchData(watchDataResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch watch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentChapter, lang]);

  // Save progress every 5 seconds
  useEffect(() => {
    saveTimerRef.current = setInterval(() => {
      if (!id || !watchData || lastTimeRef.current.time <= 0) return;
      save({
        bookId: id,
        bookName: watchData.bookName,
        cover: watchData.bookCover,
        episode: currentChapter,
        totalEpisodes: chapters.length,
        videoTime: lastTimeRef.current.time,
        videoDuration: lastTimeRef.current.duration,
      });
    }, 5000);

    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
      // Save on unmount
      if (id && watchData && lastTimeRef.current.time > 0) {
        save({
          bookId: id,
          bookName: watchData.bookName,
          cover: watchData.bookCover,
          episode: currentChapter,
          totalEpisodes: chapters.length,
          videoTime: lastTimeRef.current.time,
          videoDuration: lastTimeRef.current.duration,
        });
      }
    };
  }, [id, watchData, currentChapter, chapters.length, save]);

  const handleTimeUpdate = useCallback((time: number, dur: number) => {
    lastTimeRef.current = { time, duration: dur };
  }, []);

  const handleChapterChange = (chapterIndex: number) => {
    setInitialTime(0);
    setCurrentChapter(chapterIndex);
  };

  const handlePrevious = () => {
    if (currentChapter > 1) {
      setInitialTime(0);
      setCurrentChapter(currentChapter - 1);
    }
  };

  const handleNext = () => {
    if (currentChapter < chapters.length) {
      setInitialTime(0);
      setCurrentChapter(currentChapter + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!watchData) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Drama not found</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 safe-area-top">
        <div className="flex items-center justify-between h-12 sm:h-14 px-3 sm:px-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-zinc-800 active:bg-zinc-700 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="font-semibold text-white line-clamp-1 flex-1 mx-3 text-sm">
            {watchData.bookName}
          </h1>
          <span className="text-xs text-zinc-500 whitespace-nowrap">
            EP {currentChapter}/{chapters.length}
          </span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="pt-12 sm:pt-14">
        <div className="lg:flex lg:h-[calc(100vh-56px)]">
          <div className="lg:flex-1 lg:min-w-0 lg:flex lg:items-center lg:justify-center lg:bg-black">
            <div className="w-full lg:h-full lg:flex lg:items-center lg:justify-center">
              <div className="w-full max-w-[500px] mx-auto lg:max-w-none lg:h-full">
                <VideoPlayer
                  src={watchData.videoUrl}
                  poster={watchData.bookCover}
                  autoPlay
                  hasNext={currentChapter < chapters.length}
                  hasPrevious={currentChapter > 1}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  episodeInfo={`EP ${currentChapter} / ${chapters.length}`}
                  initialTime={initialTime}
                  onTimeUpdate={handleTimeUpdate}
                />
              </div>
            </div>
          </div>

          <div className="lg:w-[360px] xl:w-[400px] lg:border-l lg:border-zinc-800 lg:overflow-y-auto lg:flex-shrink-0">
            <div className="p-3 sm:p-4 space-y-4 lg:space-y-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold mb-1 line-clamp-2">{watchData.bookName}</h2>
                <span className="text-xs sm:text-sm text-zinc-400">
                  Episode {currentChapter} of {chapters.length}
                </span>
                {watchData.introduction && (
                  <p className="text-xs sm:text-sm text-zinc-300 line-clamp-3 mt-2">
                    {watchData.introduction}
                  </p>
                )}
              </div>

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentChapter <= 1}
                  className="flex-1 py-2.5 sm:py-3 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 disabled:opacity-40 disabled:pointer-events-none rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-[0.97]"
                >
                  <ChevronLeft size={16} />
                  <span className="font-medium text-sm">Previous</span>
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentChapter >= chapters.length}
                  className="flex-1 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-40 disabled:pointer-events-none rounded-xl flex items-center justify-center gap-1.5 transition-colors text-white font-medium text-sm active:scale-[0.97]"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">All Episodes</h3>
                <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-6 xl:grid-cols-7 gap-1.5 sm:gap-2 max-h-52 sm:max-h-64 lg:max-h-none overflow-y-auto scrollbar-hide">
                  {chapters.map((chapter) => {
                    const episodeNum = chapter.chapterIndex + 1;
                    return (
                      <button
                        key={chapter.chapterId}
                        onClick={() => handleChapterChange(episodeNum)}
                        className={`aspect-square rounded-lg text-xs sm:text-sm font-medium transition-all active:scale-95 ${currentChapter === episodeNum
                          ? 'bg-red-500 text-white ring-2 ring-red-400/50'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 active:bg-zinc-600'
                          }`}
                      >
                        {episodeNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;
