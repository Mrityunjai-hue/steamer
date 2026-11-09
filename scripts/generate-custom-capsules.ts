import fs from "fs";
import path from "path";

const capsulesDir = path.join(process.cwd(), "public", "images", "capsules");

if (!fs.existsSync(capsulesDir)) {
  fs.mkdirSync(capsulesDir, { recursive: true });
}

interface CustomBanner {
  slug: string;
  title: string;
  subtitle: string;
  tag: string;
  bgGradient: [string, string, string];
  accentColor: string;
  secondaryColor: string;
  patternType: "neon" | "noir" | "space" | "fantasy" | "action" | "horror";
}

const customBanners: CustomBanner[] = [
  {
    slug: "gta-6",
    title: "GRAND THEFT AUTO VI",
    subtitle: "ROCKSTAR GAMES • LEONIDA / VICE CITY",
    tag: "ANTICIPATED 2026",
    bgGradient: ["#1f0a2e", "#3b1154", "#120520"],
    accentColor: "#f43f5e",
    secondaryColor: "#a855f7",
    patternType: "neon",
  },
  {
    slug: "alan-wake-2",
    title: "ALAN WAKE II",
    subtitle: "REMEDY ENTERTAINMENT • SURVIVAL HORROR",
    tag: "GOTY CONTENDER",
    bgGradient: ["#260707", "#450a0a", "#140303"],
    accentColor: "#ef4444",
    secondaryColor: "#f97316",
    patternType: "horror",
  },
  {
    slug: "witcher-4",
    title: "THE WITCHER: POLARIS",
    subtitle: "CD PROJEKT RED • SAGA BEGINS",
    tag: "NEW SAGA",
    bgGradient: ["#0b1a24", "#163145", "#061017"],
    accentColor: "#38bdf8",
    secondaryColor: "#0284c7",
    patternType: "fantasy",
  },
  {
    slug: "max-payne-remake",
    title: "MAX PAYNE 1 & 2 REMAKE",
    subtitle: "REMEDY & ROCKSTAR • BULLET TIME NOIR",
    tag: "REMASTERED CLASSIC",
    bgGradient: ["#1c1409", "#2e2110", "#0f0b05"],
    accentColor: "#f59e0b",
    secondaryColor: "#d97706",
    patternType: "noir",
  },
  {
    slug: "control-2",
    title: "CONTROL II",
    subtitle: "REMEDY ENTERTAINMENT • FEDERAL BUREAU",
    tag: "SUPERNATURAL ACTION",
    bgGradient: ["#1c0a0f", "#33131c", "#0d0407"],
    accentColor: "#fb7185",
    secondaryColor: "#e11d48",
    patternType: "horror",
  },
  {
    slug: "judas",
    title: "JUDAS",
    subtitle: "GHOST STORY GAMES • KEN LEVINE",
    tag: "NARRATIVE FPS",
    bgGradient: ["#1e140a", "#38230e", "#100a04"],
    accentColor: "#fbbf24",
    secondaryColor: "#f59e0b",
    patternType: "noir",
  },
  {
    slug: "ark-2",
    title: "ARK II",
    subtitle: "STUDIO WILDCARD • SURVIVAL EVOLVED",
    tag: "NEXT-GEN SURVIVAL",
    bgGradient: ["#091a13", "#123326", "#040e0a"],
    accentColor: "#34d399",
    secondaryColor: "#10b981",
    patternType: "action",
  },
  {
    slug: "mass-effect-5",
    title: "MASS EFFECT: NEXT",
    subtitle: "BIOWARE • THE RELAY WILL RETURN",
    tag: "SCI-FI RPG",
    bgGradient: ["#061326", "#0f264a", "#030a14"],
    accentColor: "#60a5fa",
    secondaryColor: "#2563eb",
    patternType: "space",
  },
  {
    slug: "tomb-raider-next",
    title: "TOMB RAIDER: NEXT-GEN",
    subtitle: "CRYSTAL DYNAMICS • UNREAL ENGINE 5",
    tag: "ACTION ADVENTURE",
    bgGradient: ["#14190c", "#242d17", "#0a0d06"],
    accentColor: "#a3e635",
    secondaryColor: "#65a30d",
    patternType: "action",
  },
  {
    slug: "battlefield-6",
    title: "BATTLEFIELD 6",
    subtitle: "EA DICE • ALL-OUT WARFARE",
    tag: "TACTICAL MILITARY",
    bgGradient: ["#081824", "#102f47", "#040d14"],
    accentColor: "#38bdf8",
    secondaryColor: "#f97316",
    patternType: "action",
  },
  {
    slug: "elden-ring-nightreign",
    title: "ELDEN RING: NIGHTREIGN",
    subtitle: "FROMSOFTWARE • LANDS BETWEEN",
    tag: "DARK FANTASY",
    bgGradient: ["#171206", "#2d230d", "#0c0a03"],
    accentColor: "#fde047",
    secondaryColor: "#ca8a04",
    patternType: "fantasy",
  },
  {
    slug: "f1-25",
    title: "F1 25: 2026 EDITION",
    subtitle: "EA SPORTS • OFFICIAL FIA FORMULA ONE",
    tag: "RACING SIMULATION",
    bgGradient: ["#1c0a0a", "#361414", "#0f0505"],
    accentColor: "#ef4444",
    secondaryColor: "#b91c1c",
    patternType: "action",
  },
  {
    slug: "phantom-blade-zero",
    title: "PHANTOM BLADE ZERO",
    subtitle: "S-GAME • KUNGFU-PUNK SPECTACLE",
    tag: "ACTION RPG",
    bgGradient: ["#14080a", "#291115", "#0a0405"],
    accentColor: "#f43f5e",
    secondaryColor: "#881337",
    patternType: "action",
  },
  {
    slug: "clockwork-revolution",
    title: "CLOCKWORK REVOLUTION",
    subtitle: "INXILE ENTERTAINMENT • TIME BENDING",
    tag: "STEAMPUNK RPG",
    bgGradient: ["#1a1309", "#302412", "#0d0904"],
    accentColor: "#fbbf24",
    secondaryColor: "#b45309",
    patternType: "noir",
  },
  {
    slug: "light-no-fire",
    title: "LIGHT NO FIRE",
    subtitle: "HELLO GAMES • PROCEDURAL EARTH",
    tag: "OPEN WORLD FANTASY",
    bgGradient: ["#061a1a", "#0f3636", "#030d0d"],
    accentColor: "#2dd4bf",
    secondaryColor: "#0f766e",
    patternType: "fantasy",
  },
  {
    slug: "subnautica-2",
    title: "SUBNAUTICA 2",
    subtitle: "UNKNOWN WORLDS • ALIEN OCEANS",
    tag: "UNDERWATER SURVIVAL",
    bgGradient: ["#031821", "#072f40", "#010d12"],
    accentColor: "#38bdf8",
    secondaryColor: "#0369a1",
    patternType: "space",
  },
  {
    slug: "project-007",
    title: "PROJECT 007",
    subtitle: "IO INTERACTIVE • JAMES BOND ORIGIN",
    tag: "ESPIONAGE STEALTH",
    bgGradient: ["#141414", "#262626", "#0a0a0a"],
    accentColor: "#e5e5e5",
    secondaryColor: "#737373",
    patternType: "noir",
  },
  {
    slug: "resident-evil-1996",
    title: "RESIDENT EVIL (1996)",
    subtitle: "CAPCOM • SPENCER MANSION CLASSIC",
    tag: "SURVIVAL HORROR CLASSIC",
    bgGradient: ["#1c0808", "#331010", "#0e0404"],
    accentColor: "#dc2626",
    secondaryColor: "#7f1d1d",
    patternType: "horror",
  },
  {
    slug: "resident-evil-2-1998",
    title: "RESIDENT EVIL 2 (1998)",
    subtitle: "CAPCOM • RACCOON CITY POLICE DEPT",
    tag: "SURVIVAL HORROR CLASSIC",
    bgGradient: ["#080f1c", "#101d36", "#04080f"],
    accentColor: "#3b82f6",
    secondaryColor: "#1d4ed8",
    patternType: "horror",
  },
  {
    slug: "jurassic-world-evolution-3",
    title: "JURASSIC WORLD EVOLUTION 3",
    subtitle: "FRONTIER DEVELOPMENTS • DINOSAUR PARK",
    tag: "MANAGEMENT SIM",
    bgGradient: ["#0f170a", "#1d2e14", "#080c05"],
    accentColor: "#84cc16",
    secondaryColor: "#4d7c0f",
    patternType: "action",
  },
];

function generateSvg(b: CustomBanner): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 215" width="460" height="215">
  <defs>
    <linearGradient id="bg-${b.slug}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${b.bgGradient[0]}" />
      <stop offset="50%" stop-color="${b.bgGradient[1]}" />
      <stop offset="100%" stop-color="${b.bgGradient[2]}" />
    </linearGradient>
    <radialGradient id="sheen-${b.slug}" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="${b.accentColor}" stop-opacity="0.3" />
      <stop offset="100%" stop-color="${b.secondaryColor}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="badge-grad-${b.slug}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${b.accentColor}" />
      <stop offset="100%" stop-color="${b.secondaryColor}" />
    </linearGradient>
  </defs>

  <!-- Background Base -->
  <rect width="460" height="215" fill="url(#bg-${b.slug})" />

  <!-- Ambient Glow -->
  <circle cx="230" cy="80" r="180" fill="url(#sheen-${b.slug})" />

  <!-- Subtle Geometric Grid Lines -->
  <g stroke="white" stroke-opacity="0.04" stroke-width="1">
    <line x1="0" y1="40" x2="460" y2="40" />
    <line x1="0" y1="90" x2="460" y2="90" />
    <line x1="0" y1="140" x2="460" y2="140" />
    <line x1="0" y1="180" x2="460" y2="180" />
    <line x1="90" y1="0" x2="90" y2="215" />
    <line x1="230" y1="0" x2="230" y2="215" />
    <line x1="370" y1="0" x2="370" y2="215" />
  </g>

  <!-- Border Highlight -->
  <rect x="1" y="1" width="458" height="213" fill="none" stroke="${b.accentColor}" stroke-opacity="0.25" stroke-width="2" rx="4" />

  <!-- Category / Franchise Tag Pill (Top Left) -->
  <g transform="translate(20, 24)">
    <rect width="130" height="20" rx="3" fill="#000000" fill-opacity="0.6" stroke="${b.accentColor}" stroke-opacity="0.4" stroke-width="1" />
    <text x="65" y="14" fill="${b.accentColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="900" letter-spacing="1" text-anchor="middle">${b.tag}</text>
  </g>

  <!-- Center Watermark Logo Badge -->
  <g transform="translate(230, 85)" text-anchor="middle">
    <!-- Steam / Vault Emblem -->
    <circle cx="0" cy="-10" r="24" fill="#000000" fill-opacity="0.4" stroke="${b.accentColor}" stroke-opacity="0.3" stroke-width="1.5" />
    <path d="M-8 -10 L0 -18 L8 -10 L4 -10 L4 -2 L-4 -2 L-4 -10 Z" fill="${b.accentColor}" opacity="0.8" />
  </g>

  <!-- Main Game Title (Centered & High-Impact) -->
  <text x="230" y="130" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" letter-spacing="0.5" text-anchor="middle">${b.title}</text>

  <!-- Subtitle / Developer -->
  <text x="230" y="152" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" letter-spacing="1.5" text-anchor="middle">${b.subtitle}</text>

  <!-- Bottom Included Bar (Steam Authentic) -->
  <rect x="0" y="185" width="460" height="30" fill="#000000" fill-opacity="0.75" />
  <line x1="0" y1="185" x2="460" y2="185" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1" />

  <text x="20" y="204" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" letter-spacing="0.5">STEAM VAULT EDITION</text>

  <g transform="translate(365, 191)">
    <rect width="75" height="18" rx="2" fill="#4c6b22" />
    <text x="37.5" y="13" fill="#beee11" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="900" letter-spacing="0.5" text-anchor="middle">INCLUDED</text>
  </g>
</svg>`;
}

export function ensureCustomCapsule(title: string, customSlug?: string): string {
  const slug = customSlug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const filePath = path.join(capsulesDir, `${slug}.svg`);
  
  if (fs.existsSync(filePath)) {
    return `/images/capsules/${slug}.svg`;
  }

  // Generate generic stylish banner
  const banner: CustomBanner = {
    slug,
    title: title.toUpperCase(),
    subtitle: "OFFICIAL VAULT ARCHIVE",
    tag: "VAULT EDITION",
    bgGradient: ["#0f172a", "#1e293b", "#020617"],
    accentColor: "#38bdf8",
    secondaryColor: "#818cf8",
    patternType: "action",
  };

  fs.writeFileSync(filePath, generateSvg(banner), "utf8");
  return `/images/capsules/${slug}.svg`;
}

if (require.main === module) {
  for (const b of customBanners) {
    const filePath = path.join(capsulesDir, `${b.slug}.svg`);
    fs.writeFileSync(filePath, generateSvg(b), "utf8");
    console.log(`Generated custom banner: ${filePath}`);
  }
  console.log(`✓ All ${customBanners.length} custom game banners generated successfully!`);
}


