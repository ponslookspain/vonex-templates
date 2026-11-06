// Pinterest bulk-create CSV for the pins of one or more templates.
//   node scripts/marketing/pinterest/csv.mjs [--start 2026-11-04] [--per-day 6] [--pins-url https://pins.vonexdesign.com] [--only part,part] <config.json> [<config.json> ...]
// Reads the "pinterest" block of each config (names, board, pitch, keywords) and the rendered
// pins, which upload.mjs puts in the R2 bucket vonex-pins (served as <pins-url>/<slug>-NN-<layout>-<bg>.jpg). Writes .work/marketing/pinterest/pinterest-bulk.csv.
// Pins of the templates are interleaved and layouts are spread out, so neighbours differ.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i < 0 ? def : args.splice(i, 2)[1]; };
const start = new Date(`${opt('--start', new Date(Date.now() + 864e5).toISOString().slice(0, 10))}T00:00:00`);
const perDay = Number(opt('--per-day', 3));
const PINS = opt('--pins-url', 'https://pins.vonexdesign.com');   // public address of the R2 bucket
const only = opt('--only', '');   // comma list of file-name parts: write just those rows (to re-upload failures)
// Posting hours of a day; with 3 a day the first three are used (10, 13, 16 would bunch up).
const hours = { 3: [10, 15, 20] }[perDay] ?? [9, 11, 13, 15, 17, 19, 20, 21].slice(0, perDay);
const SITE = 'https://vonexdesign.com';

// Two variants of the title and of the opening sentence for each layout.
const T = {
  long: ['full page preview', 'scrolling landing page layout', 'one page website design', 'complete homepage layout'],
  columns: ['page sections side by side', 'section by section preview'],
  monitor: ['desktop preview', 'desktop website mockup'],
  combo: ['laptop and phone mockup', 'responsive desktop and mobile layout'],
  trio: ['mobile screens', 'responsive mobile design'],
  phone: ['mobile layout', 'phone website mockup'],
  window: ['browser and mobile view', 'desktop and phone preview'],
  tilted: ['layout collage', 'sections collage'],
};
const D = {
  long: ['A full-page look at {name}, a {kind} template for Framer.', 'Scroll through the whole {name} layout, a {kind} built in Framer.'],
  columns: ['Two views of the {name} Framer template side by side.', 'Section by section: the {name} {kind} template for Framer.'],
  monitor: ['{name} on desktop, a {kind} template for Framer.', 'The {name} Framer template as a desktop website.'],
  combo: ['{name} on laptop and phone: fully responsive, built in Framer.', 'Desktop and mobile layouts of {name}, a {kind} template.'],
  trio: ['Three mobile screens of {name}, a responsive Framer template.', 'How {name} looks on a phone: a {kind} built in Framer.'],
  phone: ['{name} on mobile, a responsive {kind} template for Framer.', 'The mobile layout of {name}, made in Framer.'],
  window: ['{name} in the browser and on the phone, a Framer template.', 'Desktop and mobile views of the {name} {kind} template.'],
  tilted: ['A collage of {name} sections, a {kind} template for Framer.', 'Pages and sections of the {name} Framer template.'],
};
const BOARD_GENERAL = new Set(['monitor', 'combo', 'tilted']);
// Layout order that keeps similar pins apart in the schedule.
const ORDER = [0, 4, 6, 8, 10, 12, 14, 16, 1, 5, 7, 9, 11, 13, 15, 17, 2, 3];

const sets = [];
for (const file of args) {
  const cfg = JSON.parse(await readFile(file, 'utf8'));
  const p = cfg.pinterest;
  const seen = {};
  const pins = cfg.pins.map(([kind, bg], i) => {
    const n = (seen[kind] = (seen[kind] ?? -1) + 1), v = n % 2, tv = n % T[kind].length;
    const base = `${cfg.slug}-${String(i + 1).padStart(2, '0')}-${kind}-${bg}`;
    const fill = (s) => s.replace('{name}', p.name).replace('{kind}', p.kind);
    return {
      title: `${p.name} - ${p.pageTitle} (${T[kind][tv]})`,
      media: `${PINS}/${base}.jpg`,
      board: BOARD_GENERAL.has(kind) ? p.generalBoard : p.topicBoard,
      description: `${fill(D[kind][v])} ${p.pitch} Free to use: remix it in Framer, make it yours and publish without code. Tap to see the live preview.`,
      link: `${SITE}/templates/${cfg.slug}/?utm_source=pinterest&utm_medium=social&utm_campaign=${cfg.slug}&utm_content=${kind}-${bg}`,
      keywords: p.keywords.join(','),
    };
  });
  sets.push(ORDER.map((i) => pins[i]).filter(Boolean));
}

const rows = [];
for (let i = 0; sets.some((s) => i < s.length); i++) for (const s of sets) if (s[i]) rows.push(s[i]);

const pad = (n) => String(n).padStart(2, '0');
const q = (s) => `"${s.replace(/"/g, '""')}"`;
const lines = ['Title,Media URL,Pinterest board,Description,Link,Publish date,Keywords'];
const keep = only ? only.split(",") : null;
const titles = new Set();
rows.forEach((r, i) => {
  if (titles.has(r.title)) throw new Error(`duplicate title (Pinterest rejects it): ${r.title}`);
  titles.add(r.title);
  const d = new Date(start.getTime() + Math.floor(i / perDay) * 864e5);
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hours[i % perDay])}:00:00`;
  if (r.title.length > 100) throw new Error(`title too long (${r.title.length}): ${r.title}`);
  if (r.description.length > 500) throw new Error(`description too long (${r.description.length})`);
  for (const v of Object.values(r)) if (/[^\x20-\x7e]/.test(v)) throw new Error(`non-ASCII text: ${v}`);
  if (keep && !keep.some((k) => r.media.includes(k))) return;
  lines.push([r.title, r.media, r.board, r.description, r.link, date, r.keywords].map(q).join(','));
});
const out = path.resolve(only ? '.work/marketing/pinterest/pinterest-bulk-fix.csv' : '.work/marketing/pinterest/pinterest-bulk.csv');
await writeFile(out, lines.join('\r\n') + '\r\n');
console.log(`${lines.length - 1} pins -> ${out}`);
