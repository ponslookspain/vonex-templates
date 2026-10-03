// Reads a template page on Framer Marketplace.
//
// The page contains the whole template record as JSON (inside the Next.js payload), which is
// much more complete than the meta tags: description, categories, styles, features, media,
// dates. We ask for that payload directly (header `RSC: 1`), and fall back to the HTML page
// and its meta tags if the format ever changes.

const UA = 'Mozilla/5.0 (vonex-templates importer)';

const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
export const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => entities[n.toLowerCase()] ?? m);

async function get(url, headers = {}) {
  const res = await fetch(url, { headers: { 'user-agent': UA, ...headers } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

// ---- JSON record ---------------------------------------------------------------------

function findBalanced(text, start) {
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return text.slice(start, i + 1);
  }
  return null;
}

// The record is the JSON object that has both `publishedAt` and `attributes`.
function findRecord(payload) {
  const at = payload.indexOf('"publishedAt"');
  if (at < 0) return null;
  let k = at;
  while ((k = payload.lastIndexOf('{', k - 1)) >= 0 && at - k < 120000) {
    const raw = findBalanced(payload, k);
    if (!raw || !raw.includes('"publishedAt"')) continue;
    try {
      const obj = JSON.parse(raw);
      if (obj.attributes && obj.title) return obj;
    } catch {
      /* keep walking outwards */
    }
  }
  return null;
}

// The description is a separate text chunk, referenced as "$<id>" and defined as `<id>:T<len>,<text>`.
function findBody(payload, record) {
  const ref = typeof record.body === 'string' ? record.body.match(/^\$([0-9a-f]+)$/i)?.[1] : null;
  if (!ref) return typeof record.body === 'string' ? record.body : '';
  const m = payload.match(new RegExp(`(?:^|\\n)${ref}:T([0-9a-f]+),`));
  if (!m) return '';
  const rest = payload.slice(m.index + m[0].length);
  // The length in the payload is in bytes; cut at the end of the last closing tag before the next line.
  const end = rest.search(/\n[0-9a-f]+:[\[{"IT$]/);
  const text = end >= 0 ? rest.slice(0, end) : rest;
  return text.slice(0, text.lastIndexOf('>') + 1);
}

// ---- description HTML -> blocks ------------------------------------------------------

function inline(html) {
  return decode(
    html
      .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => `[${label.replace(/<[^>]+>/g, '')}](${decode(href)})`)
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

// Returns [{ type: 'heading', level, text } | { type: 'p', text } | { type: 'list', items }].
export function parseBlocks(html) {
  const blocks = [];
  const re = /<(h[1-6]|p|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[1].toLowerCase();
    if (tag[0] === 'h') {
      const text = inline(m[2]);
      if (text) blocks.push({ type: 'heading', level: Number(tag[1]), text });
    } else if (tag === 'p') {
      const text = inline(m[2]);
      if (text) blocks.push({ type: 'p', text });
    } else {
      const items = [...m[2].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((x) => inline(x[1])).filter(Boolean);
      if (items.length) blocks.push({ type: 'list', items });
    }
  }
  return blocks;
}

// Flat sections in reading order: text before the first heading is the intro, then every
// heading starts a section holding its paragraphs and list items. The page decides how to
// show each section from its title (see src/lib/template-content.ts).
export function toSections(blocks) {
  const intro = [];
  const sections = [];
  let cur = null;
  for (const b of blocks) {
    if (b.type === 'heading') {
      cur = { title: b.text, paragraphs: [], items: [] };
      sections.push(cur);
    } else if (!cur) {
      if (b.type === 'p') intro.push(b.text);
    } else if (b.type === 'p') cur.paragraphs.push(b.text);
    else cur.items.push(...b.items);
  }
  const clean = sections.map((s) => ({
    title: s.title,
    ...(s.paragraphs.length ? { paragraphs: s.paragraphs } : {}),
    ...(s.items.length ? { items: s.items } : {}),
  }));
  return { intro, sections: clean };
}

// ---- main entry ----------------------------------------------------------------------

export async function readTemplate(slug) {
  const pageUrl = `https://www.framer.com/marketplace/templates/${slug}/`;
  let payload = '';
  try {
    payload = await get(pageUrl, { RSC: '1' });
  } catch {
    /* fall through to the HTML page */
  }
  let record = findRecord(payload);
  let html = '';
  if (!record) {
    html = await get(pageUrl);
    const chunks = [...html.matchAll(/self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g)].map((c) => JSON.parse(`"${c[1]}"`));
    payload = chunks.join('');
    record = findRecord(payload);
  }
  if (!record) return { pageUrl, record: null, html: html || (await get(pageUrl)) };

  const a = record.attributes ?? {};
  const bodyHtml = findBody(payload, record);
  const { intro, sections } = toSections(parseBlocks(bodyHtml));
  const names = (list) => (list ?? []).map((x) => x.name);
  return {
    pageUrl,
    record,
    data: {
      framerId: record.id,
      name: record.title,
      tagline: record.introduction ?? '',
      price: a.price == null ? 0 : Number(a.price),
      paymentUrl: a.paymentUrl,
      remixUrl: a.remixUrl,
      previewUrl: a.previewUrl,
      mainCategory: a.mainCategory?.name,
      categories: names(a.categories),
      styles: names(a.styles),
      framerFeatures: names(a.features),
      publishedAt: record.publishedAt,
      updatedAt: record.updatedAt,
      media: record.media ?? [],
      intro,
      sections,
    },
  };
}
