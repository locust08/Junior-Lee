import LegacyPage, { type LegacyPageProps } from '../../lib/legacyPage';
import { createLocalizedStaticProps, localizedStaticPaths } from '../../lib/localizedPage';

export const getStaticPaths = localizedStaticPaths;
export const getStaticProps = createLocalizedStaticProps('about_us.html', 'aboutUs');

export default function LocalizedAboutUs(props: LegacyPageProps) {
  return <LegacyPage {...props} />;
}
