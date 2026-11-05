// Loads a template config, refuses unsafe section lists and samples each section's own ground colour.
import sharp from 'sharp';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

const check = (list, need, name, height, slug) => {
  if (list.length !== need) throw new Error(`${slug}: ${name} needs exactly ${need} sections, found ${list.length}`);
  const sorted = [...list].sort((a, b) => a[0] - b[0]);
  sorted.forEach(([top, h], i) => {
    if (top < 0 || top + h > height) throw new Error(`${slug}: ${name} section ${top}+${h} is outside the page`);
    if (i && sorted[i - 1][0] + sorted[i - 1][1] > top) throw new Error(`${slug}: ${name} sections overlap at ${top}`);
  });
};

export async function loadSite(slug) {
  if (!slug) return '';
  const cfg = JSON.parse(await readFile(`scripts/marketing/social/configs/${slug}.json`, 'utf8'));
  const dir = path.resolve('.work/marketing/captures', slug);
  const read = async (name, list, need, key) => {
    const file = path.join(dir, `${name}.png`), { height } = await sharp(file).metadata();
    check(list, need, key, height, slug);
    return Promise.all(list.map(async ([top, h, mode]) => {
      const { data } = await sharp(file).extract({ left: 4, top: top + 2, width: 1, height: 1 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      return { top, h, cover: mode === 'cover', fill: `rgb(${data[0]},${data[1]},${data[2]})` };
    }));
  };
  const screens = await read('desktop', cfg.screens, 8, 'screens'), phones = await read('mobile', cfg.phones, 4, 'phones');
  return encodeURIComponent(JSON.stringify({ slug, ground: cfg.ground, titleHtml: cfg.titleHtml, screens, phones }));
}
