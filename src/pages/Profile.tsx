import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Shield,
    Coins,
    ChevronRight,
    LogOut,
    Settings,
    CreditCard,
    History,
    Award,
    UserCircle,
    Key,
    Heart,
    PlayCircle,
    Crown,
    Camera,
    Gift,
    Wallet,
    Star,
    LayoutDashboard,
    Bell,
    Activity,
    ExternalLink,
    X,
    Menu,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

type ProfileTab = 'overview' | 'rewards' | 'settings' | 'security' | 'activity';

export default function Profile() {
    const { profile, user, settings, signOut, isLoading, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [claimHistory, setClaimHistory] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [form, setForm] = useState({
        username: profile?.username || '',
        avatar: profile?.avatar || ''
    });

    useEffect(() => {
        if (profile) {
            setForm({
                username: profile.username || '',
                avatar: profile.avatar || ''
            });
        }
    }, [profile]);

    useEffect(() => {
        if (activeTab === 'rewards') {
            fetchClaimHistory();
        }
    }, [activeTab]);

    const fetchClaimHistory = async () => {
        setHistoryLoading(true);
        try {
            const idToken = await user?.getIdToken();
            const res = await fetch('/api/user?type=claims', {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });
            if (res.ok) setClaimHistory(await res.json());
        } catch (e) {
            console.error('Failed to fetch claim history:', e);
        } finally {
            setHistoryLoading(false);
        }
    };

    const isVip = profile?.tier === 'vip' && (profile?.vipUntil || 0) > Date.now();

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const idToken = await user?.getIdToken();
            const res = await fetch('/api/auth', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify(form)
            });
            if (!res.ok) throw new Error('Failed to update profile');
            await refreshProfile();
            Swal.fire({
                icon: 'success',
                title: 'อัปเดตข้อมูลสำเร็จ',
                background: '#18181b',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'ผิดพลาด',
                text: error.message,
                background: '#18181b',
                color: '#fff'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleClaimDaily = async () => {
        setIsClaiming(true);
        try {
            const idToken = await user?.getIdToken();
            // Use GET with query param as a more robust fallback for Vercel body issues
            const res = await fetch('/api/user?action=daily_claim', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Claim failed');

            await refreshProfile();
            fetchClaimHistory();
            Swal.fire({
                icon: 'success',
                title: 'ยินดีด้วย!',
                text: `คุณได้รับ ${data.rewardCoins} เหรียญ`,
                background: '#18181b',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        } catch (error: any) {
            Swal.fire({
                icon: 'info',
                title: 'แจ้งเตือน',
                text: error.message,
                background: '#18181b',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsClaiming(false);
        }
    };

    const handleChangePassword = async () => {
        const { value: password } = await Swal.fire({
            title: 'เปลี่ยนรหัสผ่านใหม่',
            input: 'password',
            inputPlaceholder: 'ใส่รหัสผ่านใหม่',
            showCancelButton: true,
            confirmButtonText: 'เปลี่ยน',
            cancelButtonText: 'ยกเลิก',
            background: '#18181b',
            color: '#fff',
            confirmButtonColor: '#ef4444'
        });

        if (password) {
            try {
                const idToken = await user?.getIdToken();
                const res = await fetch('/api/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify({ action: 'change_password', password })
                });
                if (!res.ok) throw new Error('เปลี่ยนรหัสผ่านไม่สำเร็จ');
                Swal.fire({ title: 'สำเร็จ!', icon: 'success', background: '#18181b', color: '#fff' });
            } catch (error: any) {
                Swal.fire({ title: 'ผิดพลาด', text: error.message, icon: 'error', background: '#18181b', color: '#fff' });
            }
        }
    };

    const handleBuyVip = async () => {
        const vipPrice = settings?.vipPrice || 300;
        const vipDays = settings?.vipDurationDays || 30;

        let remainingDaysText = '';
        if (profile?.tier === 'vip' && profile?.vipUntil) {
            const now = Date.now();
            if (profile.vipUntil > now) {
                const remainingDays = Math.ceil((profile.vipUntil - now) / (1000 * 60 * 60 * 24));
                remainingDaysText = `<br/><br/><span style="color: #4ade80; font-size: 0.875rem;">ปัจจุบันคุณมีวันใช้งานเหลือ ${remainingDays} วัน</span><br/><span style="color: #a1a1aa; font-size: 0.875rem;">เมื่อสมัครจะทบเพิ่มอีก ${vipDays} วัน</span>`;
            }
        }

        Swal.fire({
            title: `สมัคร VIP ${vipDays} วัน`,
            html: `ใช้ ${vipPrice} เหรียญ เพื่อปลดล็อกละครทุกเรื่องเป็นเวลา ${vipDays} วัน${remainingDaysText}`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#eab308',
            cancelButtonColor: '#3f3f46',
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก',
            background: '#18181b',
            color: '#fff',
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading(),
            preConfirm: async () => {
                try {
                    const idToken = await user?.getIdToken();
                    const res = await fetch('/api/user', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${idToken}`
                        },
                        body: JSON.stringify({ action: 'buy_vip', planDurationDays: vipDays, price: vipPrice })
                    });
                    const data = await res.json();
                    if (!res.ok || !data.success) {
                        throw new Error(data.error || 'ยอดเหรียญสะสมไม่เพียงพอ');
                    }
                    return data;
                } catch (error: any) {
                    Swal.showValidationMessage(`ข้อผิดพลาด: ${error.message}`);
                }
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                await refreshProfile();
                Swal.fire({ title: 'สำเร็จ!', text: 'คุณได้รับสถานะ VIP แล้ว', icon: 'success', background: '#18181b', color: '#fff', confirmButtonColor: '#ef4444' });
            }
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user || !profile) {
        navigate('/login');
        return null;
    }

    const navigation = [
        { name: 'ภาพรวมบัญชี', icon: LayoutDashboard, tab: 'overview' as const, color: 'hover:text-blue-400' },
        { name: 'รางวัลรายวัน', icon: Gift, tab: 'rewards' as const, color: 'hover:text-red-400' },
        { name: 'แก้ไขโปรไฟล์', icon: UserCircle, tab: 'settings' as const, color: 'hover:text-emerald-400' },
        { name: 'ความปลอดภัย', icon: Key, tab: 'security' as const, color: 'hover:text-yellow-400' },
        { name: 'กิจกรรมล่าสุด', icon: History, tab: 'activity' as const, color: 'hover:text-purple-400' },
    ];

    const activityItems = [
        { icon: <Heart size={20} />, label: 'รายการที่บันทึกไว้', desc: 'ละครที่คุณบันทึกไว้', color: 'text-pink-400', bg: 'bg-pink-400/10', onClick: () => navigate('/mylist') },
        { icon: <PlayCircle size={20} />, label: 'ประวัติการรับชม', desc: 'รายการที่คุณดูล่าสุด', color: 'text-orange-400', bg: 'bg-orange-400/10', onClick: () => navigate('/history') },
        { icon: <History size={20} />, label: 'ประวัติการซื้อ', desc: 'ละครที่ปลดล็อกแล้ว', color: 'text-blue-400', bg: 'bg-blue-400/10', onClick: () => { } },
        { icon: <CreditCard size={20} />, label: 'ประวัติการเติมเงิน', desc: 'รายการธุรกรรมเงิน', color: 'text-emerald-400', bg: 'bg-emerald-400/10', onClick: () => { } },
    ];

    return (
        <div className="min-h-screen bg-[#09090b] flex overflow-hidden pt-14 sm:pt-16 relative">
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Responsive) */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-zinc-900 shadow-2xl border-r border-zinc-800 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header/User Profile */}
                    <div className="p-6 relative">
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white lg:hidden"
                        >
                            <X size={20} />
                        </button>
                        <div className="bg-zinc-950/50 rounded-3xl p-6 border border-zinc-800 relative group overflow-hidden mt-4 lg:mt-0">
                            {isVip && (
                                <div className="absolute top-0 right-0 p-2 text-yellow-500 animate-pulse">
                                    <Crown size={16} fill="currentColor" />
                                </div>
                            )}
                            <div className="flex flex-col items-center text-center">
                                <div className={`relative w-24 h-24 rounded-full border-4 mb-4 overflow-hidden ${isVip ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'border-zinc-800'}`}>
                                    {profile.avatar ? (
                                        <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl font-black text-zinc-700 bg-zinc-900">
                                            {profile.username?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-black text-white truncate w-full px-2">{profile.username}</h3>
                                <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
                                    {isVip ? (
                                        <>
                                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">VIP Premium</span>
                                        </>
                                    ) : (
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Free Member</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-1">
                        {navigation.map((item) => (
                            <button
                                key={item.tab}
                                onClick={() => { setActiveTab(item.tab); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold transition-all group ${activeTab === item.tab ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-zinc-500 hover:bg-zinc-800/50 ' + item.color}`}
                            >
                                <item.icon size={20} className={activeTab === item.tab ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
                                {item.name}
                                {activeTab === item.tab && <ChevronRight size={16} className="ml-auto" />}
                            </button>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-zinc-800/50">
                        <button
                            onClick={async () => {
                                const result = await Swal.fire({
                                    title: 'ยืนยันการออกจากระบบ',
                                    text: 'คุณต้องการออกจากระบบใช่หรือไม่?',
                                    icon: 'question',
                                    showCancelButton: true,
                                    confirmButtonColor: '#ef4444',
                                    cancelButtonColor: '#3f3f46',
                                    confirmButtonText: 'ออกจากระบบ',
                                    cancelButtonText: 'ยกเลิก',
                                    background: '#18181b',
                                    color: '#fff'
                                });
                                if (result.isConfirmed) await signOut();
                            }}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800/50 hover:bg-red-500 text-zinc-400 hover:text-white text-xs font-black rounded-xl transition-all border border-zinc-800"
                        >
                            <LogOut size={16} /> ออกจากระบบ
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-[calc(100vh-4rem)] relative overflow-y-auto w-full">
                {/* Mobile Header Toggle */}
                <header className="sticky top-0 z-30 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center lg:hidden">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white"
                    >
                        <Menu size={20} />
                    </button>
                    <span className="ml-4 text-sm font-black text-white uppercase tracking-widest">{activeTab}</span>
                </header>

                <div className="p-4 sm:p-8 lg:p-12 max-w-5xl mx-auto space-y-10 pb-20">
                    {activeTab === 'overview' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Account stats grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Wallet Card */}
                                <div className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-8 rounded-[2.5rem] relative overflow-hidden group">
                                    <div className="absolute -right-12 -bottom-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                        <Wallet size={200} className="text-yellow-500" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="p-4 bg-yellow-500/10 text-yellow-500 rounded-2xl border border-yellow-500/20">
                                                <Wallet size={28} />
                                            </div>
                                            <button
                                                onClick={() => navigate('/topup')}
                                                className="px-6 py-3 bg-yellow-500 text-black font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/20 active:scale-95"
                                            >
                                                เติมเหรียญ
                                            </button>
                                        </div>
                                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">ยอดเหรียญสะสม</p>
                                        <div className="flex items-baseline gap-3">
                                            <h3 className="text-6xl font-black text-white tabular-nums tracking-tighter">
                                                {profile.coins.toLocaleString()}
                                            </h3>
                                            <span className="text-yellow-500 font-bold uppercase tracking-widest text-sm">Coins</span>
                                        </div>
                                    </div>
                                </div>

                                {/* VIP Status Card */}
                                <div className={`bg-zinc-900 border p-8 rounded-[2.5rem] relative overflow-hidden group ${isVip ? 'border-yellow-500/30' : 'border-zinc-800'}`}>
                                    <div className="p-4 bg-white/5 text-yellow-500 rounded-2xl w-fit mb-8 border border-white/10 group-hover:scale-110 transition-transform">
                                        <Award size={28} />
                                    </div>
                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">สถานะสมาชิก</p>
                                    <h3 className={`text-3xl font-black mb-6 ${isVip ? 'text-yellow-400' : 'text-white'}`}>
                                        {isVip ? 'Active VIP' : 'Free User'}
                                    </h3>
                                    {isVip ? (
                                        <div className="text-zinc-500 text-sm font-bold flex flex-col gap-1">
                                            <span>หมดอายุวันที่:</span>
                                            <span className="text-white">{new Date(profile.vipUntil || 0).toLocaleDateString('th-TH')}</span>
                                        </div>
                                    ) : (
                                        <button onClick={handleBuyVip} className="w-full py-3.5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-colors shadow-lg">Become VIP</button>
                                    )}
                                </div>
                            </div>

                            {/* Activity Grid */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-4">
                                    <Activity size={24} className="text-red-500" /> เข้าถึงด่วน
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {activityItems.map((item, idx) => (
                                        <div
                                            key={idx}
                                            onClick={item.onClick}
                                            className="bg-zinc-950/50 border border-zinc-800/50 p-6 rounded-3xl hover:bg-zinc-800 transition-all text-left flex flex-col group cursor-pointer active:scale-95"
                                        >
                                            <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                                                {item.icon}
                                            </div>
                                            <span className="text-lg font-black text-white leading-tight mb-1">{item.label}</span>
                                            <span className="text-xs text-zinc-500 font-medium">{item.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'rewards' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 md:p-16 relative overflow-hidden group">
                                <div className="absolute -right-20 -top-20 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                                    <Gift size={400} className="text-red-500" />
                                </div>
                                <div className="relative z-10 max-w-2xl text-center md:text-left">
                                    <div className="p-5 bg-red-500/10 text-red-500 rounded-3xl w-fit mb-10 border border-red-500/20 mx-auto md:mx-0 shadow-lg">
                                        <Gift size={40} />
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6 leading-tight">เช็คอินรับเหรียญฟรี</h2>
                                    <p className="text-zinc-500 font-medium mb-12 leading-relaxed text-lg">สะสมเหรียญได้ง่ายๆ เพียงล็อกอินเข้าใช้งานทุกวัน สมาชิก VIP รับเหรียญเพิ่มเป็น 5 เท่า!</p>

                                    <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-black/40 rounded-[2.5rem] border border-zinc-800/50 shadow-2xl backdrop-blur-xl">
                                        <div className="flex items-center gap-5 w-full md:w-auto">
                                            <div className="p-5 bg-yellow-500/10 text-yellow-500 rounded-3xl">
                                                <Coins size={36} />
                                            </div>
                                            <div>
                                                <div className="text-4xl font-black text-white">+{isVip ? settings?.dailyRewardVip || 5 : settings?.dailyRewardFree || 1}</div>
                                                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Coins for today</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleClaimDaily}
                                            disabled={isClaiming}
                                            className="w-full md:flex-1 py-6 bg-red-600 hover:bg-red-700 text-white font-black rounded-3xl transition-all shadow-2xl shadow-red-600/30 active:scale-95 disabled:opacity-50 text-xl flex items-center justify-center gap-3"
                                        >
                                            {isClaiming ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'เช็คอินทันที'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Claim History List */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-4">
                                    <Calendar size={24} className="text-zinc-500" /> ประวัติการเช็คอินล่าสุด
                                </h3>
                                <div className="space-y-4">
                                    {historyLoading ? (
                                        <div className="py-10 text-center text-zinc-600 font-bold animate-pulse">กำลังโหลดข้อมูล...</div>
                                    ) : claimHistory.length > 0 ? (
                                        claimHistory.map((claim, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-5 bg-zinc-950/40 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all group">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center text-yellow-500 border border-zinc-800 group-hover:scale-110 transition-transform">
                                                        <Coins size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-black text-lg">+{claim.amount} เหรียญ</div>
                                                        <div className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">{new Date(claim.claimedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest">Successful</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center">
                                            <div className="text-zinc-700 font-black text-2xl mb-2 italic">ไม่มีประวัติการเช็คอิน</div>
                                            <p className="text-zinc-600 text-sm">เริ่มต้นรับเหรียญฟรีวันนี้ โดยการกดปุ่มเช็คอินด้านบน</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 md:p-16">
                                <div className="flex items-center gap-5 mb-12">
                                    <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
                                        <Settings size={28} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">ข้อมูลส่วนตัว</h3>
                                </div>
                                <form onSubmit={handleUpdateProfile} className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-3">
                                                <UserCircle size={14} className="text-red-500" /> ชื่อของคุณ
                                            </label>
                                            <input
                                                type="text"
                                                value={form.username}
                                                onChange={e => setForm({ ...form, username: e.target.value })}
                                                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-[1.5rem] px-8 py-5 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-black placeholder:text-zinc-900 outline-none shadow-inner"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-3">
                                                <Camera size={14} className="text-red-500" /> URL รูปโปรไฟล์
                                            </label>
                                            <div className="relative group">
                                                <input
                                                    type="url"
                                                    value={form.avatar}
                                                    onChange={e => setForm({ ...form, avatar: e.target.value })}
                                                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-[1.5rem] px-8 py-5 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-black placeholder:text-zinc-900 outline-none pr-20 shadow-inner"
                                                    placeholder="ใส่ลิงก์รูปภาพ..."
                                                />
                                                {form.avatar && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl overflow-hidden border-2 border-zinc-800 shadow-2xl group-hover:scale-110 transition-transform">
                                                        <img src={form.avatar} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full py-6 bg-white text-black font-black rounded-[1.5rem] hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50 text-xl shadow-2xl shadow-white/5"
                                    >
                                        {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 md:p-16">
                                <div className="flex items-center gap-5 mb-12">
                                    <div className="p-4 bg-yellow-500/10 text-yellow-500 rounded-2xl border border-yellow-500/20">
                                        <Shield size={28} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">ความปลอดภัยของบัญชี</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <button
                                        onClick={handleChangePassword}
                                        className="flex items-center justify-between p-10 bg-zinc-950/40 hover:bg-zinc-800 border-2 border-zinc-800/50 rounded-[2.5rem] transition-all group shadow-xl"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="p-5 bg-zinc-900 rounded-[1.5rem] group-hover:bg-yellow-500/10 group-hover:text-yellow-500 transition-all border border-zinc-800 shadow-lg">
                                                <Key size={32} />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-black text-white text-xl mb-1">เปลี่ยนรหัสผ่าน</div>
                                                <div className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Update your key</div>
                                            </div>
                                        </div>
                                        <ArrowRight size={24} className="text-zinc-800 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                    </button>

                                    <button
                                        onClick={async () => {
                                            const result = await Swal.fire({
                                                title: 'ยืนยันการออกจากระบบ',
                                                text: 'คุณต้องการออกจากระบบใช่หรือไม่?',
                                                icon: 'question',
                                                showCancelButton: true,
                                                confirmButtonColor: '#ef4444',
                                                cancelButtonColor: '#3f3f46',
                                                confirmButtonText: 'ออกจากระบบ',
                                                background: '#18181b',
                                                color: '#fff'
                                            });
                                            if (result.isConfirmed) await signOut();
                                        }}
                                        className="flex items-center justify-between p-10 bg-red-500/5 hover:bg-red-500/10 border-2 border-red-500/10 rounded-[2.5rem] transition-all group shadow-xl"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="p-5 bg-red-500/10 text-red-500 rounded-[1.5rem] shadow-lg">
                                                <LogOut size={32} />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-black text-red-500 text-xl mb-1">ออกจากระบบ</div>
                                                <div className="text-[10px] text-red-500/40 font-bold uppercase tracking-widest">End session</div>
                                            </div>
                                        </div>
                                        <ArrowRight size={24} className="text-red-500/30 group-hover:text-red-500 transition-all transform group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 md:p-16 relative min-h-[500px]">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-12">บันทึกกิจกรรมล่าสุด</h3>
                                <div className="grid grid-cols-1 gap-5">
                                    {activityItems.map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={item.onClick}
                                            className="w-full flex items-center justify-between p-8 bg-zinc-950/30 hover:bg-zinc-800 border border-zinc-800/50 rounded-[2rem] transition-all group shadow-lg"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`p-5 bg-zinc-900 ${item.color} rounded-[1.25rem] group-hover:scale-110 transition-transform shadow-inner border border-zinc-800`}>
                                                    {item.icon}
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-white font-black text-xl mb-1">{item.label}</div>
                                                    <div className="text-zinc-600 text-xs font-bold uppercase tracking-widest">{item.desc}</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={24} className="text-zinc-800 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="text-center pt-10">
                        <span className="inline-block px-6 py-3 bg-zinc-950 border border-zinc-800 text-zinc-700 text-[11px] font-black uppercase tracking-[0.4em] rounded-full select-none cursor-default shadow-inner">
                            User ID: {user.uid}
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
}
