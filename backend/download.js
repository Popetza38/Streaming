import axios from 'axios';
import { adminAuth, adminDb } from './firebase-admin.js';

export default async function handler(req, res) {
    const videoUrl = req.query.url;
    const filename = req.query.name || 'video.mp4';
    if (!videoUrl) return res.status(400).send('Missing url');

    // Authenticate and check VIP status
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const idToken = authHeader.split(' ')[1];
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const userDoc = await adminDb.collection('users').doc(uid).get();
        const userData = userDoc.data();

        const isVip = userData?.tier === 'vip' && (userData?.vipUntil || 0) > Date.now();
        if (!isVip) {
            return res.status(403).json({ error: 'VIP membership required for downloads' });
        }

        const fullUrl = `https://${videoUrl}`;

        try {
            if (videoUrl.includes('.m3u8')) {
                const manifestRes = await axios.get(fullUrl);
                let manifestText = manifestRes.data;

                // If master playlist, pick highest quality variant
                if (manifestText.includes('#EXT-X-STREAM-INF')) {
                    const lines = manifestText.split('\n');
                    let bestUrl = '';
                    let bestBandwidth = 0;
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (line.startsWith('#EXT-X-STREAM-INF')) {
                            const bwMatch = line.match(/BANDWIDTH=(\d+)/);
                            const bw = bwMatch ? parseInt(bwMatch[1]) : 0;
                            const nextLine = lines[i + 1]?.trim();
                            if (nextLine && !nextLine.startsWith('#') && bw > bestBandwidth) {
                                bestBandwidth = bw;
                                bestUrl = nextLine;
                            }
                        }
                    }
                    if (bestUrl) {
                        const baseUrl = videoUrl.substring(0, videoUrl.lastIndexOf('/') + 1);
                        const variantUrl = bestUrl.startsWith('http')
                            ? bestUrl
                            : `https://${baseUrl}${bestUrl}`;
                        const variantRes = await axios.get(variantUrl);
                        manifestText = variantRes.data;
                    }
                }

                // Parse segment URLs
                const lines = manifestText.split('\n');
                const baseUrl = videoUrl.substring(0, videoUrl.lastIndexOf('/') + 1);
                const segments = [];
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed && !trimmed.startsWith('#')) {
                        if (trimmed.startsWith('http')) {
                            segments.push(trimmed);
                        } else {
                            segments.push(`https://${baseUrl}${trimmed}`);
                        }
                    }
                }

                if (segments.length === 0) {
                    return res.status(400).send('No segments found');
                }

                res.setHeader('Content-Type', 'video/mp2t');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.setHeader('Access-Control-Allow-Origin', '*');

                const chunks = [];
                for (const segUrl of segments) {
                    try {
                        const segRes = await axios.get(segUrl, { responseType: 'arraybuffer' });
                        chunks.push(Buffer.from(segRes.data));
                    } catch {
                        // Skip failed segments
                    }
                }
                res.send(Buffer.concat(chunks));
            } else {
                const response = await axios.get(fullUrl, { responseType: 'arraybuffer' });
                res.setHeader('Content-Type', response.headers['content-type'] || 'video/mp4');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.send(Buffer.from(response.data));
            }
        } catch (err) {
            res.status(500).send('Download error');
        }
    } catch (err) {
        res.status(500).json({ error: 'Auth error' });
    }
}
