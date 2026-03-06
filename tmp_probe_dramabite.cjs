const axios = require('axios');

async function testDramaBite() {
    try {
        const res = await axios.get('https://captain.sapimu.au/dramabite/api/v1/foryou?page=0&lang=en', {
            headers: {
                'Authorization': `Bearer 05fdfb98a531276ac6a449f9fd680123eb0ad40993ee76079d8a5e485bf7892d`,
                'User-Agent': 'DramaBite-App/1.0'
            }
        });

        console.log("Status:", res.status);
        const data = res.data;
        if (Array.isArray(data) && data.length > 0) {
            console.log("First item keys:", Object.keys(data[0]));
            // Dump the first item to see what is returned
            console.log(JSON.stringify(data[0], null, 2));
        } else {
            console.log("Data:", data);
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testDramaBite();
