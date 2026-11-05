// Renders the looping motion packs of motion.html frame by frame through headless Chromium,
// so easing stays exact and the last frame meets the first.
//   node scripts/social/motion.mjs [slug]   (no slug: empty frames)
import sharp from 'sharp';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { loadSite } from './site.mjs';

const slug = process.argv[2], packs = ['1', '2', '3'];
const site = await loadSite(slug);
const FPS = 30, T = 8, W = 1080, H = 1920, PORT = 9333;
const out = path.resolve('.work/social', slug || 'empty', 'motion');
const browser = [process.env.BROWSER_PATH, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((p) => p && existsSync(p));
const proc = spawn(browser, ['--headless=new', `--remote-debugging-port=${PORT}`, '--remote-allow-origins=*', '--hide-scrollbars', `--user-data-dir=${mkdtempSync(path.join(tmpdir(), 'motion-'))}`, `--window-size=${W},${H}`, 'about:blank'], { stdio: 'ignore' });

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
await cdp('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });

const page = pathToFileURL(path.resolve('scripts/social/motion.html')).href;
for (const p of packs) {
  const dir = path.join(out, `pack-${p}`), frames = path.join(dir, 'tmp');
  await mkdir(frames, { recursive: true });
  await cdp('Page.navigate', { url: `${page}?pack=${p}&site=${site}` });
  await new Promise((r) => setTimeout(r, slug ? 6000 : 1500));
  const n = FPS * T;
  for (let i = 0; i < n; i++) {
    await cdp('Runtime.evaluate', { expression: `seek(${i / FPS})` });
    const { data } = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 95 });
    await writeFile(path.join(frames, `${String(i).padStart(4, '0')}.jpg`), Buffer.from(data, 'base64'));
  }
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', FPS, '-i', path.join(frames, '%04d.jpg'), '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-c:a', 'aac', '-t', T, path.join(dir, `pack-${p}.mp4`)].map(String));
  // Feed covers and carousel slides are 4:5 rest poses without words, so the grid stays clean.
  await cdp('Runtime.evaluate', { expression: `document.querySelectorAll('.cap').forEach((n) => n.remove())` });
  for (const [k, at] of [0, 1.9, 3.9, 5.9].entries()) {
    await cdp('Runtime.evaluate', { expression: `seek(${at})` });
    const { data } = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 95 });
    await sharp(Buffer.from(data, 'base64')).extract({ left: 0, top: 285, width: W, height: 1350 }).jpeg({ quality: 92 }).toFile(path.join(dir, `slide-${k + 1}.jpg`));
  }
  console.log('pack', p, 'done');
}
ws.close(); proc.kill();

// Feed preview: the three packs alternate, so neighbours never share a look.
const order = ['1', '2', '3', '2', '3', '1', '3', '1', '2'], tw = 300, th = 375, gap = 4, seen = {};
const tiles = await Promise.all(order.map(async (p, i) => { seen[p] = (seen[p] || 0) + 1; return { input: await sharp(path.join(out, `pack-${p}`, `slide-${seen[p]}.jpg`)).resize(tw, th).png().toBuffer(), left: (i % 3) * (tw + gap), top: Math.floor(i / 3) * (th + gap) }; }));
await sharp({ create: { width: tw * 3 + gap * 2, height: th * 3 + gap * 2, channels: 3, background: '#fff' } }).composite(tiles).png().toFile(path.join(out, 'grid-preview.png'));
