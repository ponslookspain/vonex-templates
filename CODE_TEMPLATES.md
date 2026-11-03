# CODE_TEMPLATES.md

Plan and rules for selling the **code version** of a template: the same design as the Framer template, rewritten by hand as a clean Astro project and sold as a zip. Read it before touching anything about code versions. The site itself stays a Framer showcase first (see [AGENTS.md](AGENTS.md)); the code version is an extra option on the template page.

## What this is

- Framer remains the main product. The free or paid Framer template, and the `affiliateUrl`, stay as they are.
- A code version is a second product for people who do not want Framer: the same design as a plain Astro + Tailwind project they host anywhere.
- It is **written by hand from the Framer project**. We never export or scrape a Framer site. An export carries Framer's runtime and generated code, which we cannot sell (see [Why not export](#why-not-export)).

## How it works

Pricing follows the four template offers in [AGENTS.md](AGENTS.md#template-offers): code for a free template is $19, code for a paid template costs the same as the Framer version.

1. **Source of truth for design** is the Framer project. Claude reads it through the Framer MCP (pages, components, styles, texts, breakpoints) and compares against the published site.
2. **Code** lives in a private repository `vonex-code`, one folder per template (`vonex-code/<slug>/`). A shared `vonex-code/_base/` holds the starting point (Astro and Tailwind config, fonts, `pack` script, README and LICENSE templates). A new template starts as a copy of `_base`.
3. **Packing.** `npm run pack <slug>` builds the check, then writes `<slug>-v<version>.zip` with sources only (no `node_modules`, `dist`, `.git`), plus `README.md`, `LICENSE.md`, `CHANGELOG.md`.
4. **Selling and delivery** go through Contra (Products, merchant of record: payments, taxes and disputes are handled by Contra). Vladimir uploads the zip in the product's "Files" field (limit 5 GB) and writes the "After purchase description". No GitHub Actions, releases, demo subdomains or buyer access to the repository.
5. **Demo** is the template's existing Live Preview (the Framer site). The code version must match it, so no separate demo.
6. **This site** only shows the option: `codeUrl` and `codePrice` in the template YAML give a "Buy code" button on the template page. Empty fields mean no button.

## Stack (the same for every template)

| What | Choice |
| --- | --- |
| Framework | Astro (latest), static output |
| Styles | Tailwind CSS 4, design tokens in `@theme` (colors, fonts, spacing from the Framer styles) |
| Components | `.astro`, one file per Framer component (`Sections/Hero/Phone-Rise` becomes `components/sections/HeroPhoneRise.astro`) |
| Interaction | Small vanilla JS scripts (accordion, pricing switch, mobile menu). No React or other UI framework |
| Animation | CSS and IntersectionObserver, respect `prefers-reduced-motion`. A library only when CSS cannot do it, decided per template |
| Images | `astro:assets` |
| Fonts | Fontsource, self-hosted, only open-license fonts |
| Language | TypeScript, light touch; code must read well without knowing TS |
| Forms | Plain `<form>`; the endpoint is one value in config (Web3Forms or Formspree by default) |
| CMS content | Astro content collections |
| Format | Prettier |

All copy, links, prices, testimonials and FAQ live in one file, `src/content/site.ts`, so buyers change content without touching markup. Colors, fonts and spacing live in `src/styles/theme.css`.

Archive layout:

```
<slug>/
  src/content/site.ts     all texts and links
  src/styles/theme.css    tokens
  src/components/         one per Framer component
  src/pages/              same pages as the Framer template
  src/assets/             images
  README.md               install, edit, deploy in 5 minutes
  LICENSE.md
  CHANGELOG.md
```

## Rules

- **Match Framer as closely as it can be measured.** Same layout, spacing, type and behavior on Desktop, Tablet and Phone with the same breakpoints. Verify side by side in the browser at three widths before calling it done (see "Fidelity" below for what to check and what we may promise).
- **Redistribution rights.** Everything inside the zip must be allowed to ship: own or self-generated images, Unsplash or Pexels, OFL fonts, libraries under permissive licenses (MIT, ISC, Apache-2.0, BSD). Dependencies are installed by the buyer from npm, not shipped in the zip; ask before adding GPL or paid ones. No paid stock, no paid fonts, no Framer assets. If a Framer image cannot ship, replace it in Framer and in code, or use a placeholder and say so in the product description.
- **No Framer runtime** and no generated Framer code in the archive.
- **Editable first.** Content in `site.ts`, tokens in `theme.css`, no magic values in components, short comments that explain why.
- **Fast by default.** No client JS unless needed, images optimized, Lighthouse near 100 on the built output.
- **One version number per template** (`v1.0`), written in the zip name, `CHANGELOG.md` and the Contra description.

## How to match Framer exactly (learned on Alpine)

1. Read the Framer project through the MCP for structure, component names, copy and styles.
2. Open the published site and read computed styles and sizes with a small script (the layers keep their Framer names in `data-framer-name`). Do this at three widths: 1440, 1000 and 390.
3. Write the Astro components, then compare **every section's height and top position** with Framer at the three widths. If all section heights match, the page matches. Alpine matched on desktop to the pixel and on tablet and phone within a few sections.
4. Then compare screenshots section by section.

Things that cost time and are now solved:

- Framer draws hairlines on top of the box, so they never add to its size. We use the `.line` utility in `global.css` (`line line-t line-b`) instead of CSS borders. Plain borders make every section a few pixels taller.
- Hero phones are taller than the hero on purpose and are cropped. Use a fixed section height and `shrink-0` on the phone.
- Scroll reveals are `data-reveal`; the load animation of the hero phone is `data-reveal="phone"`.
- The FAQ is native `<details>`. The pricing switch is a 10-line script.
- Check with `scroll-behavior: smooth` in mind: scroll with `behavior: 'instant'` before taking screenshots.

Scratch material while porting (screenshots, Framer snapshots, section-height comparisons) goes to `.work/code/<slug>/` in this repository, which is git-ignored, and is removed with `npm run clean` when the version is packed (see AGENTS.md, "Work folder"). The code itself lives only in `vonex-code`.

## Fidelity: what we check and what we may promise

Harrier was checked against the live Framer site with the scripts in `vonex-code/scripts/fidelity/` (see its README):

- Page height at 1440, 1000 and 390 px (Framer's own widths are 15px less because of the scrollbar), every page, within 2 px.
- Line breaks of every text, word by word.
- Motion timings (load entrance, scroll reveal, floating cards, rings, marquee, accordion, testimonial autoplay), sampled in the browser.
- Phone behavior in emulated iPhone and Android profiles and in WebKit (the Safari engine): no horizontal overflow, nothing covered by something else, menu, FAQ and tabs work by touch, form fields 16px on touch screens.

What we may say in public text: the code **closely matches** the Framer template (same design, layout and behavior at phone, tablet and desktop). What we must not say: "identical", "pixel-perfect", "100%". Pixels differ by about 1 to 5 percent between browsers anyway because text is drawn differently.

Every code version's README has a "Fidelity and known differences" section that says what was checked and lists the differences (fonts, effects rebuilt instead of copied, the contact form, no visual editor, supported browsers). If a buyer complains about something listed there, point to it; if it is a real mismatch, fix it in the next version (x.y.1) and note it in the changelog.

## Updating a code version

1. Vladimir changes the design in Framer (alone or with Claude) and publishes.
2. He says "синхронизируй `<slug>`".
3. Claude reads the current Framer project and diffs it against `framer-snapshot` kept in `vonex-code/<slug>/`.
4. Claude ports only what changed, checks screenshots against the published site, updates the snapshot, bumps the version and the changelog.
5. `npm run pack <slug>`, Vladimir uploads the new zip to the Contra product.
6. Contra lets the seller update a product's delivery files at any time, and past buyers get the current version (Contra help center). Check it once with a test purchase.

## Contra setup (per template)

- Product title: `<Name> — Astro code`. Price: set per template, Alpine is $19 (single project). The price on Contra and `codePrice` in the YAML must always match. An Extended license (more projects) would be a second product, if we offer it.
- Files: the zip. After purchase description: install steps, deploy link to README, license summary, version, support via Contra messages.
- Product description (the point of sale), always: "Digital product. All sales are final. Single-project license, no resale or sharing: vonexdesign.com/license/. Refund policy: vonexdesign.com/refunds/." Contra's default is already no refunds once access is granted, unless the law requires one or the seller states another policy at the point of sale; refund rules and license scope are set by the seller on the listing.
- One line in the description: "Demo images are placeholders in the code version" when images are replaced.
- Before the first real launch: test purchase, payout test, check the processing fee. Ask Contra support whether checkout collects the EU consent that ends the 14-day withdrawal right for downloads.

## Changes on this site

Done once, before the first launch:

- `src/content.config.ts` and the template YAML: `codePrice` (number) and `codeUrl` (Contra product link), both optional.
- Template page: a "Buy code" button next to "View on Framer", a short "Code version" block (what is inside, stack, license, host anywhere). Follows DESIGN.md and uses existing tokens and button classes.
- Pages `/license/`, `/refunds/` (and `/terms/`, `/privacy/` if missing), linked in the footer. Add to the sitemap by hand (see AGENTS.md).
- Copy: the site stays Framer-first. Add a short mention that most templates also come as clean code, in the FAQ and in a new guide ("Framer or code: which one to pick").
- Template schema and `scripts/add-template.mjs` keep `codeUrl` and `codePrice` as hand-edited fields that `sync-templates` never overwrites.

## Why not export

Tools like framertonextjs.com, ExportNoCode and the Full Site Export plugin copy the published site. The result contains Framer's runtime and generated code, which is not ours to sell, is hard to edit and can be produced by any buyer for a few dollars. A hand-written project is ours, clean, and the real value of the product.

## Pilot: Alpine App

Alpine App (Framer project `LmLeOsyWlceRaXxCdnQr`, 4 pages, 33 components, 6 color tokens, 8 text styles, Inter) is the first code template. Done when:

1. `vonex-code` and `_base` exist; Alpine ported and matches Framer at three widths.
2. `npm run pack alpine-app` makes a clean zip that installs, builds and deploys.
3. A Contra product for it is published, with a successful test purchase and payout.
4. The "Buy code" button and the supporting pages and copy are live on this site.
5. We review what was slow or unclear, fix `_base` and this document, then port the next templates.

## Legal checklist

- Check Framer Marketplace author terms for limits on selling the same design elsewhere.
- License: one Project per license, no resale, sharing, public repositories or reuse as a template or starter (written, on `/license/` and in each LICENSE.md; keep the two texts identical). A second tier (Extended or Unlimited) is optional and not built.
- No refunds: digital product, all sales final (`/refunds/`). Statutory consumer rights cannot be removed: in the EU a buyer keeps a 14-day withdrawal right unless they agree at checkout that it ends when the download starts, and faulty digital content has legal remedies. The policy says "unless the law requires".
- Check every font, image and library license inside the archive.
- Income tax stays Vladimir's; Contra handles sales taxes as merchant of record (confirm in Contra's terms).
