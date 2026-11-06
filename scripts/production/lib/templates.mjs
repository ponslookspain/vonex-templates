// Shared helpers for the scripts that look at the whole catalog (verify.mjs, status.mjs).
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const SITE = 'https://vonexdesign.com';
// The private repository with the code versions sits next to this one.
export const codeRepo = path.resolve(root, '..', 'vonex-code');

export const exists = (p) => stat(p).then(() => true, () => false);

export async function listSlugs() {
  return (await readdir(path.join(root, 'src/content/templates'))).filter((f) => f.endsWith('.yaml')).map((f) => f.replace(/\.yaml$/, '')).sort();
}

export async function readTemplate(slug) {
  return parseYaml(await readFile(path.join(root, 'src/content/templates', `${slug}.yaml`), 'utf8')) ?? {};
}

// Zips made by `npm run pack` in vonex-code: <slug>-v1.0.2.zip. Returns the newest version or null.
export async function latestZip(slug) {
  const dir = path.join(codeRepo, 'dist');
  if (!(await exists(dir))) return undefined; // the code repository is not on this machine
  const found = (await readdir(dir)).map((f) => f.match(new RegExp(`^${slug}-v(\\d+(?:\\.\\d+)*)\\.zip$`))).filter(Boolean).map((m) => m[1]);
  const num = (v) => v.split('.').map(Number);
  found.sort((a, b) => {
    const [x, y] = [num(a), num(b)];
    for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (y[i] ?? 0) - (x[i] ?? 0);
    return 0;
  });
  return found[0] ?? null;
}

export async function fetchOk(url, init = {}) {
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (vonex-templates verify)' }, signal: AbortSignal.timeout(20000), ...init });
    return res;
  } catch (e) {
    return { ok: false, status: 0, url, error: e.message, text: async () => '' };
  }
}
