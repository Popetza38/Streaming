import { adminAuth, adminDb } from './firebase-admin.js';

async function authenticate(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    try {
        return await adminAuth.verifyIdToken(authHeader.split(' ')[1]);
    } catch {
        return null;
    }
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const decodedToken = await authenticate(req);
    if (!decodedToken) return res.status(401).json({ error: 'Unauthorized' });

    // Check if admin
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    if (userData.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    try {
        if (req.method === 'GET') {
            const { type } = req.query;

            if (type === 'stats') {
                const usersSnap = await adminDb.collection('users').get();
                const purchasesSnap = await adminDb.collection('purchases').get();
                const paymentsSnap = await adminDb.collection('payments').where('status', '==', 'approved').get();

                const now = new Date();
                const last7Days = [...Array(7)].map((_, i) => {
                    const d = new Date();
                    d.setDate(now.getDate() - i);
                    return d.toISOString().split('T')[0];
                }).reverse();

                const stats = {
                    totalUsers: usersSnap.size,
                    totalPurchases: purchasesSnap.size,
                    totalRevenue: paymentsSnap.docs.reduce((sum, doc) => sum + (Number(doc.data().amount) || 0), 0),
                    platformStats: {},
                    revenueTrend: last7Days.map(date => ({ date, amount: 0 })),
                    userTrend: last7Days.map(date => ({ date, count: 0 }))
                };

                purchasesSnap.docs.forEach(doc => {
                    const p = doc.data().platform || 'unknown';
                    stats.platformStats[p] = (stats.platformStats[p] || 0) + 1;
                });

                // Calculate Revenue Trend
                paymentsSnap.docs.forEach(doc => {
                    const data = doc.data();
                    const d = new Date(data.timestamp).toISOString().split('T')[0];
                    const trend = stats.revenueTrend.find(t => t.date === d);
                    if (trend) trend.amount += (Number(data.amount) || 0);
                });

                // Calculate User Trend
                usersSnap.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.createdAt) {
                        const d = new Date(data.createdAt).toISOString().split('T')[0];
                        const trend = stats.userTrend.find(t => t.date === d);
                        if (trend) trend.count += 1;
                    }
                });

                return res.status(200).json(stats);
            }

            if (type === 'users') {
                const usersSnapshot = await adminDb.collection('users').orderBy('createdAt', 'desc').limit(500).get();
                const users = usersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                return res.status(200).json(users);
            }

            if (type === 'purchases') {
                const purchasesSnapshot = await adminDb.collection('purchases').orderBy('grantedAt', 'desc').get();
                const purchases = purchasesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                return res.status(200).json(purchases);
            }

            if (type === 'settings') {
                const settingsDoc = await adminDb.collection('settings').doc('global').get();
                const settings = settingsDoc.exists ? settingsDoc.data() : {
                    welcomeBonus: 50,
                    maintenanceMode: false,
                    announcement: ""
                };
                return res.status(200).json(settings);
            }

            if (type === 'dramas') {
                const dramasSnap = await adminDb.collection('dramas').get();
                const dramas = dramasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                return res.status(200).json(dramas);
            }

            if (type === 'blacklist') {
                const blacklistSnap = await adminDb.collection('ip_blacklist').get();
                const blacklist = blacklistSnap.docs.map(doc => ({ ip: doc.id, ...doc.data() }));
                return res.status(200).json(blacklist);
            }

            if (type === 'carousel') {
                const carouselSnap = await adminDb.collection('carousel').orderBy('order', 'asc').get();
                const carouselItems = carouselSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                return res.status(200).json(carouselItems);
            }

            if (type === 'logs') {
                const logsSnap = await adminDb.collection('admin_logs').orderBy('timestamp', 'desc').limit(200).get();
                const logs = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                return res.status(200).json(logs);
            }
        }

        if (req.method === 'POST') {
            // Helper for logging
            const logAction = async (actionName, targetId, details = {}) => {
                try {
                    await adminDb.collection('admin_logs').add({
                        action: actionName,
                        adminUid: decodedToken.uid,
                        adminEmail: decodedToken.email,
                        targetId,
                        details,
                        timestamp: Date.now()
                    });
                } catch (e) {
                    console.error('Failed to log admin action:', e);
                }
            };

            const { action, userId, dramaId, platform, role, coins, tier, settings, dramaData, ip, reason } = req.body;

            if (action === 'set_role') {
                if (!userId || !role) return res.status(400).json({ error: 'Missing userId or role' });
                await adminDb.collection('users').doc(userId).update({ role });
                await logAction('set_role', userId, { role });
                return res.status(200).json({ success: true });
            }

            if (action === 'update_coins') {
                if (!userId || coins === undefined) return res.status(400).json({ error: 'Missing userId or coins' });
                await adminDb.collection('users').doc(userId).update({ coins: parseInt(coins) });
                await logAction('update_coins', userId, { newCoins: parseInt(coins) });
                return res.status(200).json({ success: true });
            }

            if (action === 'set_tier') {
                if (!userId || !tier) return res.status(400).json({ error: 'Missing userId or tier' });
                await adminDb.collection('users').doc(userId).update({ tier });
                await logAction('set_tier', userId, { tier });
                return res.status(200).json({ success: true });
            }

            if (action === 'revoke_access') {
                const { purchaseId } = req.body;
                if (!purchaseId) return res.status(400).json({ error: 'Missing purchaseId' });
                await adminDb.collection('purchases').doc(purchaseId).delete();
                await logAction('revoke_access', purchaseId);
                return res.status(200).json({ success: true });
            }

            if (action === 'update_settings') {
                if (!settings) return res.status(400).json({ error: 'Missing settings' });
                await adminDb.collection('settings').doc('global').set(settings, { merge: true });
                await logAction('update_settings', 'global');
                return res.status(200).json({ success: true });
            }

            if (action === 'upsert_drama') {
                if (!dramaId || !dramaData) return res.status(400).json({ error: 'Missing dramaId or dramaData' });
                await adminDb.collection('dramas').doc(dramaId).set(dramaData, { merge: true });
                await logAction('upsert_drama', dramaId, { title: dramaData.title });
                return res.status(200).json({ success: true });
            }

            if (action === 'delete_drama') {
                if (!dramaId) return res.status(400).json({ error: 'Missing dramaId' });
                await adminDb.collection('dramas').doc(dramaId).delete();
                await logAction('delete_drama', dramaId);
                return res.status(200).json({ success: true });
            }

            if (action === 'upsert_carousel') {
                const { carouselId, carouselData } = req.body;
                if (!carouselData) return res.status(400).json({ error: 'Missing carouselData' });
                const docRef = carouselId ? adminDb.collection('carousel').doc(carouselId) : adminDb.collection('carousel').doc();
                await docRef.set({ ...carouselData, updatedAt: Date.now(), updatedBy: decodedToken.uid }, { merge: true });
                await logAction('upsert_carousel', docRef.id, { title: carouselData.title });
                return res.status(200).json({ success: true, id: docRef.id });
            }

            if (action === 'delete_carousel') {
                const { carouselId } = req.body;
                if (!carouselId) return res.status(400).json({ error: 'Missing carouselId' });
                await adminDb.collection('carousel').doc(carouselId).delete();
                await logAction('delete_carousel', carouselId);
                return res.status(200).json({ success: true });
            }

            if (action === 'toggle_blacklist') {
                if (!ip) return res.status(400).json({ error: 'Missing ip' });
                const docRef = adminDb.collection('ip_blacklist').doc(ip.replace(/\./g, '_'));
                const doc = await docRef.get();
                if (doc.exists) {
                    await docRef.delete();
                    await logAction('unban_ip', ip);
                } else {
                    await docRef.set({ bannedAt: new Date().toISOString(), reason: reason || 'Violation' });
                    await logAction('ban_ip', ip, { reason });
                }
                return res.status(200).json({ success: true });
            }

            if (action === 'delete_user') {
                if (!userId) return res.status(400).json({ error: 'Missing userId' });

                // 1. Delete from Auth (wrapped in try/catch to avoid blocking if user only exists in Firestore)
                try {
                    await adminAuth.deleteUser(userId);
                } catch (e) {
                    console.warn(`Auth user ${userId} not found or already deleted:`, e.code);
                }

                // 2. Delete all user's purchases
                const purchases = await adminDb.collection('purchases').where('userId', '==', userId).get();
                const batch = adminDb.batch();
                purchases.forEach(doc => batch.delete(doc.ref));

                // 3. Delete from Firestore
                batch.delete(adminDb.collection('users').doc(userId));

                await batch.commit();
                await logAction('delete_user', userId);
                return res.status(200).json({ success: true });
            }

            if (action === 'approve_payment') {
                const { paymentId, uid, amount } = req.body;
                if (!paymentId || !uid) return res.status(400).json({ error: 'Missing paymentId or uid' });

                const coinsToAdd = (amount || 0) * 10; // 1 baht = 10 coins
                const batch = adminDb.batch();

                // Update payment status
                batch.update(adminDb.collection('payments').doc(paymentId), {
                    status: 'approved',
                    approvedAt: Date.now(),
                    approvedBy: decodedToken.uid
                });

                // Add coins to user
                const userDoc = await adminDb.collection('users').doc(uid).get();
                const currentCoins = userDoc.exists ? (userDoc.data().coins || 0) : 0;
                batch.update(adminDb.collection('users').doc(uid), {
                    coins: currentCoins + coinsToAdd
                });

                await batch.commit();
                return res.status(200).json({ success: true, coinsAdded: coinsToAdd });
            }

            if (action === 'reject_payment') {
                const { paymentId } = req.body;
                if (!paymentId) return res.status(400).json({ error: 'Missing paymentId' });

                await adminDb.collection('payments').doc(paymentId).update({
                    status: 'rejected',
                    rejectedAt: Date.now(),
                    rejectedBy: decodedToken.uid
                });
                return res.status(200).json({ success: true });
            }

            if (action === 'create_coupon') {
                const { code, rewardCoins, maxUses, expiry } = req.body;
                if (!code || !rewardCoins) return res.status(400).json({ error: 'Missing code or rewardCoins' });

                await adminDb.collection('coupons').doc(code).set({
                    rewardCoins: parseInt(rewardCoins),
                    maxUses: parseInt(maxUses) || 100,
                    usedCount: 0,
                    expiry: expiry ? new Date(expiry).getTime() : null,
                    createdAt: Date.now(),
                    createdBy: decodedToken.uid
                });
                return res.status(200).json({ success: true });
            }
        } // End of POST block

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Admin API Error:', error);
        res.status(500).json({ error: error.message });
    }
}
