async function checkBundle() {
  const html = await fetch('https://steamer-one.vercel.app/checkout').then(r => r.text());
  const matches = [...html.matchAll(/src="(\/_next\/static\/chunks\/[^"]+)"/g)].map(m => m[1]);
  console.log('Found script chunks:', matches.length);
  for (const scriptPath of matches) {
    const text = await fetch('https://steamer-one.vercel.app' + scriptPath).then(r => r.text());
    if (text.includes('Zero Account Sharing') || text.includes('log out other renters')) {
      console.log('Script', scriptPath);
      console.log(' - Has Zero Account Sharing:', text.includes('Zero Account Sharing'));
      console.log(' - Has log out other renters:', text.includes('log out other renters'));
    }
  }
}
checkBundle();

