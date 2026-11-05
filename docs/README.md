# Project map

Where everything lives. The work has two parts, and `scripts/`, `docs/` and `.work/` follow them:

- **Production:** niche, references, Framer template, code version, Marketplace and its 4 images, template page on the site.
- **Marketing:** Pinterest pins, UI8 and Craftwork, posts for Instagram, Threads, X and TikTok.

## The flow

| Part | Step | Rules | Scripts | Local files |
| --- | --- | --- | --- | --- |
| Production | Niche to site, every stage | [production/template-pipeline.md](production/template-pipeline.md) | | |
| Production | Code version | [production/code-versions.md](production/code-versions.md) | private `vonex-code` repo | `.work/production/code/<slug>/` |
| Production | Generated images | [production/template-pipeline.md](production/template-pipeline.md) | | `.work/production/visuals/<slug>/` |
| Production | Marketplace texts and 4 images | [production/template-pipeline.md](production/template-pipeline.md) | | `.work/production/marketplace/` |
| Production | Template page on the site | [AGENTS.md](../AGENTS.md) | `scripts/production/` | none, writes to `src/` and `public/og/` |
| Marketing | Screenshots of a live demo | [marketing/pinterest.md](marketing/pinterest.md) | `scripts/marketing/capture.mjs` | `.work/marketing/captures/<slug>/` |
| Marketing | Pinterest pins | [marketing/pinterest.md](marketing/pinterest.md) | `scripts/marketing/pinterest/` | `.work/marketing/pinterest/<slug>/` |
| Marketing | UI8 and Craftwork | [marketing/marketplaces.md](marketing/marketplaces.md) | | `.work/marketing/marketplaces/<slug>/` |
| Marketing | Social posts | [marketing/social.md](marketing/social.md) | `scripts/marketing/social/` | `.work/marketing/social/<slug>/` |

## What goes to GitHub

| In git | Why |
| --- | --- |
| `src/`, `public/` | The site, with template YAML, pictures and og images |
| `scripts/` | Everything that makes files, with one config per template in `configs/` |
| `docs/`, `AGENTS.md`, `README.md`, `DESIGN.md`, `DESIGN_SYSTEM.md` | Rules. The two design files describe the site and stay in the root, where design tools look for them |

| Not in git | Where | Lifetime |
| --- | --- | --- |
| Working files | `.work/` | Local, see below |
| Code versions | private `vonex-code` repo | Permanent, sold on Contra |
| Framer projects | Framer | Permanent, the source of every template |
| Pin images | Cloudflare R2 bucket `vonex-pins` | Permanent, served to Pinterest |
| Build output and caches | `dist/`, `.astro/`, `.wrangler/`, `node_modules/` | Remade at any time |
| Agent tool folders | `.claude/`, `.omc/`, `.codex/`, `.impeccable/` | Local |
| Secrets | `.env` | Never committed |

## Local work folder

Paths always read `.work/<part>/<area>/<slug>/`.

```
.work/
  production/
    code/<slug>/          screenshots and comparisons while porting
    visuals/<slug>/       ComfyUI runs; sources/ holds what is needed to remake an image
    marketplace/          texts for Framer Marketplace
  marketing/
    captures/<slug>/      screenshots of the live demo, shared by pins and posts
    pinterest/<slug>/     pins, JPGs, contact sheet; CSV files sit in pinterest/
    marketplaces/<slug>/  previews and archives for UI8 and Craftwork
    social/<slug>/        finished posts: motion/, static/, captions.md
    social/empty/         the same layouts with empty frames
  tmp/                    anything short-lived
```

## What is temporary

| Command | Removes | Keeps |
| --- | --- | --- |
| `npm run clean` | `marketing/captures/`, every `tmp`, `raw` and `screens` folder, `dist`, `.astro`, `.wrangler` | Pins, posts, marketplace previews, code notes, every `final/` and `sources/` folder |
| `npm run clean -- --all` | The whole `.work/` too | Only what is in git |
| `-- --dry-run` | Nothing, only lists what would go | |

Captures can always be remade with `npm run capture`, so clean them when a template's pins and posts are finished. Use `--all` only after posts and archives are published: finished posts exist nowhere else.
