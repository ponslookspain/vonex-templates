#!/usr/bin/env node
// Make the social preview image (1200x630) for each template: public/og/<slug>.png.
// These are what X, Threads, Telegram and others show when a template page is shared.
//
//   npm run og                  all templates
//   npm run og -- sanctun       only one
//
// The images are committed, not built on deploy, so the result does not depend on the fonts
// installed on the build server. Run it again after changing a template's name, tagline,
// price or cover. `npm run add-template` runs it for the new template automatically.
import { readFile, readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { parse as parseYaml } from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'src/content/templates');
const outDir = path.join(root, 'public/og');
const only = process.argv.slice(2);

const FONT = "Segoe UI, Arial, sans-serif";
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Split text into at most `maxLines` lines of about `max` characters.
function wrap(text, max, maxLines) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    if ((line + ' ' + word).trim().length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + '…';
  }
  return lines;
}

const logo = `<g transform="translate(70 62) scale(0.052)" fill="#fff"><polygon points="114.725 87.033 0 613.187 233.407 846.593 348.132 320.44 114.725 87.033"/><polygon points="901.978 233.407 668.571 0 553.846 526.154 233.407 846.593 466.813 1080 700.219 846.593 680.957 653.265 787.253 759.56 901.978 233.407"/></g>`;

async function makeOne(slug) {
  const t = parseYaml(await readFile(path.join(dir, `${slug}.yaml`), 'utf8'));
  // The cover is the `image` field of the YAML, relative to the YAML file.
  if (!t.image) throw new Error(`no image in src/content/templates/${slug}.yaml`);
  const coverPath = path.resolve(dir, t.image);

  const price = Number(t.price) === 0 ? 'Free' : `$${t.price}`;
  const nameLines = wrap(t.name, 13, 2);
  const taglineLines = wrap(t.tagline, 30, 2);
  const nameY = 290;
  const nameSize = 76;
  const taglineY = nameY + (nameLines.length - 1) * (nameSize + 6) + 62;
  const chipY = taglineY + (taglineLines.length - 1) * 42 + 52;

  const W = 1200, H = 630;
  const coverW = 520, coverH = 390, coverX = 640, coverY = 120;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <radialGradient id="g1" cx="78%" cy="45%" r="55%"><stop offset="0" stop-color="#0099ff" stop-opacity="0.34"/><stop offset="0.6" stop-color="#6366f1" stop-opacity="0.1"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="#000"/>
<rect width="${W}" height="${H}" fill="url(#g1)"/>
${logo}
<text x="132" y="98" font-family="${FONT}" font-size="30" font-weight="800" letter-spacing="1" fill="#f4f4f5">VONEX DESIGN</text>
<text x="70" y="214" font-family="${FONT}" font-size="26" font-weight="600" letter-spacing="3" fill="#0099ff">FRAMER TEMPLATE</text>
${nameLines.map((l, i) => `<text x="70" y="${nameY + i * (nameSize + 6)}" font-family="${FONT}" font-size="${nameSize}" font-weight="700" letter-spacing="-2.5" fill="#f4f4f5">${esc(l)}</text>`).join('\n')}
${taglineLines.map((l, i) => `<text x="70" y="${taglineY + i * 42}" font-family="${FONT}" font-size="32" fill="#9a9aa3">${esc(l)}</text>`).join('\n')}
<rect x="70" y="${chipY}" width="${price.length * 22 + 44}" height="52" rx="12" fill="${price === 'Free' ? '#0099ff' : '#f4f4f5'}"/>
<text x="${70 + (price.length * 22 + 44) / 2}" y="${chipY + 36}" text-anchor="middle" font-family="${FONT}" font-size="28" font-weight="700" fill="${price === 'Free' ? '#fff' : '#000'}">${esc(price)}</text>
<text x="70" y="585" font-family="${FONT}" font-size="24" fill="#9a9aa3">vonexdesign.com</text>
<rect x="${coverX - 2}" y="${coverY - 2}" width="${coverW + 4}" height="${coverH + 4}" rx="26" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="2"/>
</svg>`;

  const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${coverW}" height="${coverH}"><rect width="${coverW}" height="${coverH}" rx="24" fill="#fff"/></svg>`);
  const cover = await sharp(coverPath)
    .resize(coverW, coverH, { fit: 'cover' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  await mkdir(outDir, { recursive: true });
  await sharp(Buffer.from(svg))
    .composite([{ input: cover, left: coverX, top: coverY }])
    // Palette PNG: about 3x smaller, looks the same.
    .png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 })
    .toFile(path.join(outDir, `${slug}.png`));
  console.log(`public/og/${slug}.png`);
}

const slugs = only.length
  ? only
  : (await readdir(dir)).filter((f) => f.endsWith('.yaml')).map((f) => f.replace(/\.yaml$/, ''));
for (const slug of slugs) await makeOne(slug);
