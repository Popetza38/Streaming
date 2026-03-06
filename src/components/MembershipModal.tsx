import { X, Lock, Coins } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onPurchase: () => void;
    price?: number;
    userCoins?: number;
    loading?: boolean;
}

export default function MembershipModal({ isOpen, onClose, onPurchase, price = 10, userCoins = 0, loading = false }: Props) {
    if (!isOpen) return null;

    const canAfford = userCoins >= price;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-400 hover:bg-zinc-800 rounded-full transition-colors z-10">
                    <X size={20} />
                </button>

                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <Lock size={32} className="text-red-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">เข้าถึงฉบับเต็ม</h2>
                    <p className="text-zinc-400 text-sm mb-8">
                        รับชมตอนที่เหลือทั้งหมดของเรื่องนี้ได้ทันที เพียงใช้เหรียญเพื่อปลดล็อก
                    </p>

                    <div className="bg-zinc-950/50 rounded-2xl p-4 mb-8 border border-zinc-800/50">
                        <div className="flex items-center justify-between mb-3 text-sm">
                            <span className="text-zinc-500 font-medium">ราคาปลดล็อก:</span>
                            <div className="flex items-center gap-1.5 text-white font-bold">
                                <Coins size={16} className="text-yellow-500" />
                                <span>{price}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500 font-medium">เหรียญของคุณ:</span>
                            <div className="flex items-center gap-1.5 text-white font-bold">
                                <Coins size={16} className="text-yellow-500" />
                                <span>{userCoins}</span>
                            </div>
                        </div>
                    </div>

                    {canAfford ? (
                        <button
                            onClick={onPurchase}
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-red-600/20"
                        >
                            {loading ? 'กำลังปลดล็อก...' : `ปลดล็อกด้วย ${price} เหรียญ`}
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl text-yellow-500/80 text-xs font-medium">
                                เหรียญไม่พอ? กรุณาติดต่อแอดมินเพื่อเติมเหรียญ
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl transition-all"
                            >
                                ไว้ภายหลัง
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
