const axios = require('axios');
const fs = require('fs');

const BASE = process.env.BASE_API_URL || 'https://captain.sapimu.au';
const TOKEN = process.env.API_TOKEN || '05fdfb98a531276ac6a449f9fd680123eb0ad40993ee76079d8a5e485bf7892d';
const headers = { Authorization: `Bearer ${TOKEN}`, 'User-Agent': 'App/1.0' };

async function probe() {
    let results = {};

    // Helper to extract language-related fields
    const extractLangFields = (item) => {
        if (!item) return null;
        const fields = {};
        for (const key in item) {
            const k = key.toLowerCase();
            if (k.includes('lang') || k.includes('dub') || k.includes('audio') || k.includes('voice') || k.includes('sub')) {
                fields[key] = item[key];
            }
        }
        return {
            title: item.title || item.name || item.bookName || item.series_name || item.nsin || item.movie_unique_title,
            tags: item.tags || item.tag_list || item.genres || item.tagDetails,
            langFields: fields,
            allKeys: Object.keys(item)
        };
    };

    // ShortBox Detail & Episodes
    try {
        const resDetail = await axios.get(`${BASE}/shortbox/api/detail/33362?languages=th`, { headers });
        const resEps = await axios.get(`${BASE}/shortbox/api/episodes/33362?index=1&count=5&languages=th`, { headers });
        results.shortbox_detail = extractLangFields(resDetail.data?.data?.data || resDetail.data?.data || resDetail.data);
        const eps = resEps.data?.data?.data?.episodes || resEps.data?.data?.episodes || resEps.data?.episodes || [];
        results.shortbox_ep1 = extractLangFields(eps[0]);
    } catch (e) { results.shortbox_detail = e.message; }

    // FlexTV Detail
    try {
        const res = await axios.get(`${BASE}/flextv/api/v1/series/1199?lang=th`, { headers });
        results.flextv_detail = extractLangFields(res.data?.data);
    } catch (e) { results.flextv_detail = e.message; }

    // DramaPops Detail
    try {
        const res = await axios.get(`${BASE}/dramapops/api/v1/drama/sweetheart-my-first-love?lang=th`, { headers });
        results.dramapops_detail = extractLangFields(res.data?.data);
    } catch (e) { results.dramapops_detail = e.message; }

    // DramaBite Detail
    try {
        const res = await axios.get(`${BASE}/dramabite/api/v1/drama/304?lang=th`, { headers });
        results.dramabite_detail = extractLangFields(res.data?.data || res.data);
    } catch (e) { results.dramabite_detail = e.message; }

    try {
        const res = await axios.get(`${BASE}/dramabox/api/v1/rank/1?lang=th`, { headers });
        const list = res.data?.data?.data || res.data?.data?.list || res.data?.data || [];
        results.dramabox = extractLangFields(Array.isArray(list) ? list[0] : null);
    } catch (e) { results.dramabox = e.message; }

    try {
        const res = await axios.get(`${BASE}/shortmax/api/v1/foryou?lang=th`, { headers });
        const list = res.data?.data || [];
        const item = Array.isArray(list) && list.length > 0 ? (list[0].items ? list[0].items[0] : list[0]) : null;
        results.shortmax = extractLangFields(item);
    } catch (e) { results.shortmax = e.message; }

    try {
        const res = await axios.get(`${BASE}/dramapops/api/v1/dramas/popular?limit=3&lang=th`, { headers });
        const list = res.data?.data || [];
        results.dramapops = extractLangFields(Array.isArray(list) ? list[0] : null);
    } catch (e) { results.dramapops = e.message; }

    try {
        const res = await axios.get(`${BASE}/dramabite/api/v1/foryou?page=0&lang=th`, { headers });
        const list = Array.isArray(res.data) ? res.data : [];
        results.dramabite = extractLangFields(list[0]);
    } catch (e) { results.dramabite = e.message; }

    try {
        const res = await axios.get(`${BASE}/fundrama/api/v1/dramas?page=0&lang=th`, { headers });
        const list = res.data?.data?.ddriv?.lsumm || [];
        results.fundrama = extractLangFields(list[0]);
    } catch (e) { results.fundrama = e.message; }

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
        results.flextv = extractLangFields(item);
    } catch (e) { results.flextv = e.message; }

    fs.writeFileSync('probe_audio_results.json', JSON.stringify(results, null, 2));
    console.log('Results written to probe_audio_results.json');
}

probe();
