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
    PlayCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Profile() {
    const { profile, user, signOut, isLoading, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const handleEditProfile = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'แก้ไขข้อมูลส่วนตัว',
            html:
                `<div class="flex flex-col gap-4">
                    <div class="text-left">
                        <label class="text-sm text-zinc-400 mb-1 block">ชื่อผู้ใช้งาน</label>
                        <input id="swal-username" class="swal2-input !m-0 !w-full !bg-zinc-800 !text-white !border-zinc-700" value="${profile?.username || ''}">
                    </div>
                    <div class="text-left">
                        <label class="text-sm text-zinc-400 mb-1 block">URL รูปโปรไฟล์ (ถ้ามี)</label>
                        <input id="swal-avatar" class="swal2-input !m-0 !w-full !bg-zinc-800 !text-white !border-zinc-700" value="${profile?.avatar || ''}">
                    </div>
                </div>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'บันทึก',
            cancelButtonText: 'ยกเลิก',
            background: '#18181b',
            color: '#fff',
            confirmButtonColor: '#ef4444',
            preConfirm: () => {
                return {
                    username: (document.getElementById('swal-username') as HTMLInputElement).value,
                    avatar: (document.getElementById('swal-avatar') as HTMLInputElement).value
                }
            }
        });

        if (formValues) {
            try {
                const idToken = await user?.getIdToken();
                const res = await fetch('/api/auth', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify(formValues)
                });

                if (res.ok) {
                    await refreshProfile();
                    Swal.fire({ title: 'สำเร็จ!', text: 'อัปเดตข้อมูลเรียบร้อยแล้ว', icon: 'success', background: '#18181b', color: '#fff' });
                } else {
                    throw new Error('ไม่สามารถอัปเดตข้อมูลได้');
                }
            } catch (error: any) {
                Swal.fire({ title: 'ข้อผิดพลาด', text: error.message, icon: 'error', background: '#18181b', color: '#fff' });
            }
        }
    };

    const handleChangePassword = async () => {
        const { value: newPassword } = await Swal.fire({
            title: 'เปลี่ยนรหัสผ่านใหม่',
            input: 'password',
            inputPlaceholder: 'ใส่รหัสผ่านใหม่ของคุณ',
            inputAttributes: {
                autocapitalize: 'off',
                autocorrect: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'เปลี่ยนรหัสผ่าน',
            cancelButtonText: 'ยกเลิก',
            background: '#18181b',
            color: '#fff',
            confirmButtonColor: '#ef4444',
            inputValidator: (value) => {
                if (!value || value.length < 6) {
                    return 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
                }
            }
        });

        if (newPassword) {
            try {
                const idToken = await user?.getIdToken();
                const res = await fetch('/api/auth', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify({ newPassword })
                });

                if (res.ok) {
                    Swal.fire({ title: 'สำเร็จ!', text: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว', icon: 'success', background: '#18181b', color: '#fff' });
                } else {
                    throw new Error('ไม่สามารถเปลี่ยนรหัสผ่านได้');
                }
            } catch (error: any) {
                Swal.fire({ title: 'ข้อผิดพลาด', text: error.message, icon: 'error', background: '#18181b', color: '#fff' });
            }
        }
    };

    const handleBuyVip = async () => {
        const result = await Swal.fire({
            title: 'สมัคร VIP 30 วัน',
            text: 'ใช้ 990 เหรียญ เพื่อปลดล็อกละครทุกเรื่องเป็นเวลา 30 วัน',
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#eab308',
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก',
            background: '#18181b',
            color: '#fff',
        });

        if (result.isConfirmed) {
            try {
                const idToken = await user?.getIdToken();
                const res = await fetch('/api/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify({ action: 'buy_vip', planDurationDays: 30, price: 990 })
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    await refreshProfile();
                    Swal.fire({ title: 'สำเร็จ!', text: 'คุณได้รับสถานะ VIP แล้ว', icon: 'success', background: '#18181b', color: '#fff' });
                } else {
                    throw new Error(data.error || 'ยอดเหรียญสะสมไม่เพียงพอ');
                }
            } catch (error: any) {
                Swal.fire({ title: 'ข้อผิดพลาด', text: error.message, icon: 'error', background: '#18181b', color: '#fff' });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    if (!user || !profile) {
        navigate('/login');
        return null;
    }

    const menuItems = [
        {
            icon: <Heart size={20} />,
            label: 'รายการที่บันทึกไว้',
            desc: 'ละครที่คุณบันทึกไว้ดูภายหลัง',
            color: 'text-pink-400',
            onClick: () => navigate('/mylist')
        },
        {
            icon: <PlayCircle size={20} />,
            label: 'ประวัติการรับชม',
            desc: 'รายการละครที่คุณเพิ่งดูไป',
            color: 'text-orange-400',
            onClick: () => navigate('/history')
        },
        {
            icon: <History size={20} />,
            label: 'ประวัติการปลดล็อกละคร',
            desc: 'รายการละครที่คุณเคยซื้อไว้ทั้งหมด',
            color: 'text-blue-400',
            onClick: () => { }
        },
        {
            icon: <CreditCard size={20} />,
            label: 'ประวัติการเติมเงิน',
            desc: 'ตรวจสอบรายการทำธุรกรรมของคุณ',
            color: 'text-emerald-400',
            onClick: () => { }
        },
        {
            icon: <UserCircle size={20} />,
            label: 'แก้ไขข้อมูลส่วนตัว',
            desc: 'เปลี่ยนชื่อผู้ใช้และรูปโปรไฟล์ของคุณ',
            color: 'text-zinc-400',
            onClick: handleEditProfile
        },
        {
            icon: <Key size={20} />,
            label: 'เปลี่ยนรหัสผ่าน',
            desc: 'เพื่อความปลอดภัยของบัญชีของคุณ',
            color: 'text-zinc-500',
            onClick: handleChangePassword
        }
    ];

    return (
        <div className="min-h-screen bg-[#09090b] pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* Header/Hero */}
                <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Shield size={120} className="text-red-500" />
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                        <div className="relative group cursor-pointer" onClick={handleEditProfile}>
                            <img
                                src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.username}&background=ef4444&color=fff`}
                                alt={profile.username}
                                className="w-24 h-24 rounded-full border-4 border-zinc-800 object-cover group-hover:opacity-50 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Settings size={24} className="text-white" />
                            </div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-4 border-zinc-900"></div>
                        </div>

                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl font-bold text-white mb-1">{profile.username}</h1>
                            <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${profile.tier === 'vip' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                                    profile.tier === 'premium' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                        'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                    }`}>
                                    {profile.tier} Member
                                </span>
                                {profile.role === 'admin' && (
                                    <span className="bg-red-500/20 text-red-500 border border-red-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                        Staff
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => signOut()}
                            className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2 border border-zinc-700"
                        >
                            <LogOut size={16} /> ออกจากระบบ
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column - Stats */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                            <div className="flex items-center gap-3 text-zinc-400 mb-6 pb-4 border-b border-zinc-800/50">
                                <Coins className="text-yellow-500" size={20} />
                                <span className="text-sm font-medium">ยอดยอดเหรียญคงเหลือ</span>
                            </div>
                            <div className="text-4xl font-bold text-white mb-1">{profile.coins}</div>
                            <p className="text-zinc-500 text-xs mt-2">สำหรับปลดล็อกละครที่คุณต้องการ</p>
                            <button
                                onClick={() => navigate('/topup')}
                                className="w-full mt-6 py-3 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-black rounded-xl text-sm font-bold transition-all border border-yellow-500/20"
                            >
                                เติมเหรียญ
                            </button>
                        </div>

                        {/* VIP Subscription Card */}
                        <div className="bg-gradient-to-br from-yellow-500/10 to-transparent rounded-2xl p-6 border border-yellow-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Award size={100} className="text-yellow-500" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-yellow-500 font-bold mb-1 flex items-center gap-2">
                                    <Award size={18} /> VIP Subscription
                                </h3>

                                {profile.tier === 'vip' ? (
                                    <>
                                        <p className="text-white text-sm mt-3 font-semibold">สถานะการเป็นสมาชิกของคุณ:</p>
                                        <p className="text-yellow-400 text-2xl font-black mt-1 uppercase tracking-wider">Active VIP</p>
                                        <div className="mt-4 p-3 bg-black/40 rounded-xl border border-yellow-500/10">
                                            <p className="text-zinc-400 text-xs">วันหมดอายุ:</p>
                                            <p className="text-white text-sm font-medium mt-0.5">
                                                {profile.vipUntil ? new Date(profile.vipUntil).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'ไม่จำกัด'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleBuyVip}
                                            className="w-full mt-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-xs font-bold transition-all"
                                        >
                                            ต่ออายุ VIP (990 เหรียญ / 30 วัน)
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-zinc-400 text-xs mt-1">รับชมละครทุกเรื่องแบบไม่มีจำกัด</p>
                                        <div className="mt-6">
                                            <div className="flex items-end gap-1.5 mb-2">
                                                <span className="text-2xl font-black text-white">990</span>
                                                <span className="text-yellow-500 text-xs uppercase font-bold mb-1">Coins</span>
                                                <span className="text-zinc-500 text-xs mb-1 ml-1">/ 30 วัน</span>
                                            </div>
                                            <button
                                                onClick={handleBuyVip}
                                                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-sm font-bold transition-all shadow-lg shadow-yellow-500/20"
                                            >
                                                อัปเกรดเป็น VIP
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                            <h3 className="text-white font-semibold mb-4 text-sm flex items-center gap-2">
                                <Award size={16} className="text-red-500" /> ข้อมูลบัญชี
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500 text-xs">อีเมล</span>
                                    <span className="text-zinc-300 text-xs truncate max-w-[140px]">{profile.email}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500 text-xs">สถานะ</span>
                                    <span className="text-zinc-300 text-xs capitalize">{profile.tier}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Menu */}
                    <div className="md:col-span-2 space-y-4">
                        <h2 className="text-white font-bold text-lg mb-2">เมนูสมาชิก</h2>

                        {menuItems.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={item.onClick}
                                className="w-full flex items-center justify-between p-5 bg-zinc-900 hover:bg-zinc-800 rounded-2xl border border-zinc-800 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 bg-zinc-950 rounded-xl ${item.color} group-hover:scale-110 transition-transform`}>
                                        {item.icon}
                                    </div>
                                    <div className="text-left">
                                        <div className="text-white font-semibold">{item.label}</div>
                                        <div className="text-zinc-500 text-xs">{item.desc}</div>
                                    </div>
                                </div>
                                <ChevronRight className="text-zinc-700 group-hover:text-white transition-colors" />
                            </button>
                        ))}

                        {profile.role === 'admin' && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="w-full flex items-center justify-between p-5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-2xl mt-4 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-500/20 text-red-500 rounded-xl group-hover:scale-110 transition-transform">
                                        <Shield size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-red-400 font-bold">ระบบจัดการหลังบ้าน</div>
                                        <div className="text-red-500/50 text-xs underline">คลิกเพื่อเข้าสู่แผงควบคุม</div>
                                    </div>
                                </div>
                                <ChevronRight className="text-red-500" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
