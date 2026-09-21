import test from 'node:test';
import assert from 'node:assert/strict';
import { parse } from 'node-html-parser';

import { loadLegacyPage } from '../src/lib/legacyPageData.ts';

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('loadLegacyPage exposes Payload SEO title and description to Next Head props', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({
    homePage: {
      seo: {
        title: 'Payload SEO title',
        description: 'Payload SEO description',
      },
    },
  }));

  const page = await loadLegacyPage('index.html', 'home');

  assert.equal(page.title, 'Payload SEO title');
  assert.equal(page.description, 'Payload SEO description');
  assert.match(page.bodyHtml, /id="home-hero-main-heading"/);
});

test('loadLegacyPage renders published Payload home heading into generated HTML', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({
    homePage: {
      hero: {
        mainHeading: 'Pay Off Your Debts',
      },
    },
  }));

  const page = await loadLegacyPage('index.html', 'home');

  assert.match(page.bodyHtml, /Pay Off Your Debts/);
  assert.doesNotMatch(page.bodyHtml, /Powering Tomorrow|Simple Loans,/);
});

test('loadLegacyPage presents the Junior Lee brand across localized customer pages', async () => {
  globalThis.fetch = async () => {
    throw new Error('use the checked-in fallback content');
  };

  for (const locale of ['en', 'bm', 'cn']) {
    const page = await loadLegacyPage('index.html', 'home', locale);
    const renderedPage = `${page.title}\n${page.metaDescription}\n${page.bodyHtml}`;

    assert.match(renderedPage, /Junior Lee/);
    assert.doesNotMatch(renderedPage, /Alfa Pinjaman|Metro Pinjaman Berlesen/i);
  }
});

test('every English page exposes descriptive Junior Lee SEO without former brand names', async () => {
  globalThis.fetch = async () => {
    throw new Error('use the checked-in fallback content');
  };

  const pages = [
    ['index.html', 'home'],
    ['about_us.html', 'aboutUs'],
    ['loan.html', 'loan'],
    ['how_to_apply.html', 'howToApply'],
    ['contact.html', 'contactUs'],
  ];

  for (const [fileName, pageId] of pages) {
    const page = await loadLegacyPage(fileName, pageId, 'en');
    const seoCopy = `${page.title}\n${page.metaDescription}`;

    assert.match(page.title, /Junior Lee/);
    assert.ok(page.metaDescription.length >= 70, `${pageId} description is too short`);
    assert.doesNotMatch(seoCopy, /Alfa Pinjaman|Metro Pinjaman Berlesen/i);
  }
});

test('loadLegacyPage keeps the white logo in the header and uses the dark supplied logo in the footer', async () => {
  globalThis.fetch = async () => {
    throw new Error('use the checked-in fallback content');
  };

  const page = await loadLegacyPage('index.html', 'home');
  const root = parse(page.bodyHtml);
  const headerLogo = root.querySelector('#site-header-logo');
  const footerLogo = root.querySelector('#site-footer-logo');

  assert.equal(headerLogo?.getAttribute('src'), '/brand/junior-lee-logo.png');
  assert.equal(headerLogo?.getAttribute('width'), '154');
  assert.equal(headerLogo?.getAttribute('height'), '53');
  assert.equal(footerLogo?.getAttribute('src'), '/brand/metro-footer-logo.png');
  assert.equal(footerLogo?.getAttribute('width'), '176');
  assert.equal(footerLogo?.getAttribute('height'), '64');
  assert.doesNotMatch(page.bodyHtml, /id="site-(?:header|footer)[^"]*-logo"[^>]*class="[^"]*brightness-0/);
  assert.match(page.bodyHtml, /id="site-header-mobile-drawer-primary-logo"/);
});

test('loadLegacyPage renders the centralized Junior Lee contact details and link destinations', async () => {
  globalThis.fetch = async () => {
    throw new Error('use the checked-in fallback content');
  };

  const page = await loadLegacyPage('contact.html', 'contactUs');

  assert.match(page.bodyHtml, /\+60 10-215 0037/);
  assert.match(page.bodyHtml, /href="tel:\+60102150037"/);
  assert.match(page.bodyHtml, /metropinjamanberlesan@gmail\.com/);
  assert.match(page.bodyHtml, /href="mailto:metropinjamanberlesan@gmail\.com"/);
  assert.match(
    page.bodyHtml,
    /Jalan Metro 1, Metro Prima, 52100 Kuala Lumpur, Federal Territory of Kuala Lumpur/,
  );
  assert.doesNotMatch(
    page.bodyHtml,
    /017-5392449|60175392449|alfa\.pinjaman@gmail\.com|Jalan Batu Nilam 1/,
  );
});

test('localized pages keep navigation and footer routes consistent', async () => {
  globalThis.fetch = async () => {
    throw new Error('use the checked-in fallback content');
  };

  const pages = [
    ['index.html', 'home'],
    ['about_us.html', 'aboutUs'],
    ['loan.html', 'loan'],
    ['how_to_apply.html', 'howToApply'],
    ['contact.html', 'contactUs'],
  ];

  for (const locale of ['en', 'bm', 'cn']) {
    const expectedRoutes = {
      home: `/${locale}`,
      aboutUs: `/${locale}/about-us`,
      loan: `/${locale}/loan`,
      howToApply: `/${locale}/how-to-apply`,
      contactUs: `/${locale}/contact`,
    };

    for (const [filename, pageId] of pages) {
      const page = await loadLegacyPage(filename, pageId, locale);
      const root = parse(page.bodyHtml);

      assert.equal(root.querySelector('#site-header-logo')?.closest('a')?.getAttribute('href'), expectedRoutes.home);
      assert.equal(root.querySelector('#site-header-nav-about-us')?.getAttribute('href'), expectedRoutes.aboutUs);
      assert.equal(root.querySelector('#site-header-nav-loan')?.getAttribute('href'), expectedRoutes.loan);
      assert.equal(root.querySelector('#site-header-nav-how-to-apply')?.getAttribute('href'), expectedRoutes.howToApply);
      assert.equal(root.querySelector('#site-header-nav-contact-us')?.getAttribute('href'), expectedRoutes.contactUs);
      assert.equal(root.querySelector('#site-header-mobile-drawer-primary-nav-about-us')?.getAttribute('href'), expectedRoutes.aboutUs);
      assert.equal(root.querySelector('#site-header-mobile-drawer-primary-nav-loan')?.getAttribute('href'), expectedRoutes.loan);
      assert.equal(root.querySelector('#site-header-mobile-drawer-primary-nav-how-to-apply')?.getAttribute('href'), expectedRoutes.howToApply);
      assert.equal(root.querySelector('#site-header-mobile-drawer-primary-nav-contact-us')?.getAttribute('href'), expectedRoutes.contactUs);
      assert.equal(root.querySelector('#site-footer-link-home')?.getAttribute('href'), expectedRoutes.home);
      assert.equal(root.querySelector('#site-footer-link-about-us')?.getAttribute('href'), expectedRoutes.aboutUs);
      assert.equal(root.querySelector('#site-footer-link-loan-options')?.getAttribute('href'), expectedRoutes.loan);
      assert.equal(root.querySelector('#site-footer-link-how-to-apply')?.getAttribute('href'), expectedRoutes.howToApply);
      assert.equal(root.querySelector('#site-footer-link-contact-us')?.getAttribute('href'), expectedRoutes.contactUs);

      const legacyInternalLinks = root.querySelectorAll('a[href]').filter((anchor) =>
        /(?:index|about_us|loan|how_to_apply|contact)\.html/.test(anchor.getAttribute('href') || ''),
      );
      assert.equal(legacyInternalLinks.length, 0, `${locale}/${pageId} retained a legacy .html link`);
    }
  }
});

test('contact page metadata uses the configured Kuala Lumpur location', async () => {
  globalThis.fetch = async () => {
    throw new Error('use the checked-in fallback content');
  };

  const page = await loadLegacyPage('contact.html', 'contactUs', 'en');

  assert.match(page.metaDescription, /Kuala Lumpur/);
  assert.doesNotMatch(page.metaDescription, /Pelabuhan Klang|Selangor/);
});
