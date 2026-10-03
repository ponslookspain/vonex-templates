# Vonex Design system

One rule: **every visual value comes from a token, every page is built from the same layout components on the same 12-column grid.** This file explains how, and how to change things safely.

A live version of everything below is at `/design-system/` (run `npm run dev`, open http://localhost:4321/design-system/). It reads `src/styles/global.css` at build time, so it always shows the real values. It exists only in dev: `astro.config.mjs` removes it from the production build.

## Where things live

| What | Where |
| --- | --- |
| Tokens (color, type, radius, widths, grid, motion) | `src/styles/global.css`, the `@theme static` block |
| Responsive token values (from 640px) | `src/styles/global.css`, the `@media (min-width: 40rem)` block right below |
| Type roles, layout classes, button, surface, badge, glow | `src/styles/global.css`, the `@layer components` blocks |
| Components | `src/components/*.astro` |
| Page layout (head, SEO, header, footer) | `src/layouts/Base.astro` |
| Content and site settings | `src/content/templates/*.yaml`, `src/data/site.ts` |

## Tokens

Naming is `--<group>-<role>`. Names describe what a value is **for** (`surface`, `muted`, `panel`), never how it looks (`dark-gray`, `big-radius`), so the look can change without renaming anything.

Add a comment after a token (`--color-x: #fff; /* what it is for */`) and the description shows up on the design-system page automatically.

| Group | Tokens | Tailwind utility |
| --- | --- | --- |
| Color | `--color-bg`, `surface`, `surface-2`, `line`, `outline`, `outline-strong`, `fg`, `fg-soft`, `muted`, `accent`, `accent-tint`, `accent-indigo`, `accent-sky`, `accent-violet`, `chrome`, `success` | `bg-surface`, `text-muted`, `border-line`, `from-bg`… |
| Radius | `--radius-control` (buttons), `surface` (cards in sections), `panel` (large panels), `media` (big previews) | `rounded-control`, `rounded-surface`, `rounded-panel`, `rounded-media` |
| Width | `--container-page` (72rem), `--container-measure-display / title / lead / body` (max line length of text) | `max-w-page`, `max-w-measure-title`… |
| Grid and space | `--grid-columns` (12), `--grid-gutter` (1.25rem), `--space-page` (side padding), `--space-section` (section padding), `--space-card` | used by `.grid-12`, `.container-page`, `.section`, `.card-padding` |
| Type | `--text-display`, `statement`, `h1`, `h2`, `h3`, `title`, `lead`, `body`, `small`, `caption`, `numeral` | used by the `.type-*` classes |
| Motion | `--duration-fast / base / slow / ambient / marquee`, `--ease-soft` | `duration-fast`, `duration-base`, `duration-slow`, `ease-soft` |

**Responsive values** are tokens too. `--text-display` is `3rem` on phones and `4.5rem` from 640px. To change that, edit the token in the `@media` block, never inside a component.

### Rules

1. No raw hex colors, pixel font sizes or radii in components. Use a token.
2. Text size comes from a `.type-*` role, not from `text-4xl` and similar.
3. Need a value that does not exist? Add a token first, then use it.
4. Tokens are never referenced by their appearance in a name.

## Typography roles

Font: Inter Variable. Apply the role class; weight, line height and letter spacing are included.

| Class | Use |
| --- | --- |
| `.type-display` | Hero headline, once per page |
| `.type-statement` | Big tagline |
| `.type-h1` | Page title (one `h1` per page) |
| `.type-h2` | Section title |
| `.type-h3` | Card title |
| `.type-title` | Small title, template name |
| `.type-lead` | Intro paragraph (muted) |
| `.type-body` | Default text |
| `.type-small` | Secondary text, buttons, nav |
| `.type-caption` | Labels, badges |
| `.type-numeral` | Big step numbers |
| `.eyebrow` | Small blue label above a section title |

Use the semantic heading level for the document outline (`h1`, `h2`, `h3`) and the role class for the look; they are independent.

## Grid

12 columns inside `.container-page` (max 72rem = 1152px, 20px side padding, 20px gutter).

```html
<Section>                       <!-- vertical rhythm + container -->
  <ul class="grid-12">          <!-- 12 columns -->
    <li class="col-span-12 sm:col-span-6 lg:col-span-4">…</li>
  </ul>
</Section>
```

Mobile first: every item is `col-span-12`, then narrows at `sm:` (640), `md:` (768), `lg:` (1024).

| Layout | Classes |
| --- | --- |
| 3 per row on desktop | `col-span-12 sm:col-span-6 lg:col-span-4` |
| 4 per row on desktop | `col-span-12 sm:col-span-6 lg:col-span-3` |
| 3 per row from tablet | `col-span-12 sm:col-span-4` |
| Centered 8 columns | `col-span-12 lg:col-span-8 lg:col-start-3` |
| Text left, media right | `col-span-12 lg:col-span-6` and a second `lg:col-span-6` |

Press **G** on any page to overlay the 12 columns (always available in `npm run dev`; on production pages only where `<Base gridOverlay>` is set, like the design-system page).

Vertical spacing: sections use `--space-section` (4.25rem phone, 6rem from 640px) top and bottom. Use `flush="top"` or `flush="bottom"` on `Section` to remove one side when two sections should sit closer together.

## Components

| Component | Props | Notes |
| --- | --- | --- |
| `Container` | `as`, `class` | Page width and side padding |
| `Section` | `id`, `labelledby`, `label`, `flush`, `class` | `Container` inside; gives the section its accessible name |
| `SectionHeader` | `title`, `id`, `eyebrow`, `lead`, `level` (1 or 2) | Centered heading on the middle 8 columns |
| `Button` | `href`, `variant` (primary / ghost), `size` (md / compact) | The only way to make a button; renders `<a>` when `href` is set |
| `Badge` | `tone` | Small status label |
| `.tag` (class) | none | Outlined pill for tags and categories, e.g. `<li class="tag">dark</li>` |
| `Card` | `variant` (surface / panel), `padded`, `as`, `class` | Flat block; pass grid classes via `class` |
| `FaqItem` | `question` (+ answer as the slot) | Native `<details>`, no JavaScript |
| `TemplateCard` | `template`, `class` | One catalog entry |
| `InlineIcon` | `name`, `tone` | Icon inside a line of big text; add icons to `paths` in the file |
| `TemplateGallery` | `items`, `name` | Picture slider with arrows, swipe, counter and thumbnails (pictures only) |
| `FeatureCard` | `title`, `text`, `icon` or `step`, `connector`, `as`, `class` + slot `illustration` | Card with an illustration stage on top; used for the steps and the "why" blocks |
| `Icon` | `name`, `class`, `strokeWidth` | Line icon in `currentColor`; icons are defined in `components/icons.ts` |
| `IconTile` | `name` | Icon on a tinted rounded square |
| `illustrations/*` | `templates` (some) | Small pictures built from HTML/CSS for `FeatureCard`: `StepChoose`, `StepRemix`, `StepPublish`, `FeatureResponsive`, `FeatureNoCode`, `FeaturePricing`, `FeatureGrowing` |
| `Glow` | none | Drifting light, inside a `relative overflow-hidden` parent |
| `HeroStage` | `templates` | Template strip plus the 3D logo (reads colors from tokens) |
| `Header`, `Footer`, `Logo`, `SocialIcon` | | Site chrome |
| `GridOverlay` | none | Debug columns, toggled by G |

## Template pages

Each template in `src/content/templates/` gets a page at `/templates/<slug>/` from `src/pages/templates/[slug].astro`. Left: a picture gallery (`TemplateGallery`) that stays pinned while the page scrolls. Right (with an empty column between the two): name, price and buttons, numbers, then the description as numbered sections (About, the benefits, Features, Pages, Best for, Built with Framer, Updates, Support). Below: FAQ built from the template's data, and more templates. `src/lib/template-content.ts` decides how each imported section is shown from its title, so templates written in different styles all work; this page is intentionally more editorial than the rest of the site. Its social preview image is `public/og/<slug>.png`, made by `npm run og` from the template's name, tagline, price and cover. Template cards on the home page and on `/templates/` link to these pages; the page links on to Framer.

## Recipes

**Add a page**

1. Create `src/pages/<name>.astro` with `<Base title="…" description="…">`.
2. Build it from `Section` → `SectionHeader` → `.grid-12` and the components above.
3. Add the path to `pages` in `src/pages/sitemap.xml.ts`, and a link in `nav` in `src/data/site.ts` if it belongs in the menu.

**Add a section to the home page**: copy the closest existing section in `src/pages/index.astro` (same `Section` and `SectionHeader`), change the content, keep the grid classes.

**Change the look of the whole site**: edit tokens in `src/styles/global.css`. Examples: the brand color is `--color-accent`; button and card roundness is `--radius-control` / `--radius-surface` / `--radius-panel`; the heading size is `--text-h2`.

**Add an icon**: add its path data (24x24 grid, drawn with a stroke) to `src/components/icons.ts`, then use `<Icon name="…" />`. It shows up on the design-system page automatically.

**Add an illustration**: create a component in `src/components/illustrations/` that fills its parent (`absolute inset-0`), build it from `.mini-window`, `.skeleton`, tokens and `Icon`, and pass it to `FeatureCard` through `slot="illustration"`. Keep it readable on a dark stage: templates are dark, so give thumbnails a `ring-1 ring-outline-strong`.

**Add a token**: add it to the `@theme static` block with a comment. If it needs a different value on larger screens, also set it in the `@media (min-width: 40rem)` block.

**Add a component**: create it in `src/components/` using only tokens and `.type-*` roles, give it typed `Props`, and add a sample to `src/pages/design-system.astro`.

## Checklist before merging a change

- [ ] No raw colors, font sizes or radii added; tokens used.
- [ ] Layout uses `Section` and `.grid-12`; columns line up when you press G.
- [ ] Looks right at 375, 768, 1024 and 1440 px, with no horizontal scroll.
- [ ] `npm run check` and `npm run build` pass.
- [ ] New component or token is visible on `/design-system/`.
