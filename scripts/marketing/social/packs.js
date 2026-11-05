// Animations 4, 5, 6 and 9 of the approved pool. Loaded by motion.html after its helpers.
{
  const bg = palette ? palette.bg : '#101014';
  const body = (w, h, r, parent = stage) => {
    const d = el('abs', `left:${(1080 - w) / 2}px;top:${(1920 - h) / 2}px;width:${w}px;height:${h}px`, parent);
    for (let k = 0; k < 14; k++) el('abs', `inset:0;border-radius:${r}px;background:${k === 13 ? '#2a2a2f' : '#55555c'};transform:translateZ(${-k * 1.6}px)`, d);
    el('abs', `inset:0;border-radius:${r}px;background:#050506;transform:translateZ(1px)`, d);
    const glass = el('abs', `inset:16px;border-radius:${r - 12}px;overflow:hidden;background:#fff;transform:translateZ(2px)`, d);
    return { d, glass, w: w - 32, h: h - 32 };
  };
  // Four screens and the first one again, so a stepped scroll wraps unseen.
  const strip = (parent, w, h, top = 0) => {
    const s = el('abs', `left:0;top:${top}px;width:100%`, parent);
    for (let i = 0; i < 5; i++) frame(s, i % 4, `left:0;top:${i * h}px;width:${w}px;height:${h}px`);
    return s;
  };
  // Height of a section at width w: a frame cut to its block shows no padding and no crop.
  const blockH = (i, w) => w * (site ? site.screens[i % site.screens.length].h / 1440 : .75);
  // A card of whole sections, so every card has about the same size however uneven the blocks are.
  const stackCard = (parent, group, maxW, maxH, top) => {
    const { w, h, heights } = stackSize(group, maxW, maxH), c = el('abs', `left:${(1080 - w) / 2}px;top:${top(h)}px;width:${w}px;height:${h}px`, parent);
    let y = 0;
    group.forEach((i, k) => { frame(c, i, `left:0;top:${y}px;width:${w}px;height:${heights[k]}px`).dataset.kind = 'desktop'; y += heights[k]; });
    return c;
  };
  const packs = {
    4() { // Browser scroll: one window, the page moves through it in stops
      const w = 940, h = 1500, bar = 60;
      const win = el('abs', `left:70px;top:210px;width:${w}px;height:${h}px;background:#fff;overflow:hidden;border-radius:14px`);
      el('abs', `left:0;top:0;width:100%;height:${bar}px;background:#e4e4e2;z-index:2`, win);
      for (let i = 0; i < 3; i++) el('abs', `left:${24 + i * 26}px;top:22px;width:16px;height:16px;border-radius:50%;background:#b5b5b1;z-index:3`, win);
      // Sections follow each other at their own heights, like a real page. Three rounds, so the window never runs out.
      const s = el('abs', `left:0;top:${bar}px;width:100%`, win), stops = [0];
      for (let i = 0, y = 0; i < 12; i++) {
        const fh = blockH(i % 4, w);
        frame(s, i % 4, `left:0;top:${y}px;width:${w}px;height:${fh}px`).dataset.kind = 'desktop';
        stops.push(y += fh);
      }
      return (t) => {
        const a = t / T * 2 * Math.PI;
        win.style.transform = `rotateY(${Math.sin(a) * 7}deg) rotateX(${Math.cos(a) * 4}deg)`;
        const q = (steps(t, 4, .6) % 4 + 4) % 4, k = Math.floor(q);
        s.style.transform = `translateY(${-(stops[k] + (stops[k + 1] - stops[k]) * (q - k))}px)`;
      };
    },
    5() { // Phone scroll: one large phone fills the frame
      const p = body(780, 1660, 96), s = strip(p.glass, p.w, p.h);
      return (t) => {
        const a = t / T * 2 * Math.PI;
        p.d.style.transform = `rotateY(${Math.sin(a) * 12}deg) rotateX(${Math.cos(a) * 5}deg) rotateZ(${Math.sin(a) * 1.5}deg)`;
        s.style.transform = `translateY(${-(steps(t, 4, .6) % 4) * p.h}px)`;
      };
    },
    6() { // Deck: the top screen flies past the camera, the stack moves up
      // A 3D box of its own: #stage clips, which flattens 3D, and cards would stack by DOM order, not depth.
      const box = el('abs', 'inset:0');
      // Bottoms line up, so a taller card behind only shows above the one in front.
      const cards = pageGroups(4).map((g) => stackCard(box, g, 860, 1080, (h) => 1560 - h));
      return (t) => {
        const s = steps(t, 4, .7, inOut);
        const back = (c, q) => { c.style.transform = `translate3d(0,${-q * 120}px,${-q * 260}px)`; c.style.filter = `brightness(${1 - q * .1})`; };
        cards.forEach((c, i) => {
          const q = (((i - s) % 4) + 4) % 4;
          c.style.opacity = 1; // Cards stay solid: depth comes from brightness, so nothing shows through.
          if (q <= 3) return back(c, q);
          const u = 4 - q;
          if (u < .7) {
            const v = u / .7;
            c.style.filter = 'none';
            c.style.transform = `translate3d(0,${v * 1700}px,${v * 700}px) rotateX(${v * 55}deg)`;
          } else {
            // Off screen by now: it returns behind the stack, hidden by the cards in front.
            const w = (u - .7) / .3;
            back(c, 3 + (1 - w) * .5);
            c.style.opacity = w;
          }
        });
      };
    },
    9() { // Orbit: a ring of screens turns around a phone
      const ring = el('abs', 'left:540px;top:960px;width:0;height:0');
      for (let i = 0; i < 6; i++) {
        const f = frame(ring, i, `left:-290px;top:-180px;width:580px;height:360px;transform:rotateY(${i * 60}deg) translateZ(640px)`);
        f.style.backfaceVisibility = 'visible';
      }
      const p = body(350, 740, 56), s = strip(p.glass, p.w, p.h);
      return (t) => {
        const a = t / T * 2 * Math.PI;
        ring.style.transform = `rotateX(-14deg) rotateZ(${Math.sin(a) * 3}deg) rotateY(${steps(t, 6, .72) * 60}deg)`;
        p.d.style.transform = `rotateY(${Math.sin(a) * 14}deg) rotateZ(${Math.cos(a) * 3}deg)`;
        s.style.transform = `translateY(${-(steps(t, 4, .6) % 4) * p.h}px)`;
      };
    },
  };
  if (packs[pack]) { document.body.style.background = bg; draw = packs[pack](); }
}
