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
    const uid = decodedToken.uid;

    try {
        if (req.method === 'POST') {
            const { dramaId, episodeNumber, platform } = req.body;

            if (!dramaId || !episodeNumber || !platform) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Check if record already exists in Firestore
            const historyRef = adminDb.collection('history');
            const snapshot = await historyRef
                .where('userId', '==', uid)
                .where('dramaId', '==', dramaId)
                .where('episode', '==', episodeNumber)
                .where('platform', '==', platform)
                .limit(1)
                .get();

            if (snapshot.empty) {
                await historyRef.add({
                    userId: uid,
                    dramaId,
                    episode: episodeNumber,
                    platform,
                    createdAt: new Date().toISOString()
                });
            }

            return res.status(200).json({ success: true });
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('History API Error:', error);
        res.status(500).json({ error: error.message });
    }
}
