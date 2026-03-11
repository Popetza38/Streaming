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

async function searchDub() {
    const query = encodeURIComponent('พากย์ไทย');
    const results = {};
    console.log('Searching https://captain.sapimu.au for "พากย์ไทย"...\n');

    // DramaBox
    try {
        const res = await axios.get(`${BASE}/dramabox/api/v1/search/${query}/1?pageSize=10`, { headers: getHeaders('App/1.0') });
        const list = res.data?.data?.list || [];
        results.dramabox = { count: list.length, first: list[0]?.bookName || 'N/A' };
        console.log(`✅ DramaBox: Found ${list.length} results. Ex: ${results.dramabox.first}`);
    } catch (e) { 
        results.dramabox = { error: e.message }; 
        console.log(`❌ DramaBox Error: ${e.message}`);
    }

    // ShortMax
    try {
        const res = await axios.get(`${BASE}/shortmax/api/v1/search?q=${query}`, { headers: getHeaders('ShortMax-App/1.0') });
        const list = res.data?.data || [];
        results.shortmax = { count: list.length, first: list[0]?.name || 'N/A' };
        console.log(`✅ ShortMax: Found ${list.length} results. Ex: ${results.shortmax.first}`);
    } catch (e) { 
        results.shortmax = { error: e.message }; 
        console.log(`❌ ShortMax Error: ${e.message}`);
    }

    // FlexTV
    try {
        const res = await axios.get(`${BASE}/flextv/api/v1/search?q=${query}`, { headers: getHeaders('FlexTV-App/1.0') });
        const list = res.data?.data?.list || res.data?.data || [];
        results.flextv = { count: list.length, first: list[0]?.series_name || 'N/A' };
        console.log(`✅ FlexTV: Found ${list.length} results. Ex: ${results.flextv.first}`);
    } catch (e) { 
        results.flextv = { error: e.message }; 
        console.log(`❌ FlexTV Error: ${e.message}`);
    }

    // DramaPops
    try {
        const res = await axios.get(`${BASE}/dramapops/api/v1/search?q=${query}&limit=10`, { headers: getHeaders('DramaPops-App/1.0') });
        const list = res.data?.data || [];
        results.dramapops = { count: list.length, first: list[0]?.title || 'N/A' };
        console.log(`✅ DramaPops: Found ${list.length} results. Ex: ${results.dramapops.first}`);
    } catch (e) { 
        results.dramapops = { error: e.message }; 
        console.log(`❌ DramaPops Error: ${e.message}`);
    }

    // DramaBite
    try {
        const res = await axios.get(`${BASE}/dramabite/api/v1/search?keyword=${query}&limit=10`, { headers: getHeaders('DramaBite-App/1.0') });
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        results.dramabite = { count: list.length, first: list[0]?.title || 'N/A' };
        console.log(`✅ DramaBite: Found ${list.length} results. Ex: ${results.dramabite.first}`);
    } catch (e) { 
        results.dramabite = { error: e.message }; 
        console.log(`❌ DramaBite Error: ${e.message}`);
    }

    // FunDrama
    try {
        const res = await axios.get(`${BASE}/fundrama/api/v1/search?q=${query}&keyword=${query}`, { headers: getHeaders('FunDrama-App/1.0') });
        const list = res.data?.data?.results || res.data?.data || [];
        results.fundrama = { count: list.length, first: list[0]?.nsin || 'N/A' };
        console.log(`✅ FunDrama: Found ${list.length} results. Ex: ${results.fundrama.first}`);
    } catch (e) { 
        results.fundrama = { error: e.message }; 
        console.log(`❌ FunDrama Error: ${e.message}`);
    }

    // ShortBox
    try {
        const res = await axios.get(`${BASE}/shortbox/api/search?q=${query}&page=1`, { headers: getHeaders('ShortBox-App/1.0') });
        const list = res.data?.data?.data || res.data?.data || [];
        results.shortbox = { count: list.length, first: list[0]?.title || 'N/A' };
        console.log(`✅ ShortBox: Found ${list.length} results. Ex: ${results.shortbox.first}`);
    } catch (e) { 
        results.shortbox = { error: e.message }; 
        console.log(`❌ ShortBox Error: ${e.message}`);
    }

    fs.writeFileSync('probe_search_results.json', JSON.stringify(results, null, 2));
    console.log('\nResults saved to probe_search_results.json');
}

searchDub();
