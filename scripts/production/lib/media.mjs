// Media helpers for the template importer: download an image and turn it into the 4:3
// WebP that the site uses.
import sharp from 'sharp';

export const GALLERY_SIZE = { width: 1600, height: 1200 }; // 4:3, same as every template cover

export async function download(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (vonex-templates importer)' } });
  if (!res.ok) throw new Error(`could not download ${url} (HTTP ${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

// Any image -> 4:3 WebP, as sharp as it needs to be and as small as possible.
export const toWebp = (buf, size = GALLERY_SIZE, quality = 82) =>
  sharp(buf).resize(size.width, size.height, { fit: 'cover' }).webp({ quality }).toBuffer();
