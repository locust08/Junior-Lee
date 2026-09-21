const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const legacyDir = path.join(rootDir, 'src', 'legacy-pages');
const outDir = path.join(rootDir, 'out');

const pages = [
  'index.html',
  'loan.html',
  'about_us.html',
  'contact.html',
  'how_to_apply.html',
];

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function extractTitle(html) {
  return /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.trim() || '';
}

function assertContains(file, content, expected) {
  if (!content.includes(expected)) {
    throw new Error(`${file} is missing expected content: ${expected}`);
  }
}

function assertEqual(file, label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${file} ${label} mismatch: expected "${expected}", got "${actual}"`);
  }
}

for (const page of pages) {
  const legacy = read(path.join(legacyDir, page));
  const built = read(path.join(outDir, page));
  const title = extractTitle(legacy);

  assertEqual(page, 'title', extractTitle(built), title);
  assertContains(page, built, '/css/tailwind/tailwind.min.css');
  assertContains(page, built, '/css/main.css');
  assertContains(page, built, 'global-88881.js');
}

const howToApply = read(path.join(outDir, 'how_to_apply.html'));
assertContains('how_to_apply.html', howToApply, 'contactBookingForm()');
assertContains('how_to_apply.html', howToApply, 'Preferred Date');
assertContains('how_to_apply.html', howToApply, 'Preferred Time');
assertContains('how_to_apply.html', howToApply, '/api/bookings');

console.log(`Verified ${pages.length} legacy pages in Next export.`);
