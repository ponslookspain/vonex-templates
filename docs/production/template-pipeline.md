# Template pipeline

The full path of a new template, from choosing a niche to posting it on social media. Every stage ends with a check: do not start the next stage until the current one passes. Details stay in the documents linked from each stage.

| # | Stage | Done when | Who decides |
| --- | --- | --- | --- |
| 1 | Niche | One-page brief is written | Vladimir picks the niche |
| 2 | Framer template | Framer checklist passes, design is frozen | Vladimir freezes the design |
| 3 | Marketplace | Demo is published, template is submitted | Vladimir submits |
| 4 | Code version | Fidelity and device checks pass, zip is packed | Agent reports, Vladimir accepts |
| 5 | Contra | Product is live, `codeUrl` is known | Vladimir uploads |
| 6 | Site | Template page is live with all its buttons | Vladimir says "в продакшн" |
| 7 | Promotion | Pins are scheduled, X and Threads posts are out | Vladimir approves |

Stage 4 runs while the Marketplace reviews the template. Stages 5, 6 and 7 stay in this order: the site launches once with the code button, and pins link to a page that already exists. If the review asks for changes, make them in Framer and in code, and repeat the checks of stage 4 before uploading the zip. A paid template skips stages 4 and 5 at first (see "Template offers" in [AGENTS.md](../../AGENTS.md)).

## 1. Niche

- Study competing templates on the Framer Marketplace: what exists, how it looks, what it costs.
- Check demand through treg when it helps: search volume and difficulty of the main queries. Tell Vladimir the price of any call above one cent.
- The brief holds the niche, the audience, the main queries, and how this template differs.

## 2. Framer template

Framer comes first, because design is found faster visually and code then has one fixed source. Build it so that both customers and the code port have an easy time:

- [ ] Every section is a component, with clear names (`Sections/Hero/Phone-Rise`).
- [ ] Colors and text use Framer styles only, no one-off values.
- [ ] Repeating content uses CMS where it fits.
- [ ] Desktop, Tablet and Phone are all designed.
- [ ] Customers get instructions for changing content, colors and fonts.
- [ ] Effects can be rebuilt with CSS and IntersectionObserver.
- [ ] Every font and image may be redistributed in the code zip (see "Redistribution rights" in [docs/production/code-versions.md](code-versions.md)).

### Generated visuals

Local ComfyUI may be used to generate images when a template needs them (photos, textures, product shots, backgrounds). It is optional: use it when it gives a better result than licensed stock.

- Check the license of the model and of any LoRA: it must allow commercial use of the output.
- Do not imitate real brands, real people or another author's work.
- Keep the final files and use the same files in Framer and in code.
- Scratch output goes to `.work/production/visuals/<slug>/tmp/`. Save the workflow, model name and seed of every final image in `.work/production/visuals/<slug>/sources/`, which `npm run clean` keeps, so an image can be remade and its source shown.

## 3. Marketplace

Publish the demo, submit the template, and note the demo URL: it becomes `preview` in the template's YAML at stage 6. Write the referral link (`framer.link/...`) down at the same time and open it once: it must lead to the template's remix page with `via` and `dub_id` in the address, not to the Framer home page.

Every template gets exactly 4 Marketplace preview images:

1. Images 1 to 3: a polished view of one part of the site each, showing a strong section or screen.
2. Image 4: all pages of the site together, set at an angle.

Do not use plain screenshots.

## 4. Code version

Follow [docs/production/code-versions.md](code-versions.md). The Framer site is the reference. Build first, then check the built site with `npm run preview`, not the dev server.

### Design match with Framer

- [ ] `vonex-code/scripts/fidelity/compare.py`: every page at phone, tablet and desktop, height within 2 px.
- [ ] Same script: line breaks of every text match. Explain every difference.
- [ ] Colors, fonts, borders, corners and shadows: compare computed styles and screenshots, section by section. The script does not cover these.
- [ ] Motion: load entrance, scroll reveals, loops, accordions and hover states match in timing. `prefers-reduced-motion` works.
- [ ] Every link, menu, form and interactive block works on every page.

### Virtual devices

- [ ] `vonex-code/scripts/fidelity/devices.py` passes on every page: emulated iPhone, iPad, Android and a 340px phone, in WebKit (the Safari engine) and Chromium. It covers the overflow, covered elements, field size and tap checks below, and also console and request errors. Check the list of tap checks it prints; sliders are checked by hand.
- [ ] No horizontal overflow from 340px up, and nothing covered by something else.
- [ ] Menu, FAQ, tabs and sliders work by touch.
- [ ] Form fields are 16px on touch screens.

These are emulators, so say so in the report. They do not replace a real phone.

### Package

- [ ] The README lists what was checked and the known differences.
- [ ] `npm run pack <slug>` writes the zip. Unpack it into an empty folder, install and build it there.
- [ ] Public text says "closely matches", never "identical" or "pixel-perfect".

## 5. Contra

Follow "Contra setup" in [docs/production/code-versions.md](code-versions.md). Upload the zip only after the Marketplace has approved the template, or re-pack it if the review changed anything. The Contra price must equal `codePrice`.

## 6. Site

Follow "Adding or changing a template" and "Workflow" in [AGENTS.md](../../AGENTS.md). After the merge, open the page on vonexdesign.com and click every button.

## 7. Promotion

- Pinterest: [docs/marketing/pinterest.md](../marketing/pinterest.md).
- UI8 and Craftwork: [../marketing/marketplaces.md](../marketing/marketplaces.md).
- Instagram, Threads, X, TikTok and YouTube: [../marketing/social.md](../marketing/social.md). Publish only after Vladimir approves the exact text. Link to the template page on this site, with UTM tags.
- When everything is live, run `npm run clean`.
