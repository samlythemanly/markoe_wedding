import { Route } from '../../../navigation';

import styles from './accommodations_page.module.scss';

export function AccommodationsPage(): JSX.Element {
  return <div className={styles.container}>Accommodations</div>;
}

export const accommodationsRoute = new Route(
  'Accommodations',
  AccommodationsPage,
);
