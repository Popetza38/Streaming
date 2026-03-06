import { adminAuth, adminDb } from './firebase-admin.js';

export default async function handler(req, res) {
    // CORS setup
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid token' });
    }

    const idToken = authHeader.split(' ')[1];
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        if (req.method === 'GET') {
            const { type } = req.query;

            if (type === 'watchlist') {
                const snapshot = await adminDb.collection('users').doc(uid).collection('watchlist').get();
                const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                return res.status(200).json(list);
            }

            if (type === 'history') {
                const snapshot = await adminDb.collection('users').doc(uid).collection('history').orderBy('watchedAt', 'desc').limit(20).get();
                const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                return res.status(200).json(history);
            }

            return res.status(400).json({ error: 'Invalid type' });
        }

        if (req.method === 'POST') {
            const { action, dramaId, dramaData } = req.body;

            if (action === 'add_watchlist') {
                if (!dramaId) return res.status(400).json({ error: 'Missing dramaId' });
                await adminDb.collection('users').doc(uid).collection('watchlist').doc(dramaId).set({
                    ...dramaData,
                    addedAt: new Date().toISOString()
                });
                return res.status(200).json({ success: true });
            }

            if (action === 'remove_watchlist') {
                if (!dramaId) return res.status(400).json({ error: 'Missing dramaId' });
                await adminDb.collection('users').doc(uid).collection('watchlist').doc(dramaId).delete();
                return res.status(200).json({ success: true });
            }

            if (action === 'update_history') {
                if (!dramaId) return res.status(400).json({ error: 'Missing dramaId' });
                await adminDb.collection('users').doc(uid).collection('history').doc(dramaId).set({
                    ...dramaData,
                    watchedAt: new Date().toISOString()
                });
                return res.status(200).json({ success: true });
            }

            if (action === 'buy_vip') {
                const { planDurationDays, price } = req.body;
                if (!planDurationDays || !price) return res.status(400).json({ error: 'Missing plan details' });

                try {
                    const result = await adminDb.runTransaction(async (transaction) => {
                        const userRef = adminDb.collection('users').doc(uid);
                        const userDoc = await transaction.get(userRef);
                        if (!userDoc.exists) throw new Error('User not found');

                        const userData = userDoc.data();
                        const currentCoins = userData.coins || 0;

                        if (currentCoins < price) {
                            throw new Error('Insufficient coins');
                        }

                        // Calculate new expiry
                        const now = Date.now();
                        const currentExpiry = (userData.tier === 'vip' && userData.vipUntil > now) ? userData.vipUntil : now;
                        const newExpiry = currentExpiry + (planDurationDays * 24 * 60 * 60 * 1000);

                        transaction.update(userRef, {
                            coins: currentCoins - price,
                            tier: 'vip',
                            vipUntil: newExpiry
                        });

                        // Log purchase
                        const purchaseRef = adminDb.collection('purchases').doc();
                        transaction.set(purchaseRef, {
                            userId: uid,
                            type: 'vip_subscription',
                            durationDays: planDurationDays,
                            price,
                            purchasedAt: new Date().toISOString()
                        });

                        return {
                            success: true,
                            tier: 'vip',
                            vipUntil: newExpiry,
                            coins: currentCoins - price
                        };
                    });
                    return res.status(200).json(result);
                } catch (e) {
                    return res.status(400).json({ error: e.message });
                }
            }

            return res.status(400).json({ error: 'Invalid action' });
        }

    } catch (err) {
        console.error('User data error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
