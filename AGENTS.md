# AGENTS.md

The one guide for every coding agent working on this repository (Claude Code, Codex and others). `CLAUDE.md` only imports this file, so edit the rules here. Read it before changing anything. Human-facing setup and commands are in [README.md](README.md); the design direction is [DESIGN.md](DESIGN.md) and how it is built in code is [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). [docs/README.md](docs/README.md) is the map: where every file lives, what goes to GitHub, what is temporary. Selling code versions of templates is in [docs/production/code-versions.md](docs/production/code-versions.md). The full path of a new template, from niche to social posts, is [docs/production/template-pipeline.md](docs/production/template-pipeline.md).

## Project

**Vonex Design** is a catalog of Framer templates made by Vladimir (GitHub `ponslookspain`). Live at https://vonexdesign.com. It is a showcase only: no checkout, no accounts, no editor. Every "View on Framer" button goes to the template's Framer Marketplace page, through Vladimir's Framer referral link (`affiliateUrl`, `framer.link/...`) when there is one. A template can instead be sold directly on Contra: set `buyUrl` (and `soldOn`) in its YAML and the main button goes there, with no referral and the label "Buy template" (see `src/lib/buy.ts`). Framer stays the main product. Some templates also have a hand-written **code version** (Astro + Tailwind zip) sold on Contra; the site only links to it with a "Buy code" button (`codeUrl`, `codePrice` in the YAML). Details in [docs/production/code-versions.md](docs/production/code-versions.md).

## Rules

- **Talk to Vladimir in Russian.** The site itself, code, comments, commit messages and PR descriptions are in English.
- Keep each change focused. Riskier ideas go to Vladimir as recommendations, not into the diff.
- **Code versions** (see docs/production/code-versions.md): always written by hand from the Framer project, never exported or scraped from a Framer site. Same stack for every template, the design matching Framer at all three breakpoints (say "closely matches" in public text, never "identical" or "pixel-perfect"; see docs/production/code-versions.md, "Fidelity"), and only assets and fonts we are allowed to redistribute. The code lives in the private `vonex-code` repository, not here.

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
| `src/pages/templates.astro` | The one catalog: all templates, newest first, in `CatalogGrid` (large / compact cards switch). No separate free or paid lists. |
| `src/pages/templates/[slug].astro` | Template page: gallery, description blocks, stats, FAQ, other templates. |
| `src/lib/template-content.ts` | Turns the imported Marketplace description into page blocks and FAQ. |
| `src/pages/design-system.astro` | Live style guide at `/design-system/`, only in `npm run dev`: `astro.config.mjs` removes it from the production build. |
| `src/pages/sitemap.xml.ts`, `robots.txt.ts` | Generated at build. Static pages are listed by hand in the sitemap; template pages are added automatically. |
| `src/layouts/Base.astro` | `<head>` (SEO, Open Graph, JSON-LD, analytics), header, footer. |
| `src/components/` | UI and layout components. |
| `src/styles/global.css` | Design tokens (`@theme static`) and shared classes. |
| `src/data/site.ts` | Site name, texts, contacts, socials, nav, analytics token. |
| `docs/` | Rules and procedures, split into `production/` and `marketing/`. [docs/README.md](docs/README.md) is the map of the whole project. |
| `scripts/production/` | Import / refresh templates from Framer Marketplace, social preview images `public/og/<slug>.png`. |
| `scripts/marketing/` | Live demo capture, `pinterest/` pins, `social/` posts; one config per template in each. |
| `scripts/clean.mjs` | `npm run clean`: removes captures, scratch folders and build caches. |
| `.work/` | Local work folder, ignored by git (see "Work folder"). |
| `public/` | Served as is: favicons, `og-image.png`, `og/`, `_headers`. |

## Adding or changing a template

1. `npm run add-template -- <marketplace-url> --affiliate <framer.link url> [--featured] [--tags "a, b"] [--category X] [--description "..."]`
   This writes `src/content/templates/<slug>.yaml`, downloads the pictures from the Marketplace page into `src/assets/templates/` and makes `public/og/<slug>.png`.
2. Check the YAML: write a short `description` for the card (one sentence), check `category`, `price` (0 = Free) and `affiliateUrl`.
3. Commit the YAML, the pictures and the og image together.

Hand-edited fields that `npm run sync-templates` never overwrites: `description`, `affiliateUrl`, `featured`, `tags`, `types`, `category`, `added`, `preview`, `pageKind`, `seoDescription`, `overview`, `preparation`, `codeUrl`, `codePrice`, `codeVersion`, `buyUrl`, `soldOn`. `codeUrl`, `codePrice` and `codeVersion` belong to the code version (Contra product link, price in USD, zip version); when `codeUrl` is set, the template page shows "Buy code", a "Code version" block and one more FAQ answer. Leave them out for templates without a code version. Write these four for every new template: they feed the title, search description, intro and "Before you publish" block of its page. Everything else in the YAML comes from Framer and can be refreshed.

Guides are listed in `src/data/guides.ts`; a new guide also needs its accent word in `ACCENTS` in `scripts/production/generate-og.mjs`, then `npm run og` makes `public/og/guides/<slug>.png`.

After changing a name, tagline, price or cover, run `npm run og` (or `npm run og -- <slug>`). The og images depend on the fonts installed on the machine (Segoe UI on Windows), so images made on Linux look different: regenerate them on Vladimir's machine, or leave the committed ones alone.

Template cards show only the cover, the price/Free badge, the name and the tagline. Do not add descriptions or tags to cards.

Categories live in `src/data/categories.json`. `types` in a template YAML must use its slugs; `add-template` suggests them from the Framer data and texts, and `--types` sets them by hand. Framer categories alone are not enough: they are often just `Free`. `/templates/` filters by type, format and price; a category gets a static SEO page (`/templates/category/<slug>/`) once it has 2+ templates. Filtered URLs keep the `/templates/` canonical.

## Work folder

Everything generated while working lives in one git-ignored folder, `.work/<part>/<area>/<slug>/`, where the part is `production` or `marketing`: never in `src/`, `public/` or the repo root, and never in an agent's own folder (`.omc/`, `.claude/`, `.codex/` belong to the agent tool). Whatever must be reused is committed as a script or a config, not as output. The full layout, what goes to GitHub and what `npm run clean` removes are in [docs/README.md](docs/README.md).

## Pinterest pins

Vladimir says "делаем изображения для Пинтереста" (or similar) after a template is ready. Follow [docs/marketing/pinterest.md](docs/marketing/pinterest.md): capture the live demo, render 18 text-free pins in the approved style and, once he approves them, publish them through the PostVIA MCP (the CSV upload is the fallback). Pin images are never part of the site or its deploy. Pins link to the template page on this site with UTM tags, not to Framer.

## Social visuals

Vladimir says "делаем визуал для соцсетей" (or similar) and names a template. Follow [docs/marketing/social.md](docs/marketing/social.md): it holds the approved base look for Instagram, Threads, X and TikTok, three looping videos and three carousels picked from a pool, six posts, captions and a version for each network. The whole flow is at the top of that file. Keep that look for every template and do not redesign it without asking. The ground is measured so it never melts into the site. Posts link to our site with UTM tags, not to Framer. Nothing is published without Vladimir.

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
- When to make a code version: a free Framer template can get one right away (it is how a free template earns). A paid Framer template is sold only in Framer at first; it gets code only once it sells steadily or buyers ask for it. Before the first paid one, check the Framer Marketplace creator terms on selling the same design elsewhere.
- Copy about premium templates (catalog title, home FAQ and specs) depends on whether the catalog has a paid template; the pages check this themselves, so do not hard-code "premium". There is one catalog, `/templates/`; the price badge on each card says free or paid.
- Money comes from the Framer referral and from code sales. The Framer button stays first; code is the second option, for people who will not use Framer. The template page links Framer plans through `site.framerReferral` in "Before you publish".
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
