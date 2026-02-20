'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Play, Clock, X } from 'lucide-react';
import { useWatchHistory } from '@/hooks/useWatchHistory';

export default function ContinueWatching() {
    const { history, removeFromHistory } = useWatchHistory();

    if (history.length === 0) return null;

    return (
        <section className="mb-10">
            <div className="flex items-center gap-3 mb-5">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-xl md:text-2xl font-bold text-white">ดูต่อ</h2>
                <span className="text-xs text-gray-500 bg-white/5 px-2.5 py-0.5 rounded-full">
                    {history.length}
                </span>
            </div>

            <div className="flex gap-3 md:gap-4 overflow-x-auto hide-scrollbar snap-x pb-4">
                {history.map((item) => (
                    <div key={item.dramaId} className="flex-shrink-0 w-56 md:w-64 snap-start group relative">
                        <Link href={`/watch/${item.dramaId}/${item.episode}`}>
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-dark-surface card-hover">
                                <Image
                                    src={item.cover}
                                    alt={item.dramaTitle}
                                    fill
                                    className="object-cover"
                                    sizes="256px"
                                />

                                {/* Dark overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                {/* Play button */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                        <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 progress-bar">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${item.progress}%` }}
                                    />
                                </div>

                                {/* Info */}
                                <div className="absolute bottom-2 left-3 right-3">
                                    <p className="text-white text-xs font-semibold line-clamp-1">{item.dramaTitle}</p>
                                    <p className="text-gray-400 text-[10px] mt-0.5">
                                        ตอนที่ {item.episode + 1} / {item.totalEpisodes}
                                    </p>
                                </div>
                            </div>
                        </Link>

                        {/* Remove button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeFromHistory(item.dramaId);
                            }}
                            className="absolute top-2 right-2 p-1 bg-black/60 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/80 z-10"
                            aria-label="ลบออก"
                        >
                            <X className="w-3.5 h-3.5 text-gray-300" />
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
