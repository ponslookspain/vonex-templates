#!/usr/bin/env node
// Add a template to the catalog from its Framer Marketplace URL, or refresh existing ones.
//
//   npm run add-template -- https://www.framer.com/marketplace/templates/my-template/ --affiliate https://framer.link/xxxx
//   npm run sync-templates                 refresh every template from Framer
//
// It reads everything the Marketplace page has (description sections, categories, styles,
// Framer features, price, dates), downloads the pictures the template has on its Framer page
// (nothing else), writes src/content/templates/<slug>.yaml and makes the social preview image. Running it again for an existing template updates the data from Framer and
// keeps what you wrote yourself (see MANUAL below).
import { readFile, writeFile, mkdir, readdir, access } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { parse as parseYaml, stringify as toYaml } from 'yaml';
import { readTemplate, decode } from './lib/framer.mjs';
import { download, toWebp } from './lib/media.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.join(root, 'src/content/templates');
const assetsDir = path.join(root, 'src/assets/templates');

// Fields you own: never overwritten when a template is updated from Framer.
const MANUAL = ['description', 'affiliateUrl', 'featured', 'tags', 'category', 'added', 'preview'];

const { values: opt, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    all: { type: 'boolean', default: false }, // refresh every template
    category: { type: 'string' },
    tags: { type: 'string' }, // comma separated
    description: { type: 'string' },
    affiliate: { type: 'string' }, // framer.link/... referral link
    featured: { type: 'boolean' },
    'refresh-media': { type: 'boolean', default: false }, // download the images again
    'dry-run': { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

const usage = `Usage:
  npm run add-template -- <framer-template-url> [options]
  npm run sync-templates

Options:
  --affiliate <url>      Your Framer referral link (framer.link/...), used for "Open on Framer"
  --category <name>      Category shown on the card (default: detected)
  --tags a,b,c           Tags shown on the template page
  --description <text>   Short card description (default: the tagline)
  --featured             Show on the landing page (the first 3 featured are shown)
  --refresh-media        Download the images again
  --dry-run              Print the result without writing files
  --all                  Refresh every template (same as npm run sync-templates)`;

if (opt.help || (!opt.all && positionals.length !== 1)) {
  console.log(usage);
  process.exit(opt.help ? 0 : 1);
}

const fail = (msg) => {
  console.error(`Error: ${msg}`);
  process.exit(1);
};
const exists = (p) => access(p).then(() => true, () => false);
const rel = (p) => path.relative(root, p).replace(/\\/g, '/');
const day = (iso) => (iso ? String(iso).slice(0, 10) : undefined);

// ---- fallback when Framer changes its page: read the meta tags --------------------------

function metaFallback(html, slug) {
  const meta = (key) => {
    for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
      const k = tag.match(/\b(?:property|name)=["']([^"']+)["']/i)?.[1];
      if (k?.toLowerCase() === key) {
        const v = tag.match(/\bcontent=("([^"]*)"|'([^']*)')/i);
        if (v) return decode(v[2] ?? v[3]);
      }
    }
  };
  const title = meta('og:title') ?? '';
  const name = title.replace(/\s+[—–-]\s+(free\s+)?(website\s+)?template for framer.*$/i, '').trim() || slug;
  const desc = meta('og:description') ?? meta('description') ?? '';
  const price = /\bfree\b/i.test(title) ? 0 : Number(html.match(/"price"\s*:\s*"?(\d+(?:\.\d+)?)"?/)?.[1] ?? NaN);
  return {
    name,
    tagline: desc.split(/\s+[—–]\s+/)[0]?.trim() ?? '',
    price: Number.isFinite(price) ? price : undefined,
    previewUrl: html.match(/https:\/\/[a-z0-9-]+\.framer\.(?:website|app)\/?/i)?.[0],
    media: meta('og:image') ? [{ type: 'image', url: meta('og:image') }] : [],
    categories: [],
    styles: [],
    framerFeatures: [],
    intro: [],
    sections: [],
  };
}

// ---- one template ----------------------------------------------------------------------

async function importOne(slug, { flags }) {
  const yamlPath = path.join(contentDir, `${slug}.yaml`);
  const had = await exists(yamlPath);
  const old = had ? (parseYaml(await readFile(yamlPath, 'utf8')) ?? {}) : {};
  const pageUrl = `https://www.framer.com/marketplace/templates/${slug}/`;

  console.log(`\n${had ? 'Updating' : 'Adding'} ${slug} from ${pageUrl}`);
  const res = await readTemplate(slug);
  let d = res.data;
  const notes = [];
  if (!d) {
    d = metaFallback(res.html ?? '', slug);
    notes.push('Framer page format was not recognised: only the meta tags were read (no description sections, gallery or features). Check scripts/lib/framer.mjs.');
  }
  if (!d.name) fail('could not read the template name from the page');
  if (d.price === undefined) fail('could not detect the price');

  // ---- media: only the pictures the template has on its Framer page (no videos, no extra
  // screenshots). Files live in src/assets/templates/ and are optimized by Astro at build time.
  const dir = path.join(assetsDir, slug);
  const coverPath = path.join(assetsDir, `${slug}.webp`);
  const refresh = flags['refresh-media'];
  const gallery = [];
  const files = []; // [absolute path, Buffer]
  const have = async (p) => !refresh && (await exists(p));
  const save = (p, buf) => files.push([p, buf]);
  let imageIndex = 0;

  for (const m of d.media) {
    if (m.type === 'image') {
      imageIndex++;
      const p = imageIndex === 1 ? coverPath : path.join(dir, `framer-${imageIndex}.webp`);
      if (!(await have(p))) save(p, await toWebp(await download(m.url)));
      gallery.push({ type: 'image', src: `../../assets/templates/${imageIndex === 1 ? slug : `${slug}/framer-${imageIndex}`}.webp`, alt: `${d.name} template, preview ${imageIndex}` });
    }
    // Demo videos are not imported: the gallery shows pictures only.
  }
  if (!imageIndex && !(await exists(coverPath))) fail('the page has no cover image');

  // ---- the data file
  const categories = d.categories ?? [];
  const guessCategory = categories.find((c) => !/^(free|personal)$/i.test(c)) ?? d.mainCategory ?? 'Template';
  const data = {
    name: d.name,
    tagline: d.tagline || d.name,
    description: opt.description ?? old.description ?? `${d.tagline || d.name}.`,
    url: pageUrl,
    ...(opt.affiliate ?? old.affiliateUrl ? { affiliateUrl: opt.affiliate ?? old.affiliateUrl } : {}),
    ...((old.preview ?? d.previewUrl) ? { preview: old.preview ?? d.previewUrl } : {}),
    category: opt.category ?? old.category ?? guessCategory,
    price: d.price,
    tags: opt.tags ? opt.tags.split(',').map((t) => t.trim()).filter(Boolean) : (old.tags ?? []),
    image: `../../assets/templates/${slug}.webp`,
    featured: opt.featured ?? old.featured ?? false,
    added: old.added ? day(old.added instanceof Date ? old.added.toISOString() : old.added) : (day(d.publishedAt) ?? day(new Date().toISOString())),
    ...(d.updatedAt ? { updated: day(d.updatedAt) } : {}),
    ...(d.framerId ? { framerId: d.framerId } : {}),
    categories,
    styles: d.styles ?? [],
    framerFeatures: d.framerFeatures ?? [],
    intro: d.intro ?? [],
    sections: d.sections ?? [],
    gallery,
  };
  for (const k of MANUAL) if (old[k] !== undefined && opt[k] === undefined && k in data) data[k] = old[k] instanceof Date ? day(old[k].toISOString()) : old[k];

  const yaml = toYaml(data, { lineWidth: 0 });
  if (opt['dry-run']) {
    console.log(`--- ${rel(yamlPath)} (dry run)\n${yaml.slice(0, 1500)}${yaml.length > 1500 ? '\n...' : ''}`);
    console.log(`--- would write ${files.length} files`);
  } else {
    for (const [p, buf] of files) {
      await mkdir(path.dirname(p), { recursive: true }); // only folders that get a file
      await writeFile(p, buf);
    }
    await writeFile(yamlPath, yaml);
    console.log(`  ${had ? 'updated' : 'created'} ${rel(yamlPath)} (${gallery.length} gallery items, ${d.sections.length} text sections)`);
    for (const [p, buf] of files) console.log(`  wrote ${rel(p)} (${(buf.length / 1024).toFixed(0)} kB)`);
    // Social preview image: public/og/<slug>.png
    execFileSync(process.execPath, [path.join(root, 'scripts/generate-og.mjs'), slug], { stdio: 'inherit' });
  }

  if (!(opt.affiliate ?? old.affiliateUrl)) notes.push('no --affiliate link: "Open on Framer" goes to the Marketplace page without your referral');
  if (!had && !opt.description) notes.push('description is a draft (the tagline): write one or two sentences for the card');
  if (!had && !opt.tags) notes.push('no --tags given');
  if (d.price === 0 && /premium/i.test(`${d.intro?.join(' ')} ${d.sections?.[0]?.paragraphs?.join(' ') ?? ''}`)) notes.push('this template is free on Framer, but its description says "premium"');
  if (notes.length) console.log(`  Check:\n${notes.map((n) => `    - ${n}`).join('\n')}`);
}

// ---- main ------------------------------------------------------------------------------

let slugs;
if (opt.all) {
  slugs = (await readdir(contentDir)).filter((f) => f.endsWith('.yaml')).map((f) => f.replace(/\.yaml$/, ''));
} else {
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
  slugs = [slug];
}
for (const slug of slugs) {
  try {
    await importOne(slug, { flags: opt });
  } catch (e) {
    if (slugs.length === 1) fail(e.message);
    console.error(`  ${slug}: ${e.message}`);
  }
}
