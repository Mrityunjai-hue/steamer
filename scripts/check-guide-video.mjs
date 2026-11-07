import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function run() {
  const settings = await p.systemSetting.findMany();
  for (const s of settings) {
    if (s.key.includes('guide') || s.value.includes('drive.google') || s.value.includes('video')) {
      console.log('KEY:', s.key);
      try {
        const val = JSON.parse(s.value);
        console.log(' - videoUrl:', val.videoUrl);
        console.log(' - videoTitle:', val.videoTitle);
      } catch {
        console.log(' - Raw value:', s.value.slice(0, 200));
      }
    }
  }
}

run().finally(() => p.$disconnect());

