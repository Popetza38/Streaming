import { useEffect, useRef, useState, useCallback } from 'react';

interface PhysicsElement {
    el: HTMLElement;
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    rotationV: number;
    originalStyles: {
        position: string;
        left: string;
        top: string;
        transform: string;
        zIndex: string;
        margin: string;
        transition: string;
    };
}

interface AntigravityProps {
    active: boolean;
    onDeactivate: () => void;
}

const GRAVITY = 0.6;
const BOUNCE = 0.45;
const FRICTION = 0.88;

export default function Antigravity({ active, onDeactivate }: AntigravityProps) {
    const elementsRef = useRef<PhysicsElement[]>([]);
    const rafRef = useRef<number | null>(null);
    const [launched, setLaunched] = useState(false);

    const getSelectableElements = (): HTMLElement[] => {
        const selectors = [
            'header',
            'main > *',
            'main > * > *',
            '.drama-card',
            '.carousel-scroll > *',
            'img',
            'h1', 'h2', 'h3',
            'button:not([data-antigravity-ignore])',
            '.section-divider',
        ];
        const seen = new Set<HTMLElement>();
        const results: HTMLElement[] = [];

        selectors.forEach(sel => {
            document.querySelectorAll<HTMLElement>(sel).forEach(el => {
                if (!seen.has(el) && el.offsetWidth > 0 && el.offsetHeight > 0) {
                    seen.add(el);
                    results.push(el);
                }
            });
        });

        return results.slice(0, 80); // cap for performance
    };

    const launch = useCallback(() => {
        if (launched) return;
        setLaunched(true);

        const elements = getSelectableElements();
        const physics: PhysicsElement[] = [];

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();

            const orig = {
                position: el.style.position,
                left: el.style.left,
                top: el.style.top,
                transform: el.style.transform,
                zIndex: el.style.zIndex,
                margin: el.style.margin,
                transition: el.style.transition,
            };

            el.style.transition = 'none';
            el.style.position = 'fixed';
            el.style.left = `${rect.left}px`;
            el.style.top = `${rect.top}px`;
            el.style.width = `${rect.width}px`;
            el.style.height = `${rect.height}px`;
            el.style.margin = '0';
            el.style.zIndex = '9999';

            physics.push({
                el,
                x: rect.left,
                y: rect.top,
                vx: (Math.random() - 0.5) * 6,
                vy: -(Math.random() * 8 + 4),
                rotation: 0,
                rotationV: (Math.random() - 0.5) * 4,
                originalStyles: orig,
            });
        });

        elementsRef.current = physics;
    }, [launched]);

    const restore = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        elementsRef.current.forEach(({ el, originalStyles: o }) => {
            el.style.position = o.position;
            el.style.left = o.left;
            el.style.top = o.top;
            el.style.transform = o.transform;
            el.style.zIndex = o.zIndex;
            el.style.margin = o.margin;
            el.style.width = '';
            el.style.height = '';
            el.style.transition = o.transition;
        });
        elementsRef.current = [];
        setLaunched(false);
    }, []);

    // Animate loop
    useEffect(() => {
        if (!launched) return;

        const floorY = window.innerHeight;
        const wallR = window.innerWidth;

        const tick = () => {
            elementsRef.current.forEach(item => {
                item.vy += GRAVITY;
                item.x += item.vx;
                item.y += item.vy;
                item.rotation += item.rotationV;

                const elW = item.el.offsetWidth;
                const elH = item.el.offsetHeight;

                // Floor
                if (item.y + elH >= floorY) {
                    item.y = floorY - elH;
                    item.vy *= -BOUNCE;
                    item.vx *= FRICTION;
                    item.rotationV *= FRICTION;
                    if (Math.abs(item.vy) < 1) item.vy = 0;
                }
                // Walls
                if (item.x <= 0) {
                    item.x = 0;
                    item.vx *= -BOUNCE;
                }
                if (item.x + elW >= wallR) {
                    item.x = wallR - elW;
                    item.vx *= -BOUNCE;
                }

                item.el.style.left = `${item.x}px`;
                item.el.style.top = `${item.y}px`;
                item.el.style.transform = `rotate(${item.rotation}deg)`;
            });

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [launched]);

    // Handle active toggle
    useEffect(() => {
        if (active && !launched) {
            launch();
        } else if (!active && launched) {
            restore();
        }
    }, [active, launched, launch, restore]);

    // Escape key or click to deactivate
    useEffect(() => {
        if (!active) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onDeactivate();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [active, onDeactivate]);

    if (!active) return null;

    return (
        <>
            {/* Overlay hint */}
            <div
                data-antigravity-ignore
                className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none"
                style={{ animation: 'fadeInDown 0.4s ease' }}
            >
                <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-2xl">
                    <span className="text-2xl">🚀</span>
                    <div>
                        <p className="text-white font-bold text-sm">Antigravity Mode!</p>
                        <p className="text-zinc-400 text-xs">Press <kbd className="bg-zinc-700 text-white px-1.5 py-0.5 rounded text-[10px] font-mono">ESC</kbd> to restore</p>
                    </div>
                </div>
            </div>

            {/* Star particles */}
            <div data-antigravity-ignore className="fixed inset-0 z-[99990] pointer-events-none overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-lg"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `starFloat ${2 + Math.random() * 4}s ease-in-out infinite alternate`,
                            animationDelay: `${Math.random() * 2}s`,
                            opacity: 0.6 + Math.random() * 0.4,
                        }}
                    >
                        {['⭐', '✨', '🌟', '💫', '🎬', '🎭', '🍿', '❤️'][Math.floor(Math.random() * 8)]}
                    </div>
                ))}
            </div>
        </>
    );
}
