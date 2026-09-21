import LegacyPage, { type LegacyPageProps } from '../lib/legacyPage';
import { loadLegacyPage } from '../lib/legacyPageData';

export async function getStaticProps() {
  return { props: await loadLegacyPage('about_us.html', 'aboutUs') };
}

export default function AboutUs(props: LegacyPageProps) {
  return <LegacyPage {...props} />;
}
