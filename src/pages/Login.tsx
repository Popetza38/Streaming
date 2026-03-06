import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let userCredential;
            if (isLogin) {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            }

            const firebaseUser = userCredential.user;
            const idToken = await firebaseUser.getIdToken();

            // Sync profile with backend
            const syncRes = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idToken,
                    username: !isLogin ? username : undefined
                })
            });

            if (!syncRes.ok) {
                let errorMessage = 'Profile sync failed';
                try {
                    const syncData = await syncRes.json();
                    errorMessage = syncData.error || errorMessage;
                } catch (e) {
                    errorMessage = `Server Error: ${syncRes.status} ${syncRes.statusText}`;
                }
                console.error('Profile sync failed:', errorMessage);
            }

            await refreshProfile(); // Refresh auth context profile metadata

            Swal.fire({
                icon: 'success',
                title: isLogin ? 'เข้าสู่ระบบสำเร็จ' : 'สมัครสมาชิกสำเร็จ',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                background: '#18181b',
                color: '#fff'
            });
            navigate('/');
        } catch (error: any) {
            let message = error.message;
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                message = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
            } else if (error.code === 'auth/email-already-in-use') {
                message = 'อีเมลนี้ถูกใช้งานแล้ว';
            } else if (error.code === 'auth/weak-password') {
                message = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
            }

            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: message || 'โปรดลองใหม่อีกครั้ง',
                background: '#18181b',
                color: '#fff',
                confirmButtonColor: '#e50914'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-900 ring-1 ring-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-white text-center mb-6">
                    {isLogin ? 'เข้าสู่ระบบ (Login)' : 'สมัครสมาชิก (Sign Up)'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">ชื่อผู้ใช้ (Username)</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
                                    placeholder="john_doe"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">อีเมล (Email)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">รหัสผ่าน (Password)</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] mt-6"
                    >
                        {loading ? 'Processing...' : isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
                    </button>
                </form>

                <div className="mt-6 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-px bg-zinc-800 flex-1"></div>
                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">หรือ</span>
                        <div className="h-px bg-zinc-800 flex-1"></div>
                    </div>

                    <p className="text-zinc-400 text-center text-sm mt-2">
                        {isLogin ? 'ยังไม่มีบัญชีใช่หรือไม่?' : 'มีบัญชีอยู่แล้วใช่หรือไม่?'}
                    </p>

                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        type="button"
                        className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl transition-all border border-zinc-700 hover:border-zinc-500 shadow-lg mb-2"
                    >
                        {isLogin ? 'สมัครสมาชิกใหม่ที่นี่' : 'เข้าสู่ระบบบัญชีของคุณ'}
                    </button>
                </div>
            </div>
        </div>
    );
}
