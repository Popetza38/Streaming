import { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
}

export default function LazyImage({ src, alt, className = '' }: LazyImageProps) {
    const [loaded, setLoaded] = useState(false);
    const [inView, setInView] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = imgRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
            {/* Placeholder shimmer */}
            {!loaded && (
                <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
            )}
            {inView && (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    onLoad={() => setLoaded(true)}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'
                        }`}
                />
            )}
        </div>
    );
}
