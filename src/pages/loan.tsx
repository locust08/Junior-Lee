import LegacyPage, { type LegacyPageProps } from '../lib/legacyPage';
import { loadLegacyPage } from '../lib/legacyPageData';

export async function getStaticProps() {
  return { props: await loadLegacyPage('loan.html', 'loan') };
}

export default function Loan(props: LegacyPageProps) {
  return <LegacyPage {...props} />;
}
