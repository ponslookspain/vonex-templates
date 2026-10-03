// 3D rotating logo for the home page hero. Loaded lazily from HeroStage.astro so that the
// three.js bundle never blocks the first paint. Colors come from the design tokens.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Shape, ExtrudeGeometry, Mesh, Group,
  MeshPhysicalMaterial, PMREMGenerator, PointLight, ACESFilmicToneMapping, SRGBColorSpace, Color,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Starts the rotating 3D logo on `canvas`. Returns false when WebGL is not available.
export function startHeroLogo(canvas: HTMLCanvasElement, stage: HTMLElement): boolean {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return false; // no WebGL: the static logo and the strip still work
  }
  // Cap the pixel ratio: sharp enough, much cheaper on phones.
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 768 ? 1.5 : 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 1.6;

  // Colors come from the design tokens in global.css.
  const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const camera = new PerspectiveCamera(30, 1, 0.1, 50);

  // The two polygons of the logo, in the original SVG coordinates (y points down).
  const polys = [
    [[114.725, 87.033], [0, 613.187], [233.407, 846.593], [348.132, 320.44]],
    [[901.978, 233.407], [668.571, 0], [553.846, 526.154], [233.407, 846.593], [466.813, 1080], [700.219, 846.593], [680.957, 653.265], [787.253, 759.56]],
  ];
  const S = 2 / 1080; // logo height becomes 2 units
  const material = new MeshPhysicalMaterial({
    color: new Color(token('--color-chrome')),
    metalness: 1,
    roughness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    iridescence: 1,
    iridescenceIOR: 1.6,
    iridescenceThicknessRange: [200, 700],
  });
  const logo = new Group();
  for (const pts of polys) {
    const shape = new Shape();
    pts.forEach(([x, y], i) => {
      const px = (x - 451) * S, py = -(y - 540) * S;
      i ? shape.lineTo(px, py) : shape.moveTo(px, py);
    });
    const geo = new ExtrudeGeometry(shape, {
      depth: 0.28, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.04, bevelSegments: 6,
    });
    geo.translate(0, 0, -0.14);
    logo.add(new Mesh(geo, material));
  }
  scene.add(logo);

  const blue = new PointLight(new Color(token('--color-accent')), 40, 12);
  blue.position.set(-2.5, 1.2, 2.5);
  const violet = new PointLight(new Color(token('--color-accent-violet')), 30, 12);
  violet.position.set(2.5, -1.5, 2);
  scene.add(blue, violet);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Fit the logo (2 tall, ~1.7 wide when seen face-on, a bit wider while it turns).
    const t = Math.tan((camera.fov * Math.PI) / 360);
    const fitH = 2.5 / (2 * t);
    const fitW = 2.3 / (2 * t * camera.aspect);
    camera.position.z = Math.max(fitH, fitW);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mx = 0, my = 0, tx = 0, ty = 0, visible = true, last = performance.now(), spin = 0.5;
  addEventListener('pointermove', (e) => {
    mx = (e.clientX / innerWidth - 0.5) * 2;
    my = (e.clientY / innerHeight - 0.5) * 2;
  });
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);

  const frame = (now: number) => {
    requestAnimationFrame(frame);
    if (!visible) { last = now; return; }
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!reduced) spin += dt * 0.45;
    tx += (mx - tx) * 0.05;
    ty += (my - ty) * 0.05;
    logo.rotation.y = spin + tx * 0.3;
    logo.rotation.x = ty * 0.2 + Math.sin(now / 2400) * 0.06;
    logo.position.y = Math.sin(now / 1800) * 0.04;
    blue.position.x = -2.5 + Math.sin(now / 3000) * 1.2;
    violet.position.y = -1.5 + Math.cos(now / 3500) * 1.2;
    renderer.render(scene, camera);
  };
  requestAnimationFrame(frame);
  // First frame is drawn: cross-fade from the static logo to the 3D one.
  requestAnimationFrame(() => stage.setAttribute('data-ready', ''));
  return true;
}
