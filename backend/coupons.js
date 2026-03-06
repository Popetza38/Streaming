import { adminDb, adminAuth } from './firebase-admin.js';

export default async function handler(req, res) {
    const { method } = req;

    if (method === 'POST') {
        const { action, code } = req.body;

        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

            const token = authHeader.split('Bearer ')[1];
            const decodedToken = await adminAuth.verifyIdToken(token);

            if (action === 'redeem') {
                if (!code) return res.status(400).json({ error: 'Code is required' });

                const couponRef = adminDb.collection('coupons').doc(code);
                const couponDoc = await couponRef.get();

                if (!couponDoc.exists) {
                    return res.status(404).json({ error: 'Invalid coupon code' });
                }

                const couponData = couponDoc.data();
                if (couponData.usedCount >= couponData.maxUses) {
                    return res.status(400).json({ error: 'Coupon has reached maximum uses' });
                }

                if (couponData.expiry && couponData.expiry < Date.now()) {
                    return res.status(400).json({ error: 'Coupon has expired' });
                }

                // Check if user already used this coupon
                const userHistory = await adminDb.collection('users').doc(decodedToken.uid).collection('coupons').doc(code).get();
                if (userHistory.exists) {
                    return res.status(400).json({ error: 'You have already redeemed this coupon' });
                }

                // Apply coupon
                const batch = adminDb.batch();
                const userRef = adminDb.collection('users').doc(decodedToken.uid);

                batch.update(userRef, {
                    coins: (await userRef.get()).data().coins + (couponData.rewardCoins || 0)
                });

                batch.update(couponRef, {
                    usedCount: couponData.usedCount + 1
                });

                batch.set(userRef.collection('coupons').doc(code), {
                    redeemedAt: Date.now()
                });

                await batch.commit();

                return res.status(200).json({
                    success: true,
                    reward: couponData.rewardCoins,
                    message: `Successfully redeemed ${couponData.rewardCoins} coins!`
                });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // Admin only actions
    if (method === 'GET' || method === 'PUT' || method === 'DELETE') {
        // Admin check logic similar to payments.js
        // ...
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
