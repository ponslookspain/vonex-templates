// Renders the static posts and carousels of statics.html through headless Chromium.
//   node scripts/social/statics.mjs [slug]   (no slug: empty frames; run motion.mjs first for the feed preview)
import sharp from 'sharp';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { loadSite } from './site.mjs';

const slug = process.argv[2];
const site = await loadSite(slug);
const S = 1080, H = 1350, N = 5, PORT = 9334;
const out = path.resolve('.work/social', slug || 'empty', 'static');
const posts = ['flat', 'stacked', 'phone', 'tablet', 'wall', 'row'], carousels = ['c1', 'c2', 'c3'];
const browser = [process.env.BROWSER_PATH, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((p) => p && existsSync(p));
const proc = spawn(browser, ['--headless=new', `--remote-debugging-port=${PORT}`, '--remote-allow-origins=*', '--hide-scrollbars', `--user-data-dir=${mkdtempSync(path.join(tmpdir(), 'statics-'))}`, 'about:blank'], { stdio: 'ignore' });
let target;
for (let i = 0; i < 50 && !target; i++) {
  await new Promise((r) => setTimeout(r, 200));
  target = await fetch(`http://127.0.0.1:${PORT}/json`).then((r) => r.json()).then((l) => l.find((x) => x.type === 'page')).catch(() => null);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0; const wait = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && wait.has(m.id)) { wait.get(m.id)(m.result); wait.delete(m.id); } };
const cdp = (method, params = {}) => new Promise((r) => { wait.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
await cdp('Page.enable');
const page = pathToFileURL(path.resolve('scripts/social/statics.html')).href;
const shot = async (scene, width) => {
  await cdp('Emulation.setDeviceMetricsOverride', { width, height: H, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: `${page}?scene=${scene}&site=${site}` });
  await new Promise((r) => setTimeout(r, slug ? 5000 : 900));
  return Buffer.from((await cdp('Page.captureScreenshot', { format: 'png' })).data, 'base64');
};
await mkdir(path.join(out, 'posts'), { recursive: true });
for (const p of posts) await sharp(await shot(p, S)).jpeg({ quality: 92 }).toFile(path.join(out, 'posts', `${p}.jpg`));
for (const c of carousels) {
  const dir = path.join(out, c), strip = await shot(c, S * N);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'strip.png'), strip);
  for (let i = 0; i < N; i++) await sharp(strip).extract({ left: i * S, top: 0, width: S, height: H }).jpeg({ quality: 92 }).toFile(path.join(dir, `slide-${i + 1}.jpg`));
}
ws.close(); proc.kill();

// Overview of everything, then a feed that mixes posts, carousel covers and the video covers.
const tw = 300, th = 375, gap = 4;
const sheet = async (files, cols, name) => {
  const tiles = await Promise.all(files.map(async (f, i) => ({ input: await sharp(f).resize(tw, th).png().toBuffer(), left: (i % cols) * (tw + gap), top: Math.floor(i / cols) * (th + gap) })));
  const rows = Math.ceil(files.length / cols);
  await sharp({ create: { width: cols * tw + (cols - 1) * gap, height: rows * th + (rows - 1) * gap, channels: 3, background: '#fff' } }).composite(tiles).png().toFile(path.join(out, name));
};
const P = (n) => path.join(out, 'posts', `${n}.jpg`), C = (c, i) => path.join(out, c, `slide-${i}.jpg`), V = (p) => path.resolve('.work/social', slug || 'empty', `motion/pack-${p}/slide-1.jpg`);
await sheet([1, 2, 3, 4, 5].flatMap((i) => ['c1', 'c2', 'c3'].map((c) => C(c, i))), 3, 'carousels.png');
await sheet([P('flat'), V(2), C('c2', 1), P('phone'), C('c3', 1), V(1), V(3), P('stacked'), P('tablet')], 3, 'feed-preview.png');
console.log('done', out);
