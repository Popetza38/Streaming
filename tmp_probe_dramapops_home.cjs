const axios = require('axios');

async function testDramaPopsHomepage() {
    try {
        const res = await axios.get('https://captain.sapimu.au/dramapops/api/v1/homepage?lang=en', {
            headers: {
                'Authorization': `Bearer 05fdfb98a531276ac6a449f9fd680123eb0ad40993ee76079d8a5e485bf7892d`,
                'User-Agent': 'DramaPops-App/1.0'
            }
        });

        console.log("Status:", res.status);
        const data = res.data?.data;
        if (Array.isArray(data) && data.length > 0 && data[0].movies) {
            console.log("First section name:", data[0].name);
            console.log("First movie in section keys:", Object.keys(data[0].movies[0]));
            console.log(JSON.stringify(data[0].movies[0], null, 2));
        } else {
            console.log("Data structure unexpected:", Object.keys(data || {}));
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testDramaPopsHomepage();
