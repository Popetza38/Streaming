import { ArrowLeft, Clock, Trash2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useWatchHistory } from '../store/watchHistory';

export default function History() {
    const navigate = useNavigate();
    const { history, clear, remove } = useWatchHistory();

    const getTimeAgo = (ts: number): string => {
        const diff = Date.now() - ts;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    return (
        <div className="min-h-screen bg-zinc-950 pb-20">
            <div className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors">
                        <ArrowLeft size={20} className="text-white" />
                    </button>
                    <h1 className="text-lg font-black text-white px-2">ประวัติการดู</h1>
                </div>
                {history.length > 0 && (
                    <button onClick={() => clear()} className="text-[10px] font-black uppercase text-zinc-500 hover:text-red-500 transition-colors">
                        Clear All
                    </button>
                )}
            </div>

            <div className="p-4">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
                            <Clock size={24} className="text-zinc-600" />
                        </div>
                        <p className="text-zinc-500 font-bold">ยังไม่มีประวัติการรับชม</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map((item) => (
                            <div key={item.bookId} className="flex gap-4 p-3 bg-zinc-900/50 border border-zinc-900 rounded-2xl group hover:border-zinc-800 transition-all">
                                <Link to={`/watch/${item.bookId}?p=${item.platform}&cw=${encodeURIComponent(item.cover || '')}`} className="block w-24 aspect-[3/4] rounded-xl overflow-hidden flex-shrink-0 bg-zinc-900 border border-zinc-800">
                                    <img src={item.cover} alt={item.bookName} className="w-full h-full object-cover" />
                                </Link>
                                <div className="flex-1 flex flex-col justify-between py-1 overflow-hidden">
                                    <div>
                                        <div className="flex items-start justify-between gap-2">
                                            <Link to={`/watch/${item.bookId}?p=${item.platform}&cw=${encodeURIComponent(item.cover || '')}`} className="text-sm font-bold text-white line-clamp-1 hover:text-red-500 transition-colors">
                                                {item.bookName}
                                            </Link>
                                            <button onClick={() => remove(item.bookId)} className="p-1 text-zinc-600 hover:text-red-500 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded-md font-bold uppercase tracking-widest border border-zinc-700">
                                                EP {item.episode}
                                            </span>
                                            <span className="text-[10px] text-zinc-500 font-medium">
                                                {getTimeAgo(item.timestamp)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-full">
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase">Progress</span>
                                            <span className="text-[10px] text-white font-black">{Math.round((item.videoTime / (item.videoDuration || 1)) * 100)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)]"
                                                style={{ width: `${(item.videoTime / (item.videoDuration || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
