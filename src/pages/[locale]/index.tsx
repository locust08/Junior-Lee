import LegacyPage, { type LegacyPageProps } from '../../lib/legacyPage';
import { createLocalizedStaticProps, localizedStaticPaths } from '../../lib/localizedPage';

export const getStaticPaths = localizedStaticPaths;
export const getStaticProps = createLocalizedStaticProps('index.html', 'home');

export default function LocalizedHome(props: LegacyPageProps) {
  return <LegacyPage {...props} />;
}
