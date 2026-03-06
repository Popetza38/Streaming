const axios = require('axios');

const TOKEN = '05fdfb98a531276ac6a449f9fd680123eb0ad40993ee76079d8a5e485bf7892d';
const headers = { 'Authorization': `Bearer ${TOKEN}` };
const baseUrl = 'https://captain.sapimu.au/fundrama/api/v1';

async function probe() {
    const endpoints = [
        { name: 'Dramas (Rank)', url: `${baseUrl}/dramas?page=0&lang=en` },
        { name: 'Search', url: `${baseUrl}/search?q=love&keyword=love&page=0` }
    ];

    for (const ep of endpoints) {
        console.log(`\n--- ${ep.name} ---`);
        try {
            const res = await axios.get(ep.url, { headers });

            const ddriv = res.data?.data?.ddriv;
            if (ddriv && ddriv.lsumm && ddriv.lsumm.length > 0) {
                console.log("Found lsumm array! First item keys:");
                console.log(Object.keys(ddriv.lsumm[0]).join(', '));
                console.log(JSON.stringify(ddriv.lsumm[0], null, 2));
            } else if (res.data?.data?.results && res.data?.data?.results.length > 0) {
                console.log("Found search results! First item keys:");
                console.log(Object.keys(res.data.data.results[0]).join(', '));
                console.log(JSON.stringify(res.data.data.results[0], null, 2));
            } else {
                console.log(JSON.stringify(res.data, null, 2).substring(0, 1000));
            }
        } catch (err) {
            console.log(`Error: ${err.message}`);
        }
    }
}

probe();
