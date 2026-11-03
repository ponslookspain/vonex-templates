# Vonex Design system (Alpine)

Two files, two jobs:

- [DESIGN.md](DESIGN.md) is the **design direction**: colours, fonts, type scale, spacing, the Do's and Don'ts. It says what the site should look like.
- This file says **how that direction is wired into the code**: where the tokens live, which class or component to use, and how to change things safely.

One rule: **every visual value comes from a token, every page is built from the same components on the same 4-column grid.**

A live version of everything below is at `/design-system/` (run `npm run dev`, open http://localhost:4321/design-system/). It reads `src/styles/global.css` at build time, so it always shows the real values. It exists only in dev: `astro.config.mjs` removes it from the production build.

## The look in one paragraph

Warm paper (#f2f1ee), soft black ink (#101014). Quiet text and hairlines are the same ink at lower opacity; no other hues, no shadows, no rounded corners. Archivo set wide for headlines in sentence case, one Instrument Serif italic accent word in each section headline (`accent` prop, `.type-accent`), Inter for text, Geist Mono for labels and buttons. Hairlines separate things; a heavy 8px frame marks the one picture that matters. Short copy sits in narrow pillars. The only colour on the page comes from the template covers.

## Where things live

| What | Where |
| --- | --- |
| Design direction | `DESIGN.md` |
| Tokens (colour, type, spacing, lines, layout, motion) | `src/styles/global.css`, the `@theme static` block |
| Phone values of the tokens (below 768px) | `src/styles/global.css`, the `@media (max-width: 47.99rem)` block right below |
| Type roles, layout classes, button, card, cells, tag, input, band, FAQ | `src/styles/global.css`, the `@layer components` blocks |
| Components | `src/components/*.astro` |
| Page shell (head, SEO, header, footer, scroll reveal) | `src/layouts/Base.astro` |
| Content and site settings | `src/content/templates/*.yaml`, `src/data/site.ts` |

## Tokens

Names say what a value is **for**, never how it looks. Add a comment after a token and it shows up on the design-system page.

Tailwind's own palette, radii and shadows are switched off in `@theme` (`--color-*: initial` and so on). `bg-gray-500`, `rounded-lg`, `shadow-md` do not exist, so they cannot creep back in.

| Group | Tokens | Utility |
| --- | --- | --- |
| Colour | `--color-bg`, `surface`, `fg`, `muted`, `primary`, `on-primary`, `line` (all `#fff` or `#000`) | `bg-primary`, `text-on-primary`, `border-line`… |
| Type size | `--text-display`, `headline-lg / md / sm / xs / xxs`, `body`, `label` | used by the `.type-*` classes |
| Type metrics | `--leading-display / headline / body / label`, `--tracking-headline / body / label` | used by the `.type-*` classes |
| Spacing | `--spacing-base` 8, `xs` 6, `sm` 11, `md` 15, `lg` 20, `xl` 57, `2xl` 113 (px) | `p-md`, `gap-lg`, `mt-xl`, `py-2xl` |
| Lines | `--border-hairline` 1px, `--border-frame` 8px | `.frame`, `.frame-hairline`, `border-line` |
| Layout | `--container-page` (90rem), `--container-pillar` (short copy), `--container-prose` (long documents), `--grid-columns` (4), `--grid-gutter`, `--space-page`, `--space-section`, `--space-card`, `--space-header` | `.container-page`, `.grid-4`, `.section`, `.type-pillar` |
| Motion | `--duration-fast / base / reveal / marquee / slide`, `--reveal-distance`, `--reveal-stagger`, `--ease-out` | `duration-(--duration-base) ease-out` |

The big headline sizes use `clamp()`, so they shrink on phones by themselves. Spacing that changes on phones (gutter, page padding, section padding) is set in the phone `@media` block, never inside a component.

### Rules

1. No raw colours, font sizes, radii or shadows in components. Use a token.
2. Text size comes from a `.type-*` role, not from `text-4xl` and similar.
3. Spacing uses the named steps (`p-lg`, `mt-xl`), not `p-5` or `mt-[23px]`.
4. Need a value that does not exist? Add it to DESIGN.md and as a token first, then use it.
5. Paper and ink only. If something needs to stand out, make it bigger, put it in capitals, frame it or invert it (paper on ink). Lower opacity is only for secondary text and hairlines, through the tokens.

## Typography roles

Apply the role class; size, weight, line height and tracking are included. Headlines are in sentence case as written; only `.type-label` and `.tag` turn text into capitals, so write all source text in normal sentence case.

| Class | DESIGN.md role | Use |
| --- | --- | --- |
| `.type-display` | headline-display, 150px / 0.77 | The hero headline or the 404. Once per page. |
| `.type-headline-lg` | headline-lg, 75px | Section titles, big numbers |
| `.type-headline-md` | headline-md, 45px | Price, mobile menu items |
| `.type-headline-sm` | headline-sm, 30px | Template names, block titles |
| `.type-headline-xs` | headline-xs, 22px | Card titles, the wordmark |
| `.type-headline-xxs` | headline-xxs, 16px | Small titles, FAQ questions, footer column titles |
| `.type-body` | body-md, 15px / 1 | Text |
| `.type-pillar` | | Add to `.type-body` for short copy: keeps it in a narrow column, about 30 characters |
| `.type-prose` | | Long documents only (legal pages, template descriptions): body on a reading measure |
| `.type-label` | label-md, 15px, +0.08em, capitals | Labels, nav, meta rows, tags, buttons |
| `.kicker` | | Section index above a title, with `.type-label`: "01 / Featured" |

Pick the heading level (`h1`, `h2`, `h3`) for the document outline and the role class for the look; they are independent.

## Grid

4 columns inside `.container-page` (max 90rem, 24px side padding and 24px gutters; 16px on phones). The 4 columns stay at every width; items change their span.

```html
<Section>                          <!-- vertical rhythm + container -->
  <SectionHeader title="…" />
  <ul class="grid-4">              <!-- 4 columns -->
    <li class="col-span-4 md:col-span-2">…</li>
  </ul>
</Section>
```

| Layout | Classes |
| --- | --- |
| Full width | `col-span-4` |
| 2 per row from 768px (template cards) | `col-span-4 md:col-span-2` |
| 4 per row on desktop | `col-span-4 md:col-span-2 lg:col-span-1` |
| Label left, content right | `col-span-4 lg:col-span-1` + `col-span-4 lg:col-span-3` |
| Half and half | `col-span-4 lg:col-span-2` twice |

An odd last template card steps to the right column by itself (rule in `global.css`). `ColumnLines` draws the four column lines behind a block, as in the home hero.

Press **G** on any page to overlay the 4 columns (always in `npm run dev`; in production only where `<Base gridOverlay>` is set).

Vertical spacing: sections are `--space-section` apart (113px, 57px on phones). `flush="top"` / `flush="bottom"` on `Section` removes one side; `rule` adds a full-width hairline above it.

## Motion

Deliberate and the same everywhere. One easing (`--ease-out`), a few durations, nothing bounces.

| Motion | Where | How |
| --- | --- | --- |
| **Block reveal** | Every block of every page | Automatic. The script at the end of `Base.astro` marks each direct child of each `.container-page` in `<main>` and `<footer>` (it looks through `.grid-4`, `.faq-list` and `.doc`). Each rises `--reveal-distance` (24px, 16px on phones) and fades in over `--duration-reveal`, once, as it enters the screen. Blocks in one row follow each other by `--reveal-stagger`. New pages and sections get it with no extra markup; `data-reveal-skip` opts one block out. |
| **Invert on hover** | Template cards, spec cells | Add `.invert-hover` to the block (or to a direct child of the link): it turns black and its content white over `--duration-base`. |
| **Cover zoom** | Pictures inside cards | `group-hover:scale-[1.03]` over `--duration-reveal`. |
| **Hero slider** | `HeroSlider` | Cross-fade every `--duration-slide`, slow push-in on the visible cover. Pauses on hover, focus, off screen and with reduced motion. |
| **Band** | `Band` | Endless sideways loop, `--duration-marquee`, paused off screen. |
| **Arrows** | Buttons and cards | The arrow steps 2px up and right on hover. |

With `prefers-reduced-motion` every transition and animation is off (rule in `global.css`).

## Components

| Component | Props | Notes |
| --- | --- | --- |
| `Container` | `as`, `class` | Page width and side padding |
| `Section` | `id`, `labelledby`, `label`, `flush`, `rule`, `class` | `Container` inside; gives the section its accessible name |
| `SectionHeader` | `title`, `id`, `index`, `kicker`, `lead`, `level` (1 or 2) + slot | Left-aligned: "01 / Kicker", title, short text. The slot sits on the right (a button, a count) |
| `Button` | `href`, `variant` (primary / secondary), `size` (md / compact), `arrow` | The only way to make a button; renders `<a>` when `href` is set. Labels are verbs: EXPLORE, VIEW, ORDER |
| `Card` | `as`, `padded`, `class` | Surface with a hairline border |
| `.cells` + `.cell` (classes) | `.cells-2`, `.cells-4` | Blocks sharing one hairline, the spec-sheet look |
| `.tag`, `.tag-solid` (classes) | | Outlined or black label: price, category, Framer features |
| `.input` (class) | | Text field. No forms on the site yet; use it when one is added |
| `.frame`, `.frame-hairline` (classes) | | Heavy 8px or 1px black frame around a picture |
| `HeroSlider` | `templates`, `class` | Framed cover that changes by itself, square dots to switch |
| `.invert-hover` (class) | | Block turns black with white content on hover |
| `Band` | `items` | Full-bleed black strip with big words running sideways |
| `ColumnLines` | | The four column lines behind a block (`relative isolate` parent) |
| `FaqBlock`, `FaqItem` | `title`, `index`, `rule` / `question` + slot | Title left, hairline rows right. Native `<details>` |
| `TemplateCard` | `template`, `class` | Cover, price, name, tagline. Nothing else |
| `TemplateGallery` | `items`, `name` | Picture slider with arrows, swipe, counter and thumbnails |
| `Icon` | `name`, `class` | Lucide icon, 2px stroke, `currentColor`. Icons are in `components/icons.ts` |
| `Header`, `Footer`, `Logo`, `SocialIcon`, `LegalPage` | | Site chrome |
| `GridOverlay` | | Debug columns, toggled by G |

## Breakpoints and responsive rules

Tailwind's default breakpoints; `md` and `lg` do almost all the work. Write mobile first: the plain class is the phone, then `md:` and `lg:` change it.

| Name | From | What changes |
| --- | --- | --- |
| phone | 0 | Everything in one column. Side padding, gutter and section gap shrink (phone `@media` block in `global.css`). |
| `sm` | 640px (40rem) | Only to show a label hidden on phones (rule 6 below). |
| `md` | 768px (48rem) | Template cards two to a row, cells two to a row, compact catalog three to a row. |
| `lg` | 1024px (64rem) | Side-by-side layouts: hero three columns, `.split` halves, template page gallery + details, label + content rows, cells four to a row. |
| `xl` | 1280px (80rem) | Compact catalog four to a row. Nothing else. |

Rules, learned from bugs we fixed:

1. **Side by side starts at `lg`, not `md`.** At 768px a quarter column is about 170px: too narrow for a button or a label next to a picture. Use `md:` only for equal tiles (cards, cells).
2. **Every grid column is `minmax(0, 1fr)`, including a one-column grid.** A bare `grid` with `grid-template-areas` and no columns sizes its column by the widest content, and the page runs past a phone screen. `.grid-4`, `.card-grid`, `.split` and `.product` already do this; copy them.
3. **Flex items that hold text get `min-width: 0`** so the text can wrap (see `.section-bar > *`).
4. **Text on a white backing over column lines uses `inline-block`** (`bg-bg inline-block`). An inline backing with vertical padding covers the line above it when the text wraps.
5. **Buttons may wrap.** `.btn` has `max-width: 100%`; keep labels short so they stay on one line at 390px.
6. **Drop, do not squeeze.** If a secondary label repeats something nearby and has no room on phones, hide it below `sm` (`hidden sm:inline`), like the price label next to the breadcrumb.
7. **Responsive values live in tokens.** A spacing that differs on phones is set in the phone `@media` block, never inside a component.

Check every layout change at **340, 390, 768, 1024 and 1440px**: no horizontal scroll, no overlapping text. In the browser console, `document.documentElement.scrollWidth > innerWidth` must be `false`.

## Section anatomy

Every page is `main.page-rails` (two hairlines down the page on the outer grid edges) with sections stacked inside. A section is:

```
Section (bar, flush, labelledby)            .section, --space-section above and below
  ├ section bar    "02 / Specs"  ·  "Built in Framer"   hairlines rail to rail, muted labels
  ├ SectionHeader  kicker, title with one accent word, lead; button or count on the right
  └ content        .grid-4 / .card-grid / .cells / .split / .faq-list, often .flush-rails
```

- **Bar.** `bar={{ left, right }}`. Left: `NN / Name` on pages with numbered sections (home, free templates), a plain name elsewhere (`Catalog`, `FAQ`). Right: a short fact (`04 answers`, `05 templates · Newest first`). Sections with a bar stack with no gap, sharing one hairline.
- **Title.** Sentence case, ends with a full stop, exactly one accent word in Instrument Serif italic (`accent` prop): "Selected *templates*.".
- **Framed content** (cards, cells, split, product) uses `.flush-rails`, so its outer lines are the page rails.
- **`flush="bottom"`** when the content ends on a hairline and the next section starts with its own bar.
- **One black block per page**: `CtaBand` near the end. `Band` (running words) only on the home page.

## Pages

| Page | File | Sections, top to bottom |
| --- | --- | --- |
| Home | `src/pages/index.astro` | Hero (meta row, display headline, `HeroSlider`, Explore / View on Framer) · `Band` · 01 Featured (`.card-grid`, 4 templates) · 02 Specs (`.cells-4`) · 03 Start (three steps with `StepVisual`) · 04 FAQ · `CtaBand` |
| All templates | `src/pages/templates.astro` | Catalog bar + header · `CatalogGrid` (large / compact switch) |
| Free templates | `src/pages/templates/free.astro` | 01 Free (`CatalogGrid`) · 02 Compare · 03 Publishing |
| Template page | `src/pages/templates/[slug].astro` | See below |
| Guides index | `src/pages/guides/index.astro` | One section per guide group, with its articles |
| Guide, About, License, Refunds, Terms, Privacy | `src/pages/guides/*.astro`, `about.astro`… | `LegalPage`: bar, title with accent, `.type-prose` text; guides add `GuideFigure`, `TemplateRoundup`, tables |
| 404 | `src/pages/404.astro` | Display headline, link home |

### Template page

One layout for every template; what shows depends on the YAML (offer, `pageKind`, imported sections).

```
Section.section-with-bar
  bar: Home / Templates / Name   ·   "$49 · Wedding Website" (hidden on phones)
  .product.flush-rails                        phone: head, gallery, doc in one column
  ├ .p-head     label "Free Framer Portfolio template", h1 name, tagline
  ├ .p-gallery  TemplateGallery (slider, arrows, counter, thumbnails) + View live preview
  │             lg+: left half, sticky
  └ .p-doc      lg+: right half
      ├ .buy        Price, main button, + "Buy code · $19" when codeUrl is set
      ├ .stats      Pages · CMS · Updated, in 2-column cells
      ├ .lead       "<Kind> template for Framer" + overview
      ├ Code version        only with codeUrl (offers free-code, paid-code)
      ├ Before you publish  from `preparation`
      └ imported blocks     About, Why <name>, Features, Pages, Best for, Built with Framer,
                            Updates, Support, policy; chosen by src/lib/template-content.ts
FaqBlock          questions built from the YAML (+ a code answer with codeUrl)
CtaBand           closing black block
Section Catalog   "More templates.", two other templates
```

Price and buttons by offer (rules in AGENTS.md, "Template offers"; `buyLink`, `buyLabel`, `offer` in `src/lib/buy.ts`):

| Offer | Price | Main button | Second button |
| --- | --- | --- | --- |
| `free` | Free | Use free on Framer | none |
| `free-code` | Free | Use free on Framer | Buy code · $19 |
| `paid` | $49 | Get on Framer, or Buy template with `buyUrl` | none |
| `paid-code` | $49 | Get on Framer, or Buy template with `buyUrl` | Buy code · $49 |

To change the template page for every template, edit `[slug].astro` or `template-content.ts`. To change one template, edit its YAML only: never add per-template conditions to the page.

## Recipes

**Add a page**

1. Create `src/pages/<name>.astro` with `<Base title="…" description="…">`.
2. Build it from `Section` → `SectionHeader` → `.grid-4` and the components above.
3. Add the path to `pages` in `src/pages/sitemap.xml.ts`, and a link in `nav` in `src/data/site.ts` if it belongs in the menu.

**Add a section to the home page**: copy the closest existing section in `src/pages/index.astro`, give it the next `index`, change the content, keep the grid classes.

**Change the look of the whole site**: change DESIGN.md, then the tokens in `src/styles/global.css`. Example: the section gap is `--space-section`; headline tracking is `--tracking-headline`.

**Add an icon**: copy the path data of a Lucide icon from https://lucide.dev into `src/components/icons.ts`, then use `<Icon name="…" />`. It shows up on the design-system page.

**Add a token**: add it to the `@theme static` block with a comment. If it needs a different value on phones, also set it in the phone `@media` block.

**Add a component**: create it in `src/components/` using only tokens and `.type-*` roles, give it typed `Props`, and add a sample to `src/pages/design-system.astro`.

## Checklist before merging a change

- [ ] Paper and ink tokens only (no raw colors, no other hues), no shadows or rounded corners.
- [ ] Headlines in sentence case through a `.type-headline-*` class, one accent word; one `.type-display` per page at most.
- [ ] Short copy in `.type-pillar`; long documents in `.type-prose`.
- [ ] Layout uses `Section` and `.grid-4`; columns line up when you press G.
- [ ] Looks right at 340, 390, 768, 1024 and 1440 px: no horizontal scroll, no overlapping text (see "Breakpoints and responsive rules").
- [ ] A new section follows "Section anatomy"; a template page change works for all four offers.
- [ ] `npm run check` and `npm run build` pass.
- [ ] New component or token is visible on `/design-system/`.
