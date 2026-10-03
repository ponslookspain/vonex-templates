# Vonex Design: Framer templates catalog

A minimal dark catalog of Framer templates for any kind of website. Two pages: a landing page with featured templates and `/templates/` as a simple grid. Every card opens its page on Framer Marketplace. Static site built with [Astro](https://astro.build) and Tailwind CSS, deployed on Cloudflare (Workers static assets).

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies (Node 22) |
| `npm run dev` | Local dev server at http://localhost:4321 |
| `npm run build` | Build the site into `dist/` |
| `npm run check` | Type-check content and components |
| `npm run add-template -- <url>` | Add a template from its Framer Marketplace URL (data, pictures, preview image) |
| `npm run sync-templates` | Refresh every template from its Marketplace page |
| `npm run og` | Regenerate the social preview images in `public/og/` |

## Check the site locally before deploy

```
npm install        # once
npm run dev        # live preview at http://localhost:4321, updates as you edit
npm run build && npm run preview   # exact production build, also at http://localhost:4321
```

Open http://localhost:4321 in the browser. Stop the server with Ctrl+C. Nothing is deployed until your change is merged into `main`.

## Add a template

Give the script the template's Framer Marketplace link and everything is imported: description sections, categories, styles, Framer features, price, dates and the pictures.

```
npm run add-template -- https://www.framer.com/marketplace/templates/my-template/ --affiliate https://framer.link/xxxx --tags "dark, portfolio" --featured
```

What it does:

1. Reads the Marketplace page and saves the data to `src/content/templates/<slug>.yaml`.
2. Downloads the pictures the template has on its Framer page (the first is the cover; if there are two, the gallery has two, and so on). Nothing else is added: no screenshots, no videos.
3. Makes the social preview image `public/og/<slug>.png`.
4. The page `/templates/<slug>/` and its sitemap entry appear automatically.

Options: `--affiliate` (your referral link for "Open on Framer"), `--category`, `--tags`, `--description` (short text for the card), `--featured` (first 3 featured are on the landing page), `--refresh-media` (download the pictures again), `--dry-run`. Run `npm run add-template -- --help` for the list.

Afterwards: open the generated YAML and write a proper `description`, then commit and push, including the new files in `src/assets/templates/` and `public/og/`.

### Refresh from Framer

```
npm run sync-templates
```

Updates every template from its Marketplace page (new text, price, categories, features). What you wrote yourself is kept: `description`, `affiliateUrl`, `featured`, `tags`, `category`, `added`, `preview`.

### Where the files live

| What | Where | Notes |
| --- | --- | --- |
| Template data and text | `src/content/templates/<slug>.yaml` | In the repository |
| Cover and gallery pictures | `src/assets/templates/<slug>.webp` and `src/assets/templates/<slug>/` | In the repository; Astro makes the sizes and WebP at build time |
| Social preview images | `public/og/<slug>.png` | In the repository |

All pictures are served from the site itself (Cloudflare), nothing is loaded from Framer while visitors browse. If you change the name, tagline, price or cover, run `npm run og` to refresh the preview images.

### By hand

You can also write the YAML yourself; copy an existing file from `src/content/templates/` and put the cover into `src/assets/templates/`. If a required field is missing or wrong, the build fails and names the file.

## Design system

Colors, type, radii, spacing and the 12-column grid are defined once, as tokens in `src/styles/global.css`; components live in `src/components`. Run `npm run dev` and open http://localhost:4321/design-system/ for the live style guide (press **G** on any page to see the grid). The rules and recipes are in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## SEO and analytics

- `/sitemap.xml` and `/robots.txt` are generated at build time. A new page must be added to the `pages` list in `src/pages/sitemap.xml.ts`.
- Page titles, descriptions, Open Graph image (`public/og-image.png`) and structured data (JSON-LD) are set in `src/layouts/Base.astro`; each page passes its own `title` and `description`.
- Cloudflare Web Analytics: in the Cloudflare dashboard open Analytics & Logs, Web Analytics, add the site and copy the token into `analyticsToken` in `src/data/site.ts`. Nothing is sent while it is empty.
- When a custom domain is connected, change `site` in `astro.config.mjs`; the sitemap, canonical links and Open Graph URLs follow.

## Structure and extending the site

```
src/
  content/templates/*.yaml   one file per template
  assets/templates/*         preview images
  components/                Header, Footer, TemplateCard
  layouts/Base.astro         shared page shell (SEO tags, header, footer)
  pages/                     index.astro, templates.astro, 404.astro
  data/site.ts               site name, links, navigation
```

To add a new page or tool: create a file in `src/pages/` and add an entry to `nav` in `src/data/site.ts`.

## Deploy (Cloudflare)

`wrangler.jsonc` describes a separate static-assets Worker named `vonex-templates`. Connect this repository in Cloudflare (Workers & Pages, Create, Import a repository) with build command `npm run build` and deploy command `npx wrangler deploy`.
