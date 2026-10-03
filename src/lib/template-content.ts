// Turns the raw description sections imported from Framer into what the template page shows.
//
// Templates are described differently from author to author (some use clear headings like
// "Features" and "Pages Included", others write free text), so sections are recognised by
// their title and everything else is shown as plain text. Nothing here is specific to one
// template.
import type { CollectionEntry } from 'astro:content';

type Template = CollectionEntry<'templates'>['data'];
type Section = Template['sections'][number];

export interface ListBlock {
  id: string;
  kind: 'features' | 'pages' | 'sections' | 'bestFor' | 'included' | 'list';
  title: string;
  items: string[];
}
export interface TextBlock {
  id: string;
  kind: 'text';
  title: string;
  paragraphs: string[];
}
export interface Update {
  title: string;
  items: string[];
}
export interface TemplateContent {
  leadTitle?: string;
  lead: string[];
  about: string[];
  benefitsTitle: string;
  benefits: { title: string; text: string }[];
  blocks: (ListBlock | TextBlock)[];
  updates: Update[];
  support?: string;
  pages: string[];
  // Named parts of a one-page template ("Included Sections") when it has no separate pages.
  sectionNames: string[];
  cmsParts: string[];
  hasCms: boolean;
}

const norm = (s: string) => s.toLowerCase().replace(/[:.?]+$/g, '').trim();
const isAbout = (t: string) => /^about\b/.test(t);
const isWhyHeader = (t: string) => /^why\b/.test(t);
const isSupport = (t: string) => /^support\b/.test(t);
const isUpdates = (t: string) => /^(updates?|changelog|what.?s new)$/.test(t);
const isVersion = (t: string) => /^v?\d+(\.\d+)*\b/.test(t);

function listKind(t: string): ListBlock['kind'] | null {
  if (/^features?\b/.test(t)) return 'features';
  if (/pages?\b.*included|included\b.*pages?|^pages?$/.test(t)) return 'pages';
  if (/sections?\b.*included|included\b.*sections?|^sections?$/.test(t)) return 'sections';
  if (/^best for\b/.test(t)) return 'bestFor';
  if (/^(included|what.?s included)$/.test(t)) return 'included';
  return null;
}

export function buildContent(t: Template): TemplateContent {
  const sections = t.sections;
  const out: TemplateContent = {
    lead: [...t.intro],
    about: [],
    benefitsTitle: 'Highlights',
    benefits: [],
    blocks: [],
    updates: [],
    pages: [],
    sectionNames: [],
    cmsParts: [],
    hasCms: t.framerFeatures.some((f) => /^cms$/i.test(f)),
  };

  let i = 0;
  let inBenefits = false;
  let inUpdates = false;

  // Free text without any intro: the first section is a headline plus the story.
  const first = sections[0];
  if (out.lead.length === 0 && first && first.paragraphs?.length && !first.items?.length && !isAbout(norm(first.title)) && first.title.length > 28) {
    out.leadTitle = first.title;
    out.lead = [...first.paragraphs];
    i = 1;
  } else if (first && !first.items?.length && /framer (portfolio )?template|template for/i.test(first.title) && first.paragraphs?.length && out.lead.length === 0) {
    out.leadTitle = first.title;
    out.lead = [...first.paragraphs];
    i = 1;
  }

  for (; i < sections.length; i++) {
    const s: Section = sections[i];
    const title = norm(s.title);
    const paragraphs = s.paragraphs ?? [];
    const items = s.items ?? [];
    const id = `s${i}`;

    if (isSupport(title)) {
      out.support = paragraphs.join(' ');
      inBenefits = inUpdates = false;
      continue;
    }
    if (isUpdates(title)) {
      inUpdates = true;
      inBenefits = false;
      continue;
    }
    if (inUpdates && (isVersion(title) || items.length)) {
      out.updates.push({ title: s.title, items: items.length ? items : paragraphs });
      continue;
    }
    inUpdates = false;

    if (isAbout(title)) {
      out.about.push(...paragraphs);
      inBenefits = false;
      continue;
    }
    if (isWhyHeader(title) && !paragraphs.length && !items.length) {
      out.benefitsTitle = s.title;
      inBenefits = true;
      continue;
    }

    const kind = items.length ? listKind(title) : null;
    if (items.length) {
      inBenefits = false;
      const block: ListBlock = { id, kind: kind ?? 'list', title: s.title.replace(/:$/, ''), items };
      out.blocks.push(block);
      if (block.kind === 'pages') out.pages = items;
      if (block.kind === 'sections') out.sectionNames = items;
      if (block.kind === 'features') out.cmsParts = items.filter((x) => /\bcms\b/i.test(x));
      continue;
    }

    // A heading with one or two paragraphs: a benefit while we are in a benefits run,
    // a benefit also when it is short, otherwise a plain text block.
    const text = paragraphs.join(' ');
    const longText = paragraphs.length > 1 || text.length > 260;
    if (paragraphs.length && (inBenefits || (!longText && !isWhyHeader(title) && !/^who\b/.test(title)))) {
      out.benefits.push({ title: s.title, text });
      continue;
    }
    if (paragraphs.length) {
      inBenefits = false;
      out.blocks.push({ id, kind: 'text', title: s.title.replace(/\?$/, '?'), paragraphs });
    }
  }

  return out;
}

// ---- FAQ -------------------------------------------------------------------------------

export interface Faq {
  q: string;
  a: string;
}

export function buildFaq(t: Template, c: TemplateContent, opts: { siteEmail: string }): Faq[] {
  const free = t.price === 0;
  const faq: Faq[] = [
    {
      q: `Is ${t.name} free?`,
      a: free
        ? `Yes. ${t.name} is a free Framer template: you can remix it into your own Framer account at no cost.`
        : `${t.name} is a premium Framer template and costs $${t.price} on Framer Marketplace. You can open the live preview before you buy.`,
    },
    {
      q: `How do I use ${t.name}?`,
      a: `Open ${t.name} on Framer Marketplace and press the remix button. The template is copied into your own Framer project, where you replace the text and images, adjust the style and publish it on your domain.`,
    },
  ];
  if (c.pages.length) {
    faq.push({ q: `Which pages are included in ${t.name}?`, a: `${t.name} includes ${c.pages.length} pages: ${c.pages.join(', ')}.` });
  } else if (c.sectionNames.length) {
    faq.push({ q: `What is included in ${t.name}?`, a: `${t.name} is built from ${c.sectionNames.length} ready-made sections: ${c.sectionNames.join(', ')}.` });
  }
  if (c.hasCms) {
    faq.push({
      q: `Does ${t.name} have a CMS?`,
      a: c.cmsParts.length
        ? `Yes. It is built with Framer CMS (${c.cmsParts.join(', ')}), so you can add and edit content without touching the design.`
        : `Yes. It is built with Framer CMS, so you can add and edit content without touching the design.`,
    });
  }
  faq.push({
    q: `Do I need to know how to code to use ${t.name}?`,
    a: 'No. Everything is edited visually in Framer: text, images, colors, fonts and layout. No code is needed.',
  });
  const bestFor = c.blocks.find((b) => b.kind === 'bestFor');
  if (bestFor && 'items' in bestFor) {
    const list = bestFor.items.filter((x) => !/template$/i.test(x)).slice(0, 6);
    if (list.length) faq.push({ q: `Who is ${t.name} for?`, a: `${t.name} works best for: ${list.join(', ')}.` });
  }
  const mail = c.support?.match(/\[[^\]]*\]\(mailto:([^)]+)\)/)?.[1] ?? opts.siteEmail;
  faq.push({
    q: `How do I get support for ${t.name}?`,
    a: `Write to ${mail}. Questions about using or customizing the template are welcome.`,
  });
  return faq;
}

// ---- small helpers for the page --------------------------------------------------------

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Text from Framer may contain links written as [label](url). Escape everything, then turn
// only http(s) and mailto links into anchors.
export function richText(s: string): string {
  return esc(s).replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+)\)/g, (_m, label, url) => {
    const external = url.startsWith('http');
    return `<a href="${url}"${external ? ' target="_blank" rel="noopener noreferrer nofollow"' : ''}>${label}</a>`;
  });
}
export const plainText = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
