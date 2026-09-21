import LegacyPage, { type LegacyPageProps } from '../lib/legacyPage';
import { loadLegacyPage } from '../lib/legacyPageData';

export async function getStaticProps() {
  return { props: await loadLegacyPage('contact.html', 'contactUs') };
}

export default function Contact(props: LegacyPageProps) {
  return <LegacyPage {...props} />;
}
