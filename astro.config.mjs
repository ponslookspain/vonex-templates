import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { rm } from 'node:fs/promises';

// The style guide at /design-system/ is for working on the site: it is available in
// `npm run dev` but removed from the production build, so visitors never see it.
const devOnlyPages = {
  name: 'dev-only-pages',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      await rm(new URL('design-system/', dir), { recursive: true, force: true });
    },
  },
};

// Fully static output: Cloudflare serves ./dist as static assets.
export default defineConfig({
  output: 'static',
  // Inline the (small) stylesheet: one request less before the first paint.
  build: { inlineStylesheets: 'always' },
  // Fetch a page in the background when a link is hovered, so navigation feels instant.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  // Canonical address of the site (used for canonical links, sitemap and social previews).
  site: 'https://vonexdesign.com',
  integrations: [devOnlyPages],
  vite: { plugins: [tailwindcss()] },
});
