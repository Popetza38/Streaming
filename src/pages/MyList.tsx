import { ArrowLeft, Play, Trash2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useWatchlist } from '../store/watchlist';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '@/lib/firebase';

export default function MyList() {
    const navigate = useNavigate();
    const { items, remove } = useWatchlist();
    const { user } = useAuth();

    const handleRemove = async (id: string) => {
        remove(id);
        if (user) {
            try {
                const token = await auth.currentUser?.getIdToken();
                await fetch('/api/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ action: 'remove_watchlist', dramaId: id })
                });
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 pb-20">
            <div className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 p-4 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors">
                    <ArrowLeft size={20} className="text-white" />
                </button>
                <h1 className="text-lg font-black text-white px-2">รายการของฉัน</h1>
            </div>

            <div className="p-4">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
                            <Play size={24} className="text-zinc-600" />
                        </div>
                        <p className="text-zinc-500 font-bold">ยังไม่มีรายการที่บันทึกไว้</p>
                        <button onClick={() => navigate('/')} className="mt-4 text-xs font-black uppercase text-red-500">ไปเลือกดูละคร</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {items.map((item) => (
                            <div key={item.id} className="relative group">
                                <Link to={`/watch/${item.id}?cw=${encodeURIComponent(item.image || '')}`} className="block aspect-[3/4] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-xl">
                                            <Play size={20} className="text-white ml-0.5" />
                                        </div>
                                    </div>
                                </Link>
                                <div className="mt-2 flex items-start justify-between gap-2">
                                    <h3 className="text-sm font-bold text-white line-clamp-1 flex-1">{item.title}</h3>
                                    <button
                                        onClick={(e) => { e.preventDefault(); handleRemove(item.id); }}
                                        className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
