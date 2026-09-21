import LegacyPage, { type LegacyPageProps } from '../../lib/legacyPage';
import { createLocalizedStaticProps, localizedStaticPaths } from '../../lib/localizedPage';

export const getStaticPaths = localizedStaticPaths;
export const getStaticProps = createLocalizedStaticProps('loan.html', 'loan');

export default function LocalizedLoan(props: LegacyPageProps) {
  return <LegacyPage {...props} />;
}
