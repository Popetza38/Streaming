import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Shield,
    Coins,
    ChevronRight,
    LogOut,
    Settings,
    UserCircle,
    Key,
    Crown,
    Camera,
    Gift,
    Wallet,
    Activity,
    Menu,
    ArrowRight,
    LayoutDashboard,
    History as HistoryIcon,
    Heart,
    PlayCircle,
    CreditCard
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

    const isVip = profile?.tier === 'vip';

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
        { name: 'กิจกรรมล่าสุด', icon: HistoryIcon, tab: 'activity' as const, color: 'hover:text-purple-400' },
    ];

    const activityItems = [
        { icon: <Heart size={20} />, label: 'รายการที่บันทึกไว้', desc: 'ละครที่คุณบันทึกไว้', color: 'text-pink-400', bg: 'bg-pink-400/10', onClick: () => navigate('/mylist') },
        { icon: <PlayCircle size={20} />, label: 'ประวัติการรับชม', desc: 'รายการที่คุณดูล่าสุด', color: 'text-orange-400', bg: 'bg-orange-400/10', onClick: () => navigate('/history') },
        { icon: <HistoryIcon size={20} />, label: 'ประวัติการซื้อ', desc: 'ละครที่ปลดล็อกแล้ว', color: 'text-blue-400', bg: 'bg-blue-400/10', onClick: () => { } },
        { icon: <CreditCard size={20} />, label: 'ประวัติการเติมเงิน', desc: 'รายการธุรกรรมเงิน', color: 'text-emerald-400', bg: 'bg-emerald-400/10', onClick: () => { } },
    ];

    return (
        <div className="min-h-screen bg-[#020203] flex overflow-hidden pt-14 sm:pt-16 relative">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_-20%,#ef444415,transparent_50%),radial-gradient(circle_at_70%_120%,#eab30805,transparent_50%)] pointer-events-none" />

            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Responsive) */}
            <aside
                className={`fixed inset-y-0 left-0 z-[70] w-72 bg-zinc-950/50 backdrop-blur-2xl border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header - Mini Profile */}
                    <div className="p-8">
                        <div className="relative group cursor-pointer" onClick={() => setActiveTab('settings')}>
                            <div className={`relative w-24 h-24 mx-auto rounded-3xl overflow-hidden border-2 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 ${isVip ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : 'border-white/10'}`}>
                                {profile.avatar ? (
                                    <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white bg-gradient-to-br from-zinc-800 to-zinc-950">
                                        {profile.username?.charAt(0)}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera size={20} className="text-white" />
                                </div>
                            </div>
                            {isVip && (
                                <div className="absolute -top-3 -right-3 p-2 bg-gradient-to-tr from-yellow-600 to-yellow-400 rounded-xl shadow-xl border border-yellow-300/50 text-black rotate-12 group-hover:rotate-0 transition-transform">
                                    <Crown size={16} fill="black" />
                                </div>
                            )}
                        </div>
                        <div className="mt-6 text-center">
                            <h3 className="text-xl font-black text-white tracking-tight truncate px-2">{profile.username}</h3>
                            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                <div className={`w-1.5 h-1.5 rounded-full ${isVip ? 'bg-yellow-500 animate-pulse' : 'bg-zinc-500'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isVip ? 'text-yellow-500' : 'text-zinc-500'}`}>
                                    {isVip ? 'VIP Premium' : 'Free Member'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-2 mt-4">
                        {navigation.map((item) => (
                            <button
                                key={item.tab}
                                onClick={() => { setActiveTab(item.tab); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-sm font-black transition-all duration-300 group relative overflow-hidden ${activeTab === item.tab
                                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-xl shadow-red-600/20'
                                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon size={20} className={activeTab === item.tab ? 'text-white' : 'group-hover:scale-110 transition-transform duration-300'} />
                                <span className="tracking-tight">{item.name}</span>
                                {activeTab === item.tab && (
                                    <>
                                        <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                                    </>
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-6">
                        <button
                            onClick={async () => {
                                const result = await Swal.fire({
                                    title: 'ออกจากระบบ?',
                                    text: 'เราจะรอคุณกลับมานะครับ',
                                    icon: 'question',
                                    showCancelButton: true,
                                    confirmButtonColor: '#ef4444',
                                    cancelButtonColor: '#18181b',
                                    confirmButtonText: 'ออกจากระบบ',
                                    cancelButtonText: 'ยกเลิก',
                                    background: '#09090b',
                                    color: '#fff',
                                });
                                if (result.isConfirmed) await signOut();
                            }}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-zinc-900 shadow-lg border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-2xl transition-all duration-300 text-xs font-black uppercase tracking-widest"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-[calc(100vh-4rem)] relative overflow-y-auto w-full scroll-smooth">
                {/* Mobile Header */}
                <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-2xl border-b border-white/5 px-6 py-4 flex items-center justify-between lg:hidden">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white active:scale-95 transition-transform"
                    >
                        <Menu size={20} />
                    </button>
                    <span className="text-sm font-black text-white uppercase tracking-[0.2em]">Profile</span>
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 overflow-hidden">
                        <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                </header>

                {/* Hero / Banner Section */}
                <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-red-600/20 to-[#020203]" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <div className="absolute inset-0 flex items-end px-6 sm:px-12 pb-8 sm:pb-12">
                        <div className="max-w-5xl w-full mx-auto">
                            <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-[0.3em] mb-3">
                                <div className="w-8 h-[2px] bg-red-500" />
                                My Sanctuary
                            </div>
                            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-none mb-4">
                                Welcome back,<br />
                                <span className="bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                                    {profile.username}
                                </span>
                            </h1>
                            <div className="flex flex-wrap gap-3">
                                <div className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex items-center gap-2">
                                    <Coins size={14} className="text-yellow-500" />
                                    <span className="text-xs font-bold text-white">{profile.coins.toLocaleString()} Coins</span>
                                </div>
                                {isVip && (
                                    <div className="px-4 py-2 bg-yellow-500/10 backdrop-blur-xl border border-yellow-500/20 rounded-xl flex items-center gap-2">
                                        <Crown size={14} className="text-yellow-500" />
                                        <span className="text-xs font-bold text-yellow-500">Premium Member</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-12 max-w-5xl mx-auto space-y-12">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                            {/* Coins Card */}
                            <div className="md:col-span-2 bg-zinc-900/40 backdrop-blur-md border border-white/5 p-8 rounded-[3rem] relative overflow-hidden group hover:border-yellow-500/30 transition-colors duration-500">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[100px] rounded-full pointer-events-none" />
                                <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                                    <div className="flex items-center justify-between">
                                        <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/20">
                                            <Wallet size={28} className="text-black" />
                                        </div>
                                        <button
                                            onClick={() => navigate('/topup')}
                                            className="group/btn relative px-8 py-4 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2 overflow-hidden"
                                        >
                                            <span className="relative z-10">Add Coins</span>
                                            <ChevronRight size={14} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                        </button>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Total Balance</p>
                                        <h3 className="text-7xl font-black text-white tracking-tighter leading-none tabular-nums">
                                            {profile.coins.toLocaleString()}
                                            <span className="text-xl text-yellow-500 ml-4 font-black uppercase tracking-widest">C</span>
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            {/* Status Card */}
                            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-8 rounded-[3rem] group hover:border-red-500/30 transition-colors duration-500">
                                <div className="flex flex-col h-full justify-between gap-12">
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                        <Crown size={28} className={isVip ? 'text-yellow-500' : 'text-zinc-600'} />
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Membership Status</p>
                                        <h3 className={`text-3xl font-black mb-4 ${isVip ? 'text-white' : 'text-zinc-500'}`}>
                                            {isVip ? 'Premium VIP' : 'Free User'}
                                        </h3>
                                        {isVip ? (
                                            <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
                                                <p className="text-zinc-500 text-[10px] font-black uppercase mb-1">Expires on</p>
                                                <p className="text-yellow-500 font-bold">{new Date(profile.vipUntil || 0).toLocaleDateString('th-TH')}</p>
                                            </div>
                                        ) : (
                                            <button onClick={handleBuyVip} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-red-600/20 active:scale-95">Upgrade to VIP</button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Links Grid */}
                            <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                                {activityItems.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={item.onClick}
                                        className="group bg-zinc-950/50 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] hover:bg-white hover:text-black transition-all duration-500 overflow-hidden relative active:scale-95"
                                    >
                                        <div className={`p-4 ${item.bg} ${item.color} rounded-2xl w-fit mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                            {item.icon}
                                        </div>
                                        <p className="text-sm font-black group-hover:translate-x-1 transition-transform">{item.label}</p>
                                        <p className="text-[10px] text-zinc-600 font-bold group-hover:text-black/60">{item.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'rewards' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* Main Rewards Box */}
                            <div className="bg-zinc-900/20 backdrop-blur-xl border border-white/5 rounded-[3rem] p-12 md:p-20 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(239,68,68,0.08),transparent_50%)]" />
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center mb-10 mx-auto md:mx-0 shadow-2xl shadow-red-600/20 group-hover:rotate-12 transition-transform duration-500">
                                            <Gift size={40} className="text-white" />
                                        </div>
                                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-none">Daily<br />Rewards</h2>
                                        <p className="text-zinc-500 font-medium text-lg leading-relaxed max-w-sm mb-12">Log in daily to claim free coins. VIP members get 5x more rewards!</p>

                                        <div className="grid grid-cols-7 gap-2 mb-12 max-w-sm mx-auto md:mx-0">
                                            {[1, 2, 3, 4, 5, 6, 7].map(day => (
                                                <div key={day} className="flex flex-col gap-2 italic">
                                                    <div className={`aspect-square rounded-lg border flex items-center justify-center text-[10px] font-black ${day === 1 ? 'bg-red-500 border-red-500 text-white' : 'bg-white/5 border-white/10 text-zinc-700'}`}>
                                                        {day}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="w-full md:w-[400px] p-10 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-10">
                                        <div className="text-center">
                                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Today's Reward</p>
                                            <div className="flex items-center justify-center gap-4">
                                                <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/20">
                                                    <Coins size={36} className="text-yellow-500" />
                                                </div>
                                                <div className="text-6xl font-black text-white tabular-nums">+{isVip ? settings?.dailyRewardVip || 5 : settings?.dailyRewardFree || 1}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleClaimDaily}
                                            disabled={isClaiming}
                                            className="w-full py-6 bg-red-600 hover:bg-red-500 text-white font-black rounded-3xl transition-all duration-300 shadow-2xl shadow-red-600/30 active:scale-95 disabled:opacity-50 text-xl tracking-tighter flex items-center justify-center gap-3"
                                        >
                                            {isClaiming ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Claim Rewards'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Claim History List */}
                            <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] p-10">
                                <h3 className="text-xl font-black text-white tracking-tight mb-8">Claim History</h3>
                                <div className="space-y-4">
                                    {historyLoading ? (
                                        <div className="py-12 flex flex-col items-center gap-4">
                                            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-zinc-700 text-sm font-black uppercase tracking-widest">Loading History...</p>
                                        </div>
                                    ) : claimHistory.length > 0 ? (
                                        claimHistory.map((claim, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 hover:bg-white/[0.04] transition-all group">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center text-yellow-500 border border-white/5 group-hover:scale-105 transition-transform">
                                                        <Coins size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-black text-white">+{claim.amount} เหรียญ</div>
                                                        <div className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">{new Date(claim.claimedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-full uppercase tracking-widest">Successful</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-24 text-center">
                                            <div className="text-zinc-800 font-black text-5xl mb-4 italic tracking-tighter opacity-50">EMPTY HISTORY</div>
                                            <p className="text-zinc-600 font-medium">Start claiming today to build your streak!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[4rem] p-12 md:p-20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(16,185,129,0.05),transparent_50%)]" />

                                <div className="flex items-center gap-6 mb-16 relative">
                                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-3xl border border-emerald-500/20 flex items-center justify-center">
                                        <Settings size={32} />
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Configuration</p>
                                        <h3 className="text-4xl font-black text-white tracking-tight">Profile Settings</h3>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-12 relative">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-6">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                                Public Alias
                                            </label>
                                            <input
                                                type="text"
                                                value={form.username}
                                                onChange={e => setForm({ ...form, username: e.target.value })}
                                                className="w-full bg-zinc-950/50 border border-white/5 text-white rounded-[2rem] px-8 py-6 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-black text-lg outline-none shadow-2xl"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-6">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                                Avatar Source
                                            </label>
                                            <div className="relative group">
                                                <input
                                                    type="url"
                                                    value={form.avatar}
                                                    onChange={e => setForm({ ...form, avatar: e.target.value })}
                                                    className="w-full bg-zinc-950/50 border border-white/5 text-white rounded-[2rem] px-8 py-6 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-black text-lg outline-none pr-10 shadow-2xl"
                                                    placeholder="https://..."
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl overflow-hidden shadow-2xl group-hover:scale-110 transition-transform bg-zinc-900">
                                                    <img src={form.avatar} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full md:w-fit px-12 py-6 bg-white text-black font-black rounded-[2rem] hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50 text-xl tracking-tighter shadow-2xl"
                                    >
                                        {isSaving ? 'Synchronizing...' : 'Save Configuration'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="bg-zinc-900/40 border border-white/5 rounded-[4rem] p-12 md:p-20">
                                <div className="flex items-center gap-6 mb-16">
                                    <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-3xl border border-yellow-500/20 flex items-center justify-center">
                                        <Shield size={32} />
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Protection</p>
                                        <h3 className="text-4xl font-black text-white tracking-tight">Security Center</h3>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <button
                                        onClick={handleChangePassword}
                                        className="group flex items-center justify-between p-12 bg-zinc-950/30 hover:bg-white border border-white/5 rounded-[3rem] transition-all duration-500"
                                    >
                                        <div className="flex items-center gap-8">
                                            <div className="w-16 h-16 bg-zinc-900 rounded-[1.5rem] flex items-center justify-center border border-white/5 group-hover:bg-black group-hover:text-yellow-500 transition-all">
                                                <Key size={32} />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-2xl font-black text-white group-hover:text-black leading-none mb-2">Update Password</div>
                                                <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest group-hover:text-black/40">Secure your account</div>
                                            </div>
                                        </div>
                                        <ArrowRight size={24} className="text-zinc-800 group-hover:text-black group-hover:translate-x-2 transition-all" />
                                    </button>

                                    <button
                                        onClick={async () => signOut()}
                                        className="group flex items-center justify-between p-12 bg-red-500/5 hover:bg-red-500 border border-red-500/20 rounded-[3rem] transition-all duration-500"
                                    >
                                        <div className="flex items-center gap-8">
                                            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-[1.5rem] flex items-center justify-center group-hover:bg-white group-hover:text-red-500 transition-all">
                                                <LogOut size={32} />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-2xl font-black text-red-500 group-hover:text-white leading-none mb-2">Sign Out</div>
                                                <div className="text-[10px] text-red-500/40 font-bold uppercase tracking-widest group-hover:text-white/60">Terminate session</div>
                                            </div>
                                        </div>
                                        <ArrowRight size={24} className="text-red-500/30 group-hover:text-white group-hover:translate-x-2 transition-all" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="bg-zinc-900/40 border border-white/5 rounded-[4rem] p-12 md:p-16 min-h-[600px] relative">
                                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(168,85,247,0.05),transparent_50%)]" />

                                <div className="flex items-center justify-between mb-16 relative">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-purple-500/10 text-purple-500 rounded-3xl border border-purple-500/20 flex items-center justify-center">
                                            <Activity size={32} />
                                        </div>
                                        <div>
                                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Logs</p>
                                            <h3 className="text-4xl font-black text-white tracking-tight">Recent Activity</h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 relative">
                                    {activityItems.map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={item.onClick}
                                            className="group w-full flex items-center justify-between p-8 bg-zinc-950/30 hover:bg-white border border-white/5 rounded-[2.5rem] transition-all duration-500 active:scale-[0.99]"
                                        >
                                            <div className="flex items-center gap-8">
                                                <div className={`w-16 h-16 bg-zinc-900 ${item.color} rounded-2xl flex items-center justify-center border border-white/5 group-hover:bg-black transition-all`}>
                                                    {item.icon}
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-xl font-black text-white group-hover:text-black leading-none mb-2">{item.label}</div>
                                                    <div className="text-xs text-zinc-600 font-bold uppercase tracking-widest group-hover:text-black/40">{item.desc}</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={24} className="text-zinc-900 group-hover:text-black group-hover:translate-x-2 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="text-center pt-12 pb-12">
                        <div className="inline-flex items-center gap-3 px-8 py-4 bg-zinc-950/50 backdrop-blur-3xl border border-white/5 rounded-full overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <Shield size={12} className="text-zinc-700" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 select-none">
                                SECURE ID: {user.uid}
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
