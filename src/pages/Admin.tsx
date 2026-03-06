import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    CheckCircle2,
    Plus,
    Edit,
    DollarSign,
    Image as ImageIcon,
    FileText,
    Settings,
    ShieldAlert,
    Film,
    Database,
    Users,
    LayoutDashboard,
    RefreshCw,
    ShieldCheck,
    X,
    Menu,
    PlusCircle,
    ChevronRight,
    Trash2,
    ExternalLink,
    Bell,
    Coins,
    PieChart,
    Search,
    UserCog,
    XCircle,
    Activity,
    AlertTriangle,
    Globe,
    CreditCard
} from 'lucide-react';
import Swal from 'sweetalert2';
import { auth } from '@/lib/firebase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

export default function Admin() {
    const { profile, isLoading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'purchases' | 'content' | 'settings' | 'security' | 'financials' | 'carousel' | 'logs'>('overview');
    const [usersList, setUsersList] = useState<any[]>([]);
    const [purchasesList, setPurchasesList] = useState<any[]>([]);
    const [dramasList, setDramasList] = useState<any[]>([]);
    const [blacklist, setBlacklist] = useState<any[]>([]);
    const [paymentsList, setPaymentsList] = useState<any[]>([]);
    const [carouselList, setCarouselList] = useState<any[]>([]);
    const [logsList, setLogsList] = useState<any[]>([]);
    const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false);
    const [editingCarousel, setEditingCarousel] = useState<any>(null);
    const [carouselFormData, setCarouselFormData] = useState({
        title: '', subtitle: '', imageUrl: '', linkUrl: '', order: 0
    });
    const [systemSettings, setSystemSettings] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [dataLoading, setDataLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (!isLoading && profile?.role !== 'admin') {
            navigate('/');
        }
    }, [profile, isLoading, navigate]);

    const getAuthHeaders = async () => {
        const token = await auth.currentUser?.getIdToken();
        return { Authorization: `Bearer ${token}` };
    };

    const fetchStats = async () => {
        setDataLoading(true);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/admin?type=stats', { headers });
            if (res.ok) setStats(await res.json());
        } catch (e) {
            console.error(e);
        }
        setDataLoading(false);
    };

    const fetchUsers = async () => {
        setDataLoading(true);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/admin?type=users', { headers });
            if (res.ok) setUsersList(await res.json());
        } catch (e) {
            console.error(e);
        }
        setDataLoading(false);
    };

    const fetchPurchases = async () => {
        setDataLoading(true);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/admin?type=purchases', { headers });
            if (res.ok) setPurchasesList(await res.json());
        } catch (e) {
            console.error(e);
        }
        setDataLoading(false);
    };

    const fetchDramas = async () => {
        setDataLoading(true);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/admin?type=dramas', { headers });
            if (res.ok) setDramasList(await res.json());
        } catch (e) {
            console.error(e);
        }
        setDataLoading(false);
    };

    const fetchBlacklist = async () => {
        setDataLoading(true);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/admin?type=blacklist', { headers });
            if (res.ok) setBlacklist(await res.json());
        } catch (e) {
            console.error(e);
        }
        setDataLoading(false);
    };

    const fetchSystemSettings = async () => {
        setDataLoading(true);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/admin?type=settings', { headers });
            if (res.ok) setSystemSettings(await res.json());
        } catch (e) {
            console.error(e);
        }
        setDataLoading(false);
    };

    const fetchPayments = async () => {
        setDataLoading(true);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/payments', { headers });
            if (res.ok) setPaymentsList(await res.json());
        } catch (e) {
            console.error(e);
        }
        setDataLoading(false);
    };

    const fetchCarousel = async () => {
        setDataLoading(true);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/admin?type=carousel', { headers });
            if (res.ok) setCarouselList(await res.json());
        } catch (e) {
            console.error(e);
        }
        setDataLoading(false);
    };

    const fetchLogs = async () => {
        setDataLoading(true);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/admin?type=logs', { headers });
            if (res.ok) setLogsList(await res.json());
        } catch (e) {
            console.error(e);
        }
        setDataLoading(false);
    };

    useEffect(() => {
        if (profile?.role === 'admin') {
            if (activeTab === 'overview') fetchStats();
            if (activeTab === 'users') fetchUsers();
            if (activeTab === 'purchases') fetchPurchases();
            if (activeTab === 'content') fetchDramas();
            if (activeTab === 'security') fetchBlacklist();
            if (activeTab === 'settings') fetchSystemSettings();
            if (activeTab === 'financials') fetchPayments();
            if (activeTab === 'carousel') fetchCarousel();
            if (activeTab === 'logs') fetchLogs();
        }
    }, [profile, activeTab]);

    const handleSetRole = async (userId: string, currentRole: string) => {
        const { value: role } = await Swal.fire({
            title: 'เลือกสิทธิ์การใช้งาน',
            input: 'select',
            inputOptions: {
                'user': 'User (ผู้ใช้งานทั่วไป)',
                'moderator': 'Moderator (ผู้ช่วยดูแล)',
                'admin': 'Admin (ผู้ดูแลระบบ)'
            },
            inputValue: currentRole,
            showCancelButton: true,
            confirmButtonText: 'บันทึก',
            cancelButtonText: 'ยกเลิก',
            background: '#18181b',
            color: '#fff',
            confirmButtonColor: '#ef4444',
        });

        if (role) {
            try {
                const headers = await getAuthHeaders();
                const res = await fetch('/api/admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...headers },
                    body: JSON.stringify({ action: 'set_role', userId, role })
                });
                if (!res.ok) throw new Error('ไม่สามารถเปลี่ยนสิทธิ์ได้');
                fetchUsers();
                Swal.fire({ title: 'สำเร็จ!', text: 'เปลี่ยนสิทธิ์เรียบร้อยแล้ว', icon: 'success', background: '#18181b', color: '#fff' });
            } catch (error: any) {
                Swal.fire({ title: 'ข้อผิดพลาด', text: error.message, icon: 'error', background: '#18181b', color: '#fff' });
            }
        }
    };

    const handleSetTier = async (userId: string, currentTier: string) => {
        const { value: tier } = await Swal.fire({
            title: 'เลือกระดับสมาชิก',
            input: 'select',
            inputOptions: {
                'free': 'Free (ทั่วไป)',
                'premium': 'Premium (พรีเมียม)',
                'vip': 'VIP (สูงสุด)'
            },
            inputValue: currentTier || 'free',
            showCancelButton: true,
            confirmButtonText: 'บันทึก',
            cancelButtonText: 'ยกเลิก',
            background: '#18181b',
            color: '#fff',
            confirmButtonColor: '#8b5cf6',
        });

        if (tier) {
            try {
                const headers = await getAuthHeaders();
                const res = await fetch('/api/admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...headers },
                    body: JSON.stringify({ action: 'set_tier', userId, tier })
                });
                if (!res.ok) throw new Error('ไม่สามารถเปลี่ยนระดับสมาชิกได้');
                fetchUsers();
                Swal.fire({ title: 'สำเร็จ!', text: 'เปลี่ยนระดับสมาชิกเรียบร้อยแล้ว', icon: 'success', background: '#18181b', color: '#fff' });
            } catch (error: any) {
                Swal.fire({ title: 'ข้อผิดพลาด', text: error.message, icon: 'error', background: '#18181b', color: '#fff' });
            }
        }
    };

    const handleDeleteUser = async (userId: string, email: string) => {
        const result = await Swal.fire({
            title: 'ลบผู้ใช้งาน?',
            text: `คุณต้องการลบผู้ใช้ ${email} ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3f3f46',
            confirmButtonText: 'ใช่, ลบทันที',
            cancelButtonText: 'ยกเลิก',
            background: '#18181b',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                const headers = await getAuthHeaders();
                const res = await fetch('/api/admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...headers },
                    body: JSON.stringify({ action: 'delete_user', userId })
                });
                if (!res.ok) throw new Error('ไม่สามารถลบผู้ใช้ได้');
                fetchUsers();
                Swal.fire({ title: 'ลบเรียบร้อย!', icon: 'success', background: '#18181b', color: '#fff' });
            } catch (error: any) {
                Swal.fire({ title: 'ข้อผิดพลาด', text: error.message, icon: 'error', background: '#18181b', color: '#fff' });
            }
        }
    };

    const handleUpdateCoins = async (userId: string, currentCoins: number) => {
        const { value: coins } = await Swal.fire({
            title: 'แก้ไขจำนวนเหรียญ',
            input: 'number',
            inputLabel: 'จำนวนเหรียญใหม่',
            inputValue: currentCoins,
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3f3f46',
            confirmButtonText: 'บันทึก',
            cancelButtonText: 'ยกเลิก',
            background: '#18181b',
            color: '#fff',
            inputValidator: (value) => {
                if (!value) return 'กรุณาใส่จำนวนเหรียญ';
                return null;
            }
        });

        if (coins !== undefined) {
            try {
                const headers = await getAuthHeaders();
                const res = await fetch('/api/admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...headers },
                    body: JSON.stringify({ action: 'update_coins', userId, coins })
                });
                if (!res.ok) throw new Error('ไม่สามารถอัปเดตเหรียญได้');
                fetchUsers();
                Swal.fire({ title: 'สำเร็จ!', text: 'อัปเดตจำนวนเหรียญเรียบร้อยแล้ว', icon: 'success', background: '#18181b', color: '#fff' });
            } catch (error: any) {
                Swal.fire({ title: 'ข้อผิดพลาด', text: error.message, icon: 'error', background: '#18181b', color: '#fff' });
            }
        }
    };

    const handleUpdateSettings = async (newData: any) => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...headers },
                body: JSON.stringify({ action: 'update_settings', settings: newData })
            });
            if (!res.ok) throw new Error('ไม่สามารถอัปเดตการตั้งค่าได้');
            fetchSystemSettings();
            Swal.fire({ title: 'สำเร็จ!', text: 'อัปเดตการตั้งค่าเรียบร้อยแล้ว', icon: 'success', background: '#18181b', color: '#fff' });
        } catch (error: any) {
            Swal.fire({ title: 'ข้อผิดพลาด', text: error.message, icon: 'error', background: '#18181b', color: '#fff' });
        }
    };

    const handleUpsertDrama = async (dramaId: string, dramaData: any) => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...headers },
                body: JSON.stringify({ action: 'upsert_drama', dramaId, dramaData })
            });
            if (!res.ok) throw new Error('ไม่สามารถบันทึกข้อมูลละครได้');
            fetchDramas();
            Swal.fire({ title: 'สำเร็จ!', text: 'บันทึกข้อมูลละครเรียบร้อยแล้ว', icon: 'success', background: '#18181b', color: '#fff' });
        } catch (error: any) {
            Swal.fire({ title: 'ข้อผิดพลาด', text: error.message, icon: 'error', background: '#18181b', color: '#fff' });
        }
    };

    const handleDeleteDrama = async (dramaId: string) => {
        const result = await Swal.fire({
            title: 'ลบละคร?',
            text: 'คุณต้องการลบละครเรื่องนี้ใช่หรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'ลบทันที',
            background: '#18181b',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                const headers = await getAuthHeaders();
                const res = await fetch('/api/admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...headers },
                    body: JSON.stringify({ action: 'delete_drama', dramaId })
                });
                if (!res.ok) throw new Error('ไม่สามารถลบละครได้');
                fetchDramas();
                Swal.fire({ title: 'ลบเรียบร้อย!', icon: 'success', background: '#18181b', color: '#fff' });
            } catch (error: any) {
                Swal.fire({ title: 'ข้อผิดพลาด', text: error.message, icon: 'error', background: '#18181b', color: '#fff' });
            }
        }
    };

    const handleToggleBlacklist = async (ip: string, reason?: string) => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...headers },
                body: JSON.stringify({ action: 'toggle_blacklist', ip, reason })
            });
            if (!res.ok) throw new Error('ไม่สามารถดำเนินการได้');
            fetchBlacklist();
            Swal.fire({ title: 'สำเร็จ!', icon: 'success', background: '#18181b', color: '#fff' });
        } catch (error: any) {
            Swal.fire({ title: 'ข้อผิดพลาด', text: error.message, icon: 'error', background: '#18181b', color: '#fff' });
        }
    };

    const handleRevokeAccess = async (purchaseId: string) => {
        const result = await Swal.fire({
            title: 'ยกเลิกสิทธิ์?',
            text: 'คุณต้องการยกเลิกการเข้าถึงละครเรื่องนี้ใช่หรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3f3f46',
            confirmButtonText: 'ใช่, ยกเลิกสิทธิ์',
            cancelButtonText: 'ปิด',
            background: '#18181b',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                const headers = await getAuthHeaders();
                const res = await fetch('/api/admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...headers },
                    body: JSON.stringify({ action: 'revoke_access', purchaseId })
                });
                if (!res.ok) throw new Error('ไม่สามารถยกเลิกสิทธิ์ได้');
                fetchPurchases();
                Swal.fire({ title: 'สำเร็จ!', text: 'ยกเลิกสิทธิ์เรียบร้อยแล้ว', icon: 'success', background: '#18181b', color: '#fff' });
            } catch (error: any) {
                Swal.fire({ title: 'ข้อผิดพลาด', text: error.message, icon: 'error', background: '#18181b', color: '#fff' });
            }
        }
    };

    const filteredUsers = usersList.filter(u =>
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading || profile?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <RefreshCw className="animate-spin text-red-500" size={40} />
            </div>
        );
    }

    const handleUpsertCarousel = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const headers = await getAuthHeaders();
            await fetch('/api/admin', {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'upsert_carousel',
                    carouselId: editingCarousel?.id,
                    carouselData: carouselFormData
                })
            });
            Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', background: '#18181b', color: '#fff', timer: 1500, showConfirmButton: false });
            setIsCarouselModalOpen(false);
            setEditingCarousel(null);
            fetchCarousel();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', background: '#18181b', color: '#fff' });
        }
    };

    const handleDeleteCarousel = async (id: string) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ',
            text: 'คุณต้องการลบแบนเนอร์นี้หรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#27272a',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก',
            background: '#18181b',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                const headers = await getAuthHeaders();
                await fetch('/api/admin', {
                    method: 'POST',
                    headers: { ...headers, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'delete_carousel', carouselId: id })
                });
                Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', background: '#18181b', color: '#fff', timer: 1500, showConfirmButton: false });
                fetchCarousel();
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', background: '#18181b', color: '#fff' });
            }
        }
    };

    const navigation = [
        { name: 'แดชบอร์ด', icon: LayoutDashboard, tab: 'overview' as const, color: 'hover:text-blue-400' },
        { name: 'จัดการเหรียญ', icon: Users, tab: 'users' as const, color: 'hover:text-yellow-400' },
        { name: 'จัดการเนื้อหา', icon: Film, tab: 'content' as const, color: 'hover:text-pink-400' },
        { name: 'ประวัติการปลดล็อก', icon: Database, tab: 'purchases' as const, color: 'hover:text-purple-400' },
        { name: 'ตั้งค่าระบบ', icon: Settings, tab: 'settings' as const, color: 'hover:text-orange-400' },
        { name: 'ความปลอดภัย', icon: ShieldAlert, tab: 'security' as const, color: 'hover:text-red-400' },
        { name: 'การเงิน', icon: DollarSign, tab: 'financials' as const, color: 'hover:text-emerald-400' },
        { name: 'แบนเนอร์เด่น', icon: ImageIcon, tab: 'carousel' as const, color: 'hover:text-cyan-400' },
        { name: 'ประวัติแอดมิน', icon: FileText, tab: 'logs' as const, color: 'hover:text-indigo-400' },
    ];

    return (
        <div className="min-h-screen bg-[#09090b] flex overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-zinc-900/50 backdrop-blur-xl border-r border-zinc-800 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="p-4 sm:p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500 rounded-xl shadow-lg shadow-red-500/20">
                                <ShieldCheck size={24} className="text-white" />
                            </div>
                            <span className="text-xl font-black text-white tracking-tighter uppercase">Admin Panel</span>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden p-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-2 sm:px-4 space-y-1 mt-4">
                        {navigation.map((item) => (
                            <button
                                key={item.tab}
                                onClick={() => { setActiveTab(item.tab); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group ${activeTab === item.tab ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-zinc-500 hover:bg-zinc-800/50 ' + item.color}`}
                            >
                                <item.icon size={20} className={activeTab === item.tab ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
                                {item.name}
                                {activeTab === item.tab && <ChevronRight size={16} className="ml-auto" />}
                            </button>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-zinc-800/50">
                        <div className="bg-zinc-950/50 rounded-2xl p-4 border border-zinc-800">
                            <div className="flex items-center gap-3 mb-3">
                                <img
                                    src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.username}&background=ef4444&color=fff`}
                                    alt=""
                                    className="w-10 h-10 rounded-full border-2 border-zinc-800"
                                />
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-white truncate">{profile.username}</p>
                                    <p className="text-[10px] text-zinc-500 truncate lowercase">{profile.role}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full flex items-center justify-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-all"
                            >
                                <ExternalLink size={14} /> กลับสู่หน้าหลัก
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen relative overflow-y-auto">
                {/* Topbar */}
                <header className="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800/50 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className={`p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 lg:hidden transition-all ${isSidebarOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex flex-col">
                            <h2 className="text-lg font-bold text-white">
                                {activeTab === 'overview' ? 'ภาพรวมระบบ' : activeTab === 'users' ? 'จัดการผู้ใช้งาน' : 'ประวัติการใช้งาน'}
                            </h2>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                <span>Admin</span>
                                <ChevronRight size={10} />
                                <span className="capitalize">{activeTab}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest leading-none">Server LIVE</span>
                        </div>
                        <div className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#09090b]"></span>
                        </div>
                    </div>
                </header>

                {/* Tab Content */}
                <div className="p-4 sm:p-6 lg:p-10 space-y-8 pb-20 w-full max-w-[1920px] mx-auto">
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Stats Bento Grid */}
                            {/* Stats Bento Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group">
                                    <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                        <DollarSign size={160} className="text-emerald-500" />
                                    </div>
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl w-fit border border-emerald-500/20">
                                                <DollarSign size={24} />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Total Revenue</p>
                                                <h3 className="text-3xl font-black text-white tabular-nums">฿{stats?.totalRevenue?.toLocaleString() || 0}</h3>
                                            </div>
                                        </div>
                                        <div className="h-[100px] w-full mt-auto">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={stats?.revenueTrend || []}>
                                                    <defs>
                                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                                                    <Tooltip contentStyle={{ display: 'none' }} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-1 bg-zinc-900 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group">
                                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl w-fit mb-6 border border-blue-500/20">
                                        <Users size={24} />
                                    </div>
                                    <p className="text-zinc-500 text-sm font-medium mb-1 tracking-wide uppercase">New Users (7d)</p>
                                    <div className="flex items-end gap-3">
                                        <h3 className="text-4xl font-black text-white tabular-nums">{stats?.userTrend?.reduce((a: number, b: any) => a + b.count, 0) || 0}</h3>
                                    </div>
                                    <div className="h-[60px] w-full mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats?.userTrend || []}>
                                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="md:col-span-1 bg-zinc-900 border border-zinc-800 p-8 rounded-3xl group">
                                    <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-2xl w-fit mb-6 border border-yellow-500/20 group-hover:scale-110 transition-transform">
                                        <Coins size={24} />
                                    </div>
                                    <p className="text-zinc-500 text-sm font-medium mb-1 tracking-wide uppercase">Dramas Unlocked</p>
                                    <h3 className="text-4xl font-black text-white tabular-nums">{stats?.totalPurchases || 0}</h3>
                                    <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Success rate</span>
                                        <span className="text-emerald-500 font-black text-sm">99.8%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Platform Stats Card */}
                                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-zinc-800 text-zinc-400 rounded-xl border border-zinc-700">
                                                <PieChart size={20} />
                                            </div>
                                            <h3 className="text-lg font-bold text-white">สถิติตามแพลตฟอร์ม</h3>
                                        </div>
                                        <button className="text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors">Details</button>
                                    </div>

                                    <div className="h-[250px] mt-4 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats ? Object.entries(stats.platformStats).map(([name, count]) => ({ name: name.toUpperCase(), count })) : []}>
                                                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    cursor={{ fill: '#27272a', opacity: 0.4 }}
                                                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                                />
                                                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                                    {
                                                        (stats ? Object.entries(stats.platformStats) : []).map((_, index) => {
                                                            const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#a855f7'];
                                                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                                        })
                                                    }
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Quick Info Card */}
                                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-8 text-white shadow-xl shadow-red-500/20 flex flex-col justify-between">
                                    <div>
                                        <ShieldCheck size={40} className="mb-6 opacity-80" />
                                        <h3 className="text-2xl font-black mb-2 leading-none uppercase tracking-tighter">Security Node</h3>
                                        <p className="text-red-100/70 text-sm leading-relaxed font-medium">แผงควบคุมหลักสำหรับการจัดการระบบ และความปลอดภัยของผู้ใช้งานทั้งหมด</p>
                                    </div>
                                    <div className="mt-8 space-y-3">
                                        <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs font-bold uppercase tracking-widest opacity-80">
                                            <span>Session Active</span>
                                            <span>{new Date().getHours()}:{new Date().getMinutes()}</span>
                                        </div>
                                        <button
                                            onClick={() => { fetchStats(); fetchLogs(); }}
                                            className="w-full py-3.5 bg-white text-red-600 font-black rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                                        >
                                            <RefreshCw size={16} className={dataLoading ? 'animate-spin' : ''} />
                                            Sync System
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity List */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-zinc-800 text-zinc-400 rounded-xl border border-zinc-700">
                                            <Activity size={20} />
                                        </div>
                                        <h3 className="text-lg font-bold text-white uppercase tracking-tight">กิจกรรมล่าสุด</h3>
                                    </div>
                                    <button onClick={() => setActiveTab('logs')} className="text-xs font-black text-red-500 hover:text-red-400 uppercase tracking-widest">See All</button>
                                </div>
                                <div className="space-y-4">
                                    {logsList.slice(0, 5).map((log) => (
                                        <div key={log.id} className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl hover:border-zinc-700 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20"></div>
                                                <div>
                                                    <p className="text-sm font-bold text-white capitalize">{log.action.replace('_', ' ')}</p>
                                                    <p className="text-[10px] text-zinc-500 font-medium">By {log.adminEmail}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-zinc-500 font-bold tabular-nums">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    ))}
                                    {logsList.length === 0 && (
                                        <p className="text-center py-10 text-zinc-600 font-bold italic">ยังไม่มีกิจกรรมที่บันทึกไว้</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                            {/* User Header & Search */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-2xl border border-yellow-500/20">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white uppercase tracking-tight">User Management</h3>
                                            <p className="text-zinc-500 text-xs font-medium">จัดการเหรียญและระดับสมาชิกทั้งหมด</p>
                                        </div>
                                    </div>

                                    <div className="relative w-full md:w-96 group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder="ค้นหาด้วยอีเมล หรือ ชื่อผู้ใช้งาน..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Users Table */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl">
                                <div className="overflow-x-auto min-h-[400px]">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-zinc-950/50 text-zinc-500 font-black uppercase text-[10px] tracking-[0.2em] border-b border-zinc-800">
                                            <tr>
                                                <th className="px-4 sm:px-8 py-4 sm:py-5">Profile Information</th>
                                                <th className="px-4 sm:px-8 py-4 sm:py-5">Coin Balance</th>
                                                <th className="px-4 sm:px-8 py-4 sm:py-5">Status / Level</th>
                                                <th className="px-4 sm:px-8 py-4 sm:py-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                                            {filteredUsers.map((usr) => (
                                                <tr key={usr.id} className="hover:bg-zinc-800/20 transition-all group">
                                                    <td className="px-4 sm:px-8 py-4 sm:py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative">
                                                                <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 font-black text-lg border border-zinc-700 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                                                                    {usr.avatar ? <img src={usr.avatar} alt="" className="w-full h-full object-cover" /> : (usr.username?.[0] || 'U')}
                                                                </div>
                                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-lg border-2 border-zinc-900 ${usr.role === 'admin' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-white text-base tracking-tight mb-0.5">{usr.username || 'No Name'}</div>
                                                                <div className="text-[11px] text-zinc-500 font-mono tracking-tighter opacity-70">{usr.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-8 py-4 sm:py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-2.5 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl group/coin transition-all hover:bg-yellow-500/20">
                                                                <Coins size={18} className="text-yellow-500 group-hover/coin:scale-110 transition-transform" />
                                                                <span className="font-black text-white text-lg tabular-nums">{usr.coins || 0}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleUpdateCoins(usr.id, usr.coins || 0)}
                                                                className="p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-90 border border-zinc-700/50"
                                                                title="เติมเหรียญ"
                                                            >
                                                                <PlusCircle size={20} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-8 py-4 sm:py-6">
                                                        <div className="flex flex-wrap gap-2">
                                                            <button
                                                                onClick={() => handleSetTier(usr.id, usr.tier)}
                                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${usr.tier === 'vip' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : usr.tier === 'premium' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/10' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                                                            >
                                                                {usr.tier || 'free'}
                                                            </button>
                                                            {usr.role !== 'user' && (
                                                                <span className="px-3 py-1.5 bg-red-600/10 text-red-500 border border-red-500/20 text-[10px] font-black rounded-xl uppercase tracking-widest flex items-center gap-1.5">
                                                                    <ShieldCheck size={12} />
                                                                    {usr.role}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-8 py-4 sm:py-6 text-right">
                                                        <div className="flex items-center justify-end gap-2.5">
                                                            <button
                                                                onClick={() => handleSetRole(usr.id, usr.role)}
                                                                className="p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-2xl text-zinc-400 hover:text-white transition-all border border-zinc-800"
                                                                title="ตั้งค่าสิทธิ์"
                                                            >
                                                                <UserCog size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(usr.id, usr.email)}
                                                                className="p-3 bg-red-500/5 hover:bg-red-500/10 rounded-2xl text-zinc-600 hover:text-red-500 transition-all border border-red-500/10"
                                                                title="ลบผู้ใช้"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-8 py-20 text-center">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="p-4 bg-zinc-800 rounded-full text-zinc-500">
                                                                <Search size={32} />
                                                            </div>
                                                            <p className="text-zinc-500 font-bold">ไม่พบข้อมูลผู้ใช้งานที่คุณค้นหา</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'content' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-8 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-pink-500/10 text-pink-500 rounded-2xl border border-pink-500/20">
                                        <Film size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Content Management</h3>
                                        <p className="text-zinc-500 text-xs font-medium">จัดการข้อมูลละคร ราคาเหรียญ และลิ้งก์วิดีโอ</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        Swal.fire({
                                            title: 'เพิ่มละครใหม่',
                                            html: `
                                                <input id="swal-drama-id" class="swal2-input border-zinc-800 bg-zinc-900 text-white" placeholder="Drama ID (เช่น the-glory)">
                                                <input id="swal-title" class="swal2-input border-zinc-800 bg-zinc-900 text-white" placeholder="ชื่อละคร">
                                                <input id="swal-price" type="number" class="swal2-input border-zinc-800 bg-zinc-900 text-white" placeholder="ราคาเหรียญ">
                                                <input id="swal-image" class="swal2-input border-zinc-800 bg-zinc-900 text-white" placeholder="ลิ้งก์รูปปก">
                                                <select id="swal-category" class="swal2-input border-zinc-800 bg-zinc-900 text-white">
                                                    <option value="Korean">Korean (เกาหลี)</option>
                                                    <option value="Chinese">Chinese (จีน)</option>
                                                    <option value="Thai">Thai (ไทย)</option>
                                                    <option value="Japanese">Japanese (ญี่ปุ่น)</option>
                                                </select>
                                                <input id="swal-genre" class="swal2-input border-zinc-800 bg-zinc-900 text-white" placeholder="แนว (เช่น แอ็กชัน, โรแมนติก)">
                                            `,
                                            focusConfirm: false,
                                            background: '#18181b',
                                            color: '#fff',
                                            preConfirm: () => {
                                                return {
                                                    id: (document.getElementById('swal-drama-id') as HTMLInputElement).value,
                                                    title: (document.getElementById('swal-title') as HTMLInputElement).value,
                                                    price: parseInt((document.getElementById('swal-price') as HTMLInputElement).value),
                                                    image: (document.getElementById('swal-image') as HTMLInputElement).value,
                                                    category: (document.getElementById('swal-category') as HTMLSelectElement).value,
                                                    genre: (document.getElementById('swal-genre') as HTMLInputElement).value
                                                }
                                            }
                                        }).then(res => {
                                            if (res.value) handleUpsertDrama(res.value.id, res.value);
                                        });
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-pink-600/20"
                                >
                                    <Plus size={16} />
                                    เพิ่มละคร
                                </button>
                            </div>

                            <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-zinc-950/50 text-zinc-500 font-black uppercase text-[10px] tracking-[0.2em] border-b border-zinc-800">
                                            <tr>
                                                <th className="px-8 py-5">Content Info</th>
                                                <th className="px-8 py-5">ID</th>
                                                <th className="px-8 py-5 text-center">Price</th>
                                                <th className="px-8 py-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                                            {dramasList.map((drama) => (
                                                <tr key={drama.id} className="hover:bg-zinc-800/20 transition-all group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-16 bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                                                                <img src={drama.image} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                            <span className="font-bold text-white">{drama.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 font-mono text-xs text-zinc-500">{drama.id}</td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full font-black text-xs border border-yellow-500/20">
                                                            {drama.price} 🪙
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    Swal.fire({
                                                                        title: 'แก้ไขละคร',
                                                                        html: `
                                                                            <input id="swal-title" class="swal2-input border-zinc-800 bg-zinc-900 text-white" placeholder="ชื่อละคร" value="${drama.title}">
                                                                            <input id="swal-price" type="number" class="swal2-input border-zinc-800 bg-zinc-900 text-white" placeholder="ราคาเหรียญ" value="${drama.price}">
                                                                            <input id="swal-image" class="swal2-input border-zinc-800 bg-zinc-900 text-white" placeholder="ลิ้งก์รูปปก" value="${drama.image}">
                                                                            <select id="swal-category" class="swal2-input border-zinc-800 bg-zinc-900 text-white">
                                                                                <option value="Korean" ${drama.category === 'Korean' ? 'selected' : ''}>Korean (เกาหลี)</option>
                                                                                <option value="Chinese" ${drama.category === 'Chinese' ? 'selected' : ''}>Chinese (จีน)</option>
                                                                                <option value="Thai" ${drama.category === 'Thai' ? 'selected' : ''}>Thai (ไทย)</option>
                                                                                <option value="Japanese" ${drama.category === 'Japanese' ? 'selected' : ''}>Japanese (ญี่ปุ่น)</option>
                                                                            </select>
                                                                            <input id="swal-genre" class="swal2-input border-zinc-800 bg-zinc-900 text-white" placeholder="แนว (เช่น แอ็กชัน, โรแมนติก)" value="${drama.genre || ''}">
                                                                        `,
                                                                        focusConfirm: false,
                                                                        background: '#18181b',
                                                                        color: '#fff',
                                                                        preConfirm: () => {
                                                                            return {
                                                                                title: (document.getElementById('swal-title') as HTMLInputElement).value,
                                                                                price: parseInt((document.getElementById('swal-price') as HTMLInputElement).value),
                                                                                image: (document.getElementById('swal-image') as HTMLInputElement).value,
                                                                                category: (document.getElementById('swal-category') as HTMLSelectElement).value,
                                                                                genre: (document.getElementById('swal-genre') as HTMLInputElement).value
                                                                            }
                                                                        }
                                                                    }).then(res => {
                                                                        if (res.value) handleUpsertDrama(drama.id, res.value);
                                                                    });
                                                                }}
                                                                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteDrama(drama.id)}
                                                                className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {dramasList.length === 0 && !dataLoading && (
                                                <tr>
                                                    <td colSpan={4} className="px-8 py-20 text-center text-zinc-500 font-bold">ไม่พบข้อมูลละคร</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'purchases' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-8 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl border border-purple-500/20">
                                        <Database size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Purchase Logs</h3>
                                        <p className="text-zinc-500 text-xs font-medium">ประวัติการปลดล็อกละครของผู้ใช้งานทั่วระบบ</p>
                                    </div>
                                </div>
                                <button
                                    onClick={fetchPurchases}
                                    className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-white transition-all"
                                >
                                    <RefreshCw size={20} className={dataLoading ? 'animate-spin' : ''} />
                                </button>
                            </div>

                            <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl">
                                <div className="overflow-x-auto min-h-[400px]">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-zinc-950/50 text-zinc-500 font-black uppercase text-[10px] tracking-[0.2em] border-b border-zinc-800">
                                            <tr>
                                                <th className="px-4 sm:px-8 py-4 sm:py-5">User Identification</th>
                                                <th className="px-4 sm:px-8 py-4 sm:py-5">Content / Platform</th>
                                                <th className="px-4 sm:px-8 py-4 sm:py-5">Timestamp</th>
                                                <th className="px-4 sm:px-8 py-4 sm:py-5 text-right">Revoke</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                                            {purchasesList.map((p) => (
                                                <tr key={p.id} className="hover:bg-zinc-800/20 transition-all group">
                                                    <td className="px-4 sm:px-8 py-4 sm:py-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-zinc-300 font-black text-sm mb-1">{p.userId}</span>
                                                            <span className="text-[10px] text-zinc-600 font-mono tracking-tighter">REF: {p.id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-8 py-4 sm:py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl group-hover:border-purple-500/30 transition-colors">
                                                                <span className="font-black text-white tracking-widest uppercase">{p.dramaId}</span>
                                                            </div>
                                                            <span className="px-3 py-1 bg-red-600/10 text-red-500 text-[10px] font-black rounded-lg uppercase tracking-widest border border-red-500/20">{p.platform}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-8 py-4 sm:py-6">
                                                        <div className="text-zinc-500 text-xs font-bold font-mono">
                                                            {p.grantedAt ? new Date(p.grantedAt).toLocaleString('th-TH') : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-8 py-4 sm:py-6 text-right">
                                                        <button
                                                            onClick={() => handleRevokeAccess(p.id)}
                                                            className="p-3 bg-red-500/5 hover:bg-red-500/20 text-zinc-600 hover:text-red-500 rounded-2xl transition-all border border-red-500/10"
                                                        >
                                                            <XCircle size={20} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {purchasesList.length === 0 && !dataLoading && (
                                                <tr>
                                                    <td colSpan={4} className="px-8 py-20 text-center">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="p-4 bg-zinc-800 rounded-full text-zinc-500">
                                                                <Database size={32} />
                                                            </div>
                                                            <p className="text-zinc-500 font-bold">ไม่พบข้อมูลประวัติการปลดล็อก</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl border border-orange-500/20">
                                        <Settings size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight">System Configuration</h3>
                                        <p className="text-zinc-500 text-xs font-medium">ตั้งค่าการทำงานเบื้องหลังของระบบ</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="bg-zinc-950/50 border border-zinc-800 p-6 rounded-2xl">
                                            <label className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                                                <Coins size={16} className="text-yellow-500" />
                                                Welcome Bonus (เหรียญฟรีสมาชิกใหม่)
                                            </label>
                                            <input
                                                type="number"
                                                value={systemSettings?.welcomeBonus || 0}
                                                onChange={(e) => setSystemSettings({ ...systemSettings, welcomeBonus: parseInt(e.target.value) })}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white font-bold focus:border-orange-500 outline-none transition-all"
                                            />
                                            <p className="text-[10px] text-zinc-500 mt-2">* จำนวนเหรียญที่จะแจกให้ผู้ใช้ที่สมัครสมาชิกใหม่ครั้งแรก</p>
                                        </div>

                                        <div className="bg-zinc-950/50 border border-zinc-800 p-6 rounded-2xl">
                                            <label className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                                                <AlertTriangle size={16} className="text-red-500" />
                                                Maintenance Mode (โหมดปรับปรุงระบบ)
                                            </label>
                                            <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                                                <span className="text-xs text-zinc-400 font-medium">สถานะปัจจุบัน: {systemSettings?.maintenanceMode ? 'เปิดใช้งาน (ปิดระบบ)' : 'ปิดใช้งาน (ปกติ)'}</span>
                                                <button
                                                    onClick={() => setSystemSettings({ ...systemSettings, maintenanceMode: !systemSettings?.maintenanceMode })}
                                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${systemSettings?.maintenanceMode ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-zinc-800 text-zinc-500'}`}
                                                >
                                                    {systemSettings?.maintenanceMode ? 'Disable' : 'Enable'}
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 mt-2">* เมื่อเปิดใช้งาน ผู้ใช้ทั่วไปจะไม่สามารถเข้าใช้งานหน้าเว็บได้</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-zinc-950/50 border border-zinc-800 p-6 rounded-2xl h-full flex flex-col">
                                            <label className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                                                <Globe size={16} className="text-blue-500" />
                                                Global Announcement (ประกาศจากระบบ)
                                            </label>
                                            <textarea
                                                rows={6}
                                                value={systemSettings?.announcement || ""}
                                                onChange={(e) => setSystemSettings({ ...systemSettings, announcement: e.target.value })}
                                                placeholder="ใส่ข้อความประกาศที่นี่..."
                                                className="w-full flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-orange-500 outline-none transition-all resize-none"
                                            />
                                            <p className="text-[10px] text-zinc-500 mt-2">* ข้อความนี้จะแสดงให้ผู้ใช้ทุกคนเห็นบนหน้าจอหลัก</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={() => handleUpdateSettings(systemSettings)}
                                        className="flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl shadow-xl shadow-orange-600/20 transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        <CheckCircle2 size={20} />
                                        บันทึกการตั้งค่าทั้งหมด
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
                                            <ShieldAlert size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Security & IP Blacklist</h3>
                                            <p className="text-zinc-500 text-xs font-medium">จัดการความปลอดภัยและแบนไอพีผู้ไม่ประสงค์ดี</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            Swal.fire({
                                                title: 'แบนไอพีใหม่',
                                                input: 'text',
                                                inputLabel: 'IP Address',
                                                inputPlaceholder: 'เช่น 192.168.1.1',
                                                showCancelButton: true,
                                                confirmButtonColor: '#ef4444',
                                                confirmButtonText: 'บันทึก',
                                                background: '#18181b',
                                                color: '#fff'
                                            }).then(res => {
                                                if (res.value) handleToggleBlacklist(res.value);
                                            });
                                        }}
                                        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl transition-all"
                                    >
                                        <PlusCircle size={16} />
                                        เพิ่มรายการแบน
                                    </button>
                                </div>
                            </div>

                            <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-zinc-950/50 text-zinc-500 font-black uppercase text-[10px] tracking-[0.2em] border-b border-zinc-800">
                                            <tr>
                                                <th className="px-8 py-5">IP Address</th>
                                                <th className="px-8 py-5">Reason</th>
                                                <th className="px-8 py-5">Banned At</th>
                                                <th className="px-8 py-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                                            {blacklist.map((item) => (
                                                <tr key={item.ip} className="hover:bg-zinc-800/20 transition-all">
                                                    <td className="px-8 py-6 font-mono font-bold text-red-400">{item.ip.replace(/_/g, '.')}</td>
                                                    <td className="px-8 py-6 text-zinc-500">{item.reason}</td>
                                                    <td className="px-8 py-6 text-zinc-500 text-xs">{item.bannedAt ? new Date(item.bannedAt).toLocaleString('th-TH') : '-'}</td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button
                                                            onClick={() => handleToggleBlacklist(item.ip.replace(/_/g, '.'))}
                                                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black rounded-lg uppercase transition-all"
                                                        >
                                                            ปลดแบน
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {blacklist.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-8 py-20 text-center text-zinc-500 font-bold">ไม่พบรายการไอพีที่ถูกแบน</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'financials' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
                                        <DollarSign size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight">การเงิน & การเติมเหรียญ</h3>
                                        <p className="text-zinc-500 text-xs font-medium">ตรวจสอบสลิปการโอนเงินและอนุมัติการเติมเหรียญ</p>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">รออนุมัติ</p>
                                    <p className="text-3xl font-black text-yellow-500">{paymentsList.filter(p => p.status === 'pending').length}</p>
                                </div>
                                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">อนุมัติแล้ว</p>
                                    <p className="text-3xl font-black text-emerald-500">{paymentsList.filter(p => p.status === 'approved').length}</p>
                                </div>
                                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">ยอดรวมทั้งหมด</p>
                                    <p className="text-3xl font-black text-white">฿{paymentsList.filter(p => p.status === 'approved').reduce((sum: number, p: any) => sum + (p.amount || 0), 0).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Payments Table */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-zinc-950/50 text-zinc-500 font-black uppercase text-[10px] tracking-[0.2em] border-b border-zinc-800">
                                            <tr>
                                                <th className="px-6 py-5">ผู้ใช้</th>
                                                <th className="px-6 py-5">จำนวนเงิน</th>
                                                <th className="px-6 py-5">สถานะ</th>
                                                <th className="px-6 py-5">วันที่</th>
                                                <th className="px-6 py-5 text-right">จัดการ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                                            {paymentsList.map((payment: any) => (
                                                <tr key={payment.id} className="hover:bg-zinc-800/20 transition-all">
                                                    <td className="px-6 py-5">
                                                        <div className="font-bold text-white">{payment.username || 'Unknown'}</div>
                                                        <div className="text-[10px] text-zinc-500 font-mono">{payment.uid?.slice(0, 12)}...</div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="font-black text-lg text-white">฿{payment.amount}</span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                                                            payment.status === 'approved' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' :
                                                                'bg-red-500/20 text-red-500 border border-red-500/30'
                                                            }`}>
                                                            {payment.status === 'pending' ? 'รอตรวจ' : payment.status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-zinc-500 text-xs">
                                                        {payment.timestamp ? new Date(payment.timestamp).toLocaleString('th-TH') : '-'}
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        {payment.status === 'pending' && (
                                                            <div className="flex items-center justify-end gap-2">
                                                                {payment.slipUrl && (
                                                                    <button
                                                                        onClick={() => {
                                                                            Swal.fire({
                                                                                title: 'สลิปการโอนเงิน',
                                                                                imageUrl: payment.slipUrl,
                                                                                imageWidth: 300,
                                                                                background: '#18181b',
                                                                                color: '#fff',
                                                                                showConfirmButton: false,
                                                                                showCloseButton: true
                                                                            });
                                                                        }}
                                                                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px] font-black rounded-lg uppercase transition-all"
                                                                    >
                                                                        ดูสลิป
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={async () => {
                                                                        const headers = await getAuthHeaders();
                                                                        await fetch('/api/admin', {
                                                                            method: 'POST',
                                                                            headers: { ...headers, 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({ action: 'approve_payment', paymentId: payment.id, uid: payment.uid, amount: payment.amount })
                                                                        });
                                                                        Swal.fire({ icon: 'success', title: 'อนุมัติแล้ว!', text: `เติม ${payment.amount * 10} เหรียญให้ผู้ใช้เรียบร้อย`, timer: 2000, background: '#18181b', color: '#fff', showConfirmButton: false });
                                                                        fetchPayments();
                                                                    }}
                                                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black rounded-lg uppercase transition-all"
                                                                >
                                                                    อนุมัติ
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        const headers = await getAuthHeaders();
                                                                        await fetch('/api/admin', {
                                                                            method: 'POST',
                                                                            headers: { ...headers, 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({ action: 'reject_payment', paymentId: payment.id })
                                                                        });
                                                                        Swal.fire({ icon: 'info', title: 'ปฏิเสธแล้ว', timer: 1500, background: '#18181b', color: '#fff', showConfirmButton: false });
                                                                        fetchPayments();
                                                                    }}
                                                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black rounded-lg uppercase transition-all"
                                                                >
                                                                    ปฏิเสธ
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {paymentsList.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-8 py-20 text-center text-zinc-500 font-bold">ยังไม่มีรายการแจ้งโอนเงิน</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'carousel' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-2xl border border-cyan-500/20">
                                            <ImageIcon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Featured Banners</h3>
                                            <p className="text-zinc-500 text-xs font-medium">จัดการแบนเนอร์สไลด์ที่หน้าแรก</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setEditingCarousel(null);
                                            setCarouselFormData({ title: '', subtitle: '', imageUrl: '', linkUrl: '', order: carouselList.length });
                                            setIsCarouselModalOpen(true);
                                        }}
                                        className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded-xl transition-all"
                                    >
                                        <PlusCircle size={16} />
                                        เพิ่มแบนเนอร์ใหม่
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {carouselList.map((item) => (
                                    <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-700 transition-all group">
                                        <div className="aspect-video bg-zinc-800 relative w-full overflow-hidden">
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pb-2">
                                                <h4 className="text-white font-black truncate">{item.title}</h4>
                                                <p className="text-zinc-400 text-xs truncate">{item.subtitle}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 flex items-center justify-between border-t border-zinc-800/50">
                                            <div className="flex items-center gap-2 text-zinc-500">
                                                <span className="text-xs font-medium">ลำดับที่ {item.order}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingCarousel(item);
                                                        setCarouselFormData(item);
                                                        setIsCarouselModalOpen(true);
                                                    }}
                                                    className="p-2 bg-zinc-800 hover:bg-cyan-600 text-zinc-400 hover:text-white rounded-xl transition-all"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCarousel(item.id)}
                                                    className="p-2 bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white rounded-xl transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {carouselList.length === 0 && (
                                    <div className="col-span-full p-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
                                        <ImageIcon size={48} className="mx-auto text-zinc-700 mb-4" />
                                        <p className="text-zinc-500 font-bold">ยังไม่มีแบนเนอร์ในระบบ</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'logs' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl border border-indigo-500/20">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Admin Activity Logs</h3>
                                        <p className="text-zinc-500 text-xs font-medium">บันทึกประวัติการใช้งานและแก้ไขระบบของผู้ดูแลระบบ</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-zinc-950/50 text-zinc-500 font-black uppercase text-[10px] tracking-[0.2em] border-b border-zinc-800">
                                            <tr>
                                                <th className="px-6 py-5">Action</th>
                                                <th className="px-6 py-5">Admin</th>
                                                <th className="px-6 py-5">Target ID</th>
                                                <th className="px-6 py-5">Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                                            {logsList.map((log) => (
                                                <tr key={log.id} className="hover:bg-zinc-800/20 transition-all">
                                                    <td className="px-6 py-5">
                                                        <span className="font-bold text-indigo-400 capitalize">{log.action.replace(/_/g, ' ')}</span>
                                                    </td>
                                                    <td className="px-6 py-5 text-xs text-zinc-400">{log.adminEmail}</td>
                                                    <td className="px-6 py-5 font-mono text-xs text-zinc-500">{log.targetId || '-'}</td>
                                                    <td className="px-6 py-5 text-xs text-zinc-500">{new Date(log.timestamp).toLocaleString('th-TH')}</td>
                                                </tr>
                                            ))}
                                            {logsList.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-8 py-20 text-center text-zinc-500 font-bold">ไม่มีประวัติการทำรายการ</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Carousel Modal */}
            {isCarouselModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-[2rem] p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-white">{editingCarousel ? 'แก้ไขแบนเนอร์' : 'เพิ่มแบนเนอร์ใหม่'}</h3>
                            </div>
                            <button onClick={() => setIsCarouselModalOpen(false)} className="p-2 bg-zinc-900 hover:bg-red-500/20 text-zinc-500 hover:text-red-500 rounded-full transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpsertCarousel} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">Image URL *</label>
                                    <input required type="url" value={carouselFormData.imageUrl} onChange={(e) => setCarouselFormData({ ...carouselFormData, imageUrl: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">Title *</label>
                                    <input required type="text" value={carouselFormData.title} onChange={(e) => setCarouselFormData({ ...carouselFormData, title: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">Subtitle</label>
                                    <input type="text" value={carouselFormData.subtitle} onChange={(e) => setCarouselFormData({ ...carouselFormData, subtitle: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">Link URL (Optional)</label>
                                    <input type="text" value={carouselFormData.linkUrl} onChange={(e) => setCarouselFormData({ ...carouselFormData, linkUrl: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm font-medium" placeholder="/watch/example-id" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">Order</label>
                                    <input type="number" value={carouselFormData.order} onChange={(e) => setCarouselFormData({ ...carouselFormData, order: parseInt(e.target.value) })} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm font-medium" />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl uppercase tracking-widest transition-all">
                                บันทึกข้อมูล
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
