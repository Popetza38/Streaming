const axios = require('axios');

async function testLocalProxy() {
    const baseUrl = 'http://localhost:5173';
    const endpoints = [
        { name: 'For You (FunDrama)', url: `${baseUrl}/api/foryou?platform=fundrama` },
        { name: 'Hot/Rank (FunDrama)', url: `${baseUrl}/api/hot?platform=fundrama` },
        { name: 'Detail (FunDrama)', url: `${baseUrl}/api/drama/2028730673983561730?platform=fundrama` }
    ];

    for (const ep of endpoints) {
        console.log(`\n--- Testing ${ep.name} ---`);
        try {
            const res = await axios.get(ep.url);
            console.log(`Status: ${res.status}`);
            if (res.data) {
                console.log(`Keys: ${Object.keys(res.data).join(', ')}`);
                if (res.data.data && res.data.data.ddriv && res.data.data.ddriv.lsumm) {
                    console.log(`Success! Found obfuscated list (lsumm) with length: ${res.data.data.ddriv.lsumm.length}`);
                    if (res.data.data.ddriv.lsumm.length > 0) {
                        console.log(`First item dshame (ID): ${res.data.data.ddriv.lsumm[0].dshame}`);
                        console.log(`First item nsin (Title): ${res.data.data.ddriv.lsumm[0].nsin}`);
                    }
                } else if (res.data.data && res.data.data.ddriv) {
                    console.log(`Success! Found obfuscated detail (ddriv). nsin (Title): ${res.data.data.ddriv.nsin}`);
                }
            }
        } catch (err) {
            console.log(`Error: ${err.message}`);
            if (err.response) {
                console.log(`Response Status: ${err.response.status}`);
            }
        }
    }
}

testLocalProxy();
