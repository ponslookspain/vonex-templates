# Pinterest pins for a template

Makes 18 text-free pin images (1000x1500) from a template's live demo, and publishes them through PostVIA. The CSV upload stays as the fallback. For any agent (Claude Code, Codex, others); run everything from the repository root. Talk to Vladimir in Russian.

Everything generated goes to `.work/marketing/pinterest/<slug>/` (git-ignored, see [the project map](../README.md)). Only the scripts and `configs/<slug>.json` are in git.

| Command | What |
| --- | --- |
| `npm run capture -- <slug> <live url>` | Capture the desktop and phone pages |
| `npm run pins:render -- scripts/marketing/pinterest/configs/<slug>.json [filter]` | Render the 18 pins |
| `npm run pins:sheet -- <slug>` | Contact sheet to review them |
| `npm run pins:upload -- <slug>` | JPG copies to the public R2 bucket |
| `npm run pins:csv -- --start <date> --per-day 6 <config> [<config>]` | The Pinterest CSV |
| `npm run clean` | Remove captures and caches when done (`-- --all` removes `.work` entirely) |

Needs a Chromium browser for capture (Edge or Chrome, found automatically; set `BROWSER_PATH` otherwise) and `sharp` from the repo's `node_modules`. Upload needs `CLOUDFLARE_API_TOKEN` in the environment (the same account as the site deploy).

## Style rules (approved by Vladimir on 2026-11-03, do not change without asking)

- Size 1000x1500 (2:3). **No text at all**: no headlines, labels, logos or URLs added by us. Only the template's own design.
- 18 pins per template, every layout twice with different sections and backgrounds: `long` x4, `columns` x2, `monitor` x2, `combo` x2, `trio` x2, `phone` x2, `window` x2, `tilted` x2.
- 6 backgrounds per template from its own palette: one dark solid, one light paper solid, one mid-tone solid, one vertical gradient (brand colour to paper), one radial glow (dark brand), one blurred photo of a colourful part of the site (hero or a photo section).
- Every section and device sits on a soft shadow, cards have rounded corners (14-18px), phones have a black bezel and an island.
- Spread the content: hero, features, pricing, testimonials, the photo section and the footer should all appear somewhere. No empty or half-loaded areas.

## Steps

1. Live demo URL: `preview` in `src/content/templates/<slug>.yaml`.
2. Capture: `npm run capture -- <slug> <preview url>` → `.work/marketing/captures/<slug>/desktop.png` (1440 wide), `mobile.png` (780 wide = 390 @2x), `thumbs.png`; it prints the y where each section starts.
   Capture rules, learned the hard way (they are built into `capture.mjs`):
   - **Phones must show the real mobile layout.** A plain headless `--window-size=390` cannot be narrower than ~500px, so the page lays out wider and is cut on the right (a broken desktop layout squeezed into a phone). `capture.mjs` uses DevTools device emulation (390x844, scale 2, mobile, touch), so Framer switches to its phone breakpoint.
   - Shoot the page screen by screen while scrolled there: Framer appear-on-scroll blocks are blank otherwise.
   - Hide Framer's edit button and badge, fixed elements and the full-width sticky header after the first screen. Do not hide tall or narrow sticky blocks: they are content.
   - Before rendering, look at the first screen and one section of the mobile capture: it must be a phone layout, nothing cut on the right.
3. Read `thumbs.png` (desktop thumb x9, mobile thumb x13 = page y) for empty stretches or half-loaded blocks. If a desktop part did not render, list the parts to keep in `deskKeep`; if the mobile page goes blank near the end, set `mobileEnd` above it. To pick mobile tops, make a wider strip of the mobile page (4 columns at 1/6 scale) and read y from it.
4. `npm run draft -- <slug>` writes a first `scripts/marketing/pinterest/configs/<slug>.json` from the section bounds in `.work/marketing/captures/<slug>/sections.json` (colours sampled from the page, the 18 pins placed on its sections, the `pinterest` texts from the template YAML). Render it, look at the contact sheet and fix what is wrong. To write it by hand instead, copy `alpine-app.json` (dark site) or `harrier.json` (light site with a brand colour):
   - `backgrounds`: colours from the template; `photo` is a region of the desktop page;
   - `sections`: `[top, height]` of 8-10 good desktop sections for `tilted`;
   - `pins`: `[layout, background, a, b]` with `long` a = desktop top; `columns` a = [top left, top right]; `monitor` a = desktop top (shows 1440x900); `combo` and `window` a = desktop top, b = mobile top; `trio` a = three mobile tops; `phone` a = mobile top; `tilted` no args. Tops past the end are clamped, so the end of the page is safe to aim at;
   - `pinterest` block for the CSV: `name`, `kind`, `pageTitle`, `topicBoard`, `generalBoard`, `pitch`, `keywords`. Plain ASCII English only.
5. Render: `npm run pins:render -- scripts/marketing/pinterest/configs/<slug>.json [filter]` → `.work/marketing/pinterest/<slug>/pins/<slug>-NN-<layout>-<bg>.png`. A filter (for example `monitor`) renders only matching files.
6. Review: `npm run pins:sheet -- <slug>`, look at `.work/marketing/pinterest/<slug>/contact.png`. Fix crops that cut a section in half, show blank areas or repeat another pin, re-render only those with the filter. Show Vladimir the sheet.

## After Vladimir approves the pins: PostVIA

Pins go out through the PostVIA MCP, account `ponslookdesign` (`4d37dc23-8a4a-4bb3-a08b-14b2f40b027f`). One pin is one post with one image, so a template uses 18 publications. Scheduling needs Vladimir's approval of the exact pins, like every post.

18 is the standard set: 8 layouts with variations. PostVIA sets no pin limit of its own beyond the plan's publications. More pins would repeat a layout, so make more only if Vladimir asks.

1. Take title, description, board and link from the same text the CSV script writes (`npm run pins:csv`): the rules below for titles, UTM links and 6 pins a day, 09:00 to 19:00, still apply.
2. Per pin: `create_draft` for the Pinterest account, `create_media_upload`, PUT the PNG, `complete_media_upload` with the post id.
3. **Before scheduling, the pin must carry its link, title and board.** A pin without our link brings no visitors. Check them with `get_post`. Tested on 2026-11-05: a 1000x1500 PNG reaches READY with text only, and the MCP tools seen that day had no field for link, title or board. If they still have none, stop and tell Vladimir; do not schedule.
4. `check_post` must say READY, then `schedule_post`. Afterwards `list_posts` must show no DRAFT, FAILED or PARTIAL.
5. Look at the first published pin on Pinterest: image, title, board and link. Only then let the rest go on.

## Fallback: CSV for Pinterest

Use this only if PostVIA cannot carry the pin's link, title or board, and Vladimir agrees. He uploads the CSV himself (Pinterest, Settings, Import content, "Upload CSV or TXT").

1. **Images to R2**: `npm run pins:upload -- <slug>`. It makes JPGs (quality 88, about 100 KB) and puts them into the public Cloudflare R2 bucket `vonex-pins`, served at `https://pins.vonexdesign.com/<file>.jpg`. Pinterest needs a public URL for every image. The images are not part of the site: no branch, no deploy. (The custom domain was connected to the bucket once, in the Cloudflare dashboard; connecting a domain changes DNS, which agents are not allowed to do.)
2. **CSV**: `npm run pins:csv -- --start <tomorrow> --per-day 6 scripts/marketing/pinterest/configs/<slug>.json [<other slug config>]` → `.work/marketing/pinterest/pinterest-bulk.csv`.
   - Columns: Title (max 100), Media URL, Pinterest board, Description (max 500), Link, Publish date, Keywords. One board per row.
   - 6 pins a day (Vladimir's choice), 09:00 to 19:00, templates interleaved, similar layouts kept apart. The time has no time zone, Pinterest uses the account's.
   - The link is the **template page on vonexdesign.com** (`/templates/<slug>/`) with UTM tags (`utm_source=pinterest`), never the Framer URL: the site page holds the Framer button with the referral link, keeps the visitor on our site and shows in Cloudflare analytics.
3. **Check**: the script stops on too long text, non-ASCII text and **duplicate titles** (Pinterest rejects every row whose title repeats an earlier one, which is why the long-page layout has 4 title variants). Check that every Media URL opens (`npx wrangler r2 object get vonex-pins/<file> --remote`) and the template pages exist.
4. **If Pinterest reports errors**, Vladimir downloads the report (the same CSV with an `error` column). Read it, fix the cause and re-make only the failed rows with `--only <file-name parts>` → `.work/marketing/pinterest/pinterest-bulk-fix.csv`, so accepted pins are not uploaded twice.
5. **Tell Vladimir, in Russian, what is left for him**: create the boards named in the CSV with exactly those names (defaults: "Framer Templates" plus one topic board per template); open the first image URL to be sure it loads; upload the CSV; if the first publish date is already past, re-run with a new `--start`.
6. **When the pins are live in Pinterest**, run `npm run clean` to drop the captures and caches (add `-- --all` to also remove the pins and CSV files). Keep the R2 bucket: it is free at this size and used for every template.
