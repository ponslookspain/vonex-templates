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
const palette = groundName === 'paper' ? { bg: '#f2f1ee', fg: '#101014' } : groundName === 'ink' ? { bg: '#101014', fg: '#f2f1ee' } : null;
// A frame shows exactly one section: never the next block, never a stretched crop.
// A short section sits centred on its own ground colour; a tall one starts at its top.
const fillFrames = () => {
  if (!site) return;
  document.querySelectorAll('.f').forEach((f) => {
    const w = f.offsetWidth, h = f.offsetHeight, phone = h > w * 1.4, i = +f.dataset.i || 0;
    const list = phone ? site.phones : site.screens, sec = list[i % list.length], scale = w / (phone ? 780 : 1440);
    // Photo and gradient sections are marked `cover`: they fill the frame from the left edge, where the headline sits, because a flat fill would read as a band.
    const fit = sec.cover ? Math.max(scale, h / sec.h) : scale, pageW = (phone ? 780 : 1440) * fit;
    const sh = Math.min(sec.h * fit, h), y = (h - sh) / 2;
    f.innerHTML = '';
    f.style.background = sec.fill;
    const inner = document.createElement('div');
    inner.style.cssText = `position:absolute;left:0;top:${y}px;width:${w}px;height:${sh}px;background:url(../../.work/pinterest/${site.slug}/raw/${phone ? 'mobile' : 'desktop'}.png) 0 ${-sec.top * fit}px / ${pageW}px auto no-repeat`;
    f.append(inner);
  });
};
