import { adminAuth, adminDb } from './firebase-admin.js';

const toMs = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    if (val.toMillis) return val.toMillis();
    if (val._seconds) return val._seconds * 1000;
    return new Date(val).getTime() || 0;
};

// Helper to authenticate request
async function authenticate(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    try {
        const token = authHeader.split(' ')[1];
        return await adminAuth.verifyIdToken(token);
    } catch {
        return null;
    }
}

export default async function handler(req, res) {
    // CORS setup
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const decodedToken = await authenticate(req);
    if (!decodedToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const uid = decodedToken.uid;

    try {
        if (req.method === 'GET') {
            const { dramaId, platform } = req.query;

            if (!dramaId || !platform) {
                return res.status(400).json({ error: 'dramaId and platform are required' });
            }

            // Check User VIP Status
            const userDoc = await adminDb.collection('users').doc(uid).get();
            const userData = userDoc.exists ? userDoc.data() : {};
            const vipUntilMs = toMs(userData.vipUntil);
            const isVip = userData.tier === 'vip' && (vipUntilMs === 0 || vipUntilMs > Date.now());

            let hasPurchased = false;

            if (isVip) {
                hasPurchased = true;
            } else {
                // Check Purchases in Firestore
                const purchaseSnapshot = await adminDb.collection('purchases')
                    .where('userId', '==', uid)
                    .where('dramaId', '==', dramaId)
                    .where('platform', '==', platform)
                    .limit(1)
                    .get();

                hasPurchased = !purchaseSnapshot.empty;
            }

            // Count View History in Firestore
            const historySnapshot = await adminDb.collection('history')
                .where('userId', '==', uid)
                .where('dramaId', '==', dramaId)
                .where('platform', '==', platform)
                .get();

            const viewCount = historySnapshot.size;

            return res.status(200).json({ hasPurchased, viewCount });
        }

        if (req.method === 'POST') {
            const { dramaId, platform, price = 10 } = req.body;

            if (!dramaId || !platform) {
                return res.status(400).json({ error: 'dramaId and platform are required' });
            }

            const userRef = adminDb.collection('users').doc(uid);

            const result = await adminDb.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists) throw new Error('User not found');

                const userData = userDoc.data();
                const isVip = userData.tier === 'vip' && (!userData.vipUntil || userData.vipUntil > Date.now());

                if (isVip) {
                    return { success: true, remainingCoins: userData.coins || 0, message: 'VIP check' };
                }

                const currentCoins = userData.coins || 0;

                if (currentCoins < price) {
                    throw new Error('Insufficient coins');
                }

                // Deduct coins
                transaction.update(userRef, {
                    coins: currentCoins - price
                });

                // Add to purchases
                const purchaseRef = adminDb.collection('purchases').doc();
                transaction.set(purchaseRef, {
                    userId: uid,
                    dramaId,
                    platform,
                    grantedAt: new Date().toISOString(),
                    type: 'unlock',
                    price
                });

                return { success: true, remainingCoins: currentCoins - price };
            });

            return res.status(200).json(result);
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Membership API Error:', error);
        res.status(500).json({ error: error.message });
    }
}
