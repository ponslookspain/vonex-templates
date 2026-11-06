// Empty site frames shared by the motion packs and the static posts: only the rhythm of a page.
const layouts = [
  () => `<i class=l style="left:4%;top:3%;width:12%;height:2%"></i><i class=l style="left:70%;top:3%;width:26%;height:2%"></i><i style="left:4%;top:12%;width:58%;height:9%"></i><i style="left:4%;top:24%;width:40%;height:3%"></i><i style="left:4%;top:38%;width:92%;height:56%"></i>`,
  () => `<i class=l style="left:4%;top:3%;width:12%;height:2%"></i><i style="left:4%;top:12%;width:44%;height:82%"></i><i style="left:52%;top:12%;width:44%;height:38%"></i><i class=l style="left:52%;top:56%;width:30%;height:3%"></i><i class=l style="left:52%;top:62%;width:38%;height:3%"></i><i class=d style="left:52%;top:84%;width:18%;height:7%"></i>`,
  () => `<i class=l style="left:4%;top:3%;width:12%;height:2%"></i><i style="left:4%;top:14%;width:29%;height:42%"></i><i style="left:35.5%;top:14%;width:29%;height:42%"></i><i style="left:67%;top:14%;width:29%;height:42%"></i><i class=l style="left:4%;top:62%;width:24%;height:3%"></i><i class=l style="left:35.5%;top:62%;width:24%;height:3%"></i><i class=l style="left:67%;top:62%;width:24%;height:3%"></i>`,
  () => `<i class=l style="left:4%;top:3%;width:12%;height:2%"></i><i style="left:20%;top:18%;width:60%;height:12%"></i><i class=l style="left:30%;top:34%;width:40%;height:3%"></i><i class=d style="left:41%;top:43%;width:18%;height:8%"></i><i style="left:4%;top:60%;width:92%;height:34%"></i>`,
];

// With ?slug=, every frame shows a slice of the captured site instead of the empty rhythm.
const query = new URLSearchParams(location.search);
const site = query.get('site') ? JSON.parse(query.get('site')) : null;
const groundName = site ? site.ground : null;
const palette = { paper: { bg: '#f2f1ee', fg: '#101014' }, ink: { bg: '#101014', fg: '#f2f1ee' }, stone: { bg: '#8e8d88', fg: '#101014' } }[groundName] || null;
// Sections differ a lot in height, so a slide or a card shows a stack of whole sections, not one.
// pageGroups splits the sections, in page order, into n stacks as equal in height as possible.
const blockRatio = (i) => (site ? site.screens[i % site.screens.length].h / 1440 : 1.2);
const pageGroups = (n) => {
  const count = site ? site.screens.length : 0;
  if (count < n) return Array.from({ length: n }, (_, i) => [i]);
  const height = (a, b) => { let t = 0; for (let i = a; i < b; i++) t += blockRatio(i); return t; };
  const split = (from, k) => {
    if (k === 1) return { worst: height(from, count), cuts: [[from, count]] };
    let best = null;
    for (let to = from + 1; to <= count - k + 1; to++) {
      const rest = split(to, k - 1), worst = Math.max(height(from, to), rest.worst);
      if (!best || worst < best.worst) best = { worst, cuts: [[from, to], ...rest.cuts] };
    }
    return best;
  };
  return split(0, n).cuts.map(([a, b]) => Array.from({ length: b - a }, (_, i) => a + i));
};
// The largest size a stack can take inside maxW x maxH, and the height of each section in it.
const stackSize = (group, maxW, maxH) => {
  const ratio = group.reduce((t, i) => t + blockRatio(i), 0), w = Math.min(maxW, maxH / ratio);
  return { w, h: w * ratio, heights: group.map((i) => w * blockRatio(i)) };
};

// A frame shows exactly one section: never the next block, never a stretched crop.
// A frame with data-kind was cut to its own section. Any other desktop frame has a fixed shape, so it takes
// the sections closest to that shape, in page order, one after another: a good fit without repeating a neighbour.
const closest = (ratio, used) => {
  const key = ratio.toFixed(2), n = used[key] = (used[key] || 0) + 1;
  const gap = (s) => Math.abs(Math.log(s.h / 1440 / ratio));
  const near = site.screens.map((s, i) => ({ i, g: gap(s) })).sort((a, b) => a.g - b.g).slice(0, 5).sort((a, b) => a.i - b.i);
  return site.screens[near[(n - 1) % near.length].i];
};
const fillFrames = () => {
  if (!site) return;
  const used = {};
  window.frameReport = [];
  document.querySelectorAll('.f').forEach((f) => {
    const w = f.offsetWidth, h = f.offsetHeight, phone = f.dataset.kind ? f.dataset.kind === 'phone' : h > w * 1.4, i = +f.dataset.i || 0;
    const list = phone ? site.phones : site.screens, sec = phone || f.dataset.kind ? list[i % list.length] : closest(h / w, used), scale = w / (phone ? 780 : 1440);
    // Photo and gradient sections are marked `cover`: they fill the frame from the left edge, where the headline sits, because a flat fill would read as a band.
    let fit = sec.cover ? Math.max(scale, h / sec.h) : scale, shown = sec.h;
    // Too tall: cut on an empty row if that keeps most of the frame, otherwise show the whole block a little smaller.
    if (!sec.cover && !phone && sec.h * fit > h + 1) {
      const room = h / fit, cut = Math.max(0, ...(sec.cuts || []).filter((c) => c <= room));
      if (cut >= room * .7) shown = cut; else fit = h / sec.h;
    }
    const pageW = (phone ? 780 : 1440) * fit, innerW = Math.min(pageW, w), sh = Math.min(shown * fit, h), y = Math.round((h - sh) / 2), x = (w - innerW) / 2;
    window.frameReport.push({ section: list.indexOf(sec), size: `${w}x${h}`, crop: Math.max(1 - sh / (sec.h * fit), 1 - w / pageW, 0), pad: 1 - sh * innerW / (h * w) });
    f.innerHTML = '';
    f.style.background = sec.fill;
    const inner = document.createElement('div');
    inner.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${innerW}px;height:${sh}px;background:url(../../../.work/marketing/captures/${site.slug}/${phone ? 'mobile' : 'desktop'}.png) 0 ${-sec.top * fit}px / ${pageW}px auto no-repeat`;
    f.append(inner);
  });
};
