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

Carousels: c1 a screen per slide with a phone on each seam; c2 tilted wall; c3 long columns crossing the seams; c4 whole sections stacked, so every slide has about the same weight; c6 phones at two heights crossing the seams.

Sizes: video 1080x1920, slides and posts 1080x1350, with the important part inside the central 4:5 area of a video. X takes at most 4 images, so post 4 slides or a video there.

## One visual, a version for each network

The visual is made for every network, in that network's own format. Where a network is unusual, it gets its own version made for it, not a crop of the standard one:

- **X:** at most 4 images, so a carousel goes there as its own 4-slide version (slides 1, 2, 3 and 5).
- **Pinterest:** 2:3 (1000x1500), no text, its own approved style and procedure in [pinterest.md](pinterest.md). Pins are not made from this set: videos, posts, carousels and the "Free on Framer" slide do not work as single pins.
- Any other network with its own limits (YouTube, TikTok) is handled the same way: make the version it needs.

Pinterest pins will also go out through PostVIA, uploaded by hand by Vladimir. This is a rule for later: nothing is published or scheduled to Pinterest yet, and the CSV flow in pinterest.md stays as it is until Vladimir says otherwise.

## Quality check

Rendering fails if the config has the wrong number of sections, overlapping sections, or a section outside the page. Everything else is checked by eye on `carousels.png`, `feed-preview.png` and frames of each video, every time, before showing anything. Fix the config and render again if any of these appears:

- **Repeated block.** Framer sticky sections can be captured twice, one under the other. Never use a stretch of the capture where a block repeats; take only the first clean copy, or skip that section.
- **Next section in the frame.** A frame shows one section only, never the start of the next one.
- **Same screen side by side.** Two neighbouring frames, including diagonal ones and rows at their rest poses, never show the same section. The layouts guarantee this with 8 different sections, so the 8 must really look different.
- **Flat band.** A photo or gradient section with a plain strip above or below it needs `cover`.
- **Cut headline.** No headline or face cut by the frame edge. Use another section if `cover` cuts it.
- **Empty or half-loaded area.** No blank frames, missing images or unrendered blocks.
- **Video jump.** The last frame must flow into the first one, with no snap back in a row or device.

## Steps

1. Live demo URL: `preview` in `src/content/templates/<slug>.yaml`.
2. Capture it, unless `.work/marketing/captures/<slug>/` already exists.
3. Run `npm run social:ruler -- <slug>` and read `ruler-desktop.png` and `ruler-mobile.png` in the capture folder: they show the page with a y scale. Write `scripts/marketing/social/configs/<slug>.json`:
   - `titleHtml`: the name, with one word in `<em>`;
   - `screens`: exactly 8 desktop sections as `[top, height]`, each from the first to the last pixel of one section;
   - `phones`: exactly 4 mobile sections as `[top, height]`, about 1700 tall, in the phone layout;
   - add `"cover"` as a third value to a full-bleed photo or gradient section: it then fills the frame from its left edge. Use it only when the section is close to 16:10 and its headline is on the left.
4. Render with `social:motion`, then `social:static`.
5. Run the quality check below. Show Vladimir the feed preview and the videos only after it passes.
6. Write `.work/marketing/social/<slug>/captions.md`, plain English:
   - video: "<Name> 01", "Remix. Edit. Publish.", one line on who it is for;
   - carousel: one line hook, one line on what is inside, "Free on Framer.";
   - Instagram and TikTok end with "Link in bio." and 5 hashtags; Threads and X end with the link.
   - Links go to our site with UTM tags (`/templates/<slug>/?utm_source=threads&utm_medium=social`, bio: `/templates/?utm_source=instagram&utm_medium=bio`), never to `framer.link`.

Videos carry a silent track: music is chosen in the apps when posting. Do not post or schedule anything without Vladimir.

## Scheduling (PostVIA)

Only when Vladimir asks. The calendar lives in `.work/marketing/social/calendar.json`: one entry per slot (`day`, `utc`, `template`, `format`, `type`, `media`, `texts` for instagram, tiktok, threads, x). Four slots a day at 08:00, 12:00, 16:00 and 20:00 UTC, in the posting order above. Per slot:

- **Image or video:** one post to Instagram, TikTok, Threads and X.
- **Carousel (5 slides):** X takes 4 images at most (PostVIA says TOO_MANY_MEDIA_ITEMS). So the main post goes to Instagram, TikTok and Threads, and a separate X post at the same time carries slides 1, 2, 3 and 5 (the last one is the "Free on Framer" slide).
- **Video:** one more post to YouTube with the Threads text and `utm_source=youtube`. The calendar has no YouTube text, so write it from the Threads one.
- **TikTok:** visibility Public, comments allowed, caption from the calendar. Without a visibility TikTok blocks the post (PRIVACY_REQUIRED).
- **Media:** one file cannot be attached to two posts, so upload it again for each post (`create_media_upload`, PUT to the URL within 10 minutes, `complete_media_upload`). Attach carousel slides in order.
- **Check:** `check_post` must say READY, then `schedule_post`. Afterwards `list_posts` must show no DRAFT, FAILED or PARTIAL, and `get_usage` should match the count (one publication per account per post).

Known gaps: the MCP cannot set per-platform captions or TikTok settings (`platformConfigurations`), so until PostVIA adds them these were set by hand in the web composer. Not yet seen in practice: how YouTube builds a title from the text, whether Instagram publishes videos as Reels, and whether TikTok accepts image carousels. Check the first published posts for these before scheduling the next template.
