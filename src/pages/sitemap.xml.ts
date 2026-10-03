import type { APIRoute } from 'astro';

// Add every new page here (or generate the list from a collection) so search engines find it.
const pages = ['/', '/templates/'];

export const GET: APIRoute = ({ site }) => {
  const urls = pages
    .map((path) => `  <url><loc>${new URL(path, site).href}</loc></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
