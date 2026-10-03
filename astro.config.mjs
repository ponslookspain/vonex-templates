import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Fully static output: Cloudflare serves ./dist as static assets.
export default defineConfig({
  output: 'static',
  // Inline the (small) stylesheet: one request less before the first paint.
  build: { inlineStylesheets: 'always' },
  // Fetch a page in the background when a link is hovered, so navigation feels instant.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  // Canonical address of the site (used for canonical links, sitemap and social previews).
  site: 'https://vonexdesign.com',
  vite: { plugins: [tailwindcss()] },
});
