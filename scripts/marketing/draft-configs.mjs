#!/usr/bin/env node
// Drafts the three hand-written files of a template's marketing from one capture, so nobody
// reads a ruler or copies another template's config:
//   scripts/marketing/social/configs/<slug>.json      8 desktop and 4 phone sections
//   scripts/marketing/pinterest/configs/<slug>.json   colours, sections, the 18 pins and the Pinterest texts
//   .work/marketing/social/<slug>/captions.md         the caption set
//
//   npm run draft -- <slug>            write what does not exist yet
//   npm run draft -- <slug> --force    write everything again (a config you edited is lost)
//   npm run draft -- <slug> --dry-run  print, write nothing
//
// Needs `npm run capture` first: it saves .work/marketing/captures/<slug>/sections.json, the section
// bounds read from the page itself. Texts come from the template's YAML (name, pageKind, overview,
// description) and the optional `marketing` block there (audience, hashtags, keywords, topicBoard).
//
// These are DRAFTS made by rules. Look at them before rendering (npm run social:ruler -- <slug>, the
// contact sheet of the pins): the rules cannot see whether a crop is pretty.
import sharp from 'sharp';
import path from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { root, exists, readTemplate } from '../production/lib/templates.mjs';

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
const force = args.includes('--force');
const dry = args.includes('--dry-run');
if (!slug) {
  console.error('usage: npm run draft -- <slug> [--force] [--dry-run]');
  process.exit(1);
}

const capDir = path.join(root, '.work/marketing/captures', slug);
if (!(await exists(path.join(capDir, 'sections.json')))) {
  console.error(`No ${path.relative(root, capDir)}/sections.json. Run: npm run capture -- ${slug} <live demo url>`);
  process.exit(1);
}
const t = await readTemplate(slug);
if (!t.name) {
  console.error(`No template YAML for ${slug}: run npm run add-template first.`);
  process.exit(1);
}
const { desktop, mobile } = JSON.parse(await readFile(path.join(capDir, 'sections.json'), 'utf8'));
const kind = t.pageKind ?? t.category ?? 'Website';

// ---- sections -----------------------------------------------------------------------------

const MIN_DESKTOP = 300; // below this a block is a strip (logos, stats), too thin for a frame
const MAX_DESKTOP = 1800;
const SKIP = /nav|header|menu/i;

// Exactly 8 desktop sections that differ in height. Starting from every candidate, drop the one whose
// height is closest to a neighbour's, until 8 remain: the hero and the end of the page stay.
function pickScreens() {
  let list = desktop.sections.filter(([, h, name]) => h >= MIN_DESKTOP && !SKIP.test(name));
  while (list.length > 8) {
    let drop = -1, best = Infinity;
    for (let i = 1; i < list.length - 1; i++) {
      const gap = Math.min(Math.abs(list[i][1] - list[i - 1][1]), Math.abs(list[i][1] - list[i + 1][1]));
      if (gap < best) { best = gap; drop = i; }
    }
    list = list.filter((_, i) => i !== drop);
  }
  if (list.length < 8) throw new Error(`only ${list.length} desktop sections are 300 px or taller (${desktop.sections.map((s) => s[2]).join(', ')}): write "screens" by hand with npm run social:ruler`);
  return list.map(([top, h]) => [top, Math.min(h, MAX_DESKTOP)]);
}

// Four phone windows of about 1700 px that start on a section edge and never overlap.
const WINDOW = 1700;
function phoneTops(n) {
  const edges = mobile.sections.map(([top]) => top);
  const picks = [];
  for (let k = 0; k < n; k++) {
    const want = (mobile.height - WINDOW) * (k / Math.max(1, n - 1));
    const floor = picks.length ? picks[picks.length - 1] + WINDOW : 0;
    const top = edges.filter((e) => e >= floor && e <= mobile.height - WINDOW).sort((a, b) => Math.abs(a - want) - Math.abs(b - want))[0] ?? floor;
    picks.push(top);
  }
  return picks;
}

// ---- colours ------------------------------------------------------------------------------

const hex = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const lum = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
const sat = ([r, g, b]) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx ? (mx - mn) / mx : 0; };

// The brand colour is the most common saturated colour of the page; a black and white site has none,
// so its "brand" falls back to its darkest section colour.
async function palette() {
  const { data, info } = await sharp(path.join(capDir, 'desktop.png')).resize(48).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const buckets = new Map();
  const rows = [];
  for (let y = 0; y < info.height; y++) {
    let s = 0;
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 3, c = [data[i], data[i + 1], data[i + 2]];
      s += sat(c);
      if (sat(c) > 0.35 && lum(c) > 0.15) {
        const key = c.map((v) => v >> 4).join(',');
        const b = buckets.get(key) ?? { n: 0, sum: [0, 0, 0] };
        b.n++; c.forEach((v, k) => (b.sum[k] += v));
        buckets.set(key, b);
      }
    }
    rows.push(s / info.width);
  }
  const top = [...buckets.values()].sort((a, b) => b.n - a.n)[0];
  const meta = await sharp(path.join(capDir, 'desktop.png')).metadata();
  const grounds = await Promise.all(desktop.sections.map(async ([y]) => [...(await sharp(path.join(capDir, 'desktop.png')).extract({ left: 4, top: Math.min(y + 2, meta.height - 1), width: 1, height: 1 }).removeAlpha().raw().toBuffer())]));
  const dark = grounds.reduce((a, b) => (lum(b) < lum(a) ? b : a));
  const light = grounds.reduce((a, b) => (lum(b) > lum(a) ? b : a));
  const brand = top ? top.sum.map((v) => v / top.n) : dark;
  // Where the page is most colourful, for the blurred photo background.
  const scale = meta.height / info.height;
  const colourful = desktop.sections.filter(([, h]) => h >= MIN_DESKTOP).map(([y, h, name]) => {
    const a = Math.floor(y / scale), b = Math.min(rows.length, Math.ceil((y + h) / scale));
    return { y, h, name, score: rows.slice(a, b).reduce((s, v) => s + v, 0) / Math.max(1, b - a) };
  }).sort((a, b) => b.score - a.score)[0];
  return { brand, dark: lum(dark) < 0.3 ? dark : mix(brand, [0, 0, 0], 0.75), light: lum(light) > 0.7 ? light : mix(brand, [255, 255, 255], 0.9), colourful, pageH: meta.height };
}

// ---- the files ----------------------------------------------------------------------------

const screens = pickScreens();
const phones = phoneTops(4).map((top) => [top, Math.min(WINDOW, mobile.height - top)]);
const words = t.name.split(' ');
const titleHtml = words.length > 1 ? `${words.slice(0, -1).join(' ')} <em>${words[words.length - 1]}</em>` : `<em>${t.name}</em>`;
const socialConfig = { titleHtml, screens, phones };

const p = await palette();
const ink = hex(p.dark), paper = hex(p.light);
const photoTop = Math.max(0, Math.min(p.colourful.y, p.pageH - 1200));
const backgrounds = {
  ink: { type: 'solid', color: ink },
  paper: { type: 'solid', color: paper },
  sand: { type: 'solid', color: hex(mix(p.light, p.brand, 0.2)) },
  fade: { type: 'gradient', from: hex(p.brand), to: paper },
  glow: { type: 'glow', base: hex(mix(p.brand, [0, 0, 0], 0.72)), light: hex(p.brand) },
  soft: { type: 'photo', left: 300, top: photoTop, width: 840, height: 1200, tint: 'rgba(' + mix(p.light, [255, 255, 255], 0).map(Math.round).join(',') + ',.22)' },
};

// Pin layouts from the Pinterest document: long x4, columns x2, monitor x2, combo x2, trio x2, phone x2, window x2, tilted x2.
const D = screens.map(([top]) => top); // 8 desktop tops
const M = phoneTops(6); // 6 mobile tops
const pins = [
  ['long', 'fade', D[0]], ['long', 'ink', D[2]], ['long', 'sand', D[4]], ['long', 'paper', D[6]],
  ['columns', 'ink', [D[0], D[3]]], ['columns', 'sand', [D[1], D[5]]],
  ['monitor', 'ink', D[0]], ['monitor', 'soft', D[5]],
  ['combo', 'paper', D[0], M[0]], ['combo', 'glow', D[6], M[4]],
  ['trio', 'fade', [M[0], M[1], M[2]]], ['trio', 'ink', [M[3], M[4], M[5]]],
  ['phone', 'glow', M[0]], ['phone', 'sand', M[3]],
  ['window', 'ink', D[1], M[1]], ['window', 'soft', D[5], M[4]],
  ['tilted', 'paper'], ['tilted', 'ink'],
];

const ascii = (s) => s.replace(/&/g, 'and').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/[^\x20-\x7e]/g, '');
const lower = kind.toLowerCase();
const free = t.price === 0;
const m = t.marketing ?? {};
const pinterestConfig = {
  slug,
  url: t.preview,
  backgrounds,
  sections: screens.map(([top, h]) => [top, Math.min(h, 1250)]),
  pins,
  pinterest: {
    name: t.name,
    kind: ascii(`${kind} website`),
    pageTitle: ascii(`${free ? 'Free ' : ''}Framer ${kind} template`),
    topicBoard: ascii(m.topicBoard ?? `${kind} Website Design`),
    pitch: ascii(t.description ?? ''),
    keywords: (m.keywords ?? [`${lower} website design`, `${lower} landing page`]).map(ascii).concat(['framer template', ...(free ? ['free framer template'] : []), 'minimal website design', 'website template', 'web design inspiration']),
    generalBoard: 'Framer Templates',
  },
};
// The same order as the existing configs: pinterest block keys after pins.

const sentence = (s) => (s ?? '').split(/(?<=[.!?])\s+/)[0];
const tag = (s) => '#' + s.toLowerCase().replace(/[^a-z0-9]/g, '');
const hashtags = ['#framer', '#framertemplate', '#webdesign', ...(m.hashtags ?? [tag(kind.replace(/website/i, '') + ' website')]), '#websitedesign'].slice(0, 5).join(' ');
const hook = sentence(t.overview) || t.description;
const forWhom = m.audience ? `for ${m.audience}` : `for a ${lower} website`;
const offer = free ? `A free Framer template ${forWhom}.` : `A Framer template ${forWhom}.`;
const tail = free ? 'Free on Framer.' : 'On Framer.';
const captions = `# ${t.name}: posts and captions

DRAFT made by npm run draft from the template YAML. Read every line and rewrite what sounds generic before it is used.

Link for X and Threads: ${'https://vonexdesign.com'}/templates/${slug}/?utm_source=<x|threads>&utm_medium=social
Link in bio for Instagram and TikTok: https://vonexdesign.com/templates/?utm_source=<instagram|tiktok>&utm_medium=bio
Replace (link) with the X or Threads link. Instagram and TikTok use "Link in bio." and the hashtags instead.
Hashtags: ${hashtags}

## Videos (motion/pack-1, pack-2, pack-3)

${t.name} 01
Remix. Edit. Publish.
${offer}
(link)

${t.name} 02
${hook}
${tail}
(link)

${t.name} 03
${ascii(t.description ?? '')}
${free ? 'Free Framer template.' : 'Framer template.'}
(link)

## Carousels (static/c1, c2, c3; X takes 4 slides at most)

${hook}
${ascii(t.description ?? '')}
${tail}
(link)

## Single posts (static/posts)

${t.name}. ${offer}
(link)
`;

// ---- write --------------------------------------------------------------------------------

const targets = [
  ['scripts/marketing/social/configs', `${slug}.json`, JSON.stringify(socialConfig)],
  ['scripts/marketing/pinterest/configs', `${slug}.json`, JSON.stringify(pinterestConfig, null, 2) + '\n'],
  ['.work/marketing/social/' + slug, 'captions.md', captions],
];
for (const [dir, file, body] of targets) {
  const full = path.join(root, dir, file);
  const rel = path.relative(root, full).replace(/\\/g, '/');
  if (dry) { console.log(`--- ${rel}\n${body.slice(0, 900)}${body.length > 900 ? '\n...' : ''}`); continue; }
  if ((await exists(full)) && !force) { console.log(`kept     ${rel} (already there, use --force to replace)`); continue; }
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, body);
  console.log(`wrote    ${rel}`);
}
if (!dry) {
  console.log(`\nDrafts. Before rendering:
  - npm run social:ruler -- ${slug}, then look at ruler-desktop.png: are the 8 screens different, none a thin strip?
  - add "cover" as a third value to a full-bleed photo section (see docs/marketing/social.md)
  - after npm run pins:render, check the contact sheet (npm run pins:sheet -- ${slug})
  - check the texts in captions.md`);
}
