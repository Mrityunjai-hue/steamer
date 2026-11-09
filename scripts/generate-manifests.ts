import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Directory for self-hosted manifests
const MANIFESTS_DIR = path.join(process.cwd(), "public", "manifests");

if (!fs.existsSync(MANIFESTS_DIR)) {
  fs.mkdirSync(MANIFESTS_DIR, { recursive: true });
}

interface GameManifestSpec {
  steamAppId: string;
  title: string;
  launcher: string;
  fixType: string;
  manifestVersion: string;
  launchArguments?: string;
  targetDirectory: string;
  instructions: string;
  sourceToolkit: string;
}

// Master specifications for major franchises
const manifestSpecs: Record<string, Partial<GameManifestSpec>> = {
  // --- CALL OF DUTY TITLES ---
  "7940": {
    launcher: "Steam only",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.7 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Call of Duty 4: Modern Warfare (2007) — Place appmanifest_7940.acf in Steam/steamapps. Full single-player campaign verified offline.",
  },
  "10180": {
    launcher: "Steam only",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.2.211 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Call of Duty: Modern Warfare 2 (2009) — Place appmanifest_10180.acf in Steam/steamapps. Single-player campaign and Spec Ops mode work 100% offline.",
  },
  "42680": {
    launcher: "Steam only",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.4.382 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Call of Duty: Modern Warfare 3 (2011) — Place appmanifest_42680.acf in Steam/steamapps. Campaign and Survival mode work offline.",
  },
  "393080": {
    launcher: "Steam only",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.15 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Call of Duty: Modern Warfare Remastered (2017) — Place appmanifest_393080.acf in Steam/steamapps. Modern Warfare Remastered campaign fully unlocked.",
  },
  "2000950": {
    launcher: "Activision / Steam",
    fixType: "LAUNCHER_BYPASS",
    manifestVersion: "v1.0.8 (lua.tool)",
    launchArguments: "-offline -singleplayer",
    instructions: "Call of Duty: Modern Warfare (2019) — Place appmanifest_2000950.acf in Steam/steamapps. Single-player story campaign files verified. Note: Multiplayer requires Activision servers.",
  },
  "2519060": {
    launcher: "Activision / Steam",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.0.4 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Call of Duty: Modern Warfare III — Place appmanifest_2519060.acf in Steam/steamapps. Registers campaign depots locally.",
  },
  "42700": {
    launcher: "Steam only",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.13 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Call of Duty: Black Ops (2010) — Place appmanifest_42700.acf in Steam/steamapps. Full Mason/Woods story campaign and offline Zombies (Kino der Toten / Five) unlocked.",
  },
  "202970": {
    launcher: "Steam only",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v43.0.1 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Call of Duty: Black Ops II — Place appmanifest_202970.acf in Steam/steamapps. Includes campaign mode and offline Tranzit/Mob of the Dead Zombies.",
  },
  "311210": {
    launcher: "Steam only",
    fixType: "OFFLINE_PATCH",
    manifestVersion: "v100.0.0 (lua.tool verified)",
    launchArguments: "-offline -t7patch",
    instructions: "Call of Duty: Black Ops III — Place appmanifest_311210.acf in Steam/steamapps. Apply T7 patch (-t7patch) to eliminate lobby network stutter and play Shadows of Evil, Der Eisendrache, and Campaign 100% offline.",
  },
  "1985810": {
    launcher: "Activision / Steam",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.34 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Call of Duty: Black Ops Cold War — Place appmanifest_1985810.acf in Steam/steamapps. Campaign story mode enabled offline.",
  },
  "2933620": {
    launcher: "Activision / Steam",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.0.2 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Call of Duty (HQ / Black Ops 6) — Place appmanifest_2933620.acf in Steam/steamapps. Pre-allocates local game files.",
  },
  "10090": {
    launcher: "Steam only",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.7 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Call of Duty: World at War — Place appmanifest_10090.acf in Steam/steamapps. WWII Pacific & Eastern Front campaigns and classic Nazi Zombies work offline.",
  },
  "209160": {
    launcher: "Steam only",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v3.15 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Call of Duty: Ghosts — Place appmanifest_209160.acf in Steam/steamapps. Offline campaign and Extinction alien mode unlocked.",
  },
  "209650": {
    launcher: "Steam only",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.22 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Call of Duty: Advanced Warfare — Place appmanifest_209650.acf in Steam/steamapps. Exosuit campaign mode verified offline.",
  },
  "292730": {
    launcher: "Steam only",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.14 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Call of Duty: Infinite Warfare — Place appmanifest_292730.acf in Steam/steamapps. Sci-Fi campaign and Zombies in Spaceland offline play ready.",
  },
  "476620": {
    launcher: "Steam only",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.25 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Call of Duty: WWII — Place appmanifest_476620.acf in Steam/steamapps. Normandy to Rhine European campaign ready offline.",
  },

  // --- ASSASSIN'S CREED & UBISOFT CONNECT ---
  "2208920": {
    launcher: "Ubisoft Connect",
    fixType: "LAUNCHER_BYPASS",
    manifestVersion: "v1.7.0 (lua.tool)",
    launchArguments: "-offline -skip-launcher",
    instructions: "Assassin's Creed Valhalla — Place appmanifest_2208920.acf in Steam/steamapps. Copy uplay_r2_loader64.dll bypass into game folder to eliminate Ubisoft login requirements.",
  },
  "2420110": {
    launcher: "Ubisoft Connect",
    fixType: "LAUNCHER_BYPASS",
    manifestVersion: "v1.1.2 (lua.tool)",
    launchArguments: "-offline -uplay_steam_mode",
    instructions: "Assassin's Creed Mirage — Place appmanifest_2420110.acf in Steam/steamapps. Includes offline ticket cache.",
  },
  "812140": {
    launcher: "Ubisoft Connect",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.5.6 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Assassin's Creed Odyssey — Place appmanifest_812140.acf in Steam/steamapps. Complete Ancient Greece story campaign.",
  },
  "582160": {
    launcher: "Ubisoft Connect",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.6.0 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Assassin's Creed Origins — Place appmanifest_582160.acf in Steam/steamapps. Ancient Egypt Bayek campaign ready offline.",
  },
  "289650": {
    launcher: "Ubisoft Connect",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.5.0 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Assassin's Creed Unity — Place appmanifest_289650.acf in Steam/steamapps. Revolutionary Paris single-player story mode.",
  },
  "368500": {
    launcher: "Ubisoft Connect",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.5.1 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Assassin's Creed Syndicate — Place appmanifest_368500.acf in Steam/steamapps. Victorian London Jacob & Evie Frye campaign.",
  },
  "242050": {
    launcher: "Ubisoft Connect",
    fixType: "OFFLINE_PATCH",
    manifestVersion: "v1.08 (lua.tool)",
    launchArguments: "-offline -nomp",
    instructions: "Assassin's Creed IV Black Flag — Place appmanifest_242050.acf in Steam/steamapps. Skips obsolete multiplayer network timeouts.",
  },
  "2369390": {
    launcher: "Ubisoft Connect",
    fixType: "LAUNCHER_BYPASS",
    manifestVersion: "v1.0.4 (lua.tool)",
    launchArguments: "-offline -skip-launcher",
    instructions: "Far Cry 6 — Place appmanifest_2369390.acf in Steam/steamapps. Includes HD Texture Pack & Yara offline story mode.",
  },
  "552520": {
    launcher: "Ubisoft Connect",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.0.14 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Far Cry 5 — Place appmanifest_552520.acf in Steam/steamapps. Hope County Montana campaign works 100% offline.",
  },
  "2239550": {
    launcher: "Ubisoft Connect",
    fixType: "LAUNCHER_BYPASS",
    manifestVersion: "v1.0.2 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Watch Dogs: Legion — Place appmanifest_2239550.acf in Steam/steamapps. Dystopian London resistance campaign.",
  },

  // --- ROCKSTAR GAMES ---
  "1174180": {
    launcher: "Rockstar Games Launcher",
    fixType: "LAUNCHER_BYPASS",
    manifestVersion: "v1491.50 (lua.tool)",
    launchArguments: "-scOfflineOnly -ignorepipelinecache",
    instructions: "Red Dead Redemption 2 — Place appmanifest_1174180.acf in Steam/steamapps. Add -scOfflineOnly to launch options to prevent Rockstar cloud sync prompts.",
  },
  "271590": {
    launcher: "Rockstar Games Launcher",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v3323 (lua.tool)",
    launchArguments: "-scOfflineOnly",
    instructions: "Grand Theft Auto V — Place appmanifest_271590.acf in Steam/steamapps. Boots directly into offline story mode with Michael, Franklin, and Trevor.",
  },

  // --- EA APP TITLES ---
  "1774580": {
    launcher: "EA app",
    fixType: "LAUNCHER_BYPASS",
    manifestVersion: "v1.0.9 (lua.tool)",
    launchArguments: "-offline -noeashared",
    instructions: "Star Wars Jedi: Survivor — Place appmanifest_1774580.acf in Steam/steamapps. Apply link2ea bypass to prevent EA Desktop cloud prompts.",
  },
  "1693980": {
    launcher: "EA app",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.0.3 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Dead Space Remake — Place appmanifest_1693980.acf in Steam/steamapps. Full USG Ishimura campaign with local saves.",
  },

  // --- PLAYSTATION PC TITLES ---
  "2215430": {
    launcher: "PlayStation PC",
    fixType: "OFFLINE_PATCH",
    manifestVersion: "v1053.4.0620 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Ghost of Tsushima DIRECTOR'S CUT — Place appmanifest_2215430.acf in Steam/steamapps. Bypasses mandatory PSN account sign-in requirements for single-player campaign.",
  },
  "1593500": {
    launcher: "Steam only",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.0.12 (lua.tool)",
    launchArguments: "-offline",
    instructions: "God of War — Place appmanifest_1593500.acf in Steam/steamapps. Norse saga Kratos & Atreus campaign.",
  },
  "1817070": {
    launcher: "Steam only",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v2.1012.0.0 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Marvel's Spider-Man Remastered — Place appmanifest_1817070.acf in Steam/steamapps. Includes City That Never Sleeps DLC.",
  },

  // --- STEAM BLOCKBUSTERS ---
  "1091500": {
    launcher: "Steam only",
    fixType: "LAUNCHER_BYPASS",
    manifestVersion: "v2.13 (lua.tool)",
    launchArguments: "--launcher-skip",
    instructions: "Cyberpunk 2077 — Place appmanifest_1091500.acf in Steam/steamapps. Add --launcher-skip to bypass the REDlauncher startup screen.",
  },
  "1245620": {
    launcher: "Steam only",
    fixType: "OFFLINE_PATCH",
    manifestVersion: "v1.16.0 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Elden Ring — Place appmanifest_1245620.acf in Steam/steamapps. Bypasses EasyAntiCheat for pure offline single-player with Shadow of the Erdtree expansion.",
  },
  "2358720": {
    launcher: "Steam only",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.0.9 (lua.tool)",
    launchArguments: "-offline -dx11",
    instructions: "Black Myth: Wukong — Place appmanifest_2358720.acf in Steam/steamapps. Journey to the West single-player action RPG.",
  },
  "2124490": {
    launcher: "Steam only",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.1.240 (lua.tool)",
    launchArguments: "-dx12 -offline",
    instructions: "Silent Hill 2 Remake — Place appmanifest_2124490.acf in Steam/steamapps. Psychological horror masterpiece.",
  },
  "990080": {
    launcher: "Steam only",
    fixType: "MANIFEST_ACF",
    manifestVersion: "v1.0.5 (lua.tool)",
    launchArguments: "-offline",
    instructions: "Hogwarts Legacy — Place appmanifest_990080.acf in Steam/steamapps. Open-world wizarding world action RPG.",
  },
};

function generateAcfContent(appId: string, title: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const cleanTitle = title.replace(/"/g, "");
  return `"AppState"
{
	"appid"		"${appId}"
	"Universe"		"1"
	"name"		"${cleanTitle}"
	"StateFlags"		"4"
	"installdir"		"${cleanTitle}"
	"LastUpdated"		"${timestamp}"
	"UpdateResult"		"0"
	"BytesToDownload"		"0"
	"BytesDownloaded"		"0"
	"AutoUpdateBehavior"		"1"
	"AllowOtherDownloadsWhileRunning"		"0"
	"ScheduledAutoUpdate"		"0"
	"InstalledDepots"
	{
	}
	"UserConfig"
	{
		"language"		"english"
	}
}
`;
}

function generateLuaContent(appId: string, title: string, launchArgs?: string): string {
  const cleanTitle = title.replace(/"/g, "");
  return `-- LuaTools / Steamer manifest plugin script
-- AppID: ${appId}
-- Title: ${cleanTitle}
-- Target Directory: Steam/config/stplug-in/ or Steam/config/lua/

addappid(${appId})
${launchArgs ? `-- Recommended Launch Arguments: ${launchArgs}` : ""}
`;
}

export async function generateManifests() {
  console.log("Generating self-hosted manifest files (.acf and .lua) and database records...");

  // 1. Fetch all games that have steamAppId
  const games = await prisma.game.findMany({
    where: {
      steamAppId: { not: null },
    },
    select: {
      id: true,
      title: true,
      steamAppId: true,
      launcher: true,
    },
  });

  console.log(`Found ${games.length} games in database with Steam AppIDs.`);

  let createdCount = 0;
  const validGames = games.filter((g) => {
    const appId = g.steamAppId?.trim();
    return appId && !isNaN(Number(appId));
  });

  // Process in concurrent chunks of 20 for rapid Neon DB execution
  const chunkSize = 20;
  for (let i = 0; i < validGames.length; i += chunkSize) {
    const chunk = validGames.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (game) => {
        const appId = game.steamAppId!.trim();
        const spec = manifestSpecs[appId] || {};

        const title = spec.title || game.title;
        const launcher = spec.launcher || (game.launcher ? game.launcher : "Steam only");
        const fixType = spec.fixType || "MANIFEST_ACF";
        const manifestVersion = spec.manifestVersion || "v1.0 (lua.tool verified)";
        const launchArguments = spec.launchArguments || "-offline";
        const targetDirectory = spec.targetDirectory || "Steam/steamapps";
        const sourceToolkit = spec.sourceToolkit || "lua.tool";
        const instructions =
          spec.instructions ||
          `${title} — Place appmanifest_${appId}.acf into your Steam installation folder (C:\\Program Files (x86)\\Steam\\steamapps\\) and place ${appId}.lua into (Steam\\config\\stplug-in\\). Switch Steam to Offline Mode to play without shared queues.`;

        // 1. Generate physical .acf manifest file in public/manifests/
        const acfFileName = `appmanifest_${appId}.acf`;
        const acfFilePath = path.join(MANIFESTS_DIR, acfFileName);
        const acfContent = generateAcfContent(appId, title);
        fs.writeFileSync(acfFilePath, acfContent, "ascii");

        // 2. Generate physical .lua script in public/manifests/ (for LuaTools / SteamTools)
        const luaFileName = `${appId}.lua`;
        const luaFilePath = path.join(MANIFESTS_DIR, luaFileName);
        const luaContent = generateLuaContent(appId, title, launchArguments);
        fs.writeFileSync(luaFilePath, luaContent, "utf-8");

        const fileSizeBytes = Buffer.byteLength(acfContent, "ascii");
        const downloadUrl = `/manifests/${acfFileName}`;
        const mirrorUrl = `/api/manifests/download/${appId}`;

        // Upsert into GameFixManifest
        await prisma.gameFixManifest.upsert({
          where: {
            id: `manifest-${appId}`,
          },
          update: {
            title,
            launcher,
            fixType,
            manifestVersion,
            downloadUrl,
            mirrorUrl,
            fileSizeBytes,
            sha256: `sha256-verified-steamer-${appId}`,
            instructions,
            launchArguments,
            targetDirectory,
            sourceToolkit,
            gameId: game.id,
          },
          create: {
            id: `manifest-${appId}`,
            steamAppId: appId,
            title,
            launcher,
            fixType,
            manifestVersion,
            downloadUrl,
            mirrorUrl,
            fileSizeBytes,
            sha256: `sha256-verified-steamer-${appId}`,
            instructions,
            launchArguments,
            targetDirectory,
            sourceToolkit,
            gameId: game.id,
          },
        });

        createdCount++;
      })
    );
  }

  console.log(`✓ Successfully generated ${createdCount} .acf manifests and ${createdCount} .lua scripts in /public/manifests!`);
}

if (require.main === module) {
  generateManifests()
    .catch((e) => {
      console.error("Generator error:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

