const axios = require('axios');

const TOKEN = '05fdfb98a531276ac6a449f9fd680123eb0ad40993ee76079d8a5e485bf7892d';
const headers = { 'Authorization': `Bearer ${TOKEN}` };
const baseUrl = 'https://captain.sapimu.au/fundrama/api/v1';
const id = '2028730673983561730';

async function probe() {
    const endpoints = [
        { name: 'Detail', url: `${baseUrl}/drama/${id}` },
        { name: 'Episode 1', url: `${baseUrl}/drama/${id}/episode/1` },
        { name: 'Episode 1 Video', url: `${baseUrl}/drama/${id}/episode/1/video` }
    ];

    for (const ep of endpoints) {
        console.log(`\n--- ${ep.name} ---`);
        try {
            const res = await axios.get(ep.url, { headers });
            console.log(`Status: ${res.status}`);
            // Print first level keys or snippet
            if (Array.isArray(res.data)) {
                console.log(`Data is Array. Length: ${res.data.length}`);
            } else {
                console.log(`Keys: ${Object.keys(res.data).join(', ')}`);
                if (res.data.data) {
                    console.log(`Data Keys: ${Object.keys(res.data.data).join(', ')}`);
                    if (res.data.data.fdar) {
                        console.log("Has fdar array with " + res.data.data.fdar.length + " items");
                    }
                    if (res.data.data.episodes) {
                        console.log("Has episodes array with " + res.data.data.episodes.length + " items");
                        if (res.data.data.episodes.length > 0) console.log("Ep 1 keys: " + Object.keys(res.data.data.episodes[0]).join(', '));
                    }
                }
            }
        } catch (err) {
            console.log(`Error: ${err.response ? err.response.status : err.message}`);
        }
    }
}

probe();
