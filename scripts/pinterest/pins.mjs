// Styled, text-free Pinterest pins (1000x1500) in the look of popular web design pins:
// long page strips, monitor / laptop / phone mockups, tilted collages, on solid, gradient
// and blurred-photo backgrounds. Sources come from capture.mjs; the layout of each pin
// is in a per-template config (see configs/ and SKILL.md).
//   node scripts/pinterest/pins.mjs scripts/pinterest/configs/<slug>.json [filter]
import sharp from 'sharp';
import path from 'node:path';
import { mkdir, readFile } from 'node:fs/promises';

const cfg = JSON.parse(await readFile(process.argv[2], 'utf8'));
const base = path.resolve('.work/pinterest', cfg.slug);
const raw = (n) => path.join(base, 'raw', `${n}.png`);
const out = path.join(base, 'pins');
await mkdir(out, { recursive: true });
const PW = 1000, PH = 1500;

// ---------- primitives ----------
const svg = (w, h, body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`);
const round = async (buf, r) => {
  const { width: w, height: h } = await sharp(buf).metadata();
  return sharp(buf).composite([{ input: svg(w, h, `<rect width="${w}" height="${h}" rx="${r}"/>`), blend: 'dest-in' }]).png().toBuffer();
};
// Soft shadow for a w x h box placed at (x, y) on the pin.
const shadow = (x, y, w, h, r = 18, a = 0.3, blur = 26) => ({
  input: svg(PW, PH, `<filter id="f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${blur}"/></filter><rect x="${x + 4}" y="${y + 22}" width="${w - 8}" height="${h - 8}" rx="${r}" fill="rgba(0,0,0,${a})" filter="url(#f)"/>`),
  top: 0, left: 0,
});
const place = (input, x, y) => ({ input, left: Math.round(x), top: Math.round(y) });

// ---------- backgrounds ----------
const solid = (c) => async () => sharp(svg(PW, PH, `<rect width="${PW}" height="${PH}" fill="${c}"/>`)).png().toBuffer();
const gradient = (a, b) => async () => sharp(svg(PW, PH, `<defs><linearGradient id="g" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="${PW}" height="${PH}" fill="url(#g)"/>`)).png().toBuffer();
const glow = (base, light) => async () => sharp(svg(PW, PH, `<defs><radialGradient id="g" cx="0.5" cy="0.42" r="0.7"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${base}"/></radialGradient></defs><rect width="${PW}" height="${PH}" fill="url(#g)"/>`)).png().toBuffer();
const photo = (src, region, tint = 'rgba(0,0,0,0)') => async () => {
  const blurred = await sharp(raw(src)).extract(region).resize(PW, PH, { fit: 'cover' }).blur(28).modulate({ saturation: 1.15 }).png().toBuffer();
  return sharp(blurred).composite([{ input: svg(PW, PH, `<rect width="${PW}" height="${PH}" fill="${tint}"/>`) }]).png().toBuffer();
};

// ---------- source slices ----------
const desk = (s, top, height, width) => (top = Math.min(top, s.deskH - height), sharp)(raw(s.desk)).extract({ left: 0, top, width: 1440, height }).resize(width).png().toBuffer();
const mob = (s, top, w, h) => (top = Math.min(top, s.mobH - Math.round(780 * h / w)), sharp)(raw(s.mob)).extract({ left: 0, top, width: 780, height: Math.round(780 * h / w) }).resize(w, h).png().toBuffer();

// ---------- devices ----------
async function phone(s, top, w) {
  const h = Math.round(w * 2.16), b = Math.round(w * 0.045), r = Math.round(w * 0.14);
  const screen = await round(await mob(s, top, w, h), r - b);
  const W = w + 2 * b, H = h + 2 * b;
  const frame = svg(W, H, `<rect width="${W}" height="${H}" rx="${r + 2}" fill="#111"/><rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="${r}" fill="none" stroke="#3a3a3e" stroke-width="2"/>`);
  const island = svg(W, H, `<rect x="${W / 2 - w * 0.15}" y="${b + w * 0.035}" width="${w * 0.3}" height="${w * 0.085}" rx="${w * 0.0425}" fill="#0b0b0c"/>`);
  return { buf: await sharp(frame).composite([place(screen, b, b), { input: island }]).png().toBuffer(), w: W, h: H, r: r + 2 };
}
async function monitor(s, top, w) {
  const sw = w - 36, sh = Math.round(sw * 0.625);
  const screen = await desk(s, top, Math.round(1440 * 0.625), sw);
  const H = sh + 36 + 40 + 150;
  const body = svg(w, H, `<rect width="${w}" height="${sh + 36 + 40}" rx="26" fill="#e7e7ea"/><rect x="0" y="${sh + 36}" width="${w}" height="40" rx="0" fill="#d4d4d8"/>
    <path d="M${w / 2 - 70} ${sh + 76} L${w / 2 + 70} ${sh + 76} L${w / 2 + 95} ${H - 18} L${w / 2 - 95} ${H - 18} Z" fill="#c9c9cd"/>
    <rect x="${w / 2 - 150}" y="${H - 22}" width="300" height="22" rx="8" fill="#d8d8dc"/><rect x="18" y="18" width="${sw}" height="${sh}" fill="#000"/>`);
  return { buf: await sharp(body).composite([place(screen, 18, 18)]).png().toBuffer(), w, h: H, r: 26 };
}
async function laptop(s, top, w) {
  const sw = Math.round(w * 0.84), sh = Math.round(sw * 0.625), lid = sw + 28;
  const screen = await round(await desk(s, top, Math.round(1440 * 0.625), sw), 6);
  const H = sh + 28 + 26;
  const body = svg(w, H, `<rect x="${(w - lid) / 2}" y="0" width="${lid}" height="${sh + 28}" rx="20" fill="#1a1a1c"/>
    <path d="M0 ${sh + 28} L${w} ${sh + 28} L${w - 30} ${H} L30 ${H} Z" fill="#cfcfd3"/><rect x="${w / 2 - 70}" y="${sh + 28}" width="140" height="8" rx="4" fill="#b5b5ba"/>`);
  return { buf: await sharp(body).composite([place(screen, (w - sw) / 2, 14)]).png().toBuffer(), w, h: H, r: 20 };
}
// A browser-window card around a desktop slice.
async function browser(s, top, height, w) {
  const bar = 34, img = await desk(s, top, height, w);
  const { height: ih } = await sharp(img).metadata();
  const H = ih + bar;
  const chrome = svg(w, H, `<rect width="${w}" height="${H}" fill="#fff"/><rect width="${w}" height="${bar}" fill="#f1f1f3"/>
    <circle cx="20" cy="17" r="5.5" fill="#ff5f57"/><circle cx="38" cy="17" r="5.5" fill="#febc2e"/><circle cx="56" cy="17" r="5.5" fill="#28c840"/>
    <rect x="${w / 2 - 120}" y="9" width="240" height="16" rx="8" fill="#e3e3e6"/>`);
  return { buf: await round(await sharp(chrome).composite([place(img, 0, bar)]).png().toBuffer(), 14), w, h: H, r: 14 };
}

// ---------- layouts ----------
const L = {
  // One long page strip, bleeding off the bottom.
  async long(s, _bg, top) {
    const w = 800, x = 100, y = 110, h = PH - y + 40;
    const card = await round(await desk(s, top, Math.round(h * 1440 / w), w), 18);
    return [shadow(x, y, w, h), place(card, x, y)];
  },
  // Two strips side by side, the right one lower, like a stacked page preview.
  async columns(s, _bg, tops) {
    const w = 430, h = 1500;
    const a = await round(await desk(s, tops[0], Math.round(h * 1440 / w), w), 14);
    const b = await round(await desk(s, tops[1], Math.round(h * 1440 / w), w), 14);
    return [shadow(50, 80, w, h), place(a, 50, 80), shadow(520, 220, w, h), place(b, 520, 220)];
  },
  async monitor(s, _bg, top) {
    const m = await monitor(s, top, 900);
    const x = 50, y = (PH - m.h) / 2;
    return [shadow(x, y, m.w, m.h - 150, 26, 0.25, 30), place(m.buf, x, y)];
  },
  // Laptop with a phone leaning on it.
  async combo(s, _bg, top, mtop) {
    const l = await laptop(s, top, 900), p = await phone(s, mtop, 250);
    const lx = 50, ly = 330, px = 690, py = ly + l.h - p.h + 140;
    return [shadow(lx, ly, l.w, l.h, 20, 0.25), place(l.buf, lx, ly), shadow(px, py, p.w, p.h, p.r, 0.35), place(p.buf, px, py)];
  },
  // Three phones, the middle one raised.
  async trio(s, _bg, tops) {
    const ps = await Promise.all(tops.map((t) => phone(s, t, 280)));
    const xs = [30, 350, 670], ys = [420, 230, 420];
    return ps.flatMap((p, i) => [shadow(xs[i], ys[i], p.w, p.h, p.r, 0.32), place(p.buf, xs[i], ys[i])]);
  },
  async phone(s, _bg, top) {
    const p = await phone(s, top, 520);
    const x = (PW - p.w) / 2, y = (PH - p.h) / 2;
    return [shadow(x, y, p.w, p.h, p.r, 0.35, 34), place(p.buf, x, y)];
  },
  // Browser window over the page, phone in front.
  async window(s, _bg, top, mtop) {
    const b = await browser(s, top, 1000, 860), p = await phone(s, mtop, 300);
    const bx = 70, by = 200, px = 620, py = 640;
    return [shadow(bx, by, b.w, b.h, 14), place(b.buf, bx, by), shadow(px, py, p.w, p.h, p.r, 0.35), place(p.buf, px, py)];
  },
  // Many section cards in a grid, rotated, filling the pin.
  async tilted(s, _bg, tops) {
    const cw = 620, gap = 44, cols = 3;
    const cards = await Promise.all(tops.map(async ([t, h]) => round(await desk(s, t, h, cw), 16)));
    const heights = await Promise.all(cards.map(async (c) => (await sharp(c).metadata()).height));
    const W = cols * cw + (cols + 1) * gap;
    const colY = Array(cols).fill(gap);
    const layers = [];
    cards.forEach((c, i) => {
      const col = i % cols, x = gap + col * (cw + gap), y = colY[col] + (col === 1 ? 200 : 0);
      layers.push(place(c, x, y));
      colY[col] += heights[i] + gap;
    });
    const H = Math.max(...colY) + 260;
    const sheet = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(layers).png().toBuffer();
    const rot = await sharp(sheet).rotate(-22, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    const { width: rw, height: rh } = await sharp(rot).metadata();
    const crop = await sharp(rot).extract({ left: Math.round((rw - PW) / 2), top: Math.round((rh - PH) / 2), width: PW, height: PH }).png().toBuffer();
    return [place(crop, 0, 0)];
  },
};
// ---------- run ----------
// deskKeep drops empty stretches of the desktop page (sections that did not render in the
// capture): the listed [top, height] ranges are glued into one page.
let page = 'desktop';
if (cfg.deskKeep) {
  const parts = await Promise.all(cfg.deskKeep.map(([top, height]) => sharp(raw('desktop')).extract({ left: 0, top, width: 1440, height }).toBuffer()));
  let y = 0;
  const layers = cfg.deskKeep.map(([, h], i) => { const l = { input: parts[i], left: 0, top: y }; y += h; return l; });
  await sharp({ create: { width: 1440, height: y, channels: 3, background: '#fff' } }).composite(layers).png().toFile(raw('desktop-page'));
  page = 'desktop-page';
}
const meta = async (n) => (await sharp(raw(n)).metadata()).height;
const s = { ...cfg, desk: page, mob: 'mobile', deskH: await meta(page), mobH: cfg.mobileEnd ?? await meta('mobile') };
const makeBg = { solid: (b) => solid(b.color), gradient: (b) => gradient(b.from, b.to), glow: (b) => glow(b.base, b.light),
  photo: (b) => photo(page, { left: b.left ?? 0, top: b.top, width: b.width ?? 1440, height: b.height }, b.tint) };
const bgs = Object.fromEntries(Object.entries(cfg.backgrounds).map(([k, b]) => [k, makeBg[b.type](b)]));

const only = process.argv[3];
for (const [i, [kind, bgName, a, b]] of cfg.pins.entries()) {
  const file = `${cfg.slug}-${String(i + 1).padStart(2, '0')}-${kind}-${bgName}.png`;
  if (only && !file.includes(only)) continue;
  const arg = kind === 'tilted' ? (i % 2 ? [...cfg.sections].reverse() : cfg.sections) : a;
  const layers = await L[kind](s, bgName, arg, b);
  await sharp(await bgs[bgName]()).composite(layers).png().toFile(path.join(out, file));
  console.log(file);
}
