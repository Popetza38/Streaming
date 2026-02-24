import { useState, useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';
import './VideoPlayer.css';

interface QualityLevel {
    index: number;
    height: number;
    width: number;
    bitrate: number;
    label: string;
}

interface VideoPlayerProps {
    src: string;
    poster?: string;
    autoPlay?: boolean;
    onEnded?: () => void;
    onNext?: () => void;
    onPrevious?: () => void;
    hasNext?: boolean;
    hasPrevious?: boolean;
    episodeInfo?: string;
    initialTime?: number;
    onTimeUpdate?: (currentTime: number, duration: number) => void;
    downloadUrl?: string;
    downloadFileName?: string;
}

const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const VideoPlayer = ({
    src,
    poster,
    autoPlay = true,
    onEnded,
    onNext,
    onPrevious,
    hasNext = false,
    hasPrevious = false,
    episodeInfo,
    initialTime = 0,
    onTimeUpdate: onTimeUpdateCb,
    downloadUrl,
    downloadFileName,
}: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const seekingRef = useRef(false);
    const wasFullscreenRef = useRef(false);

    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [transitioning, setTransitioning] = useState(false);
    const [tapAction, setTapAction] = useState<'play' | 'pause' | null>(null);
    const [seekIndicator, setSeekIndicator] = useState<{ dir: 'left' | 'right'; key: number } | null>(null);

    // Quality selector state
    const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
    const [currentQuality, setCurrentQuality] = useState(-1); // -1 = auto
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // ===== HLS Setup =====
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !src) return;

        setIsLoading(true);
        setTransitioning(true);

        const isHls = src.includes('.m3u8') || src.includes('m3u8');

        if (isHls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
            });
            hlsRef.current = hls;
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
                // Extract quality levels
                const levels: QualityLevel[] = data.levels.map((level: any, i: number) => ({
                    index: i,
                    height: level.height,
                    width: level.width,
                    bitrate: level.bitrate,
                    label: level.height ? `${level.height}p` : `${Math.round(level.bitrate / 1000)}k`,
                }));
                // Sort by height descending
                levels.sort((a, b) => b.height - a.height);
                setQualityLevels(levels);
                setCurrentQuality(-1); // auto

                if (initialTime > 0) video.currentTime = initialTime;
                if (autoPlay) video.play().catch(() => { });

                // Restore fullscreen if it was active before episode change
                if (wasFullscreenRef.current) {
                    const el = containerRef.current;
                    if (el && !document.fullscreenElement && !(document as any).webkitFullscreenElement) {
                        if (el.requestFullscreen) {
                            el.requestFullscreen().catch(() => setIsFullscreen(true));
                        } else if ((el as any).webkitRequestFullscreen) {
                            (el as any).webkitRequestFullscreen();
                        } else {
                            setIsFullscreen(true);
                        }
                    }
                }
            });
            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data.fatal) {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    }
                }
            });
        } else {
            video.src = src;
            setQualityLevels([]); // No quality switching for non-HLS
            video.addEventListener('loadedmetadata', () => {
                if (initialTime > 0) video.currentTime = initialTime;
            }, { once: true });
            if (autoPlay) video.play().catch(() => { });

            // Restore fullscreen for non-HLS too
            if (wasFullscreenRef.current) {
                const el = containerRef.current;
                if (el && !document.fullscreenElement && !(document as any).webkitFullscreenElement) {
                    if (el.requestFullscreen) {
                        el.requestFullscreen().catch(() => setIsFullscreen(true));
                    } else if ((el as any).webkitRequestFullscreen) {
                        (el as any).webkitRequestFullscreen();
                    } else {
                        setIsFullscreen(true);
                    }
                }
            }
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [src]);

    // ===== Video Events =====
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onPlay = () => setPlaying(true);
        const onPause = () => setPlaying(false);
        const onTimeUpdate = () => {
            if (!seekingRef.current) {
                setCurrentTime(video.currentTime);
                onTimeUpdateCb?.(video.currentTime, video.duration);
            }
        };
        const onDurationChange = () => setDuration(video.duration);
        const onProgress = () => {
            if (video.buffered.length > 0) {
                setBuffered(video.buffered.end(video.buffered.length - 1));
            }
        };
        const onWaiting = () => setIsLoading(true);
        const onCanPlay = () => { setIsLoading(false); setTransitioning(false); };
        const onPlaying = () => { setIsLoading(false); setTransitioning(false); };
        const onEnding = () => {
            setPlaying(false);
            if (hasNext) {
                // Save fullscreen state before changing episode
                wasFullscreenRef.current = !!(document.fullscreenElement || (document as any).webkitFullscreenElement) || isFullscreen;
                onNext?.();
            } else {
                onEnded?.();
            }
        };

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('durationchange', onDurationChange);
        video.addEventListener('progress', onProgress);
        video.addEventListener('waiting', onWaiting);
        video.addEventListener('canplay', onCanPlay);
        video.addEventListener('playing', onPlaying);
        video.addEventListener('ended', onEnding);

        return () => {
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('durationchange', onDurationChange);
            video.removeEventListener('progress', onProgress);
            video.removeEventListener('waiting', onWaiting);
            video.removeEventListener('canplay', onCanPlay);
            video.removeEventListener('playing', onPlaying);
            video.removeEventListener('ended', onEnding);
        };
    }, [hasNext, hasPrevious, isFullscreen, onEnded, onNext]);

    // ===== Auto-hide Controls =====
    const resetHideTimer = useCallback(() => {
        setShowControls(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        if (playing) {
            hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
        }
    }, [playing]);

    useEffect(() => {
        if (playing) {
            hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
        } else {
            setShowControls(true);
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        }
        return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
    }, [playing]);

    // ===== Keyboard Shortcuts =====
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

            const video = videoRef.current;
            if (!video) return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    playing ? video.pause() : video.play();
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    video.currentTime = Math.max(0, video.currentTime - 10);
                    setSeekIndicator({ dir: 'left', key: Date.now() });
                    resetHideTimer();
                    break;
                case 'arrowright':
                    e.preventDefault();
                    video.currentTime = Math.min(video.duration, video.currentTime + 10);
                    setSeekIndicator({ dir: 'right', key: Date.now() });
                    resetHideTimer();
                    break;
                case 'arrowup':
                    e.preventDefault();
                    video.volume = Math.min(1, video.volume + 0.1);
                    setVolume(video.volume);
                    setMuted(false);
                    video.muted = false;
                    resetHideTimer();
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    video.volume = Math.max(0, video.volume - 0.1);
                    setVolume(video.volume);
                    resetHideTimer();
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'n':
                    e.preventDefault();
                    if (hasNext) {
                        wasFullscreenRef.current = !!(document.fullscreenElement || (document as any).webkitFullscreenElement) || isFullscreen;
                        onNext?.();
                    }
                    break;
                case 'p':
                    e.preventDefault();
                    if (hasPrevious) {
                        wasFullscreenRef.current = !!(document.fullscreenElement || (document as any).webkitFullscreenElement) || isFullscreen;
                        onPrevious?.();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [playing, hasNext, hasPrevious, onNext, onPrevious, resetHideTimer]);

    // ===== Fullscreen =====
    const toggleFullscreen = useCallback(() => {
        const el = containerRef.current;
        const video = videoRef.current;
        if (!el) return;

        const fsEl = document.fullscreenElement || (document as any).webkitFullscreenElement;

        if (!fsEl) {
            if (el.requestFullscreen) {
                el.requestFullscreen().catch(() => {
                    setIsFullscreen(true);
                });
            } else if ((el as any).webkitRequestFullscreen) {
                (el as any).webkitRequestFullscreen();
            } else if (video && (video as any).webkitEnterFullscreen) {
                // iOS Safari fallback — native video fullscreen
                (video as any).webkitEnterFullscreen();
            } else {
                // CSS-based fullscreen fallback
                setIsFullscreen(true);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                (document as any).webkitExitFullscreen();
            }
        }
    }, []);

    useEffect(() => {
        const onFSChange = () => {
            setIsFullscreen(!!(document.fullscreenElement || (document as any).webkitFullscreenElement));
        };
        document.addEventListener('fullscreenchange', onFSChange);
        document.addEventListener('webkitfullscreenchange', onFSChange);
        return () => {
            document.removeEventListener('fullscreenchange', onFSChange);
            document.removeEventListener('webkitfullscreenchange', onFSChange);
        };
    }, []);

    // ===== Player Actions =====
    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play();
            setTapAction('play');
        } else {
            video.pause();
            setTapAction('pause');
        }
        resetHideTimer();
        setTimeout(() => setTapAction(null), 400);
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setMuted(video.muted);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;
        const val = parseFloat(e.target.value);
        video.volume = val;
        setVolume(val);
        if (val > 0 && video.muted) {
            video.muted = false;
            setMuted(false);
        }
    };

    // ===== Progress Bar Seeking =====
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const video = videoRef.current;
        const bar = e.currentTarget;
        if (!video || !bar) return;
        const rect = bar.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        video.currentTime = pct * video.duration;
        setCurrentTime(video.currentTime);
    };

    const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.buttons !== 1) return;
        seekingRef.current = true;
        const video = videoRef.current;
        const bar = e.currentTarget;
        if (!video || !bar) return;
        const rect = bar.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setCurrentTime(pct * video.duration);
        video.currentTime = pct * video.duration;
    };

    const handleProgressUp = () => {
        seekingRef.current = false;
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.vp-controls')) return;
        setShowQualityMenu(false);
        togglePlay();
    };

    // ===== Quality Switching =====
    const handleQualityChange = (levelIndex: number) => {
        const hls = hlsRef.current;
        if (!hls) return;
        hls.currentLevel = levelIndex; // -1 = auto
        setCurrentQuality(levelIndex);
        setShowQualityMenu(false);
    };

    const getCurrentQualityLabel = () => {
        if (currentQuality === -1) return 'Auto';
        const level = qualityLevels.find(l => l.index === currentQuality);
        return level ? level.label : 'Auto';
    };

    // ===== Download =====
    const handleDownload = async () => {
        if (!downloadUrl || isDownloading) return;
        setIsDownloading(true);
        try {
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = downloadFileName || 'video.mp4';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } finally {
            setTimeout(() => setIsDownloading(false), 2000);
        }
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const bufferProgress = duration > 0 ? (buffered / duration) * 100 : 0;

    // ===== SVG Icons =====
    const PlayIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
    );
    const PauseIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
    );
    const VolumeIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
    );
    const VolumeMuteIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
    );
    const FullscreenIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
    );
    const FullscreenExitIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" /></svg>
    );
    const SkipNextIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
    );
    const SkipPrevIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
    );
    const RewindIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /><text x="10" y="16" fontSize="7" fontWeight="bold" textAnchor="middle" fill="currentColor">10</text></svg>
    );
    const ForwardIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" /><text x="14" y="16" fontSize="7" fontWeight="bold" textAnchor="middle" fill="currentColor">10</text></svg>
    );
    const SettingsIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" /></svg>
    );
    const DownloadIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>
    );

    return (
        <div
            ref={containerRef}
            className={`vp-container ${isFullscreen ? 'fullscreen' : 'vp-responsive'}`}
            onMouseMove={resetHideTimer}
            onTouchStart={resetHideTimer}
        >
            <video
                ref={videoRef}
                poster={poster}
                playsInline
                // @ts-ignore — webkit prefix for older iOS
                webkit-playsinline=""
                preload="auto"
            />

            {/* Loading Spinner */}
            {isLoading && playing && (
                <div className="vp-loading">
                    <div className="vp-spinner" />
                </div>
            )}

            {/* Tap Action Indicator */}
            {tapAction && (
                <div className="vp-tap-indicator">
                    <div className="vp-tap-icon">
                        {tapAction === 'play' ? <PlayIcon /> : <PauseIcon />}
                    </div>
                </div>
            )}

            {/* Seek Indicator */}
            {seekIndicator && (
                <div key={seekIndicator.key} className={`vp-seek-indicator ${seekIndicator.dir}`}>
                    <div className="vp-seek-indicator-inner">
                        {seekIndicator.dir === 'left' ? <RewindIcon /> : <ForwardIcon />}
                        <span>10s</span>
                    </div>
                </div>
            )}

            {/* Controls Overlay */}
            <div
                className={`vp-overlay ${!showControls && playing ? 'hidden' : ''}`}
                onClick={handleOverlayClick}
            >
                <div className="vp-gradient-top" />
                <div className="vp-gradient-bottom" />

                {/* Center Play Button (when paused) */}
                {!playing && !transitioning && (
                    <div className="vp-center-play" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                        <PlayIcon />
                    </div>
                )}

                {/* Bottom Controls */}
                <div className="vp-controls" onClick={(e) => e.stopPropagation()}>
                    {/* Progress Bar */}
                    <div
                        className="vp-progress-wrap"
                        onClick={handleProgressClick}
                        onMouseDown={handleProgressDrag}
                        onMouseMove={handleProgressDrag}
                        onMouseUp={handleProgressUp}
                        onMouseLeave={handleProgressUp}
                    >
                        <div className="vp-progress-track">
                            <div className="vp-progress-buffered" style={{ width: `${bufferProgress}%` }} />
                            <div className="vp-progress-played" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="vp-progress-thumb" style={{ left: `${progress}%` }} />
                    </div>

                    {/* Buttons Row */}
                    <div className="vp-buttons">
                        {/* Play/Pause */}
                        <button className="vp-btn" onClick={togglePlay} title={playing ? 'Pause (Space)' : 'Play (Space)'}>
                            {playing ? <PauseIcon /> : <PlayIcon />}
                        </button>

                        {/* Previous */}
                        {hasPrevious && (
                            <button className="vp-btn" onClick={() => { wasFullscreenRef.current = !!(document.fullscreenElement || (document as any).webkitFullscreenElement) || isFullscreen; onPrevious?.(); }} title="Previous (P)">
                                <SkipPrevIcon />
                            </button>
                        )}

                        {/* Next */}
                        {hasNext && (
                            <button className="vp-btn" onClick={() => { wasFullscreenRef.current = !!(document.fullscreenElement || (document as any).webkitFullscreenElement) || isFullscreen; onNext?.(); }} title="Next (N)">
                                <SkipNextIcon />
                            </button>
                        )}

                        {/* Volume */}
                        <div className="vp-volume-wrap">
                            <button className="vp-btn" onClick={toggleMute} title="Mute (M)">
                                {muted || volume === 0 ? <VolumeMuteIcon /> : <VolumeIcon />}
                            </button>
                            <div className="vp-volume-slider">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={muted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                />
                            </div>
                        </div>

                        {/* Time */}
                        <span className="vp-time">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>

                        <div className="vp-spacer" />

                        {/* Episode Info */}
                        {episodeInfo && <span className="vp-episode-badge">{episodeInfo}</span>}

                        {/* Quality Selector */}
                        {qualityLevels.length > 1 && (
                            <div className="vp-quality-wrap">
                                <button
                                    className="vp-btn vp-quality-btn"
                                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                                    title="Quality"
                                >
                                    <SettingsIcon />
                                    <span className="vp-quality-label">{getCurrentQualityLabel()}</span>
                                </button>
                                {showQualityMenu && (
                                    <div className="vp-quality-menu">
                                        <button
                                            className={`vp-quality-item ${currentQuality === -1 ? 'active' : ''}`}
                                            onClick={() => handleQualityChange(-1)}
                                        >
                                            <span>Auto</span>
                                            {currentQuality === -1 && <span className="vp-quality-check">✓</span>}
                                        </button>
                                        {qualityLevels.map((level) => (
                                            <button
                                                key={level.index}
                                                className={`vp-quality-item ${currentQuality === level.index ? 'active' : ''}`}
                                                onClick={() => handleQualityChange(level.index)}
                                            >
                                                <span>{level.label}</span>
                                                {level.height >= 720 && <span className="vp-hd-badge">HD</span>}
                                                {currentQuality === level.index && <span className="vp-quality-check">✓</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Download */}
                        {downloadUrl && (
                            <button
                                className={`vp-btn ${isDownloading ? 'vp-btn-downloading' : ''}`}
                                onClick={handleDownload}
                                title="Download"
                                disabled={isDownloading}
                            >
                                <DownloadIcon />
                            </button>
                        )}

                        {/* Fullscreen */}
                        <button className="vp-btn" onClick={toggleFullscreen} title="Fullscreen (F)">
                            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Smooth Transition Overlay */}
            {transitioning && (
                <div className="vp-transition-overlay">
                    <div className="vp-spinner" />
                    <p className="vp-transition-text">กำลังโหลดตอนถัดไป...</p>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
