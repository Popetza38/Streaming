const axios = require('axios');

const BASE = process.env.BASE_API_URL || 'https://captain.sapimu.au';
const TOKEN = process.env.API_TOKEN || '05fdfb98a531276ac6a449f9fd680123eb0ad40993ee76079d8a5e485bf7892d';
const headers = { Authorization: `Bearer ${TOKEN}`, 'User-Agent': 'App/1.0' };

async function searchDub() {
    const query = encodeURIComponent('พากย์ไทย');
    const results = {};

    console.log('Searching for "พากย์ไทย" across all servers...\n');

    // DramaBox
    try {
        const res = await axios.get(`${BASE}/dramabox/api/v1/search/${query}/1?pageSize=10`, { headers });
        const list = res.data?.data?.list || [];
        results.dramabox = list.length;
        console.log(`DramaBox: Found ${list.length} results. First result: ${list[0]?.bookName || 'N/A'}`);
    } catch (e) { console.log(`DramaBox error: ${e.message}`); }

    // ShortMax
    try {
        const res = await axios.get(`${BASE}/shortmax/api/v1/search?q=${query}`, { headers });
        const list = res.data?.data || [];
        results.shortmax = list.length;
        console.log(`ShortMax: Found ${list.length} results. First result: ${list[0]?.name || 'N/A'}`);
    } catch (e) { console.log(`ShortMax error: ${e.message}`); }

    // FlexTV
    try {
        const res = await axios.get(`${BASE}/flextv/api/v1/search?q=${query}`, { headers });
        const list = res.data?.data?.list || res.data?.data || [];
        results.flextv = list.length;
        console.log(`FlexTV: Found ${list.length} results. First result: ${list[0]?.series_name || 'N/A'}`);
    } catch (e) { console.log(`FlexTV error: ${e.message}`); }

    // DramaPops
    try {
        const res = await axios.get(`${BASE}/dramapops/api/v1/search?q=${query}&limit=10`, { headers });
        const list = res.data?.data || [];
        results.dramapops = list.length;
        console.log(`DramaPops: Found ${list.length} results. First result: ${list[0]?.title || 'N/A'}`);
    } catch (e) { console.log(`DramaPops error: ${e.message}`); }

    // DramaBite
    try {
        const res = await axios.get(`${BASE}/dramabite/api/v1/search?keyword=${query}&limit=10`, { headers });
        const list = Array.isArray(res.data) ? res.data : [];
        results.dramabite = list.length;
        console.log(`DramaBite: Found ${list.length} results. First result: ${list[0]?.title || 'N/A'}`);
    } catch (e) { console.log(`DramaBite error: ${e.message}`); }

    // FunDrama
    try {
        const res = await axios.get(`${BASE}/fundrama/api/v1/search?q=${query}&keyword=${query}`, { headers });
        const list = res.data?.data?.results || res.data?.data || [];
        results.fundrama = list.length;
        console.log(`FunDrama: Found ${list.length} results. First result: ${list[0]?.nsin || 'N/A'}`);
    } catch (e) { console.log(`FunDrama error: ${e.message}`); }

    // ShortBox
    try {
        const res = await axios.get(`${BASE}/shortbox/api/search?q=${query}&page=1`, { headers });
        const list = res.data?.data?.data || [];
        results.shortbox = list.length;
        console.log(`ShortBox: Found ${list.length} results. First result: ${list[0]?.title || 'N/A'}`);
    } catch (e) { console.log(`ShortBox error: ${e.message}`); }

    console.log('\nSummary:', results);
}

searchDub();
