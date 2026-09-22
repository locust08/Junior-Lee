import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { applySiteName, siteConfig } from '../config/site.ts';

test('legacy CMS brand values are normalized to Metro Pinjaman Berlesen', () => {
  assert.equal(
    applySiteName('Contact Junior Lee for help'),
    'Contact Metro Pinjaman Berlesen for help',
  );
  assert.equal(
    applySiteName('Hi%20Junior%20Lee%2C%20please%20help'),
    'Hi%20Metro%20Pinjaman%20Berlesen%2C%20please%20help',
  );
});

test('web app manifest exposes the Metro Pinjaman Berlesen identity', () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('../public/manifest.json', import.meta.url), 'utf8'));

  assert.equal(siteConfig.name, 'Metro Pinjaman Berlesen');
  assert.equal(siteConfig.shortName, 'Metro Pinjaman Berlesen');
  assert.equal(manifest.name, 'Metro Pinjaman Berlesen');
  assert.equal(manifest.short_name, 'Metro Pinjaman Berlesen');
});

test('public SEO assets use Metro Pinjaman Berlesen metadata and resolvable existing assets', () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('../public/manifest.json', import.meta.url), 'utf8'));
  const robots = fs.readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');
  const sitemap = fs.readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');

  assert.deepEqual(manifest.icons.map((icon) => icon.src), ['/junior-lee-favicon.png']);
  assert.equal(manifest.theme_color, '#0E6656');
  assert.ok(fs.existsSync(new URL('../public/junior-lee-favicon.png', import.meta.url)));
  assert.ok(fs.existsSync(new URL(`../public${siteConfig.seo.socialImage}`, import.meta.url)));
  assert.match(robots, new RegExp(`Sitemap: ${siteConfig.url.replaceAll('.', '\\.')}/sitemap\\.xml`));
  assert.match(sitemap, new RegExp(`<loc>${siteConfig.url.replaceAll('.', '\\.')}\/en<\/loc>`));
  assert.doesNotMatch(`${JSON.stringify(manifest)}\n${robots}\n${sitemap}`, /Alfa Pinjaman|Junior Lee/i);
});
