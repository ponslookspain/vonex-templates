#!/usr/bin/env node
// Checks that a template is ready to sell, before and after "в продакшн".
//
//   npm run verify -- <slug>            one template
//   npm run verify                      every template
//   npm run verify -- <slug> --offline  skip the checks that need the internet
//
// It catches the mistakes that cost money and that no build notices: a referral link that
// leads to the Framer home page, a Contra price that differs from the site, a zip whose
// version is not the one the site names, or page texts that were never written.
// Exit code 1 when something is wrong, so it can also run in a script.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { root, SITE, exists, listSlugs, readTemplate, latestZip, fetchOk } from './lib/templates.mjs';

const args = process.argv.slice(2);
const offline = args.includes('--offline');
const wanted = args.filter((a) => !a.startsWith('--'));
const slugs = wanted.length ? wanted : await listSlugs();

const LONGEST_SEO = 170; // Google cuts search descriptions near 155 to 160 characters
let errors = 0;
let warnings = 0;

for (const slug of slugs) {
  const lines = [];
  const bad = (m) => { lines.push(`  ✗ ${m}`); errors++; };
  const warn = (m) => { lines.push(`  ! ${m}`); warnings++; };
  const good = (m) => lines.push(`  ✓ ${m}`);

  if (!(await exists(path.join(root, 'src/content/templates', `${slug}.yaml`)))) {
    console.log(`\n${slug}\n  ✗ no such template`);
    errors++;
    continue;
  }
  const t = await readTemplate(slug);

  // ---- texts written for this catalog (the schema leaves them optional) ----
  const missing = ['description', 'pageKind', 'seoDescription', 'overview', 'preparation', 'preview'].filter((k) => !t[k]);
  if (!t.buyUrl && !t.affiliateUrl) missing.push('affiliateUrl');
  if (!t.types?.length) missing.push('types');
  missing.length ? bad(`missing fields: ${missing.join(', ')}`) : good('page texts, preview and types are written');
  if (t.seoDescription && t.seoDescription.length > LONGEST_SEO) warn(`seoDescription is ${t.seoDescription.length} characters, search results cut it`);
  if (t.description && t.description === `${t.tagline}.`) warn('description is still the tagline');

  // ---- files ----
  for (const [label, file] of [['cover', `src/assets/templates/${slug}.webp`], ['social preview', `public/og/${slug}.png`]]) {
    (await exists(path.join(root, file))) ? good(`${label} exists`) : bad(`${label} is missing: ${file}`);
  }

  // ---- offer rules, in plain words (the schema also enforces them at build) ----
  if (t.codeUrl && !t.codeVersion) warn('codeUrl is set but codeVersion is not');
  if (!t.codeUrl && t.codeVersion) warn('codeVersion is set but there is no codeUrl');

  // ---- the code zip ----
  if (t.codeUrl) {
    const zip = await latestZip(slug);
    if (zip === undefined) warn('vonex-code is not next to this repository, zip not checked');
    else if (zip === null) bad('no zip in vonex-code/dist: run npm run pack');
    else if (t.codeVersion && !zip.startsWith(t.codeVersion)) bad(`site says code version ${t.codeVersion}, the newest zip is ${zip}`);
    else good(`zip ${zip} matches code version ${t.codeVersion ?? '(not set)'}`);
  }

  if (!offline) {
    // ---- the referral link must reach the template's remix page, not the Framer home page ----
    if (t.affiliateUrl) {
      const res = await fetchOk(t.affiliateUrl);
      const final = res.url ?? '';
      if (!res.ok) bad(`referral link does not open (HTTP ${res.status}): ${t.affiliateUrl}`);
      else if (!/remix/i.test(final) || !/[?&]via=|via%3D/i.test(final)) bad(`referral link ends on ${final.slice(0, 70)}: no remix page or no referral tag, check the letters of ${t.affiliateUrl}`);
      else good('referral link opens the remix page with the referral tag');
    }
    // ---- live demo ----
    if (t.preview) {
      const res = await fetchOk(t.preview, { method: 'GET' });
      res.ok ? good('live preview opens') : bad(`live preview does not open (HTTP ${res.status}): ${t.preview}`);
    }
    // ---- Contra: price must equal codePrice ----
    if (t.codeUrl) {
      const res = await fetchOk(t.codeUrl);
      if (!res.ok) bad(`Contra page does not open (HTTP ${res.status})`);
      else {
        const price = (await res.text()).match(/"price":"USD:(\d+(?:\.\d+)?)/)?.[1];
        if (price === undefined) warn('could not read the price from the Contra page, check it by eye');
        else if (Number(price) !== Number(t.codePrice)) bad(`Contra price is $${Number(price)}, the site says $${t.codePrice}`);
        else good(`Contra price $${Number(price)} matches codePrice`);
      }
    }
    // ---- the page on the live site ----
    const live = await fetchOk(`${SITE}/templates/${slug}/`);
    live.ok ? good('template page is live on vonexdesign.com') : warn(`template page is not live yet (HTTP ${live.status})`);
  }

  console.log(`\n${slug}\n${lines.join('\n')}`);
}

console.log(`\n${errors} error${errors === 1 ? '' : 's'}, ${warnings} warning${warnings === 1 ? '' : 's'}${offline ? ' (offline: links, Contra and the live site were not checked)' : ''}`);
process.exitCode = errors ? 1 : 0;
