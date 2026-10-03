#!/usr/bin/env node
// Add a template to the catalog from its Framer Marketplace URL.
//
//   npm run add-template -- https://www.framer.com/marketplace/templates/my-template/
//
// Reads the page's meta tags, downloads the cover image (resized to 1200x900 WebP) and
// writes src/content/templates/<slug>.yaml. Review the file afterwards: the card description
// in particular is only a first draft.
import { readFile, writeFile, access, mkdir } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const { values: opt, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    price: { type: 'string' }, // USD, 0 = free
    category: { type: 'string' },
    tags: { type: 'string' }, // comma separated
    description: { type: 'string' },
    affiliate: { type: 'string' }, // framer.link/... referral link
    featured: { type: 'boolean', default: false },
    force: { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
    html: { type: 'string' }, // read the page from a local file instead of fetching
    image: { type: 'string' }, // use a local image instead of the page's og:image
    help: { type: 'boolean', short: 'h', default: false },
  },
});

const usage = `Usage: npm run add-template -- <framer-template-url> [options]

Options:
  --price <usd>          Override the detected price (0 = free)
  --category <name>      Override the detected category
  --tags a,b,c           Tags shown on the card
  --description <text>   Card description (default: the template tagline)
  --affiliate <url>      Framer referral link (framer.link/...), used for the card link
  --featured             Show on the landing page (the first 3 featured are shown)
  --force                Overwrite an existing template
  --dry-run              Print the result without writing files
  --html <file>          Read the page from a local HTML file
  --image <file>         Use a local cover image instead of downloading it`;

if (opt.help || positionals.length !== 1) {
  console.log(usage);
  process.exit(opt.help ? 0 : 1);
}

const fail = (msg) => {
  console.error(`Error: ${msg}`);
  process.exit(1);
};

// ---- parsing -------------------------------------------------------------------------

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

function meta(html, key) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const k = tag.match(/\b(?:property|name)=["']([^"']+)["']/i)?.[1];
    if (k?.toLowerCase() === key) {
      const v = tag.match(/\bcontent=("([^"]*)"|'([^']*)')/i);
      if (v) return decode(v[2] ?? v[3]);
    }
  }
  return undefined;
}

const titleCase = (slug) =>
  slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

export function parsePage(html, url) {
  const ogTitle = meta(html, 'og:title') ?? html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? '';
  const free = /\bfree\b/i.test(ogTitle);
  const name = decode(ogTitle)
    .replace(/\s+[—–-]\s+(free\s+)?(website\s+)?template for framer.*$/i, '')
    .trim();

  const desc = meta(html, 'og:description') ?? meta(html, 'description') ?? '';
  // Marketplace descriptions look like "<Tagline> — <Name> is a premium ... template for Framer ..."
  const tagline = desc.split(/\s+[—–]\s+/)[0]?.trim() || '';

  let price = free ? 0 : undefined;
  if (price === undefined) {
    const m =
      html.match(/"price"\s*:\s*"?(\d+(?:\.\d+)?)"?/) ??
      html.match(/(?:^|[>"\s])\$\s?(\d+(?:\.\d{1,2})?)(?=[<"\s]|$)/);
    if (m) price = Number(m[1]);
  }

  const cat = html.match(/\/marketplace\/templates\/categories\/([a-z0-9-]+)\/?/i)?.[1];
  const preview = html.match(/https:\/\/[a-z0-9-]+\.framer\.(?:website|app)\/?/i)?.[0];

  return {
    name,
    tagline,
    price,
    category: cat ? titleCase(cat) : undefined,
    preview,
    image: meta(html, 'og:image') ?? meta(html, 'twitter:image'),
  };
}

// ---- main ----------------------------------------------------------------------------

let url;
try {
  url = new URL(positionals[0]);
} catch {
  fail('the argument must be a full URL, e.g. https://www.framer.com/marketplace/templates/my-template/');
}
const slug = url.pathname.match(/\/marketplace\/templates\/([a-z0-9-]+)\/?$/i)?.[1]?.toLowerCase();
if (!/(^|\.)framer\.com$/.test(url.hostname) || !slug) {
  fail('expected a Framer Marketplace template URL: https://www.framer.com/marketplace/templates/<name>/');
}
const pageUrl = `https://www.framer.com/marketplace/templates/${slug}/`;

const yamlPath = path.join(root, 'src/content/templates', `${slug}.yaml`);
const imagePath = path.join(root, 'src/assets/templates', `${slug}.webp`);
const exists = await access(yamlPath).then(() => true, () => false);
if (exists && !opt.force) fail(`${path.relative(root, yamlPath)} already exists (use --force to overwrite)`);

let html;
if (opt.html) {
  html = await readFile(opt.html, 'utf8');
} else {
  const res = await fetch(pageUrl, { headers: { 'user-agent': 'Mozilla/5.0 (vonex-templates add-template)' } });
  if (!res.ok) fail(`could not load ${pageUrl} (HTTP ${res.status})`);
  html = await res.text();
}

const page = parsePage(html, pageUrl);
if (!page.name) fail('could not read the template name from the page');

const price = opt.price !== undefined ? Number(opt.price) : page.price;
if (price === undefined || !Number.isFinite(price) || price < 0) {
  fail('could not detect the price. Re-run with --price <usd> (0 for free).');
}
const category = opt.category ?? page.category;
if (!category) fail('could not detect the category. Re-run with --category <name>.');

const notes = [];
const tagline = page.tagline || page.name;
if (!page.tagline) notes.push('tagline could not be read, edit it');
if (!opt.description) notes.push('description is a draft (the tagline), write one or two sentences');
if (!page.preview) notes.push('no live preview link found (optional field `preview`)');

const q = (s) => JSON.stringify(s);
const today = new Date().toISOString().slice(0, 10);
const tags = (opt.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean);

const lines = [
  `name: ${q(page.name)}`,
  `tagline: ${q(tagline)}`,
  `description: ${q(opt.description ?? `${tagline}.`)}`,
  `url: ${pageUrl}`,
  ...(opt.affiliate ? [`affiliateUrl: ${opt.affiliate}`] : []),
  ...(page.preview ? [`preview: ${page.preview}`] : []),
  `category: ${q(category)}`,
  `price: ${price}`,
  `tags: [${tags.map(q).join(', ')}]`,
  `image: ../../assets/templates/${slug}.webp`,
  `featured: ${opt.featured}`,
  `added: ${today}`,
];
const yaml = lines.join('\n') + '\n';

let imageBuf;
if (opt.image) {
  imageBuf = await readFile(opt.image);
} else if (page.image) {
  const res = await fetch(page.image);
  if (!res.ok) fail(`could not download the cover image (HTTP ${res.status}). Save it manually and use --image <file>.`);
  imageBuf = Buffer.from(await res.arrayBuffer());
} else {
  fail('no cover image found on the page. Use --image <file>.');
}
const webp = await sharp(imageBuf).resize(1200, 900, { fit: 'cover' }).webp({ quality: 88 }).toBuffer();

if (opt['dry-run']) {
  console.log(`--- ${path.relative(root, yamlPath)} (dry run)\n${yaml}`);
  console.log(`--- ${path.relative(root, imagePath)}: ${(webp.length / 1024).toFixed(0)} kB`);
} else {
  await mkdir(path.dirname(imagePath), { recursive: true });
  await writeFile(imagePath, webp);
  await writeFile(yamlPath, yaml);
  console.log(`Created ${path.relative(root, yamlPath)}\nCreated ${path.relative(root, imagePath)}`);
  // Social preview image for the template page: public/og/<slug>.png
  execFileSync(process.execPath, [path.join(root, 'scripts/generate-og.mjs'), slug], { stdio: 'inherit' });
}
if (!opt.affiliate) notes.push('no --affiliate link given, the card links to the Marketplace page directly');
if (notes.length) console.log(`\nCheck:\n${notes.map((n) => `  - ${n}`).join('\n')}`);
