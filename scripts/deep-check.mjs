import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/full_verification.json', 'utf8'));

console.log(`Analyzing ${data.length} games for title semantic accuracy...`);

const issues = [];

for (const item of data) {
  const ourWords = item.title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => !['the', 'a', 'an', 'and', 'edition', 'remastered', 'definitive', 'goty', 'deluxe', 'complete', 'hd'].includes(w));

  const steamWords = item.steamName
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => !['the', 'a', 'an', 'and', 'edition', 'remastered', 'definitive', 'goty', 'deluxe', 'complete', 'hd', 'soundtrack', 'dlc'].includes(w));

  // Count how many significant ourWords are in steamWords
  const matchingWords = ourWords.filter(w => steamWords.includes(w) || steamWords.some(sw => sw.startsWith(w) || w.startsWith(sw)));
  const ratio = matchingWords.length / Math.max(1, ourWords.length);

  // If less than half of our words appear in steamName, flag it
  if (ratio < 0.5 || item.steamName === "NOT_FOUND_OR_RESTRICTED") {
    issues.push({
      title: item.title,
      steamAppId: item.steamAppId,
      steamName: item.steamName,
      ratio: Math.round(ratio * 100) + '%',
      matchingWords,
      ourWords
    });
  }
}

console.log(`Found ${issues.length} potential issues:`);
console.log(JSON.stringify(issues, null, 2));

