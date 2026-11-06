import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import categories from './data/categories.json';

const categorySlugs = categories.map((c) => c.slug) as [string, ...string[]];

// One YAML file per template in src/content/templates/. The build fails with a clear
// message if a field is missing or has the wrong type.
//
// Most of the file is written by `npm run add-template` from the Framer Marketplace page, and
// refreshed by `npm run sync-templates`. The fields you edit by hand (and that the script
// never overwrites) are: description, affiliateUrl, featured, tags, types, category, added, preview,
// pageKind, seoDescription, overview, preparation, marketing, codeUrl, codePrice, codeVersion, buyUrl, soldOn.
const templates = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/templates' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      tagline: z.string(),
      // Short text for cards and search results.
      description: z.string(),
      // Framer Marketplace page.
      url: z.url(),
      // Optional Framer affiliate link (framer.link, redirects to the Marketplace page). If set, "View on Framer" uses it instead of `url`.
      affiliateUrl: z.url().optional(),
      preview: z.url().optional(),
      // Optional: sell the template directly (for example on Contra) instead of on Framer Marketplace.
      // When set, the main button goes here with no referral, and `soldOn` names the shop (default Contra).
      buyUrl: z.url().optional(),
      soldOn: z.string().optional(),
      // Written for this catalog, not imported. Used on the template page: what kind of site it is
      // ("Portfolio"), the search description, a short intro, and what to prepare before editing.
      pageKind: z.string().optional(),
      seoDescription: z.string().optional(),
      overview: z.string().optional(),
      preparation: z.string().optional(),
      // Hints for the posts and pins made from this template (scripts/marketing/draft-configs.mjs):
      // who it is for, extra hashtags and Pinterest keywords, the Pinterest topic board. All optional.
      marketing: z.object({ audience: z.string(), hashtags: z.array(z.string()), keywords: z.array(z.string()), topicBoard: z.string() }).partial().optional(),
      // Optional code version of the template (clean Astro project), sold on Contra. Set `codeUrl`
      // to show the "Buy code" button and the "Code version" block; `codePrice` is in USD and
      // `codeVersion` the version of the zip. See docs/production/code-versions.md.
      codeUrl: z.url().optional(),
      codePrice: z.number().min(0).optional(),
      codeVersion: z.string().optional(),
      category: z.string(),
      // Catalog categories, from src/data/categories.json. They drive the filter and category pages.
      types: z.array(z.enum(categorySlugs)).min(1),
      price: z.number().min(0), // 0 = Free
      tags: z.array(z.string()).default([]),
      // Cover used on cards, in the gallery and for the social preview.
      image: image(),
      featured: z.boolean().default(false),
      added: z.coerce.date(),

      // ---- from the Framer Marketplace page ----
      updated: z.coerce.date().optional(),
      framerId: z.coerce.string().optional(),
      categories: z.array(z.string()).default([]),
      styles: z.array(z.string()).default([]),
      // Framer features such as CMS, Forms, Sticky Scrolling.
      framerFeatures: z.array(z.string()).default([]),
      // The Marketplace description: text before the first heading, then one entry per heading.
      // The page decides how to show each from its title (see src/lib/template-content.ts).
      intro: z.array(z.string()).default([]),
      sections: z
        .array(z.object({ title: z.string(), paragraphs: z.array(z.string()).optional(), items: z.array(z.string()).optional() }))
        .default([]),
      // Pictures shown in the gallery of the template page (no video).
      gallery: z.array(z.object({ type: z.literal('image'), src: image(), alt: z.string() })).default([]),
    })
    // A template is one of four offers (see "Template offers" in AGENTS.md): free, free + paid code,
    // paid, or paid + code at the same price. These rules keep a YAML from mixing them up.
    .superRefine((t, ctx) => {
      if (Boolean(t.codeUrl) !== (t.codePrice !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['codePrice'], message: 'Set codeUrl and codePrice together, or neither.' });
      }
      if (t.codePrice !== undefined && t.codePrice <= 0) {
        ctx.addIssue({ code: 'custom', path: ['codePrice'], message: 'The code version is always paid.' });
      }
      if (t.price > 0 && t.codePrice !== undefined && t.codePrice !== t.price) {
        ctx.addIssue({ code: 'custom', path: ['codePrice'], message: 'A paid template costs the same in Framer and as code.' });
      }
      if (t.price === 0 && t.buyUrl) {
        ctx.addIssue({ code: 'custom', path: ['buyUrl'], message: 'A free template has nothing to buy; leave buyUrl out.' });
      }
    }),
});

export const collections = { templates };
