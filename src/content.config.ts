import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One YAML file per template in src/content/templates/. The build fails with a clear
// message if a field is missing or has the wrong type.
//
// Most of the file is written by `npm run add-template` from the Framer Marketplace page, and
// refreshed by `npm run sync-templates`. The fields you edit by hand (and that the script
// never overwrites) are: description, affiliateUrl, featured, tags, category, added, preview.
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
      // Optional Framer affiliate link (framer.link, redirects to the Marketplace page). If set, "Open on Framer" uses it instead of `url`.
      affiliateUrl: z.url().optional(),
      preview: z.url().optional(),
      category: z.string(),
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
    }),
});

export const collections = { templates };
