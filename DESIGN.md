---
version: "alpha"
name: "Alpine"
description: "Extreme minimalism meets technical precision. High-contrast — a design direction from MUUDS, https://www.muuds.design/systems/monochrome-alpine-249e3d"
colors:
  neutral: "#ffffff"
  surface: "#ffffff"
  on-surface: "#000000"
  on-surface-muted: "#000000"
  primary: "#000000"
  on-primary: "#ffffff"
typography:
  headline-display:
    fontFamily: "Inter"
    fontSize: "150px"
    fontWeight: 700
    lineHeight: 0.77
    letterSpacing: "-0.07em"
  headline-lg:
    fontFamily: "Inter"
    fontSize: "75px"
    fontWeight: 700
    letterSpacing: "-0.07em"
  headline-md:
    fontFamily: "Inter"
    fontSize: "45px"
    fontWeight: 700
    letterSpacing: "-0.07em"
  headline-sm:
    fontFamily: "Inter"
    fontSize: "30px"
    fontWeight: 700
    letterSpacing: "-0.07em"
  headline-xs:
    fontFamily: "Inter"
    fontSize: "22px"
    fontWeight: 700
    letterSpacing: "-0.07em"
  headline-xxs:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 700
    letterSpacing: "-0.07em"
  body-md:
    fontFamily: "Inter"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.05em"
  label-md:
    fontFamily: "Inter"
    fontSize: "15px"
    fontWeight: 400
    letterSpacing: "0.08em"
rounded:
  none: "0px"
spacing:
  base: "8px"
  xs: "6px"
  sm: "11px"
  md: "15px"
  lg: "20px"
  xl: "57px"
  2xl: "113px"
  gutter: "24px"
  columns: 4
  section: "113px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: "11px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.none}"
    padding: "20px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
---

# Alpine

This file is the design direction. How its values are wired into the code (tokens, classes, components) is in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). Change this file first, then the tokens.

## Overview

Extreme minimalism meets technical precision. High-contrast monochrome typography is framed against expansive high-key terrain and razor-sharp athletic silhouettes.

A design direction for extreme minimalism meets technical precision, high-contrast, in a luxurious and clinical mood. The voice is confident, understated, precise.

Headlines in this voice:

- "ENGINEERED FOR PEAK."
- "ZERO TOLERANCE. PURE PERFORMANCE."
- "FORM. FUNCTION. FORCE."

## Colors

The page is set on warm off-white paper with soft near-black ink; the accent is spent, not spread. Quieter text is the same ink at lower opacity, and lines are solid tints of that ink on paper, never a separate gray.

- **neutral (#f2f1ee), paper:** the page ground, about 89% of the page.
- **surface (#f2f1ee), paper:** panels, cards and inputs, set apart by lines.
- **on-surface (#101014), ink:** headlines and body text.
- **on-surface-muted (ink at 62%):** secondary text: captions, labels, section bars.
- **primary (#101014), ink:** the main action, black bands and filled cells, used sparingly.
- **on-primary (#f2f1ee), paper:** text and icons set on the primary colour.
- **line (ink at 16%):** hairlines: page rails, section lines, cell borders.
- **line-strong (ink at 40%):** reserved; buttons, tags and the heavy picture frame use full ink.

Contrast, as set:

- Text on the ground: 21.0:1
- Secondary text on the ground: 21.0:1
- Text on surfaces: 21.0:1
- Labels on the primary colour: 21.0:1

## Typography

- **Display:** Archivo, set wide (width 118%), weight 620, sentence case.
- **Accent:** Instrument Serif italic, one word in each section headline.
- **Body:** Inter, weight 400.
- **Labels, buttons, nav, section bars:** Geist Mono, 12px, weight 500–600, capitals, tracked wide.

Headlines are set in capitals. The scale steps by a ratio of about 1.78.

- **headline-display:** 150px / 0.77, the largest headline, one per page, in capitals.
- **headline-lg:** 75px, headlines and section titles, in capitals.
- **headline-md:** 45px, headlines and section titles, in capitals.
- **headline-sm:** 30px, headlines and section titles, in capitals.
- **headline-xs:** 22px, headlines and section titles, in capitals.
- **headline-xxs:** 16px, headlines and section titles, in capitals.
- **body-md:** 15px / 1, running text.
- **label-md:** 15px, labels, tags and buttons, in capitals.

All four are free (Google Fonts) and self-hosted through Fontsource: `@fontsource-variable/archivo` (width axis), `@fontsource/instrument-serif`, `@fontsource-variable/inter`, `@fontsource-variable/geist-mono`. Nothing is loaded from Google. The `fontFamily` lines in the front matter above predate this change; the tokens in `src/styles/global.css` are the source of truth.

## Layout

A 4-column grid with 24px gutters, fluid.

Spacing is built on 8px: 6px, 11px, 15px, 20px, 57px, 113px. Sections are separated by about 113px.

## Elevation & Depth

Depth comes from lines and tone rather than shadow: borders are 1px hairline, and panels are set apart by the surface colour.

## Shapes

Corners: square corners.

## Components

- **Buttons:** the primary button is the primary colour with white labels in the label style; the secondary sits on the surface with text-coloured labels. Button verbs: EXPLORE, ORDER, VIEW.
- **Cards:** the surface colour with the body text colour and generous padding.
- **Inputs:** the body style, on the surface, with the secondary text colour for placeholders.
- **Icons:** Lucide (ISC, https://lucide.dev), regular. Even 2px strokes on a 24px grid, round caps and joins, geometric and neutral.

## Do's and Don'ts

- Keep one ink on paper: hierarchy comes from size, case, opacity of the same ink and inversion, never from a new hue.
- Keep body copy strictly in narrow, vertical column pillars under thirty characters per line.
- Anchor full-bleed visual frames with oversized, tightly tracked display type.
- Use multi-screen whitespace gaps between technical product disclosures.
- Do keep body text at 4.5:1 against what it sits on, and large text at 3:1.
- Do use only the fonts and colours above; do not introduce new ones.

## Imagery

High-key outdoor action photography shot under bright, cool daylight against textured white terrain. High-contrast colour palette featuring vibrant warm accents against cyan-tinted neutrals and snowy expanses, with a distinct vintage analog film grain.

- **Medium:** photography
- **Light:** bright direct daylight with cool reflective bounce and crisp, hard shadows
- **Grading:** cool blue and cyan casts in shadows, high-key bright whites, punchy saturated orange and warm highlights with deep contrasty blacks
- **Composition:** figures positioned centrally or dynamically within expansive white negative space
- **Depth of field:** deep, maintaining texture across the entire foreground and surrounding field
- **Texture:** visible vintage 35mm film grain, analog print quality with slight sharpness edge degradation
- **Background:** vast, continuous textured white terrain filling the frame edge-to-edge
- **Distance:** mid to wide framing surrounded by ample open space

On this site the pictures are the template covers: they are the only colour on the page.

## Motion

Deliberate. Easing: ease-out. Stark fullscreen video reel overlay with dynamic type.

---

Made with MUUDS — https://www.muuds.design/systems/monochrome-alpine-249e3d
