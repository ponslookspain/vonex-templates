// Upload the rendered pins of one template to the public R2 bucket vonex-pins as JPG
// (Pinterest's CSV upload needs a public URL per image; they are not part of the site).
//   node scripts/pinterest/upload.mjs <slug>
// Reads .work/pinterest/<slug>/pins/*.png, writes JPG (quality 88, mozjpeg) to .work/pinterest/<slug>/jpg/
// and puts each one into the bucket with wrangler (needs CLOUDFLARE_API_TOKEN, as the repo's deploy does).
import sharp from 'sharp';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { mkdir, readdir } from 'node:fs/promises';

const slug = process.argv[2];
if (!slug) throw new Error('usage: upload.mjs <slug>');
const src = path.resolve('.work/pinterest', slug, 'pins');
const dst = path.resolve('.work/pinterest', slug, 'jpg');
await mkdir(dst, { recursive: true });
let n = 0;
for (const f of (await readdir(src)).filter((x) => x.startsWith(slug) && x.endsWith('.png'))) {
  const jpg = path.join(dst, f.replace('.png', '.jpg'));
  await sharp(path.join(src, f)).flatten({ background: '#fff' }).jpeg({ quality: 88, mozjpeg: true }).toFile(jpg);
  execFileSync('npx', ['wrangler', 'r2', 'object', 'put', `vonex-pins/${path.basename(jpg)}`, '--file', jpg, '--content-type', 'image/jpeg', '--remote'], { stdio: 'ignore', shell: true });
  n++;
}
console.log(`${n} pins uploaded to r2://vonex-pins`);
