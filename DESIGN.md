---
name: Vonex Design
description: A near-black catalog that lets the Framer templates lead, with one blue accent and almost no decoration.
colors:
  void: "#000000"
  graphite: "#111113"
  graphite-raised: "#121214"
  hairline: "#222226"
  paper: "#f4f4f5"
  paper-soft: "rgba(244, 244, 245, 0.8)"
  ash: "#9a9aa3"
  signal-blue: "#0099ff"
  indigo-light: "#6366f1"
  sky-light: "#38bdf8"
  chrome: "#f2f4fa"
  go-green: "#34d399"
typography:
  display:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3rem, 2rem + 4vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.8rem + 1.5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.55
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.35
rounded:
  control: "8px"
  surface: "12px"
  panel: "16px"
  media: "24px"
spacing:
  page: "20px"
  gutter: "20px"
  card: "24px"
  section: "56px"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.void}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-ghost:
    backgroundColor: "{colors.void}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  template-card:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.paper}"
    rounded: "{rounded.panel}"
    padding: "12px"
  tag:
    backgroundColor: "{colors.void}"
    textColor: "{colors.paper-soft}"
    rounded: "9999px"
    padding: "4px 12px"
---

# Design System: Vonex Design

## Overview

**Creative North Star: "The Quiet Gallery"**

The site is a dark room with the templates hung on the wall. The shell stays out of the way: black ground, one typeface, one blue accent, hairlines instead of boxes. Every template is a piece of work with its own typography and palette, so the storefront must never compete with it.

The system is flat and typographic. Weight and size carry hierarchy; color is rationed. Pages are short sequences of one idea each, centered headings over a 12-column grid, generous vertical air (56px on phones, 80px from 640px). The template detail page is the one deliberately editorial surface: large type, numbered sections, hairline rules.

Decoration was removed on purpose (drifting glows, dot grids, footer gradient, status dots). Anything added back must earn its place by showing real work.

**Key Characteristics:**
- Pure black ground with near-white text; the accent appears only on interaction and focus.
- Inter Variable for everything, tight negative tracking on headings.
- Flat surfaces, hairline outlines, no soft shadows.
- Real template imagery is the only ornament.
- One call to action wording: "Browse templates".

## Colors

A black-and-white palette with a single electric blue. Neutrals do almost all the work.

### Primary
- **Signal Blue** (#0099ff): Focus ring, text selection tint, links and the accent tint behind icons. Never a button fill.

### Secondary
- **Indigo Light** (#6366f1) and **Sky Light** (#38bdf8): used only inside small illustration gradients. Not for text or UI.

### Tertiary
- **Go Green** (#34d399): positive labels only (the `success` badge). Never decorative.

### Neutral
- **Void** (#000000): page background.
- **Graphite** (#111113): cards and panels. **Graphite Raised** (#121214) is its hover state.
- **Hairline** (#222226): borders and dividers.
- **Paper** (#f4f4f5): primary text and the primary button fill. **Paper Soft** (80% Paper) for readable secondary text such as nav and labels.
- **Ash** (#9a9aa3): descriptions and captions; about 6.5:1 on Graphite.
- **Chrome** (#f2f4fa): base metal of the 3D logo only.

### Named Rules
**The One Voice Rule.** Signal Blue appears on interaction and focus, not as a fill. If a screen needs a color to feel alive, the templates' own images are the color.

**The Grey-Free Rule.** Secondary text is Paper at reduced opacity or Ash, nothing between.

## Typography

**Display Font:** Inter Variable (with ui-sans-serif, system-ui)
**Body Font:** Inter Variable (same)
**Label/Mono Font:** none; the system has no monospace voice.

**Character:** One neutral grotesque used at confident sizes. Personality comes from scale and tight tracking (-0.04em on headings), not from a second face.

### Hierarchy
- **Display** (700, 3rem to 4.5rem, 1.02): home hero headline only.
- **Headline** (700, 2.25rem to 3rem, 1.1): section titles and page titles (H1 uses 3rem to 3.75rem).
- **Title** (600, 1.125rem, 1.55): template names on cards.
- **Body** (400, 1rem, 1.5): running text; measure capped at 28rem to 40rem depending on role.
- **Label** (500, 0.75rem): tags and badges.

### Named Rules
**The Role Rule.** Text size always comes from a `type-*` role, never from raw Tailwind sizes.

## Layout

A 72rem container with a 12-column grid and 20px gutters. Sections are stacked with consistent vertical padding from `--space-section`; two sections can touch with `flush`. Headings sit on the middle 8 columns; card grids are 3-up on desktop, 2-up from 640px, 1-up on phones.

The template detail page is a two-column layout from 1024px: a sticky gallery on the left (6 columns) and the editorial text on the right (5 columns, offset by one empty column). On phones the order is name, price and Framer buttons first, then the gallery, then the text, so the main action is on the first screen.

## Elevation & Depth

Flat by default. Depth comes from tonal layering (Void, Graphite, Graphite Raised) and 1px inset outlines (`rgb(255 255 255 / 0.06)` at rest, `0.14` on hover or selection). There are no drop shadows.

### Named Rules
**The Flat-By-Default Rule.** Surfaces never lift. State is shown with a tone or hairline change, not a shadow.

## Shapes

Rounded, calm corners by role: 8px for controls, 12px for cards inside sections, 16px for large panels such as template cards and the closing call to action, 24px for big previews. Tags are full pills. Imagery is clipped to its container's radius with a small inner padding on cards, so the image looks framed, not pasted.

## Components

### Buttons
- **Shape:** gently rounded (8px); 10px by 16px padding; 14px medium text.
- **Primary:** Paper fill with Void text. Hover softens the fill to 80% white.
- **Ghost:** transparent, 1px Hairline border, Paper text. Hover brightens the border and raises the fill to Graphite Raised.
- **Compact:** smaller on phones, regular from 640px; used in the header only.

### Cards / Containers
- **Template card:** Graphite panel, 16px radius, 12px inner padding, 4:3 image at 12px radius, then name (Title), tagline (Ash) and a line "Category · Price". Hover raises the panel tone and scales the image to 1.03.
- **Feature card:** Graphite surface with an illustration stage on Void.
- **Border:** hairline via inset outline only.

### Chips
- **Tag:** pill with a 1px inset outline in Paper Soft text; the accent variant tints the outline with Signal Blue.

### Inputs / Fields
There are no form fields. The site has no search or filter by decision; the catalog is small and static.

### Navigation
- Fixed header over a fade from Void. Logo left; nav, social icons and one compact "Browse templates" button right (hidden on the catalog itself). Links are Paper Soft and brighten on hover; the active page is Paper. Below 768px the nav collapses to a menu button that closes on Escape.

### Template detail (signature)
Name at 3.25rem to 5.25rem, tagline, price and two buttons (Open on Framer, Live preview), four small stat cards, then numbered hairline sections, a FAQ and a closing "Get [name]" block with the same buttons.

## Do's and Don'ts

### Do:
- **Do** let template imagery carry color and character; keep the shell black and white.
- **Do** use `Browse templates` for every link to the catalog.
- **Do** keep the main action ("Open on Framer") on the first phone screen of every template page.
- **Do** build with tokens from `global.css`; add a token before adding a raw value.
- **Do** keep a visible 2px Signal Blue focus ring with 3px offset on every interactive element.

### Don't:
- **Don't** add glows, blurred blobs, dot grids or gradient washes as decoration.
- **Don't** put a blue label (eyebrow) above section headings.
- **Don't** use shadows for elevation.
- **Don't** use Signal Blue as a button fill or for body text.
- **Don't** add a second typeface without a specific reason tied to the work shown.
