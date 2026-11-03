# AGENTS.md

The one guide for every coding agent working on this repository (Claude Code, Codex and others). `CLAUDE.md` only imports this file, so edit the rules here. Read it before changing anything. Human-facing setup and commands are in [README.md](README.md); the design direction is [DESIGN.md](DESIGN.md) and how it is built in code is [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). Selling code versions of templates (stack, flow, rules) is in [CODE_TEMPLATES.md](CODE_TEMPLATES.md).

## Project

**Vonex Design** is a catalog of Framer templates made by Vladimir (GitHub `ponslookspain`). Live at https://vonexdesign.com. It is a showcase only: no checkout, no accounts, no editor. Every "View on Framer" button goes to the template's Framer Marketplace page, through Vladimir's Framer referral link (`affiliateUrl`, `framer.link/...`) when there is one. A template can instead be sold directly on Contra: set `buyUrl` (and `soldOn`) in its YAML and the main button goes there, with no referral and the label "Buy template" (see `src/lib/buy.ts`). Framer stays the main product. Some templates also have a hand-written **code version** (Astro + Tailwind zip) sold on Contra; the site only links to it with a "Buy code" button (`codeUrl`, `codePrice` in the YAML). Details in [CODE_TEMPLATES.md](CODE_TEMPLATES.md).

## Rules

- **Talk to Vladimir in Russian.** The site itself, code, comments, commit messages and PR descriptions are in English.
- Keep each change focused. Riskier ideas go to Vladimir as recommendations, not into the diff.
- **Code versions** (see CODE_TEMPLATES.md): always written by hand from the Framer project, never exported or scraped from a Framer site. Same stack for every template, the design identical to Framer at all three breakpoints, and only assets and fonts we are allowed to redistribute. The code lives in the private `vonex-code` repository, not here.

## Workflow

Three steps, each only when Vladimir says so:

1. **Local.** Make the change on a branch from `main` and show it in `npm run dev`. Do not commit, push or open a pull request yet. Iterate until Vladimir is happy.
2. **"Коммит, пуш".** Run `npm run check` and `npm run build` (both must pass), commit, push the branch and open a pull request into `main`.
3. **"В продакшн".** Merge the pull request into `main` and delete its branch. Merging deploys the site (Cloudflare builds `main`); check the change on vonexdesign.com afterwards.

Never push straight to `main`, never force-push. Delete branches once they are merged, so GitHub only holds `main` and open work.

## Stack

- Astro 7 (static output, `output: 'static'`), Tailwind CSS 4 via `@tailwindcss/vite`, TypeScript (strict).
- Content: Astro content collection of YAML files, schema in `src/content.config.ts` (zod). Images through `astro:assets` (resized to WebP at build time).
- Fonts, self-hosted from Fontsource: Archivo (headlines), Instrument Serif italic (accent word), Inter (text), Geist Mono (labels, buttons, nav).
- Node scripts in `scripts/` (`yaml`, `sharp`) for importing templates and making social preview images.
- Hosting: Cloudflare Workers static assets (`wrangler.jsonc`), custom domains vonexdesign.com and www. Cloudflare Web Analytics token in `src/data/site.ts`.
- Node 22 (`.nvmrc`). Vladimir works on Windows with PowerShell; keep commands cross-platform (no bash-only syntax in npm scripts).

## Structure

| Path | What |
| --- | --- |
| `src/content/templates/<slug>.yaml` | One template. The file name is the slug and the URL `/templates/<slug>/`. |
| `src/assets/templates/<slug>.webp`, `<slug>/` | Cover and gallery pictures of a template. |
| `src/pages/index.astro` | Landing: hero, featured templates (first 3 with `featured: true`, then newest), steps, benefits, FAQ, closing banner. |
| `src/pages/templates.astro`, `templates/free.astro` | All templates and free templates, newest first, in `CatalogGrid` (large / compact cards switch). |
| `src/pages/templates/[slug].astro` | Template page: gallery, description blocks, stats, FAQ, other templates. |
| `src/lib/template-content.ts` | Turns the imported Marketplace description into page blocks and FAQ. |
| `src/pages/design-system.astro` | Live style guide at `/design-system/`, only in `npm run dev`: `astro.config.mjs` removes it from the production build. |
| `src/pages/sitemap.xml.ts`, `robots.txt.ts` | Generated at build. Static pages are listed by hand in the sitemap; template pages are added automatically. |
| `src/layouts/Base.astro` | `<head>` (SEO, Open Graph, JSON-LD, analytics), header, footer. |
| `src/components/` | UI and layout components. |
| `src/styles/global.css` | Design tokens (`@theme static`) and shared classes. |
| `src/data/site.ts` | Site name, texts, contacts, socials, nav, analytics token. |
| `scripts/add-template.mjs` | Import / refresh templates from Framer Marketplace. |
| `scripts/generate-og.mjs` | Social preview images `public/og/<slug>.png`. |
| `scripts/pinterest/` | Pinterest pins for a template: capture, render, upload, CSV, one config per template. Its README is the procedure. |
| `scripts/clean.mjs` | `npm run clean`: removes captures, scratch folders and build caches. |
| `.work/` | Local work folder, ignored by git (see "Work folder"). |
| `public/` | Served as is: favicons, `og-image.png`, `og/`, `_headers`. |

## Adding or changing a template

1. `npm run add-template -- <marketplace-url> --affiliate <framer.link url> [--featured] [--tags "a, b"] [--category X] [--description "..."]`
   This writes `src/content/templates/<slug>.yaml`, downloads the pictures from the Marketplace page into `src/assets/templates/` and makes `public/og/<slug>.png`.
2. Check the YAML: write a short `description` for the card (one sentence), check `category`, `price` (0 = Free) and `affiliateUrl`.
3. Commit the YAML, the pictures and the og image together.

Hand-edited fields that `npm run sync-templates` never overwrites: `description`, `affiliateUrl`, `featured`, `tags`, `category`, `added`, `preview`, `pageKind`, `seoDescription`, `overview`, `preparation`, `codeUrl`, `codePrice`, `codeVersion`, `buyUrl`, `soldOn`. `codeUrl`, `codePrice` and `codeVersion` belong to the code version (Contra product link, price in USD, zip version); when `codeUrl` is set, the template page shows "Buy code", a "Code version" block and one more FAQ answer. Leave them out for templates without a code version. Write these four for every new template: they feed the title, search description, intro and "Before you publish" block of its page. Everything else in the YAML comes from Framer and can be refreshed.

Guides are listed in `src/data/guides.ts`; a new guide also needs its accent word in `ACCENTS` in `scripts/generate-og.mjs`, then `npm run og` makes `public/og/guides/<slug>.png`.

After changing a name, tagline, price or cover, run `npm run og` (or `npm run og -- <slug>`). The og images depend on the fonts installed on the machine (Segoe UI on Windows), so images made on Linux look different: regenerate them on Vladimir's machine, or leave the committed ones alone.

Template cards show only the cover, the price/Free badge, the name and the tagline. Do not add descriptions or tags to cards.

Category filtering is planned as static SEO pages (`/templates/category/<x>/`) once a category has 2+ templates; until then there is no filter.

## Work folder

Everything generated while working lives in one git-ignored folder, `.work/<area>/<slug>/`: never in `src/`, `public/` or the repo root, and never in an agent's own folder (`.omc/`, `.claude/`, `.codex/` belong to the agent tool). Whatever must be reused is committed as a script or a config, not as output.

| Area | What goes in `.work/` | What is committed |
| --- | --- | --- |
| Template pages | Nothing: `npm run add-template` writes straight to `src/` and `public/og/` | YAML, pictures, og image |
| Code versions (`.work/code/<slug>/`) | Screenshots, Framer snapshots and section-height comparisons while porting a template | The code itself, in the private `vonex-code` repo (see CODE_TEMPLATES.md), not here |
| Pinterest (`.work/pinterest/<slug>/`) | Captures (`raw/`), pin images, JPGs, contact sheet, CSV files | `scripts/pinterest/` and `configs/<slug>.json` |

Name scratch subfolders `raw`, `screens` or `tmp`: `npm run clean` removes exactly those, plus `dist`, `.astro` and `.wrangler`. `npm run clean -- --all` removes the whole `.work/` (look first with `--dry-run`). Clean up when a job is finished: the pins are live in Pinterest, or the code version is packed and uploaded.

## Pinterest pins

Vladimir says "делаем изображения для Пинтереста" (or similar) after a template is ready. Follow [scripts/pinterest/README.md](scripts/pinterest/README.md): capture the live demo, render 18 text-free pins in the approved style and, once he approves them, host the images in Cloudflare R2 and make the CSV he uploads to Pinterest. Pin images are never part of the site or its deploy. Pins link to the template page on this site with UTM tags, not to Framer.

## Template offers

Every template is exactly one of four offers. `offer()` in `src/lib/buy.ts` names it, and the schema in `src/content.config.ts` fails the build if a YAML mixes them up.

| Offer | YAML | Buttons on the page | Example |
| --- | --- | --- | --- |
| `free` | `price: 0`, no `codeUrl` | Use free on Framer | Harrier, Ethan Walker, Softic Studio |
| `free-code` | `price: 0`, `codeUrl`, `codePrice: 19` | Use free on Framer · Buy code $19 | Alpine App |
| `paid` | `price: 49`, no `codeUrl` | Get on Framer (or Buy template with `buyUrl`) | none now |
| `paid-code` | `price: 49`, `codeUrl`, `codePrice: 49` | Get on Framer · Buy code $49 | none yet |

Rules:
- The Framer template is the main product. A code version is an extra, sold on Contra.
- A free template's code costs $19.
- A paid template costs the same in Framer and as code: the buyer chooses the format, not the price.
- `codeUrl` and `codePrice` are set together or not at all. A free template never has `buyUrl`.
- Every template, Framer or code, follows one license at `/license/` (free: any number of projects; paid: one project per license; never resale). Change the terms there, not per template, and keep LICENSE.md in `vonex-code` the same text.

## Style

- Before changing layout, read DESIGN_SYSTEM.md: "Breakpoints and responsive rules", "Section anatomy", "Pages" and "Template page" describe how every page is put together and how it must behave from 340px up.
- Alpine: ink on warm paper (quiet text and lines are the same ink at lower opacity, through tokens), square corners, hairlines, headlines in sentence case with one italic serif accent word (DESIGN.md). Read DESIGN.md before writing any UI. All visual values come from tokens in `src/styles/global.css`; text sizes from the `.type-*` classes; spacing from the named steps (`p-lg`, `mt-xl`); layout on the 4-column grid (`.grid-4`, `Section`, `Container`). Details and the checklist are in DESIGN_SYSTEM.md.
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

Agent tool folders (`.claude/`, `.omc/`, `.codex/`) are local and ignored by git.
