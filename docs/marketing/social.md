# Social visuals for a template

Makes the base visual set for Instagram, Threads, X and TikTok from a template's live demo. For any agent; run everything from the repository root and talk to Vladimir in Russian. Vladimir starts this with "делаем визуал для соцсетей" and a template.

This look was approved by Vladimir on 2026-11-05. It is the base for every template: do not change the packs, layouts or rules without asking.

Everything generated goes to `.work/marketing/social/<slug>/` (git-ignored). Only the scripts and `configs/<slug>.json` are in git.

| Command | What |
| --- | --- |
| `npm run capture -- <slug> <live url>` | Capture the desktop and phone pages into `.work/marketing/captures/<slug>/` |
| `npm run social:motion -- <slug>` | The three looping videos and their 4:5 slides |
| `npm run social:static -- <slug>` | Six posts, three carousels, `carousels.png`, `feed-preview.png` |

Without a slug both commands render empty frames into `.work/marketing/social/empty/`, for trying a layout. Run `social:motion` before `social:static`: the feed preview uses the video covers. Needs Edge or Chrome (`BROWSER_PATH` to override), `ffmpeg` and `sharp`.

## Visual rules

- **Minimal.** One idea per frame, plenty of air, only the template's own screens. No badges, stickers, gradients of our own or decorative shapes.
- **Clean feed.** No text on covers, first frames or inner slides. Words appear only inside a video after its first frame, and on the last carousel slide ("Free on *Framer*").
- **Ground by contrast.** A light site goes on ink `#101014`, a dark site on paper `#f2f1ee`. Set `ground` in the config. If a site is mixed, judge by its first screen and main sections and tell Vladimir which you chose.
- **Type.** Archivo with one word in Instrument Serif italic, as on the site.
- **Motion.** Every video loops seamlessly in 8 seconds and moves with inertia: slow start, fast middle, soft landing with a small overshoot, then a rest pose. Motion uses all three axes, never a plain linear scroll.
- **Variety.** Neighbouring posts never share a look: alternate the packs, posts and carousels as in `feed-preview.png`.
- **Posting order.** Mix templates in the feed instead of posting one whole set in a row. Start each new template with a different format. Never put the same format next to itself, even for different templates.

## The set

| Part | Files | Where it goes |
| --- | --- | --- |
| Pack 1, barrel: four screens turn on the X axis, title and "Free on Framer" fixed | `motion/pack-1/` | Reels, TikTok, Threads, X |
| Pack 2, devices: tablet and phone at different depths swing in 3D | `motion/pack-2/` | Reels, TikTok, Threads, X |
| Pack 3, wall: tilted field of screens to the edges, rows slide against each other | `motion/pack-3/` | Reels, TikTok, Threads, X |
| Posts: `flat`, `stacked`, `row`, `phone`, `tablet`, `wall` | `static/posts/` | Instagram, Threads, X |
| Carousel c1: screen per slide, a phone on each seam | `static/c1/` | Instagram, Threads, TikTok photo mode |
| Carousel c2: tilted wall through all slides | `static/c2/` | same |
| Carousel c3: long columns crossing the seams | `static/c3/` | same |

Sizes: video 1080x1920, slides and posts 1080x1350, with the important part inside the central 4:5 area of a video. X takes at most 4 images, so post 4 slides or a video there.

## Pinterest

This set is not for Pinterest. Pins keep their own approved style and procedure in [pinterest.md](pinterest.md): 1000x1500 (2:3), no text, the backgrounds from the template's palette. Do not upload anything from this set to Pinterest and do not change the pin rules unless Vladimir asks. If he asks later, these are the limits: videos can become video pins, but the CSV flow is built for images and needs checking first; posts must be remade in 2:3; carousels and the "Free on Framer" slide do not work as single pins.

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
   - `ground`: `ink` or `paper`, by the rule above;
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

Videos carry a silent track: music is chosen in the apps when posting. Publishing is a separate step and is not decided yet: do not post anything without Vladimir.
