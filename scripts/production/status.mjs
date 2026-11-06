#!/usr/bin/env node
// One table: how far each template has come along the pipeline (docs/production/template-pipeline.md),
// and what to do next. It reads local files only, no internet.
//
//   npm run status
//
// Columns: Site (YAML and pictures), Code (Contra link and a zip), Market (the 4 Marketplace
// preview images made), Pins (rendered / planned in the Pinterest config), Social (config, rendered
// set and captions), Cal (slots in the social calendar).
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { root, exists, listSlugs, readTemplate, latestZip, codeRepo } from './lib/templates.mjs';

const work = (...p) => path.join(root, '.work', ...p);
const count = async (dir, ext) => ((await exists(dir)) ? (await readdir(dir)).filter((f) => f.endsWith(ext)).length : 0);

let calendar = [];
try {
  const raw = JSON.parse(await readFile(work('marketing/social/calendar.json'), 'utf8'));
  calendar = Array.isArray(raw) ? raw : (raw.slots ?? raw.calendar ?? []);
} catch {
  /* no calendar on this machine */
}

const rows = [];
for (const slug of await listSlugs()) {
  const t = await readTemplate(slug);
  const siteOk = (await exists(path.join(root, `src/assets/templates/${slug}.webp`))) && (await exists(path.join(root, `public/og/${slug}.png`))) && t.overview && t.seoDescription;
  const zip = t.codeUrl ? await latestZip(slug) : undefined;
  const hasCodeRepo = await exists(codeRepo);

  let pinsPlanned = 0;
  const pinCfg = path.join(root, `scripts/marketing/pinterest/configs/${slug}.json`);
  if (await exists(pinCfg)) pinsPlanned = JSON.parse(await readFile(pinCfg, 'utf8')).pins?.length ?? 0;
  const pins = await count(work('marketing/pinterest', slug, 'pins'), '.png');

  const socialCfg = await exists(path.join(root, `scripts/marketing/social/configs/${slug}.json`));
  const socialRendered = await exists(work('marketing/social', slug, 'static/posts/flat.jpg'));
  const captions = await exists(work('marketing/social', slug, 'captions.md'));
  const slots = calendar.filter((s) => s.template === slug).length;
  const market = await count(work('marketing/marketplaces', slug), '.png');

  const cell = {
    site: siteOk ? 'yes' : 'NO',
    code: !t.codeUrl ? '-' : zip ? `v${zip}` : hasCodeRepo ? 'NO ZIP' : '?',
    market: market >= 5 ? 'yes' : market ? `${market}/5` : 'no',
    pins: pinsPlanned ? `${pins}/${pinsPlanned}` : 'no',
    social: socialRendered && captions ? 'yes' : socialCfg ? 'config' : 'no',
    cal: slots ? String(slots) : 'no',
  };
  // The next step follows the order of the pipeline: pins and posts link to a page that exists.
  const next = cell.site === 'NO' ? 'finish the template page' :
    cell.pins === 'no' ? 'make Pinterest pins' :
    pins < pinsPlanned ? 'render the missing pins' :
    cell.social !== 'yes' ? 'make the social set' :
    cell.cal === 'no' ? 'add to the calendar' :
    'nothing: all done';
  rows.push({ slug, offer: t.price === 0 ? (t.codeUrl ? 'free+code' : 'free') : (t.codeUrl ? 'paid+code' : 'paid'), ...cell, next });
}

const cols = ['slug', 'offer', 'site', 'code', 'market', 'pins', 'social', 'cal', 'next'];
const widths = cols.map((c) => Math.max(c.length, ...rows.map((r) => String(r[c]).length)));
const line = (r) => cols.map((c, i) => String(r[c]).padEnd(widths[i])).join('  ');
console.log(line(Object.fromEntries(cols.map((c) => [c, c.toUpperCase()]))));
console.log(widths.map((w) => '-'.repeat(w)).join('  '));
for (const r of rows) console.log(line(r));
