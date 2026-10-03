import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Fully static output: Cloudflare serves ./dist as static assets.
export default defineConfig({
  output: 'static',
  // Canonical address of the site (used for canonical links, sitemap and social previews).
  site: 'https://vonexdesign.com',
  vite: { plugins: [tailwindcss()] },
});
