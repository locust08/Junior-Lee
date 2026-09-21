import fs from 'fs';
import path from 'path';
import { parse } from 'node-html-parser';
import { fetchPayloadContent } from '../payload/fetchPayloadContent.ts';
import { renderLegacyContent } from '../payload/renderLegacyContent.ts';
import type { PublicPayloadContent, SitePageId } from '../payload/content.ts';
import type { LegacyPageContent } from './legacyPage.tsx';
import { siteConfig } from '../../config/site.ts';
import {
  getLocalizedPath,
  localizeLegacyNavigation,
  localizePayloadContent,
  type SiteLocale,
  applyCurrentBrandName,
} from './locale.ts';

const legacyPageDir = path.join(process.cwd(), 'src', 'legacy-pages');

function matchFirst(source: string, pattern: RegExp): string {
  return pattern.exec(source)?.[1]?.trim() || '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const improvedEnglishSeoTitles: Record<SitePageId, string> = {
  home: `${siteConfig.name} Malaysia | Personal & Business Loan Enquiries`,
  aboutUs: `About ${siteConfig.name} | Loan Enquiry Support Malaysia`,
  loan: `Personal & Business Loan Options | ${siteConfig.name}`,
  howToApply: `How to Apply for a Loan | ${siteConfig.name}`,
  contactUs: `Contact ${siteConfig.name} | Loan Enquiries & Appointments`,
};

const genericEnglishSeoTitles: Record<SitePageId, Set<string>> = {
  home: new Set([
    `${siteConfig.name} | Personal & Business Loans in Malaysia`,
    `${siteConfig.name} | Personal & Business Loans in Malaysia.`,
  ]),
  aboutUs: new Set([`About Us | ${siteConfig.name}`]),
  loan: new Set([`Loan Options | ${siteConfig.name}`]),
  howToApply: new Set([`How to Apply | ${siteConfig.name}`]),
  contactUs: new Set([`Contact Us | ${siteConfig.name}`]),
};

function getPageSeo(
  content: PublicPayloadContent,
  pageId: SitePageId,
  locale: SiteLocale,
) {
  const page = {
    home: content.homePage,
    aboutUs: content.aboutUsPage,
    loan: content.loanPage,
    howToApply: content.howToApplyPage,
    contactUs: content.contactUsPage,
  }[pageId];
  const seo = isRecord(page) && isRecord(page.seo) ? page.seo : {};

  const publishedTitle = typeof seo.title === 'string'
    ? applyCurrentBrandName(seo.title.trim())
    : '';
  const title = locale === 'en' && genericEnglishSeoTitles[pageId].has(publishedTitle)
    ? improvedEnglishSeoTitles[pageId]
    : publishedTitle;

  return {
    title,
    description: typeof seo.description === 'string' ? seo.description : '',
  };
}

function getRecordPath(root: unknown, keys: Array<number | string>): unknown {
  return keys.reduce<unknown>((current, key) => {
    if (typeof key === 'number') return Array.isArray(current) ? current[key] : undefined;
    return isRecord(current) ? current[key] : undefined;
  }, root);
}

function getImageSrc(content: PublicPayloadContent, keys: Array<number | string>): string {
  const image = getRecordPath(content, keys);
  if (!isRecord(image)) return '';

  return typeof image.src === 'string' ? image.src : '';
}

function replaceLeftoverLegacyAssetPaths(
  bodyHtml: string,
  content: PublicPayloadContent,
  locale: SiteLocale,
  pageId: SitePageId,
): string {
  const imageReplacements: Record<string, string> = {
    'flow-assets/metro/home-hero-adviser.webp': getImageSrc(content, ['homePage', 'hero', 'images', 'leftTop']),
    'flow-assets/metro/home-personal-documents.webp': getImageSrc(content, ['homePage', 'hero', 'images', 'rightTop']),
    'flow-assets/metro/home-business-cafe.webp': getImageSrc(content, ['homePage', 'hero', 'images', 'bottomLeft']),
    'flow-assets/metro/required-documents-closeup.webp': getImageSrc(content, ['homePage', 'hero', 'images', 'bottomRight']),
    'flow-assets/metro/personal-loan-consultation.webp': getImageSrc(content, ['homePage', 'loanOptions', 'cards', 0, 'image']),
    'flow-assets/metro/business-financing-documents.webp': getImageSrc(content, ['homePage', 'loanOptions', 'cards', 1, 'image']),
    'flow-assets/metro/home-why-adviser-files.webp': getImageSrc(content, ['homePage', 'whyChooseUs', 'image']),
    'flow-assets/metro/customer-support-consultation.webp': getImageSrc(content, ['aboutUsPage', 'hero', 'image']),
    'flow-assets/metro/about-company-adviser.webp': getImageSrc(content, ['aboutUsPage', 'whoWeAre', 'image']),
    'flow-assets/metro/who-help-phone-support.webp': getImageSrc(content, ['aboutUsPage', 'whoWeHelp', 'cards', 0, 'image']),
    'flow-assets/metro/who-help-food-business.webp': getImageSrc(content, ['aboutUsPage', 'whoWeHelp', 'cards', 1, 'image']),
    'flow-assets/metro/who-help-document-prep.webp': getImageSrc(content, ['aboutUsPage', 'whoWeHelp', 'cards', 2, 'image']),
    'flow-assets/metro/loan-hero-adviser.webp': getImageSrc(content, ['loanPage', 'hero', 'image']),
    'flow-assets/metro/loan-personal-applicant.webp': getImageSrc(content, ['loanPage', 'personalLoan', 'features', 0, 'image']),
    'flow-assets/metro/loan-repayment-advice.webp': getImageSrc(content, ['loanPage', 'personalLoan', 'features', 1, 'image']),
    'flow-assets/metro/loan-business-retail.webp': getImageSrc(content, ['loanPage', 'businessLoan', 'features', 0, 'image']),
    'flow-assets/metro/loan-business-workshop.webp': getImageSrc(content, ['loanPage', 'businessLoan', 'features', 1, 'image']),
    'flow-assets/metro/how-apply-documents.webp': getImageSrc(content, ['howToApplyPage', 'requiredDocuments', 'image']),
    'flow-assets/metro/contact-phone-support.webp': getImageSrc(content, ['contactUsPage', 'contactForm', 'image']),
  };

  let rendered = bodyHtml;
  for (const [legacySrc, payloadSrc] of Object.entries(imageReplacements)) {
    if (payloadSrc) rendered = rendered.replaceAll(legacySrc, payloadSrc);
  }

  const root = parse(rendered, {
    blockTextElements: { script: true, style: true, pre: true, noscript: true },
  });

  if (locale === 'en' && pageId === 'home') {
    const heading = root.querySelector('#home-hero-main-heading');
    if (heading) {
      heading.textContent = heading.text
        .replace(/\s*\.?\s*Testing\s*$/i, '')
        .trim();
    }
  }

  [
    'flow-assets/footer/waves-lines-left-bottom.png',
    'flow-assets/pricing/waves-right-top.png',
  ].forEach((unusedSrc) => {
    root.querySelectorAll(`img[src="${unusedSrc}"]`).forEach((image) => image.remove());
  });

  root.querySelectorAll('img').forEach((image) => {
    const imageSrc = image.getAttribute('src') || '';

    if (imageSrc.startsWith('https://metropinjamanberlesen-payload-cms.easondev.workers.dev/api/media/file/')) {
      const fileName = imageSrc.split('/').pop();
      if (fileName) image.setAttribute('src', `/optimized-media/${fileName}`);
    } else if (imageSrc.includes('media.swipepages.com/2022/7/61d4fa30b6c1290010e13bae/')) {
      image.setAttribute('src', siteConfig.brand.logo);
    }

    if (!image.getAttribute('width')) image.setAttribute('width', '1200');
    if (!image.getAttribute('height')) image.setAttribute('height', '800');
    image.setAttribute('decoding', 'async');

    const id = image.getAttribute('id') || '';
    const isPriorityImage = [
      'site-header-logo',
      'site-header-mobile-drawer-primary-logo',
      'site-header-mobile-drawer-secondary-logo',
      'home-hero-left-top-image',
      'home-hero-right-top-image',
    ].includes(id);

    if (!isPriorityImage) image.setAttribute('loading', 'lazy');
  });

  root.querySelectorAll('button').forEach((button) => {
    const hasAccessibleName = Boolean(
      button.text.trim()
      || button.getAttribute('aria-label')
      || button.getAttribute('aria-labelledby')
      || button.getAttribute('title'),
    );

    if (hasAccessibleName) return;

    const isMenuButton = button.classNames.includes('md:hidden');
    const label = isMenuButton ? 'Open navigation menu' : 'Close navigation menu';
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
  });

  const primaryHeading = root.querySelector('h1');
  const primarySection = primaryHeading?.closest('section');
  if (primarySection) primarySection.setAttribute('role', 'main');

  return root.toString();
}

export async function loadLegacyPage(
  fileName: string,
  pageId: SitePageId,
  locale: SiteLocale = 'en',
): Promise<LegacyPageContent> {
  const html = fs.readFileSync(path.join(legacyPageDir, fileName), 'utf8');
  const fallbackTitle = matchFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const fallbackDescription = matchFirst(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i);
  const bodyClassName = matchFirst(html, /<body[^>]*class=["']([^"']*)["'][^>]*>/i);
  const bodyHtml = matchFirst(html, /<body[^>]*>([\s\S]*?)<\/body>/i);

  if (!bodyHtml) {
    throw new Error(`Could not extract body HTML from ${fileName}`);
  }

  const content = localizePayloadContent(await fetchPayloadContent(), locale);
  const seo = getPageSeo(content, pageId, locale);
  const renderedBody = replaceLeftoverLegacyAssetPaths(
    renderLegacyContent(bodyHtml, pageId, content),
    content,
    locale,
    pageId,
  );

  return {
    title: applyCurrentBrandName(seo.title || fallbackTitle),
    description: applyCurrentBrandName(seo.description || fallbackDescription),
    metaDescription: applyCurrentBrandName(seo.description || fallbackDescription),
    bodyClassName,
    bodyHtml: localizeLegacyNavigation(renderedBody, locale, pageId),
    locale,
    localizedPaths: {
      en: getLocalizedPath('en', pageId),
      bm: getLocalizedPath('bm', pageId),
      cn: getLocalizedPath('cn', pageId),
    },
  };
}
