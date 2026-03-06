const axios = require('axios');
const BASE = 'https://captain.sapimu.au';
const TOKEN = '05fdfb98a531276ac6a449f9fd680123eb0ad40993ee76079d8a5e485bf7892d';
const headers = { Authorization: `Bearer ${TOKEN}`, 'User-Agent': 'App/1.0' };

async function probe() {
    // DramaBox - rank
    try {
        const res = await axios.get(`${BASE}/dramabox/api/v1/rank/1?lang=th`, { headers });
        const list = res.data?.data?.data || res.data?.data || [];
        const item = Array.isArray(list) ? list[0] : null;
        if (item) {
            console.log('--- DramaBox ---');
            console.log('Keys:', Object.keys(item));
            console.log('Language fields:', item.language, item.lang, item.dubbing, item.audioLang, item.tagDetails?.map(t => t.tagName));
        }
    } catch (e) { console.log('DramaBox error:', e.message); }

    // ShortMax
    try {
        const res = await axios.get(`${BASE}/shortmax/api/v1/foryou?lang=th&platform=shortmax`, { headers });
        const list = res.data?.data || [];
        const item = Array.isArray(list) && list.length > 0 ? (list[0].items ? list[0].items[0] : list[0]) : null;
        if (item) {
            console.log('\n--- ShortMax ---');
            console.log('Keys:', Object.keys(item));
            console.log('Language fields:', item.language, item.lang, item.dubbing, item.audioLang);
        }
    } catch (e) { console.log('ShortMax error:', e.message); }

    // DramaPops
    try {
        const res = await axios.get(`${BASE}/dramapops/api/v1/dramas/popular?limit=3&lang=th`, { headers });
        const list = res.data?.data || [];
        const item = Array.isArray(list) ? list[0] : null;
        if (item) {
            console.log('\n--- DramaPops ---');
            console.log('Keys:', Object.keys(item));
            console.log('Language fields:', item.language, item.lang, item.dubbing, item.audioLang);
        }
    } catch (e) { console.log('DramaPops error:', e.message); }

    // DramaBite
    try {
        const res = await axios.get(`${BASE}/dramabite/api/v1/foryou?page=0&lang=th`, { headers });
        const list = Array.isArray(res.data) ? res.data : [];
        const item = list[0];
        if (item) {
            console.log('\n--- DramaBite ---');
            console.log('Keys:', Object.keys(item));
            console.log('Language fields:', item.language, item.lang, item.dubbing, item.audioLang);
        }
    } catch (e) { console.log('DramaBite error:', e.message); }

    // FunDrama
    try {
        const res = await axios.get(`${BASE}/fundrama/api/v1/dramas?page=0&lang=th`, { headers });
        const list = res.data?.data?.ddriv?.lsumm || [];
        const item = list[0];
        if (item) {
            console.log('\n--- FunDrama ---');
            console.log('Keys:', Object.keys(item));
            console.log('Language fields:', item.lhomew, item.language, item.lang, item.dubbing);
        }
    } catch (e) { console.log('FunDrama error:', e.message); }

    // FlexTV
    try {
        const res = await axios.get(`${BASE}/flextv/api/v1/tabs/popular?lang=th`, { headers });
        const d = res.data?.data;
        let item = null;
        if (Array.isArray(d)) item = d[0];
        else if (d?.list) item = d.list[0];
        else if (d?.floor) {
            const sl = d.floor[0]?.series_list || d.floor[0]?.list || [];
            item = sl[0];
        }
        if (item) {
            console.log('\n--- FlexTV ---');
            console.log('Keys:', Object.keys(item));
            console.log('Language fields:', item.language, item.lang, item.dubbing, item.audioLang);
        }
    } catch (e) { console.log('FlexTV error:', e.message); }
}

probe();
