const axios = require('axios');
const BASE = 'https://captain.sapimu.au';
const TOKEN = '05fdfb98a531276ac6a449f9fd680123eb0ad40993ee76079d8a5e485bf7892d';
const headers = { Authorization: `Bearer ${TOKEN}`, 'User-Agent': 'App/1.0' };

async function probe() {
    // DramaBox deeper - check tagDetails
    try {
        const res = await axios.get(`${BASE}/dramabox/api/v1/foryou/1?lang=th`, { headers });
        const d = res.data?.data;
        let list = [];
        if (Array.isArray(d?.data)) list = d.data;
        else if (Array.isArray(d)) list = d;
        if (list.length > 0) {
            const item = list[0];
            console.log('--- DramaBox (foryou th) ---');
            console.log('Keys:', Object.keys(item));
            console.log('tagDetails:', JSON.stringify(item.tagDetails));
            console.log('corner:', JSON.stringify(item.corner));
            console.log('bookName:', item.bookName);
            // Check all fields for anything Thai-related
            const allVals = JSON.stringify(item);
            if (allVals.includes('Thai') || allVals.includes('thai') || allVals.includes('พากไทย') || allVals.includes('th')) {
                console.log('Found Thai-related content!');
            }
        }
    } catch (e) { console.log('DramaBox error:', e.message); }

    // ShortBox
    try {
        const res = await axios.get(`${BASE}/shortbox/api/v1/foryou/1?lang=th`, { headers });
        const d = res.data?.data;
        let list = [];
        if (Array.isArray(d?.data)) list = d.data;
        else if (Array.isArray(d)) list = d;
        if (list.length > 0) {
            console.log('\n--- ShortBox (foryou th) ---');
            console.log('Keys:', Object.keys(list[0]));
            console.log('tagDetails:', JSON.stringify(list[0].tagDetails));
            console.log('corner:', JSON.stringify(list[0].corner));
        }
    } catch (e) { console.log('ShortBox error:', e.message); }

    // FlexTV deeper - check tag_list for language
    try {
        const res = await axios.get(`${BASE}/flextv/api/v1/tabs/popular?lang=th`, { headers });
        const d = res.data?.data;
        let item = null;
        if (d?.floor) {
            const sl = d.floor[0]?.series_list || d.floor[0]?.list || [];
            item = sl[0];
        } else if (d?.list) item = d.list[0];
        else if (Array.isArray(d)) item = d[0];

        if (item) {
            console.log('\n--- FlexTV (popular th) ---');
            console.log('tag_list:', JSON.stringify(item.tag_list));
            console.log('ext:', JSON.stringify(item.ext));
            console.log('content_type:', item.content_type);
            console.log('icon_text:', item.icon_text);
        }
    } catch (e) { console.log('FlexTV error:', e.message); }
}

probe();
