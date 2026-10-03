import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Fully static output: Cloudflare serves ./dist as static assets.
export default defineConfig({
  output: 'static',
  // Update if a custom domain is connected.
  site: 'https://vonex-templates.ponslookdesign.workers.dev',
  vite: { plugins: [tailwindcss()] },
});
