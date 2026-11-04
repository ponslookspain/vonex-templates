import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { guides } from '../data/guides';
import { categoryHref, categoryPages } from '../lib/categories';

// Static pages are listed here; every template page is added automatically from the collection.
const pages = ['/', '/templates/', '/astro-templates/', '/guides/', '/about/', '/privacy/', '/terms/', '/license/', '/refunds/'];

export const GET: APIRoute = async ({ site }) => {
  const templates = await getCollection('templates');
  // Template pages carry their last update date, so search engines know when to recrawl them.
  const all = [
    ...pages.map((path) => ({ path, lastmod: undefined })),
    ...categoryPages(templates).map((c) => ({ path: categoryHref(c.slug), lastmod: undefined })),
    ...guides.map((g) => ({ path: g.href, lastmod: new Date(g.updated + ' UTC').toISOString().slice(0, 10) })),
    ...templates.map((t) => ({ path: `/templates/${t.id}/`, lastmod: (t.data.updated ?? t.data.added).toISOString().slice(0, 10) })),
  ];
  const urls = all
    .map(({ path, lastmod }) => `  <url><loc>${new URL(path, site).href}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
