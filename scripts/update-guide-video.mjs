import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function run() {
  const current = await prisma.systemSetting.findUnique({
    where: { key: 'setup_guide_content' },
  });

  if (!current) {
    console.error('No setup_guide_content found in db!');
    return;
  }

  const guide = JSON.parse(current.value);
  console.log('Original Guide:');
  console.log(' - Title:', guide.title);
  console.log(' - Steps:', guide.steps?.length);
  console.log(' - Old videoUrl:', guide.videoUrl);

  guide.videoUrl = 'https://drive.google.com/file/d/1uW1L51h0L0Nc6JFUuL1wBX2D_RsW_3-0/view?usp=drivesdk';
  guide.videoTitle = 'Complete Step-by-Step Video Walkthrough';

  const updatedJson = JSON.stringify(guide, null, 2);

  await prisma.systemSetting.update({
    where: { key: 'setup_guide_content' },
    data: { value: updatedJson },
  });

  console.log('✓ Updated setup_guide_content in active Prisma database!');
  console.log(' - New videoUrl:', guide.videoUrl);
  console.log(' - New videoTitle:', guide.videoTitle);

  // Sync to prisma/steamer.db, prisma_seed/steamer.db, and steamer.db
  await prisma.$disconnect();

  const src = path.join(process.cwd(), 'prisma', 'steamer.db');
  const destSeed = path.join(process.cwd(), 'prisma_seed', 'steamer.db');
  const destRoot = path.join(process.cwd(), 'steamer.db');

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, destSeed);
    fs.copyFileSync(src, destRoot);
    console.log('✓ Synchronized prisma/steamer.db to prisma_seed/steamer.db and ./steamer.db');
  }
}

run().catch(console.error);

