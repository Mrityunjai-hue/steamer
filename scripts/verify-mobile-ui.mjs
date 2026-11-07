async function poll() {
  for (let i = 0; i < 8; i++) {
    try {
      const html = await fetch('https://steamer-one.vercel.app').then(r => r.text());
      const scriptUrls = [...html.matchAll(/src="(\/_next\/static\/chunks\/[^"]+)"/g)].map(m => m[1]);
      let found = false;
      for (const s of scriptUrls) {
        const text = await fetch('https://steamer-one.vercel.app' + s).then(r => r.text());
        if (text.includes('Get 265 Games of Your Choice for ₹300') || text.includes('bottom-20')) {
          found = true;
          break;
        }
      }
      if (found) {
        console.log('✓ Vercel successfully deployed mobile UI & carousel uncluttering!');
        return;
      } else {
        console.log(`Poll ${i + 1}: Waiting for Vercel deployment...`);
      }
    } catch (e) {
      console.log('Poll error:', e.message);
    }
    await new Promise(r => setTimeout(r, 6000));
  }
}
poll();

