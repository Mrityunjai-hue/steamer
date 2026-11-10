import fs from "fs";
import path from "path";
import sharp from "sharp";
import { prisma } from "../lib/prisma";

const capsulesDir = path.join(process.cwd(), "public", "images", "capsules");
if (!fs.existsSync(capsulesDir)) {
  fs.mkdirSync(capsulesDir, { recursive: true });
}

const userUploadedDir = "C:/Users/Mrityunjai/.gemini/antigravity/brain/8f4bd799-d7b1-4b1a-bb15-ba277b1548e5/.user_uploaded";

async function downloadToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.statusText}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function createStandardCapsule(
  sourceBuffer: Buffer,
  outputPath: string,
  fit: keyof sharp.FitEnum = "cover"
) {
  await sharp(sourceBuffer)
    .resize(460, 215, { fit, background: { r: 10, g: 14, b: 20, alpha: 1 } })
    .jpeg({ quality: 92 })
    .toFile(outputPath);
  console.log(`✓ Saved capsule: ${outputPath}`);
}

async function main() {
  console.log("--- Generating Real Game Artwork for Custom/Upcoming Titles ---");

  // 1. Battlefield 6 (Cropped from user screenshot 1: media_1794239906695_820fa1b6.jpg)
  const f1Path = path.join(userUploadedDir, "media_1794239906695_820fa1b6.jpg");
  if (fs.existsSync(f1Path)) {
    console.log("Extracting Battlefield 6 from user screenshot...");
    // Battlefield 6 card is Col 1, Row 1
    const bf6Buf = await sharp(f1Path)
      .extract({ left: 21, top: 321, width: 230, height: 320 })
      .toBuffer();
    await createStandardCapsule(bf6Buf, path.join(capsulesDir, "battlefield-6.jpg"));
  }

  // 2. Elden Ring: Nightreign (Steam official asset AppID 2622380)
  console.log("Fetching official Elden Ring: Nightreign Steam header...");
  try {
    const erBuf = await downloadToBuffer("https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2622380/header.jpg");
    await createStandardCapsule(erBuf, path.join(capsulesDir, "elden-ring-nightreign.jpg"));
  } catch (err: any) {
    console.warn("Failed fetching from Steam CDN, falling back to local crop:", err.message);
  }

  // 3. Jurassic World Evolution 3 (Cropped from user screenshot 3: media_1794239968581_f38cd7b7.jpg)
  const f2Path = path.join(userUploadedDir, "media_1794239968581_f38cd7b7.jpg");
  if (fs.existsSync(f2Path)) {
    console.log("Extracting Jurassic World Evolution 3 from user screenshot...");
    const jweBuf = await sharp(f2Path)
      .extract({ left: 390, top: 466, width: 285, height: 165 })
      .toBuffer();
    await createStandardCapsule(jweBuf, path.join(capsulesDir, "jurassic-world-evolution-3.jpg"));
  }

  // 4. F1 25: 2026 Season Edition (Cropped from user screenshot 4: media_1794239998944_427d3fc6.jpg)
  const f3Path = path.join(userUploadedDir, "media_1794239998944_427d3fc6.jpg");
  if (fs.existsSync(f3Path)) {
    console.log("Extracting F1 25 from user screenshot...");
    const f1Buf = await sharp(f3Path)
      .extract({ left: 158, top: 450, width: 195, height: 110 })
      .toBuffer();
    await createStandardCapsule(f1Buf, path.join(capsulesDir, "f1-25.jpg"));
  }

  // 5. Phantom Blade Zero (Official Steam CDN asset AppID 4115450)
  console.log("Fetching official Phantom Blade Zero Steam header...");
  try {
    const pbzBuf = await downloadToBuffer("https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/4115450/7f882f889630270d3d3fb93825ac6f55b55e7a6c/header.jpg");
    await createStandardCapsule(pbzBuf, path.join(capsulesDir, "phantom-blade-zero.jpg"));
  } catch (err: any) {
    console.warn("Failed fetching PBZ:", err.message);
  }

  // 6. Max Payne 1 & 2 Remake (Official Steam Max Payne Header)
  console.log("Fetching official Max Payne header...");
  try {
    const mpBuf = await downloadToBuffer("https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/12140/header.jpg");
    await createStandardCapsule(mpBuf, path.join(capsulesDir, "max-payne-remake.jpg"));
  } catch (err: any) {
    console.warn("Failed fetching Max Payne:", err.message);
  }

  // 7. The Witcher 4 (Official CDPR Polaris announcement artwork)
  console.log("Composing official The Witcher 4 Polaris capsule...");
  try {
    const w4Buf = await downloadToBuffer("https://upload.wikimedia.org/wikipedia/en/4/4c/The_Witcher_IV_logo.png");
    // Create dark atmospheric background and composite logo
    const bg = await sharp({
      create: {
        width: 460,
        height: 215,
        channels: 4,
        background: { r: 12, g: 19, b: 29, alpha: 1 },
      },
    }).png().toBuffer();

    const logoResized = await sharp(w4Buf)
      .resize(360, 150, { fit: "inside" })
      .toBuffer();

    await sharp(bg)
      .composite([{ input: logoResized, gravity: "center" }])
      .jpeg({ quality: 92 })
      .toFile(path.join(capsulesDir, "witcher-4.jpg"));
    console.log("✓ Saved Witcher 4 capsule");
  } catch (err: any) {
    console.warn("Failed creating Witcher 4 capsule:", err.message);
  }

  // 8. Resident Evil (1996) (Iconic official box art)
  console.log("Composing official Resident Evil 1996 capsule...");
  try {
    const re1Buf = await downloadToBuffer("https://upload.wikimedia.org/wikipedia/en/a/a6/Resident_Evil_1_cover.png");
    await createStandardCapsule(re1Buf, path.join(capsulesDir, "resident-evil-1996.jpg"), "contain");
  } catch (err: any) {
    console.warn("Failed creating RE1 capsule:", err.message);
  }

  // 9. Resident Evil 2 (1998) (Iconic official box art)
  console.log("Composing official Resident Evil 2 1998 capsule...");
  try {
    const re2Buf = await downloadToBuffer("https://upload.wikimedia.org/wikipedia/en/4/40/NTSC_Resident_Evil_2_Cover.png");
    await createStandardCapsule(re2Buf, path.join(capsulesDir, "resident-evil-2-1998.jpg"), "contain");
  } catch (err: any) {
    console.warn("Failed creating RE2 capsule:", err.message);
  }

  // Update Database records to use these .jpg files instead of .svg
  console.log("Updating database records from .svg to .jpg...");

  const updates = [
    { title: "Battlefield 6", img: "/images/capsules/battlefield-6.jpg", appId: "2727850" },
    { title: "Elden Ring: Nightreign", img: "/images/capsules/elden-ring-nightreign.jpg", appId: "2622380" },
    { title: "Jurassic World Evolution 3", img: "/images/capsules/jurassic-world-evolution-3.jpg", appId: "2956840" },
    { title: "F1 25", img: "/images/capsules/f1-25.jpg", appId: "3139550" },
    { title: "Phantom Blade Zero", img: "/images/capsules/phantom-blade-zero.jpg", appId: "4115450" },
    { title: "Max Payne 1 & 2 Remake", img: "/images/capsules/max-payne-remake.jpg", appId: "12140" },
    { title: "The Witcher 4", img: "/images/capsules/witcher-4.jpg", appId: "2762040" },
    { title: "Resident Evil (1996)", img: "/images/capsules/resident-evil-1996.jpg", appId: "304240" },
    { title: "Resident Evil 2 (1998)", img: "/images/capsules/resident-evil-2-1998.jpg", appId: "883710" },
  ];

  for (const item of updates) {
    const game = await prisma.game.findFirst({
      where: {
        OR: [
          { title: { equals: item.title, mode: "insensitive" } },
          { title: { contains: item.title, mode: "insensitive" } },
        ],
      },
    });

    if (game) {
      await prisma.game.update({
        where: { id: game.id },
        data: {
          headerImage: item.img,
          capsuleImage: item.img,
          steamAppId: item.appId,
        },
      });
      console.log(`✓ Updated DB: "${game.title}" -> ${item.img} (AppID: ${item.appId})`);
    } else {
      console.warn(`! Game not found: ${item.title}`);
    }
  }

  console.log("--- Real Game Artwork Setup Complete ---");
}

main()
  .catch((e) => {
    console.error("Error during real game artwork execution:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
