// Loads a template config, refuses unsafe section lists, samples each section's own ground colour,
// picks a ground that no section melts into and picks the template's animations and carousels.
import sharp from 'sharp';
import path from 'node:path';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';

// Tried in this order. A site with both very dark and very light sections fails ink and paper, and lands on stone.
const GROUNDS = { ink: [16, 16, 20], paper: [242, 241, 238], stone: [142, 141, 136] };
const MIN_DISTANCE = 30;
const lab = (rgb) => {
  const [r, g, b] = rgb.map((v) => { const c = v / 255; return c > .04045 ? ((c + .055) / 1.055) ** 2.4 : c / 12.92; });
  const f = (t) => (t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const x = f((.4124 * r + .3576 * g + .1805 * b) / .95047), y = f(.2126 * r + .7152 * g + .0722 * b), z = f((.0193 * r + .1192 * g + .9505 * b) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
};
const distance = (a, b) => Math.hypot(...lab(a).map((v, i) => v - lab(b)[i]));
export function pickGround(colours) {
  const scored = Object.entries(GROUNDS).map(([name, rgb]) => ({ name, gap: Math.min(...colours.map((c) => distance(c, rgb))) }));
  return (scored.find((g) => g.gap >= MIN_DISTANCE) || scored.reduce((a, b) => (b.gap > a.gap ? b : a))).name;
}

// The pool. Three animations from three families, always one with a page scroll.
const FAMILIES = { 1: 'screens', 2: 'devices', 3: 'field', 4: 'scroll', 5: 'scroll', 6: 'screens', 9: 'devices' };
const CAROUSELS = ['c1', 'c2', 'c3', 'c4', 'c6'];
const shuffle = (list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export function pickSet(previous = { packs: [], carousels: [] }) {
  const fresh = shuffle(Object.keys(FAMILIES)).filter((p) => !previous.packs.includes(p));
  const packs = [fresh.find((p) => FAMILIES[p] === 'scroll')];
  for (const p of fresh) if (packs.length < 3 && !packs.some((q) => FAMILIES[q] === FAMILIES[p])) packs.push(p);
  return { packs, carousels: [...shuffle(CAROUSELS.filter((c) => !previous.carousels.includes(c))), ...shuffle(previous.carousels)].slice(0, 3) }; // only five carousels, so one may repeat
}

// A set is picked once and kept in the config, so a new render gives the same result and Vladimir can swap a part by hand.
export async function loadSet(slug) {
  if (!slug) return { packs: ['1', '2', '3'], carousels: ['c1', 'c2', 'c3'] };
  const dir = 'scripts/marketing/social/configs', file = `${dir}/${slug}.json`;
  const cfg = JSON.parse(await readFile(file, 'utf8'));
  if (cfg.packs && cfg.carousels) return { packs: cfg.packs, carousels: cfg.carousels };
  const others = await Promise.all((await readdir(dir)).filter((f) => f !== `${slug}.json`).map(async (f) => ({ cfg: JSON.parse(await readFile(`${dir}/${f}`, 'utf8')), at: (await stat(`${dir}/${f}`)).mtimeMs })));
  const last = others.filter((o) => o.cfg.packs).sort((a, b) => b.at - a.at)[0];
  const set = pickSet(last ? last.cfg : undefined);
  await writeFile(file, JSON.stringify({ ...cfg, ...set }));
  return set;
}

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
      return { top, h, cover: mode === 'cover', rgb: [...data], fill: `rgb(${data[0]},${data[1]},${data[2]})` };
    }));
  };
  const screens = await read('desktop', cfg.screens, 8, 'screens'), phones = await read('mobile', cfg.phones, 4, 'phones');
  // `ground` in a config is a manual override; normally it is measured.
  const ground = cfg.ground || pickGround([...screens, ...phones].map((s) => s.rgb));
  console.log(slug, 'ground:', ground);
  return encodeURIComponent(JSON.stringify({ slug, ground, titleHtml: cfg.titleHtml, screens, phones }));
}
