// Test script to verify the Sub and Dub detection logic.

const cases = [
    {
        name: 'DramaBox explicit "lang: th"',
        raw: { bookName: 'Test', lang: 'th' },
        platform: 'dramabox',
        expectedDub: true,
        expectedSub: true
    },
    {
        name: 'DramaBox explicit "lang: en"',
        raw: { bookName: 'Test', lang: 'en' },
        platform: 'dramabox',
        expectedDub: false,
        expectedSub: false
    },
    {
        name: 'Has "พากย์ไทย" in title',
        raw: { title: 'Drama Name (พากย์ไทย)', lang: 'en' },
        platform: 'shortbox',
        expectedDub: true,
        expectedSub: true
    },
    {
        name: 'Has only Thai characters in title (Sub only)',
        raw: { title: 'ละครไทย', lang: 'en' },
        platform: 'shortmax',
        expectedDub: false,
        expectedSub: true
    },
    {
        name: 'Has "พากย์" in tags',
        raw: { name: 'Drama', tags: ['พากย์', 'Action'], lang: 'vi' },
        platform: 'shortmax',
        expectedDub: true,
        expectedSub: true
    },
    {
        name: 'Has general Thai in tags (Sub only)',
        raw: { name: 'Drama', tags: ['ดราม่า', 'Action'], lang: 'en' },
        platform: 'flextv',
        expectedDub: false,
        expectedSub: true
    }
];

function detectThaiLanguage(tags, name, platform, rawLang) {
    let dub = false;
    let sub = false;

    if (platform === 'dramabox' && rawLang === 'th') dub = true;
    if (platform === 'fundrama' && rawLang === 'th') dub = true;

    const thaiDubRegex = /(พากย์ไทย|พากย์|Thai Dub)/i;
    const thaiSubRegex = /[\u0E00-\u0E7F]/;

    if (Array.isArray(tags)) {
        for (const tag of tags) {
            const label = typeof tag === 'string' ? tag : tag?.tagName ?? tag?.tag_name ?? '';
            if (thaiDubRegex.test(label)) dub = true;
            if (thaiSubRegex.test(label)) sub = true;
        }
    }
    if (name) {
        if (thaiDubRegex.test(name)) dub = true;
        if (thaiSubRegex.test(name)) sub = true;
    }
    
    if (dub) sub = true;

    return { dub, sub };
}

console.log('--- Testing detectThaiLanguage logic ---');
cases.forEach(c => {
    const result = detectThaiLanguage(c.raw.tags || c.raw.tag_list || [], c.raw.title || c.raw.name || c.raw.bookName, c.platform, c.raw.lang);
    const passDub = result.dub === c.expectedDub;
    const passSub = result.sub === c.expectedSub;
    console.log(`${passDub && passSub ? '✅' : '❌'} ${c.name}`);
    console.log(`   Dub: Got ${result.dub}, Expected ${c.expectedDub}`);
    console.log(`   Sub: Got ${result.sub}, Expected ${c.expectedSub}`);
});
