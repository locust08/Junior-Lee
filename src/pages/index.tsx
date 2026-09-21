import LegacyPage, { type LegacyPageProps } from '../lib/legacyPage';
import { loadLegacyPage } from '../lib/legacyPageData';

export async function getStaticProps() {
  return { props: await loadLegacyPage('index.html', 'home') };
}

export default function Index(props: LegacyPageProps) {
  return <LegacyPage {...props} />;
}
