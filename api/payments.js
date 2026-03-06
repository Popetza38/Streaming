import { adminDb, adminAuth } from './firebase-admin.js';

export default async function handler(req, res) {
    const { method } = req;

    if (method === 'GET') {
        // Admin only: list all payments for approval
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

            const token = authHeader.split('Bearer ')[1];
            const decodedToken = await adminAuth.verifyIdToken(token);

            const userRef = adminDb.collection('users').doc(decodedToken.uid);
            const userDoc = await userRef.get();

            if (!userDoc.exists || userDoc.data().role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const snapshot = await adminDb.collection('payments').orderBy('timestamp', 'desc').get();
            const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return res.status(200).json(payments);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (method === 'POST') {
        // User: submit a new payment slip
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

            const token = authHeader.split('Bearer ')[1];
            const decodedToken = await adminAuth.verifyIdToken(token);

            const { amount, slipUrl, method: payMethod } = req.body;

            if (!amount || !slipUrl) {
                return res.status(400).json({ error: 'Missing payment details' });
            }

            const paymentData = {
                uid: decodedToken.uid,
                amount: Number(amount),
                slipUrl,
                method: payMethod || 'promptpay',
                status: 'pending',
                timestamp: Date.now(),
                username: decodedToken.name || decodedToken.email
            };

            const docRef = await adminDb.collection('payments').add(paymentData);
            return res.status(200).json({ success: true, id: docRef.id });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
