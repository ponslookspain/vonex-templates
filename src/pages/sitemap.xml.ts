import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Static pages are listed here; every template page is added automatically from the collection.
const pages = ['/', '/templates/'];

export const GET: APIRoute = async ({ site }) => {
  const templates = await getCollection('templates');
  const all = [...pages, ...templates.map((t) => `/templates/${t.id}/`)];
  const urls = all
    .map((path) => `  <url><loc>${new URL(path, site).href}</loc></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
