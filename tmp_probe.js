const axios = require('axios');

const TOKEN = '05fdfb98a531276ac6a449f9fd680123eb0ad40993ee76079d8a5e485bf7892d';
const headers = { 'Authorization': `Bearer ${TOKEN}` };
const baseUrl = 'https://captain.sapimu.au/fundrama/api/v1';

async function probe() {
    const endpoints = [
        { name: 'ForYou', url: `${baseUrl}/foryou?page=0&lang=en` },
        { name: 'Dramas (Rank)', url: `${baseUrl}/dramas?page=0&lang=en` },
        { name: 'Recommend (Categories)', url: `${baseUrl}/recommend?lang=en` },
        { name: 'Search', url: `${baseUrl}/search?q=love&keyword=love&page=0` }
    ];

    for (const ep of endpoints) {
        console.log(`\n--- ${ep.name} ---`);
        try {
            const res = await axios.get(ep.url, { headers });
            console.log(`Status: ${res.status}`);
            // Print first level keys or snippet
            if (Array.isArray(res.data)) {
                console.log(`Data is Array. Length: ${res.data.length}`);
                if (res.data.length > 0) console.log(JSON.stringify(res.data[0]).substring(0, 300) + '...');
            } else {
                console.log(`Data is Object. Keys: ${Object.keys(res.data).join(', ')}`);

                // If data wraps an array
                if (res.data.data && Array.isArray(res.data.data)) {
                    console.log(`res.data.data Array Length: ${res.data.data.length}`);
                    if (res.data.data.length > 0) console.log(JSON.stringify(res.data.data[0]).substring(0, 300) + '...');
                } else {
                    console.log(JSON.stringify(res.data).substring(0, 300) + '...');
                }
            }
        } catch (err) {
            console.log(`Error: ${err.response ? err.response.status : err.message}`);
        }
    }
}

probe();
