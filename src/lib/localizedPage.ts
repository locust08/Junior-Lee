import type { GetStaticPaths, GetStaticProps } from 'next';
import type { SitePageId } from '../payload/content';
import { loadLegacyPage } from './legacyPageData';
import { siteLocales, type SiteLocale } from './locale';

export const localizedStaticPaths: GetStaticPaths = async () => ({
  paths: siteLocales.map((locale) => ({ params: { locale } })),
  fallback: false,
});

export function createLocalizedStaticProps(
  fileName: string,
  pageId: SitePageId,
): GetStaticProps {
  return async ({ params }) => {
    const locale = params?.locale;

    if (!siteLocales.includes(locale as SiteLocale)) {
      return { notFound: true };
    }

    return {
      props: await loadLegacyPage(fileName, pageId, locale as SiteLocale),
    };
  };
}
