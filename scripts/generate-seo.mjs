#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import glob from 'fast-glob';
import matter from 'gray-matter';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const contentDir = path.join(rootDir, 'src', 'content', 'blog');

const siteUrl = process.env.VITE_SITE_URL || 'https://ai-blog-engine.io';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function toAbsolute(urlPath) {
  const base = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
  const p = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
  return `${base}${p}`;
}

async function getBlogUrls() {
  if (!fs.existsSync(contentDir)) return [];
  const files = await glob('*.md', { cwd: contentDir, absolute: true });
  const entries = [];
  for (const file of files) {
    if (file.endsWith('.template')) continue;
    const raw = fs.readFileSync(file, 'utf8');
    const { data } = matter(raw);
    const slug = path.basename(file).replace(/\.md$/, '');
    const date = data?.date || undefined;
    entries.push({
      loc: toAbsolute(`/blog/${slug}`),
      lastmod: date ? new Date(date).toISOString() : undefined,
      changefreq: 'monthly',
      priority: 0.7,
    });
  }
  return entries;
}

async function generateSitemap() {
  const staticRoutes = [
    { loc: toAbsolute('/'), changefreq: 'weekly', priority: 1.0 },
    { loc: toAbsolute('/blog'), changefreq: 'weekly', priority: 0.8 },
  ];

  const blogRoutes = await getBlogUrls();
  const urls = [...staticRoutes, ...blogRoutes];

  const urlset = urls
    .map((u) => {
      return [
        '  <url>',
        `    <loc>${u.loc}</loc>`,
        u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>` : undefined,
        u.changefreq ? `    <changefreq>${u.changefreq}</changefreq>` : undefined,
        typeof u.priority === 'number' ? `    <priority>${u.priority.toFixed(1)}</priority>` : undefined,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urlset}\n` +
    `</urlset>\n`;

  ensureDir(publicDir);
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
}

function generateRobots() {
  const lines = [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${toAbsolute('/sitemap.xml')}`,
  ];

  ensureDir(publicDir);
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), lines.join('\n') + '\n', 'utf8');
}

async function main() {
  await generateSitemap();
  generateRobots();
  console.log('Generated sitemap.xml and robots.txt');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

