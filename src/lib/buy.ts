import type { CollectionEntry } from 'astro:content';

type TemplateData = CollectionEntry<'templates'>['data'];

// Where the main button of a template goes. Most templates are sold on Framer Marketplace, through
// the Framer referral link when there is one. A template with `buyUrl` is sold directly (for
// example on Contra): the button goes there, with no referral.
export function buyLink(t: TemplateData) {
  if (t.buyUrl) {
    return { href: t.buyUrl, sponsored: false, shop: t.soldOn ?? 'Contra', direct: true };
  }
  return { href: t.affiliateUrl ?? t.url, sponsored: Boolean(t.affiliateUrl), shop: 'Framer Marketplace', direct: false };
}

// Label of the main button.
export function buyLabel(t: TemplateData) {
  if (t.buyUrl) return 'Buy template';
  return t.price === 0 ? 'Use free on Framer' : 'Get on Framer';
}
