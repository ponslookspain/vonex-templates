#!/usr/bin/env node
// Clean up the local work folder and build caches. Nothing here is part of the site: all of it
// is generated and can be made again.
//
//   npm run clean              remove captures and scratch folders (.work/<area>/<slug>/raw|screens|tmp,
//                              .work/tmp) and the build caches (dist, .astro, .wrangler)
//   npm run clean -- --all     remove the whole .work folder too (pins, CSV files, everything)
//   npm run clean -- --dry-run only list what would go and how big it is
//
// Run it when a template's pins are uploaded and the CSV is in Pinterest, or when a code version
// is packed. Never touches src/, public/, scripts/ or anything under git.
import { readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const all = process.argv.includes('--all');
const dry = process.argv.includes('--dry-run');
const SCRATCH = new Set(['raw', 'screens', 'tmp']);

const exists = (p) => stat(p).then(() => true, () => false);
async function size(p) {
  const s = await stat(p);
  if (!s.isDirectory()) return s.size;
  let total = 0;
  for (const name of await readdir(p)) total += await size(path.join(p, name));
  return total;
}

const targets = [];
const work = path.join(root, '.work');
if (all) {
  if (await exists(work)) targets.push(work);
} else if (await exists(work)) {
  if (await exists(path.join(work, 'tmp'))) targets.push(path.join(work, 'tmp'));
  for (const area of await readdir(work, { withFileTypes: true })) {
    if (!area.isDirectory() || area.name === 'tmp') continue;
    for (const slug of await readdir(path.join(work, area.name), { withFileTypes: true })) {
      if (!slug.isDirectory()) continue;
      for (const sub of await readdir(path.join(work, area.name, slug.name), { withFileTypes: true }))
        if (sub.isDirectory() && SCRATCH.has(sub.name)) targets.push(path.join(work, area.name, slug.name, sub.name));
    }
  }
}
for (const cache of ['dist', '.astro', '.wrangler']) if (await exists(path.join(root, cache))) targets.push(path.join(root, cache));

let total = 0;
for (const t of targets) {
  if (!t.startsWith(root + path.sep)) throw new Error(`refusing to touch ${t}`);
  const bytes = await size(t);
  total += bytes;
  console.log(`${dry ? 'would remove' : 'removed'}  ${path.relative(root, t).padEnd(40)} ${(bytes / 1e6).toFixed(1)} MB`);
  if (!dry) await rm(t, { recursive: true, force: true });
}
console.log(targets.length ? `${dry ? 'Would free' : 'Freed'} ${(total / 1e6).toFixed(1)} MB` : 'Nothing to clean.');
