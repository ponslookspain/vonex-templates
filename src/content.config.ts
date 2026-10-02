import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One YAML file per template in src/content/templates/. The build fails with a clear
// message if a field is missing or has the wrong type.
const templates = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/templates' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      tagline: z.string(),
      description: z.string(),
      // Framer Marketplace page. The whole card links here.
      url: z.url(),
      // Optional Framer affiliate link (framer.link, redirects to the Marketplace page). If set, the card uses it instead of `url`.
      affiliateUrl: z.url().optional(),
      preview: z.url().optional(),
      category: z.string(),
      price: z.number().min(0), // 0 = Free
      tags: z.array(z.string()).default([]),
      image: image(),
      featured: z.boolean().default(false),
      added: z.coerce.date(),
    }),
});

export const collections = { templates };
