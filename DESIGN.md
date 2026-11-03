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

The page is set on white with near-black text; the accent is spent, not spread.

- **neutral (#ffffff), white:** the page ground, about 89% of the page.
- **surface (#ffffff), white:** panels, cards and inputs, about 89% of the page.
- **on-surface (#000000), near-black:** headlines and body text, about 11% of the page.
- **on-surface-muted (#000000), near-black:** secondary text: captions, labels, metadata, about 11% of the page.
- **primary (#000000), near-black:** the main action and highlights, used sparingly, about 11% of the page.
- **on-primary (#ffffff), white:** text and icons set on the primary colour.

Contrast, as set:

- Text on the ground: 21.0:1
- Secondary text on the ground: 21.0:1
- Text on surfaces: 21.0:1
- Labels on the primary colour: 21.0:1

## Typography

- **Display:** Inter (a sans-serif, free on Google Fonts), weights 700.
- **Body:** Inter (a sans-serif, free on Google Fonts), weights 400.

Headlines are set in capitals. The scale steps by a ratio of about 1.78.

- **headline-display:** 150px / 0.77, the largest headline, one per page, in capitals.
- **headline-lg:** 75px, headlines and section titles, in capitals.
- **headline-md:** 45px, headlines and section titles, in capitals.
- **headline-sm:** 30px, headlines and section titles, in capitals.
- **headline-xs:** 22px, headlines and section titles, in capitals.
- **headline-xxs:** 16px, headlines and section titles, in capitals.
- **body-md:** 15px / 1, running text.
- **label-md:** 15px, labels, tags and buttons, in capitals.

Load the fonts from Google Fonts: https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap
(This site self-hosts the same Inter family through `@fontsource-variable/inter`, so nothing is loaded from Google.)

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

- Maintain absolute monochrome black-on-white hierarchy with zero intermediate gray tones.
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
