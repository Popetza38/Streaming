import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

interface Drama {
    bookId: string;
    bookName: string;
    introduction: string;
    cover: string;
    playCount: string;
    tags: string[];
    corner?: { name: string; color: string };
}

interface HeroBannerProps {
    dramas: Drama[];
    interval?: number;
}

const HeroBanner = ({ dramas, interval = 5000 }: HeroBannerProps) => {
    const [current, setCurrent] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval>>();
    const items = dramas.slice(0, 5);

    useEffect(() => {
        if (items.length <= 1 || isHovered) return;
        timerRef.current = setInterval(() => {
            setCurrent(prev => (prev + 1) % items.length);
        }, interval);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [items.length, interval, isHovered]);

    if (items.length === 0) return null;

    const goTo = (idx: number) => setCurrent(idx);
    const goPrev = () => setCurrent(prev => (prev - 1 + items.length) % items.length);
    const goNext = () => setCurrent(prev => (prev + 1) % items.length);

    return (
        <div
            className="hero-banner"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Slides */}
            <div className="hero-slides">
                {items.map((drama, idx) => (
                    <div
                        key={drama.bookId}
                        className={`hero-slide ${idx === current ? 'active' : ''}`}
                    >
                        <img src={drama.cover} alt={drama.bookName} />
                        <div className="hero-gradient" />
                        <div className="hero-content">
                            {drama.corner && (
                                <span
                                    className="hero-badge"
                                    style={{ background: drama.corner.color }}
                                >
                                    {drama.corner.name}
                                </span>
                            )}
                            <h2 className="hero-title">{drama.bookName.trim()}</h2>
                            <p className="hero-desc">{drama.introduction}</p>
                            <div className="hero-meta">
                                {drama.tags?.slice(0, 3).map(tag => (
                                    <span key={tag} className="hero-tag">{tag}</span>
                                ))}
                                <span className="hero-plays">▶ {drama.playCount}</span>
                            </div>
                            <Link to={`/watch/${drama.bookId}`} className="hero-play-btn">
                                <Play size={18} />
                                <span>Watch Now</span>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {items.length > 1 && (
                <>
                    <button className="hero-arrow hero-arrow-left" onClick={goPrev}>
                        <ChevronLeft size={22} />
                    </button>
                    <button className="hero-arrow hero-arrow-right" onClick={goNext}>
                        <ChevronRight size={22} />
                    </button>
                </>
            )}

            {/* Dots */}
            {items.length > 1 && (
                <div className="hero-dots">
                    {items.map((_, idx) => (
                        <button
                            key={idx}
                            className={`hero-dot ${idx === current ? 'active' : ''}`}
                            onClick={() => goTo(idx)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HeroBanner;
