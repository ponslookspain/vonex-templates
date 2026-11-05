// Contact sheet of a capture with a y ruler, for picking exact section bounds for a config.
//   node scripts/social/ruler.mjs <slug>
import sharp from 'sharp';
import path from 'node:path';

const slug = process.argv[2], dir = path.resolve('.work/pinterest', slug, 'raw');
const svg = (w, h, b) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${b}</svg>`);
for (const [name, seg, scale] of [['desktop', 1500, 0.3], ['mobile', 3000, 0.16]]) {
  const file = path.join(dir, `${name}.png`), { width, height } = await sharp(file).metadata();
  const w = Math.round(width * scale), h = Math.round(seg * scale), cols = Math.ceil(height / seg), cw = w + 56, tiles = [];
  for (let c = 0; c < cols; c++) {
    const top = c * seg, part = Math.min(seg, height - top);
    tiles.push({ input: await sharp(file).extract({ left: 0, top, width, height: part }).resize(w).png().toBuffer(), left: c * cw + 50, top: 0 });
    const ticks = [];
    for (let y = 0; y < part; y += 100) ticks.push(`<rect x="${y % 500 ? 44 : 38}" y="${y * scale}" width="${y % 500 ? 6 : 12}" height="1" fill="#f00"/>${y % 500 ? '' : `<text x="0" y="${y * scale + 10}" font-size="11" fill="#f00">${top + y}</text>`}`);
    tiles.push({ input: svg(50, h, ticks.join('')), left: c * cw, top: 0 });
  }
  await sharp({ create: { width: cols * cw, height: h + 8, channels: 3, background: '#fff' } }).composite(tiles).png().toFile(path.join(dir, `ruler-${name}.png`));
}
