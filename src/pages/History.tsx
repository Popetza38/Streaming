import { Link } from 'react-router-dom';
import { Clock, Play, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useHistory } from '../store/history';

const History = () => {
    const { items, remove, clear } = useHistory();
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div className="space-y-6 pt-2 max-w-4xl mx-auto pb-20">
            {/* Title */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#e50914]/15 rounded-xl flex items-center justify-center">
                        <Clock size={22} className="text-[#e50914]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Watch History</h1>
                        <p className="text-xs text-zinc-500">{items.length} items</p>
                    </div>
                </div>
                {items.length > 0 && (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="text-sm text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                    >
                        <Trash2 size={14} />
                        Clear all
                    </button>
                )}
            </div>

            {/* History List */}
            {items.length === 0 ? (
                <div className="text-center py-20 animate-fade-in">
                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <Clock size={32} className="text-zinc-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-300 mb-1">No watch history</h3>
                    <p className="text-zinc-600 text-sm">Dramas you watch will appear here</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            className="card p-3 sm:p-4 hover:border-white/10 group animate-fade-in"
                            style={{ animationDelay: `${index * 0.03}s` }}
                        >
                            <div className="flex gap-4 items-center">
                                {/* Poster */}
                                <Link
                                    to={`/watch/${item.id}`}
                                    state={{ name: item.name, cover: item.cover, episodes: item.episodes }}
                                    className="w-14 h-20 sm:w-16 sm:h-22 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 relative"
                                >
                                    <img
                                        src={item.cover}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Play size={20} className="text-white fill-white" />
                                    </div>
                                </Link>

                                {/* Info */}
                                <Link
                                    to={`/watch/${item.id}`}
                                    state={{ name: item.name, cover: item.cover, episodes: item.episodes }}
                                    className="flex-1 min-w-0"
                                >
                                    <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-2 group-hover:text-[#e50914] transition-colors">
                                        {item.name}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                                        <span className="bg-[#e50914]/20 text-[#e50914] px-2 py-0.5 rounded-full font-semibold">
                                            EP {item.lastEpisode}
                                        </span>
                                        <span>{item.episodes} episodes</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.source === 'dramabox'
                                                ? 'bg-purple-500/20 text-purple-400'
                                                : 'bg-amber-500/20 text-amber-400'
                                            }`}>
                                            {item.source === 'dramabox' ? 'DB' : 'SM'}
                                        </span>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#e50914] rounded-full transition-all"
                                            style={{ width: `${Math.min((item.lastEpisode / item.episodes) * 100, 100)}%` }}
                                        />
                                    </div>
                                </Link>

                                {/* Remove button */}
                                <button
                                    onClick={() => remove(item.id)}
                                    className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all flex-shrink-0"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Clear Confirmation */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
                        <div className="w-16 h-16 bg-red-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={28} className="text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Clear Watch History?</h3>
                        <p className="text-zinc-400 text-sm mb-6">This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 bg-white/5 border border-white/10 text-white py-3 rounded-xl font-medium hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { clear(); setShowConfirm(false); }}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition-all"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;
