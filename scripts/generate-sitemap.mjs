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

  // Dynamic content from Firestore
  for (const col of CONTENT_COLLECTIONS) {
    try {
      const snap = await getDocs(collection(db, col));
      console.log(`   • ${col}: ${snap.size} items`);
      snap.forEach((d) => {
        const data = d.data() || {};
        const lastmod =
          data.updatedAt?.toDate?.().toISOString?.().split('T')[0] ||
          data.createdAt?.toDate?.().toISOString?.().split('T')[0] ||
          new Date().toISOString().split('T')[0];
        // Both hash and clean URL — Google primarily uses clean URL via 404 redirect trick
        entries.push(urlEntry(`${SITE_URL}/item/${col}/${d.id}`, lastmod, '0.9', 'weekly'));
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
