import { parse } from 'node-html-parser';
import type { PublicPayloadContent, SitePageId } from '../payload/content';
import { bmTranslations } from '../payload/bmTranslations.ts';
import { cnTranslations } from '../payload/cnTranslations.ts';
import { applySiteName, siteConfig } from '../../config/site.ts';

export type SiteLocale = 'en' | 'bm' | 'cn';

export const siteLocales: SiteLocale[] = ['en', 'bm', 'cn'];

const pageSlugs: Record<SitePageId, string> = {
  home: '',
  aboutUs: 'about-us',
  loan: 'loan',
  howToApply: 'how-to-apply',
  contactUs: 'contact',
};

const legacyHrefPages: Record<string, SitePageId> = {
  'index.html': 'home',
  'about_us.html': 'aboutUs',
  'loan.html': 'loan',
  'how_to_apply.html': 'howToApply',
  'contact.html': 'contactUs',
};

const activeNavigationIds: Partial<Record<SitePageId, string[]>> = {
  aboutUs: [
    'site-header-nav-about-us',
    'site-header-mobile-drawer-primary-nav-about-us',
    'site-header-mobile-drawer-secondary-nav-about-us',
  ],
  loan: [
    'site-header-nav-loan',
    'site-header-mobile-drawer-primary-nav-loan',
    'site-header-mobile-drawer-secondary-nav-loan',
  ],
  howToApply: [
    'site-header-nav-how-to-apply',
    'site-header-mobile-drawer-primary-nav-how-to-apply',
    'site-header-mobile-drawer-secondary-nav-how-to-apply',
  ],
  contactUs: [
    'site-header-nav-contact-us',
    'site-header-mobile-drawer-primary-nav-contact-us',
    'site-header-mobile-drawer-secondary-nav-contact-us',
  ],
};

export function applyCurrentBrandName(value: string): string {
  return applySiteName(value);
}

function applyCurrentContactDetails(value: string): string {
  return value
    .replaceAll('alfa.pinjaman@gmail.com', siteConfig.contact.email)
    .replaceAll('+60 11-7007 3191', siteConfig.contact.phone)
    .replaceAll('017-5392449', siteConfig.contact.phone)
    .replaceAll('016-7115788', siteConfig.contact.phone)
    .replaceAll('60175392449', siteConfig.contact.phoneE164.slice(1))
    .replaceAll('601170073191', siteConfig.contact.phoneE164.slice(1))
    .replaceAll('60167115788', siteConfig.contact.phoneE164.slice(1))
    .replaceAll(
      'Jalan Batu Nilam 1, Bandar Bukit Tinggi 1, 41200 Pelabuhan Klang, Selangor',
      siteConfig.contact.address,
    )
    .replaceAll(
      'Jalan Metro 1, Metro Prima, 52100 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur',
      siteConfig.contact.address,
    );
}

export function getLocalizedPath(locale: SiteLocale, pageId: SitePageId): string {
  const slug = pageSlugs[pageId];
  return slug ? `/${locale}/${slug}` : `/${locale}`;
}

function setRecordPath(root: Record<string, unknown>, path: string, value: string): void {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current: unknown = root;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      if (current && typeof current === 'object') {
        (current as Record<string, unknown>)[key] = value;
      }
      return;
    }

    current = current && typeof current === 'object'
      ? (current as Record<string, unknown>)[key]
      : undefined;
  });
}

export function localizePayloadContent(
  content: PublicPayloadContent,
  locale: SiteLocale,
): PublicPayloadContent {
  if (locale === 'en') return content;

  const localized = structuredClone(content) as unknown as Record<string, unknown>;
  const translations = locale === 'bm' ? bmTranslations : cnTranslations;
  Object.entries(translations).forEach(([path, value]) => setRecordPath(localized, path, value));
  return localized as unknown as PublicPayloadContent;
}

function localizeLegacyHref(href: string, locale: SiteLocale): string {
  if (!href || href.startsWith('#')) return href;

  const match = /^\/?([^?#]+)([?#].*)?$/.exec(href);
  if (!match) return href;

  const pageId = legacyHrefPages[match[1]];
  return pageId ? `${getLocalizedPath(locale, pageId)}${match[2] || ''}` : href;
}

function localizeHardcodedMalay(html: string): string {
  const replacements: Array<[string, string]> = [
    ['>Full Name <span', '>Nama Penuh <span'],
    ['>Email <span', '>E-mel <span'],
    ['>Contact Number <span', '>Nombor Telefon <span'],
    ['(Numbers only)', '(Nombor sahaja)'],
    ['Please enter a valid Malaysian contact number.', 'Sila masukkan nombor telefon Malaysia yang sah.'],
    ['>Full Name *<', '>Nama Penuh *<'],
    ['>Email *<', '>E-mel *<'],
    ['>Contact Number *<', '>Nombor Telefon *<'],
    ['>Loan Type *<', '>Jenis Pinjaman *<'],
    ['>Select loan type<', '>Pilih jenis pinjaman<'],
    ['value="Personal Loan">Personal Loan<', 'value="Personal Loan">Pinjaman Peribadi<'],
    ['value="Business Loan">Business Loan<', 'value="Business Loan">Pinjaman Perniagaan<'],
    ['>Location <', '>Lokasi <'],
    ['>(optional)<', '>(pilihan)<'],
    ['>Select location<', '>Pilih lokasi<'],
    ['>Preferred Date *<', '>Tarikh Pilihan *<'],
    ['>Preferred callback time *<', '>Masa panggilan balik pilihan *<'],
    ['>Select preferred time<', '>Pilih masa pilihan<'],
    ['>Message / Enquiry<', '>Mesej / Pertanyaan<'],
    ["loading ? 'Submitting...' : 'Apply Now'", "loading ? 'Menghantar...' : 'Mohon Sekarang'"],
    ['`${label} - Booked`', '`${label} - Telah ditempah`'],
    ['Please enter your full name.', 'Sila masukkan nama penuh anda.'],
    ['Please enter your email address.', 'Sila masukkan alamat e-mel anda.'],
    ['Please enter a valid email address.', 'Sila masukkan alamat e-mel yang sah.'],
    ['Please enter your contact number.', 'Sila masukkan nombor telefon anda.'],
    ['Please select a loan type.', 'Sila pilih jenis pinjaman.'],
    ['Please select your preferred date and time.', 'Sila pilih tarikh dan masa pilihan anda.'],
    ['This time slot has already been booked. Please choose another time.', 'Slot masa ini telah ditempah. Sila pilih masa lain.'],
    ['This time slot is unavailable. Please choose another time.', 'Slot masa ini tidak tersedia. Sila pilih masa lain.'],
    ['Thank you. Your preferred slot has been submitted.', 'Terima kasih. Slot pilihan anda telah dihantar.'],
    ['Booking service is currently unavailable. Please try again later.', 'Perkhidmatan tempahan tidak tersedia pada masa ini. Sila cuba lagi kemudian.'],
  ];

  return replacements.reduce(
    (localized, [source, target]) => localized.replaceAll(source, target),
    html,
  );
}

function localizeHardcodedChinese(html: string): string {
  const replacements: Array<[string, string]> = [
    ['>Full Name <span', '>姓名 <span'],
    ['>Email <span', '>电子邮箱 <span'],
    ['>Contact Number <span', '>联系电话 <span'],
    ['(Numbers only)', '（仅限数字）'],
    ['Please enter a valid Malaysian contact number.', '请输入有效的马来西亚联系电话。'],
    ['>Full Name *<', '>姓名 *<'],
    ['>Email *<', '>电子邮箱 *<'],
    ['>Contact Number *<', '>联系电话 *<'],
    ['>Loan Type *<', '>贷款类型 *<'],
    ['>Select loan type<', '>请选择贷款类型<'],
    ['value="Personal Loan">Personal Loan<', 'value="Personal Loan">个人贷款<'],
    ['value="Business Loan">Business Loan<', 'value="Business Loan">商业贷款<'],
    ['>Location <', '>地点 <'],
    ['>(optional)<', '>（选填）<'],
    ['>Select location<', '>请选择地点<'],
    ['>Preferred Date *<', '>首选日期 *<'],
    ['>Preferred callback time *<', '>首选回电时间 *<'],
    ['>Select preferred time<', '>请选择时间<'],
    ['>Message / Enquiry<', '>留言 / 咨询<'],
    ["loading ? 'Submitting...' : 'Apply Now'", "loading ? '提交中...' : '立即申请'"],
    ['`${label} - Booked`', '`${label} - 已预约`'],
    ['Please enter your full name.', '请输入您的姓名。'],
    ['Please enter your email address.', '请输入您的电子邮箱。'],
    ['Please enter a valid email address.', '请输入有效的电子邮箱。'],
    ['Please enter your contact number.', '请输入您的联系电话。'],
    ['Please select a loan type.', '请选择贷款类型。'],
    ['Please select your preferred date and time.', '请选择首选日期和时间。'],
    ['This time slot has already been booked. Please choose another time.', '此时间段已被预约，请选择其他时间。'],
    ['This time slot is unavailable. Please choose another time.', '此时间段不可用，请选择其他时间。'],
    ['Thank you. Your preferred slot has been submitted.', '谢谢，您的首选时间已提交。'],
    ['Booking service is currently unavailable. Please try again later.', '预约服务目前不可用，请稍后再试。'],
  ];

  return replacements.reduce(
    (localized, [source, target]) => localized.replaceAll(source, target),
    html,
  );
}

function normalizedElementText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function linkTitleFromHref(href: string): string {
  if (href.startsWith('mailto:')) return `Email ${siteConfig.name}`;
  if (href.startsWith('tel:')) return `Call ${siteConfig.name}`;
  if (href.includes('wa.me') || href.includes('whatsapp.com')) return `Chat with ${siteConfig.name} on WhatsApp`;
  if (href.includes('waze.com')) return `Open ${siteConfig.name} location in Waze`;
  if (href.includes('google.com/maps')) return `Open ${siteConfig.name} location in Google Maps`;
  if (href.startsWith('#')) return 'View this section';
  return 'Open link';
}

function enhanceLegacySeoAttributes(html: string): string {
  const root = parse(html, {
    blockTextElements: { script: true, style: true, pre: true, noscript: true },
  });

  root.querySelectorAll('img').forEach((image) => {
    if (image.getAttribute('alt') === undefined) {
      image.setAttribute('alt', '');
    }

    const alt = normalizedElementText(image.getAttribute('alt') || '');
    if (alt && !image.getAttribute('title')) {
      image.setAttribute('title', alt);
    }
  });

  root.querySelectorAll('a[href]').forEach((anchor) => {
    if (anchor.getAttribute('title')) return;

    const href = anchor.getAttribute('href') || '';
    const ariaLabel = normalizedElementText(anchor.getAttribute('aria-label') || '');
    const visibleText = normalizedElementText(anchor.text);
    const imageAlt = normalizedElementText(
      anchor.querySelector('img')?.getAttribute('alt') || '',
    );
    const title = ariaLabel || visibleText || imageAlt || linkTitleFromHref(href);

    anchor.setAttribute('title', title);
  });

  return root.toString();
}

export function localizeLegacyNavigation(
  html: string,
  locale: SiteLocale,
  pageId: SitePageId,
): string {
  const root = parse(applyCurrentContactDetails(applyCurrentBrandName(html)), {
    blockTextElements: { script: true, style: true, pre: true, noscript: true },
  });

  [
    'site-header-logo',
    'site-header-mobile-drawer-primary-logo',
    'site-header-mobile-drawer-secondary-logo',
    'site-footer-logo',
  ].forEach((id) => {
    const logo = root.querySelector(`#${id}`);
    if (!logo) return;
    const isFooterLogo = id === 'site-footer-logo';

    logo.setAttribute('src', isFooterLogo ? siteConfig.brand.footerLogo : siteConfig.brand.logo);
    logo.setAttribute('alt', siteConfig.name);
    logo.setAttribute('width', String(isFooterLogo ? siteConfig.brand.footerLogoWidth : siteConfig.brand.logoWidth));
    logo.setAttribute('height', String(isFooterLogo ? siteConfig.brand.footerLogoHeight : siteConfig.brand.logoHeight));
    logo.setAttribute(
      'class',
      (logo.getAttribute('class') || '').replace(/\bbrightness-0\b/g, '').replace(/\s+/g, ' ').trim(),
    );
  });

  root.querySelector('#site-contact-waze-link')?.setAttribute('href', siteConfig.contact.wazeUrl);
  root.querySelector('#site-contact-google-maps-link')?.setAttribute('href', siteConfig.contact.googleMapsUrl);

  const footerPhoneLink = root.querySelector('#site-footer-phone-number');
  if (footerPhoneLink) {
    footerPhoneLink.setAttribute('href', siteConfig.contact.phoneHref);
    footerPhoneLink.setAttribute('title', siteConfig.contact.phone);
    footerPhoneLink.removeAttribute('target');
    footerPhoneLink.removeAttribute('rel');
    footerPhoneLink.parentNode?.querySelector('button[data-copy-value]')
      ?.setAttribute('data-copy-value', siteConfig.contact.phone);
  }

  const footerEmailLink = root.querySelector('#site-footer-email-address');
  footerEmailLink?.setAttribute('href', siteConfig.contact.emailHref);

  const contactEmailLink = root.querySelector('#site-contact-support-email')?.closest('a');
  contactEmailLink?.setAttribute('href', siteConfig.contact.emailHref);

  const contactPhoneLink = root.querySelector('#site-contact-phone-number')?.closest('a');
  contactPhoneLink?.setAttribute('href', siteConfig.contact.phoneHref);

  if (locale === 'cn') {
    const homeHeading = root.querySelector('#home-hero-main-heading');
    if (homeHeading) {
      homeHeading.setAttribute(
        'class',
        `${homeHeading.getAttribute('class') || ''} cn-four-character-heading`.trim(),
      );
    }
  }

  const siteHeader = root.querySelector('section > nav');
  if (siteHeader) {
    siteHeader.setAttribute(
      'class',
      `${siteHeader.getAttribute('class') || ''} site-header ${
        locale === 'bm' ? 'bm-site-header' : ''
      }`.trim(),
    );
  }

  root.querySelectorAll('a[href]').forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (href) anchor.setAttribute('href', localizeLegacyHref(href, locale));
  });

  (activeNavigationIds[pageId] || []).forEach((id) => {
    const link = root.querySelector(`#${id}`);
    if (!link) return;

    link.setAttribute('aria-current', 'page');
    link.setAttribute('class', `${link.getAttribute('class') || ''} site-nav-active`.trim());
  });

  root.querySelectorAll('[role="group"][aria-label="Select language"]').forEach((group) => {
    group.removeAttribute('x-data');
    if (group.querySelectorAll('button').length < 3) {
      group.insertAdjacentHTML('beforeend', '<button type="button">CN</button>');
    }
    const buttons = group.querySelectorAll('button');

    siteLocales.forEach((buttonLocale, index) => {
      const button = buttons[index];
      if (!button) return;

      const isActive = locale === buttonLocale;
      button.setAttribute('aria-pressed', String(isActive));
      button.setAttribute('onclick', `window.location.href='${getLocalizedPath(buttonLocale, pageId)}'`);
      button.removeAttribute(':class');
      button.removeAttribute(':aria-pressed');
      button.removeAttribute('x-on:click');
      button.setAttribute(
        'class',
        `rounded-md px-3 py-1.5 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-lime-500 ${
          isActive ? 'bg-teal-900 text-white shadow-sm' : 'text-gray-600 hover:text-teal-900'
        }`,
      );
    });
  });

  const localizedHtml = root.toString();
  const translatedHtml = locale === 'bm'
    ? localizeHardcodedMalay(localizedHtml)
    : locale === 'cn'
      ? localizeHardcodedChinese(localizedHtml)
      : localizedHtml;

  return enhanceLegacySeoAttributes(translatedHtml);
}
