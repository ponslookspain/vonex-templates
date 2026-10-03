# Vonex Design: Framer templates catalog

A minimal dark catalog of Framer templates for any kind of website. Two pages: a landing page with featured templates and `/templates/` as a simple grid. Every card opens its page on Framer Marketplace. Static site built with [Astro](https://astro.build) and Tailwind CSS, deployed on Cloudflare (Workers static assets).

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies (Node 22) |
| `npm run dev` | Local dev server at http://localhost:4321 |
| `npm run build` | Build the site into `dist/` |
| `npm run check` | Type-check content and components |
| `npm run add-template -- <url>` | Add a template from its Framer Marketplace URL (also makes its preview image) |
| `npm run og` | Regenerate the social preview images in `public/og/` |

## Check the site locally before deploy

```
npm install        # once
npm run dev        # live preview at http://localhost:4321, updates as you edit
npm run build && npm run preview   # exact production build, also at http://localhost:4321
```

Open http://localhost:4321 in the browser. Stop the server with Ctrl+C. Nothing is deployed until your change is merged into `main`.

## Add a template

### Quick way: from a Framer link

```
npm run add-template -- https://www.framer.com/marketplace/templates/my-template/ --affiliate https://framer.link/xxxx --tags "dark, portfolio" --featured
```

The script reads the Marketplace page, downloads the cover (resized to 1200x900 WebP) and writes the YAML file for you. Options: `--price`, `--category`, `--description`, `--affiliate`, `--tags`, `--featured`, `--force`, `--dry-run` (see `npm run add-template -- --help`). If the price or category cannot be detected it stops and asks for `--price` / `--category`. The script also makes the social preview image for the template (`public/og/<slug>.png`, shown when the page is shared on X, Threads and so on). Always open the generated file afterwards and write a proper `description`; then commit and push (including the new image in `public/og/`).

Every template gets its own page at `/templates/<slug>/` automatically, with its own title, description, preview image and structured data, and it is added to the sitemap. If you change a template's name, tagline, price or cover, run `npm run og` to refresh the preview images.

### By hand

1. Add a preview image to `src/assets/templates/` (4:3, 1200x900, `.webp` or `.jpg`), named after the template, for example `my-template.webp`.
2. Copy `src/content/templates/softic-studio.yaml` to `src/content/templates/my-template.yaml` and edit it:

```yaml
name: My Template
tagline: Short one-line subtitle
description: One or two sentences shown on the card.
url: https://www.framer.com/marketplace/templates/my-template/   # card links here
# affiliateUrl: https://...   # optional Framer affiliate link (framer.link/...); used instead of `url` when set
preview: https://my-template.framer.website/                      # optional
category: Portfolio
price: 0            # 0 = Free, otherwise the price in USD
tags: [dark, minimal]
image: ../../assets/templates/my-template.webp
featured: false     # featured templates fill the landing page (first 3)
added: 2026-10-02
```

3. Commit to the repository (this can be done in the GitHub web editor). The site rebuilds and redeploys automatically. If a field is missing or wrong, the build fails and names the file.

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
