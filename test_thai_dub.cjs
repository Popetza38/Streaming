// Test script to verify the stricter Thai dub detection logic.

// Mock platform type
const platform = 'shortmax';

const cases = [
    {
        name: 'Should show th for DramaBox with lang=th',
        raw: { bookName: 'Test', lang: 'th' },
        platform: 'dramabox',
        expected: 'th'
    },
    {
        name: 'Should NOT show th for DramaBox with lang=en',
        raw: { bookName: 'Test', lang: 'en' },
        platform: 'dramabox',
        expected: undefined
    },
    {
        name: 'Should show th if "พากย์ไทย" in title',
        raw: { title: 'Drama Name (พากย์ไทย)', lang: 'en' },
        platform: 'shortbox',
        expected: 'th'
    },
    {
        name: 'Should NOT show th if only Thai characters in title',
        raw: { title: 'ละครไทย', lang: 'en' },
        platform: 'shortmax',
        expected: undefined
    },
    {
        name: 'Should show th if "พากย์" in tags',
        raw: { name: 'Drama', tags: ['พากย์', 'Action'], lang: 'vi' },
        platform: 'shortmax',
        expected: 'th'
    }
];

cases.forEach(c => {
    // We need to bypass the TypeScript export and use the file contents or just test the logic directly
    // Since I can't easily import TS in node without setup, I'll just test the logic extracted
});

// Extracted logic for testing in node
function detectLangFromTags(tags, name, platform, rawLang) {
    if (platform === 'dramabox' && rawLang === 'th') return 'th';
    if (platform === 'fundrama' && rawLang === 'th') return 'th';
    const thaiDubRegex = /(พากย์ไทย|พากย์|Thai Dub)/i;
    if (Array.isArray(tags)) {
        for (const tag of tags) {
            const label = typeof tag === 'string' ? tag : tag?.tagName ?? tag?.tag_name ?? '';
            if (thaiDubRegex.test(label)) return 'th';
        }
    }
    if (name && thaiDubRegex.test(name)) return 'th';
    return undefined;
}

console.log('--- Testing detectLangFromTags logic ---');
cases.forEach(c => {
    const result = detectLangFromTags(c.raw.tags || c.raw.tag_list || [], c.raw.title || c.raw.name || c.raw.bookName, c.platform, c.raw.lang);
    const pass = result === c.expected;
    console.log(`${pass ? '✅' : '❌'} ${c.name} | Got: ${result}, Expected: ${c.expected}`);
});
