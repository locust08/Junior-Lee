import { memo, useEffect, useRef, useState, type RefObject } from 'react';
import Head from 'next/head';
import { createPortal } from 'react-dom';
import LegacyContactDateTimePicker from '@/src/components/contact/LegacyContactDateTimePicker';
import LegacyContactLoanTypeSelect from '@/src/components/contact/LegacyContactLoanTypeSelect';
import LegacyContactLocationSelect from '@/src/components/contact/LegacyContactLocationSelect';
import LegacyMalaysiaPhoneInput from '@/src/components/contact/LegacyMalaysiaPhoneInput';
import { siteConfig } from '@/config/site';

export type LegacyPageProps = {
  title: string;
  metaDescription: string;
  bodyClassName: string;
  bodyHtml: string;
  locale: 'en' | 'bm' | 'cn';
  localizedPaths: {
    en: string;
    bm: string;
    cn: string;
  };
};

export type LegacyPageContent = {
  title: string;
  description: string;
  metaDescription: string;
  bodyClassName: string;
  bodyHtml: string;
  locale: 'en' | 'bm' | 'cn';
  localizedPaths: {
    en: string;
    bm: string;
    cn: string;
  };
};

declare global {
  interface Window {
    Alpine?: {
      initTree?: (element: Element) => void;
    };
    alfaTrack?: (eventName: string, eventParams?: Record<string, unknown>) => void;
  }
}

type ContactControlHosts = {
  dateTime: Element | null;
  loanType: Element | null;
  location: Element | null;
  phone: Element | null;
};

const LegacyHtml = memo(function LegacyHtml({
  bodyHtml,
  pageRef,
}: {
  bodyHtml: string;
  pageRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      suppressHydrationWarning
      ref={pageRef}
      dangerouslySetInnerHTML={{ __html: bodyHtml }}
    />
  );
});

export default function LegacyPage({
  title,
  metaDescription,
  bodyClassName,
  bodyHtml,
  locale,
  localizedPaths,
}: LegacyPageProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [contactControlHosts, setContactControlHosts] =
    useState<ContactControlHosts>({
      dateTime: null,
      loanType: null,
      location: null,
      phone: null,
    });
  const siteOrigin = siteConfig.url.replace(/\/+$/, '');
  const absoluteUrl = (pagePath: string) => `${siteOrigin}${pagePath}`;
  const canonicalUrl = absoluteUrl(localizedPaths[locale]);
  const socialImageUrl = absoluteUrl(siteConfig.seo.socialImage);
  const whatsappUrl = siteConfig.social.whatsapp;

  useEffect(() => {
    const pageElement = pageRef.current;

    if (pageElement && pageElement.dataset.legacyPageHydrated !== 'true') {
      pageElement.dataset.legacyPageHydrated = 'true';
      const scripts = Array.from(pageElement.querySelectorAll<HTMLScriptElement>('script'));

      scripts.forEach((script) => {
        const replacement = document.createElement('script');

        Array.from(script.attributes).forEach((attribute) => {
          replacement.setAttribute(attribute.name, attribute.value);
        });

        if (!script.src) {
          replacement.text = script.text;
        }

        script.replaceWith(replacement);
      });

    }

    document.querySelectorAll('[data-next-hide-fouc]').forEach((element) => {
      element.remove();
    });

    document.querySelectorAll('.removed').forEach((element) => {
      element.classList.remove('removed');
    });

    const classes = Array.from(document.body.classList);
    document.body.classList.remove(...classes);

    if (bodyClassName) {
      document.body.classList.add(...bodyClassName.split(/\s+/).filter(Boolean));
    }

    setContactControlHosts({
      dateTime: pageElement?.querySelector('#contact-date-time-picker') ?? null,
      loanType: pageElement?.querySelector('#contact-loan-type-select') ?? null,
      location: pageElement?.querySelector('#contact-location-select') ?? null,
      phone: pageElement?.querySelector('#contact-phone-input') ?? null,
    });

    document.documentElement.lang = locale === 'bm' ? 'ms' : locale === 'cn' ? 'zh-Hans' : 'en';

    const counters = Array.from(document.querySelectorAll<HTMLElement>('.js-stat-counter'));
    const animateCounter = (counter: HTMLElement) => {
      if (counter.dataset.animated === 'true') return;

      counter.dataset.animated = 'true';
      const target = Number(counter.dataset.target || '0');
      const suffix = counter.dataset.suffix || '';
      const duration = 1200;
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);

        counter.textContent = `${value.toLocaleString()}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach((counter) => observer.observe(counter));

    return () => {
      observer.disconnect();
      setContactControlHosts({
        dateTime: null,
        loanType: null,
        location: null,
        phone: null,
      });
    };
  }, [bodyClassName, bodyHtml, locale]);

  return (
    <>
      <Head>
        <title>{title}</title>
        {metaDescription ? <meta name="description" content={metaDescription} /> : null}
        {metaDescription ? <meta property="og:description" content={metaDescription} /> : null}
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={siteConfig.name} />
        <meta property="og:locale" content={locale === 'bm' ? 'ms_MY' : locale === 'cn' ? 'zh_MY' : 'en_MY'} />
        <meta property="og:image" content={socialImageUrl} />
        <meta property="og:image:alt" content={siteConfig.seo.socialImageAlt} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        {metaDescription ? <meta name="twitter:description" content={metaDescription} /> : null}
        <meta name="twitter:image" content={socialImageUrl} />
        <meta name="twitter:image:alt" content={siteConfig.seo.socialImageAlt} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en" href={absoluteUrl(localizedPaths.en)} />
        <link rel="alternate" hrefLang="ms" href={absoluteUrl(localizedPaths.bm)} />
        <link rel="alternate" hrefLang="zh-Hans" href={absoluteUrl(localizedPaths.cn)} />
        <link rel="alternate" hrefLang="x-default" href={absoluteUrl(localizedPaths.en)} />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </Head>
      <LegacyHtml bodyHtml={bodyHtml} pageRef={pageRef} />
      {contactControlHosts.dateTime
        ? createPortal(
            <LegacyContactDateTimePicker locale={locale} />,
            contactControlHosts.dateTime
          )
        : null}
      {contactControlHosts.loanType
        ? createPortal(
            <LegacyContactLoanTypeSelect locale={locale} />,
            contactControlHosts.loanType
          )
        : null}
      {contactControlHosts.location
        ? createPortal(
            <LegacyContactLocationSelect locale={locale} />,
            contactControlHosts.location
          )
        : null}
      {contactControlHosts.phone
        ? createPortal(
            <LegacyMalaysiaPhoneInput locale={locale} />,
            contactControlHosts.phone
          )
        : null}
      <a
        className="metro-floating-whatsapp"
        href={whatsappUrl}
        target="_blank"
        rel="noopener"
        aria-label={locale === 'bm' ? 'Sembang di WhatsApp' : locale === 'cn' ? '通过 WhatsApp 聊天' : 'Chat on WhatsApp'}
        title={locale === 'bm' ? `Sembang dengan ${siteConfig.name} di WhatsApp` : locale === 'cn' ? `通过 WhatsApp 联系 ${siteConfig.name}` : `Chat with ${siteConfig.name} on WhatsApp`}
      >
        <span className="metro-floating-whatsapp-label">WhatsApp</span>
        <span className="metro-floating-whatsapp-icon">
          <svg aria-hidden="true" viewBox="0 0 32 32" focusable="false">
            <path d="M16.02 4C9.4 4 4.02 9.22 4.02 15.64c0 2.05.56 4.06 1.63 5.82L4 28l6.78-1.71A12.37 12.37 0 0 0 16.02 27C22.64 27 28 21.78 28 15.36S22.64 4 16.02 4Zm0 20.98c-1.65 0-3.27-.43-4.69-1.24l-.34-.19-4.02 1.01.98-3.81-.22-.36a9.1 9.1 0 0 1-1.45-4.75c0-5.31 4.38-9.62 9.76-9.62 5.37 0 9.74 4.19 9.74 9.34 0 5.3-4.38 9.62-9.76 9.62Zm5.34-7.2c-.29-.14-1.73-.83-2-.92-.27-.1-.47-.14-.67.14-.2.28-.76.91-.94 1.1-.17.19-.35.21-.64.07-.29-.14-1.22-.44-2.32-1.39-.86-.74-1.44-1.66-1.61-1.94-.17-.28-.02-.43.13-.57.13-.13.29-.33.44-.49.15-.16.2-.28.29-.47.1-.19.05-.35-.02-.49-.07-.14-.67-1.57-.92-2.15-.24-.56-.49-.49-.67-.5h-.57c-.2 0-.52.07-.79.35-.27.28-1.04 1-1.04 2.43s1.06 2.82 1.21 3.01c.15.19 2.09 3.1 5.07 4.35.71.3 1.26.48 1.69.61.71.22 1.36.19 1.87.12.57-.08 1.73-.69 1.98-1.35.24-.66.24-1.23.17-1.35-.07-.12-.27-.19-.56-.33Z" />
          </svg>
        </span>
      </a>
    </>
  );
}
