// Contact sheet of a template's rendered pins (6 per row, 200x300 each) to review them at a glance.
//   node scripts/marketing/pinterest/sheet.mjs <slug>   ->   .work/marketing/pinterest/<slug>/contact.png
import sharp from 'sharp';
import path from 'node:path';
import { readdir } from 'node:fs/promises';

const slug = process.argv[2];
if (!slug) throw new Error('usage: sheet.mjs <slug>');
const dir = path.resolve('.work/marketing/pinterest', slug);
const files = (await readdir(path.join(dir, 'pins'))).filter((f) => f.endsWith('.png')).sort();
const tiles = await Promise.all(files.map((f) => sharp(path.join(dir, 'pins', f)).resize(200, 300).toBuffer()));
await sharp({ create: { width: 1200, height: 300 * Math.ceil(tiles.length / 6), channels: 3, background: '#888' } })
  .composite(tiles.map((input, i) => ({ input, left: (i % 6) * 200, top: Math.floor(i / 6) * 300 })))
  .png().toFile(path.join(dir, 'contact.png'));
console.log(`${files.length} pins -> ${path.join(dir, 'contact.png')}`);
