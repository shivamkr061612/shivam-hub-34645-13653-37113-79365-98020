// Generates public/sitemap.xml by fetching all content from Firestore.
// Runs during build (prebuild) so GitHub Pages serves a fresh sitemap on every deploy.

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL = 'https://techshivam.in';

const firebaseConfig = {
  apiKey: 'AIzaSyBK1VZTkg9Zflhcs8KpBLBMqn2phNK6YTA',
  authDomain: 'tech-esports.firebaseapp.com',
  databaseURL: 'https://tech-esports-default-rtdb.firebaseio.com',
  projectId: 'tech-esports',
  storageBucket: 'tech-esports.firebasestorage.app',
  messagingSenderId: '645283066219',
  appId: '1:645283066219:web:aab2cf1f4b92032b435c2e',
};

const STATIC_PAGES = [
  '/',
  '/mods',
  '/games',
  '/courses',
  '/assets',
  '/bundles',
  '/leaderboard',
  '/tech-ai',
  '/promotions',
  '/about-us',
  '/contact-us',
  '/privacy-policy',
  '/terms-conditions',
];

const CONTENT_COLLECTIONS = ['mods', 'games', 'courses', 'assets', 'bundles'];

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc, lastmod, priority = '0.7', changefreq = 'weekly') {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function main() {
  console.log('🗺️  Generating sitemap.xml ...');
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const entries = [];

  // Static pages
  for (const path of STATIC_PAGES) {
    entries.push(
      urlEntry(`${SITE_URL}${path}`, new Date().toISOString().split('T')[0], path === '/' ? '1.0' : '0.8', 'daily')
    );
  }

  // Slug helper (mirrors src/lib/slug.ts)
  const generateSlug = (input) => {
    if (!input) return 'item';
    return String(input)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, ' ')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'item';
  };

  // Dynamic content from Firestore — emit clean slug-based URLs only
  for (const col of CONTENT_COLLECTIONS) {
    try {
      const snap = await getDocs(collection(db, col));
      console.log(`   • ${col}: ${snap.size} items`);
      snap.forEach((d) => {
        const data = d.data() || {};
        const lastmod =
          data.updatedAt?.toDate?.().toISOString?.().split('T')[0] ||
          data.createdAt?.toDate?.().toISOString?.().split('T')[0] ||
          (typeof data.updatedAt === 'string' ? data.updatedAt.split('T')[0] : null) ||
          (typeof data.createdAt === 'string' ? data.createdAt.split('T')[0] : null) ||
          new Date().toISOString().split('T')[0];
        const slug = data.slug || generateSlug(data.title || data.name || d.id);
        entries.push(urlEntry(`${SITE_URL}/item/${col}/${slug}`, lastmod, '0.9', 'weekly'));
      });
    } catch (err) {
      console.warn(`   ! Failed to read ${col}:`, err.message);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

  const outDir = join(__dirname, '..', 'public');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'sitemap.xml'), xml, 'utf8');
  console.log(`✅ Wrote sitemap with ${entries.length} URLs to public/sitemap.xml`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Sitemap generation failed:', err);
  // Don't fail the build — write a minimal sitemap fallback
  const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${STATIC_PAGES.map((p) => urlEntry(`${SITE_URL}${p}`, new Date().toISOString().split('T')[0], '0.8', 'daily')).join('\n')}
</urlset>
`;
  try {
    writeFileSync(join(__dirname, '..', 'public', 'sitemap.xml'), fallback, 'utf8');
    console.log('⚠️  Wrote fallback sitemap with static pages only.');
  } catch {}
  process.exit(0);
});
