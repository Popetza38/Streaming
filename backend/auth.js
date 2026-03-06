import { adminAuth, adminDb } from './firebase-admin.js';

export default async function handler(req, res) {
    // CORS setup
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // --- GET: Verify Firebase Token and Return Profile ---
        if (req.method === 'GET') {
            const authHeader = req.headers.authorization;

            // Public Settings fetching (No token required)
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                // Fetch global settings (maintenance mode, announcement, etc.)
                let globalSettings = { welcomeBonus: 50, maintenanceMode: false, announcement: "" };
                try {
                    const settingsDoc = await adminDb.collection('settings').doc('global').get();
                    if (settingsDoc.exists) {
                        globalSettings = settingsDoc.data();
                    }
                } catch (e) {
                    console.error('Error fetching settings (public):', e);
                }
                return res.status(200).json({ settings: globalSettings });
            }

            const idToken = authHeader.split(' ')[1];
            try {
                // Verify the ID token using Firebase Admin
                const decodedToken = await adminAuth.verifyIdToken(idToken);
                const uid = decodedToken.uid;
                const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

                // Check Blacklist
                if (ip) {
                    const blacklistDoc = await adminDb.collection('ip_blacklist').doc(ip.replace(/\./g, '_')).get();
                    if (blacklistDoc.exists) {
                        return res.status(403).json({ error: 'Your IP is blacklisted' });
                    }
                }

                // Get additional user data from Firestore
                const userDoc = await adminDb.collection('users').doc(uid).get();
                const userData = userDoc.exists ? userDoc.data() : {};

                // Fetch global settings (maintenance mode, announcement, etc.)
                let globalSettings = { welcomeBonus: 50, maintenanceMode: false, announcement: "" };
                try {
                    const settingsDoc = await adminDb.collection('settings').doc('global').get();
                    if (settingsDoc.exists) {
                        globalSettings = settingsDoc.data();
                    }
                } catch (e) {
                    console.error('Error fetching settings:', e);
                }

                return res.status(200).json({
                    user: {
                        id: uid,
                        email: decodedToken.email,
                    },
                    profile: {
                        id: uid,
                        email: decodedToken.email,
                        username: userData.username || (decodedToken.email ? decodedToken.email.split('@')[0] : 'Guest'),
                        role: userData.role || 'user',
                        tier: userData.tier || 'free',
                        coins: userData.coins || 0,
                        avatar: userData.avatar || decodedToken.picture || ''
                    },
                    settings: globalSettings
                });
            } catch (err) {
                console.error('Token verification error:', err);
                return res.status(401).json({ error: 'Invalid or expired token' });
            }
        }

        // --- POST: Sync User Profile to Firestore (called after frontend auth) ---
        if (req.method === 'POST') {
            const { idToken, username, avatar } = req.body;

            if (!idToken) {
                return res.status(400).json({ error: 'ID Token is required' });
            }

            try {
                const decodedToken = await adminAuth.verifyIdToken(idToken);
                const uid = decodedToken.uid;
                const email = decodedToken.email;
                const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

                // Check Blacklist
                if (ip) {
                    const blacklistDoc = await adminDb.collection('ip_blacklist').doc(ip.replace(/\./g, '_')).get();
                    if (blacklistDoc.exists) {
                        return res.status(403).json({ error: 'Your IP is blacklisted' });
                    }
                }

                const userRef = adminDb.collection('users').doc(uid);
                const userDoc = await userRef.get();

                if (!userDoc.exists) {
                    // Fetch dynamic welcome bonus
                    const settingsDoc = await adminDb.collection('settings').doc('global').get();
                    const settings = settingsDoc.exists ? settingsDoc.data() : { welcomeBonus: 50 };

                    // Anti-Abuse: Check if this IP has already registered
                    let initialCoins = settings.welcomeBonus || 0;
                    if (ip) {
                        const ipRecordRef = adminDb.collection('reg_ips').doc(ip.replace(/\./g, '_'));
                        const ipDoc = await ipRecordRef.get();
                        if (ipDoc.exists) {
                            initialCoins = 0; // Already registered from this IP
                        } else {
                            await ipRecordRef.set({ registeredAt: new Date().toISOString(), uid });
                        }
                    }

                    // Create basic profile for new users
                    await userRef.set({
                        email: email,
                        username: username || (email ? email.split('@')[0] : 'Guest'),
                        role: 'user',
                        tier: 'free',
                        coins: initialCoins,
                        avatar: avatar || decodedToken.picture || '',
                        createdAt: new Date().toISOString(),
                        regIp: ip || 'unknown'
                    });
                } else {
                    // Update metadata if it changed
                    const updates = {};
                    if (username && !userDoc.data().username) updates.username = username;
                    if (avatar && !userDoc.data().avatar) updates.avatar = avatar;

                    if (Object.keys(updates).length > 0) {
                        await userRef.update(updates);
                    }
                }

                return res.status(200).json({ message: 'Profile synced successfully' });
            } catch (err) {
                console.error('Profile sync error:', err);
                return res.status(500).json({ error: 'Failed to sync profile' });
            }
        }

        // --- PATCH: Update User Profile or Password ---
        if (req.method === 'PATCH') {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Missing or invalid token' });
            }

            const idToken = authHeader.split(' ')[1];
            const { username, avatar, newPassword } = req.body;

            try {
                const decodedToken = await adminAuth.verifyIdToken(idToken);
                const uid = decodedToken.uid;

                const updates = {};
                const profileUpdates = {};

                if (username) profileUpdates.username = username;
                if (avatar) profileUpdates.avatar = avatar;

                // Update Firestore profile
                if (Object.keys(profileUpdates).length > 0) {
                    await adminDb.collection('users').doc(uid).update(profileUpdates);
                }

                // Update Firebase Auth (Password/DisplayName/PhotoURL)
                const authUpdates = {};
                if (newPassword) authUpdates.password = newPassword;
                if (username) authUpdates.displayName = username;
                if (avatar) authUpdates.photoURL = avatar;

                if (Object.keys(authUpdates).length > 0) {
                    await adminAuth.updateUser(uid, authUpdates);
                }

                return res.status(200).json({ message: 'Profile updated successfully' });
            } catch (err) {
                console.error('Profile update error:', err);
                return res.status(500).json({ error: 'Failed to update profile' });
            }
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Auth API Error:', error);
        res.status(500).json({ error: error.message });
    }
}
