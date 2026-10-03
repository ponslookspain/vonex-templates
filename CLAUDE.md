# CLAUDE.md

Guide for Claude (and anyone else) working on this repository. Read it before changing anything. Human-facing setup and commands are in [README.md](README.md); visual rules are in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## Project

**Vonex Design** is a catalog of Framer templates made by Vladimir (GitHub `ponslookspain`). Live at https://vonexdesign.com. It is a showcase only: no checkout, no accounts, no editor. Every "Open on Framer" button goes to the template's Framer Marketplace page, through Vladimir's Framer referral link (`affiliateUrl`, `framer.link/...`) when there is one.

## Rules

- **Talk to Vladimir in Russian.** The site itself, code, comments, commit messages and PR descriptions are in English.
- **Never touch PostVIA** (`ponslookspain/postvia`, postvia.online). It is a separate project. The only link to it is the footer entry in `src/data/site.ts`.
- **One pull request per change.** Branch from `main`, open a PR, Vladimir reviews and merges it himself. Never push to `main`, never merge, never force-push someone else's branch. Merging into `main` deploys the site.
- Before opening or updating a PR: `npm run check` and `npm run build` must pass with no errors.
- Keep the PR focused. Riskier ideas go in the PR description or the thread as recommendations, not into the diff.

## Stack

- Astro 7 (static output, `output: 'static'`), Tailwind CSS 4 via `@tailwindcss/vite`, TypeScript (strict).
- Content: Astro content collection of YAML files, schema in `src/content.config.ts` (zod). Images through `astro:assets` (resized to WebP at build time).
- Font: Inter Variable from `@fontsource-variable/inter`, self-hosted.
- three.js only for the 3D logo in the home hero (`src/scripts/hero-logo.ts`), loaded lazily after page load.
- Node scripts in `scripts/` (`yaml`, `sharp`) for importing templates and making social preview images.
- Hosting: Cloudflare Workers static assets (`wrangler.jsonc`), custom domains vonexdesign.com and www. Cloudflare Web Analytics token in `src/data/site.ts`.
- Node 22 (`.nvmrc`). Vladimir works on Windows with PowerShell; keep commands cross-platform (no bash-only syntax in npm scripts).

## Structure

| Path | What |
| --- | --- |
| `src/content/templates/<slug>.yaml` | One template. The file name is the slug and the URL `/templates/<slug>/`. |
| `src/assets/templates/<slug>.webp`, `<slug>/` | Cover and gallery pictures of a template. |
| `src/pages/index.astro` | Landing: hero, featured templates (first 3 with `featured: true`, then newest), steps, benefits, FAQ, closing banner. |
| `src/pages/templates.astro` | All templates, newest first. |
| `src/pages/templates/[slug].astro` | Template page: gallery, description blocks, stats, FAQ, other templates. |
| `src/lib/template-content.ts` | Turns the imported Marketplace description into page blocks and FAQ. |
| `src/pages/design-system.astro` | Live style guide at `/design-system/`, only in `npm run dev`: `astro.config.mjs` removes it from the production build. |
| `src/pages/sitemap.xml.ts`, `robots.txt.ts` | Generated at build. Static pages are listed by hand in the sitemap; template pages are added automatically. |
| `src/layouts/Base.astro` | `<head>` (SEO, Open Graph, JSON-LD, analytics), header, footer. |
| `src/components/` | UI and layout components; `illustrations/` holds the small drawings of the landing blocks. |
| `src/styles/global.css` | Design tokens (`@theme static`) and shared classes. |
| `src/data/site.ts` | Site name, texts, contacts, socials, nav, analytics token. |
| `scripts/add-template.mjs` | Import / refresh templates from Framer Marketplace. |
| `scripts/generate-og.mjs` | Social preview images `public/og/<slug>.png`. |
| `public/` | Served as is: favicons, `og-image.png`, `og/`, `_headers`. |

## Adding or changing a template

1. `npm run add-template -- <marketplace-url> --affiliate <framer.link url> [--featured] [--tags "a, b"] [--category X] [--description "..."]`
   This writes `src/content/templates/<slug>.yaml`, downloads the pictures from the Marketplace page into `src/assets/templates/` and makes `public/og/<slug>.png`.
2. Check the YAML: write a short `description` for the card (one sentence), check `category`, `price` (0 = Free) and `affiliateUrl`.
3. Commit the YAML, the pictures and the og image in one PR.

Hand-edited fields that `npm run sync-templates` never overwrites: `description`, `affiliateUrl`, `featured`, `tags`, `category`, `added`, `preview`. Everything else in the YAML comes from Framer and can be refreshed.

After changing a name, tagline, price or cover, run `npm run og` (or `npm run og -- <slug>`). The og images depend on the fonts installed on the machine (Segoe UI on Windows), so images made on Linux look different: regenerate them on Vladimir's machine, or leave the committed ones alone.

Template cards show only the cover, the price/Free badge, the name and the tagline. Do not add descriptions or tags to cards.

## Style

- Dark, minimal, editorial. All visual values come from tokens in `src/styles/global.css`; text sizes from the `.type-*` classes; layout on the 12-column grid (`.grid-12`, `Section`, `Container`). Details and the checklist are in DESIGN_SYSTEM.md.
- Pages are static HTML with small inline scripts only. Do not add a UI framework (React and similar) or client-side rendering.
- Images go through `astro:assets` (`<Image>`), never straight from Framer at runtime.
- Site copy in plain English, short sentences.
- Comments explain why, in plain English, like the existing ones.

## Checks

```
npm run check   # types and content schema
npm run build   # must build all pages
npm run dev     # http://localhost:4321, /design-system/ for the style guide, G toggles the grid
```

GitHub Actions (`.github/workflows/check.yml`) runs `npm run check` and `npm run build` on every pull request and push to `main`. There is no test suite. Cloudflare builds and deploys `main` on every merge.
