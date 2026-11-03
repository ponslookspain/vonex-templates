# Vonex Design system (Alpine)

Two files, two jobs:

- [DESIGN.md](DESIGN.md) is the **design direction**: colours, fonts, type scale, spacing, the Do's and Don'ts. It says what the site should look like.
- This file says **how that direction is wired into the code**: where the tokens live, which class or component to use, and how to change things safely.

One rule: **every visual value comes from a token, every page is built from the same components on the same 4-column grid.**

A live version of everything below is at `/design-system/` (run `npm run dev`, open http://localhost:4321/design-system/). It reads `src/styles/global.css` at build time, so it always shows the real values. It exists only in dev: `astro.config.mjs` removes it from the production build.

## The look in one paragraph

White page, black type, nothing in between: no grays, no tints, no shadows, no rounded corners. Inter only, 700 for headlines (always in capitals, tracked tight), 400 for text. Hairlines separate things; a heavy 8px frame marks the one picture that matters. Short copy sits in narrow pillars. The only colour on the page comes from the template covers.

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
5. Black and white only. If something needs to stand out, make it bigger, put it in capitals, frame it or invert it (white on black). Never make it gray.

## Typography roles

Apply the role class; size, weight, line height, tracking and case are included. Headline classes set `text-transform: uppercase`, so write the source text in normal sentence case.

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

## Pages

- **Home** (`src/pages/index.astro`): hero (meta row on white backings, display headline, cover slider, EXPLORE), running band, featured templates, specs in cells, three steps, FAQ, black closing block.
- **Templates** (`/templates/`): every template, two to a row.
- **Template page** (`/templates/<slug>/`): gallery pinned on the left; name, price, buttons, numbers and the imported description on the right; FAQ; black closing block; two more templates. `src/lib/template-content.ts` decides how each imported section is shown. Its social preview is `public/og/<slug>.png` (`npm run og`).
- **Privacy, Terms** (`LegalPage`), **404**.

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

- [ ] Black and white only, no grays, tints, shadows or rounded corners.
- [ ] Headlines in capitals through a `.type-headline-*` class; one `.type-display` per page at most.
- [ ] Short copy in `.type-pillar`; long documents in `.type-prose`.
- [ ] Layout uses `Section` and `.grid-4`; columns line up when you press G.
- [ ] Looks right at 390, 768, 1024 and 1440 px, with no horizontal scroll.
- [ ] `npm run check` and `npm run build` pass.
- [ ] New component or token is visible on `/design-system/`.
