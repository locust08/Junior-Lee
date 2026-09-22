import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';

import { legacyContentBindings, renderLegacyContent } from '../src/payload/renderLegacyContent.ts';
import { defaultPayloadContent } from '../src/payload/content.ts';
import { mergePublishedContentWithFallback } from '../src/payload/fetchPayloadContent.ts';

const legacyPages = {
  home: 'index.html',
  aboutUs: 'about_us.html',
  loan: 'loan.html',
  howToApply: 'how_to_apply.html',
  contactUs: 'contact.html',
};
const legacyDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/legacy-pages');
const mappingFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../docs/payload-frontend-mapping.md');

function contentValue(content, pathExpression) {
  return pathExpression.replace(/\[(\d+)\]/g, '.$1').split('.').reduce((value, key) => value?.[key], content);
}

function activeMappingIds() {
  const mapping = fs.readFileSync(mappingFile, 'utf8');
  const documentedIds = [...mapping.matchAll(/\|\s*#([a-z0-9-]+)\s*\|/g)].map((match) => match[1]);
  const excludedIds = new Set([...mapping.matchAll(/^- `([a-z0-9-]+)`:/gm)].map((match) => match[1]));

  return documentedIds.filter((id) => !excludedIds.has(id)).sort();
}

test('renderer bindings exactly match the active documented mapping contract', () => {
  const documentedIds = activeMappingIds();
  const rendererIds = legacyContentBindings.map((binding) => binding.id).sort();

  assert.deepEqual(rendererIds, documentedIds);
});

test('renderLegacyContent updates stable id fields without class regexes', () => {
  const html = '<h1 id="home-hero-main-heading" class="keep">Simple Loans,</h1><p id="home-hero-description" class="anything">Old description</p>';
  const content = structuredClone(defaultPayloadContent);
  content.homePage.hero = {
    mainHeading: 'Fast loans, clear terms',
    description: 'Updated description',
  };

  const output = renderLegacyContent(html, 'home', content);

  assert.match(output, /id="home-hero-main-heading" class="keep">Fast loans, clear terms<\/h1>/);
  assert.match(output, /id="home-hero-description" class="anything">Updated description<\/p>/);
  assert.doesNotMatch(output, new RegExp(['data', 'cms'].join('-')));
});

test('renderLegacyContent leaves unmatched HTML unchanged', () => {
  const html = '<div><span>Keep me</span></div>';
  const output = renderLegacyContent(html, 'home', defaultPayloadContent);
  assert.equal(output, html);
});

test('published content merge preserves valid published text even when it contains unusual words', () => {
  const fallback = structuredClone(defaultPayloadContent);
  const published = structuredClone(defaultPayloadContent);
  published.homePage.seo.title = 'LoanEase — Homepage';
  published.homePage.hero.eyebrow = 'Powering Tomorrow';
  published.homePage.hero.mainHeading = 'Simple Loans,';
  published.homePage.hero.description = 'Get the funds you need with competitive rates and a streamlined application.';
  published.homePage.readyToGetStarted.description = 'Apply now and get the funds you need in no time.';
  published.howToApplyPage.hero.description = 'Applying for a loan with us is fast and hassle-free. Follow our easy guide below to complete your application and get the funds you need.';
  published.homePage.howItWorks.heading = 'Editor-approved heading';
  published.siteSettings.footer.copyrightText = '© 2026 Flow. All rights reserved.';

  const merged = mergePublishedContentWithFallback(fallback, published);

  assert.equal(merged.homePage.seo.title, 'LoanEase — Homepage');
  assert.equal(merged.homePage.hero.eyebrow, 'Powering Tomorrow');
  assert.equal(merged.homePage.hero.mainHeading, 'Simple Loans,');
  assert.equal(merged.homePage.hero.description, 'Get the funds you need with competitive rates and a streamlined application.');
  assert.equal(merged.homePage.readyToGetStarted.description, 'Apply now and get the funds you need in no time.');
  assert.equal(merged.howToApplyPage.hero.description, 'Applying for a loan with us is fast and hassle-free. Follow our easy guide below to complete your application and get the funds you need.');
  assert.equal(merged.homePage.howItWorks.heading, 'Editor-approved heading');
  assert.equal(merged.siteSettings.footer.copyrightText, '© 2026 Flow. All rights reserved.');
});

test('published content merge uses defaults for null or missing fields only', () => {
  const merged = mergePublishedContentWithFallback(defaultPayloadContent, {
    homePage: {
      hero: {
        mainHeading: null,
        description: 'Published editor description',
      },
    },
  });

  assert.equal(merged.homePage.hero.mainHeading, defaultPayloadContent.homePage.hero.mainHeading);
  assert.equal(merged.homePage.hero.description, 'Published editor description');
  assert.equal(merged.homePage.hero.primaryButtonLabel, defaultPayloadContent.homePage.hero.primaryButtonLabel);
});

test('published content merge preserves published images exactly', () => {
  const merged = mergePublishedContentWithFallback(defaultPayloadContent, {
    contactUsPage: {
      contactForm: {
        image: {
          src: 'https://cms.example.test/api/media/file/contact.webp',
          alt: 'Published contact image alt',
        },
      },
    },
  });

  assert.equal(merged.contactUsPage.contactForm.image.src, 'https://cms.example.test/api/media/file/contact.webp');
  assert.equal(merged.contactUsPage.contactForm.image.alt, 'Published contact image alt');
});

test('renderLegacyContent escapes hostile editor text without creating executable nodes', () => {
  const html = '<main><h1 id="home-hero-main-heading">Safe heading</h1><script>window.legacy = true</script></main>';
  const content = structuredClone(defaultPayloadContent);
  content.homePage.hero.mainHeading = '<script>window.injected = true</script><img src=x onerror="alert(1)">';

  const output = renderLegacyContent(html, 'home', content);
  const root = parse(output);

  assert.equal(root.querySelectorAll('script').length, 1, 'only the existing legacy script remains');
  assert.equal(root.querySelectorAll('img').length, 0, 'hostile editor text cannot create an image node');
  assert.match(output, /&lt;script&gt;window\.injected = true&lt;\/script&gt;/);
  assert.match(output, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
});

test('renderLegacyContent blocks unsafe href and image source overrides', () => {
  const html = '<a id="site-contact-waze-link" href="/safe-map">Map</a><img id="contact-form-image" src="/safe-image.png" alt="Safe">';
  const content = structuredClone(defaultPayloadContent);
  content.siteSettings.contactDetails.wazeUrl = 'javascript:alert(1)';
  content.contactUsPage.contactForm.image = { src: 'javascript:alert(2)', alt: 'Updated alt' };

  const root = parse(renderLegacyContent(html, 'contactUs', content));

  assert.equal(root.querySelector('#site-contact-waze-link').getAttribute('href'), '/safe-map');
  assert.equal(root.querySelector('#contact-form-image').getAttribute('src'), '/safe-image.png');
  assert.equal(root.querySelector('#contact-form-image').getAttribute('alt'), 'Updated alt');
});

test('renderLegacyContent blocks entity-obfuscated URL schemes without replacing safe legacy attributes', () => {
  const html = '<a id="site-contact-waze-link" href="/safe-map">Map</a><img id="contact-form-image" src="/safe-image.png" alt="Safe">';
  const unsafeUrls = [
    'jav&#x61;script:alert(1)',
    'javascript&colon;alert(1)',
    'java&#x09;script:alert(1)',
    'java&#10;script:alert(1)',
    ' \tjavascript:alert(1)\r\n',
  ];

  for (const unsafeUrl of unsafeUrls) {
    const content = structuredClone(defaultPayloadContent);
    content.siteSettings.contactDetails.wazeUrl = unsafeUrl;
    content.contactUsPage.contactForm.image = { src: unsafeUrl, alt: 'Updated alt' };

    const root = parse(renderLegacyContent(html, 'contactUs', content));

    assert.equal(root.querySelector('#site-contact-waze-link').getAttribute('href'), '/safe-map', unsafeUrl);
    assert.equal(root.querySelector('#contact-form-image').getAttribute('src'), '/safe-image.png', unsafeUrl);
  }
});

test('renderLegacyContent validates and applies the decoded final safe URL', () => {
  const html = '<a id="site-contact-waze-link" href="/safe-map">Map</a>';
  const content = structuredClone(defaultPayloadContent);
  content.siteSettings.contactDetails.wazeUrl = '  /maps?one=1&amp;two=2  ';

  const root = parse(renderLegacyContent(html, 'contactUs', content));

  assert.equal(root.querySelector('#site-contact-waze-link').getAttribute('href'), '/maps?one=1&two=2');
});

test('site settings logo and copyright fields update only their intended elements', () => {
  const html = [
    '<img id="site-header-logo" src="logo.png" alt="">',
    '<img id="site-footer-logo" src="logo.png" alt="">',
    '<p id="site-footer-copyright">© 2026 Metro Pinjaman Berlesen. All rights reserved.</p>',
    '<img id="home-hero-left-top-image" src="flow-assets/metro/home-hero-adviser.webp" alt="">',
    '<p id="unmapped-copy">Get the funds you need.</p>',
  ].join('');
  const content = structuredClone(defaultPayloadContent);
  content.siteSettings.header.websiteLogo = { src: '/api/media/file/header-logo.png', alt: 'Header logo' };
  content.siteSettings.footer.footerLogo = { src: '/api/media/file/footer-logo.png', alt: 'Footer logo' };
  content.siteSettings.footer.copyrightText = '© 2026 Metro Pinjaman Berlesen. All rights reserved.';

  const root = parse(renderLegacyContent(html, 'home', content));

  assert.equal(root.querySelector('#site-header-logo').getAttribute('src'), '/api/media/file/header-logo.png');
  assert.equal(root.querySelector('#site-header-logo').getAttribute('alt'), 'Header logo');
  assert.equal(root.querySelector('#site-footer-logo').getAttribute('src'), '/api/media/file/footer-logo.png');
  assert.equal(root.querySelector('#site-footer-logo').getAttribute('alt'), 'Footer logo');
  assert.equal(root.querySelector('#site-footer-copyright').text.trim(), '© 2026 Metro Pinjaman Berlesen. All rights reserved.');
  assert.equal(root.querySelector('#home-hero-left-top-image').getAttribute('src'), 'flow-assets/metro/home-hero-adviser.webp');
  assert.equal(root.querySelector('#unmapped-copy').text.trim(), 'Get the funds you need.');
});

test('every renderer binding resolves exactly once in its real legacy template', () => {
  for (const [pageId, filename] of Object.entries(legacyPages)) {
    const root = parse(fs.readFileSync(path.join(legacyDirectory, filename), 'utf8'));
    for (const binding of legacyContentBindings.filter((candidate) => candidate.pages.includes(filename))) {
      assert.equal(root.querySelectorAll(`#${binding.id}`).length, 1, `${filename}: ${binding.id}`);
    }
  }
});

test('real templates render metadata, shared responsive labels, images, and links to their intended elements', () => {
  const content = structuredClone(defaultPayloadContent);
  content.siteSettings.header.aboutUsMenuLabel = 'About Metro';
  content.homePage.seo.title = 'Home title';
  content.contactUsPage.seo.title = 'Contact title';

  for (const [pageId, filename] of Object.entries(legacyPages)) {
    const html = fs.readFileSync(path.join(legacyDirectory, filename), 'utf8');
    const root = parse(renderLegacyContent(html, pageId, content));
    for (const binding of legacyContentBindings.filter((candidate) => candidate.pages.includes(filename))) {
      const element = root.querySelector(`#${binding.id}`);
      const value = contentValue(content, binding.path);
      assert.ok(element, `${filename}: ${binding.id} is rendered`);
      if (binding.kind === 'image') assert.equal(element.getAttribute('src'), value.src, `${binding.id} image source`);
      if (binding.kind === 'href') assert.equal(element.getAttribute('href'), String(value), `${binding.id} href`);
      if (binding.kind === 'text' && typeof value === 'string') assert.equal(element.text.trim(), value, `${binding.id} text`);
    }
  }

  const contact = parse(renderLegacyContent(fs.readFileSync(path.join(legacyDirectory, 'contact.html'), 'utf8'), 'contactUs', content));
  assert.equal(contact.querySelector('#contact-form-heading').tagName, 'H1');
  assert.equal(contact.querySelector('#site-footer-link-contact-us').tagName, 'A');
  assert.equal(contact.querySelector('#contact-method-email-heading').tagName, 'SPAN');
  assert.equal(contact.querySelector('#site-contact-waze-link').tagName, 'A');
  assert.equal(contact.querySelector('#site-contact-google-maps-link').tagName, 'A');
});
