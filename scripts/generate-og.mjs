#!/usr/bin/env node
// Make the social preview images (1200x630): public/og/<slug>.png for each template,
// public/og/guides/<slug>.png for each guide, public/og/pages/<name>.png for the catalog pages,
// and the site image public/og-image.png. These are what X, Threads, Telegram and others show
// when a page is shared.
//
//   npm run og                  everything
//   npm run og -- harrier       only one template
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
// The site's Instrument Serif cannot be loaded here (sharp renders with system fonts), so the
// italic accent word uses Georgia, the closest serif installed everywhere.
const SERIF = "Georgia, 'Times New Roman', serif";
const PAPER = '#f2f1ee';
const INK = '#101014';
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

// Site look (DESIGN.md): warm paper, ink type in sentence case with one italic serif word,
// page rails and hairlines, square corners, the cover in a heavy ink frame.
const logo = (x, y, scale) => `<g transform="translate(${x} ${y}) scale(${scale})" fill="${INK}"><polygon points="114.725 87.033 0 613.187 233.407 846.593 348.132 320.44 114.725 87.033"/><polygon points="901.978 233.407 668.571 0 553.846 526.154 233.407 846.593 466.813 1080 700.219 846.593 680.957 653.265 787.253 759.56 901.978 233.407"/></g>`;
const W = 1200, H = 630;
const label = (x, y, text, anchor = 'start') =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FONT}" font-size="20" letter-spacing="3" fill="${INK}" fill-opacity="0.7">${esc(text.toUpperCase())}</text>`;
const hairline = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${INK}" fill-opacity="0.16"/>`;
// Rails, top meta row and bottom bar shared by every image.
const chrome = (left, right) => `<rect width="${W}" height="${H}" fill="${PAPER}"/>
${hairline(40, 0, 1, H)}
${hairline(W - 41, 0, 1, H)}
${logo(60, 44, 0.026)}
<text x="96" y="70" font-family="${FONT}" font-size="26" font-weight="700" letter-spacing="-1" fill="${INK}">Vonex Design</text>
${label(W - 60, 70, right, 'end')}
${hairline(40, 100, W - 80, 1)}
${hairline(40, H - 78, W - 80, 1)}
${label(60, H - 40, left)}
${label(W - 60, H - 40, 'vonexdesign.com', 'end')}`;

// Headline lines in sentence case; the word `accent` (if any) is set in italic serif.
const headline = (lines, x, y, size, accent) =>
  lines.map((l, i) => {
    const words = l.split(' ').map((w) => {
      const bare = w.replace(/[.,?!:]$/, '');
      if (accent && bare === accent) {
        const tail = w.slice(bare.length);
        return `<tspan font-family="${SERIF}" font-style="italic" font-weight="400" letter-spacing="${-size * 0.02}">${esc(bare)}</tspan>${esc(tail)}`;
      }
      return esc(w);
    });
    return `<text x="${x}" y="${y + i * size * 1.02}" font-family="${FONT}" font-size="${size}" font-weight="700" letter-spacing="${-size * 0.035}" fill="${INK}">${words.join(' ')}</text>`;
  }).join('\n');

async function render(svg, coverPath, out) {
  const coverW = 480, coverH = 360, frame = 8, coverX = W - 60 - coverW - frame * 2, coverY = 150;
  const layers = [];
  if (coverPath) {
    const cover = await sharp(coverPath).resize(coverW, coverH, { fit: 'cover' }).png().toBuffer();
    layers.push({ input: cover, left: coverX + frame, top: coverY + frame });
    svg = svg.replace('</svg>', `<rect x="${coverX}" y="${coverY}" width="${coverW + frame * 2}" height="${coverH + frame * 2}" fill="${INK}"/></svg>`);
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
  const size = nameLines.some((l) => l.length > 7) ? 72 : 88;
  const taglineLines = wrap(t.tagline, 28, 2);
  const nameY = 230;
  const tagY = nameY + (nameLines.length - 1) * size * 1.02 + 60;
  const chipY = tagY + (taglineLines.length - 1) * 34 + 40;
  const chipW = price.length * 20 + 40;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${chrome(`${t.category ?? ''} Framer template`, 'Framer template')}
${headline(nameLines, 60, nameY, size)}
${taglineLines.map((l, i) => `<text x="60" y="${tagY + i * 34}" font-family="${FONT}" font-size="28" letter-spacing="-0.5" fill="${INK}">${esc(l)}</text>`).join('\n')}
<rect x="60" y="${chipY}" width="${chipW}" height="46" fill="${price === 'Free' ? PAPER : INK}" stroke="${INK}" stroke-width="2"/>
<text x="${60 + chipW / 2}" y="${chipY + 31}" text-anchor="middle" font-family="${FONT}" font-size="22" letter-spacing="3" fill="${price === 'Free' ? INK : PAPER}">${esc(price.toUpperCase())}</text>
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
${headline(['Framer', 'templates.'], 60, 270, 104, 'templates')}
<text x="60" y="440" font-family="${FONT}" font-size="28" letter-spacing="-0.5" fill="${INK}">Pick one, remix it, publish it today.</text>
</svg>`;
  await render(svg, hero ? path.resolve(dir, hero.t.image) : null, path.join(root, 'public/og-image.png'));
}

// A text page (guide, catalog page): label, headline with its accent word, one line under it.
async function makePage({ out, label: kind, title, accent, sub }) {
  const lines = wrap(title, 22, 3);
  const size = lines.length > 2 ? 68 : 80;
  const subY = 230 + (lines.length - 1) * size * 1.02 + 64;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${chrome(kind, 'Framer templates')}
${headline(lines, 60, 230, size, accent)}
${wrap(sub, 62, 2).map((l, i) => `<text x="60" y="${subY + i * 36}" font-family="${FONT}" font-size="28" letter-spacing="-0.5" fill="${INK}" fill-opacity="0.75">${esc(l)}</text>`).join('\n')}
</svg>`;
  await render(svg, null, path.join(root, 'public', out));
}

// Guides come from src/data/guides.ts (read as text: the script runs without a TS loader). The
// accent word matches the one each guide passes to LegalPage.
const ACCENTS = {
  'how-to-use-framer-templates': 'template', 'framer-pricing': 'free', 'framer-cms': 'posts',
  'framer-portfolio-template': 'portfolio', 'framer-vs-webflow': 'vs', 'free-framer-portfolio-templates': 'free',
  'framer-saas-app-templates': 'app', 'framer-or-code': 'code',
  'how-to-make-a-portfolio-website': 'portfolio', 'portfolio-website-examples': 'examples', 'therapist-website': 'therapist',
};
async function guidePages() {
  const src = await readFile(path.join(root, 'src/data/guides.ts'), 'utf8');
  const items = [...src.matchAll(/href: '\/guides\/([^/]+)\/',\s*title: '([^']+)',\s*description: '([^']+)',\s*group: '(\w+)',\s*kind: '([^']+)'/g)];
  return items.map(([, slug, title, sub, , kind]) => ({ out: `og/guides/${slug}.png`, label: `Guide · ${kind}`, title, accent: ACCENTS[slug], sub }));
}
const PAGES = [
  { out: 'og/pages/templates.png', label: 'Catalog', title: 'Website templates.', accent: 'templates', sub: 'Portfolio, agency, app and SaaS websites, in Framer or as code.' },
  { out: 'og/pages/guides.png', label: 'Guides', title: 'Framer guides.', accent: 'guides', sub: 'How to use a template, what Framer costs, the CMS, and template roundups.' },
  { out: 'og/pages/about.png', label: 'About', title: 'About Vonex Design.', accent: 'Design', sub: 'A small catalog of Framer templates made by Vladimir.' },
];

const slugs = only.length
  ? only
  : (await readdir(dir)).filter((f) => f.endsWith('.yaml')).map((f) => f.replace(/\.yaml$/, ''));
for (const slug of slugs) await makeOne(slug);
if (!only.length) {
  await makeSite(slugs);
  for (const page of [...PAGES, ...(await guidePages())]) await makePage(page);
}
