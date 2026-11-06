import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { guides } from '../data/guides';
import { site } from '../data/site';

// A plain index of the site for AI tools. Templates and guides are added automatically.
export const GET: APIRoute = async ({ site: origin }) => {
  const templates = await getCollection('templates');
  const link = (path: string) => new URL(path, origin).href;
  const text = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    '## Templates',
    ...templates.map((t) => `- [${t.data.name}](${link(`/templates/${t.id}/`)}): ${t.data.description}`),
    '',
    '## Guides',
    ...guides.map((g) => `- [${g.title}](${link(g.href)}): ${g.description}`),
    '',
    '## About',
    `- [About ${site.name}](${link('/about/')})`,
    `- [Template license](${link('/license/')})`,
    '',
  ].join('\n');
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
