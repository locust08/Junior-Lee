import LegacyPage, { type LegacyPageProps } from '../lib/legacyPage';
import { loadLegacyPage } from '../lib/legacyPageData';

export async function getStaticProps() {
  return { props: await loadLegacyPage('how_to_apply.html', 'howToApply') };
}

export default function HowToApply(props: LegacyPageProps) {
  return <LegacyPage {...props} />;
}
