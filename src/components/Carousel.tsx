import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

const Carousel = ({ title, children, className = '' }: CarouselProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    const updateArrows = () => {
        const el = scrollRef.current;
        if (!el) return;
        setShowLeft(el.scrollLeft > 10);
        setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };

    const scroll = (dir: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const amount = el.clientWidth * 0.75;
        el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    };

    return (
        <div className={`carousel-wrap ${className}`}>
            {title && (
                <div className="carousel-header">
                    <h2 className="carousel-title">{title}</h2>
                </div>
            )}
            <div className="carousel-container">
                {/* Left Arrow */}
                {showLeft && (
                    <button className="carousel-arrow carousel-arrow-left" onClick={() => scroll('left')}>
                        <ChevronLeft size={20} />
                    </button>
                )}

                {/* Scroll Container */}
                <div
                    ref={scrollRef}
                    className="carousel-scroll"
                    onScroll={updateArrows}
                >
                    {children}
                </div>

                {/* Right Arrow */}
                {showRight && (
                    <button className="carousel-arrow carousel-arrow-right" onClick={() => scroll('right')}>
                        <ChevronRight size={20} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Carousel;
