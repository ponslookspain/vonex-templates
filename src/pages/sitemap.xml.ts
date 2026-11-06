import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { guides } from '../data/guides';
import { categoryHref, categoryPages } from '../lib/categories';

// Static pages are listed here; every template page is added automatically from the collection.
const catalogPages = ['/', '/templates/', '/astro-templates/', '/guides/'];
// Text pages change by hand: keep each date the same as `updated` on the page.
const textPages = [
  { path: '/about/', lastmod: '2026-11-06' },
  { path: '/privacy/', lastmod: '2026-11-05' },
  { path: '/terms/', lastmod: '2026-11-03' },
  { path: '/license/', lastmod: '2026-11-03' },
  { path: '/refunds/', lastmod: '2026-11-03' },
];

export const GET: APIRoute = async ({ site }) => {
  const templates = await getCollection('templates');
  // Template pages carry their last update date, so search engines know when to recrawl them.
  const guidePages = guides.map((g) => ({ path: g.href, lastmod: new Date(g.updated + ' UTC').toISOString().slice(0, 10) }));
  const templatePages = templates.map((t) => ({ path: `/templates/${t.id}/`, lastmod: (t.data.updated ?? t.data.added).toISOString().slice(0, 10) }));
  // Catalog pages list guides and templates, so they change when the newest of those does.
  const newest = [...guidePages, ...templatePages].map((p) => p.lastmod).sort().at(-1);
  const all = [
    ...catalogPages.map((path) => ({ path, lastmod: newest })),
    ...textPages,
    ...categoryPages(templates).map((c) => ({ path: categoryHref(c.slug), lastmod: newest })),
    ...guidePages,
    ...templatePages,
  ];
  const urls = all
    .map(({ path, lastmod }) => `  <url><loc>${new URL(path, site).href}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
