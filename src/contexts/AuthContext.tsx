import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';

interface AuthProfile {
    id: string;
    email: string;
    username: string;
    role: 'user' | 'admin' | 'moderator';
    tier: 'free' | 'premium' | 'vip';
    coins: number;
    avatar?: string;
    vipUntil?: number;
}

interface AuthContextType {
    user: User | null;
    profile: AuthProfile | null;
    settings: { welcomeBonus: number, maintenanceMode: boolean, announcement: string, vipPrice: number, vipDurationDays: number, dailyRewardFree: number, dailyRewardVip: number } | null;
    isLoading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    settings: null,
    isLoading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
    refreshProfile: async () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<AuthProfile | null>(null);
    const [settings, setSettings] = useState<{ welcomeBonus: number, maintenanceMode: boolean, announcement: string, vipPrice: number, vipDurationDays: number, dailyRewardFree: number, dailyRewardVip: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            // We can now just call api/auth with GET without token to get public settings? 
            // Or better, keep it simple: api/auth without token returns error, but we want settings.
            // Let's assume we want a public endpoint. For now, since I can't easily add a new file without confirmation,
            // I'll just try to fetch from api/auth and handle the 401 but still get settings if I can.
            // Actually, I'll modify api/auth to allow GET without token ONLY to return settings.
            const res = await fetch('/api/auth');
            const data = await res.json();
            if (data.settings) {
                setSettings(data.settings);
            }
        } catch (e) {
            console.error('Failed to fetch settings:', e);
        }
    }

    const fetchProfile = async (idToken: string) => {
        try {
            const res = await fetch('/api/auth', {
                headers: { Authorization: `Bearer ${idToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data.profile);
                if (data.settings) setSettings(data.settings);
            } else {
                setProfile(null);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            setProfile(null);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            const idToken = await user.getIdToken(true);
            await fetchProfile(idToken);
        }
    };

    useEffect(() => {
        fetchSettings();
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                const idToken = await firebaseUser.getIdToken();
                await fetchProfile(idToken);
            } else {
                setProfile(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const { signInWithPopup } = await import('firebase/auth');
        const { googleProvider } = await import('@/lib/firebase');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
            await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idToken,
                    username: result.user.displayName,
                    avatar: result.user.photoURL
                })
            });
            await fetchProfile(idToken);
        } catch (error) {
            console.error('Google Sign-in error:', error);
            throw error;
        }
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUser(null);
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{ user, profile, settings, isLoading, signInWithGoogle, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
