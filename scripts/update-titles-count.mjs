import fs from 'fs';
import path from 'path';

const files = [
  'app/page.tsx',
  'app/cart/page.tsx',
  'app/checkout/page.tsx',
  'app/dashboard/page.tsx',
  'app/game/[id]/page.tsx',
  'app/layout.tsx',
  'app/my-games/page.tsx',
  'app/onboarding/page.tsx',
  'app/setup-window/page.tsx',
  'app/admin/catalog/page.tsx',
  'app/admin/dashboard/page.tsx',
  'app/admin/settings/page.tsx',
  'components/FeaturedHeroCarousel.tsx',
  'components/Footer.tsx',
  'components/LiveSupportWidget.tsx',
  'components/Navbar.tsx',
  'docs/legal/LEGAL_AND_POLICIES.md',
  'lib/pricing.ts'
];

let totalReplacements = 0;
for (const relPath of files) {
  const fullPath = path.join(process.cwd(), relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    const count = (content.match(/245\+/g) || []).length;
    if (count > 0) {
      content = content.replace(/245\+/g, '265+');
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated ${relPath} (${count} replacements)`);
      totalReplacements += count;
    }
  }
}
console.log(`Done! Total replacements: ${totalReplacements}`);

