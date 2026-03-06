import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import type { NormalizedDrama } from '../utils/normalize';
import { usePlatform } from '../store/platform';

export interface CustomBanner {
    id: string;
    title: string;
    subtitle?: string;
    imageUrl: string;
    linkUrl?: string;
    order?: number;
}

interface HeroBannerProps {
    dramas?: NormalizedDrama[];
    banners?: CustomBanner[];
    interval?: number;
}

const HeroBanner = ({ dramas, banners, interval = 5000 }: HeroBannerProps) => {
    const [current, setCurrent] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval>>();
    const { platform } = usePlatform();

    const slideItems = (banners && banners.length > 0)
        ? banners.map(b => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle,
            image: b.imageUrl,
            link: b.linkUrl || '#',
            corner: null,
            tags: [],
            playCount: null
        }))
        : (dramas && dramas.length > 0)
            ? dramas.slice(0, 5).map(d => ({
                id: d.id,
                title: d.name,
                subtitle: d.summary,
                image: d.cover,
                link: `/watch/${d.id}?p=${platform}`,
                corner: d.corner,
                tags: d.tags,
                playCount: d.playCount
            }))
            : [];

    useEffect(() => {
        if (slideItems.length <= 1 || isHovered) return;
        timerRef.current = setInterval(() => {
            setCurrent(prev => (prev + 1) % slideItems.length);
        }, interval);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [slideItems.length, interval, isHovered]);

    if (slideItems.length === 0) return null;

    const goTo = (idx: number) => setCurrent(idx);
    const goPrev = () => setCurrent(prev => (prev - 1 + slideItems.length) % slideItems.length);
    const goNext = () => setCurrent(prev => (prev + 1) % slideItems.length);

    return (
        <div
            className="hero-banner"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Slides */}
            <div className="hero-slides">
                {slideItems.map((item, idx) => (
                    <div
                        key={item.id}
                        className={`hero-slide ${idx === current ? 'active' : ''}`}
                    >
                        <img src={item.image} alt={item.title} loading="lazy" />
                        <div className="hero-gradient" />
                        <div className="hero-content">
                            {item.corner && (
                                <span
                                    className="hero-badge"
                                    style={{ background: item.corner.color }}
                                >
                                    {item.corner.name}
                                </span>
                            )}
                            <h2 className="hero-title">{item.title}</h2>
                            <p className="hero-desc">{item.subtitle}</p>
                            <div className="hero-meta">
                                {item.tags?.slice(0, 3).map((tag, i) => {
                                    const label = typeof tag === 'string' ? tag : (tag as any)?.tag_name ?? '';
                                    return label ? <span key={`${label}-${i}`} className="hero-tag">{label}</span> : null;
                                })}
                                {item.playCount && (
                                    <span className="hero-plays">▶ {item.playCount}</span>
                                )}
                            </div>
                            {item.link !== '#' && (
                                <Link to={item.link} className="hero-play-btn inline-flex items-center">
                                    <Play size={18} className="mr-2" />
                                    <span>Watch Now</span>
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {slideItems.length > 1 && (
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
            {slideItems.length > 1 && (
                <div className="hero-dots">
                    {slideItems.map((_, idx) => (
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
