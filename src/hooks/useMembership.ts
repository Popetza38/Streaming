import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useMembership(dramaId: string | undefined, platform: string) {
    const { user } = useAuth();
    const [hasPurchased, setHasPurchased] = useState(false);
    const [viewCount, setViewCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const checkAccess = useCallback(async () => {
        if (!user || !dramaId || !platform) {
            setHasPurchased(false);
            setViewCount(0);
            setLoading(false);
            return;
        }

        try {
            const token = await user.getIdToken();
            const res = await fetch(`/api/membership?dramaId=${encodeURIComponent(dramaId)}&platform=${encodeURIComponent(platform)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setHasPurchased(data.hasPurchased);
                setViewCount(data.viewCount);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [user, dramaId, platform]);

    useEffect(() => {
        checkAccess();
    }, [checkAccess]);

    const recordView = async (episodeNumber: number) => {
        if (!user || !dramaId || !platform) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ dramaId, episodeNumber, platform })
            });

            if (res.ok) {
                checkAccess();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const unlockDrama = async (price: number = 10) => {
        if (!user || !dramaId || !platform) return { success: false, error: 'Not logged in' };
        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/membership', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ dramaId, platform, price })
            });

            const data = await res.json();
            if (res.ok) {
                await checkAccess();
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    };

    return { hasPurchased, viewCount, loading, checkAccess, recordView, unlockDrama };
}
