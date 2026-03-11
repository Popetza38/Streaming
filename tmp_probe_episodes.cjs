const axios = require('axios');
const fs = require('fs');

const BASE = 'https://captain.sapimu.au';
const TOKEN = '05fdfb98a531276ac6a449f9fd680123eb0ad40993ee76079d8a5e485bf7892d';

function getHeaders(ua) {
    return { 
        Authorization: `Bearer ${TOKEN}`, 
        'User-Agent': ua 
    };
}

async function probeEpisodes() {
    const results = {};
    console.log('Probing individual episodes inside https://captain.sapimu.au ...\n');

    // 1. DramaBox (We know this has dubs, let's look at the stream URL/data)
    try {
        console.log('Fetching DramaBox test episode...');
        // DramaBox ID 100084 (often used for testing)
        const res = await axios.get(`${BASE}/dramabox/api/v1/play/100084/1`, { headers: getHeaders('App/1.0') });
        const data = res.data?.data || {};
        results.dramabox_episode = {
            hasAudioLang: !!data.audioLang,
            audioLang: data.audioLang || data.lang || 'Not Specified',
            hasVideoUrl: !!data.url,
            rawFields: Object.keys(data)
        };
    } catch (e) { results.dramabox_episode = { error: e.message }; }

    // 2. FlexTV
    try {
        console.log('Fetching FlexTV test episode...');
        // FlexTV series 1199, episode 1
        const res = await axios.get(`${BASE}/flextv/api/v1/play/1199/1`, { headers: getHeaders('FlexTV-App/1.0') });
        const data = res.data?.data || {};
        results.flextv_episode = {
            hasAudioLang: !!data.audio_lang || !!data.lang,
            audioLang: data.audio_lang || data.lang || 'Not Specified',
            hasVideoUrl: !!data.play_url || !!data.url,
            rawFields: Object.keys(data)
        };
    } catch (e) { results.flextv_episode = { error: e.message }; }

    // 3. DramaBite
    try {
        console.log('Fetching DramaBite test episode...');
        const res = await axios.get(`${BASE}/dramabite/api/v1/play/304/1`, { headers: getHeaders('DramaBite-App/1.0') });
        const data = res.data?.data || res.data || {};
        results.dramabite_episode = {
            hasAudioLang: !!data.audio_lang || !!data.lang,
            audioLang: data.audio_lang || data.lang || 'Not Specified',
            rawFields: Object.keys(data)
        };
    } catch (e) { results.dramabite_episode = { error: e.message }; }

    // 4. ShortBox
    try {
        console.log('Fetching ShortBox test episode...');
        const res = await axios.get(`${BASE}/shortbox/api/play/33362/1`, { headers: getHeaders('ShortBox-App/1.0') });
        const data = res.data?.data || res.data || {};
        results.shortbox_episode = {
            hasAudioLang: !!data.audio_lang || !!data.lang,
            audioLang: data.audio_lang || data.lang || 'Not Specified',
            rawFields: Object.keys(data)
        };
    } catch (e) { results.shortbox_episode = { error: e.message }; }

    fs.writeFileSync('probe_episodes_results.json', JSON.stringify(results, null, 2));
    console.log('\nEpisode results saved to probe_episodes_results.json');
}

probeEpisodes();
