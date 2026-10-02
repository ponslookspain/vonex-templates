import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Fully static output: Cloudflare serves ./dist as static assets.
export default defineConfig({
  output: 'static',
  // Replace with the real domain once there is one.
  site: 'https://vonex-templates.workers.dev',
  vite: { plugins: [tailwindcss()] },
});
