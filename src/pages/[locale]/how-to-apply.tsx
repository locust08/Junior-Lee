import LegacyPage, { type LegacyPageProps } from '../../lib/legacyPage';
import { createLocalizedStaticProps, localizedStaticPaths } from '../../lib/localizedPage';

export const getStaticPaths = localizedStaticPaths;
export const getStaticProps = createLocalizedStaticProps('how_to_apply.html', 'howToApply');

export default function LocalizedHowToApply(props: LegacyPageProps) {
  return <LegacyPage {...props} />;
}
