#!/usr/bin/env node
// Make the social preview image (1200x630) for each template: public/og/<slug>.png.
// These are what X, Threads, Telegram and others show when a template page is shared.
//
//   npm run og                  all templates and the site image public/og-image.png
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

// Alpine look (DESIGN.md): white ground, black type in capitals, hairlines, square corners,
// the cover in a heavy black frame. Only black and white; the cover brings the colour.
const logo = (x, y, scale) => `<g transform="translate(${x} ${y}) scale(${scale})" fill="#000"><polygon points="114.725 87.033 0 613.187 233.407 846.593 348.132 320.44 114.725 87.033"/><polygon points="901.978 233.407 668.571 0 553.846 526.154 233.407 846.593 466.813 1080 700.219 846.593 680.957 653.265 787.253 759.56 901.978 233.407"/></g>`;
const W = 1200, H = 630;
const label = (x, y, text, anchor = 'start') =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FONT}" font-size="22" letter-spacing="3" fill="#000">${esc(text.toUpperCase())}</text>`;
// Top meta row and bottom hairline shared by every image.
const chrome = (left, right) => `<rect width="${W}" height="${H}" fill="#fff"/>
${logo(60, 44, 0.026)}
<text x="96" y="70" font-family="${FONT}" font-size="26" font-weight="700" letter-spacing="-1" fill="#000">VONEX DESIGN</text>
${label(W - 60, 70, right, 'end')}
<rect x="60" y="100" width="${W - 120}" height="1" fill="#000"/>
<rect x="60" y="${H - 78}" width="${W - 120}" height="1" fill="#000"/>
${label(60, H - 40, left)}
${label(W - 60, H - 40, 'vonexdesign.com', 'end')}`;

const headline = (lines, x, y, size) =>
  lines.map((l, i) => `<text x="${x}" y="${y + i * size * 0.9}" font-family="${FONT}" font-size="${size}" font-weight="700" letter-spacing="${-size * 0.06}" fill="#000">${esc(l.toUpperCase())}</text>`).join('\n');

async function render(svg, coverPath, out) {
  const coverW = 480, coverH = 360, frame = 8, coverX = W - 60 - coverW - frame * 2, coverY = 150;
  const layers = [];
  if (coverPath) {
    const cover = await sharp(coverPath).resize(coverW, coverH, { fit: 'cover' }).png().toBuffer();
    layers.push({ input: cover, left: coverX + frame, top: coverY + frame });
    svg = svg.replace('</svg>', `<rect x="${coverX}" y="${coverY}" width="${coverW + frame * 2}" height="${coverH + frame * 2}" fill="#000"/></svg>`);
  }
  await mkdir(path.dirname(out), { recursive: true });
  await sharp(Buffer.from(svg))
    .composite(layers)
    // Palette PNG: about 3x smaller, looks the same.
    .png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 })
    .toFile(out);
  console.log(path.relative(root, out));
}

async function makeOne(slug) {
  const t = parseYaml(await readFile(path.join(dir, `${slug}.yaml`), 'utf8'));
  // The cover is the `image` field of the YAML, relative to the YAML file.
  if (!t.image) throw new Error(`no image in src/content/templates/${slug}.yaml`);
  const price = Number(t.price) === 0 ? 'Free' : `$${t.price}`;
  const nameLines = wrap(t.name, 10, 2);
  const size = nameLines.some((l) => l.length > 7) ? 76 : 96;
  const taglineLines = wrap(t.tagline, 28, 2);
  const nameY = 230;
  const tagY = nameY + (nameLines.length - 1) * size * 0.9 + 60;
  const chipY = tagY + (taglineLines.length - 1) * 34 + 40;
  const chipW = price.length * 20 + 40;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${chrome(`${t.category ?? ''} Framer template`, 'Framer template')}
${headline(nameLines, 60, nameY, size)}
${taglineLines.map((l, i) => `<text x="60" y="${tagY + i * 34}" font-family="${FONT}" font-size="28" letter-spacing="-0.5" fill="#000">${esc(l)}</text>`).join('\n')}
<rect x="60" y="${chipY}" width="${chipW}" height="46" fill="${price === 'Free' ? '#fff' : '#000'}" stroke="#000" stroke-width="2"/>
<text x="${60 + chipW / 2}" y="${chipY + 31}" text-anchor="middle" font-family="${FONT}" font-size="22" letter-spacing="3" fill="${price === 'Free' ? '#000' : '#fff'}">${esc(price.toUpperCase())}</text>
</svg>`;
  await render(svg, path.resolve(dir, t.image), path.join(outDir, `${slug}.png`));
}

// Site-wide preview (public/og-image.png): the hero headline over the newest featured cover.
async function makeSite(slugs) {
  const all = await Promise.all(slugs.map(async (s) => ({ s, t: parseYaml(await readFile(path.join(dir, `${s}.yaml`), 'utf8')) })));
  all.sort((a, b) => Number(!!b.t.featured) - Number(!!a.t.featured) || String(b.t.added).localeCompare(String(a.t.added)));
  const hero = all[0];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${chrome(`${String(all.length).padStart(2, '0')} templates`, 'Framer templates')}
${headline(['Framer', 'templates.'], 60, 270, 104)}
<text x="60" y="440" font-family="${FONT}" font-size="28" letter-spacing="-0.5" fill="#000">Pick one, remix it, publish it today.</text>
</svg>`;
  await render(svg, hero ? path.resolve(dir, hero.t.image) : null, path.join(root, 'public/og-image.png'));
}

const slugs = only.length
  ? only
  : (await readdir(dir)).filter((f) => f.endsWith('.yaml')).map((f) => f.replace(/\.yaml$/, ''));
for (const slug of slugs) await makeOne(slug);
if (!only.length) await makeSite(slugs);
