import { adminDb, authenticate } from './firebase-admin.js';

export default async function handler(req, res) {
    // CORS setup
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            const { dramaId } = req.query;
            if (!dramaId) return res.status(400).json({ error: 'Missing dramaId' });

            const reviewsSnap = await adminDb.collection('reviews')
                .where('dramaId', '==', dramaId)
                .orderBy('createdAt', 'desc')
                .get();

            let totalRating = 0;
            const reviews = [];

            reviewsSnap.forEach(doc => {
                const data = doc.data();
                reviews.push({ id: doc.id, ...data });
                totalRating += data.rating || 0;
            });

            const averageRating = reviews.length > 0 ? (totalRating / reviews.length) : 0;

            return res.status(200).json({
                reviews,
                stats: {
                    average: averageRating,
                    total: reviews.length
                }
            });
        }

        if (req.method === 'POST') {
            const decodedToken = await authenticate(req);
            if (!decodedToken) return res.status(401).json({ error: 'Unauthorized' });

            const { dramaId, rating, comment } = req.body;
            if (!dramaId || typeof rating !== 'number') {
                return res.status(400).json({ error: 'Missing dramaId or rating' });
            }

            if (rating < 1 || rating > 5) {
                return res.status(400).json({ error: 'Rating must be between 1 and 5' });
            }

            const uid = decodedToken.uid;

            // Fetch user profile info to attach to review
            const userDoc = await adminDb.collection('users').doc(uid).get();
            const userData = userDoc.exists ? userDoc.data() : {};
            const username = userData.username || decodedToken.email?.split('@')[0] || 'User';
            const avatar = userData.avatar || decodedToken.picture || '';

            const reviewId = `${dramaId}_${uid}`;
            const reviewRef = adminDb.collection('reviews').doc(reviewId);

            const reviewData = {
                dramaId,
                userId: uid,
                username,
                avatar,
                rating,
                comment: comment || '',
                updatedAt: Date.now()
            };

            const doc = await reviewRef.get();
            if (!doc.exists) {
                reviewData.createdAt = Date.now();
            }

            await reviewRef.set(reviewData, { merge: true });

            return res.status(200).json({ success: true, review: reviewData });
        }

        if (req.method === 'DELETE') {
            const decodedToken = await authenticate(req);
            if (!decodedToken) return res.status(401).json({ error: 'Unauthorized' });

            const { dramaId } = req.body;
            if (!dramaId) return res.status(400).json({ error: 'Missing dramaId' });

            const uid = decodedToken.uid;

            // Check if admin is deleting or user is deleting their own
            const userDoc = await adminDb.collection('users').doc(uid).get();
            const isAdmin = userDoc.exists && userDoc.data().role === 'admin';

            const { targetUserId } = req.body; // For admin deleting someone else's review
            const reviewUserId = isAdmin && targetUserId ? targetUserId : uid;

            const reviewId = `${dramaId}_${reviewUserId}`;
            await adminDb.collection('reviews').doc(reviewId).delete();

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Reviews API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
