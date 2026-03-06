const axios = require('axios');

const TOKEN = '05fdfb98a531276ac6a449f9fd680123eb0ad40993ee76079d8a5e485bf7892d';
const headers = { 'Authorization': `Bearer ${TOKEN}` };
const baseUrl = 'https://captain.sapimu.au/fundrama/api/v1';
const id = '2028730673983561730';

async function probeDetail() {
    try {
        const res = await axios.get(`${baseUrl}/drama/${id}`, { headers });
        const ddriv = res.data?.data?.ddriv;
        if (ddriv) {
            console.log(`Keys in ddriv: ${Object.keys(ddriv).join(', ')}`);
            if (ddriv.lsumm) console.log("Has lsumm");
            // Print the whole ddriv object to see where the title is
            console.log(JSON.stringify(ddriv, null, 2).substring(0, 1500));
        } else {
            console.log(JSON.stringify(res.data, null, 2).substring(0, 1000));
        }
    } catch (err) {
        console.log(`Error: ${err.message}`);
    }
}

probeDetail();
