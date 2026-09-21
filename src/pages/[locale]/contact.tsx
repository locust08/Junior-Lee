import LegacyPage, { type LegacyPageProps } from '../../lib/legacyPage';
import { createLocalizedStaticProps, localizedStaticPaths } from '../../lib/localizedPage';

export const getStaticPaths = localizedStaticPaths;
export const getStaticProps = createLocalizedStaticProps('contact.html', 'contactUs');

export default function LocalizedContact(props: LegacyPageProps) {
  return <LegacyPage {...props} />;
}
