async function checkDeploy() {
  for (let i = 0; i < 8; i++) {
    try {
      const html = await fetch('https://steamer-one.vercel.app/admin/guide').then(r => r.text());
      const scriptUrls = [...html.matchAll(/src="(\/_next\/static\/chunks\/[^"]+)"/g)].map(m => m[1]);
      let found = false;
      for (const s of scriptUrls) {
        const text = await fetch('https://steamer-one.vercel.app' + s).then(r => r.text());
        if (text.includes('drive.google.com') && text.includes('/preview')) {
          found = true;
          break;
        }
      }
      if (found) {
        console.log('✓ Vercel successfully deployed Google Drive preview player support!');
        return;
      } else {
        console.log(`Poll ${i + 1}: Waiting for Vercel build to finish...`);
      }
    } catch (e) {
      console.log('Poll error:', e.message);
    }
    await new Promise(r => setTimeout(r, 6000));
  }
}
checkDeploy();

