import { adminDb } from './firebase-admin.js';

export default async function handler(req, res) {
    // CORS setup
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        try {
            const carouselSnap = await adminDb.collection('carousel').orderBy('order', 'asc').get();
            const carouselItems = carouselSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return res.status(200).json(carouselItems);
        } catch (error) {
            console.error('Error fetching carousel:', error);
            return res.status(500).json({ error: 'Failed to fetch carousel' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
