# Social visuals for a template

Makes the base visual set for Instagram, Threads, X and TikTok from a template's live demo. For any agent; run everything from the repository root and talk to Vladimir in Russian. Vladimir starts this with "делаем визуал для соцсетей" and a template.

This look was approved by Vladimir on 2026-11-05. It is the base for every template: do not change the packs, layouts or rules without asking.

Everything generated goes to `.work/marketing/social/<slug>/` (git-ignored). Only the scripts and `configs/<slug>.json` are in git.

| Command | What |
| --- | --- |
| `npm run capture -- <slug> <live url>` | Capture the desktop and phone pages into `.work/marketing/captures/<slug>/` |
| `npm run social:motion -- <slug>` | The template's three looping videos and their 4:5 slides |
| `npm run social:static -- <slug>` | Six posts, three carousels, `carousels.png`, `feed-preview.png` |

Without a slug both commands render empty frames into `.work/marketing/social/empty/`, for trying a layout. Run `social:motion` before `social:static`: the feed preview uses the video covers. Needs Edge or Chrome (`BROWSER_PATH` to override), `ffmpeg` and `sharp`.

## The whole flow

1. **Template is ready.** It is live on the site with a `preview` URL. Vladimir says "делаем визуал для соцсетей".
2. **Capture.** `npm run capture` saves the desktop and phone pages.
3. **Config.** `npm run draft -- <slug>` drafts `configs/<slug>.json` from the section bounds that `capture` saved (8 desktop and 4 phone sections), plus the Pinterest config and a caption draft. `social:ruler` shows the page with a scale: check the draft against it, add `"cover"` where needed and fix what looks wrong.
4. **Render.** `social:motion`, then `social:static`. The first render picks the template's 3 animations and 3 carousels and writes them to the config. The ground is measured, blocks are fitted to frames, and the X version of each carousel is made.
5. **Check.** Read every `check` line, then go through the quality check by eye. Fix the config and render again.
6. **Approval.** Show Vladimir the feed preview and the videos. Change nothing in the look without asking.
7. **Captions.** Write `captions.md`; links go to our site with UTM tags.
8. **Pinterest.** A separate set of 18 pins and its own procedure: [pinterest.md](pinterest.md). It is part of every template's flow; pins go out through PostVIA after Vladimir approves them.
9. **Calendar.** Only when Vladimir asks: add the set to `calendar.json`, one template's whole set after another, four slots a day.
10. **Scheduling.** Only with Vladimir's approval of the exact posts: PostVIA, see "Scheduling" below. Each network gets its own version.
11. **After the first publications.** Check the open points under "Known gaps" before scheduling the next template.

The same flow with its details is under "Steps". Changes to scripts follow the workflow in AGENTS.md: local, then "коммит, пуш", then "в продакшн".

## Visual rules

- **Minimal.** One idea per frame, plenty of air, only the template's own screens. No badges, stickers, gradients of our own or decorative shapes.
- **Clean feed.** No text on covers, first frames or inner slides. Words appear only inside a video after its first frame, and on the last carousel slide ("Free on *Framer*").
- **Ground never melts into the site.** The ground is measured, not chosen: `site.mjs` samples the edge colour of every section and takes the first of ink `#101014`, paper `#f2f1ee` and stone `#8e8d88` that stays clear of all of them (colour distance 30 or more). A site with both black and white sections lands on stone. `ground` in the config overrides this; use it only if Vladimir asks.
- **Type.** Archivo with one word in Instrument Serif italic, as on the site.
- **Motion.** Every video loops seamlessly in 8 seconds and moves with inertia: slow start, fast middle, soft landing with a small overshoot, then a rest pose. Motion uses all three axes, never a plain linear scroll.
- **Variety.** Neighbouring posts never share a look: alternate the packs, posts and carousels as in `feed-preview.png`.
- **Posting order.** Post one template's whole set, then the next template's set. Four posts a day. Inside a set alternate videos, posts and carousels, and never put the same format next to itself, also where two sets meet.

## The set

| Part | Files | Where it goes |
| --- | --- | --- |
| Three animations from the pool below | `motion/pack-<n>/` | Reels, TikTok, Threads, X |
| Posts: `flat`, `stacked`, `row`, `phone`, `tablet`, `wall` | `static/posts/` | Instagram, Threads, X |
| Three carousels from the pool below | `static/c<n>/` | Instagram, Threads, TikTok photo mode |
| The same carousels for X, four images | `static/c<n>/x/` | X |

The pool below is approved by Vladimir: seven animations and five carousels. Numbers are kept as they are, so saved configs stay valid. Each template gets three animations and three carousels, picked once by `site.mjs` and written to `packs` and `carousels` in its config, so a new render gives the same set. The picker takes three animations from different families, always one with a scroll, and none the previous template used. Carousels avoid the previous template too; with five in the pool, one may repeat. To swap a part, edit the config.

| Pack | Family | Motion |
| --- | --- | --- |
| 1 Barrel | screens | four screens turn on the X axis, title and "Free on Framer" fixed |
| 2 Devices | devices | tablet and phone at different depths swing in 3D |
| 3 Wall | field | tilted field of screens to the edges, rows slide against each other |
| 4 Browser scroll | scroll | one browser window, the page moves in stops |
| 5 Phone scroll | scroll | one large phone, the mobile page moves in stops |
| 6 Deck | screens | the top screen flies past the camera, the stack moves up |
| 9 Orbit | devices | a ring of screens turns around a phone |

Placing a site in a frame: `site.mjs` measures each desktop block, trims its empty margins and notes the empty rows. A frame cut to its block shows it whole. A fixed frame takes the blocks closest to its shape; a block that is still too tall is cut on an empty row or shown a little smaller, never through text. A render prints a `check` line for a frame that loses over 5% of its block or is over 15% empty: look at those before posting.

Carousels: c1 a screen per slide with a phone on each seam; c2 tilted wall; c3 long columns crossing the seams; c4 whole sections stacked, so every slide has about the same weight; c6 phones at two heights crossing the seams.

Sizes: video 1080x1920, slides and posts 1080x1350, with the important part inside the central 4:5 area of a video. X gets the files from `static/c<n>/x/`.

## One visual, a version for each network

The visual is made for every network, in that network's own format. Where a network is unusual, it gets its own version made for it, not a crop of the standard one:

- **X:** at most 4 images, shown as a grid. Each carousel gets its own render in `static/c<n>/x/`: slides 1, 2, 3 and the closing one, without anything lying across a seam. Post those files to X, not the standard slides.
- **Pinterest:** 2:3 (1000x1500), no text, its own approved style and procedure in [pinterest.md](pinterest.md). Pins are not made from this set: videos, posts, carousels and the "Free on Framer" slide do not work as single pins.
- Any other network with its own limits (YouTube, TikTok) is handled the same way: make the version it needs.

With one column or one phone left per slide, the X version of c3 and c6 is sparser than the standard one: look at it before posting.

Pinterest pins go out through the PostVIA MCP, one pin per post, as described in pinterest.md.

## Quality check

Rendering fails if the config has the wrong number of sections, overlapping sections, or a section outside the page. A render also prints `check` lines (see "Placing a site in a frame" above); a wall can show a few mild ones, so judge them by the picture. Everything else is checked by eye on `carousels.png`, `feed-preview.png`, the `x/` slides and frames of each video, every time, before showing anything. Fix the config and render again if any of these appears:

- **Repeated block.** Framer sticky sections can be captured twice, one under the other. Never use a stretch of the capture where a block repeats; take only the first clean copy, or skip that section.
- **Next section in the frame.** A frame shows one section only, never the start of the next one.
- **Same screen side by side.** Two neighbouring frames, including diagonal ones and rows at their rest poses, never show the same section. Frames take blocks by shape, so the 8 sections must really look different and differ in height.
- **Flat band.** A photo or gradient section with a plain strip above or below it needs `cover`.
- **Cut headline.** No headline or face cut by the frame edge. Use another section if `cover` cuts it.
- **Empty or half-loaded area.** No blank frames, missing images or unrendered blocks.
- **Weak first frame.** Fitting by shape can put a lesser block first. A cover or first slide must show the template at its best; if it does not, change the sections in the config.
- **Photo subject lost.** A `cover` block is zoomed from its left edge, so a subject on the right can be cut. Use another section.
- **Video jump.** The last frame must flow into the first one, with no snap back in a row or device.

## Steps

1. Live demo URL: `preview` in `src/content/templates/<slug>.yaml`.
2. Capture it, unless `.work/marketing/captures/<slug>/` already exists.
3. Run `npm run social:ruler -- <slug>` and read `ruler-desktop.png` and `ruler-mobile.png` in the capture folder: they show the page with a y scale. Write `scripts/marketing/social/configs/<slug>.json`:
   - `titleHtml`: the name, with one word in `<em>`;
   - `screens`: exactly 8 desktop sections as `[top, height]`, each from the first to the last pixel of one section;
   - `phones`: exactly 4 mobile sections as `[top, height]`, about 1700 tall, in the phone layout;
   - add `"cover"` as a third value to a full-bleed photo or gradient section: it then fills the frame from its left edge. Use it only when the section is close to 16:10 and its headline is on the left.
4. Render with `social:motion`, then `social:static`. Read the `check` lines they print.
5. Run the quality check above. Show Vladimir the feed preview and the videos only after it passes.
6. Write `.work/marketing/social/<slug>/captions.md`, plain English:
   - video: "<Name> 01", "Remix. Edit. Publish.", one line on who it is for;
   - carousel: one line hook, one line on what is inside, "Free on Framer.";
   - Instagram and TikTok end with "Link in bio." and 5 hashtags; Threads and X end with the link.
   - Links go to our site with UTM tags (`/templates/<slug>/?utm_source=threads&utm_medium=social`, bio: `/templates/?utm_source=instagram&utm_medium=bio`), never to `framer.link`.

Videos carry a silent track: music is chosen in the apps when posting. Do not post or schedule anything without Vladimir.

## Scheduling (PostVIA)

Only when Vladimir asks. The calendar lives in `.work/marketing/social/calendar.json`: one entry per slot (`day`, `utc`, `template`, `format`, `type`, `media`, `texts` for instagram, tiktok, threads, x). Four slots a day at 08:00, 12:00, 16:00 and 20:00 UTC, in the posting order above. Per slot:

- **Image or video:** one post to Instagram, TikTok, Threads and X.
- **Carousel (5 slides):** X takes 4 images at most (PostVIA says TOO_MANY_MEDIA_ITEMS). So the main post goes to Instagram, TikTok and Threads, and a separate X post at the same time carries the four files from `static/c<n>/x/`.
- **Video:** one more post to YouTube with the Threads text and `utm_source=youtube`. The calendar has no YouTube text, so write it from the Threads one.
- **TikTok:** visibility Public, comments allowed, caption from the calendar. Without a visibility TikTok blocks the post (PRIVACY_REQUIRED).
- **Media:** one file cannot be attached to two posts, so upload it again for each post (`create_media_upload`, PUT to the URL within 10 minutes, `complete_media_upload`). Attach carousel slides in order.
- **Check:** `check_post` must say READY, then `schedule_post`. Afterwards `list_posts` must show no DRAFT, FAILED or PARTIAL, and `get_usage` should match the count (one publication per account per post).

Sets rendered before the pool keep packs 1 to 3 and carousels c1 to c3 in their configs. Their scheduled posts keep the old ground and the old X slides until they are rendered and uploaded again.

Known gaps: on 2026-11-05 Vladimir updated the MCP, but the tools seen that day still had no `platformConfigurations` field for per-platform captions and TikTok settings. Check `create_draft` and `update_draft` in a new session: if the field is there, work only through the MCP; if not, use the web composer and tell Vladimir. Not yet seen in practice: how YouTube builds a title from the text, whether Instagram publishes videos as Reels, and whether TikTok accepts image carousels. Check the first published posts for these before scheduling the next template.
