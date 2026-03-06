import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Gift, CheckCircle2, Upload, AlertCircle, Coins } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '@/lib/firebase';
import Swal from 'sweetalert2';

export default function TopUp() {
    const navigate = useNavigate();
    const { profile, refreshProfile } = useAuth();
    const [amount, setAmount] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [slipImage, setSlipImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [couponLoading, setCouponLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSlipImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitPayment = async () => {
        if (!amount || !slipImage) {
            Swal.fire({
                icon: 'warning',
                title: 'ข้อมูลไม่ครบ',
                text: 'กรุณาระบุจำนวนเงินและแนบสลิปการโอนเงิน',
                background: '#18181b',
                color: '#fff'
            });
            return;
        }

        setLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: Number(amount),
                    slipUrl: slipImage, // Sending as Base64 for simplicity in this demo
                    method: 'promptpay'
                })
            });

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'ส่งหลักฐานสำเร็จ',
                    text: 'เจ้าหน้าที่จะตรวจสอบและเติมเหรียญให้คุณภายใน 5-15 นาที',
                    background: '#18181b',
                    color: '#fff'
                });
                setAmount('');
                setSlipImage(null);
            } else {
                throw new Error('Failed to submit payment');
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: error.message,
                background: '#18181b',
                color: '#fff'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRedeemCoupon = async () => {
        if (!couponCode) return;
        setCouponLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch('/api/coupons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ action: 'redeem', code: couponCode })
            });

            const data = await res.json();
            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ!',
                    text: data.message,
                    background: '#18181b',
                    color: '#fff'
                });
                setCouponCode('');
                await refreshProfile();
            } else {
                throw new Error(data.error || 'Invalid coupon');
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'ผิดพลาด',
                text: error.message,
                background: '#18181b',
                color: '#fff'
            });
        } finally {
            setCouponLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 p-4 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors">
                    <ArrowLeft size={20} className="text-white" />
                </button>
                <h1 className="text-lg font-black text-white px-2">เติมเหรียญ</h1>
            </div>

            <div className="max-w-md mx-auto p-4 space-y-6">
                {/* Current Balance */}
                <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl p-6 border border-zinc-700 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Coins size={80} className="text-yellow-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">เหรียญคงเหลือ</p>
                        <h2 className="text-4xl font-black text-white flex items-center gap-2">
                            {profile?.coins || 0}
                            <span className="text-lg text-yellow-500">Coins</span>
                        </h2>
                    </div>
                </div>

                {/* Main Tabs/Sections */}
                <div className="space-y-4">
                    {/* Method: PromptPay */}
                    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden">
                        <div className="p-4 border-b border-zinc-800 bg-zinc-800/50 flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-500">
                                <CreditCard size={18} />
                            </div>
                            <h3 className="font-bold text-white">ชำระผ่าน PromptPay (QR Code)</h3>
                        </div>
                        <div className="p-6 flex flex-col items-center">
                            <div className="w-48 h-48 bg-white p-2 rounded-2xl mb-4 shadow-xl">
                                <img
                                    src="/artifacts/promptpay_qr_mockup_1772421298847.png"
                                    alt="PromptPay QR"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <p className="text-[10px] text-zinc-500 text-center mb-6">
                                สแกน QR Code ด้วยแอปธนาคารใดก็ได้<br />
                                <span className="text-zinc-400">ชื่อบัญชี: FlexTV Streaming Group</span>
                            </p>

                            <div className="w-full space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">จำนวนเงิน (บาท)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="ระบุจำนวนเงินที่โอน"
                                        className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">แนบสลิปการโอน</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className={`w-full border-2 border-dashed ${slipImage ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-zinc-700 bg-zinc-800'} rounded-xl p-6 flex flex-col items-center justify-center transition-all`}>
                                            {slipImage ? (
                                                <>
                                                    <CheckCircle2 size={24} className="text-emerald-500 mb-2" />
                                                    <span className="text-xs text-emerald-400 font-bold">เลือกรูปภาพแล้ว</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={24} className="text-zinc-500 mb-2" />
                                                    <span className="text-xs text-zinc-500">คลิกเพื่ออัปโหลดรูปภาพสลิป</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmitPayment}
                                    disabled={loading}
                                    className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'ยืนยันการแจ้งโอน'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Coupon Section */}
                    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden">
                        <div className="p-4 border-b border-zinc-800 bg-zinc-800/50 flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-500">
                                <Gift size={18} />
                            </div>
                            <h3 className="font-bold text-white">ใช้รหัสคูปอง</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="กรอกรหัสคูปอง"
                                    className="flex-1 bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-red-500 focus:border-red-500 uppercase font-bold tracking-widest"
                                />
                                <button
                                    onClick={handleRedeemCoupon}
                                    disabled={couponLoading || !couponCode}
                                    className="px-6 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm border border-zinc-700 transition-all"
                                >
                                    {couponLoading ? '...' : 'ใช้รหัส'}
                                </button>
                            </div>
                            <p className="mt-3 text-[10px] text-zinc-500 flex items-center gap-1.5">
                                <AlertCircle size={12} />
                                จำกัด 1 คนต่อ 1 สิทธิ์สำหรับรหัสแต่ละประเภท
                            </p>
                        </div>
                    </div>
                </div>

                {/* Help/Support */}
                <div className="text-center">
                    <p className="text-xs text-zinc-500">มีปัญหาการใช้งาน? <button className="text-red-500 hover:underline">ติดต่อสอบถาม</button></p>
                </div>
            </div>
        </div>
    );
}
