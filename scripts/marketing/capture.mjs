// Capture a live template site for pins: desktop (1440 wide) and mobile (390 @2x, real mobile
// emulation) full pages through headless Edge or Chrome + DevTools protocol, then print where sections
// start and save a contact thumbnail.
//   node scripts/marketing/capture.mjs <slug> <live url>
// Output: .work/marketing/captures/<slug>/{desktop,mobile}.png and thumbs.png (desktop at 1/9 scale,
// mobile at 1/13, so y on the thumb x9 / x13 = y on the page).
//
// A plain `msedge --screenshot --window-size=390,...` is not enough: headless windows cannot be
// narrower than ~500px, so the page lays out wider than a phone and gets cut on the right.
// Device emulation sets the real 390px viewport, and scrolling through the page first makes
// Framer's appear-on-scroll sections render.
import sharp from 'sharp';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';

const [slug, url] = process.argv.slice(2);
if (!slug || !url) throw new Error('usage: capture.mjs <slug> <url>');
const dir = path.resolve('.work/marketing/captures', slug);
await mkdir(dir, { recursive: true });
// Any Chromium works. Set BROWSER_PATH to use a specific one, otherwise the usual install paths are tried.
const edge = [process.env.BROWSER_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge']
  .find((p) => p && existsSync(p));
if (!edge) throw new Error('No Chromium-based browser found: install Edge or Chrome, or set BROWSER_PATH.');
const port = 9300 + Math.floor(Math.random() * 500);
const profile = await mkdtemp(path.join(os.tmpdir(), 'pins-edge-'));
const browser = spawn(edge, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page'); } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const n = ++id;
  pending.set(n, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)));
  ws.send(JSON.stringify({ id: n, method, params }));
});
const evaluate = async (expr) => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result.value;

const sectionBounds = {};
async function capture(file, width, height, scale, mobile) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile });
  await send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
  await send('Page.navigate', { url });
  await sleep(5000);
  // Scroll down slowly so every appear-on-scroll section renders, then back to the top.
  await evaluate(`(async () => { const s = (ms) => new Promise(r => setTimeout(r, ms));
    for (let y = 0; y < document.documentElement.scrollHeight; y += ${Math.round(height * 0.6)}) { scrollTo(0, y); await s(250); }
    scrollTo(0, 0); await s(1500); })()`);
  // Framer's edit button and badge float over the design on preview links.
  await evaluate(`document.head.insertAdjacentHTML('beforeend', '<style>#__framer-badge-container,#__framer-editorbar,[id^="__framer-editorbar"],iframe[src*="framer"]{display:none!important}</style>')`);
  // Section bounds from the page itself, in pixels of the saved image. They feed draft-configs.mjs,
  // so nobody has to read a ruler to find where a section starts. Sticky and fixed parts are skipped.
  const found = await evaluate(`(() => {
    const W = innerWidth, total = document.documentElement.scrollHeight, SKIP = ['SCRIPT', 'STYLE', 'LINK', 'TEMPLATE', 'NOSCRIPT'];
    // Framer wraps sections in boxes with no height of their own (display: contents); look through them.
    const kidsOf = (n) => [...n.children].filter((k) => !SKIP.includes(k.tagName)).flatMap((el) => { const r = el.getBoundingClientRect(); return r.height === 0 && el.children.length ? kidsOf(el) : [{ el, top: r.top + scrollY, h: r.height, w: r.width }]; }).filter((b) => b.h > 0);
    const flow = (b) => !['fixed', 'sticky'].includes(getComputedStyle(b.el).position);
    let node = document.body;
    for (;;) { const big = kidsOf(node).find((b) => b.h >= 0.9 * total); if (!big) break; node = big.el; }
    const out = [];
    const collect = (n) => { for (const b of kidsOf(n)) { if (!flow(b) || b.w < W * 0.9) continue; if (b.h >= total * 0.45 && b.el.children.length > 1) collect(b.el); else if (b.h >= 100) out.push(b); } };
    collect(node);
    return out.sort((a, b) => a.top - b.top).map((b) => [Math.round(b.top), Math.round(b.h), b.el.getAttribute('data-framer-name') || b.el.tagName.toLowerCase()]);
  })()`);
  sectionBounds[file] = { height: (await evaluate('document.documentElement.scrollHeight')) * scale, sections: found.map(([t, h, n]) => [t * scale, h * scale, n]) };
  // Shoot screen by screen while scrolled there: some Framer blocks animate only while in view
  // and stay blank otherwise. After the first screen, fixed elements and short full-width
  // sticky bars (the header) are hidden so they do not repeat down the page; tall sticky blocks are content.
  const pageH = await evaluate('document.documentElement.scrollHeight');
  const parts = [];
  for (let y = 0; y < pageH; y += height) {
    const h = Math.min(height, pageH - y);
    await evaluate(`scrollTo(0, ${y})`);
    await sleep(1600);
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y, width, height: h, scale: 1 } });
    parts.push({ input: Buffer.from(shot.data, 'base64'), left: 0, top: y * scale });
    if (y === 0) await evaluate(`for (const el of document.querySelectorAll('body *')) { const p = getComputedStyle(el).position; if (p === 'fixed' || (p === 'sticky' && el.getBoundingClientRect().height < 160 && el.getBoundingClientRect().width > innerWidth * 0.8)) el.style.visibility = 'hidden'; }`);
  }
  await sharp({ create: { width: width * scale, height: pageH * scale, channels: 3, background: '#fff' } })
    .composite(parts).png().toFile(path.join(dir, file));
}
await send('Page.enable');
await capture('desktop.png', 1440, 900, 1, false);
await capture('mobile.png', 390, 844, 2, true);
ws.close();
browser.kill();
await writeFile(path.join(dir, 'sections.json'), JSON.stringify({ desktop: sectionBounds['desktop.png'], mobile: sectionBounds['mobile.png'] }));

// Rows where content starts after a tall blank gap = section starts.
for (const f of ['desktop.png', 'mobile.png']) {
  const meta = await sharp(path.join(dir, f)).metadata();
  const { data, info } = await sharp(path.join(dir, f)).resize(meta.width / 10 | 0).greyscale().raw().toBuffer({ resolveWithObject: true });
  const k = meta.width / info.width;
  let blank = 0;
  const starts = [];
  for (let y = 0; y < info.height; y++) {
    let mn = 255, mx = 0;
    for (let x = 0; x < info.width; x++) { const v = data[y * info.width + x]; mn = Math.min(mn, v); mx = Math.max(mx, v); }
    if (mx - mn < 8) blank++; else { if (blank * k >= 150) starts.push(Math.round(y * k)); blank = 0; }
  }
  console.log(f, `${meta.width}x${meta.height}`, 'section starts', starts.join(' '));
}
const d = await sharp(path.join(dir, 'desktop.png')).resize(160).toBuffer();
const m = await sharp(path.join(dir, 'mobile.png')).resize(60).toBuffer();
const dh = (await sharp(d).metadata()).height, mh = (await sharp(m).metadata()).height;
await sharp({ create: { width: 240, height: Math.max(dh, mh), channels: 3, background: '#f0f' } })
  .composite([{ input: d, left: 0, top: 0 }, { input: m, left: 180, top: 0 }]).png().toFile(path.join(dir, 'thumbs.png'));
console.log('thumbs:', path.join(dir, 'thumbs.png'));
