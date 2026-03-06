import express from 'express';
import cors from 'cors';

// Import our existing handlers as standard modules or copy logic
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

const app = express();

app.use(cors());
app.use(express.json());

// Helper to adapt Next.js/Vercel serverless (req, res) to Express
const createAdaptor = (handler) => async (req, res) => {
    try {
        await handler(req, res);
    } catch (err) {
        console.error('Handler error:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

// Route definitions based on existing files
app.all('/api/proxy', createAdaptor(proxyHandler));
app.all('/api/admin', createAdaptor(adminHandler));
app.all('/api/auth', createAdaptor(authHandler));
app.all('/api/carousel', createAdaptor(carouselHandler));
app.all('/api/coupons', createAdaptor(couponsHandler));
app.all('/api/debug', createAdaptor(debugHandler));
app.all('/api/download', createAdaptor(downloadHandler));
app.all('/api/history', createAdaptor(historyHandler));
app.all('/api/membership', createAdaptor(membershipHandler));
app.all('/api/payments', createAdaptor(paymentsHandler));
app.all('/api/reviews', createAdaptor(reviewsHandler));
app.all('/api/sheets', createAdaptor(sheetsHandler));
app.all('/api/user', createAdaptor(userHandler));
app.all('/api/video', createAdaptor(videoHandler));

// Catch-all route to let the proxy handle dynamic frontend /api routes
app.all('/api/*', createAdaptor(proxyHandler));

export default app;
