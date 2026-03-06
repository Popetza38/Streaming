import 'dotenv/config';

// Import our existing handlers
import proxyHandler from '../backend/proxy.js';
import adminHandler from '../backend/admin.js';
import authHandler from '../backend/auth.js';
import carouselHandler from '../backend/carousel.js';
import couponsHandler from '../backend/coupons.js';
import debugHandler from '../backend/debug.js';
import downloadHandler from '../backend/download.js';
import historyHandler from '../backend/history.js';
import membershipHandler from '../backend/membership.js';
import paymentsHandler from '../backend/payments.js';
import reviewsHandler from '../backend/reviews.js';
import sheetsHandler from '../backend/sheets.js';
import userHandler from '../backend/user.js';
import videoHandler from '../backend/video.js';

export default async function handler(req, res) {
    // Global CORS Handling
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Determine the route
    // req.url in Vercel will look like "/api/auth?foo=bar" or "/api/proxy"
    const path = req.url.split('?')[0];

    try {
        if (path.startsWith('/api/admin')) return await adminHandler(req, res);
        if (path.startsWith('/api/auth')) return await authHandler(req, res);
        if (path.startsWith('/api/carousel')) return await carouselHandler(req, res);
        if (path.startsWith('/api/coupons')) return await couponsHandler(req, res);
        if (path.startsWith('/api/debug')) return await debugHandler(req, res);
        if (path.startsWith('/api/download')) return await downloadHandler(req, res);
        if (path.startsWith('/api/history')) return await historyHandler(req, res);
        if (path.startsWith('/api/membership')) return await membershipHandler(req, res);
        if (path.startsWith('/api/payments')) return await paymentsHandler(req, res);
        if (path.startsWith('/api/reviews')) return await reviewsHandler(req, res);
        if (path.startsWith('/api/sheets')) return await sheetsHandler(req, res);
        if (path.startsWith('/api/user')) return await userHandler(req, res);
        if (path.startsWith('/api/video')) return await videoHandler(req, res);

        // Fallback: anything that doesn't match a specific handler goes to the proxy handler
        // This allows /api/dramas, /api/foryou, /api/search to hit the proxy as designed.
        return await proxyHandler(req, res);
    } catch (err) {
        console.error(`[API Router Error] on path ${path}:`, err);
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Internal Server Error', message: err.message });
        }
    }
}
