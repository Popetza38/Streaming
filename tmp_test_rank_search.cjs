const axios = require('axios');

async function testLocalProxy() {
    const baseUrl = 'http://localhost:5173';
    const endpoints = [
        { name: 'Rank Target', url: `${baseUrl}/api/dramas?page=0&lang=en&platform=fundrama` },
        { name: 'Search Target', url: `${baseUrl}/api/search?q=love&keyword=love&page=0&lang=en&platform=fundrama` }
    ];

    for (const ep of endpoints) {
        console.log(`\n--- Testing ${ep.name} ---`);
        console.log(`URL: ${ep.url}`);
        try {
            const res = await axios.get(ep.url);
            console.log(`Status: ${res.status}`);
            if (res.data) {
                if (res.data.data && res.data.data.ddriv && res.data.data.ddriv.lsumm) {
                    console.log(`Success! Found list (ddriv.lsumm) length: ${res.data.data.ddriv.lsumm.length}`);
                } else if (res.data.data && res.data.data.results) {
                    console.log(`Success! Found Search list (results) length: ${res.data.data.results.length}`);
                } else {
                    console.log(`Keys: ${Object.keys(res.data).join(', ')}`);
                }
            }
        } catch (err) {
            console.log(`Error: ${err.message}`);
        }
    }
}

testLocalProxy();
