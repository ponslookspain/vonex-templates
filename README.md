# Vonex Design: Framer templates catalog

A minimal dark catalog of Framer templates. Two pages: a landing page with featured templates and `/templates/` with search, category and price filters. Every card opens its page on Framer Marketplace. Static site built with [Astro](https://astro.build) and Tailwind CSS, deployed on Cloudflare (Workers static assets).

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies (Node 22) |
| `npm run dev` | Local dev server at http://localhost:4321 |
| `npm run build` | Build the site into `dist/` |
| `npm run check` | Type-check content and components |

## Add a template

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
